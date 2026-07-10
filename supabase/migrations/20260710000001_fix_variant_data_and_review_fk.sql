-- Fix missing product_variant rows created as empty parent products by the
-- initial parent/variant migration. Priority-0 assumptions for this migration:
-- PUMCG remains standalone; plain wicker baskets remain separate from
-- soft-close wicker basket families.

-- Ensure product_reviews can embed profiles through customer_id in PostgREST.
-- NOT VALID avoids failing the deployment if older review rows predate a
-- matching profile row; new/updated rows are still checked by the FK.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'product_reviews_profile_fkey'
  ) THEN
    ALTER TABLE product_reviews
      ADD CONSTRAINT product_reviews_profile_fkey
      FOREIGN KEY (customer_id) REFERENCES profiles(id)
      NOT VALID;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';

-- Group B: Trouser Rack (Mocha/Grey x Single/Double)
WITH parent AS (
  SELECT id FROM products WHERE name = 'Trouser Rack' ORDER BY created_at LIMIT 1
), rows AS (
  SELECT *
  FROM (VALUES
    ('PSTRM', 'Single Trouser Rack Mocha', 'Keep trousers crease-free and instantly visible with smooth pull-out rails.', 'Wardrobe', 'wardrobe', 1890::numeric, 'Contact for specifications', 'Mocha', true),
    ('PDTRM', 'Double Trouser Rack Mocha', 'Keep trousers crease-free and instantly visible with smooth double pull-out rails.', 'Wardrobe', 'wardrobe', NULL::numeric, 'Contact for specifications', 'Mocha', false),
    ('PSTRG', 'Single Trouser Rack Grey', 'Keep trousers crease-free and instantly visible with smooth pull-out rails in a grey finish.', 'Wardrobe', 'wardrobe', NULL::numeric, 'Contact for specifications', 'Grey', false),
    ('PDTRG', 'Double Trouser Rack Grey', 'Keep trousers crease-free and instantly visible with smooth double pull-out rails in a grey finish.', 'Wardrobe', 'wardrobe', NULL::numeric, 'Contact for specifications', 'Grey', false)
  ) AS v(item_code, name, description, category, product_line, mrp, dimension_notes, finish, is_default)
), inserted AS (
  INSERT INTO product_variants (
    product_id, item_code, name, description, category, product_line,
    mrp, dimension_notes, finish, is_active, is_default
  )
  SELECT parent.id, rows.item_code, rows.name, rows.description, rows.category, rows.product_line,
         rows.mrp, rows.dimension_notes, rows.finish, true, rows.is_default
  FROM rows CROSS JOIN parent
  ON CONFLICT (item_code) DO UPDATE SET
    product_id = EXCLUDED.product_id,
    is_default = EXCLUDED.is_default,
    updated_at = now()
  RETURNING id
)
UPDATE product_variants SET is_default = false
WHERE product_id = (SELECT id FROM parent)
  AND item_code NOT IN ('PSTRM');

-- Group C: Cloth Hanging Rack. Merge PCHRG into the shared parent and insert PCHRM.
WITH parent AS (
  SELECT id FROM products WHERE name = 'Cloth Hanging Rack' ORDER BY created_at LIMIT 1
), rows AS (
  SELECT *
  FROM (VALUES
    ('PCHRM', 'Cloth Hanging Rack Mocha', 'A compact pull-out rod in mocha that adds an extra convenient hanging point.', 'Wardrobe', 'wardrobe', 3400::numeric, '115x455x115mm', 'Mocha', true),
    ('PCHRG', 'Cloth Hanging Rack Grey', 'A compact pull-out rod in sleek grey that adds an extra convenient hanging point.', 'Wardrobe', 'wardrobe', 3400::numeric, '115x455x115mm', 'Grey', false)
  ) AS v(item_code, name, description, category, product_line, mrp, dimension_notes, finish, is_default)
)
INSERT INTO product_variants (
  product_id, item_code, name, description, category, product_line,
  mrp, dimension_notes, finish, is_active, is_default
)
SELECT parent.id, rows.item_code, rows.name, rows.description, rows.category, rows.product_line,
       rows.mrp, rows.dimension_notes, rows.finish, true, rows.is_default
FROM rows CROSS JOIN parent
ON CONFLICT (item_code) DO UPDATE SET
  product_id = EXCLUDED.product_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  product_line = EXCLUDED.product_line,
  mrp = EXCLUDED.mrp,
  dimension_notes = EXCLUDED.dimension_notes,
  finish = EXCLUDED.finish,
  is_default = EXCLUDED.is_default,
  updated_at = now();

-- Remove now-empty standalone Cloth Hanging Rack parents left by the catch-all.
DELETE FROM products p
WHERE p.name IN ('Cloth Hanging Rack Grey', 'Cloth Hanging Rack Mocha')
  AND NOT EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id);

