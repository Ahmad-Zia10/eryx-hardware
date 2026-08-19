"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import ProductImage from "@/components/ui/ProductImage";

// ─────────────────────────────────────────────────────────────────────
// 02 · Categories in focus — expanding accordion.
//
// A row of category panels; hover (or focus) a panel and it expands to
// full width and blooms from greyscale to colour, revealing its caption.
// The others collapse to a slim rail with a rotated label.
//
// Touch / no-hover devices get a native vertical stack instead — the
// hover-driven expand has nothing to trigger it on a phone, so a stacked
// set of tappable cards (colour at rest) is the right idiom there. Same
// resilience pattern the shipped WebGL gallery uses.
//
// Panels carry live count + cheapest "from" price (built server-side from
// getFocusCategories), so the numbers stay real while imagery is curated.
// ─────────────────────────────────────────────────────────────────────

export type FocusPanel = {
  label: string;
  href: string;
  image: string;
  count?: number;
  fromPrice?: string;
};

export default function CategoriesFocus({ panels }: { panels: FocusPanel[] }) {
  const [active, setActive] = useState(0);
  const [touch, setTouch] = useState(false);

  useEffect(() => {
    const noHover =
      window.matchMedia?.("(hover: none)").matches ||
      window.matchMedia?.("(pointer: coarse)").matches;
    setTouch(!!noHover);
  }, []);

  if (panels.length === 0) return null;

  return (
    <section className="bg-warm-bg border-t border-warm-ink/12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-baseline justify-between gap-4 border-b-2 border-warm-ink/25 pb-3.5 mb-8">
          <div className="flex items-baseline gap-4">
            <span className="text-sm font-extrabold text-warm-accent">02</span>
            <h2 className="font-editorial text-3xl sm:text-4xl tracking-[-0.01em] text-warm-ink">
              Categories in focus
            </h2>
          </div>
          <span className="hidden sm:block text-[11px] tracking-[0.16em] uppercase text-warm-ink/45">
            {touch ? "Tap to explore" : "Hover to expand"}
          </span>
        </div>

        {touch ? (
          // Touch fallback — stacked tappable cards, colour at rest.
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {panels.map((p) => (
              <Link
                key={p.label}
                href={p.href}
                className="group relative h-[220px] overflow-hidden bg-warm-panel"
              >
                <ProductImage
                  src={p.image}
                  alt={p.label}
                  className="absolute inset-0 h-full w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-warm-dark/85 via-warm-dark/10 to-transparent" />
                <div className="absolute left-4 right-4 bottom-4 text-warm-cream">
                  <div className="font-editorial text-2xl tracking-[-0.01em]">{p.label}</div>
                  {typeof p.count === "number" && (
                    <div className="text-[11px] text-warm-cream/70 mt-0.5">
                      {p.count} {p.count === 1 ? "product" : "products"}
                      {p.fromPrice ? ` · from ${p.fromPrice}` : ""}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          // Desktop — expanding horizontal accordion.
          <div className="flex h-[440px] gap-1.5 overflow-hidden">
            {panels.map((p, i) => (
              <Link
                key={p.label}
                href={p.href}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className="group relative overflow-hidden bg-warm-panel transition-[flex-grow] duration-500 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-warm-accent"
                style={{ flexGrow: active === i ? 5 : 1, flexBasis: 0 }}
                aria-label={`${p.label}${typeof p.count === "number" ? `, ${p.count} products` : ""}`}
              >
                <ProductImage
                  src={p.image}
                  alt={p.label}
                  grayscale={active !== i}
                  className={`absolute inset-0 h-full w-full transition-transform duration-500 ${
                    active === i ? "scale-100" : "scale-105"
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-warm-dark/85 via-warm-dark/10 to-transparent" />
                {/* Expanded caption */}
                <div
                  className={`absolute left-5 right-5 bottom-5 text-warm-cream transition-opacity duration-300 ${
                    active === i ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <div className="text-[11px] tracking-[0.18em] uppercase text-warm-cream/75">
                    {typeof p.count === "number" && (
                      <>
                        {p.count} {p.count === 1 ? "product" : "products"}
                        {p.fromPrice ? ` · from ${p.fromPrice}` : ""}
                      </>
                    )}
                  </div>
                  <div className="font-editorial text-3xl sm:text-4xl tracking-[-0.01em] mt-1.5 flex items-center gap-2 whitespace-nowrap">
                    {p.label}
                    <ArrowUpRight size={22} />
                  </div>
                </div>
                {/* Collapsed vertical label */}
                <div
                  className={`absolute left-4 bottom-5 origin-bottom-left -rotate-90 text-sm font-extrabold tracking-[0.08em] uppercase whitespace-nowrap text-warm-cream transition-opacity duration-300 ${
                    active === i ? "opacity-0" : "opacity-100"
                  }`}
                >
                  {p.label}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
