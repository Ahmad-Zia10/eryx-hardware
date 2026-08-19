import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductImage from "@/components/ui/ProductImage";
import { getEffectivePrice, formatPrice } from "@/lib/pricing";
import type { DbProduct } from "@/lib/db/products";

// ─────────────────────────────────────────────────────────────────────
// 04 · On sale now — red deals poster band.
//
// Renders ONLY when there are discounted products (getDiscountedProducts).
// Live count + a few real sale thumbnails with struck MRP. Full-red
// Modernist statement band.
// ─────────────────────────────────────────────────────────────────────

export default function Deals({ products }: { products: DbProduct[] }) {
  if (products.length === 0) return null;

  const featured = products.slice(0, 3);

  return (
    <section className="bg-gold text-on-gold">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-10 items-center">
        <div>
          <span className="text-xs tracking-[0.2em] uppercase font-extrabold text-on-gold/75">
            Live deals
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold leading-[1] tracking-[-0.02em] mt-3">
            On sale right now.
          </h2>
          <p className="text-sm text-on-gold/85 mt-4 max-w-sm leading-relaxed">
            {products.length} {products.length === 1 ? "SKU" : "SKUs"} discounted
            across the range. Stocked and ready to ship.
          </p>
          <Link
            href="/deals"
            className="mt-6 inline-flex items-center gap-2 bg-brand-cream text-ink font-bold px-7 py-4 hover:bg-surface-raised transition-colors duration-200"
          >
            See all deals <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {featured.map((p) => {
            const price = getEffectivePrice(p);
            return (
              <Link
                key={p.slug}
                href={`/kitchen/${p.slug}`}
                className="group bg-surface-raised text-ink overflow-hidden"
              >
                <div className="relative aspect-square overflow-hidden">
                  <ProductImage
                    src={p.image}
                    alt={p.name}
                    className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-extrabold tracking-[0.06em] uppercase bg-gold text-on-gold">
                    Sale
                  </span>
                </div>
                <div className="p-3">
                  <div className="text-[13px] font-extrabold leading-tight line-clamp-1">
                    {p.name}
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-sm font-extrabold text-gold-deep">
                      {formatPrice(price)}
                    </span>
                    {p.mrp != null && (
                      <span className="text-[11px] line-through text-ink-faint">
                        {formatPrice(p.mrp)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
