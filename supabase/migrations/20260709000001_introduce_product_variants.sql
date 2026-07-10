-- ═══════════════════════════════════════════════════════════════════
-- MIGRATION: Introduce parent product + variant model
--
-- Safety contract: This migration is ENTIRELY additive/rename-based.
-- No existing data is deleted. No existing FK constraint is dropped.
-- Postgres tracks FK constraints by table OID (not name), so all five
-- FKs pointing at the old `products` table keep working after rename:
--   product_images.product_id  → product_variants.id  ✓
--   enquiries.product_id       → product_variants.id  ✓
--   order_items.product_id     → product_variants.id  ✓  (renamed below)
--   bulk_enquiry_items.product_id → product_variants.id ✓
--   product_reviews.product_id → product_variants.id  ✓
-- ═══════════════════════════════════════════════════════════════════

-- ─── STEP 1: Rename existing products table ───────────────────────
-- All 84 rows, all UUIDs, all indexes, all RLS policies and all five
-- FK constraints survive this rename unchanged.
ALTER TABLE products RENAME TO product_variants;

-- Rename the indexes so they don't cause confusion in pg_catalog
ALTER INDEX IF EXISTS idx_products_category       RENAME TO idx_product_variants_category;
ALTER INDEX IF EXISTS idx_products_product_line   RENAME TO idx_product_variants_product_line;
ALTER INDEX IF EXISTS idx_products_is_active      RENAME TO idx_product_variants_is_active;

-- ─── STEP 2: Create the new parent products table ─────────────────
CREATE TABLE products (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text        NOT NULL,
  description  text,
  category     text        NOT NULL,
  product_line text        NOT NULL CHECK (product_line IN ('kitchen', 'wardrobe', 'hardware')),
  series       text,
  base_material text,
  is_featured  boolean     NOT NULL DEFAULT false,
  is_active    boolean     NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_category     ON products(category);
CREATE INDEX idx_products_product_line ON products(product_line);
CREATE INDEX idx_products_is_active    ON products(is_active);
CREATE INDEX idx_products_is_featured  ON products(is_featured);

-- ─── STEP 3: Add parent linkage columns to product_variants ───────
-- Both nullable initially so the backfill in migration 2 can run
-- without violating constraints. A NOT NULL constraint (or a DB-level
-- check that product_id IS NOT NULL) can be added in a follow-up
-- migration once all rows are confirmed backfilled.
ALTER TABLE product_variants
  ADD COLUMN product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  ADD COLUMN is_default boolean NOT NULL DEFAULT true;

CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_is_default ON product_variants(is_default);

-- ─── STEP 4: Rename order_items.product_id → variant_id ──────────
-- Column rename only — no data touched, no FK dropped, no rows moved.
ALTER TABLE order_items RENAME COLUMN product_id TO variant_id;

-- ─── STEP 5: Update the create_order_with_items RPC ──────────────
-- The previous version referenced order_items.product_id in its INSERT
-- and read `product_id` from the JSONB payload. Update both to use
-- variant_id to match the renamed column and the updated checkout API.
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
  p_items              jsonb,   -- [{item_code, product_name, quantity, price_at_purchase, variant_id}]
  p_promo_code_id      uuid    DEFAULT NULL,
  p_discount_applied   numeric DEFAULT 0
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
  v_item     jsonb;
BEGIN
  INSERT INTO orders (
    customer_id, customer_name, customer_email, customer_phone,
    shipping_address, shipping_city, shipping_pincode,
    subtotal, total, status, razorpay_order_id,
    promo_code_id, discount_applied
  ) VALUES (
    p_customer_id, p_customer_name, p_customer_email, p_customer_phone,
    p_shipping_address, p_shipping_city, p_shipping_pincode,
    p_subtotal, p_total, 'pending', p_razorpay_order_id,
    p_promo_code_id, p_discount_applied
  )
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO order_items (
      order_id, variant_id, product_name, item_code, quantity, price_at_purchase
    ) VALUES (
      v_order_id,
      (v_item->>'variant_id')::uuid,
      v_item->>'product_name',
      v_item->>'item_code',
      (v_item->>'quantity')::integer,
      (v_item->>'price_at_purchase')::numeric
    );
  END LOOP;

  RETURN v_order_id;
END;
$$;

-- ─── STEP 6: RLS for the new products parent table ────────────────
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active products"
  ON products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Service role can do anything on products"
  ON products FOR ALL
  USING (auth.role() = 'service_role');

-- Note: product_variants inherits the OLD products RLS policies
-- (renamed automatically with the table). They still correctly restrict
-- public reads to is_active = true rows and give service_role full access.
