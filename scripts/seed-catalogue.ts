import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─────────────────────────────────────────────────────────────────
// KITCHEN-ONLY SEED — real catalogue data verified against the
// ported frontend's data file. Covers only the 82 rows with real
// dimensions and real pricing (everything before the placeholder
// "Contact for specifications" rows, which belong to Hardware and
// Wardrobe lines not yet finalized — see project decision log).
// ─────────────────────────────────────────────────────────────────

const productPath = (folder: string, file: string) => `/products/${folder}/${file}`;

interface CategoryMeta {
  name: string;
  gallery: string[];
}

// Mirrors CATALOG_CATEGORIES from catalogue-data.ts, restricted to
// the 4 categories that actually contain real Kitchen products.
const CATEGORY_GALLERIES: Record<string, CategoryMeta> = {
  Basket: {
    name: "Basket",
    gallery: [
      productPath("hero", "basket-pullout-hero.png"),
      productPath("basket", "basket-1.jpg"),
      productPath("basket", "basket-2.jpg"),
      productPath("basket", "basket-3-lifestyle.jpg"),
      productPath("basket", "basket-4-lifestyle.jpg"),
      productPath("basket", "basket-5-brand.jpg"),
    ],
  },
  "Glass Pull Down": {
    name: "Glass Pull Down",
    gallery: [
      productPath("glass-pull-down", "glass-pull-down-6-collage.jpg"),
      productPath("glass-pull-down", "glass-pull-down-1.jpg"),
      productPath("glass-pull-down", "glass-pull-down-2.jpg"),
      productPath("glass-pull-down", "glass-pull-down-3.jpg"),
      productPath("glass-pull-down", "glass-pull-down-4.jpg"),
      productPath("glass-pull-down", "glass-pull-down-5-lifestyle.jpg"),
    ],
  },
  GTPT: {
    name: "GTPT",
    gallery: [
      productPath("gtpt", "gtpt-2-lifestyle-collage.jpg"),
      productPath("gtpt", "gtpt-1-collage.jpg"),
      productPath("gtpt", "gtpt-3-lifestyle.jpg"),
      productPath("gtpt", "gtpt-4.jpg"),
      productPath("gtpt", "gtpt-5.jpg"),
    ],
  },
  "Rolling Shutter": {
    name: "Rolling Shutter",
    gallery: [
      productPath("rolling-shutter", "rolling-shutter-6-collage.jpg"),
      productPath("rolling-shutter", "rolling-shutter-1-brand.jpg"),
      productPath("rolling-shutter", "rolling-shutter-2.jpg"),
      productPath("rolling-shutter", "rolling-shutter-3.jpg"),
      productPath("rolling-shutter", "rolling-shutter-4.jpg"),
      productPath("rolling-shutter", "rolling-shutter-5.jpg"),
    ],
  },
  "S Corner": {
    name: "S Corner",
    gallery: [
      productPath("s-corner", "s-corner-1-collage.jpg"),
      productPath("s-corner", "s-corner-2.jpg"),
      productPath("s-corner", "s-corner-3-lifestyle-collage.jpg"),
      productPath("s-corner", "s-corner-4.jpg"),
      productPath("s-corner", "s-corner-5.jpg"),
      productPath("s-corner", "s-corner-6.jpg"),
    ],
  },
};

function categoryForCode(code: string): string {
  const normalized = code.toUpperCase();
  const matches = (...prefixes: string[]) =>
    prefixes.some((prefix) => normalized.startsWith(prefix));

  // FIX applied here vs. the original ported matcher: PSBDG (Slim Box
  // Dark Grey) was incorrectly matching the Hinges prefix list in
  // catalogue-data.ts. It's a real, priced Kitchen product — moved
  // here under Basket explicitly, ahead of any Hardware-related check.
  if (matches("PSBDG")) return "Basket";

  if (matches("EGP12", "EWPC", "EWPDG", "PSP", "PGPWB", "PWCA", "PWB"))
    return "Basket";
  if (
    matches(
      "EGBPO", "PWBC", "PWBD", "PGB", "PSB2S", "PSB3S", "PPDG", "PPCT",
      "PMD"
    )
  )
    return "Glass Pull Down";
  if (matches("PGTUSM", "PDR")) return "GTPT";
  if (matches("EGSC", "PSCC", "PSCDG", "EGUMC", "PUMC", "PSMCU"))
    return "S Corner";
  if (matches("PPR", "PGR")) return "Rolling Shutter";
  if (matches("PAW", "PSW")) return "S Corner";

  throw new Error(`No category mapping for code: ${code}`);
}

