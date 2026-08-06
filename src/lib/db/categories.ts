import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";

export type ProductLine = "kitchen" | "wardrobe" | "hardware";

export type CategoryEntry = {
  name: string;
  slug: string;
  count: number;
};

// A category enriched with its cheapest live "from" price, for the
// home-page "Categories in focus" filmstrip. minPrice is null when no
// variant in the category has a price (all "Price on request").
export type FocusCategory = {
  name: string;
  productLine: ProductLine;
  count: number;
  minPrice: number | null;
};

export type CategoryGroup = {
  productLine: ProductLine;
  categories: CategoryEntry[];
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Fixed order for the mega-menu columns. Product lines that have no
// active categories still appear as a header + empty-state (rendered
// by ProductsMegaMenu), so the menu shape is stable regardless of
// current inventory.
const PRODUCT_LINE_ORDER: ProductLine[] = ["kitchen", "wardrobe", "hardware"];

/**
 * Group active default variants by product_line + category, with a
 * usage count. Powers the nav mega-menu.
 *
 * Uses supabaseAdmin to bypass RLS — no auth needed since this is
 * public catalogue data feeding a public nav.
 *
 * Returns product lines in a fixed order (kitchen → wardrobe → hardware)
 * so the mega-menu column order never shifts based on inventory. Within
 * each line, categories are sorted by count desc (most-used first),
 * then name for ties.
 */
export async function getCategoriesByProductLine(): Promise<CategoryGroup[]> {
  const { data, error } = await supabaseAdmin
    .from("product_variants")
    .select("product_line, category")
    .eq("is_active", true)
    .eq("is_default", true);

  if (error) {
    console.error("[getCategoriesByProductLine] fetch failed:", error.message);
    return PRODUCT_LINE_ORDER.map((line) => ({
      productLine: line,
      categories: [],
    }));
  }

  // Group + count client-side. Trivial cost — at most ~200 rows.
  const buckets = new Map<ProductLine, Map<string, number>>();
  for (const line of PRODUCT_LINE_ORDER) {
    buckets.set(line, new Map());
  }

  for (const row of data || []) {
    const line = row.product_line as ProductLine | null | undefined;
    const category = row.category as string | null | undefined;
    if (!line || !category) continue;
    if (!PRODUCT_LINE_ORDER.includes(line)) continue;
    const bucket = buckets.get(line);
    if (!bucket) continue;
    bucket.set(category, (bucket.get(category) || 0) + 1);
  }

  return PRODUCT_LINE_ORDER.map((line) => {
    const bucket = buckets.get(line)!;
    const categories: CategoryEntry[] = Array.from(bucket.entries())
      .map(([name, count]) => ({ name, slug: slugify(name), count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    return { productLine: line, categories };
  });
}

/**
 * Every active category across all product lines, enriched with a live
 * count and cheapest "from" price. Powers the home-page "Categories in
 * focus" filmstrip, which pairs each category with curated imagery.
 *
 * Single fetch of default active variants (~200 rows) — min price is
 * computed with the same effective-price rule as `getEffectivePrice`
 * (sale price when on sale, else mrp; nulls ignored) so the strip and
 * the PLP agree on "from" pricing.
 */
export async function getFocusCategories(): Promise<FocusCategory[]> {
  const { data, error } = await supabaseAdmin
    .from("product_variants")
    .select("product_line, category, mrp, is_on_sale, discount_price")
    .eq("is_active", true)
    .eq("is_default", true);

  if (error) {
    console.error("[getFocusCategories] fetch failed:", error.message);
    return [];
  }

  // key = `${productLine}::${category}` → { count, minPrice }
  const buckets = new Map<string, { line: ProductLine; name: string; count: number; minPrice: number | null }>();

  for (const row of data || []) {
    const line = row.product_line as ProductLine | null | undefined;
    const name = row.category as string | null | undefined;
    if (!line || !name || !PRODUCT_LINE_ORDER.includes(line)) continue;

    const key = `${line}::${name}`;
    const entry = buckets.get(key) ?? { line, name, count: 0, minPrice: null };
    entry.count += 1;

    // Effective price = discount_price when on sale (and valid), else mrp.
    const onSale =
      row.is_on_sale === true &&
      typeof row.discount_price === "number" &&
      row.discount_price >= 0;
    const effective = onSale
      ? (row.discount_price as number)
      : typeof row.mrp === "number"
        ? row.mrp
        : null;
    if (effective !== null) {
      entry.minPrice =
        entry.minPrice === null ? effective : Math.min(entry.minPrice, effective);
    }

    buckets.set(key, entry);
  }

  return Array.from(buckets.values()).map(({ line, name, count, minPrice }) => ({
    name,
    productLine: line,
    count,
    minPrice,
  }));
}

// A single product line rolled up for the /products directory page: its
// total SKU count plus every live category under it (name, slug, count,
// cheapest "from" price). Categories are sorted most-stocked first.
export type OverviewCategory = {
  name: string;
  slug: string;
  count: number;
  minPrice: number | null;
};

export type LineOverview = {
  productLine: ProductLine;
  categoryCount: number;
  productCount: number;
  categories: OverviewCategory[];
};

export type ProductsOverview = {
  lines: LineOverview[];
  totalProducts: number;
  collectionCount: number;
};

/**
 * The whole catalogue grouped by product line for the /products
 * directory page. Each line carries a total count and its category
 * list (count + cheapest "from" price per category), so every row in
 * the directory shows live "X products · from ₹Y" with no extra query.
 *
 * Reuses `getFocusCategories()` — one fetch of active default variants,
 * same effective-price rule as the PLP — then rolls the flat
 * category list up per line. Lines always appear in the fixed
 * kitchen → wardrobe → hardware order, matching the mega-menu.
 */
export async function getProductsOverview(): Promise<ProductsOverview> {
  const focus = await getFocusCategories();

  const byLine = new Map<ProductLine, OverviewCategory[]>();
  for (const line of PRODUCT_LINE_ORDER) byLine.set(line, []);

  for (const c of focus) {
    byLine.get(c.productLine)?.push({
      name: c.name,
      slug: slugify(c.name),
      count: c.count,
      minPrice: c.minPrice,
    });
  }

  let totalProducts = 0;
  const lines: LineOverview[] = PRODUCT_LINE_ORDER.map((line) => {
    const categories = (byLine.get(line) ?? []).sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name)
    );
    const productCount = categories.reduce((sum, cat) => sum + cat.count, 0);
    totalProducts += productCount;
    return {
      productLine: line,
      categoryCount: categories.length,
      productCount,
      categories,
    };
  });

  return {
    lines,
    totalProducts,
    // Only lines that actually have stock count as a live "collection".
    collectionCount: lines.filter((l) => l.categoryCount > 0).length,
  };
}
