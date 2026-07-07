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

export async function getProductReviews(productId: string) {
  const { data, error } = await supabase
    .from("product_reviews")
    .select(`
      *,
      customer:profiles!customer_id(first_name, last_name)
    `)
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("getProductReviews failed:", error.message);
    return [];
  }

  // To match the UI requirement "first name + last initial":
  return data.map((review) => {
    let authorName = "Anonymous";
    if (review.customer) {
      const { first_name, last_name } = review.customer;
      if (first_name) {
        authorName = last_name ? `${first_name} ${last_name.charAt(0)}.` : first_name;
      }
    }
    return {
      ...review,
      authorName,
    };
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
