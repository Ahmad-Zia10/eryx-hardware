// ─── Product Types ────────────────────────────────────────────────
// CATEGORY TAXONOMY — updated to match the verified Drive-folder
// mapping from the ported frontend, replacing the original 20-value
// catalogue-page taxonomy. These 8 values are now the single source
// of truth across data, filtering, and the database.
export type ProductCategory =
  | "Basket"
  | "Glass Pull Down"
  | "GTPT"
  | "Hinges"
  | "Rolling Shutter"
  | "S Corner"
  | "Trouser Rack";

// ProductLine is retained for now as a broader grouping (kitchen vs
// wardrobe vs hardware) since the 7 categories above span all three —
// e.g. "Trouser Rack" is wardrobe, "GTPT" is kitchen, "Hinges" is
// hardware. This mapping is needed wherever we want to group by line
// (nav structure, mega-menu sections) without losing the fine-grained
// category for filtering/display.
export type ProductLine = "kitchen" | "wardrobe" | "hardware";

export const CATEGORY_TO_LINE: Record<ProductCategory, ProductLine> = {
  Basket: "kitchen",
  "Glass Pull Down": "kitchen",
  GTPT: "kitchen",
  "Rolling Shutter": "kitchen",
  Hinges: "hardware",
  "S Corner": "hardware",
  "Trouser Rack": "wardrobe",
};

export type ProductFinish =
  | "Golden"
  | "Chrome"
  | "Dark Grey"
  | "Glass"
  | "Satin"
  | "Wooden"
  | "Mocha"
  | "Grey"
  | "Steel";

export interface Product {
  id: string;
  item_code: string; // matches `code` in catalogue-data.ts
  catalogue_sno: number | null;
  name: string;
  description: string | null;
  series: string | null;
  material: string | null;
  category: ProductCategory;
  product_line: ProductLine;
  finish: ProductFinish | null;
  weight_capacity_kg: number | null;
  width_mm: number | null;
  depth_mm: number | null;
  height_mm: number | null;
  dimension_notes: string | null;
  mrp: number | null; // FLAG 2 FIX — see note below, was `number`
  is_featured: boolean;
  is_active: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Enquiry Types ─────────────────────────────────────────────────
export type EnquiryType = "product" | "dealer" | "bulk" | "general";
export type EnquiryStatus = "new" | "contacted" | "resolved" | "closed";

export interface Enquiry {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  city: string;
  message: string | null;
  enquiry_type: EnquiryType;
  status: EnquiryStatus;
  product_id: string | null;
  product_name: string | null;
  created_at: string;
}

// ─── Blog Types ────────────────────────────────────────────────────
export type BlogStatus = "draft" | "published";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  status: BlogStatus;
  published_at: string | null;
  created_at: string;
}

// ─── Navigation Types ──────────────────────────────────────────────
export interface NavLink {
  label: string;
  href: string;
  comingSoon?: boolean;
}

// ─── API Response Types ────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ─── Filter Types ──────────────────────────────────────────────────
export interface ProductFilters {
  category?: ProductCategory;
  finish?: ProductFinish;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}