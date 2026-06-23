// ═══════════════════════════════════════════════════════════════════
// CATALOGUE DATA — ported from the standalone Vite/React prototype
// Source of truth for real product data + verified Drive image mapping.
// This will seed Supabase; until the DB layer is wired up, pages can
// import directly from here.
// ═══════════════════════════════════════════════════════════════════

const productPath = (folder: string, file: string) => `/products/${folder}/${file}`;

export interface CatalogueCategory {
  name: string;
  slug: string;
  folder: string;
  image: string;
  gallery: string[];
}

export const CATALOG_CATEGORIES: CatalogueCategory[] = [
  {
    name: "Basket",
    slug: "basket",
    folder: "basket",
    image: productPath("basket", "basket-5-brand.jpg"),
    gallery: [
      productPath("hero", "basket-pullout-hero.png"),
      productPath("basket", "basket-1.jpg"),
      productPath("basket", "basket-2.jpg"),
      productPath("basket", "basket-3-lifestyle.jpg"),
      productPath("basket", "basket-4-lifestyle.jpg"),
      productPath("basket", "basket-5-brand.jpg"),
    ],
  },
  {
    name: "Glass Pull Down",
    slug: "glass-pull-down",
    folder: "glass-pull-down",
    image: productPath("glass-pull-down", "glass-pull-down-6-collage.jpg"),
    gallery: [
      productPath("glass-pull-down", "glass-pull-down-6-collage.jpg"),
      productPath("glass-pull-down", "glass-pull-down-1.jpg"),
      productPath("glass-pull-down", "glass-pull-down-2.jpg"),
      productPath("glass-pull-down", "glass-pull-down-3.jpg"),
      productPath("glass-pull-down", "glass-pull-down-4.jpg"),
      productPath("glass-pull-down", "glass-pull-down-5-lifestyle.jpg"),
    ],
  },
  {
    name: "GTPT",
    slug: "gtpt",
    folder: "gtpt",
    image: productPath("gtpt", "gtpt-2-lifestyle-collage.jpg"),
    gallery: [
      productPath("gtpt", "gtpt-2-lifestyle-collage.jpg"),
      productPath("gtpt", "gtpt-1-collage.jpg"),
      productPath("gtpt", "gtpt-3-lifestyle.jpg"),
      productPath("gtpt", "gtpt-4.jpg"),
      productPath("gtpt", "gtpt-5.jpg"),
    ],
  },
  {
    name: "Hinges",
    slug: "hinges",
    folder: "hinges-new",
    image: productPath("hinges-new", "hinges-new-5-collage.jpg"),
    // NOTE: "Hinges New" and "Hinges Old" were merged into one category
    // ("Hinges") per product decision. Source images live in two
    // separate Drive-derived folders on disk — hinges-new/ and
    // hinges-old/ — so the gallery below pulls from both. The `folder`
    // field stays "hinges-new" since it's only used as the historical
    // primary reference; actual image paths are explicit below.
    gallery: [
      productPath("hinges-new", "hinges-new-5-collage.jpg"),
      productPath("hinges-new", "hinges-new-1.jpg"),
      productPath("hinges-new", "hinges-new-2.jpg"),
      productPath("hinges-new", "hinges-new-3.jpg"),
      productPath("hinges-new", "hinges-new-4.jpg"),
      productPath("hinges-old", "hinges-old-1.jpg"),
      productPath("hinges-old", "hinges-old-2.jpg"),
      productPath("hinges-old", "hinges-old-3.jpg"),
      productPath("hinges-old", "hinges-old-4.jpg"),
      productPath("hinges-old", "hinges-old-5.jpg"),
    ],
  },
  {
    name: "Rolling Shutter",
    slug: "rolling-shutter",
    folder: "rolling-shutter",
    image: productPath("rolling-shutter", "rolling-shutter-6-collage.jpg"),
    gallery: [
      productPath("rolling-shutter", "rolling-shutter-6-collage.jpg"),
      productPath("rolling-shutter", "rolling-shutter-1-brand.jpg"),
      productPath("rolling-shutter", "rolling-shutter-2.jpg"),
      productPath("rolling-shutter", "rolling-shutter-3.jpg"),
      productPath("rolling-shutter", "rolling-shutter-4.jpg"),
      productPath("rolling-shutter", "rolling-shutter-5.jpg"),
    ],
  },
  {
    name: "S Corner",
    slug: "s-corner",
    folder: "s-corner",
    image: productPath("s-corner", "s-corner-1-collage.jpg"),
    gallery: [
      productPath("s-corner", "s-corner-1-collage.jpg"),
      productPath("s-corner", "s-corner-2.jpg"),
      productPath("s-corner", "s-corner-3-lifestyle-collage.jpg"),
      productPath("s-corner", "s-corner-4.jpg"),
      productPath("s-corner", "s-corner-5.jpg"),
      productPath("s-corner", "s-corner-6.jpg"),
    ],
  },
  {
    name: "Trouser Rack",
    slug: "trouser-rack",
    folder: "trouser-rack",
    image: productPath("trouser-rack", "trouser-rack-5-brand.jpg"),
    gallery: [
      productPath("trouser-rack", "trouser-rack-5-brand.jpg"),
      productPath("trouser-rack", "trouser-rack-1.jpg"),
      productPath("trouser-rack", "trouser-rack-2.jpg"),
      productPath("trouser-rack", "trouser-rack-3.jpg"),
      productPath("trouser-rack", "trouser-rack-4.jpg"),
    ],
  },
];

