-- ═══════════════════════════════════════════════════════════════════
-- MIGRATION: Seed parent products and backfill product_variants.product_id
--
-- Structure:
--   1. Named variant groups A–N  → one parent per group, multiple variants linked
--   2. New Book1 items not in live DB → insert fresh parent + variant rows
--   3. Catch-all DO $$ loop → every remaining unlinked variant_id gets its
--      own 1:1 parent row (handles all standalones + any extras we missed)
-- ═══════════════════════════════════════════════════════════════════

-- ─── GROUP A: Universal Magic Corner (Chrome + Dark Grey) ─────────
WITH g AS (
  INSERT INTO products (name, description, category, product_line, is_active, is_featured)
  VALUES (
    'Universal Magic Corner',
    'Transform an awkward blind corner into fully accessible storage — smooth, double-tier trays pull out at a touch.',
    'S Corner', 'kitchen', true, false
  ) RETURNING id
)
UPDATE product_variants pv
SET product_id = g.id,
    is_default = (pv.item_code = 'PUMCC')
FROM g
WHERE pv.item_code IN ('PUMCC', 'PUMCDG');

-- ─── GROUP B: Trouser Rack (Mocha + Grey × Single + Double) ───────
WITH g AS (
  INSERT INTO products (name, description, category, product_line, is_active, is_featured)
  VALUES (
    'Trouser Rack',
    'Keep trousers crease-free and instantly visible with smooth pull-out rails.',
    'Wardrobe', 'wardrobe', true, false
  ) RETURNING id
)
UPDATE product_variants pv
SET product_id = g.id,
    is_default = (pv.item_code = 'PSTRM')
FROM g
WHERE pv.item_code IN ('PSTRM', 'PDTRM', 'PSTRG', 'PDTRG');

-- ─── GROUP C: Cloth Hanging Rack (Mocha + Grey) ───────────────────
WITH g AS (
  INSERT INTO products (name, description, category, product_line, is_active, is_featured)
  VALUES (
    'Cloth Hanging Rack',
    'A compact pull-out rod that adds an extra, convenient hanging point exactly where your wardrobe needs it.',
    'Wardrobe', 'wardrobe', true, false
  ) RETURNING id
)
UPDATE product_variants pv
SET product_id = g.id,
    is_default = (pv.item_code = 'PCHRM')
FROM g
WHERE pv.item_code IN ('PCHRM', 'PCHRG');

-- ─── GROUP D: Slim Box 500mm (4"/6"/8"/10") ───────────────────────
WITH g AS (
  INSERT INTO products (name, description, category, product_line, is_active, is_featured)
  VALUES (
    'Slim Box 500mm',
    'SGS-certified for 80,000 cycles — a sleek slim drawer system rated for a solid 40kg with a dust-proof buffer design.',
    'Slim Box', 'kitchen', true, false
  ) RETURNING id
)
UPDATE product_variants pv
SET product_id = g.id,
    is_default = (pv.item_code = 'PSBDG4-500')
FROM g
WHERE pv.item_code IN ('PSBDG4-500', 'PSBDG6-500', 'PSBDG8-500', 'PSBDG10-500');

