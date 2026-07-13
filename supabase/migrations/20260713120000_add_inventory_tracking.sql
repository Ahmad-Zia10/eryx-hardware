-- Inventory tracking: stock_quantity + track_inventory on variants,
-- payment_method + 'expired' status on orders, stock_movements audit log,
-- atomic stock reservation inside create_order_with_items, and grace-period
-- release + manual adjust RPCs.

-- ─── STEP 1: product_variants stock columns ──────────────────────────
ALTER TABLE product_variants
  ADD COLUMN stock_quantity integer NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  ADD COLUMN track_inventory boolean NOT NULL DEFAULT true;

-- ─── STEP 2: orders.payment_method + expanded status set ─────────────
ALTER TABLE orders
  ADD COLUMN payment_method text NOT NULL DEFAULT 'online'
    CHECK (payment_method IN ('online', 'cod'));

-- Existing constraint from 20260624110444 allows only
-- pending | paid | failed | cancelled | shipped | delivered.
-- Expand to the full state machine documented in orders-and-payments.md
-- so admin transitions and the cron expiry sweep have valid targets.
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders
  ADD CONSTRAINT orders_status_check CHECK (status IN (
    'pending', 'confirmed', 'paid', 'failed',
    'processing', 'cancelled', 'shipped', 'delivered', 'expired'
  ));

-- Speeds up the cron sweep that scans for expired pending orders.
CREATE INDEX IF NOT EXISTS idx_orders_status_pm_created
  ON orders(status, payment_method, created_at);

-- ─── STEP 3: stock_movements audit table ─────────────────────────────
CREATE TABLE stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id uuid REFERENCES product_variants(id) ON DELETE CASCADE NOT NULL,
  quantity_change integer NOT NULL,
  reason text NOT NULL CHECK (reason IN (
    'sale', 'cancellation', 'expiry', 'failed', 'return', 'manual_adjustment', 'restock'
  )),
  reference_id uuid,
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_stock_movements_variant_created
  ON stock_movements(variant_id, created_at DESC);

ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- All writers use supabaseAdmin (service role). No public read access.
CREATE POLICY "Service role full access on stock_movements"
  ON stock_movements FOR ALL
  USING (auth.role() = 'service_role');

-- ─── STEP 4: Replace create_order_with_items with stock-aware RPC ────
DROP FUNCTION IF EXISTS create_order_with_items(uuid,text,text,text,text,text,text,numeric,numeric,text,jsonb,uuid,numeric);

