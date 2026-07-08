"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import HeroActions from "./HeroActions";
import { useRouter } from "next/navigation";

const SLIDES = [
  {
    id: 1,
    image: "/products/hero/kitchen-hero-1.jpg",
    content: (
      <div className="flex flex-col gap-6 w-full max-w-2xl">
        <span className="text-xs tracking-[0.3em] uppercase text-brand-gold">
          A Division of Modular India
        </span>
        <h1 className="text-5xl md:text-7xl font-bold leading-tight text-white font-display">
          Precision
          <br />
          Hardware for
          <br />
          <span className="text-brand-gold">Modular Spaces</span>
        </h1>
        <p className="text-lg text-brand-cream/80 max-w-lg">
          Hinges, fittings, sliding systems, baskets, pull-downs, shutters, and
          wardrobe hardware engineered for modern Indian homes.
        </p>

        <HeroActions />

        <div className="flex flex-wrap items-center gap-6 mt-6">
          {["8 Core Categories", "Real Product Photos", "Pan India"].map(
            (stat, index) => (
              <div key={stat} className="flex items-center gap-6">
                {index > 0 && <span className="h-8 w-px bg-white/20" />}
                <span className="text-sm text-brand-cream/90">{stat}</span>
              </div>
            )
          )}
        </div>
      </div>
    ),
  },
  {
    id: 2,
    image: "/products/hero/kitchen-hero-2.jpg",
    content: (
      <div className="flex flex-col gap-6 w-full max-w-2xl">
        <span className="text-xs tracking-[0.3em] uppercase text-brand-gold">
          Premium Kitchen Solutions
        </span>
        <h1 className="text-5xl md:text-7xl font-bold leading-tight text-white font-display">
          Kitchen Hardware,
          <br />
          Engineered <span className="text-brand-gold">Right</span>
        </h1>
        <p className="text-lg text-brand-cream/80 max-w-lg">
          Discover a complete range of intelligent kitchen storage systems designed
          to maximize space and ease of use.
        </p>
        <div className="flex flex-wrap gap-4 mt-2">
          <button
            onClick={() => window.location.href = "/kitchen"}
            className="bg-brand-gold hover:bg-brand-bronze text-brand-dark font-semibold px-8 py-4 transition duration-200 ease-in-out"
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
    const timer = setInterval(nextSlide, 7000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  return (
    <section 
      className="relative w-full h-[calc(100vh-104px)] min-h-[600px] overflow-hidden bg-brand-dark group"
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
          {/* Background Image with Gradient Scrim */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('${slide.image}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/90 via-brand-dark/60 to-transparent" />
          
          {/* Content */}
          <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
            {slide.content}
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/20 hover:bg-black/50 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"
        aria-label="Previous slide"
      >
        <ChevronLeft size={32} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/20 hover:bg-black/50 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"
        aria-label="Next slide"
      >
        <ChevronRight size={32} />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? "bg-brand-gold w-8" : "bg-white/50 hover:bg-white"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
