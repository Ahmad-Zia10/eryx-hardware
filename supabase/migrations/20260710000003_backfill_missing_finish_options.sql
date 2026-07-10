-- Defensive backfill for Finish option axes. This is intentionally generic:
-- if any active variant group has finish values but no structured Finish
-- option rows yet, create them and attach each variant's value.

INSERT INTO product_variant_options (product_id, name, display_order)
SELECT DISTINCT pv.product_id, 'Finish', 10
FROM product_variants pv
WHERE pv.product_id IS NOT NULL
  AND nullif(trim(pv.finish), '') IS NOT NULL
ON CONFLICT (product_id, name) DO UPDATE SET
  display_order = EXCLUDED.display_order;

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

DO $$
DECLARE
  v_finish_rows integer;
BEGIN
  SELECT count(pvov.id)::int
  INTO v_finish_rows
  FROM products p
  JOIN product_variant_options pvo
    ON pvo.product_id = p.id
   AND pvo.name = 'Finish'
  LEFT JOIN product_variant_option_values pvov
    ON pvov.option_id = pvo.id
  WHERE p.name = 'Cloth Hanging Rack';

  IF v_finish_rows <> 2 THEN
    RAISE EXCEPTION 'Cloth Hanging Rack Finish option verification failed: expected 2, got %', v_finish_rows;
  END IF;
END $$;

