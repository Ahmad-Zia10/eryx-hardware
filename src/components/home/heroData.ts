// Home hero slide data.
//
// Hardcoded for now (typed array) — structured so a future admin/CMS
// swap is a one-function change: replace this constant with a fetch that
// returns HeroSlide[]. See `.claude/home-reinnovation-plan.md` (deferred
// "Hero admin CMS").
//
// Images are self-hosted Eryx hero photography under /public/products/hero/.

export type HeroSlide = {
  /** Two-digit index shown in the kicker, e.g. "01". */
  n: string;
  /** Small tracked eyebrow above the headline. */
  eyebrow: string;
  /** Category pill label. */
  pill: string;
  /** The slide headline (editorial serif). */
  title: string;
  /** CTA label. */
  cta: string;
  /** CTA destination (internal route). */
  href: string;
  /** Self-hosted hero image path. */
  image: string;
};

export const HERO_SLIDES: HeroSlide[] = [
  {
    n: "01",
    eyebrow: "Kitchen systems",
    pill: "Kitchen",
    title: "Fittings you never think about.",
    cta: "Shop kitchen",
    href: "/kitchen",
    image: "/products/hero/oak-marble-kitchen.jpg",
  },
  {
    n: "02",
    eyebrow: "Wardrobe fittings",
    pill: "Wardrobe",
    title: "Every drawer, aligned to the millimetre.",
    cta: "Shop wardrobe",
    href: "/wardrobe",
    image: "/products/hero/graphite-marble-kitchen.jpg",
  },
  {
    n: "03",
    eyebrow: "German-engineered",
    pill: "Hardware",
    title: "The motion behind the modern home.",
    cta: "Shop hardware",
    href: "/hardware",
    image: "/products/hero/slide-1-modular-kitchen.jpg",
  },
];
