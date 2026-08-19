import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/sections/ProductCard";
import type { DbProduct } from "@/lib/db/products";

// ─────────────────────────────────────────────────────────────────────
// 03 · Top picks — Modernist begins.
//
// The page has settled from warm into the flat Modernist system by here.
// Reuses the real <ProductCard variant="lift"> unchanged. Products are
// fetched + backfilled server-side (see page.tsx) so the row is always
// full.
// ─────────────────────────────────────────────────────────────────────

export default function TopPicks({ products }: { products: DbProduct[] }) {
  if (products.length === 0) return null;

  return (
    <section className="bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.slug} product={product} variant="lift" />
          ))}
        </div>
      </div>
    </section>
  );
}
