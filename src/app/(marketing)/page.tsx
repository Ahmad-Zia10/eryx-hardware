import HomeHero from "@/components/home/HomeHero";
import ProductLines from "@/components/home/ProductLines";
import CategoriesFocus, {
  type FocusPanel,
} from "@/components/home/CategoriesFocus";
import TopPicks from "@/components/home/TopPicks";
import Deals from "@/components/home/Deals";
import WhyEryx from "@/components/home/WhyEryx";
import HomeJournal from "@/components/home/HomeJournal";
import HomeFAQ from "@/components/home/HomeFAQ";
import ExperienceCentre from "@/components/home/ExperienceCentre";
import FollowUsSection from "@/components/sections/FollowUsSection";
import { getAllProducts, getTopPicks, getDiscountedProducts } from "@/lib/db/products";
import {
  getFocusCategories,
  getProductsOverview,
  type ProductLine,
} from "@/lib/db/categories";
import { getPublishedPosts } from "@/lib/db/blog";
import { formatPrice } from "@/lib/pricing";

// ─────────────────────────────────────────────────────────────────────
// Home page — re-innovated landing.
//
// Opens WARM (an editorial "front door") and settles into the flat
// Modernist system, so it connects seamlessly to the rest of the site.
// The whole page is wrapped in `.home-warm` (see globals.css): the warm
// sections consume `--warm-*` tokens + the editorial serif; the Modernist
// sections keep the standard `surface`/`ink`/`gold` tokens. Nothing
// outside this page gets `.home-warm`.
//
// Server Component — all data is fetched here at render time and passed
// down. The only interactivity (the hero scroll + category accordion)
// lives in small client islands.
//
// Section order (numbered index the sections render):
//   Hero → 01 Product lines → 02 Categories → 03 Top picks → 04 Deals
//   → 04/05 Why Eryx → 05 Journal → 06 FAQ → Follow us → Experience Centre
// ─────────────────────────────────────────────────────────────────────

// Curated imagery for the "Categories in focus" accordion. Each entry is
// paired with a REAL category (productLine + category) so its live count
// and cheapest "from" price get matched at render time — images stay
// hand-picked, numbers stay real. Cards whose category isn't currently
// live are dropped, so the accordion never shows an empty panel.
type FocusCard = {
  label: string;
  category: string;
  productLine: ProductLine;
  image: string;
};

const FOCUS_CARDS: FocusCard[] = [
  { label: "Basket Systems", category: "Basket", productLine: "kitchen", image: "/products/basket/basket-1.jpg" },
  { label: "Glass Pull Down", category: "Glass Pull Down", productLine: "kitchen", image: "/products/glass-pull-down/glass-pull-down-5-lifestyle.jpg" },
  { label: "Rolling Shutter", category: "Rolling Shutter", productLine: "kitchen", image: "/products/rolling-shutter/rolling-shutter-5.jpg" },
  { label: "S-Corner & Carousels", category: "S Corner", productLine: "kitchen", image: "/products/s-corner/s-corner-3-lifestyle-collage.jpg" },
  { label: "GTPT Systems", category: "GTPT", productLine: "kitchen", image: "/products/gtpt/gtpt-3-lifestyle.jpg" },
  { label: "Hinges & Fittings", category: "Hinges", productLine: "hardware", image: "/products/hinges-new/hinges-new-1.jpg" },
  { label: "Channels & Slides", category: "Channels", productLine: "hardware", image: "/products/hinges-old/hinges-old-1.jpg" },
  { label: "Trouser Racks", category: "Trouser Rack", productLine: "wardrobe", image: "/products/trouser-rack/trouser-rack-1.jpg" },
];

const PRODUCT_LINE_HREF: Record<ProductLine, string> = {
  kitchen: "/kitchen",
  wardrobe: "/wardrobe",
  hardware: "/hardware",
};

export default async function Home() {
  const [overview, focusCategories, topPicks, discounted, blogPosts] =
    await Promise.all([
      getProductsOverview(),
      getFocusCategories(),
      getTopPicks(),
      getDiscountedProducts(),
      getPublishedPosts(2),
    ]);

  // Match live count + cheapest "from" price onto each curated panel by
  // (productLine, category). Numbers stay REAL; images stay curated.
  const focusLookup = new Map(
    focusCategories.map((c) => [`${c.productLine}::${c.name}`, c] as const)
  );
  const focusPanels: FocusPanel[] = FOCUS_CARDS.flatMap((card) => {
    const match = focusLookup.get(`${card.productLine}::${card.category}`);
    if (!match || match.count === 0) return [];
    return [
      {
        label: card.label,
        href: `${PRODUCT_LINE_HREF[card.productLine]}?category=${encodeURIComponent(card.category)}`,
        image: card.image,
        count: match.count,
        fromPrice: match.minPrice !== null ? formatPrice(match.minPrice) : undefined,
      },
    ];
  });

  // Top picks — backfill with catalogue products so the row is always
  // full (a row of four with one or two cards looks abandoned).
  let featured = topPicks;
  if (featured.length < 4) {
    const all = await getAllProducts("kitchen");
    const have = new Set(featured.map((p) => p.slug));
    featured = [
      ...featured,
      ...all.filter((p) => !have.has(p.slug)).slice(0, 4 - featured.length),
    ];
  }

  return (
    <div className="home-warm">
      <HomeHero />
      <ProductLines lines={overview.lines} />
      <CategoriesFocus panels={focusPanels} />
      <TopPicks products={featured} />
      <Deals products={discounted} />
      <WhyEryx />
      <HomeJournal posts={blogPosts} />
      <HomeFAQ />
      <FollowUsSection />
      <ExperienceCentre />
    </div>
  );
}
