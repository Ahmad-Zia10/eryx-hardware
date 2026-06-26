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
} as const;

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Kitchen Accessories", href: "/kitchen" },
  { label: "Wardrobe Accessories", href: "/wardrobe", comingSoon: true },
  { label: "Deals & Offers", href: "/deals", comingSoon: true },
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
    icon: "Shield",
    title: "German Technology",
    subtitle: "SGS Certified Components",
  },
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