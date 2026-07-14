-- Notify-me / back-in-stock subscriptions. When a customer visits an
-- out-of-stock variant they can subscribe with their email; a future
-- send-out worker flips status to 'notified' once the stock returns.
--
-- Accepts anonymous subscribers by design — email is the anchor, not
-- customer_id. Repeat clicks are idempotent via UNIQUE(variant_id, email).

CREATE TABLE stock_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id uuid REFERENCES product_variants(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  customer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'notified', 'cancelled'
  )),
  notified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (variant_id, email)
);

-- Hot path for the future back-in-stock send-out worker: it will scan
-- 'pending' rows for variants whose stock has returned.
CREATE INDEX idx_stock_notifications_variant_status
  ON stock_notifications(variant_id, status)
  WHERE status = 'pending';

ALTER TABLE stock_notifications ENABLE ROW LEVEL SECURITY;

-- Anonymous shoppers can subscribe. The /api/notify-me route validates
-- the payload and inserts via supabaseAdmin; this policy is for the
-- rare case where a client bypasses the route.
CREATE POLICY "Public can subscribe"
  ON stock_notifications FOR INSERT
  WITH CHECK (true);

-- No public SELECT — subscribers don't need to read back their own row,
-- and we don't want a leak of who-is-waiting-for-what to the anon key.
CREATE POLICY "Service role full access on stock_notifications"
  ON stock_notifications FOR ALL
  USING (auth.role() = 'service_role');