CREATE OR REPLACE FUNCTION create_order_with_items(
  p_customer_id        uuid,
  p_customer_name      text,
  p_customer_email     text,
  p_customer_phone     text,
  p_shipping_address   text,
  p_shipping_city      text,
  p_shipping_pincode   text,
  p_subtotal           numeric,
  p_total              numeric,
  p_razorpay_order_id  text,
  p_items              jsonb,
  p_promo_code_id      uuid    DEFAULT NULL,
  p_discount_applied   numeric DEFAULT 0,
  p_payment_method     text    DEFAULT 'online'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id     uuid;
  v_item         jsonb;
  v_variant_id   uuid;
  v_qty          integer;
  v_variant      product_variants%ROWTYPE;
  v_out_of_stock jsonb := '[]'::jsonb;
BEGIN
  -- Lock every referenced variant row up front so two concurrent
  -- checkouts for the last unit serialise. SELECT ... FOR UPDATE inside
  -- a plpgsql function participates in the same implicit transaction as
  -- the caller, so the whole block is atomic.
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_variant_id := (v_item->>'variant_id')::uuid;
    v_qty        := (v_item->>'quantity')::integer;

    SELECT * INTO v_variant
      FROM product_variants
      WHERE id = v_variant_id
      FOR UPDATE;

    IF NOT FOUND THEN
      -- Should never happen — the API route already resolved variants.
      -- Treat as out of stock so the client sees a coherent error.
      v_out_of_stock := v_out_of_stock || jsonb_build_object(
        'variant_id', v_variant_id,
        'item_code',  v_item->>'item_code',
        'requested',  v_qty,
        'available',  0
      );
      CONTINUE;
    END IF;

    IF v_variant.track_inventory AND v_variant.stock_quantity < v_qty THEN
      v_out_of_stock := v_out_of_stock || jsonb_build_object(
        'variant_id', v_variant_id,
        'item_code',  v_variant.item_code,
        'requested',  v_qty,
        'available',  v_variant.stock_quantity
      );
    END IF;
  END LOOP;

  IF jsonb_array_length(v_out_of_stock) > 0 THEN
    RETURN jsonb_build_object('out_of_stock', v_out_of_stock);
  END IF;

  -- Decrement stock for tracked variants only.
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_variant_id := (v_item->>'variant_id')::uuid;
    v_qty        := (v_item->>'quantity')::integer;

    UPDATE product_variants
       SET stock_quantity = stock_quantity - v_qty
     WHERE id = v_variant_id
       AND track_inventory = true;
  END LOOP;

  -- Insert order.
  INSERT INTO orders (
    customer_id, customer_name, customer_email, customer_phone,
    shipping_address, shipping_city, shipping_pincode,
    subtotal, total, status, razorpay_order_id,
    promo_code_id, discount_applied, payment_method
  ) VALUES (
    p_customer_id, p_customer_name, p_customer_email, p_customer_phone,
    p_shipping_address, p_shipping_city, p_shipping_pincode,
    p_subtotal, p_total, 'pending', p_razorpay_order_id,
    p_promo_code_id, p_discount_applied, p_payment_method
  )
  RETURNING id INTO v_order_id;

  -- Insert line items + one stock_movements row per tracked line.
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_variant_id := (v_item->>'variant_id')::uuid;
    v_qty        := (v_item->>'quantity')::integer;

    INSERT INTO order_items (
      order_id, variant_id, product_name, item_code, quantity, price_at_purchase
    ) VALUES (
      v_order_id,
      v_variant_id,
      v_item->>'product_name',
      v_item->>'item_code',
      v_qty,
      (v_item->>'price_at_purchase')::numeric
    );

    -- Only log movements for variants actually tracked (matches the
    -- decrement filter above).
    INSERT INTO stock_movements (variant_id, quantity_change, reason, reference_id)
      SELECT v_variant_id, -v_qty, 'sale', v_order_id
      WHERE EXISTS (
        SELECT 1 FROM product_variants
        WHERE id = v_variant_id AND track_inventory = true
      );
  END LOOP;

  RETURN jsonb_build_object('order_id', v_order_id);
END;
$$;

-- ─── STEP 5: release_order_stock (shared helper) ─────────────────────
-- Used by:
--   * checkout API when Razorpay order creation fails after the atomic
--     reservation succeeded (reason 'failed')
--   * release_expired_orders() cron sweep (reason 'expiry')
--   * future admin cancel path (reason 'cancellation')
-- Idempotent: only acts on orders whose current status is 'pending'
-- (the state that still has stock reserved). Repeat calls become no-ops.
CREATE OR REPLACE FUNCTION release_order_stock(
  p_order_id uuid,
  p_reason   text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item          record;
  v_current_stat  text;
  v_new_status    text;
BEGIN
  IF p_reason NOT IN ('failed', 'expiry', 'cancellation') THEN
    RAISE EXCEPTION 'invalid release reason: %', p_reason;
  END IF;

  SELECT status INTO v_current_stat
    FROM orders
   WHERE id = p_order_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'order not found: %', p_order_id;
  END IF;

  IF v_current_stat <> 'pending' THEN
    RETURN;
  END IF;

  FOR v_item IN
    SELECT variant_id, quantity FROM order_items WHERE order_id = p_order_id
  LOOP
    UPDATE product_variants
       SET stock_quantity = stock_quantity + v_item.quantity
     WHERE id = v_item.variant_id
       AND track_inventory = true;

    INSERT INTO stock_movements (variant_id, quantity_change, reason, reference_id)
      SELECT v_item.variant_id, v_item.quantity, p_reason, p_order_id
      WHERE EXISTS (
        SELECT 1 FROM product_variants
        WHERE id = v_item.variant_id AND track_inventory = true
      );
  END LOOP;

  v_new_status := CASE p_reason
    WHEN 'expiry'       THEN 'expired'
    WHEN 'failed'       THEN 'failed'
    WHEN 'cancellation' THEN 'cancelled'
  END;

  UPDATE orders SET status = v_new_status WHERE id = p_order_id;
END;
$$;

-- ─── STEP 6: release_expired_orders (grace-period sweep) ─────────────
CREATE OR REPLACE FUNCTION release_expired_orders()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order   record;
  v_count   integer := 0;
BEGIN
  FOR v_order IN
    SELECT id
      FROM orders
     WHERE status = 'pending'
       AND (
         (payment_method = 'online' AND created_at < now() - interval '30 minutes')
         OR
         (payment_method = 'cod'    AND created_at < now() - interval '48 hours')
       )
     FOR UPDATE SKIP LOCKED
  LOOP
    PERFORM release_order_stock(v_order.id, 'expiry');
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

-- ─── STEP 7: adjust_stock (admin manual adjustment) ──────────────────
CREATE OR REPLACE FUNCTION adjust_stock(
  p_variant_id uuid,
  p_delta      integer,
  p_reason     text,
  p_admin_id   uuid
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_qty integer;
BEGIN
  IF p_delta = 0 THEN
    RAISE EXCEPTION 'delta must be non-zero';
  END IF;

  IF p_reason NOT IN ('restock', 'manual_adjustment') THEN
    RAISE EXCEPTION 'invalid reason for admin adjustment: %', p_reason;
  END IF;

  UPDATE product_variants
     SET stock_quantity = stock_quantity + p_delta
   WHERE id = p_variant_id
   RETURNING stock_quantity INTO v_new_qty;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'variant not found: %', p_variant_id;
  END IF;

  -- CHECK (stock_quantity >= 0) on the column will already have aborted
  -- above if this would go negative; the RAISE below is defence-in-depth.
  IF v_new_qty < 0 THEN
    RAISE EXCEPTION 'stock cannot go negative';
  END IF;

  INSERT INTO stock_movements (variant_id, quantity_change, reason, admin_id)
    VALUES (p_variant_id, p_delta, p_reason, p_admin_id);

  RETURN v_new_qty;
END;
$$;
