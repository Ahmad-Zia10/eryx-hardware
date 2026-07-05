import Link from "next/link";
import { Shield, Globe, Award, Phone, Instagram, Facebook, Youtube, Linkedin, Download } from "lucide-react";
import ProductImage from "@/components/ui/ProductImage";
import ProductCard from "@/components/sections/ProductCard";
import HeroActions from "@/components/sections/HeroActions";
import { CATALOG_CATEGORIES, IMAGES } from "@/lib/catalogue-data";
import { getTopPicks } from "@/lib/db/products";
import { SITE_CONFIG } from "@/constants";

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

        <div className="absolute inset-0 overflow-hidden">
          <ProductImage
            src="/products/s-corner/s-corner-3-lifestyle-collage.jpg"
            alt=""
            className="w-full h-full opacity-10 dark:opacity-[0.07] blur-sm scale-105"
            loading="eager"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
          <div className="flex flex-col gap-6">
            <span className="text-xs tracking-[0.3em] uppercase text-[#D4A017]">
              A Division of Modular India
            </span>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight text-[#0A0A0A] dark:text-[#F5F5F5]">
              Precision
              <br />
              Hardware for
              <br />
              <span className="bg-gradient-to-r from-[#D4A017] to-[#E8B820] bg-clip-text text-transparent">Modular Spaces</span>
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
                <div className="w-20 h-20 rounded-full border border-[#D4D4D4] dark:border-[#2A2A2A] overflow-hidden bg-white dark:bg-[#1A1A1A] group-hover:border-[#D4A017] group-hover:shadow-[0_8px_30px_rgba(212,160,23,0.25)] transition duration-200 ease-in-out">
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
              className={`relative overflow-hidden border border-[#D4D4D4] dark:border-[#2A2A2A] hover:border-[#D4A017] group-hover:shadow-[0_8px_40px_rgba(0,0,0,0.15)] dark:group-hover:shadow-[0_8px_40px_rgba(212,160,23,0.1)] transition duration-200 ease-in-out cursor-pointer group min-h-55 ${
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
          <div className="mt-6 pt-6 border-t border-[#B8860B] flex justify-center">
            <a
              href={SITE_CONFIG.catalogueUrl}
              download="Eryx-Hardware-Catalogue.pdf"
              className="flex items-center gap-2 text-sm font-semibold text-[#0A0A0A] hover:underline"
            >
              <Download size={16} />
              Download Product Catalogue (PDF)
            </a>
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

      <section className="bg-[#F7F5F2] dark:bg-[#141414] border-t border-[#E8E4DD] dark:border-[#2A2A2A] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-serif text-2xl text-[#1A1A1A] dark:text-[#F5F5F5]">
              Follow Us
            </h2>
            <p className="text-sm text-[#6B6B6B] dark:text-[#9A9A9A] mt-2">
              Stay updated on new product launches, upcoming events and exhibition updates
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {(Object.entries(SITE_CONFIG.socialLinks) as [string, { handle: string; url: string }][]).map(([platform, { handle, url }]) => (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-[#1A1A1A] border border-[#E8E4DD] dark:border-[#2A2A2A] hover:border-[#D4A017] hover:shadow-md transition duration-200 ease-in-out rounded-sm group"
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#F7F5F2] dark:bg-[#2A2A2A] group-hover:bg-[#D4A017]/10 transition duration-200 ease-in-out text-[#1A1A1A] dark:text-[#F5F5F5]">
                  {platform === 'instagram' && <Instagram size={22} />}
                  {platform === 'facebook' && <Facebook size={22} />}
                  {platform === 'youtube' && <Youtube size={22} />}
                  {platform === 'linkedin' && <Linkedin size={22} />}
                  {platform === 'pinterest' && (
                    <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] fill-current">
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                    </svg>
                  )}
                </div>
                <span className="text-xs text-[#6B6B6B] dark:text-[#9A9A9A] text-center">
                  {handle}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}