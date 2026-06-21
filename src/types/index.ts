// ─── Product Types ────────────────────────────────────────────────
export type ProductCategory =
  // ─── Kitchen ──────────────────────────────
  | "pantry-units"
  | "corner-units"
  | "bottle-pullouts"
  | "tall-units"
  | "rolling-shutters"
  | "dish-rack"
  | "drawer-organizers"
  | "waste-bins"
  | "wicker-baskets"
  // ─── Wardrobe ─────────────────────────────
  | "wardrobe-accessories-mocha"
  | "wardrobe-accessories-grey"
  // ─── Hardware ─────────────────────────────
  | "hinges"
  | "channels-quadro"
  | "sliding-fittings"
  | "slim-box"
  | "tandem"
  | "lift-up-mechanism"
  | "skirting-legs"
  | "bed-fittings"
  | "cabinet-accessories";

export type ProductLine = "kitchen" | "wardrobe" | "hardware";

export type ProductFinish =
  | "golden"
  | "chrome"
  | "dark-grey"
  | "glass"
  | "satin"
  | "wooden"
  | "black"
  | "white"
  | "stainless-steel";

export interface Product {
  id: string;
  item_code: string;
  name: string;
  description: string | null;
  category: ProductCategory;
  product_line: ProductLine;
  finish: ProductFinish | null;
  width_mm: number | null;
  depth_mm: number | null;
  height_mm: number | null;
  dimension_notes: string | null;
  mrp: number;
  is_featured: boolean;
  is_active: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  catalogue_sno: number | null;
  series: string | null;
  material: string | null;
  weight_capacity_kg: number | null;
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