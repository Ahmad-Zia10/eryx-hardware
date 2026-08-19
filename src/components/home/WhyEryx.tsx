import ProductImage from "@/components/ui/ProductImage";

// ─────────────────────────────────────────────────────────────────────
// 04–05 · Why Eryx — a two-part sequence, Modernist-graded.
//
//   B · "Built to a standard" — alternating image + copy rows. Images
//       greyscale at rest, bloom to colour on hover (the site idiom).
//   D · "Specified by professionals" — ink proof band with an editorial
//       pull-quote + a ruled stat strip (one inverted accent stat).
//
// Static brand facts (kept in sync with the home stat strip / About /
// BRAND_HIGHLIGHTS). The `.font-editorial` serif appears on the row
// headings and the quote — the one warm signal carried down the page.
// ─────────────────────────────────────────────────────────────────────

const ROWS = [
  {
    k: "01",
    t: "German-engineered motion",
    b: "Soft-close hinges and runners rated for a lifetime of daily use — the mechanism you feel every day, engineered to be forgotten.",
    img: "/products/hinges-new/hinges-new-1.jpg",
  },
  {
    k: "02",
    t: "Stocked and shipped pan-India",
    b: "Real inventory, not made-to-order lead times. What's in stock ships nationwide and is tracked to your door.",
    img: "/products/hero/all-products-hero.jpg",
  },
  {
    k: "03",
    t: "Trusted since 2000",
    b: "A division of Modular India — specified by designers and modular builders across the country for over two decades.",
    img: "/products/hero/oak-marble-kitchen.jpg",
  },
];

const STATS = [
  { v: "200+", l: "SKUs in stock" },
  { v: "10yr", l: "Warranty" },
  { v: "Since 2000", l: "In business" },
  { v: "Pan-India", l: "Delivery", invert: true },
];

export default function WhyEryx() {
  return (
    <>
      {/* B · alternating value rows */}
      <section className="bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-baseline gap-4 border-b-2 border-line-strong pb-3.5 mb-8">
            <span className="text-sm font-extrabold text-gold">04</span>
            <h2 className="font-editorial text-3xl sm:text-4xl tracking-[-0.01em] text-ink">
              Built to a standard
            </h2>
          </div>
          <div className="flex flex-col">
            {ROWS.map((r, i) => (
              <div
                key={r.t}
                className={`group grid grid-cols-1 md:grid-cols-2 items-stretch border-t border-line ${
                  i === ROWS.length - 1 ? "border-b" : ""
                }`}
              >
                <div
                  className={`relative min-h-[240px] overflow-hidden bg-surface-sunken ${
                    i % 2 ? "md:order-2" : ""
                  }`}
                >
                  <ProductImage
                    src={r.img}
                    alt=""
                    className="absolute inset-0 h-full w-full [filter:grayscale(1)_contrast(1.06)] transition-[filter] duration-500 group-hover:[filter:none]"
                  />
                </div>
                <div
                  className={`p-8 md:p-12 flex flex-col justify-center ${
                    i % 2 ? "md:order-1" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-extrabold text-gold">{r.k}</span>
                    <span className="w-8 h-[2px] bg-gold" />
                  </div>
                  <h3 className="font-editorial text-2xl sm:text-3xl tracking-[-0.01em] text-ink">
                    {r.t}
                  </h3>
                  <p className="text-sm text-ink-muted leading-relaxed mt-3 max-w-md">
                    {r.b}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* D · proof band */}
      <section className="relative overflow-hidden bg-brand-dark text-brand-cream">
        <ProductImage
          src="/products/hero/graphite-marble-kitchen.jpg"
          alt=""
          grayscale
          className="absolute inset-0 h-full w-full opacity-25"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-center gap-3.5">
            <span className="text-xs font-extrabold tracking-[0.06em]">05</span>
            <span className="w-11 h-[2px] bg-gold" />
            <span className="text-[11px] tracking-[0.2em] uppercase text-brand-cream/70">
              Specified by professionals
            </span>
          </div>
          <blockquote className="font-editorial text-3xl sm:text-5xl leading-[1.08] tracking-[-0.01em] max-w-3xl mt-6 [text-wrap:balance]">
            &ldquo;The fittings we don&apos;t have to think about — Eryx is what we
            spec when the kitchen has to last.&rdquo;
          </blockquote>
          <div className="text-sm text-brand-cream/55 mt-5">
            Modular kitchen studios across India
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-brand-cream/20 mt-12">
            {STATS.map((s) => (
              <div
                key={s.l}
                className="py-7 pr-6 border-r border-brand-cream/15 last:border-r-0"
              >
                <div className="text-2xl sm:text-3xl font-extrabold tracking-[-0.02em]">
                  {s.v}
                </div>
                <div
                  className={`text-xs mt-1 ${
                    s.invert ? "text-gold-bright" : "text-brand-cream/55"
                  }`}
                >
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
