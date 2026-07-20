"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import HeroActions from "./HeroActions";

const slideCta =
  "bg-gold hover:bg-gold-bright text-on-gold font-semibold px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base rounded-control transition duration-200 ease-in-out inline-block";

const SLIDES = [
  {
    id: 1,
    // Modern beige+walnut modular kitchen with fridge
    image: "/products/hero/slide-1-modular-kitchen.jpg",
    content: (
      <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-2xl">
        <span className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-gold">
          A Division of Modular India
        </span>
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold leading-[1.05] text-white font-display">
          Precision
          <br />
          Hardware for
          <br />
          <span className="text-gold">Modular Spaces</span>
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
    // Light-wood kitchen with tiled backsplash
    image: "/products/hero/slide-2-light-kitchen.jpg",
    content: (
      <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-2xl">
        <span className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-gold">
          Premium Kitchen Solutions
        </span>
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold leading-[1.05] text-white font-display">
          Kitchen Hardware,
          <br />
          Engineered <span className="text-gold">Right</span>
        </h1>
        <p className="text-sm sm:text-lg text-brand-cream/80 max-w-lg">
          Discover a complete range of intelligent kitchen storage systems designed
          to maximize space and ease of use.
        </p>
        <div className="flex flex-wrap gap-4 mt-1 sm:mt-2">
          <Link href="/kitchen" className={slideCta}>
            Shop Kitchen Accessories
          </Link>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    // Actual basket product brand shot (square). Rendered with
    // object-contain over a dark gradient so the whole product shows
    // instead of being cropped by object-cover.
    image: "/products/basket/basket-5-brand.jpg",
    fit: "contain" as const,
    content: (
      <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-2xl">
        <span className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-gold">
          Basket Systems
        </span>
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold leading-[1.05] text-white font-display">
          Every Item,
          <br />
          <span className="text-gold">In Its Place</span>
        </h1>
        <p className="text-sm sm:text-lg text-brand-cream/80 max-w-lg">
          Pull-out baskets and drawer systems built for the way modern
          kitchens actually work.
        </p>
        <div className="flex flex-wrap gap-4 mt-1 sm:mt-2">
          <Link href="/kitchen?category=Basket" className={slideCta}>
            Explore Basket Systems
          </Link>
        </div>
      </div>
    ),
  },
  {
    id: 4,
    // Actual rolling-shutter product brand shot (square).
    image: "/products/rolling-shutter/rolling-shutter-1-brand.jpg",
    fit: "contain" as const,
    content: (
      <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-2xl">
        <span className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-gold">
          Rolling Shutter Systems
        </span>
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold leading-[1.05] text-white font-display">
          Countertop
          <br />
          <span className="text-gold">Clarity</span>
        </h1>
        <p className="text-sm sm:text-lg text-brand-cream/80 max-w-lg">
          Appliance garages and rolling shutters that hide the mess and
          keep the counter open.
        </p>
        <div className="flex flex-wrap gap-4 mt-1 sm:mt-2">
          <Link href="/kitchen?category=Rolling Shutter" className={slideCta}>
            Explore Rolling Shutters
          </Link>
        </div>
      </div>
    ),
  },
  {
    id: 5,
    // Actual hinges product shot (4:3-ish, low-res). object-contain
    // avoids the massive close-up crop that object-cover produced on
    // wide viewports.
    image: "/products/hinges-new/hinges-new-1.jpg",
    fit: "contain" as const,
    content: (
      <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-2xl">
        <span className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-gold">
          Hinges &amp; Fittings
        </span>
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold leading-[1.05] text-white font-display">
          Soft-Close,
          <br />
          <span className="text-gold">Every Time</span>
        </h1>
        <p className="text-sm sm:text-lg text-brand-cream/80 max-w-lg">
          German-engineered hinges rated for a lifetime of daily use.
        </p>
        <div className="flex flex-wrap gap-4 mt-1 sm:mt-2">
          <Link href="/kitchen?category=Hinges" className={slideCta}>
            Explore Hinges
          </Link>
        </div>
      </div>
    ),
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

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

  // Only the active slide and its two neighbours mount their images
  // and content. Previously all five slides (plus the blurred backdrop
  // copies) rendered on first paint, so every hero image downloaded
  // immediately. Neighbours stay mounted so the crossfade in either
  // direction has a fully-loaded frame to fade to.
  const len = SLIDES.length;
  const isNear = (index: number) =>
    index === currentSlide ||
    index === (currentSlide + 1) % len ||
    index === (currentSlide - 1 + len) % len;

  return (
    <section
      className="relative w-full h-[calc(88vh-104px)] min-h-[520px] sm:min-h-[600px] overflow-hidden bg-brand-dark group"
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
          {isNear(index) && (
            <>
              {/* Product shots (slides marked fit: 'contain') fill the
                  letterbox gap with a blurred + scaled copy of the same
                  image, so the extended backdrop naturally matches the
                  product's own color/lighting instead of a hardcoded
                  gradient that seams against the shot. Lifestyle slides
                  use object-cover to fill the frame directly. */}
              {slide.fit === "contain" && (
                <Image
                  src={slide.image}
                  alt=""
                  fill
                  aria-hidden="true"
                  sizes="100vw"
                  quality={40}
                  className="object-cover object-center scale-110 blur-2xl opacity-70"
                />
              )}
              <Image
                src={slide.image}
                alt=""
                fill
                priority={index === 0}
                sizes="100vw"
                quality={80}
                className={
                  slide.fit === "contain"
                    ? "object-contain object-center"
                    : "object-cover object-center"
                }
              />

              {/* Bottom-left legibility scrim (Ozone-style): dark at the
                  bottom, transparent at the top so the image dominates.
                  Second wash on the left gives horizontal contrast for the
                  text stack without washing out the right side. */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/85 via-brand-dark/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/60 via-transparent to-transparent" />

              {/* Content — bottom-left stack */}
              <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-14 sm:pb-16 lg:pb-20">
                {slide.content}
              </div>
            </>
          )}
        </div>
      ))}

      {/* Slide indicators */}
      <div className="absolute bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {SLIDES.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentSlide}
            className={`h-1.5 rounded-pill transition-all duration-300 ${
              index === currentSlide
                ? "w-6 bg-gold"
                : "w-1.5 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>

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