-- ─── GROUP E: Telescopic Channel Soft Close (16"/18"/20") ─────────
WITH g AS (
  INSERT INTO products (name, description, category, product_line, is_active, is_featured)
  VALUES (
    'Telescopic Channel Zinc Soft Close',
    'Smooth ball-bearing glide with a gentle soft-close finish — no more slammed drawers.',
    'Channels', 'hardware', true, false
  ) RETURNING id
)
UPDATE product_variants pv
SET product_id = g.id,
    is_default = (pv.item_code = 'PTC35-16')
FROM g
WHERE pv.item_code IN ('PTC35-16', 'PTC35-18', 'PTC35-20');

-- ─── GROUP F: Trouser Rack Mocha Leather (900mm + 600mm) ──────────
WITH g AS (
  INSERT INTO products (name, description, category, product_line, is_active, is_featured)
  VALUES (
    'Trouser Rack Mocha Leather',
    'Keep trousers crease-free with this mocha leather-finish pull-out rack.',
    'Wardrobe', 'wardrobe', true, false
  ) RETURNING id
)
UPDATE product_variants pv
SET product_id = g.id,
    is_default = (pv.item_code = 'PTRM-900')
FROM g
WHERE pv.item_code IN ('PTRM-900', 'PTRM-600');

-- ─── GROUP G: Dish Rack (600–1000mm) ─────────────────────────────
WITH g AS (
  INSERT INTO products (name, description, category, product_line, is_active, is_featured)
  VALUES (
    'Dish Rack',
    'Dry your dishes right where you store them — an in-cabinet rack that keeps plates and cups neatly stacked and drip-free.',
    'Basket', 'kitchen', true, false
  ) RETURNING id
)
UPDATE product_variants pv
SET product_id = g.id,
    is_default = (pv.item_code = 'PDR-900')
FROM g
WHERE pv.item_code IN ('PDR-600', 'PDR-700', 'PDR-800', 'PDR-900', 'PDR-1000');

-- ─── GROUP H: PVC Cutlery Tray (450–900mm) ────────────────────────
WITH g AS (
  INSERT INTO products (name, description, category, product_line, is_active, is_featured)
  VALUES (
    'PVC Cutlery Tray',
    'Molded compartments keep every utensil in its place — simple, durable cutlery organization.',
    'Basket', 'kitchen', true, false
  ) RETURNING id
)
UPDATE product_variants pv
SET product_id = g.id,
    is_default = (pv.item_code = 'PPCT-450')
FROM g
WHERE pv.item_code IN ('PPCT-450', 'PPCT-500', 'PPCT-600', 'PPCT-700', 'PPCT-800', 'PPCT-900');

-- ─── GROUP I: Wicker Basket Soft Close 450mm (4"/6"/8") ───────────
WITH g AS (
  INSERT INTO products (name, description, category, product_line, is_active, is_featured)
  VALUES (
    'Wicker Basket Soft Close 450mm',
    'A soft-close woven basket that combines rustic charm with smooth, quiet, effortless operation.',
    'Basket', 'kitchen', true, false
  ) RETURNING id
)
UPDATE product_variants pv
SET product_id = g.id,
    is_default = (pv.item_code = 'PWBSC4-450')
FROM g
WHERE pv.item_code IN ('PWBSC4-450', 'PWBSC6-450', 'PWBSC8-450');

-- ─── GROUP J: Wicker Basket Soft Close 600mm (4"/6"/8") ───────────
WITH g AS (
  INSERT INTO products (name, description, category, product_line, is_active, is_featured)
  VALUES (
    'Wicker Basket Soft Close 600mm',
    'A soft-close woven basket that combines rustic charm with smooth, quiet, effortless operation.',
    'Basket', 'kitchen', true, false
  ) RETURNING id
)
UPDATE product_variants pv
SET product_id = g.id,
    is_default = (pv.item_code = 'PWBSC4-600')
FROM g
WHERE pv.item_code IN ('PWBSC4-600', 'PWBSC6-600', 'PWBSC8-600');

-- ─── GROUP K: Glass Rolling Shutter 600mm (Black/White/Frosted) ───
WITH g AS (
  INSERT INTO products (name, description, category, product_line, is_active, is_featured)
  VALUES (
    'Glass Rolling Shutter 600mm',
    'A sleek tambour shutter that rolls away silently, hiding countertop appliances behind a clean, modern facade.',
    'Basket', 'kitchen', true, false
  ) RETURNING id
)
UPDATE product_variants pv
SET product_id = g.id,
    is_default = (pv.item_code = 'PGRSB-600')
FROM g
WHERE pv.item_code IN ('PGRSB-600', 'PGRSW-600', 'PGRSF-600');

-- ─── GROUP L: Metal Divider (600mm + 900mm) ───────────────────────
WITH g AS (
  INSERT INTO products (name, description, category, product_line, is_active, is_featured)
  VALUES (
    'Metal Divider',
    'Sturdy metal dividers keep drawers organized and everything in its place.',
    'Basket', 'kitchen', true, false
  ) RETURNING id
)
UPDATE product_variants pv
SET product_id = g.id,
    is_default = (pv.item_code = 'PMD-600')
FROM g
WHERE pv.item_code IN ('PMD-600', 'PMD-900');

-- ─── GROUP M: Pull Down Glass (600mm + 900mm) ─────────────────────
WITH g AS (
  INSERT INTO products (name, description, category, product_line, is_active, is_featured)
  VALUES (
    'Pull Down Glass',
    'A premium pull-down system for compact, accessible kitchen storage.',
    'Glass Pull Down', 'kitchen', true, false
  ) RETURNING id
)
UPDATE product_variants pv
SET product_id = g.id,
    is_default = (pv.item_code = 'PPDG-600')
FROM g
WHERE pv.item_code IN ('PPDG-600', 'PPDG-900');

-- ─── GROUP N: Wooden Cutlery Adjustable (450mm + 600mm) ───────────
WITH g AS (
  INSERT INTO products (name, description, category, product_line, is_active, is_featured)
  VALUES (
    'Wooden Cutlery Adjustable',
    'A cutlery tray that grows with your drawer — expands to fit cabinets from 450mm to 600mm.',
    'Basket', 'kitchen', true, false
  ) RETURNING id
)
UPDATE product_variants pv
SET product_id = g.id,
    is_default = (pv.item_code = 'PWCA-450')
FROM g
WHERE pv.item_code IN ('PWCA-450', 'PWCA-600');

-- ─── NEW BOOK1 ITEMS (not in live DB) ─────────────────────────────
-- Insert both parent and variant for items that exist in Book1 but
-- are absent from the live DB. Item codes with blanks get placeholders.

-- Leather Basket 600mm (Book1 row 4, mapped to PWB-600)
WITH g AS (
  INSERT INTO products (name, description, category, product_line, is_active)
  VALUES ('Leather Basket 600mm', 'Soft woven pull-out storage in a rich leather-look finish.', 'Basket', 'kitchen', true)
  RETURNING *
), v AS (
  INSERT INTO product_variants (item_code, name, description, category, product_line, mrp, dimension_notes, is_active, is_default)
  SELECT 'PWB-600', name, description, category, product_line, 5200, '564x540x100/150/200mm', is_active, true
  FROM g
  ON CONFLICT (item_code) DO UPDATE SET is_default = EXCLUDED.is_default
  RETURNING id, name
)
UPDATE product_variants pv SET product_id = g.id FROM g, v WHERE pv.id = v.id;

-- Decoration Shelf Grey 600mm (Book1 row 8)
WITH g AS (
  INSERT INTO products (name, description, category, product_line, is_active)
  VALUES ('Decoration Shelf Grey 600mm', 'Turn wardrobe clutter into a curated display — a pull-out shelf that shows off your favourite pieces in style.', 'Wardrobe', 'wardrobe', true)
  RETURNING *
), v AS (
  INSERT INTO product_variants (item_code, name, description, category, product_line, mrp, dimension_notes, is_active, is_default)
  SELECT 'PDSG-600', name, description, category, product_line, 10720, '564x460x71mm', is_active, true
  FROM g
  ON CONFLICT (item_code) DO UPDATE SET is_default = EXCLUDED.is_default
  RETURNING id
)
UPDATE product_variants pv SET product_id = g.id FROM g, v WHERE pv.id = v.id;

-- Rattan Basket Grey 600mm (Book1 row 9)
WITH g AS (
  INSERT INTO products (name, description, category, product_line, is_active)
  VALUES ('Rattan Basket Grey 600mm', 'Breathable, beautifully woven pull-out storage that keeps folded clothes and accessories organized and within reach.', 'Wardrobe', 'wardrobe', true)
  RETURNING *
), v AS (
  INSERT INTO product_variants (item_code, name, description, category, product_line, mrp, dimension_notes, is_active, is_default)
  SELECT 'PRBG-600', name, description, category, product_line, 9475, '564x460x185mm', is_active, true
  FROM g
  ON CONFLICT (item_code) DO UPDATE SET is_default = EXCLUDED.is_default
  RETURNING id
)
UPDATE product_variants pv SET product_id = g.id FROM g, v WHERE pv.id = v.id;

-- ABS Cup Fitment (Book1 row 16)
WITH g AS (
  INSERT INTO products (name, description, category, product_line, is_active)
  VALUES ('ABS Cup Fitment', 'Stack cups neatly and reclaim drawer space with this durable, easy-clean ABS organizer insert.', 'Basket', 'kitchen', true)
  RETURNING *
), v AS (
  INSERT INTO product_variants (item_code, name, description, category, product_line, mrp, dimension_notes, is_active, is_default)
  SELECT 'PACF', name, description, category, product_line, 790, '470mm', is_active, true
  FROM g
  ON CONFLICT (item_code) DO UPDATE SET is_default = EXCLUDED.is_default
  RETURNING id
)
UPDATE product_variants pv SET product_id = g.id FROM g, v WHERE pv.id = v.id;

-- ABS Plate Fitment (Book1 row 17)
WITH g AS (
  INSERT INTO products (name, description, category, product_line, is_active)
  VALUES ('ABS Plate Fitment', 'Store plates upright and scratch-free with this sturdy, space-saving ABS drawer insert.', 'Basket', 'kitchen', true)
  RETURNING *
), v AS (
  INSERT INTO product_variants (item_code, name, description, category, product_line, mrp, dimension_notes, is_active, is_default)
  SELECT 'PAPF', name, description, category, product_line, 860, '470mm', is_active, true
  FROM g
  ON CONFLICT (item_code) DO UPDATE SET is_default = EXCLUDED.is_default
  RETURNING id
)
UPDATE product_variants pv SET product_id = g.id FROM g, v WHERE pv.id = v.id;

-- Dish Plate Holder (Book1 row 18)
WITH g AS (
  INSERT INTO products (name, description, category, product_line, is_active)
  VALUES ('Dish Plate Holder', 'An adjustable holder that keeps plates standing upright and organized — no more toppling stacks.', 'Basket', 'kitchen', true)
  RETURNING *
), v AS (
  INSERT INTO product_variants (item_code, name, description, category, product_line, mrp, dimension_notes, is_active, is_default)
  SELECT 'PDPH', name, description, category, product_line, 1875, '(180-320)x170mm', is_active, true
  FROM g
  ON CONFLICT (item_code) DO UPDATE SET is_default = EXCLUDED.is_default
  RETURNING id
)
UPDATE product_variants pv SET product_id = g.id FROM g, v WHERE pv.id = v.id;

-- Premium Plate Rack (Book1 row 19)
WITH g AS (
  INSERT INTO products (name, description, category, product_line, is_active)
  VALUES ('Premium Plate Rack', 'A premium wire rack that keeps your plate collection upright, tidy, and dent-free.', 'Basket', 'kitchen', true)
  RETURNING *
), v AS (
  INSERT INTO product_variants (item_code, name, description, category, product_line, mrp, dimension_notes, is_active, is_default)
  SELECT 'PPPR', name, description, category, product_line, 1400, '470mm', is_active, true
  FROM g
  ON CONFLICT (item_code) DO UPDATE SET is_default = EXCLUDED.is_default
  RETURNING id
)
UPDATE product_variants pv SET product_id = g.id FROM g, v WHERE pv.id = v.id;

-- Rubber Coated Wire Cup Fitment (Book1 row 20)
WITH g AS (
  INSERT INTO products (name, description, category, product_line, is_active)
  VALUES ('Rubber Coated Wire Cup Fitment', 'Rubber-coated wire keeps cups secure and rattle-free while protecting them from chips and scratches.', 'Basket', 'kitchen', true)
  RETURNING *
), v AS (
  INSERT INTO product_variants (item_code, name, description, category, product_line, mrp, dimension_notes, is_active, is_default)
  SELECT 'PRCWCF', name, description, category, product_line, 820, '470mm', is_active, true
  FROM g
  ON CONFLICT (item_code) DO UPDATE SET is_default = EXCLUDED.is_default
  RETURNING id
)
UPDATE product_variants pv SET product_id = g.id FROM g, v WHERE pv.id = v.id;

-- Rubber Coated Wire Plate Fitment (Book1 row 21)
WITH g AS (
  INSERT INTO products (name, description, category, product_line, is_active)
  VALUES ('Rubber Coated Wire Plate Fitment', 'Rubber-coated wire keeps plates secure and rattle-free while protecting them from chips and scratches.', 'Basket', 'kitchen', true)
  RETURNING *
), v AS (
  INSERT INTO product_variants (item_code, name, description, category, product_line, mrp, dimension_notes, is_active, is_default)
  SELECT 'PRCWPF', name, description, category, product_line, 820, '470mm', is_active, true
  FROM g
  ON CONFLICT (item_code) DO UPDATE SET is_default = EXCLUDED.is_default
  RETURNING id
)
UPDATE product_variants pv SET product_id = g.id FROM g, v WHERE pv.id = v.id;

-- Autolid Wastebin 8LTR (Book1 row 22)
WITH g AS (
  INSERT INTO products (name, description, category, product_line, is_active)
  VALUES ('Autolid Wastebin 8LTR', 'A tidy 8-litre bin with a self-closing lid that keeps kitchen waste out of sight and odours contained.', 'Basket', 'kitchen', true)
  RETURNING *
), v AS (
  INSERT INTO product_variants (item_code, name, description, category, product_line, mrp, dimension_notes, is_active, is_default)
  SELECT 'PAW-8LTR', name, description, category, product_line, 2400, '330x270x400mm', is_active, true
  FROM g
  ON CONFLICT (item_code) DO UPDATE SET is_default = EXCLUDED.is_default
  RETURNING id
)
UPDATE product_variants pv SET product_id = g.id FROM g, v WHERE pv.id = v.id;

-- Skirting Black 4" 3m (Book1 row 23)
WITH g AS (
  INSERT INTO products (name, description, category, product_line, is_active)
  VALUES ('Skirting Black 4" 3m', 'Finish your cabinets with a clean, seamless look — durable black skirting that hides base gaps.', 'Hardware', 'hardware', true)
  RETURNING *
), v AS (
  INSERT INTO product_variants (item_code, name, description, category, product_line, mrp, dimension_notes, is_active, is_default)
  SELECT 'PSB-100', name, description, category, product_line, 715, '4 inch (3m length)', is_active, true
  FROM g
  ON CONFLICT (item_code) DO UPDATE SET is_default = EXCLUDED.is_default
  RETURNING id
)
UPDATE product_variants pv SET product_id = g.id FROM g, v WHERE pv.id = v.id;

-- Skirting Flexible Connector Black 4" (Book1 row 24)
WITH g AS (
  INSERT INTO products (name, description, category, product_line, is_active)
  VALUES ('Skirting Flexible Connector Black 4"', 'The finishing touch for skirting boards — a flexible connector for seamless corners and clean joins.', 'Hardware', 'hardware', true)
  RETURNING *
), v AS (
  INSERT INTO product_variants (item_code, name, description, category, product_line, mrp, dimension_notes, is_active, is_default)
  SELECT 'PSFCB-100', name, description, category, product_line, 55, '4 inch', is_active, true
  FROM g
  ON CONFLICT (item_code) DO UPDATE SET is_default = EXCLUDED.is_default
  RETURNING id
)
UPDATE product_variants pv SET product_id = g.id FROM g, v WHERE pv.id = v.id;

-- Wardrobe Hanging Rod Bracket (Book1 row 25 — placeholder code)
WITH g AS (
  INSERT INTO products (name, description, category, product_line, is_active)
  VALUES ('Wardrobe Hanging Rod Bracket', 'Sturdy bracket for mounting hanging rods in wardrobe units.', 'Wardrobe', 'wardrobe', true)
  RETURNING *
), v AS (
  INSERT INTO product_variants (item_code, name, description, category, product_line, is_active, is_default)
  SELECT 'PWHRB', name, description, category, product_line, is_active, true
  FROM g
  ON CONFLICT (item_code) DO UPDATE SET is_default = EXCLUDED.is_default
  RETURNING id
)
UPDATE product_variants pv SET product_id = g.id FROM g, v WHERE pv.id = v.id;

-- MS 3D Hinge 0 Deg Bira (Book1 row 26)
WITH g AS (
  INSERT INTO products (name, description, category, product_line, is_active)
  VALUES ('MS 3D Hinge 0 Deg Bira', 'A precision 3-way adjustable hinge that lets you fine-tune every cabinet door for a perfectly even fit.', 'Hinges', 'hardware', true)
  RETURNING *
), v AS (
  INSERT INTO product_variants (item_code, name, description, category, product_line, mrp, dimension_notes, is_active, is_default)
  SELECT 'PMS3DH', name, description, category, product_line, 200, 'Full/Half/Inset Overlay', is_active, true
  FROM g
  ON CONFLICT (item_code) DO UPDATE SET is_default = EXCLUDED.is_default
  RETURNING id
)
UPDATE product_variants pv SET product_id = g.id FROM g, v WHERE pv.id = v.id;

-- Rattan Basket Soft Close Mocha 450mm (Book1 row 30 — placeholder code)
WITH g AS (
  INSERT INTO products (name, description, category, product_line, is_active)
  VALUES ('Rattan Basket Soft Close Mocha 450mm', 'A soft-close rattan basket in a warm mocha finish for effortless wardrobe organization.', 'Wardrobe', 'wardrobe', true)
  RETURNING *
), v AS (
  INSERT INTO product_variants (item_code, name, description, category, product_line, is_active, is_default)
  SELECT 'PRBSCM-450', name, description, category, product_line, is_active, true
  FROM g
  ON CONFLICT (item_code) DO UPDATE SET is_default = EXCLUDED.is_default
  RETURNING id
)
UPDATE product_variants pv SET product_id = g.id FROM g, v WHERE pv.id = v.id;

-- Telescopic Channel 14" Zinc Phrex (Book1 row 35 — standalone, different series from Group E)
WITH g AS (
  INSERT INTO products (name, description, category, product_line, is_active)
  VALUES ('Telescopic Channel 14" Zinc Phrex', 'Smooth, full-extension ball-bearing glide for drawers — a reliable, zinc-finish channel built to last.', 'Channels', 'hardware', true)
  RETURNING *
), v AS (
  INSERT INTO product_variants (item_code, name, description, category, product_line, mrp, dimension_notes, is_active, is_default)
  SELECT 'PTC35-14', name, description, category, product_line, 406, '14 inch, 35kg capacity', is_active, true
  FROM g
  ON CONFLICT (item_code) DO UPDATE SET is_default = EXCLUDED.is_default
  RETURNING id
)
UPDATE product_variants pv SET product_id = g.id FROM g, v WHERE pv.id = v.id;

-- Blind Hinge Soft Close Bira (Book1 row 39)
WITH g AS (
  INSERT INTO products (name, description, category, product_line, is_active)
  VALUES ('Blind Hinge Soft Close Bira', 'A soft-close hinge purpose-built for blind corner doors — silent, gentle closing every single time.', 'Hinges', 'hardware', true)
  RETURNING *
), v AS (
  INSERT INTO product_variants (item_code, name, description, category, product_line, mrp, dimension_notes, is_active, is_default)
  SELECT 'PBHSC', name, description, category, product_line, 270, '90 degree', is_active, true
  FROM g
  ON CONFLICT (item_code) DO UPDATE SET is_default = EXCLUDED.is_default
  RETURNING id
)
UPDATE product_variants pv SET product_id = g.id FROM g, v WHERE pv.id = v.id;

-- 135 Deg Pie Bira (Book1 row 40)
WITH g AS (
  INSERT INTO products (name, description, category, product_line, is_active)
  VALUES ('135 Deg Pie Bira', 'Purpose-built for angled corner cabinets, this pie-cut hinge keeps doors opening and closing smoothly.', 'Hinges', 'hardware', true)
  RETURNING *
), v AS (
  INSERT INTO product_variants (item_code, name, description, category, product_line, mrp, dimension_notes, is_active, is_default)
  SELECT 'P-135DH', name, description, category, product_line, 200, '135 degree', is_active, true
  FROM g
  ON CONFLICT (item_code) DO UPDATE SET is_default = EXCLUDED.is_default
  RETURNING id
)
UPDATE product_variants pv SET product_id = g.id FROM g, v WHERE pv.id = v.id;

-- Cloth Hanging Rack Grey (Book1 row 12 — placeholder code PCHRG, part of Group C)
-- Note: Only insert if PCHRG doesn't already exist from Group C update above
INSERT INTO product_variants (item_code, name, description, category, product_line, mrp, dimension_notes, is_active, is_default, product_id)
SELECT 'PCHRG', 'Cloth Hanging Rack Grey', 'A compact pull-out rod in sleek grey that adds an extra convenient hanging point.', 'Wardrobe', 'wardrobe', 3400, '115x455x115mm', true, false,
       p.id
FROM products p
WHERE p.name = 'Cloth Hanging Rack'
ON CONFLICT (item_code) DO NOTHING;

-- Decoration Shelf Mocha 600mm (Book1 row 44)
WITH g AS (
  INSERT INTO products (name, description, category, product_line, is_active)
  VALUES ('Decoration Shelf Mocha 600mm', 'A pull-out display shelf finished in rich mocha leather — perfect for showcasing wardrobe essentials in style.', 'Wardrobe', 'wardrobe', true)
  RETURNING *
), v AS (
  INSERT INTO product_variants (item_code, name, description, category, product_line, mrp, dimension_notes, is_active, is_default)
  SELECT 'PDSM-600', name, description, category, product_line, 10720, '564x460x71mm', is_active, true
  FROM g
  ON CONFLICT (item_code) DO UPDATE SET is_default = EXCLUDED.is_default
  RETURNING id
)
UPDATE product_variants pv SET product_id = g.id FROM g, v WHERE pv.id = v.id;

-- Shoe Rack Mocha 600mm (Book1 row 46)
WITH g AS (
  INSERT INTO products (name, description, category, product_line, is_active)
  VALUES ('Shoe Rack Mocha 600mm', 'Angled slats keep shoes visible and dust-free — a mocha leather-finish pull-out rack for effortless organization.', 'Wardrobe', 'wardrobe', true)
  RETURNING *
), v AS (
  INSERT INTO product_variants (item_code, name, description, category, product_line, mrp, dimension_notes, is_active, is_default)
  SELECT 'PSRM-600', name, description, category, product_line, 9475, '564x460x170mm', is_active, true
  FROM g
  ON CONFLICT (item_code) DO UPDATE SET is_default = EXCLUDED.is_default
  RETURNING id
)
UPDATE product_variants pv SET product_id = g.id FROM g, v WHERE pv.id = v.id;

-- Revolving Mirror 1200mm (Book1 row 48 — placeholder code)
WITH g AS (
  INSERT INTO products (name, description, category, product_line, is_active)
  VALUES ('Revolving Mirror 1200mm', 'A full-length revolving mirror for wardrobe units.', 'Wardrobe', 'wardrobe', true)
  RETURNING *
), v AS (
  INSERT INTO product_variants (item_code, name, description, category, product_line, is_active, is_default)
  SELECT 'PRM-1200', name, description, category, product_line, is_active, true
  FROM g
  ON CONFLICT (item_code) DO UPDATE SET is_default = EXCLUDED.is_default
  RETURNING id
)
UPDATE product_variants pv SET product_id = g.id FROM g, v WHERE pv.id = v.id;

-- Tie Rack Grey (Book1 row 49 — placeholder code)
WITH g AS (
  INSERT INTO products (name, description, category, product_line, is_active)
  VALUES ('Tie Rack Grey', 'A smooth pull-out tie rack in a sleek grey finish.', 'Wardrobe', 'wardrobe', true)
  RETURNING *
), v AS (
  INSERT INTO product_variants (item_code, name, description, category, product_line, is_active, is_default)
  SELECT 'PTRG', name, description, category, product_line, is_active, true
  FROM g
  ON CONFLICT (item_code) DO UPDATE SET is_default = EXCLUDED.is_default
  RETURNING id
)
UPDATE product_variants pv SET product_id = g.id FROM g, v WHERE pv.id = v.id;

-- ─── CATCH-ALL: one standalone parent per remaining unlinked variant ─
-- Every product_variant row that still has product_id IS NULL after the
-- named groups above gets its own 1:1 parent row here. This handles all
-- standalones from the live DB regardless of what else might be in the table.
DO $$
DECLARE
  v_rec       RECORD;
  v_parent_id UUID;
BEGIN
  FOR v_rec IN
    SELECT * FROM product_variants WHERE product_id IS NULL ORDER BY catalogue_sno NULLS LAST, created_at
  LOOP
    INSERT INTO products (
      name, description, category, product_line,
      is_featured, is_active, created_at, updated_at
    ) VALUES (
      v_rec.name,
      v_rec.description,
      v_rec.category,
      v_rec.product_line,
      v_rec.is_featured,
      v_rec.is_active,
      v_rec.created_at,
      v_rec.updated_at
    )
    RETURNING id INTO v_parent_id;

    UPDATE product_variants
    SET product_id = v_parent_id, is_default = true
    WHERE id = v_rec.id;
  END LOOP;
END $$;

-- ─── SANITY CHECK ─────────────────────────────────────────────────
-- After this migration, every product_variant row must have a product_id.
-- This will raise an error if any are still NULL, catching any gaps.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM product_variants WHERE product_id IS NULL) THEN
    RAISE EXCEPTION 'Seed incomplete: % product_variant row(s) still have NULL product_id',
      (SELECT COUNT(*) FROM product_variants WHERE product_id IS NULL);
  END IF;
END $$;

