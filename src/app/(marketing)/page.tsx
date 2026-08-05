import Link from "next/link";
import { Download, ArrowRight, ShieldCheck, Truck, Award, MapPin } from "lucide-react";
import ProductImage from "@/components/ui/ProductImage";
import ProductCard from "@/components/sections/ProductCard";
import HeroSlider from "@/components/sections/HeroSlider";
import { type FocusPanel } from "@/components/sections/CategoriesFocus";
import CategoryGallery from "@/components/sections/CategoryGallery";
import { getAllProducts, getTopPicks } from "@/lib/db/products";
import { getFocusCategories, type ProductLine } from "@/lib/db/categories";
import { getPublishedPosts } from "@/lib/db/blog";
import { formatPrice } from "@/lib/pricing";
import { SITE_CONFIG } from "@/constants";
import FAQTeaser from "@/components/sections/FAQTeaser";
import BlogTeaser from "@/components/sections/BlogTeaser";
import FollowUsSection from "@/components/sections/FollowUsSection";

// Curated imagery for the "Categories in focus" filmstrip. Each entry
// is paired with a REAL category (productLine + category) so its live
// count and cheapest "from" price get matched on at render time — the
// images stay hand-picked, the numbers stay real. Only categories that
// have curated imagery appear here (a fuller strip → smoother drag);
// entries whose category isn't currently in the DB are dropped below.
const PRODUCT_LINE_HREF: Record<ProductLine, string> = {
  kitchen: "/kitchen",
  wardrobe: "/wardrobe",
  hardware: "/hardware",
};

type FocusCard = {
  label: string;
  category: string;
  productLine: ProductLine;
  image: string;
};

const FOCUS_CARDS: FocusCard[] = [
  { label: "Basket Systems", category: "Basket", productLine: "kitchen", image: "/products/basket/basket-1.jpg" },
  { label: "Glass Pull Down", category: "Glass Pull Down", productLine: "kitchen", image: "/products/glass-pull-down/glass-pull-down-5-lifestyle.jpg" },
  { label: "Rolling Shutter", category: "Rolling Shutter", productLine: "kitchen", image: "/products/rolling-shutter/rolling-shutter-2.jpg" },
  { label: "S-Corner & Carousels", category: "S Corner", productLine: "kitchen", image: "/products/s-corner/s-corner-3-lifestyle-collage.jpg" },
  { label: "GTPT Systems", category: "GTPT", productLine: "kitchen", image: "/products/gtpt/gtpt-3-lifestyle.jpg" },
  { label: "Slim Box Drawers", category: "Slim Box", productLine: "kitchen", image: "/products/gtpt/gtpt-4.jpg" },
  { label: "Hinges & Fittings", category: "Hinges", productLine: "hardware", image: "/products/hinges-new/hinges-new-1.jpg" },
  { label: "Channels & Slides", category: "Channels", productLine: "hardware", image: "/products/hinges-old/hinges-old-1.jpg" },
  { label: "Trouser Racks", category: "Trouser Rack", productLine: "wardrobe", image: "/products/trouser-rack/trouser-rack-1.jpg" },
  { label: "Wardrobe Baskets", category: "Baskets", productLine: "wardrobe", image: "/products/basket/basket-3-lifestyle.jpg" },
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
  const focusCategories = await getFocusCategories();

  // Match live count + cheapest "from" price onto each curated panel by
  // (productLine, category). Counts and prices stay REAL; images stay
  // curated. Cards whose category isn't currently live are dropped, so
  // the strip never shows an empty/zero panel.
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

      {/* Categories in focus — floating WebGL gallery (client island).
          Greyscale at rest, colour on the hovered card; light section
          surface, consistent with the rest of the page. */}
      <section className="bg-surface-sunken border-b-2 border-line-strong pt-14 sm:pt-16 pb-12 sm:pb-14 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Ruled section header — matches the other home sections. */}
          <div className="flex items-baseline justify-between gap-4 border-b-2 border-line-strong pb-3.5">
            <div className="flex items-baseline gap-4">
              <span className="text-sm font-extrabold text-gold">02</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.02em] text-ink">
                Categories in focus
              </h2>
            </div>
            <span className="hidden sm:block text-[11px] tracking-[0.16em] uppercase text-ink-faint">
              Drag or scroll · hover to reveal →
            </span>
          </div>
        </div>
        <div className="mt-8 sm:mt-10">
          <CategoryGallery panels={focusPanels} />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featured.slice(0, 4).map((product) => (
              <ProductCard key={product.slug} product={product} variant="lift" />
            ))}
          </div>
        )}
      </section>

      {/* Catalogue red poster — full-red statement band (Modernist). */}
      <section className="bg-gold text-on-gold">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col md:flex-row md:items-center justify-between gap-8">
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

      {/* Why Eryx — trust band. Three ruled cells of reassurance before
          the FAQ, closing the page with confidence. */}
      <section className="bg-surface-sunken border-t-2 border-b-2 border-line-strong">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-baseline gap-4 border-b-2 border-line-strong pb-3.5 mb-8">
            <span className="text-sm font-extrabold text-gold">05</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.02em] text-ink">
              Why Eryx
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-line border border-line">
            {[
              {
                icon: ShieldCheck,
                title: "German-engineered motion",
                body: "Soft-close hinges and runners rated for a lifetime of daily use.",
              },
              {
                icon: Truck,
                title: "Pan-India delivery",
                body: "Stocked SKUs shipped nationwide and tracked to your door.",
              },
              {
                icon: Award,
                title: "Trusted since 2016",
                body: "Specified by designers and modular builders across the country.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-surface-raised p-7">
                <div className="w-10 h-10 flex items-center justify-center border border-gold text-gold mb-4">
                  <Icon size={20} />
                </div>
                <h3 className="text-base font-extrabold tracking-[-0.01em] text-ink mb-1.5">
                  {title}
                </h3>
                <p className="text-sm text-ink-muted leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FAQTeaser />

      {/* Experience Centre invite — a real showroom CTA that closes the
          page with an in-person next step. */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] border border-line overflow-hidden">
          <div className="flex flex-col justify-center gap-3 p-8 md:p-12 bg-surface-raised">
            <span className="text-xs tracking-[0.2em] uppercase font-extrabold text-gold">
              Experience Centre
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-[-0.02em] text-ink leading-[1.05]">
              See the full range in person.
            </h2>
            <p className="text-sm text-ink-muted leading-relaxed max-w-md mt-1">
              Touch the finishes, test the soft-close, and plan your kitchen with
              our team at the Eryx Experience Centre.
            </p>
            <Link
              href="/experience-centre"
              className="mt-4 self-start inline-flex items-center gap-2 bg-gold hover:bg-gold-bright text-on-gold font-bold px-6 py-3.5 transition duration-200 ease-in-out"
            >
              <MapPin size={18} />
              Plan a visit
            </Link>
          </div>
          <div className="relative min-h-[240px] bg-surface-sunken">
            <ProductImage
              src="/products/hero/oak-marble-kitchen.jpg"
              alt="Eryx Experience Centre"
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </div>
      </section>

      <FollowUsSection />
    </div>
  );
}
