"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import HeroActions from "./HeroActions";

// Modernist hero CTA — flat red primary fill, flush-left label.
const slideCta =
  "bg-gold hover:bg-gold-bright text-on-gold font-bold px-6 sm:px-7 py-3.5 sm:py-4 text-sm sm:text-base transition duration-200 ease-in-out inline-flex items-center";

// Kicker: NN (bold) + 2px red tick + uppercase label. Left-aligned,
// the Modernist hero signature. Shared across every slide.
function HeroKicker({ n, label }: { n: string; label: string }) {
  return (
    <div className="flex items-center gap-3.5 text-brand-cream">
      <span className="text-xs sm:text-sm font-extrabold tracking-[0.06em]">{n}</span>
      <span className="w-11 h-[2px] bg-gold" />
      <span className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-brand-cream/70">
        {label}
      </span>
    </div>
  );
}

// Modernist display headline — huge Archivo, tight tracking, near-1
// leading, flush-left, never centered.
const heroHeading =
  "text-4xl sm:text-6xl md:text-7xl font-extrabold leading-[0.94] tracking-[-0.035em] text-brand-cream font-display";
const heroSub = "text-sm sm:text-lg text-brand-cream/78 max-w-lg leading-relaxed";

const SLIDES = [
  {
    id: 1,
    // Modern beige+walnut modular kitchen with fridge
    image: "/products/hero/slide-1-modular-kitchen.jpg",
    content: (
      <div className="flex flex-col gap-5 sm:gap-6 w-full max-w-2xl">
        <HeroKicker n="01" label="A Division of Modular India" />
        <h1 className={heroHeading}>
          Precision
          <br />
          Hardware for
          <br />
          Modular Spaces
        </h1>
        <p className={heroSub}>
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
      <div className="flex flex-col gap-5 sm:gap-6 w-full max-w-2xl">
        <HeroKicker n="02" label="Premium Kitchen Solutions" />
        <h1 className={heroHeading}>
          Kitchen Hardware,
          <br />
          Engineered Right
        </h1>
        <p className={heroSub}>
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
      <div className="flex flex-col gap-5 sm:gap-6 w-full max-w-2xl">
        <HeroKicker n="03" label="Basket Systems" />
        <h1 className={heroHeading}>
          Every Item,
          <br />
          In Its Place
        </h1>
        <p className={heroSub}>
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
      <div className="flex flex-col gap-5 sm:gap-6 w-full max-w-2xl">
        <HeroKicker n="04" label="Rolling Shutter Systems" />
        <h1 className={heroHeading}>
          Countertop
          <br />
          Clarity
        </h1>
        <p className={heroSub}>
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
      <div className="flex flex-col gap-5 sm:gap-6 w-full max-w-2xl">
        <HeroKicker n="05" label="Hinges & Fittings" />
        <h1 className={heroHeading}>
          Soft-Close,
          <br />
          Every Time
        </h1>
        <p className={heroSub}>
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
                  use object-cover to fill the frame directly.
                  Modernist: hero imagery is EDITORIAL → grayscale. */}
              {slide.fit === "contain" && (
                <Image
                  src={slide.image}
                  alt=""
                  fill
                  aria-hidden="true"
                  sizes="100vw"
                  quality={40}
                  className="object-cover object-center scale-110 blur-2xl opacity-70 grayscale contrast-[1.06]"
                />
              )}
              <Image
                src={slide.image}
                alt=""
                fill
                priority={index === 0}
                sizes="100vw"
                quality={80}
                className={`grayscale contrast-[1.06] ${
                  slide.fit === "contain"
                    ? "object-contain object-center"
                    : "object-cover object-center"
                }`}
              />

              {/* Modernist legibility scrim: strong dark on the LEFT
                  (where the flush-left text stack sits) fading to
                  transparent on the right, plus a bottom wash. */}
              <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/85 via-brand-dark/45 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/70 via-transparent to-transparent" />

              {/* Content — left-aligned, vertically centered stack */}
              <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
                {slide.content}
              </div>
            </>
          )}
        </div>
      ))}

      {/* Slide indicators — flush-left, flat bars. Active = wide red. */}
      <div className="absolute bottom-6 left-4 sm:left-6 lg:left-8 z-30 flex items-center gap-2">
        {SLIDES.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentSlide}
            className={`h-[5px] transition-all duration-300 ${
              index === currentSlide
                ? "w-[34px] bg-gold"
                : "w-3 bg-brand-cream/45 hover:bg-brand-cream/70"
            }`}
          />
        ))}
      </div>

      {/* Navigation Arrows — edge-hugging Modernist blocks, hover-reveal */}
      <button
        onClick={prevSlide}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-11 sm:w-[52px] h-16 bg-brand-dark/50 border-r border-brand-cream/20 text-brand-cream/80 hover:text-brand-cream flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} strokeWidth={2} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-11 sm:w-[52px] h-16 bg-brand-dark/50 border-l border-brand-cream/20 text-brand-cream/80 hover:text-brand-cream flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
        aria-label="Next slide"
      >
        <ChevronRight size={24} strokeWidth={2} />
      </button>
    </section>
  );
}
