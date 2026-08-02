import Link from "next/link";
import { Download, ArrowRight } from "lucide-react";
import ProductImage from "@/components/ui/ProductImage";
import ProductCard from "@/components/sections/ProductCard";
import HeroSlider from "@/components/sections/HeroSlider";
import CategoriesFocus, { type FocusPanel } from "@/components/sections/CategoriesFocus";
import { CATALOG_CATEGORIES } from "@/lib/catalogue-data";
import { getAllProducts, getTopPicks } from "@/lib/db/products";
import { getCategoriesByProductLine } from "@/lib/db/categories";
import { getPublishedPosts } from "@/lib/db/blog";
import { SITE_CONFIG } from "@/constants";
import FAQTeaser from "@/components/sections/FAQTeaser";
import BlogTeaser from "@/components/sections/BlogTeaser";
import FollowUsSection from "@/components/sections/FollowUsSection";

// Curated lifestyle imagery for the "Categories in focus" filmstrip.
// Live product counts are matched onto these by category name at render
// time (see below) — the images stay hand-picked, the numbers stay real.
const FOCUS_CARDS: { label: string; category: string; href: string; image: string }[] = [
  {
    label: "Basket Systems",
    category: "Basket",
    href: "/kitchen?category=Basket",
    image: "/products/basket/basket-1.jpg",
  },
  {
    label: "Glass Pull Down",
    category: "Glass Pull Down",
    href: "/kitchen?category=Glass Pull Down",
    image: "/products/glass-pull-down/glass-pull-down-5-lifestyle.jpg",
  },
  {
    label: "Rolling Shutter",
    category: "Rolling Shutter",
    href: "/kitchen?category=Rolling Shutter",
    image: "/products/rolling-shutter/rolling-shutter-2.jpg",
  },
  {
    label: "S Corner",
    category: "S Corner",
    href: "/kitchen?category=S Corner",
    image: "/products/s-corner/s-corner-3-lifestyle-collage.jpg",
  },
  {
    label: "Hinges",
    category: "Hinges",
    href: "/kitchen?category=Hinges",
    image: "/products/hinges-new/hinges-new-1.jpg",
  },
];

// Modernist stat/trust strip — six ruled cells, last one inverted.
const STATS: { value: string; label: string; invert?: boolean }[] = [
  { value: "08", label: "Product lines" },
  { value: "180+", label: "SKUs in stock" },
  { value: "Pan-India", label: "Delivery network" },
  { value: "10yr", label: "Hardware warranty" },
  { value: "70111 84853", label: "Expert support" },
  { value: "Since 2016", label: "Est. quality", invert: true },
];

// Server Component — no "use client" here. This now fetches real data
// directly from Supabase at render time, on the server, before any
// HTML reaches the browser. The only interactivity on this page (the
// two hero buttons) lives in the separate HeroActions client island
// imported above — everything else here is static markup + server data.
export default async function Home() {
  const topPicks = await getTopPicks();
  const blogPosts = await getPublishedPosts(2);
  const categoryGroups = await getCategoriesByProductLine();

  // Match live product counts onto the curated filmstrip panels by
  // category name (kitchen line). Counts stay real; images stay curated.
  const kitchenCounts = new Map(
    (categoryGroups.find((g) => g.productLine === "kitchen")?.categories ?? []).map(
      (c) => [c.name, c.count] as const
    )
  );
  const focusPanels: FocusPanel[] = FOCUS_CARDS.map((c) => ({
    label: c.label,
    href: c.href,
    image: c.image,
    count: kitchenCounts.get(c.category),
  }));

  // The section looks abandoned with one or two cards floating in a
  // row of four — backfill with catalogue products so it always shows
  // a full row. Featured picks keep their lead positions.
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
    <div>
      <HeroSlider />

      {/* Category index strip — flat square wells, red hover. Product
          thumbnails are specific SKUs → shown in COLOR. */}
      <section className="bg-surface-sunken border-b-2 border-line-strong py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-7 overflow-x-auto no-scrollbar lg:justify-center">
            {CATALOG_CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                href={`/products?category=${encodeURIComponent(category.name)}`}
                className="flex flex-col items-center gap-2 min-w-28 shrink-0 group"
              >
                {/* Uniform treatment for mixed-crop source shots: white
                    well + contain + padding shows each product whole. */}
                <div className="w-20 h-20 border border-line overflow-hidden bg-surface-raised p-2.5 group-hover:border-gold transition duration-200 ease-in-out">
                  <ProductImage
                    src={category.image}
                    alt={category.name}
                    fit="contain"
                    className="w-full h-full"
                  />
                </div>
                <span className="text-xs text-ink-muted group-hover:text-gold-deep text-center transition-colors duration-200">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stat / trust strip — six ruled cells, last one inverted. */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border-b-2 border-line-strong">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className={`px-4 py-5 border-r border-line last:border-r-0 ${
              stat.invert
                ? "bg-brand-dark text-brand-cream flex flex-col justify-center"
                : ""
            }`}
          >
            {stat.invert ? (
              <>
                <div className="text-[11px] tracking-[0.14em] uppercase text-gold-bright">
                  {stat.label}
                </div>
                <div className="text-base font-extrabold mt-1">{stat.value}</div>
              </>
            ) : (
              <>
                <div className="text-2xl font-extrabold tracking-[-0.02em] text-ink">
                  {stat.value}
                </div>
                <div className="text-xs text-ink-muted mt-0.5">{stat.label}</div>
              </>
            )}
          </div>
        ))}
      </section>

      {/* Categories in focus — draggable filmstrip (client island). */}
      <CategoriesFocus panels={focusPanels} />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Ruled section header: red kicker + title + link, 2px rule. */}
        <div className="flex items-baseline justify-between gap-4 border-b-2 border-line-strong pb-3.5 mb-7">
          <div className="flex items-baseline gap-4">
            <span className="text-sm font-extrabold text-gold">03</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.02em] text-ink">
              Top picks
            </h2>
          </div>
          <Link
            href="/kitchen"
            className="text-sm font-bold text-gold-deep hover:text-gold inline-flex items-center gap-1 transition-colors duration-200 shrink-0"
          >
            Shop kitchen <ArrowRight size={14} />
          </Link>
        </div>
        {featured.length === 0 ? (
          <p className="text-ink-muted">Featured products coming soon.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.slice(0, 4).map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Catalogue red poster — full-red statement band (Modernist). */}
      <section className="bg-gold text-on-gold">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <span className="text-xs tracking-[0.2em] uppercase font-extrabold text-on-gold/75">
              Product catalogue
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-[1] tracking-[-0.02em] mt-3.5">
              Explore the complete range.
            </h2>
            <p className="text-sm text-on-gold/85 leading-relaxed mt-4 max-w-xl">
              Specifications, dimensions and pricing for every SKU across kitchen,
              wardrobe and hardware fittings.
            </p>
          </div>

          <a
            href={SITE_CONFIG.catalogueUrl}
            download="Eryx-Hardware-Catalogue.pdf"
            className="shrink-0 self-start md:self-auto inline-flex items-center gap-2.5 bg-brand-cream text-ink font-bold px-7 py-4 hover:bg-surface-raised transition duration-200 ease-in-out whitespace-nowrap"
          >
            <Download size={18} />
            Download catalogue
          </a>
        </div>
      </section>

      {blogPosts.length > 0 && <BlogTeaser posts={blogPosts} />}

      <FAQTeaser />

      <FollowUsSection />
    </div>
  );
}
