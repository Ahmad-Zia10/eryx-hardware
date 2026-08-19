import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import ProductImage from "@/components/ui/ProductImage";
import { formatPrice } from "@/lib/pricing";
import type { LineOverview, ProductLine } from "@/lib/db/categories";

// ─────────────────────────────────────────────────────────────────────
// 01 · Product lines — three tall full-bleed image cards.
//
// The main navigation moment. Live count + cheapest "from" price per line
// (from getProductsOverview). Warm section: cream ground, editorial serif
// names, warm accent kicker. Only lines that actually have stock render.
// ─────────────────────────────────────────────────────────────────────

const LINE_META: Record<
  ProductLine,
  { label: string; href: string; note: string; image: string }
> = {
  kitchen: {
    label: "Kitchen",
    href: "/kitchen",
    note: "Baskets · pull-downs · shutters · corners",
    image: "/products/hero/kitchen-page-hero.jpg",
  },
  wardrobe: {
    label: "Wardrobe",
    href: "/wardrobe",
    note: "Trouser racks · baskets · fittings",
    image: "/products/hero/wardrobe-hero.jpg",
  },
  hardware: {
    label: "Hardware",
    href: "/hardware",
    note: "Hinges · channels · slides",
    image: "/products/hero/hardware-hero.jpg",
  },
};

export default function ProductLines({ lines }: { lines: LineOverview[] }) {
  // Only show lines that actually have stock, in the canonical order.
  const live = lines.filter((l) => l.productCount > 0);
  if (live.length === 0) return null;

  return (
    <section className="bg-warm-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-baseline justify-between gap-4 border-b-2 border-warm-ink/25 pb-3.5 mb-8">
          <div className="flex items-baseline gap-4">
            <span className="text-sm font-extrabold text-warm-accent">01</span>
            <h2 className="font-editorial text-3xl sm:text-4xl tracking-[-0.01em] text-warm-ink">
              Three ranges, one standard
            </h2>
          </div>
          <span className="hidden sm:block text-[11px] tracking-[0.16em] uppercase text-warm-ink/45">
            Shop by line
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {live.map((line, i) => {
            const meta = LINE_META[line.productLine];
            // Cheapest "from" price across the line's categories.
            const minPrice = line.categories.reduce<number | null>(
              (min, c) =>
                c.minPrice != null && (min == null || c.minPrice < min)
                  ? c.minPrice
                  : min,
              null
            );
            return (
              <Link
                key={line.productLine}
                href={meta.href}
                className="group relative aspect-[3/4] overflow-hidden bg-warm-panel"
              >
                <ProductImage
                  src={meta.image}
                  alt={meta.label}
                  className="absolute inset-0 w-full h-full transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-warm-dark/85 via-warm-dark/10 to-transparent" />
                <span className="absolute top-4 left-4 text-xs font-extrabold text-warm-cream/80">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="absolute left-5 right-5 bottom-5 text-warm-cream">
                  <div className="text-[11px] tracking-[0.2em] uppercase text-warm-cream/70">
                    {line.productCount} products
                    {minPrice != null && <> · from {formatPrice(minPrice)}</>}
                  </div>
                  <div className="font-editorial text-3xl sm:text-4xl tracking-[-0.01em] mt-1.5 flex items-center gap-2">
                    {meta.label}
                    <ArrowUpRight
                      size={22}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <div className="text-xs text-warm-cream/60 mt-1">{meta.note}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