export const CATEGORIES = CATALOG_CATEGORIES.map((category) => category.name);

export const IMAGES = {
  logo: "/eryx-logo.png",
  heroMain: productPath("gtpt", "gtpt-3-lifestyle.jpg"),
  heroAlt: productPath("glass-pull-down", "glass-pull-down-5-lifestyle.jpg"),
  heroTertiary: productPath("s-corner", "s-corner-3-lifestyle-collage.jpg"),
  kitchenHero: productPath("s-corner", "s-corner-3-lifestyle-collage.jpg"),
  categoriesFocusLarge: productPath("basket", "basket-5-brand.jpg"),
};

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ─── Prefix-based mapping: catalogue item code → Drive folder/category ───
// This is the verified cross-reference between the PDF catalogue's SKU
// codes and the actual photographed product folders.
function categoryForCode(code: string): string {
  const normalized = code.toUpperCase();
  const matches = (...prefixes: string[]) =>
    prefixes.some((prefix) => normalized.startsWith(prefix));

  if (matches("EGP12", "EWPC", "EWPDG", "PSP", "PGPWB", "PWCA", "PWB")) return "Basket";
  if (
    matches(
      "EGBPO", "PWBC", "PWBD", "PGB", "PSB2S", "PSB3S", "PPDG", "PPCT",
      "PMD", "PMDS", "PACF", "PAPF", "PDPH", "PPPR", "PRC", "PASMR"
    )
  )
    return "Glass Pull Down";
  if (matches("PGTUSM", "PDR")) return "GTPT";
  if (matches("PSBDG", "PTDGS", "PAOG", "PACH", "PM2", "PMS", "PSS2", "PSS3"))
    return "Hinges";
  if (
    matches(
      "PB3DH", "PP3DH", "PBHSC", "P-135DH", "P-165", "PTC35", "PTCB35",
      "PWQ", "PSBQ", "PGS", "PGSSC", "PBF", "PBFH"
    )
  )
    return "Hinges";
  if (matches("PPR", "PGR", "PNSR", "PST", "PSBT")) return "Rolling Shutter";
  if (
    matches(
      "EGSC", "PSCC", "PSCDG", "PSC", "EGUMC", "PUMC", "PSMCU", "PAW", "PSW",
      "PPCP", "PPCS", "PPPCH", "PPCL", "PBHB", "PMF", "PWD", "PASP", "PLB",
      "PSSAC", "PSSGZ", "PSSWZ", "PJ", "PDS"
    )
  )
    return "S Corner";
  if (
    matches(
      "PSS", "PSB", "PSF", "PPVC", "PBF3", "PBF5", "PDSM", "PRBM", "PTRM",
      "PSRM", "PRSRM", "PSTRM", "PDTRM", "PCHRM", "PWUM", "PDSG", "PRBG",
      "PTRG", "PSRG", "PSTRG", "PDTRG"
    )
  )
    return "Trouser Rack";

  return "Basket";
}

