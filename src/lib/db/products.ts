import { supabaseAdmin } from "@/lib/supabase/server";
import type { CatalogueProduct } from "@/lib/catalogue-data";

// ─────────────────────────────────────────────────────────────────
// Post-variant-migration data layer.
//
// The database now has two tables:
//   products        — parent "concept" product (one row per sellable idea)
//   product_variants — purchasable SKU (one or more rows per parent)
//
// DbProduct continues to extend CatalogueProduct so that every
// existing component typed against CatalogueProduct still compiles
// without changes. The key addition is `variantId` (the UUID of the
// specific variant) and `parentId` (the parent products.id).
//
// `id` is kept as the variantId for backward-compat with:
//   - product_reviews.product_id (references product_variants.id)
//   - cart items keyed by product.slug (derived from variant item_code)
// ─────────────────────────────────────────────────────────────────

export interface ProductVariant {
  id: string;             // product_variants.id
  item_code: string;
  finish: string;
  dimension_notes: string;
  mrp: number | null;
  is_on_sale: boolean;
  discount_price: number | null;
  is_default: boolean;
  is_active: boolean;
  external_price_url: string | null;
  image: string;          // primary image URL
  gallery: string[];
  slug: string;           // slugified item_code
  optionValues: Record<string, string>;
  optionOrder: string[];
  stock_quantity: number;
  track_inventory: boolean;
}

export interface DbProduct extends CatalogueProduct {
  id: string;             // variant UUID — kept for backward-compat
  parentId: string;       // parent products.id
  variantId: string;      // explicit alias for id
  product_line?: string;  // 'kitchen' | 'wardrobe' | 'hardware' (denormalised on variant)
  variants?: ProductVariant[];
  variantCount?: number;
  external_price_url?: string | null;
}

const FALLBACK_PRODUCT_IMAGE = "/products/hero/kitchen-hero-1.jpg";

// ─── Helpers ─────────────────────────────────────────────────────

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function resolveImages(row: any): { image: string; gallery: string[] } {
  const images = (row.product_images || [])
    .sort((a: any, b: any) => a.display_order - b.display_order);

  const image =
    images.find((img: any) => img.is_primary)?.image_url ||
    images[0]?.image_url ||
    row.image_url ||
    FALLBACK_PRODUCT_IMAGE;

  const gallery =
    images.length > 0
      ? images.map((img: any) => img.image_url)
      : [row.image_url || FALLBACK_PRODUCT_IMAGE].filter(Boolean);

  return { image, gallery };
}

function mapVariantRow(pv: any): DbProduct {
  const { image, gallery } = resolveImages(pv);
  return {
    // CatalogueProduct fields
    code: pv.item_code,
    name: pv.name,
    dimensions: pv.dimension_notes || "",
    mrp: pv.mrp,
    is_on_sale: pv.is_on_sale || false,
    discount_price: pv.discount_price ?? null,
    finish: pv.finish || "",
    category: pv.category,
    categorySlug: slugify(pv.category),
    slug: slugify(pv.item_code),
    image,
    gallery,
    description: pv.description || "",
    material: pv.material || "",
    external_price_url: pv.external_price_url || null,
    stock_quantity: pv.stock_quantity ?? 0,
    track_inventory: pv.track_inventory ?? true,
    // DbProduct extras
    id: pv.id,                // variant UUID (backward-compat)
    variantId: pv.id,
    parentId: pv.product_id,
    product_line: pv.product_line,
  };
}

function fallbackOptionValues(pv: any): Record<string, string> {
  const values: Record<string, string> = {};
  const finish = pv.finish?.trim();
  const dimensions = pv.dimension_notes?.trim();

  if (finish) values.Finish = finish;
  if (dimensions && dimensions.toLowerCase() !== "contact for specifications") {
    values.Dimensions = dimensions;
  }

  return values;
}

function mapVariantToSelector(
  pv: any,
  optionValues: Record<string, string> = fallbackOptionValues(pv),
  optionOrder: string[] = Object.keys(optionValues)
): ProductVariant {
  const { image, gallery } = resolveImages(pv);
  return {
    id: pv.id,
    item_code: pv.item_code,
    finish: pv.finish || "",
    dimension_notes: pv.dimension_notes || "",
    mrp: pv.mrp,
    is_on_sale: pv.is_on_sale || false,
    discount_price: pv.discount_price ?? null,
    is_default: pv.is_default,
    is_active: pv.is_active,
    external_price_url: pv.external_price_url || null,
    image,
    gallery,
    slug: slugify(pv.item_code),
    optionValues,
    optionOrder,
    stock_quantity: pv.stock_quantity ?? 0,
    track_inventory: pv.track_inventory ?? true,
  };
}

