import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SITE_CONFIG } from "@/constants";
import { HERO_SLIDES } from "./heroData";

// ─────────────────────────────────────────────────────────────────────
// Home hero — warm ambient (the swappable alternative to HeroFloema).
//
// One full-bleed lifestyle photo with a centred editorial statement over
// a soft scrim. The calm, single-statement counterpart to the scrolling
// Floema hero. Uses the first hero slide's image as the ambient backdrop.
//
// Not the default. To use it, set HERO_VARIANT = "warm" in HomeHero.tsx.
// ─────────────────────────────────────────────────────────────────────

export default function HeroWarm() {
  const bg = HERO_SLIDES[0].image;

  return (
    <section className="relative h-[86vh] min-h-[600px] overflow-hidden bg-warm-dark">
      <Image
        src={bg}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-warm-dark/45 via-warm-dark/25 to-warm-dark/55" />
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 text-warm-cream">
        <div className="flex items-center gap-3.5 mb-6">
          <span className="text-xs font-extrabold tracking-[0.06em]">01</span>
          <span className="w-11 h-[2px] bg-warm-amber" />
          <span className="text-[11px] tracking-[0.2em] uppercase text-warm-cream/80">
            {SITE_CONFIG.division}
          </span>
        </div>
        <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl leading-[0.98] tracking-[-0.02em] [text-wrap:balance] max-w-4xl">
          Hardware built to outlive the kitchen.
        </h1>
        <p className="mt-6 text-sm sm:text-base text-warm-cream/85 max-w-md leading-relaxed">
          German-engineered fittings, stocked in India, shipped to your door.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link
            href="/kitchen"
            className="inline-flex items-center gap-2 bg-warm-cream text-warm-dark font-bold px-8 py-4 rounded-full hover:bg-white transition-colors"
          >
            Shop the range <ArrowRight size={16} />
          </Link>
          <a
            href={SITE_CONFIG.catalogueUrl}
            download="Eryx-Hardware-Catalogue.pdf"
            className="inline-flex items-center gap-2 border border-warm-cream/50 text-warm-cream hover:bg-warm-cream/10 font-bold px-8 py-4 rounded-full transition-colors"
          >
            View catalogue
          </a>
        </div>
      </div>
    </section>
  );
}
