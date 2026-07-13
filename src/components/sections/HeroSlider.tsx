"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import HeroActions from "./HeroActions";
import { useRouter } from "next/navigation";

const SLIDES = [
  {
    id: 1,
    image: "/products/hero/kitchen-hero-1.jpg",
    content: (
      <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-2xl">
        <span className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-brand-gold">
          A Division of Modular India
        </span>
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold leading-[1.05] text-white font-display">
          Precision
          <br />
          Hardware for
          <br />
          <span className="text-brand-gold">Modular Spaces</span>
        </h1>
        <p className="text-sm sm:text-lg text-brand-cream/80 max-w-lg">
          Hinges, fittings, sliding systems, baskets, pull-downs, shutters, and
          wardrobe hardware engineered for modern Indian homes.
        </p>

        <HeroActions />
      </div>
    ),
  },
  {
    id: 2,
    image: "/products/hero/kitchen-hero-2.jpg",
    content: (
      <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-2xl">
        <span className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-brand-gold">
          Premium Kitchen Solutions
        </span>
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold leading-[1.05] text-white font-display">
          Kitchen Hardware,
          <br />
          Engineered <span className="text-brand-gold">Right</span>
        </h1>
        <p className="text-sm sm:text-lg text-brand-cream/80 max-w-lg">
          Discover a complete range of intelligent kitchen storage systems designed
          to maximize space and ease of use.
        </p>
        <div className="flex flex-wrap gap-4 mt-1 sm:mt-2">
          <button
            onClick={() => window.location.href = "/kitchen"}
            className="bg-brand-gold hover:bg-brand-bronze text-brand-dark font-semibold px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base transition duration-200 ease-in-out"
          >
            Shop Kitchen Accessories
          </button>
        </div>
      </div>
    ),
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const router = useRouter();

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  return (
    <section
      className="relative w-full h-[calc(100vh-104px)] min-h-[520px] sm:min-h-[600px] overflow-hidden bg-brand-dark group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      {SLIDES.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          {/* Full-bleed lifestyle image via next/image so the browser
              picks WebP/AVIF and the right srcset variant per viewport.
              The CSS-background version this replaced always fetched the
              raw source at whatever intrinsic size it had. */}
          <Image
            src={slide.image}
            alt=""
            fill
            priority={index === 0}
            sizes="100vw"
            quality={80}
            className="object-cover object-center"
          />

          {/* Bottom-left legibility scrim (Ozone-style): dark at the
              bottom, transparent at the top so the image dominates.
              Second wash on the left gives horizontal contrast for the
              text stack without washing out the right side. */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/85 via-brand-dark/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/60 via-transparent to-transparent" />

          {/* Content — bottom-left stack */}
          <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-12 sm:pb-16 lg:pb-20">
            {slide.content}
          </div>
        </div>
      ))}

      {/* Navigation Arrows — minimal, edge-hugging, hover-reveal */}
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2 text-white/70 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
        aria-label="Previous slide"
      >
        <ChevronLeft size={40} strokeWidth={1.25} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2 text-white/70 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
        aria-label="Next slide"
      >
        <ChevronRight size={40} strokeWidth={1.25} />
      </button>
    </section>
  );
}
