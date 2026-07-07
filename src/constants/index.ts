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
  // NOTE: placeholder handles — real URLs to be updated once confirmed
  socialLinks: {
    instagram: { handle: "@eryxhardware", url: "https://instagram.com/eryxhardware" },
    facebook: { handle: "@eryxhardware", url: "https://facebook.com/eryxhardware" },
    youtube: { handle: "@eryxhardware", url: "https://youtube.com/@eryxhardware" },
    linkedin: { handle: "@eryxhardware", url: "https://linkedin.com/company/eryxhardware" },
    pinterest: { handle: "@eryxhardware", url: "https://pinterest.com/eryxhardware" },
  } as const,
  // Place the real PDF at public/catalogue/eryx-catalogue.pdf
  catalogueUrl: "/catalogue/eryx-catalogue.pdf" as const,
} as const;

export const SERVICEABLE_PINCODES = [
  "110", // Delhi NCR
  "400", // Mumbai
  "560", // Bangalore
  "500", // Hyderabad
  "600", // Chennai
  "411", // Pune
];

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Kitchen Accessories", href: "/kitchen" },
  { label: "Wardrobe Accessories", href: "/wardrobe", comingSoon: true },
  { label: "Deals & Offers", href: "/deals", comingSoon: true },
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

export const FAQS = [
  {
    category: "Products",
    questions: [
      {
        q: "What materials are used in Eryx kitchen hardware?",
        a: "All Eryx hardware uses German-engineered steel components certified by SGS, with finishes available in Golden, Chrome, Dark Grey, Satin, and Glass options.",
      },
      {
        q: "Do you offer products for both modular kitchens and wardrobes?",
        a: "Yes, Eryx offers a complete range covering kitchen storage systems, wardrobe accessories, and hardware fittings.",
      },
      {
        q: "Are dimensions listed per product?",
        a: "Yes, every product listing includes exact dimensions in millimetres and a full specification table.",
      },
    ],
  },
  {
    category: "Orders & Delivery",
    questions: [
      {
        q: "Which areas do you deliver to?",
        a: "We deliver pan India. Use the pincode checker on any product page to confirm serviceability to your specific area.",
      },
      {
        q: "How long does delivery take?",
        a: "Standard delivery takes 5-7 business days. Delivery timelines may vary for remote areas.",
      },
      {
        q: "Can I track my order?",
        a: "Yes, once your order is shipped you will receive a tracking link via email at the address used during checkout.",
      },
    ],
  },
  {
    category: "Payments",
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept UPI, net banking, credit/debit cards, and EMI options through our secure Razorpay payment gateway.",
      },
      {
        q: "Is it safe to pay on this website?",
        a: "Yes, all payments are processed through Razorpay with bank-grade encryption. We do not store any card details.",
      },
      {
        q: "Can I get an invoice for my order?",
        a: "Yes, a GST invoice is generated for every order and sent to your registered email address.",
      },
    ],
  },
  {
    category: "Returns & Support",
    questions: [
      {
        q: "What is the return policy?",
        a: "We accept returns for manufacturing defects within 7 days of delivery. Please contact us with photographs of the issue.",
      },
      {
        q: "How do I contact support?",
        a: "Call us at 70111 84853 or email Info@modularindia.com. Our team is available Monday to Saturday, 9:30 AM to 6 PM.",
      },
    ],
  },
] as const;
