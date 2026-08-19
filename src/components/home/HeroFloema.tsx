"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import { SITE_CONFIG } from "@/constants";
import { HERO_SLIDES } from "./heroData";

// ─────────────────────────────────────────────────────────────────────
// Home hero — Floema-style vertical scroll-slides.
//
// A tall scroll-snap track: scrolling inside it advances to a different
// full-bleed slide (kitchen → wardrobe → hardware). Fixed overlay chrome
// (numbered index, ruled progress line, eyebrow, category pill, editorial
// serif headline, pill CTA, floating catalogue card) cross-fades per
// active slide.
//
// Production hardening beyond the design-lab prototype:
//   • next/image for slide photos (priority on first, sizes="100vw").
//   • prefers-reduced-motion: no scroll-snap / no cross-fade animation;
//     the slides simply stack and the visitor scrolls normally.
//   • Touch / no-hover devices: same stacked-scroll experience (the
//     scroll-hijack snap is a desktop affordance; on a phone the native
//     vertical scroll through stacked slides is the right idiom).
//   • Keyboard: the dot-nav buttons move between slides.
//
// This is the default hero. To switch to the warm-ambient hero, flip
// HERO_VARIANT in HomeHero.tsx — nothing here needs to change.
// ─────────────────────────────────────────────────────────────────────

export default function HeroFloema() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      const i = Math.round(track.scrollTop / track.clientHeight);
      setActive((prev) =>
        prev === i ? prev : Math.min(HERO_SLIDES.length - 1, Math.max(0, i))
      );
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  const goTo = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({
      top: i * track.clientHeight,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  const s = HERO_SLIDES[active];
  const fade = reducedMotion ? undefined : { animation: "hero-fade .5s ease" };
  const rise = reducedMotion ? undefined : { animation: "hero-rise .55s ease" };

  return (
    <section className="relative h-[86vh] min-h-[600px] overflow-hidden bg-warm-dark text-warm-cream">
      {/* Scrollable image track. `hero-track` sets scroll-snap; under
          reduced motion the snap is disabled via the modifier class. */}
      <div
        ref={trackRef}
        className={`hero-track absolute inset-0 overflow-y-scroll no-scrollbar ${
          reducedMotion ? "hero-track--reduced" : ""
        }`}
        aria-roledescription="carousel"
        aria-label="Featured ranges"
      >
        {HERO_SLIDES.map((slide, i) => (
          <div key={slide.n} className="hero-slide relative h-[86vh] min-h-[600px] w-full">
            <Image
              src={slide.image}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-warm-dark/70 via-warm-dark/20 to-warm-dark/60" />
          </div>
        ))}
      </div>

      {/* Fixed overlay chrome — cross-fades per active slide. */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 relative">
          {/* Ruled progress line + numbered index */}
          <div className="absolute left-4 right-4 sm:left-6 sm:right-6 lg:left-8 lg:right-8 top-[42%] flex items-center gap-4">
            <span key={`n-${active}`} className="text-sm font-extrabold" style={fade}>
              {s.n}
            </span>
            <span className="h-px flex-1 bg-warm-cream/35" />
            <span className="text-[11px] tracking-[0.2em] uppercase text-warm-cream/70">
              {s.n} / {String(HERO_SLIDES.length).padStart(2, "0")}
            </span>
          </div>

          {/* Eyebrow */}
          <div className="absolute left-4 sm:left-6 lg:left-8 top-[46%] text-sm text-warm-cream/80">
            {s.eyebrow}
          </div>

          {/* Slide body */}
          <div className="absolute left-4 right-4 sm:left-6 lg:left-8 top-[52%] max-w-2xl">
            {/* Only slide 1 carries the page's single <h1>; the rest are
                <h2> with identical styling (all mount at once, so multiple
                h1s would compete for SEO/AT). */}
            <span
              key={`pill-${active}`}
              className="inline-flex items-center gap-2 bg-warm-amber text-warm-dark text-xs font-bold px-3 py-1.5 rounded-full"
              style={fade}
            >
              {s.pill}
            </span>
            {active === 0 ? (
              <h1
                key={`t-${active}`}
                className="font-editorial mt-4 text-4xl sm:text-6xl lg:text-7xl leading-[0.98] tracking-[-0.02em] [text-wrap:balance]"
                style={rise}
              >
                {s.title}
              </h1>
            ) : (
              <h2
                key={`t-${active}`}
                className="font-editorial mt-4 text-4xl sm:text-6xl lg:text-7xl leading-[0.98] tracking-[-0.02em] [text-wrap:balance]"
                style={rise}
              >
                {s.title}
              </h2>
            )}
            <Link
              key={`cta-${active}`}
              href={s.href}
              className="pointer-events-auto mt-7 inline-flex items-center gap-3 bg-warm-cream text-warm-dark font-bold pl-2 pr-6 py-2 rounded-full hover:bg-white transition-colors"
              style={fade}
            >
              <span className="grid place-items-center w-9 h-9 rounded-full bg-warm-dark text-warm-cream">
                <ArrowRight size={16} />
              </span>
              {s.cta}
            </Link>
          </div>

          {/* Floating catalogue card */}
          <a
            href={SITE_CONFIG.catalogueUrl}
            download="Eryx-Hardware-Catalogue.pdf"
            className="pointer-events-auto hidden lg:flex absolute right-4 sm:right-6 lg:right-8 bottom-24 items-center gap-4 bg-warm-cream text-warm-dark p-4 rounded-2xl w-[280px] hover:-translate-y-1 transition-transform"
          >
            <div className="grid place-items-center w-14 h-16 bg-warm-amber rounded-lg">
              <Download size={22} className="text-warm-dark" />
            </div>
            <div>
              <div className="font-editorial text-lg leading-tight">Product catalogue</div>
              <div className="text-xs text-warm-dark/60 mt-0.5 flex items-center gap-1">
                Download now <Download size={12} />
              </div>
            </div>
          </a>

          {/* Scroll hint + dot nav */}
          <div className="absolute left-4 sm:left-6 lg:left-8 bottom-7 text-sm text-warm-cream/80">
            Scroll to explore ↓
          </div>
          <div className="pointer-events-auto absolute right-4 sm:right-6 lg:right-8 bottom-8 flex flex-col gap-2">
            {HERO_SLIDES.map((slide, i) => (
              <button
                key={slide.n}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}: ${slide.pill}`}
                aria-current={i === active}
                className={`h-8 w-1 rounded-full transition-colors ${
                  i === active ? "bg-warm-amber" : "bg-warm-cream/35 hover:bg-warm-cream/60"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