function getReviewAuthorName(profile: any): string {
  const fullName = profile?.full_name?.trim();
  if (!fullName) return "Anonymous";

  const parts = fullName.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return fullName;
  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
}

/**
 * Returns all active default variants (one row per parent).
 *
 * Optional `productLine` filter restricts to a specific line — the
 * /kitchen page passes 'kitchen' so wardrobe SKUs don't leak in, and
 * /wardrobe passes 'wardrobe'. Omit for surfaces that want everything
 * (e.g. search, admin).
 *
 * `product_line` is denormalised onto `product_variants` (see
 * catalog-and-variants.md), so we filter on the variant column and
 * avoid a join.
 */
export async function getAllProducts(
  productLine?: "kitchen" | "wardrobe" | "hardware"
): Promise<DbProduct[]> {
  let query = supabaseAdmin
    .from("product_variants")
    .select("*, product_images(image_url, display_order, is_primary)")
    .eq("is_default", true)
    .eq("is_active", true);

  if (productLine) {
    query = query.eq("product_line", productLine);
  }

  const { data, error } = await query.order("catalogue_sno", {
    ascending: true,
    nullsFirst: false,
  });

  if (error) {
    console.error("getAllProducts failed:", error.message);
    return [];
  }

  return (data || []).map(mapVariantRow);
}

/**
 * Fetch specific variants by id, in the order the ids were given. Powers the
 * wishlist page, which stores saved variant ids and needs to render them
 * newest-first. Unlike the listing queries this does NOT filter on
 * is_default — a shopper can save any specific variant. Inactive variants are
 * dropped (a soft-deleted SKU shouldn't render as a live product card).
 */
export async function getProductsByVariantIds(ids: string[]): Promise<DbProduct[]> {
  if (!ids.length) return [];

  const { data, error } = await supabaseAdmin
    .from("product_variants")
    .select("*, product_images(image_url, display_order, is_primary)")
    .in("id", ids)
    .eq("is_active", true);

  if (error) {
    console.error("getProductsByVariantIds failed:", error.message);
    return [];
  }

  const mapped = (data || []).map(mapVariantRow);
  // Preserve caller order (the ids arrive newest-saved first).
  const order = new Map(ids.map((id, i) => [id, i]));
  return mapped.sort(
    (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)
  );
}

export async function getProductBySlug(slug: string): Promise<DbProduct | null> {
  // Slug is derived from item_code. Fetch the matching default variant.
  const all = await getAllProducts();
  return all.find((p) => p.slug === slug) || null;
}

/**
 * Active default variants that are currently on sale AND have a valid
 * discount_price set. Used by /deals.
 *
 * A variant is "on sale" only when `is_on_sale = true` AND
 * `discount_price` is not null AND `discount_price < mrp`. The final
 * check is a client-side filter because Postgres can't compare two
 * numeric columns cheaply through PostgREST — the row set is tiny so
 * this is fine.
 */
export async function getDiscountedProducts(): Promise<DbProduct[]> {
  const { data, error } = await supabaseAdmin
    .from("product_variants")
    .select("*, product_images(image_url, display_order, is_primary)")
    .eq("is_default", true)
    .eq("is_active", true)
    .eq("is_on_sale", true)
    .not("discount_price", "is", null)
    .order("catalogue_sno", { ascending: true, nullsFirst: false });

  if (error) {
    console.error("getDiscountedProducts failed:", error.message);
    return [];
  }

  return (data || [])
    .filter(
      (row: any) =>
        typeof row.mrp === "number" &&
        typeof row.discount_price === "number" &&
        row.discount_price < row.mrp
    )
    .map(mapVariantRow);
}

export async function getProductsByCategory(
  category: string
): Promise<DbProduct[]> {
  const { data, error } = await supabaseAdmin
    .from("product_variants")
    .select("*, product_images(image_url, display_order, is_primary)")
    .eq("is_default", true)
    .eq("is_active", true)
    .eq("category", category)
    .order("catalogue_sno", { ascending: true, nullsFirst: false });

  if (error) {
    console.error("getProductsByCategory failed:", error.message);
    return [];
  }

  return (data || []).map(mapVariantRow);
}

