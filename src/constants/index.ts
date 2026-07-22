import { NavLink } from "@/types";
import { CATALOG_CATEGORIES } from "@/lib/catalogue-data";

export const SITE_CONFIG = {
  name: "Eryx Hardware",
  tagline: "Precision Hardware for Modern Homes",
  description:
    "German-engineered kitchen and wardrobe hardware for the modern Indian home.",
  phone: "70111 84853",
  email: "Info@modularindia.com",
  website: "eryxhardware.com",
  division: "A Division of Modular India",
  socialLinks: {
    instagram: { handle: "@eryxhardware", url: "https://instagram.com/eryxhardware" },
    facebook: { handle: "@eryxhardware", url: "https://www.facebook.com/profile.php?id=61583317822029" },
    youtube: { handle: "@eryxhardware", url: "https://youtube.com/@eryxhardware" },
    linkedin: { handle: "@eryxhardware", url: "https://linkedin.com/company/eryxhardware" },
    pinterest: { handle: "@eryxhardware", url: "https://pin.it/oh2Qr3AZS" },
  } as const,
  catalogueUrl: "/catalogue/eryx-catalogue.pdf" as const,
} as const;

// Experience Centre / showroom details. Single source of truth for the
// /experience-centre page. Edit these values in one place — the page reads
// them all. `mapsQuery` is URL-encoded into a Google Maps directions link.
export const EXPERIENCE_CENTRE = {
  name: "Eryx Experience Centre",
  addressLines: [
    "E-70, Surajpur Site 4 Industrial Block H Rd",
    "Block P, Industrial Area, Surajpur Site 4",
    "Greater Noida, Uttar Pradesh 201310",
  ],
  // Human-readable single-line address (used for the maps query + schema).
  mapsQuery:
    "E-70, Surajpur Site 4 Industrial Block H Rd, Block P, Industrial Area, Surajpur Site 4, Greater Noida, Uttar Pradesh 201310",
  hours: [
    { days: "Monday – Saturday", time: "9:30 AM – 6:00 PM" },
    { days: "Sunday", time: "Closed" },
  ],
  phone: "70111 84853",
  email: "Info@modularindia.com",
} as const;

// Below this quantity a variant is flagged low-stock in the admin UI.
// Kept as a single global for v1 — per-variant thresholds can be added
// as an additive migration if needed later.
export const LOW_STOCK_THRESHOLD = 5;

export const SERVICEABLE_PINCODES = [
  "110", // Delhi NCR
  "400", // Mumbai
  "560", // Bangalore
  "500", // Hyderabad
  "600", // Chennai
  "411", // Pune
];

// Single source of truth for serviceability — shared by the PDP
// PincodeChecker and the checkout pincode field so the two never drift.
// Returns true only for a well-formed 6-digit pincode whose prefix is
// covered. Note: this is a client-side convenience gate, not a security
// boundary — real serviceability is confirmed by ops.
export function isServiceablePincode(pincode: string): boolean {
  if (!/^\d{6}$/.test(pincode)) return false;
  return SERVICEABLE_PINCODES.some((prefix) => pincode.startsWith(prefix));
}

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Kitchen Accessories", href: "/kitchen" },
  { label: "Wardrobe Accessories", href: "/wardrobe" },
  { label: "Deals & Offers", href: "/deals" },
  { label: "Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact" },
];

export const UTILITY_NAV_LINKS: NavLink[] = [
  { label: "Dealer Enquiry", href: "/dealer-enquiry" },
  { label: "Experience Centre", href: "/experience-centre", comingSoon: true },
];

// ─── PRODUCT CATEGORIES ──────────────────────────────────────────────
// NOTE: This used to be a separately maintained array here in
// constants/index.ts (the old 20-value catalogue-page taxonomy).
// It has been retired per project decision — CATALOG_CATEGORIES in
// catalogue-data.ts is now the single source of truth for categories,
// since it's directly tied to the verified product image mapping.
// Re-exporting it here so existing imports of `PRODUCT_CATEGORIES`
// from "@/constants" continue to work without touching every call site.
export const PRODUCT_CATEGORIES = CATALOG_CATEGORIES;

export type CategoryEntry = (typeof CATALOG_CATEGORIES)[number];
export type CategoryValue = CategoryEntry["slug"];

export const BRAND_HIGHLIGHTS = [
  {
    icon: "Globe",
    title: "Pan India Delivery",
    subtitle: "All major cities covered",
  },
  {
    icon: "Award",
    title: "200+ Products",
    subtitle: "Kitchen · Wardrobe · Hardware",
  },
  {
    icon: "Phone",
    title: "Expert Support",
    subtitle: SITE_CONFIG.phone,
  },
] as const;

// FAQ content moved to Supabase (faq_categories + faqs tables) via
// migration 20260720120000_faq_tables.sql — admins now manage FAQs at
// /admin/faqs and fetches happen through src/lib/db/faqs.ts.
