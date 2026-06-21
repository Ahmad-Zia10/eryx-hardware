import { NavLink } from "@/types";

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
  { label: "About Us", href: "/about-us" },
  { label: "Kitchen Solutions", href: "/kitchen" },
  { label: "Wardrobe Solutions", href: "/wardrobe", comingSoon: true },
  { label: "Deals & Offers", href: "/deals", comingSoon: true },
  { label: "Contact Us", href: "/contact" },
];

export const UTILITY_NAV_LINKS: NavLink[] = [
  { label: "Dealer Enquiry", href: "/dealer-enquiry" },
  { label: "Experience Centre", href: "/experience-centre", comingSoon: true },
//   { label: "Track Order", href: "/track-order", comingSoon: true },
];

export const PRODUCT_CATEGORIES = [
  // ─── Kitchen ──────────────────────────────────────────────────
  {
    label: "Pantry Units",
    value: "pantry-units",
    icon: "Package",
    line: "kitchen",
  },
  {
    label: "Corner Units",
    value: "corner-units",
    icon: "LayoutGrid",
    line: "kitchen",
  },
  {
    label: "Bottle Pull-Outs",
    value: "bottle-pullouts",
    icon: "Columns",
    line: "kitchen",
  },
  {
    label: "Tall Units",
    value: "tall-units",
    icon: "AlignJustify",
    line: "kitchen",
  },
  {
    label: "Rolling Shutters",
    value: "rolling-shutters",
    icon: "PanelRight",
    line: "kitchen",
  },
  {
    label: "Dish Rack",
    value: "dish-rack",
    icon: "UtensilsCrossed",
    line: "kitchen",
  },
  {
    label: "Drawer Organizers",
    value: "drawer-organizers",
    icon: "Layers",
    line: "kitchen",
  },
  {
    label: "Waste Bins",
    value: "waste-bins",
    icon: "Trash2",
    line: "kitchen",
  },
  {
    label: "Wicker Baskets",
    value: "wicker-baskets",
    icon: "ShoppingBasket",
    line: "kitchen",
  },
  // ─── Wardrobe ─────────────────────────────────────────────────
  {
    label: "Wardrobe Accessories Mocha",
    value: "wardrobe-accessories-mocha",
    icon: "Shirt",
    line: "wardrobe",
  },
  {
    label: "Wardrobe Accessories Grey",
    value: "wardrobe-accessories-grey",
    icon: "Shirt",
    line: "wardrobe",
  },
  // ─── Hardware ─────────────────────────────────────────────────
  {
    label: "Hinges",
    value: "hinges",
    icon: "Settings2",
    line: "hardware",
  },
  {
    label: "Channels & Quadro",
    value: "channels-quadro",
    icon: "SlidersHorizontal",
    line: "hardware",
  },
  {
    label: "Sliding Fittings",
    value: "sliding-fittings",
    icon: "MoveHorizontal",
    line: "hardware",
  },
  {
    label: "Slim Box",
    value: "slim-box",
    icon: "Square",
    line: "hardware",
  },
  {
    label: "Tandem",
    value: "tandem",
    icon: "Layers",
    line: "hardware",
  },
  {
    label: "Lift Up Mechanism",
    value: "lift-up-mechanism",
    icon: "ArrowUpFromLine",
    line: "hardware",
  },
  {
    label: "Skirting & Legs",
    value: "skirting-legs",
    icon: "AlignVerticalJustifyStart",
    line: "hardware",
  },
  {
    label: "Bed Fittings",
    value: "bed-fittings",
    icon: "BedDouble",
    line: "hardware",
  },
  {
    label: "Cabinet Accessories",
    value: "cabinet-accessories",
    icon: "Box",
    line: "hardware",
  },
] as const;

export type CategoryEntry = (typeof PRODUCT_CATEGORIES)[number];
export type CategoryValue = CategoryEntry["value"];
export type CategoryLine = CategoryEntry["line"];

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