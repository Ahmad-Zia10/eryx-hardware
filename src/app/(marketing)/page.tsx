import Link from "next/link";
import { Shield, Globe, Award, Phone } from "lucide-react";
import ProductImage from "@/components/ui/ProductImage";
import ProductCard from "@/components/sections/ProductCard";
import HeroActions from "@/components/sections/HeroActions";
import { CATALOG_CATEGORIES, IMAGES } from "@/lib/catalogue-data";
import { getTopPicks } from "@/lib/db/products";

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
  { icon: Shield, title: "German Technology", subtitle: "SGS Certified Components" },
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

  return (
    <div>
      <section
        className="min-h-[calc(100vh-104px)] flex items-center relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 52%, #EBEBEB 100%)",
        }}
      >
        <style>{`
          .hero-bg-dark { background: linear-gradient(135deg, #0A0A0A 0%, #161616 52%, #0F0F0F 100%); }
        `}</style>
        <div className="absolute inset-0 hidden dark:block hero-bg-dark" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
          <div className="flex flex-col gap-6">
            <span className="text-xs tracking-[0.3em] uppercase text-[#D4A017]">
              A Division of Modular India
            </span>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight text-[#0A0A0A] dark:text-[#F5F5F5]">
              Precision
              <br />
              Hardware for
              <br />
              <span className="text-[#D4A017]">Modular Spaces</span>
            </h1>
            <p className="text-lg text-[#555555] dark:text-[#9A9A9A] max-w-lg">
              Hinges, fittings, sliding systems, baskets, pull-downs, shutters, and
              wardrobe hardware engineered for modern Indian homes.
            </p>

            <HeroActions />

            <div className="flex flex-wrap items-center gap-6 mt-6">
              {["8 Core Categories", "Real Product Photos", "Pan India"].map(
                (stat, index) => (
                  <div key={stat} className="flex items-center gap-6">
                    {index > 0 && (
                      <span className="h-8 w-px bg-[#D4D4D4] dark:bg-[#2A2A2A]" />
                    )}
                    <span className="text-sm text-[#555555] dark:text-[#9A9A9A]">
                      {stat}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="relative min-h-130 hidden md:block">
            <div className="absolute right-0 top-6 w-[78%] h-97.5 border-2 border-[#D4A017] bg-[#EBEBEB] dark:bg-[#1A1A1A] overflow-hidden">
              <ProductImage
                src={IMAGES.heroMain}
                alt="GTPT kitchen hardware"
                className="w-full h-full"
                loading="eager"
              />
            </div>
            <div className="absolute left-4 bottom-14 w-[46%] h-52.5 border-4 border-white dark:border-[#0A0A0A] bg-[#EBEBEB] dark:bg-[#1A1A1A] overflow-hidden shadow-xl">
              <ProductImage
                src={IMAGES.heroAlt}
                alt="Glass pull down hardware"
                className="w-full h-full"
                loading="eager"
              />
            </div>
            <div className="absolute right-10 bottom-0 w-[42%] h-45 border-4 border-white dark:border-[#0A0A0A] bg-[#EBEBEB] dark:bg-[#1A1A1A] overflow-hidden shadow-xl">
              <ProductImage
                src={IMAGES.heroTertiary}
                alt="S corner hardware"
                className="w-full h-full"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F5F5F5] dark:bg-[#141414] border-t border-b border-[#D4D4D4] dark:border-[#2A2A2A] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-7 overflow-x-auto no-scrollbar">
            {CATALOG_CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                href={`/kitchen?category=${encodeURIComponent(category.name)}`}
                className="flex flex-col items-center gap-2 min-w-28 shrink-0 group"
              >
                <div className="w-20 h-20 rounded-full border border-[#D4D4D4] dark:border-[#2A2A2A] overflow-hidden bg-white dark:bg-[#1A1A1A] group-hover:border-[#D4A017] transition duration-200 ease-in-out">
                  <ProductImage
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full"
                  />
                </div>
                <span className="text-xs text-[#555555] dark:text-[#9A9A9A] text-center">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-[#0A0A0A] dark:text-[#F5F5F5]">
          Categories In Focus
        </h2>
        <p className="text-[#555555] dark:text-[#9A9A9A] mt-2">
          Explore Eryx hardware across kitchen, wardrobe, and modular furniture systems
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-4 lg:grid-rows-2 gap-4 mt-8">
          {FOCUS_CARDS.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className={`relative overflow-hidden border border-[#D4D4D4] dark:border-[#2A2A2A] hover:border-[#D4A017] transition duration-200 ease-in-out cursor-pointer group min-h-55 ${
                card.large ? "lg:col-span-2 lg:row-span-2" : ""
              }`}
            >
              <ProductImage
                src={card.image}
                alt={card.label}
                className="absolute inset-0 w-full h-full min-h-55"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-4">
                <span className="font-semibold text-[#F5F5F5] block">{card.label}</span>
                <span className="text-[#D4A017] text-sm">View All →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[#D4A017]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_ITEMS.map(({ icon: Icon, title, subtitle }) => (
              <div key={title} className="flex items-center gap-3">
                <Icon className="text-[#0A0A0A]" size={24} />
                <div>
                  <p className="font-bold text-[#0A0A0A] text-sm">{title}</p>
                  <p className="text-[#0A0A0A]/70 text-xs">{subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-[#0A0A0A] dark:text-[#F5F5F5] mb-8">
          Top Picks
        </h2>
        {topPicks.length === 0 ? (
          <p className="text-[#555555] dark:text-[#9A9A9A]">
            Featured products coming soon.
          </p>
        ) : (
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {topPicks.map((product) => (
              <ProductCard
                key={product.slug}
                product={product}
                className="min-w-65 sm:min-w-70 w-65 sm:w-70 shrink-0"
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}