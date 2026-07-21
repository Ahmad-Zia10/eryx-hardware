-- Wishlist / saved items. Login-gated: every saved item is anchored to a
-- customer_id (no anonymous wishlists in v1 — see plan). Saved at the variant
-- level, consistent with cart, reviews, and notify-me (the thing a shopper
-- saves is a specific purchasable SKU, not the parent concept).
--
-- CASCADE on both FKs is intentional: a wishlist row carries no audit value
-- (unlike orders), so removing the user or the variant should clear the save.

CREATE TABLE wishlist_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  variant_id  uuid REFERENCES product_variants(id) ON DELETE CASCADE NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  -- One heart per variant per user. Makes repeat "save" clicks idempotent.
  UNIQUE (customer_id, variant_id)
);

-- Hot path: the account/wishlist page lists a user's saves newest-first.
CREATE INDEX idx_wishlist_items_customer_created
  ON wishlist_items(customer_id, created_at DESC);

ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- A customer can read, add, and remove only their own saved items.
CREATE POLICY "Users can read their own wishlist"
  ON wishlist_items FOR SELECT
  TO authenticated
  USING (auth.uid() = customer_id);

CREATE POLICY "Users can add to their own wishlist"
  ON wishlist_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can remove from their own wishlist"
  ON wishlist_items FOR DELETE
  TO authenticated
  USING (auth.uid() = customer_id);

CREATE POLICY "Service role full access on wishlist_items"
  ON wishlist_items FOR ALL
  USING (auth.role() = 'service_role');

NOTIFY pgrst, 'reload schema';
