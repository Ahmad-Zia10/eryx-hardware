-- ═══════════════════════════════════════════════════════════════════
-- Returns & Refunds pipeline — Phase 1: schema foundation
-- ═══════════════════════════════════════════════════════════════════
-- Purely additive. Nothing here changes existing behaviour:
--   * A new `returns` table with its own status lifecycle. The
--     `orders.status` set and its CHECK constraint are NOT touched —
--     returns live entirely on returns.status, isolating this feature
--     from checkout, the payment webhook, inventory, and the expiry sweep.
--   * A new nullable `orders.delivered_at` column, stamped later by
--     updateOrderStatus (Phase 2). Existing SELECTs just gain a null field.
--   * A new RPC `apply_return_stock_restore` mirroring release_order_stock
--     (locks the row, verifies transition, increments stock + logs a
--     stock_movements row with reason='return', flips status) — the ONLY
--     sanctioned path for restoring stock on a return.
--
-- Plan: .claude/projects/returns-refund-pipeline-plan.md
-- Patterns mirrored: release_order_stock + reviews-lifecycle touch trigger.
-- stock_movements.reason CHECK already includes 'return' — no change needed.

-- ─── returns table ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS returns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  -- Reserved for future per-item returns; full-order v1 leaves it null.
  order_item_id uuid REFERENCES order_items(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reason text NOT NULL CHECK (reason IN (
    'defective', 'wrong_item', 'not_as_described', 'changed_mind', 'other'
  )),
  reason_detail text,
  attachment_urls text[],
  status text NOT NULL DEFAULT 'requested' CHECK (status IN (
    'requested', 'approved', 'rejected',
    'pickup_scheduled', 'returned', 'refunded'
  )),
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  refund_amount numeric CHECK (refund_amount IS NULL OR refund_amount >= 0),
  refund_method text CHECK (refund_method IN ('original_payment', 'store_credit')),
  razorpay_refund_id text,
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_note text,
  reviewed_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Admin queue ordering + status filters.
CREATE INDEX IF NOT EXISTS returns_status_created_idx
  ON returns (status, created_at DESC);
-- Fast lookup of a customer's returns for the account page.
CREATE INDEX IF NOT EXISTS returns_customer_idx
  ON returns (customer_id, created_at DESC);
-- Reconcile refund webhooks back to a return by Razorpay refund id.
CREATE INDEX IF NOT EXISTS returns_razorpay_refund_idx
  ON returns (razorpay_refund_id);

-- ─── updated_at touch trigger (mirrors reviews-lifecycle) ──────────
CREATE OR REPLACE FUNCTION touch_returns_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_touch_returns_updated_at ON returns;
CREATE TRIGGER trg_touch_returns_updated_at
  BEFORE UPDATE ON returns
  FOR EACH ROW
  EXECUTE FUNCTION touch_returns_updated_at();

-- ─── RLS ───────────────────────────────────────────────────────────
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages returns" ON returns;
CREATE POLICY "Service role manages returns"
  ON returns FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users can read own returns" ON returns;
CREATE POLICY "Users can read own returns"
  ON returns FOR SELECT USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Users can request returns" ON returns;
CREATE POLICY "Users can request returns"
  ON returns FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = customer_id);

-- ─── orders.delivered_at (additive, nullable) ──────────────────────
-- Stamped by updateOrderStatus when an order transitions to 'delivered'
-- (Phase 2). Gates the customer-facing 7-day return window.
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz;

-- ─── apply_return_stock_restore RPC ────────────────────────────────
-- Mirrors release_order_stock: the ONLY sanctioned way to restore stock
-- for a return. Idempotent — only acts when the return is in an
-- appropriate prior status, so a re-run is a no-op. Never write
-- product_variants.stock_quantity outside an RPC (inventory.md rule).
--
-- Transitions the return to 'returned', restores stock for the order's
-- lines, and logs a stock_movements row (reason='return',
-- reference_id=<return_id>) per tracked line. Full-order v1: restores the
-- whole order's quantities. (Per-item v2 would restore by order_item_id.)
CREATE OR REPLACE FUNCTION apply_return_stock_restore(
  p_return_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_return   record;
  v_item     record;
BEGIN
  SELECT id, order_id, status
    INTO v_return
    FROM returns
   WHERE id = p_return_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'return not found: %', p_return_id;
  END IF;

  -- Idempotent guard: only restore from the approved/pickup stage. If the
  -- return is already 'returned' or 'refunded' (or was rejected), do nothing.
  IF v_return.status NOT IN ('approved', 'pickup_scheduled') THEN
    RETURN;
  END IF;

  -- Restore each tracked line of the order. Full-order return in v1.
  FOR v_item IN
    SELECT variant_id, quantity FROM order_items WHERE order_id = v_return.order_id
  LOOP
    UPDATE product_variants
       SET stock_quantity = stock_quantity + v_item.quantity
     WHERE id = v_item.variant_id
       AND track_inventory = true;

    INSERT INTO stock_movements (variant_id, quantity_change, reason, reference_id)
      SELECT v_item.variant_id, v_item.quantity, 'return', p_return_id
      WHERE EXISTS (
        SELECT 1 FROM product_variants
        WHERE id = v_item.variant_id AND track_inventory = true
      );
  END LOOP;

  UPDATE returns SET status = 'returned' WHERE id = p_return_id;
END;
$$;