-- Group D: Slim Box 500mm
WITH parent AS (
  SELECT id FROM products WHERE name = 'Slim Box 500mm' ORDER BY created_at LIMIT 1
), rows AS (
  SELECT *
  FROM (VALUES
    ('PSBDG4-500', 'Slim Box Dark Grey 4 inch 500mm', 'SGS-certified sleek slim drawer system rated for a solid 40kg with a dust-proof buffer design.', 'Slim Box', 'kitchen', NULL::numeric, '500mm, 4 inch', 'Dark Grey', true),
    ('PSBDG6-500', 'Slim Box Dark Grey 6 inch 500mm', 'SGS-certified sleek slim drawer system rated for a solid 40kg with a dust-proof buffer design.', 'Slim Box', 'kitchen', NULL::numeric, '500mm, 6 inch', 'Dark Grey', false),
    ('PSBDG8-500', 'Slim Box Dark Grey 8 inch 500mm', 'SGS-certified sleek slim drawer system rated for a solid 40kg with a dust-proof buffer design.', 'Slim Box', 'kitchen', NULL::numeric, '500mm, 8 inch', 'Dark Grey', false),
    ('PSBDG10-500', 'Slim Box Dark Grey 10 inch 500mm', 'SGS-certified sleek slim drawer system rated for a solid 40kg with a dust-proof buffer design.', 'Slim Box', 'kitchen', NULL::numeric, '500mm, 10 inch', 'Dark Grey', false)
  ) AS v(item_code, name, description, category, product_line, mrp, dimension_notes, finish, is_default)
)
INSERT INTO product_variants (
  product_id, item_code, name, description, category, product_line,
  mrp, dimension_notes, finish, is_active, is_default
)
SELECT parent.id, rows.item_code, rows.name, rows.description, rows.category, rows.product_line,
       rows.mrp, rows.dimension_notes, rows.finish, true, rows.is_default
FROM rows CROSS JOIN parent
ON CONFLICT (item_code) DO UPDATE SET
  product_id = EXCLUDED.product_id,
  is_default = EXCLUDED.is_default,
  updated_at = now();

-- Group E: Telescopic Channel Soft Close
WITH parent AS (
  SELECT id FROM products WHERE name = 'Telescopic Channel Zinc Soft Close' ORDER BY created_at LIMIT 1
), rows AS (
  SELECT *
  FROM (VALUES
    ('PTC35-16', 'Telescopic Channel Soft Close 16 inch', 'Smooth ball-bearing glide with a gentle soft-close finish.', 'Channels', 'hardware', NULL::numeric, '16 inch, 35kg capacity', 'Zinc', true),
    ('PTC35-18', 'Telescopic Channel Soft Close 18 inch', 'Smooth ball-bearing glide with a gentle soft-close finish.', 'Channels', 'hardware', NULL::numeric, '18 inch, 35kg capacity', 'Zinc', false),
    ('PTC35-20', 'Telescopic Channel Soft Close 20 inch', 'Smooth ball-bearing glide with a gentle soft-close finish.', 'Channels', 'hardware', NULL::numeric, '20 inch, 35kg capacity', 'Zinc', false)
  ) AS v(item_code, name, description, category, product_line, mrp, dimension_notes, finish, is_default)
)
INSERT INTO product_variants (
  product_id, item_code, name, description, category, product_line,
  mrp, dimension_notes, finish, is_active, is_default
)
SELECT parent.id, rows.item_code, rows.name, rows.description, rows.category, rows.product_line,
       rows.mrp, rows.dimension_notes, rows.finish, true, rows.is_default
FROM rows CROSS JOIN parent
ON CONFLICT (item_code) DO UPDATE SET
  product_id = EXCLUDED.product_id,
  is_default = EXCLUDED.is_default,
  updated_at = now();

-- Group F: Trouser Rack Mocha Leather
WITH parent AS (
  SELECT id FROM products WHERE name = 'Trouser Rack Mocha Leather' ORDER BY created_at LIMIT 1
), rows AS (
  SELECT *
  FROM (VALUES
    ('PTRM-900', 'Trouser Rack Mocha Leather 900mm', 'Keep trousers crease-free with this mocha leather-finish pull-out rack.', 'Wardrobe', 'wardrobe', NULL::numeric, '900mm', 'Mocha Leather', true),
    ('PTRM-600', 'Trouser Rack Mocha Leather 600mm', 'Keep trousers crease-free with this mocha leather-finish pull-out rack.', 'Wardrobe', 'wardrobe', NULL::numeric, '600mm', 'Mocha Leather', false)
  ) AS v(item_code, name, description, category, product_line, mrp, dimension_notes, finish, is_default)
)
INSERT INTO product_variants (
  product_id, item_code, name, description, category, product_line,
  mrp, dimension_notes, finish, is_active, is_default
)
SELECT parent.id, rows.item_code, rows.name, rows.description, rows.category, rows.product_line,
       rows.mrp, rows.dimension_notes, rows.finish, true, rows.is_default
FROM rows CROSS JOIN parent
ON CONFLICT (item_code) DO UPDATE SET
  product_id = EXCLUDED.product_id,
  is_default = EXCLUDED.is_default,
  updated_at = now();

-- Verification: these counts intentionally catch the silent zero-row update
-- failure mode from the original variant seed migration.
DO $$
DECLARE
  v_failures text;
BEGIN
  WITH expected(product_name, expected_count) AS (
    VALUES
      ('Trouser Rack', 4),
      ('Cloth Hanging Rack', 2),
      ('Slim Box 500mm', 4),
      ('Telescopic Channel Zinc Soft Close', 3),
      ('Trouser Rack Mocha Leather', 2)
  ), actual AS (
    SELECT p.name AS product_name, COUNT(pv.id)::int AS actual_count
    FROM expected e
    JOIN products p ON p.name = e.product_name
    LEFT JOIN product_variants pv ON pv.product_id = p.id
    GROUP BY p.name
  )
  SELECT string_agg(e.product_name || ' expected ' || e.expected_count || ', got ' || COALESCE(a.actual_count, 0), '; ')
  INTO v_failures
  FROM expected e
  LEFT JOIN actual a ON a.product_name = e.product_name
  WHERE COALESCE(a.actual_count, 0) <> e.expected_count;

  IF v_failures IS NOT NULL THEN
    RAISE EXCEPTION 'Variant seed verification failed: %', v_failures;
  END IF;
END $$;
