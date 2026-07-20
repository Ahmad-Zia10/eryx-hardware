import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";
import { getDiscountedProducts, getTopPicks } from "@/lib/db/products";
import ProductCard from "@/components/sections/ProductCard";

export const revalidate = 60;

export default async function DealsPage() {
  const products = await getDiscountedProducts();
  // An empty deals page is a dead end — surface featured products so
  // the visit still leads somewhere. Only fetched when needed.
  const fallback = products.length === 0 ? (await getTopPicks()).slice(0, 4) : [];

  return (
    <main>
      {/* Hero band — matches the /faqs and Contact page style */}
      <section className="bg-surface-sunken border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-16">
          <span className="text-xs tracking-[0.3em] uppercase text-gold-deep">
            Limited Time
          </span>
          <h1 className="font-serif text-3xl md:text-4xl text-ink mt-3">
            Deals &amp; Offers
          </h1>
          <p className="text-sm md:text-base text-ink-muted mt-3 max-w-2xl">
            Every product currently on sale, in one place. Prices update
            automatically when the admin toggles a sale on or off.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {products.length === 0 ? (
          <>
            <div className="border border-line rounded-card p-12 text-center max-w-2xl mx-auto">
              <span className="inline-flex w-14 h-14 items-center justify-center rounded-pill bg-gold-tint mb-4">
                <Tag className="text-gold-deep" size={26} />
              </span>
              <p className="text-ink font-semibold">No active deals right now.</p>
              <p className="text-sm text-ink-muted mt-2 max-w-md mx-auto">
                Check back soon — meanwhile, these are the products our
                customers reach for most.
              </p>
              <Link
                href="/kitchen"
                className="inline-flex items-center gap-1.5 mt-6 text-sm font-semibold text-gold-deep hover:text-gold transition-colors duration-200"
              >
                Explore the full catalogue
                <ArrowRight size={14} />
              </Link>
            </div>

            {fallback.length > 0 && (
              <div className="mt-14">
                <h2 className="font-heading text-2xl text-ink mb-6">
                  Popular right now
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {fallback.map((product) => (
                    <ProductCard key={product.slug} product={product} />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <p className="text-xs tracking-widest uppercase text-ink-muted mb-6">
              {products.length} product{products.length === 1 ? "" : "s"} on sale
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
