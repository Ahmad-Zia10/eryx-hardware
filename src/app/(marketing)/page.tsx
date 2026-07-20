import Link from "next/link";
import { Download, Globe, Award, Phone, ArrowRight } from "lucide-react";
import ProductImage from "@/components/ui/ProductImage";
import ProductCard from "@/components/sections/ProductCard";
import HeroSlider from "@/components/sections/HeroSlider";
import { CATALOG_CATEGORIES, IMAGES } from "@/lib/catalogue-data";
import { getAllProducts, getTopPicks } from "@/lib/db/products";
import { getPublishedPosts } from "@/lib/db/blog";
import { SITE_CONFIG } from "@/constants";
import FAQTeaser from "@/components/sections/FAQTeaser";
import BlogTeaser from "@/components/sections/BlogTeaser";
import FollowUsSection from "@/components/sections/FollowUsSection";

const FOCUS_CARDS = [
  {
    label: "Basket Systems",
    href: "/kitchen?category=Basket",
    image: "/products/basket/basket-1.jpg",
    large: true,
  },
  {
    label: "Glass Pull Down",
    href: "/kitchen?category=Glass Pull Down",
    image: "/products/glass-pull-down/glass-pull-down-5-lifestyle.jpg",
  },
  {
    label: "Rolling Shutter",
    href: "/kitchen?category=Rolling Shutter",
    image: "/products/rolling-shutter/rolling-shutter-2.jpg",
  },
  {
    label: "S Corner",
    href: "/kitchen?category=S Corner",
    image: "/products/s-corner/s-corner-3-lifestyle-collage.jpg",
  },
  {
    label: "Hinges",
    href: "/kitchen?category=Hinges",
    image: "/products/hinges-new/hinges-new-1.jpg",
  },
];

const TRUST_ITEMS = [
  { icon: Globe, title: "Pan India Delivery", subtitle: "All major cities covered" },
  { icon: Award, title: "Hardware Catalogue", subtitle: "Kitchen, wardrobe, fittings" },
  { icon: Phone, title: "Expert Support", subtitle: "70111 84853" },
];

// Server Component — no "use client" here. This now fetches real data
// directly from Supabase at render time, on the server, before any
// HTML reaches the browser. The only interactivity on this page (the
// two hero buttons) lives in the separate HeroActions client island
// imported above — everything else here is static markup + server data.
export default async function Home() {
  const topPicks = await getTopPicks();
  const blogPosts = await getPublishedPosts(2);

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

      <section className="bg-surface-sunken border-t border-b border-line py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-7 overflow-x-auto no-scrollbar lg:justify-center">
            {CATALOG_CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                href={`/kitchen?category=${encodeURIComponent(category.name)}`}
                className="flex flex-col items-center gap-2 min-w-28 shrink-0 group"
              >
                {/* Uniform treatment for mixed-crop source shots: white
                    well + contain + padding shows each product whole. */}
                <div className="w-20 h-20 rounded-pill border border-line overflow-hidden bg-white p-2.5 group-hover:border-gold group-hover:shadow-[0_8px_30px_rgba(212,160,23,0.25)] transition duration-200 ease-in-out">
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

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="font-heading text-3xl sm:text-4xl text-ink">
          Categories In Focus
        </h2>
        <p className="text-ink-muted mt-2">
          Explore Eryx hardware across kitchen, wardrobe, and modular furniture systems
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-4 lg:grid-rows-2 gap-4 mt-8">
          {FOCUS_CARDS.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className={`relative overflow-hidden rounded-card border border-line hover:border-gold shadow-sm hover:shadow-2xl hover:-translate-y-1 dark:hover:shadow-[0_16px_48px_rgba(212,160,23,0.15)] transition duration-300 ease-out cursor-pointer group min-h-55 ${
                card.large ? "lg:col-span-2 lg:row-span-2" : ""
              }`}
            >
              <ProductImage
                src={card.image}
                alt={card.label}
                className="absolute inset-0 w-full h-full min-h-55 transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              />
              {/* Solid dark scrim behind the label — the previous
                  gradient washed out over light product shots. */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent pt-10 p-4">
                <span className="font-semibold text-white block">{card.label}</span>
                <span className="text-gold text-sm inline-flex items-center gap-1">
                  View All
                  <ArrowRight
                    size={14}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-gold">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TRUST_ITEMS.map(({ icon: Icon, title, subtitle }) => (
              <div key={title} className="flex items-center gap-3">
                <Icon className="text-on-gold" size={24} />
                <div>
                  <p className="font-bold text-on-gold text-sm">{title}</p>
                  <p className="text-on-gold/70 text-xs">{subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between gap-4 mb-8">
          <h2 className="font-heading text-3xl sm:text-4xl text-ink">
            Top Picks
          </h2>
          <Link
            href="/kitchen"
            className="text-sm text-gold-deep hover:text-gold inline-flex items-center gap-1 transition-colors duration-200 shrink-0"
          >
            View all <ArrowRight size={14} />
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

      {/* Catalogue Download Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative overflow-hidden bg-brand-dark rounded-card px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Subtle background accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-pill -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-3 max-w-lg">
            <span className="text-xs tracking-[0.3em] uppercase text-gold">
              Product Catalogue
            </span>
            <h2 className="font-heading text-3xl text-white">
              Explore Our Complete Range
            </h2>
            <p className="text-sm text-white/60 leading-relaxed">
              Download our full product catalogue covering kitchen storage systems,
              wardrobe accessories, and hardware fittings — with specifications,
              dimensions, and pricing for every SKU.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <a
              href={SITE_CONFIG.catalogueUrl}
              download="Eryx-Hardware-Catalogue.pdf"
              className="flex items-center gap-3 bg-gold hover:bg-gold-bright text-on-gold font-semibold px-8 py-4 rounded-control transition duration-200 ease-in-out"
            >
              <Download size={18} />
              Download Catalogue
            </a>
            <div className="text-xs text-white/45 text-center">
              PDF · Free Download
            </div>
          </div>
        </div>
      </section>

      {blogPosts.length > 0 && <BlogTeaser posts={blogPosts} />}

      <FAQTeaser />

      <FollowUsSection />
    </div>
  );
}