function materialFor(finish: string): string {
  if (finish === "Glass") return "Tempered Glass";
  if (finish === "Wooden") return "Engineered Wood";
  if (finish === "PVC") return "PVC and Aluminium";
  return "German Steel";
}

function describe(category: string, name: string, finish: string): string {
  const descMap: Record<string, string> = {
    Basket: `A ${finish.toLowerCase()} modular storage fitting for smooth access to pantry, basket, and pull-out storage zones.`,
    "Glass Pull Down": `A premium ${finish.toLowerCase()} pull-down and organizer system for compact, accessible kitchen storage.`,
    GTPT: `A tall and utility storage fitting designed for organized vertical storage and everyday kitchen access.`,
    "S Corner": `A corner and cabinet accessory fitting that converts difficult cabinet spaces into accessible storage.`,
    "Rolling Shutter": `A clean sliding and shutter hardware system for concealed storage and smooth cabinet access.`,
  };
  return descMap[category] || `${name} from the Eryx modular hardware catalogue.`;
}

type RawRow = [string, string, string, number | null, string];

// The verified 82 real Kitchen rows — placeholder Hardware/Wardrobe
// rows (PACH, PM2SO, PB3DH, PTC35, PGS, PTRM, PDSG, PBF3, PSS)
// deliberately excluded from this seed per project decision.
const RAW_ROWS: RawRow[] = [
  ["EGP12-450", "Golden Pantry 12x450", "414x500x1900mm", 28600, "Golden"],
  ["EGP12-600", "Golden Pantry 12x600", "564x500x1900mm", 32150, "Golden"],
  ["EWPC12-450", "Wooden Pantry Chrome", "414x500x1900mm", 23950, "Chrome"],
  ["EWPC12-600", "Wooden Pantry Chrome", "564x500x1900mm", 27500, "Chrome"],
  ["EWPDG12-450", "Wooden Pantry Dark Grey", "414x500x1900mm", 23950, "Dark Grey"],
  ["EWPDG12-600", "Wooden Pantry Dark Grey", "564x500x1900mm", 27500, "Dark Grey"],
  ["PSP12-450", "Satin Pantry", "414x500x1900mm", 24650, "Satin"],
  ["PSP12-600", "Satin Pantry", "564x500x1900mm", 28250, "Satin"],
  ["PGPWB8-450", "Glass Pantry With Bidding", "414x500x1450mm", 19650, "Glass"],
  ["PGPWB12-450", "Glass Pantry With Bidding", "414x500x1900mm", 23950, "Glass"],
  ["PGPWB8-600", "Glass Pantry With Bidding", "564x500x1450mm", 23500, "Glass"],
  ["PGPWB12-600", "Glass Pantry With Bidding", "564x500x1900mm", 27500, "Glass"],
  ["EGSC-L", "Golden Swing Corner Left", "864x500x620-720mm", 16800, "Golden"],
  ["EGSC-R", "Golden Swing Corner Right", "864x500x620-720mm", 16800, "Golden"],
  ["EGUMC", "Golden Universal Magic Corner", "660x485x590mm", 23600, "Golden"],
  ["PSMCU-L/R", "Satin Magic Corner Universal L/R", "864x530x520mm", 17000, "Satin"],
  ["PSCC-L", "S Corner Chrome Left", "864x495x620-720mm", 10900, "Chrome"],
  ["PSCC-R", "S Corner Chrome Right", "864x495x620-720mm", 10900, "Chrome"],
  ["PSCDG-L", "S Corner Dark Grey Left", "864x495x620-720mm", 10900, "Dark Grey"],
  ["PSCDG-R", "S Corner Dark Grey Right", "864x495x620-720mm", 10900, "Dark Grey"],
  ["PUMCC", "Universal Magic Corner Chrome", "660x485x590mm", 21450, "Chrome"],
  ["PUMCDG", "Universal Magic Corner Dark Grey", "660x485x590mm", 21450, "Dark Grey"],
  ["PUMCG", "Universal Magic Corner Glass", "660x485x590mm", 21450, "Glass"],
  ["EGBPOSM200", "Bottle Pull-Out Golden 200mm", "164x480x660mm", 7500, "Golden"],
  ["EGBPOSM250", "Bottle Pull-Out Golden 250mm", "214x480x660mm", 7900, "Golden"],
  ["EGBPOSM300", "Bottle Pull-Out Golden 300mm", "264x480x660mm", 8300, "Golden"],
  ["PWBCSM-200", "Wooden BPO Chrome 200mm", "164x480x660mm", 6450, "Chrome"],
  ["PWBCSM-250", "Wooden BPO Chrome 250mm", "214x480x660mm", 6800, "Chrome"],
  ["PWBCSM-300", "Wooden BPO Chrome 300mm", "264x480x660mm", 7150, "Chrome"],
  ["PWBDGSM-200", "Wooden BPO Dark Grey 200mm", "164x480x660mm", 6450, "Dark Grey"],
  ["PWBDGSM-250", "Wooden BPO Dark Grey 250mm", "214x480x660mm", 6800, "Dark Grey"],
  ["PWBDGSM-300", "Wooden BPO Dark Grey 300mm", "264x480x660mm", 7150, "Dark Grey"],
  ["PGBSM-200", "Glass BPO 200mm", "164x480x660mm", 6600, "Glass"],
  ["PGBSM-250", "Glass BPO 250mm", "214x480x660mm", 7000, "Glass"],
  ["PGBSM-300", "Glass BPO 300mm", "264x480x660mm", 7400, "Glass"],
  ["PSB2S-150", "Satin BPO 2 Shelf 150mm", "114x540x660mm", 5200, "Satin"],
  ["PSB2S-200", "Satin BPO 2 Shelf 200mm", "164x540x660mm", 5550, "Satin"],
  ["PSB2S-250", "Satin BPO 2 Shelf 250mm", "214x540x660mm", 5900, "Satin"],
  ["PSB2S-300", "Satin BPO 2 Shelf 300mm", "264x540x660mm", 6250, "Satin"],
  ["PSB3S-300", "Satin BPO 3 Shelf 300mm", "264x540x660mm", 8220, "Satin"],
  ["PGTUSM-200", "Glass Tall Unit 200mm", "164x480x1840mm", 18600, "Glass"],
  ["PGTUSM-250", "Glass Tall Unit 250mm", "214x480x1840mm", 19650, "Glass"],
  ["PGTUSM-300", "Glass Tall Unit 300mm", "264x480x1840mm", 20750, "Glass"],
  ["PPRSS-600", "PVC Rolling Shutter Silver 600mm", "564x300x1320mm", 14300, "Chrome"],
  ["PPRSS-450", "PVC Rolling Shutter Silver 450mm", "414x300x1320mm", 14300, "Chrome"],
  ["PPRSB-600", "PVC Rolling Shutter Black 600mm", "564x300x1320mm", 14300, "Dark Grey"],
  ["PPRSB-450", "PVC Rolling Shutter Black 450mm", "414x300x1320mm", 14300, "Dark Grey"],
  ["PPRSW-600", "PVC Rolling Shutter White 600mm", "564x300x1320mm", 14300, "Satin"],
  ["PPRSW-450", "PVC Rolling Shutter White 450mm", "414x300x1320mm", 14300, "Satin"],
  ["PGRSB-600", "Glass Rolling Shutter Black", "564x330x1320mm", 24100, "Glass"],
  ["PGRSW-600", "Glass Rolling Shutter White", "564x330x1320mm", 24100, "Glass"],
  ["PGRSF-600", "Glass Rolling Shutter Frosted", "564x330x1320mm", 24100, "Glass"],
  ["PDR-600", "Dish Rack 600mm", "564x330x600mm", 1700, "Chrome"],
  ["PDR-700", "Dish Rack 700mm", "664x330x600mm", 1965, "Chrome"],
  ["PDR-800", "Dish Rack 800mm", "764x330x600mm", 2235, "Chrome"],
  ["PDR-900", "Dish Rack 900mm", "864x330x600mm", 2500, "Chrome"],
  ["PDR-1000", "Dish Rack 1000mm", "964x330x600mm", 2770, "Chrome"],
  ["PPDG-600", "Pull Down Glass 600mm", "564x300x600mm", 20500, "Glass"],
  ["PPDG-900", "Pull Down Glass 900mm", "864x300x600mm", 22500, "Glass"],
  ["PPCT-450", "PVC Cutlery Tray 450", "385x485x60mm", 715, "Chrome"],
  ["PPCT-500", "PVC Cutlery Tray 500", "430x485x60mm", 805, "Chrome"],
  ["PPCT-600", "PVC Cutlery Tray 600", "530x485x60mm", 915, "Chrome"],
  ["PPCT-700", "PVC Cutlery Tray 700", "630x485x60mm", 1075, "Chrome"],
  ["PPCT-800", "PVC Cutlery Tray 800", "730x485x60mm", 1250, "Chrome"],
  ["PPCT-900", "PVC Cutlery Tray 900", "830x485x60mm", 1465, "Chrome"],
  ["PMD-600", "Metal Divider 600", "600x500mm", 2600, "Dark Grey"],
  ["PMD-900", "Metal Divider 900", "900x500mm", 5360, "Dark Grey"],
  ["PWCA-450", "Wooden Cutlery Adjustable 450", "450-600mm cabinet", 3225, "Wooden"],
  ["PWCA-600", "Wooden Cutlery Adjustable 600", "600-900mm cabinet", 5350, "Wooden"],
  ["PAW-8LTR", "Autolid Wastebin 8L", "330x270x400mm", 2400, "Chrome"],
  ["PAW-14LTR", "Autolid Wastebin 14L", "350x290x430mm", 3125, "Chrome"],
  ["PSW-22LTR", "Sliding Wastebin 22L", "255x480x370mm", 6600, "Chrome"],
  ["PSWSC-40LTR", "Sliding Wastebin Soft Close 40L", "350x500x415mm", 10000, "Chrome"],
  ["PWB-450", "Wicker Basket 450mm", "414x540x100/150/200mm", 4300, "Wooden"],
  ["PWB-600", "Wicker Basket 600mm", "564x540x100/150/200mm", 5200, "Wooden"],
  ["PWBSC4-450", "Wicker Basket Soft Close 450mm 100H", "414x540x100mm", 8200, "Wooden"],
  ["PWBSC6-450", "Wicker Basket Soft Close 450mm 150H", "414x540x150mm", 8500, "Wooden"],
  ["PWBSC8-450", "Wicker Basket Soft Close 450mm 200H", "414x540x200mm", 8800, "Wooden"],
  ["PWBSC4-600", "Wicker Basket Soft Close 600mm 100H", "564x540x100mm", 8600, "Wooden"],
  ["PWBSC6-600", "Wicker Basket Soft Close 600mm 150H", "564x540x150mm", 8900, "Wooden"],
  ["PWBSC8-600", "Wicker Basket Soft Close 600mm 200H", "564x540x200mm", 9200, "Wooden"],
  ["PSBDG10-450", "Slim Box Dark Grey 202mm", "450mm", 3750, "Dark Grey"],
];

