import Link from "next/link";
import { Shield, Globe, Award, Phone, Download } from "lucide-react";
import ProductImage from "@/components/ui/ProductImage";
import ProductCard from "@/components/sections/ProductCard";
import HeroSlider from "@/components/sections/HeroSlider";
import { CATALOG_CATEGORIES, IMAGES } from "@/lib/catalogue-data";
import { getTopPicks } from "@/lib/db/products";
import { getPublishedPosts } from "@/lib/db/blog";
import { SITE_CONFIG } from "@/constants";
import {
  InstagramIcon,
  FacebookIcon,
  YoutubeIcon,
  LinkedinIcon,
  PinterestIcon,
} from "@/components/ui/SocialIcons";
import FAQTeaser from "@/components/sections/FAQTeaser";
import BlogTeaser from "@/components/sections/BlogTeaser";

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
  const blogPosts = await getPublishedPosts(2);

  return (
    <div>
      <HeroSlider />

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
              className={`relative overflow-hidden border border-[#D4D4D4] dark:border-[#2A2A2A] hover:border-[#D4A017] shadow-sm hover:shadow-2xl hover:-translate-y-1 dark:hover:shadow-[0_16px_48px_rgba(212,160,23,0.15)] transition duration-200 ease-in-out cursor-pointer group min-h-55 ${
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

      {/* Catalogue Download Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative overflow-hidden bg-[#1A1A1A] dark:bg-[#141414] border border-[#2A2A2A] rounded-sm px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Subtle background accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4A017]/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-3 max-w-lg">
            <span className="text-xs tracking-[0.3em] uppercase text-[#D4A017]">
              Product Catalogue
            </span>
            <h2 className="font-serif text-3xl text-[#F5F5F5]">
              Explore Our Complete Range
            </h2>
            <p className="text-sm text-[#9A9A9A] leading-relaxed">
              Download our full product catalogue covering kitchen storage systems,
              wardrobe accessories, and hardware fittings — with specifications,
              dimensions, and pricing for every SKU.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <a
              href={SITE_CONFIG.catalogueUrl}
              download="Eryx-Hardware-Catalogue.pdf"
              className="flex items-center gap-3 bg-[#D4A017] hover:bg-[#E8B820] text-[#0A0A0A] font-semibold px-8 py-4 transition duration-200 ease-in-out"
            >
              <Download size={18} />
              Download Catalogue
            </a>
            <div className="text-xs text-[#6B6B6B] text-center">
              PDF · Free Download
            </div>
          </div>
        </div>
      </section>

      {blogPosts.length > 0 && <BlogTeaser posts={blogPosts} />}

      <FAQTeaser />

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
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#F7F5F2] dark:bg-[#2A2A2A] group-hover:scale-110 transition-transform duration-200">
                  {platform === 'instagram' && <InstagramIcon size={28} />}
                  {platform === 'facebook' && <FacebookIcon size={28} />}
                  {platform === 'youtube' && <YoutubeIcon size={28} />}
                  {platform === 'linkedin' && <LinkedinIcon size={28} />}
                  {platform === 'pinterest' && <PinterestIcon size={28} />}
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