function categoryMeta(categoryName: string): CatalogueCategory {
  return (
    CATALOG_CATEGORIES.find((category) => category.name === categoryName) ||
    CATALOG_CATEGORIES[0]
  );
}

function materialFor(finish: string): string {
  if (finish === "Glass") return "Tempered Glass";
  if (finish === "Wooden" || finish === "Mocha" || finish === "Grey")
    return "Engineered Wood";
  if (finish === "PVC") return "PVC and Aluminium";
  return "German Steel";
}

function describe(category: string, name: string, finish: string): string {
  const descMap: Record<string, string> = {
    Basket: `A ${finish.toLowerCase()} modular storage fitting for smooth access to pantry, basket, and pull-out storage zones.`,
    "Glass Pull Down": `A premium ${finish.toLowerCase()} pull-down and organizer system for compact, accessible kitchen storage.`,
    GTPT: `A tall and utility storage fitting designed for organized vertical storage and everyday kitchen access.`,
    Hinges: `A precision hinge, channel, or lift-up mechanism for modular cabinetry — reliable movement, alignment, and soft-close performance.`,
    "Rolling Shutter": `A clean sliding and shutter hardware system for concealed storage and smooth cabinet access.`,
    "S Corner": `A corner and cabinet accessory fitting that converts difficult cabinet spaces into accessible storage.`,
    "Trouser Rack": `A wardrobe and furniture fitting designed for organized closet, bed, and accessory applications.`,
  };
  return descMap[category] || `${name} from the Eryx modular hardware catalogue.`;
}

type RawRow = [string, string, string, number | null, string];

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
  ["PACH", "Auto Close Hinge", "Contact for specifications", null, "Steel"],
  ["PM2SO", "Clip-On Hinge Mechanism", "Contact for specifications", null, "Steel"],
  ["PB3DH", "3D Cabinet Hinge", "Contact for specifications", null, "Steel"],
  ["PTC35", "Channel and Quadro System", "Contact for specifications", null, "Steel"],
  ["PGS", "Lift Up Mechanism", "Contact for specifications", null, "Steel"],
  ["PTRM", "Trouser Rack Mocha", "Contact for specifications", null, "Mocha"],
  ["PDSG", "Wardrobe Accessory Grey", "Contact for specifications", null, "Grey"],
  ["PBF3", "Bed Fitting Unit", "Contact for specifications", null, "Steel"],
  ["PSS", "Skirting and Legs", "Contact for specifications", null, "Steel"],
];

export interface CatalogueProduct {
  code: string;
  name: string;
  dimensions: string;
  mrp: number | null;
  finish: string;
  category: string;
  categorySlug: string;
  slug: string;
  image: string;
  gallery: string[];
  description: string;
  material: string;
}

export const PRODUCTS: CatalogueProduct[] = RAW_ROWS.map(
  ([code, name, dimensions, mrp, finish], index) => {
    const category = categoryForCode(code);
    const meta = categoryMeta(category);
    const gallery = meta.gallery;

    return {
      code,
      name,
      dimensions,
      mrp,
      finish,
      category,
      categorySlug: meta.slug,
      slug: slugify(code),
      image: gallery[index % gallery.length],
      gallery,
      description: describe(category, name, finish),
      material: materialFor(finish),
    };
  }
);

export const ALL_PRODUCTS = PRODUCTS;

export const FINISHES = Array.from(
  new Set(PRODUCTS.map((product) => product.finish))
).sort();

export const TOP_PICKS_SLUGS = ["egp12-450", "ppdg-600", "pprss-600", "psbdg10-450"];

export function formatPrice(mrp: number | null): string {
  return typeof mrp === "number" ? `₹${mrp.toLocaleString("en-IN")}` : "Price on request";
}

export function getCategoryByName(name: string) {
  return CATALOG_CATEGORIES.find((category) => category.name === name);
}

export function getProductBySlug(slug: string) {
  return PRODUCTS.find((product) => product.slug === slug);
}

export function getProductsByCategory(category: string) {
  return PRODUCTS.filter((product) => product.category === category);
}

export function getTopPicks() {
  return TOP_PICKS_SLUGS.map((slug) => getProductBySlug(slug)).filter(
    (p): p is CatalogueProduct => Boolean(p)
  );
}