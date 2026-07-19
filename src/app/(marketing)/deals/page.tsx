import Link from "next/link";
import { Tag } from "lucide-react";
import { getDiscountedProducts } from "@/lib/db/products";
import ProductCard from "@/components/sections/ProductCard";

export const revalidate = 60;

export default async function DealsPage() {
  const products = await getDiscountedProducts();

  return (
    <main>
      {/* Hero band — matches the /faqs and Contact page style */}
      <section className="bg-[#F7F5F2] dark:bg-[#141414] border-b border-[#E8E4DD] dark:border-[#2A2A2A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-16">
          <span className="text-xs tracking-[0.3em] uppercase text-[#D4A017]">
            Limited Time
          </span>
          <h1 className="font-serif text-3xl md:text-4xl text-[#0A0A0A] dark:text-[#F5F5F5] mt-3">
            Deals &amp; Offers
          </h1>
          <p className="text-sm md:text-base text-[#555555] dark:text-[#9A9A9A] mt-3 max-w-2xl">
            Every product currently on sale, in one place. Prices update
            automatically when the admin toggles a sale on or off.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {products.length === 0 ? (
          <div className="border border-[#D4D4D4] dark:border-[#2A2A2A] rounded-sm p-12 text-center max-w-2xl mx-auto">
            <span className="inline-flex w-14 h-14 items-center justify-center rounded-full bg-[#D4A017]/10 mb-4">
              <Tag className="text-[#D4A017]" size={26} />
            </span>
            <p className="text-[#0A0A0A] dark:text-[#F5F5F5] font-semibold">
              No active deals right now.
            </p>
            <p className="text-sm text-[#6B6B6B] dark:text-[#9A9A9A] mt-2 max-w-md mx-auto">
              Check back soon or explore the full catalogue in the meantime.
            </p>
            <Link
              href="/kitchen"
              className="inline-flex items-center gap-1.5 mt-6 text-sm font-semibold text-[#D4A017] hover:text-[#E8B820]"
            >
              Explore products
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        ) : (
          <>
            <p className="text-xs tracking-widest uppercase text-[#6B6B6B] dark:text-[#9A9A9A] mb-6">
              {products.length} product{products.length === 1 ? "" : "s"} on sale
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
