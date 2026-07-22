-- Re-categorize the wardrobe line (previously all lumped under the generic
-- "Wardrobe" category) into real categories derived from the actual products,
-- and rename the generic hardware "Hardware" category to "Skirting".
--
-- Category lives on BOTH product_variants and products (denormalised — see
-- catalog-and-variants.md), so we update both. Variants are matched by
-- item_code; parents are updated by joining through their variants.
--
-- Idempotent: re-running sets the same values. Safe to re-apply.

-- ─── Wardrobe: variant-level updates by item_code ──────────────────
UPDATE product_variants SET category = 'Hanging', updated_at = now()
  WHERE item_code IN ('PCHRG', 'PCHRM', 'PWHRB');

UPDATE product_variants SET category = 'Trouser Rack', updated_at = now()
  WHERE item_code IN ('PDTRG', 'PDTRM', 'PSTRG', 'PSTRM', 'PTRM-600', 'PTRM-900');

UPDATE product_variants SET category = 'Shelves', updated_at = now()
  WHERE item_code IN ('PDSG-600', 'PDSM-600');

UPDATE product_variants SET category = 'Baskets', updated_at = now()
  WHERE item_code IN ('PRBG-600', 'PRBSCM-450');

UPDATE product_variants SET category = 'Mirror', updated_at = now()
  WHERE item_code IN ('PRM-1200');

UPDATE product_variants SET category = 'Shoe Rack', updated_at = now()
  WHERE item_code IN ('PSRM-600');

UPDATE product_variants SET category = 'Tie Rack', updated_at = now()
  WHERE item_code IN ('PTRG');

-- ─── Hardware: rename generic "Hardware" → "Skirting" ──────────────
UPDATE product_variants SET category = 'Skirting', updated_at = now()
  WHERE product_line = 'hardware' AND category = 'Hardware'
    AND item_code IN ('PSB-100', 'PSFCB-100');

-- ─── Parent products: mirror the variant category ──────────────────
-- Each parent takes its (default) variant's category. Using the default
-- variant avoids ambiguity when a parent has multiple variants (they all
-- share a category here anyway).
UPDATE products p
SET category = pv.category, updated_at = now()
FROM product_variants pv
WHERE pv.product_id = p.id
  AND pv.is_default = true
  AND p.product_line IN ('wardrobe', 'hardware')
  AND p.category IS DISTINCT FROM pv.category;

-- Reload PostgREST schema cache (no structural change, but harmless).
NOTIFY pgrst, 'reload schema';