async function seed() {
  console.log(`Preparing ${RAW_ROWS.length} verified Kitchen products...`);

  let catalogueSno = 1;
  let insertedProducts = 0;
  let insertedImages = 0;

  for (const [code, name, dimensions, mrp, finish] of RAW_ROWS) {
    const category = categoryForCode(code);
    const meta = CATEGORY_GALLERIES[category];

    if (!meta) {
      console.error(`No gallery found for category "${category}" (code: ${code}) — skipping.`);
      continue;
    }

    const primaryImage = meta.gallery[(catalogueSno - 1) % meta.gallery.length];

    // Mirrors TOP_PICKS_SLUGS from catalogue-data.ts — these 4 codes
    // are marked featured so Home's "Top Picks" section has real data
    // instead of an empty result from getTopPicks().
    const FEATURED_CODES = ["EGP12-450", "PPDG-600", "PPRSS-600", "PSBDG10-450"];
    const isFeatured = FEATURED_CODES.includes(code);

    const { data: insertedProduct, error: productError } = await supabaseAdmin
      .from("products")
      .insert({
        item_code: code,
        catalogue_sno: catalogueSno,
        name,
        description: describe(category, name, finish),
        series: null,
        material: materialFor(finish),
        category,
        product_line: "kitchen",
        finish,
        dimension_notes: dimensions,
        mrp,
        is_featured: isFeatured,
        is_active: true,
        image_url: primaryImage,
      })
      .select()
      .single();

    if (productError) {
      console.error(`Failed to insert ${code}:`, productError.message);
      continue;
    }

    insertedProducts++;
    catalogueSno++;

    // Seed the full category gallery as this product's image set,
    // marking the one matching its primary image_url as is_primary.
    const imageRows = meta.gallery.map((url, index) => ({
      product_id: insertedProduct.id,
      image_url: url,
      display_order: index,
      is_primary: url === primaryImage,
    }));

    const { error: imageError } = await supabaseAdmin
      .from("product_images")
      .insert(imageRows);

    if (imageError) {
      console.error(`Failed to insert images for ${code}:`, imageError.message);
      continue;
    }

    insertedImages += imageRows.length;
  }

  console.log(`Seed complete: ${insertedProducts} products, ${insertedImages} image rows.`);
  process.exit(0);
}

seed();