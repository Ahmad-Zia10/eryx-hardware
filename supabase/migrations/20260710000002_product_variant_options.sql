-- Add a structured option-axis model for product variants. This keeps
-- variant selection queryable even when a product has more than one axis
-- (for example Finish x Configuration).

CREATE TABLE IF NOT EXISTS product_variant_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (length(trim(name)) > 0),
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, name)
);

CREATE INDEX IF NOT EXISTS idx_product_variant_options_product_id
  ON product_variant_options(product_id);

CREATE TABLE IF NOT EXISTS product_variant_option_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  option_id uuid NOT NULL REFERENCES product_variant_options(id) ON DELETE CASCADE,
  variant_id uuid NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  value text NOT NULL CHECK (length(trim(value)) > 0),
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (option_id, variant_id)
);

CREATE INDEX IF NOT EXISTS idx_product_variant_option_values_option_id
  ON product_variant_option_values(option_id);

CREATE INDEX IF NOT EXISTS idx_product_variant_option_values_variant_id
  ON product_variant_option_values(variant_id);

ALTER TABLE product_variant_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variant_option_values ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active variant options" ON product_variant_options;
CREATE POLICY "Public can view active variant options"
  ON product_variant_options FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM products p
      WHERE p.id = product_variant_options.product_id
        AND p.is_active = true
    )
  );

DROP POLICY IF EXISTS "Service role manages variant options" ON product_variant_options;
CREATE POLICY "Service role manages variant options"
  ON product_variant_options FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Public can view active variant option values" ON product_variant_option_values;
CREATE POLICY "Public can view active variant option values"
  ON product_variant_option_values FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM product_variant_options pvo
      JOIN products p ON p.id = pvo.product_id
      JOIN product_variants pv ON pv.id = product_variant_option_values.variant_id
      WHERE pvo.id = product_variant_option_values.option_id
        AND p.is_active = true
        AND pv.is_active = true
    )
  );

DROP POLICY IF EXISTS "Service role manages variant option values" ON product_variant_option_values;
CREATE POLICY "Service role manages variant option values"
  ON product_variant_option_values FOR ALL
  USING (auth.role() = 'service_role');

-- Generic axes from existing normalized-ish columns.
INSERT INTO product_variant_options (product_id, name, display_order)
SELECT DISTINCT product_id, 'Finish', 10
FROM product_variants
WHERE product_id IS NOT NULL
  AND nullif(trim(finish), '') IS NOT NULL
ON CONFLICT (product_id, name) DO UPDATE SET display_order = EXCLUDED.display_order;

INSERT INTO product_variant_options (product_id, name, display_order)
SELECT DISTINCT product_id, 'Dimensions', 20
FROM product_variants
WHERE product_id IS NOT NULL
  AND nullif(trim(dimension_notes), '') IS NOT NULL
  AND lower(trim(dimension_notes)) <> 'contact for specifications'
ON CONFLICT (product_id, name) DO UPDATE SET display_order = EXCLUDED.display_order;

WITH values_to_insert AS (
  SELECT
    pvo.id AS option_id,
    pv.id AS variant_id,
    trim(pv.finish) AS value,
    dense_rank() OVER (PARTITION BY pvo.id ORDER BY trim(pv.finish)) AS display_order
  FROM product_variants pv
  JOIN product_variant_options pvo
    ON pvo.product_id = pv.product_id
   AND pvo.name = 'Finish'
  WHERE nullif(trim(pv.finish), '') IS NOT NULL
)
INSERT INTO product_variant_option_values (option_id, variant_id, value, display_order)
SELECT option_id, variant_id, value, display_order
FROM values_to_insert
ON CONFLICT (option_id, variant_id) DO UPDATE SET
  value = EXCLUDED.value,
  display_order = EXCLUDED.display_order;

WITH values_to_insert AS (
  SELECT
    pvo.id AS option_id,
    pv.id AS variant_id,
    trim(pv.dimension_notes) AS value,
    dense_rank() OVER (PARTITION BY pvo.id ORDER BY trim(pv.dimension_notes)) AS display_order
  FROM product_variants pv
  JOIN product_variant_options pvo
    ON pvo.product_id = pv.product_id
   AND pvo.name = 'Dimensions'
  WHERE nullif(trim(pv.dimension_notes), '') IS NOT NULL
    AND lower(trim(pv.dimension_notes)) <> 'contact for specifications'
)
INSERT INTO product_variant_option_values (option_id, variant_id, value, display_order)
SELECT option_id, variant_id, value, display_order
FROM values_to_insert
ON CONFLICT (option_id, variant_id) DO UPDATE SET
  value = EXCLUDED.value,
  display_order = EXCLUDED.display_order;

-- Trouser Rack has a second axis hidden in the item code/name because the
-- source dimension value is not specific enough.
WITH trouser_parent AS (
  SELECT id FROM products WHERE name = 'Trouser Rack' ORDER BY created_at LIMIT 1
), inserted_option AS (
  INSERT INTO product_variant_options (product_id, name, display_order)
  SELECT id, 'Configuration', 20
  FROM trouser_parent
  ON CONFLICT (product_id, name) DO UPDATE SET display_order = EXCLUDED.display_order
  RETURNING id
), option_row AS (
  SELECT id FROM inserted_option
  UNION ALL
  SELECT pvo.id
  FROM product_variant_options pvo
  JOIN trouser_parent tp ON tp.id = pvo.product_id
  WHERE pvo.name = 'Configuration'
  LIMIT 1
), values_to_insert AS (
  SELECT
    option_row.id AS option_id,
    pv.id AS variant_id,
    CASE
      WHEN pv.item_code LIKE 'PS%' THEN 'Single'
      WHEN pv.item_code LIKE 'PD%' THEN 'Double'
      ELSE pv.name
    END AS value,
    CASE
      WHEN pv.item_code LIKE 'PS%' THEN 10
      WHEN pv.item_code LIKE 'PD%' THEN 20
      ELSE 99
    END AS display_order
  FROM product_variants pv
  CROSS JOIN option_row
  JOIN trouser_parent tp ON tp.id = pv.product_id
)
INSERT INTO product_variant_option_values (option_id, variant_id, value, display_order)
SELECT option_id, variant_id, value, display_order
FROM values_to_insert
ON CONFLICT (option_id, variant_id) DO UPDATE SET
  value = EXCLUDED.value,
  display_order = EXCLUDED.display_order;

