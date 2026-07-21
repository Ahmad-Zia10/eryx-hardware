import Link from "next/link";
import { getAllProducts } from "@/lib/db/products";
import ProductCard from "@/components/sections/ProductCard";
import ProductImage from "@/components/ui/ProductImage";
import { IMAGES } from "@/lib/catalogue-data";

// Product-line listing for hardware (hinges, channels, fittings). Mirrors the
// /wardrobe page structure — a clean grid over the hardware product_line. When
// hardware SKUs grow we can share a generic ProductLineListing with the other
// lines; for now the parallel page keeps routing correct and ships fast.
export const revalidate = 60;

export const metadata = {
  title: "Hardware Accessories — Eryx Hardware",
  description:
    "Precision hinges, channels, and fittings engineered for modular kitchens and wardrobes.",
};

export default async function HardwarePage() {
  const products = await getAllProducts("hardware");

  return (
    <main>
      {/* Hero — mirrors the /kitchen and /wardrobe page heroes */}
      <section className="relative h-[55vh] min-h-[420px] overflow-hidden mt-4 bg-[#0A0A0A]">
        <ProductImage
          src={IMAGES.hardwareHero}
          alt="Hardware Accessories"
          className="absolute inset-0 w-full h-full"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/85 via-black/50 to-transparent pointer-events-none" />

        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-10 sm:pb-14 lg:pb-16">
          <div className="flex flex-col gap-3 sm:gap-4 max-w-2xl">
            <p className="text-xs text-white/70">
              <Link href="/" className="hover:text-[#D4A017] hover:underline">
                Home
              </Link>{" "}
              / Hardware Accessories
            </p>
            <div>
              <span className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-[#D4A017]">
                Hardware Accessories
              </span>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold leading-[1.05] text-white font-display mt-2 sm:mt-3">
                Precision Hardware
              </h1>
            </div>
            <p className="text-sm sm:text-base text-white/80 max-w-lg leading-relaxed">
              Soft-close hinges, ball-bearing channels, and fittings engineered
              for a lifetime of daily use.
            </p>
            <div className="w-16 h-0.5 bg-[#D4A017] mt-1" />
          </div>
        </div>
      </section>

      {/* Product grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {products.length === 0 ? (
          <div className="border border-[#D4D4D4] dark:border-[#2A2A2A] rounded-sm p-12 text-center">
            <p className="text-[#0A0A0A] dark:text-[#F5F5F5] font-semibold">
              Hardware range coming soon.
            </p>
            <p className="text-sm text-[#6B6B6B] dark:text-[#9A9A9A] mt-3 max-w-md mx-auto">
              We&apos;re adding hardware accessories to the catalogue. In the
              meantime, explore kitchen solutions or contact us for a project
              quote.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <Link
                href="/kitchen"
                className="bg-[#D4A017] hover:bg-[#E8B820] text-[#0A0A0A] font-semibold px-6 py-3 rounded-sm transition-colors"
              >
                Explore Kitchen
              </Link>
              <Link
                href="/contact"
                className="border border-[#D4A017] text-[#D4A017] hover:bg-[#D4A017] hover:text-[#0A0A0A] font-semibold px-6 py-3 rounded-sm transition-colors"
              >
                Contact us
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
