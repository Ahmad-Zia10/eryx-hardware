import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import ProductImage from "@/components/ui/ProductImage";
import { EXPERIENCE_CENTRE } from "@/constants";

// ─────────────────────────────────────────────────────────────────────
// Experience Centre — the closing peak (warm accent returns).
//
// A warm split invite that ends the page on an in-person next step
// (peak-end). Warm palette bookends the warm hero. Address/city from the
// EXPERIENCE_CENTRE constant so it never drifts from /experience-centre.
// ─────────────────────────────────────────────────────────────────────

export default function ExperienceCentre() {
  // City line — last address line (e.g. "Greater Noida, …").
  const cityLine =
    EXPERIENCE_CENTRE.addressLines[EXPERIENCE_CENTRE.addressLines.length - 1] ??
    "";
  const city = cityLine.split(",")[0]?.trim() || "Greater Noida";

  return (
    <section className="bg-warm-bg-deep">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] border border-warm-ink/20 overflow-hidden">
          <div className="flex flex-col justify-center gap-3 p-8 md:p-12 bg-warm-bg">
            <span className="text-[11px] tracking-[0.2em] uppercase text-warm-accent font-bold">
              {city}
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl tracking-[-0.02em] text-warm-ink leading-[1.02]">
              See the full range in person.
            </h2>
            <p className="text-sm text-warm-ink/65 leading-relaxed max-w-md mt-1">
              Touch the finishes, test the soft-close, and plan your kitchen with
              our team at the {EXPERIENCE_CENTRE.name}.
            </p>
            <Link
              href="/experience-centre"
              className="mt-4 self-start inline-flex items-center gap-2 bg-warm-ink text-warm-bg-deep font-bold px-6 py-3.5 hover:bg-warm-accent transition-colors duration-200"
            >
              <MapPin size={16} /> Plan a visit
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="relative min-h-[280px] bg-warm-panel">
            <ProductImage
              src="/products/hero/oak-marble-kitchen.jpg"
              alt={EXPERIENCE_CENTRE.name}
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
