-- Enforces (softly) the invariant "every parent has exactly one active
-- default variant." The public listing filters on
-- product_variants.is_active = true AND is_default = true; any parent
-- without a matching variant disappears from the site even when its
-- own is_active flag is true. Historically this state has been
-- possible because addProductVariant / removeProductVariant don't
-- enforce it. We now guardrail those code paths (see actions.ts) and
-- add the following DB-level safety net.

-- ─── STEP 1: one-time cleanup for existing orphans ───────────────────
-- For every parent with no is_default variant, promote its first
-- active variant (by catalogue_sno, then created_at) to default.
-- Parents with zero active variants stay defaultless — that's a
-- separate data issue that this migration doesn't try to solve.
WITH orphans AS (
  SELECT p.id AS parent_id
  FROM products p
  WHERE NOT EXISTS (
    SELECT 1 FROM product_variants v
    WHERE v.product_id = p.id AND v.is_default = true
  )
),
picks AS (
  SELECT DISTINCT ON (v.product_id) v.id
  FROM product_variants v
  JOIN orphans o ON o.parent_id = v.product_id
  WHERE v.is_active = true
  ORDER BY v.product_id, v.catalogue_sno NULLS LAST, v.created_at
)
UPDATE product_variants
   SET is_default = true
 WHERE id IN (SELECT id FROM picks);

-- ─── STEP 2: diagnostic helper ───────────────────────────────────────
-- Admin dashboards / operators can call this to catch violations. Two
-- rows come back per bad parent (or one, whichever failure mode):
--   - "no default variant"  → parent has zero is_default variants
--   - "N default variants (expected 1)" → parent has 2+ defaults
CREATE OR REPLACE FUNCTION check_product_default_variant_invariant()
RETURNS TABLE (parent_id uuid, parent_name text, issue text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.name, 'no default variant'::text
  FROM products p
  WHERE NOT EXISTS (
    SELECT 1 FROM product_variants v
    WHERE v.product_id = p.id AND v.is_default = true
  )
  UNION ALL
  SELECT p.id, p.name, format('%s default variants (expected 1)', COUNT(*))::text
  FROM products p
  JOIN product_variants v ON v.product_id = p.id
  WHERE v.is_default = true
  GROUP BY p.id, p.name
  HAVING COUNT(*) > 1;
$$;
