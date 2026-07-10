import { supabase } from "@/lib/supabase";
import type { CatalogueProduct } from "@/lib/catalogue-data";

// ─────────────────────────────────────────────────────────────────
// This is the real, Supabase-backed replacement for the static
// functions in catalogue-data.ts. Function names and return shapes
// intentionally mirror that file (getProductBySlug, getProductsBy-
// Category, getTopPicks, etc.) so the already-working page components
// (Home, Kitchen, ProductDetail) need only a one-line import change
// to switch from static data to the real database — no JSX changes.
//
// DbProduct extends CatalogueProduct rather than duplicating its
// fields, so the two stay structurally identical by construction —
// ProductCard and every other component typed against
// CatalogueProduct accepts a DbProduct without any cast or drift risk.
// ─────────────────────────────────────────────────────────────────

export interface DbProduct extends CatalogueProduct {
  id: string;
  external_price_url?: string | null;
}

// Maps a raw Supabase row (snake_case, matches the `products` +
// `product_images` tables) into the same shape the ported components
// already expect from catalogue-data.ts's CatalogueProduct.
function mapRow(row: any): DbProduct {
  const images = (row.product_images || [])
    .sort((a: any, b: any) => a.display_order - b.display_order);

  const primaryImage =
    images.find((img: any) => img.is_primary)?.image_url ||
    images[0]?.image_url ||
    row.image_url ||
    "";

  const gallery =
    images.length > 0
      ? images.map((img: any) => img.image_url)
      : [row.image_url].filter(Boolean);

  return {
    id: row.id,
    code: row.item_code,
    name: row.name,
    dimensions: row.dimension_notes || "",
    mrp: row.mrp,
    is_on_sale: row.is_on_sale || false,
    discount_price: row.discount_price ?? null,
    finish: row.finish || "",
    category: row.category,
    categorySlug: slugify(row.category),
    slug: slugify(row.item_code),
    image: primaryImage,
    gallery,
    description: row.description || "",
    material: row.material || "",
    external_price_url: row.external_price_url || null,
  };
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const PRODUCT_SELECT = "*, product_images(image_url, display_order, is_primary)";

export async function getAllProducts(): Promise<DbProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .order("catalogue_sno", { ascending: true });

  if (error) {
    console.error("getAllProducts failed:", error.message);
    return [];
  }

  return (data || []).map(mapRow);
}

export async function getProductBySlug(slug: string): Promise<DbProduct | null> {
  // item_code isn't stored pre-slugified, so we fetch active products
  // and match in application code rather than querying by a derived
  // value the database doesn't have a column for. For 82-200 rows this
  // is fine; if the catalogue grows much larger, add a generated
  // `slug` column with an index instead of filtering client-side.
  const all = await getAllProducts();
  return all.find((p) => p.slug === slug) || null;
}

export async function getProductsByCategory(
  category: string
): Promise<DbProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .eq("category", category)
    .order("catalogue_sno", { ascending: true });

  if (error) {
    console.error("getProductsByCategory failed:", error.message);
    return [];
  }

  return (data || []).map(mapRow);
}

export async function getTopPicks(): Promise<DbProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .eq("is_featured", true)
    .limit(4);

  if (error) {
    console.error("getTopPicks failed:", error.message);
    return [];
  }

  return (data || []).map(mapRow);
}

export function formatPrice(mrp: number | null): string {
  return typeof mrp === "number" ? `₹${mrp.toLocaleString("en-IN")}` : "Price on request";
}

function getReviewAuthorName(profile: any): string {
  const fullName = profile?.full_name?.trim();
  if (!fullName) return "Anonymous";

  const parts = fullName.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return fullName;
  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
}

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

export async function getProductRatingSummary(productId: string) {
  const { data, error } = await supabase
    .from("product_reviews")
    .select("rating")
    .eq("product_id", productId);

  if (error || !data || data.length === 0) {
    return { average: 0, count: 0 };
  }

  const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
  return {
    average: Number((sum / data.length).toFixed(1)),
    count: data.length,
  };
}