export async function getTopPicks(): Promise<DbProduct[]> {
  // is_featured is mirrored on product_variants from the parent during seed.
  const { data, error } = await supabaseAdmin
    .from("product_variants")
    .select("*, product_images(image_url, display_order, is_primary)")
    .eq("is_default", true)
    .eq("is_active", true)
    .eq("is_featured", true)
    .limit(4);

  if (error) {
    console.error("getTopPicks failed:", error.message);
    return [];
  }

  return (data || []).map(mapVariantRow);
}

/**
 * Returns ALL active variants for a parent product, used by the PDP
 * variant selector. Includes full image data per variant.
 */
export async function getProductVariants(
  parentId: string
): Promise<ProductVariant[]> {
  const { data, error } = await supabaseAdmin
    .from("product_variants")
    .select("*, product_images(image_url, display_order, is_primary)")
    .eq("product_id", parentId)
    .eq("is_active", true)
    .order("catalogue_sno", { ascending: true, nullsFirst: false });

  if (error) {
    console.error("getProductVariants failed:", error.message);
    return [];
  }

  const variantRows = data || [];
  if (variantRows.length === 0) return [];

  const { data: optionRows, error: optionError } = await supabaseAdmin
    .from("product_variant_options")
    .select(`
      id,
      name,
      display_order,
      product_variant_option_values(
        variant_id,
        value,
        display_order
      )
    `)
    .eq("product_id", parentId)
    .order("display_order", { ascending: true });

  if (optionError || !optionRows || optionRows.length === 0) {
    if (optionError) console.warn("getProductVariants options failed:", optionError.message);
    return variantRows.map((variant) => mapVariantToSelector(variant));
  }

  const optionOrder = optionRows.map((option: any) => option.name);
  const optionMap = new Map<string, Record<string, string>>();

  for (const option of optionRows as any[]) {
    const values = [...(option.product_variant_option_values || [])].sort(
      (a: any, b: any) => (a.display_order || 0) - (b.display_order || 0)
    );

    for (const value of values) {
      const current = optionMap.get(value.variant_id) || {};
      current[option.name] = value.value;
      optionMap.set(value.variant_id, current);
    }
  }

  return variantRows.map((variant) => {
    const optionValues = {
      ...fallbackOptionValues(variant),
      ...(optionMap.get(variant.id) || {}),
    };
    const order = [
      ...optionOrder,
      ...Object.keys(optionValues).filter((name) => !optionOrder.includes(name)),
    ];
    return mapVariantToSelector(variant, optionValues, order);
  });
}

// ─── Reviews (unchanged — still keyed by product_variants.id) ────

export async function getProductReviews(variantId: string) {
  const { data, error } = await supabaseAdmin
    .from("product_reviews")
    .select(`
      *,
      customer:profiles!product_reviews_profile_fkey(full_name, email)
    `)
    .eq("product_id", variantId)
    .eq("approval_status", "approved")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.warn("getProductReviews embed failed, falling back:", error.message);

    const { data: fallbackReviews, error: fallbackError } = await supabaseAdmin
      .from("product_reviews")
      .select("*")
      .eq("product_id", variantId)
      .eq("approval_status", "approved")
      .order("created_at", { ascending: false })
      .limit(20);

    if (fallbackError || !fallbackReviews) {
      console.error("getProductReviews fallback failed:", fallbackError?.message);
      return [];
    }

    const customerIds = [...new Set(fallbackReviews.map((review) => review.customer_id).filter(Boolean))];
    const { data: profiles } = customerIds.length > 0
      ? await supabaseAdmin
          .from("profiles")
          .select("id, full_name, email")
          .in("id", customerIds)
      : { data: [] };

    const profileMap = new Map((profiles || []).map((profile: any) => [profile.id, profile]));
    return fallbackReviews.map((review) => {
      const profile = profileMap.get(review.customer_id);
      return { ...review, authorName: getReviewAuthorName(profile) };
    });
  }

  return data.map((review) => {
    return { ...review, authorName: getReviewAuthorName(review.customer) };
  });
}

export async function getProductRatingSummary(variantId: string) {
  const { data, error } = await supabaseAdmin
    .from("product_reviews")
    .select("rating")
    .eq("product_id", variantId)
    .eq("approval_status", "approved");

  if (error || !data || data.length === 0) {
    return { average: 0, count: 0 };
  }

  const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
  return {
    average: Number((sum / data.length).toFixed(1)),
    count: data.length,
  };
}

// ─── Kept for backward-compat (used by admin/products/ProductsTable) ─
export function formatPrice(mrp: number | null): string {
  return typeof mrp === "number"
    ? `₹${mrp.toLocaleString("en-IN")}`
    : "Price on request";
}
