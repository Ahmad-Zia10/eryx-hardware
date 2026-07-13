-- Two additive columns on promo_codes for the checkout "Available codes"
-- list. is_public gates whether the code shows up in the list at all;
-- description is a one-liner shown next to the code so customers can see
-- what it's for. Private codes still work when typed into the input.

ALTER TABLE promo_codes
  ADD COLUMN is_public boolean NOT NULL DEFAULT false,
  ADD COLUMN description text;

-- Partial index on the exact hot path (is_public = true AND is_active = true).
-- The table is small today, but this keeps the checkout GET cheap as it grows.
CREATE INDEX IF NOT EXISTS idx_promo_codes_public_active
  ON promo_codes(expires_at)
  WHERE is_public = true AND is_active = true;
