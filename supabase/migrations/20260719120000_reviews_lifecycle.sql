-- Reviews lifecycle: give customers a full write/edit/delete experience from
-- their account page, mirroring standard e-commerce review flows.
--
-- Adds:
--   * title           — optional short review headline (industry standard)
--   * updated_at      — so an edited review can be distinguished from a fresh one
--   * touch trigger   — keeps updated_at honest on any UPDATE
--   * UPDATE / DELETE RLS — customers manage their own reviews; admins (service
--     role) retain full control. SELECT of approved reviews is unchanged.
--
-- No FK changes: product_reviews.product_id already references product_variants.id
-- (legacy column name — see catalog-and-variants.md).

-- ─── New columns ───────────────────────────────────────────────────
ALTER TABLE product_reviews
  ADD COLUMN IF NOT EXISTS title text;

ALTER TABLE product_reviews
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Optional length guard on the headline. Kept permissive; the API enforces
-- the tighter product rules (min body length when text is present, etc.).
ALTER TABLE product_reviews DROP CONSTRAINT IF EXISTS product_reviews_title_len;
ALTER TABLE product_reviews
  ADD CONSTRAINT product_reviews_title_len
  CHECK (title IS NULL OR char_length(title) <= 120);

-- ─── updated_at touch trigger ──────────────────────────────────────
CREATE OR REPLACE FUNCTION touch_product_reviews_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_product_reviews_touch ON product_reviews;
CREATE TRIGGER trg_product_reviews_touch
  BEFORE UPDATE ON product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION touch_product_reviews_updated_at();

-- ─── RLS: customers manage their own reviews ───────────────────────
-- SELECT policies from earlier migrations (approved-only for public,
-- all for service role) are untouched. We add the missing self-service
-- UPDATE and DELETE. INSERT already exists (authenticated, own row).

DROP POLICY IF EXISTS "Users can update their own review" ON product_reviews;
CREATE POLICY "Users can update their own review"
  ON product_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = customer_id)
  WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Users can delete their own review" ON product_reviews;
CREATE POLICY "Users can delete their own review"
  ON product_reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = customer_id);

-- Let a customer read back their OWN reviews regardless of approval status,
-- so the account page can show pending/rejected ones. Public still only sees
-- approved (that policy is additive and remains in force).
DROP POLICY IF EXISTS "Users can read their own reviews" ON product_reviews;
CREATE POLICY "Users can read their own reviews"
  ON product_reviews FOR SELECT
  TO authenticated
  USING (auth.uid() = customer_id);

NOTIFY pgrst, 'reload schema';
