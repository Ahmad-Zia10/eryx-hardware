"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// The outlined CTA cycles between these three labels every ROTATE_MS,
// all pointing at Modular India's public site. Reserves the button's
// width for the longest label so the layout doesn't shift each swap.
const ROTATING_LABELS = ["Kitchen Solutions", "Modular India", "Click Here"] as const;
const ROTATE_MS = 2000;
const MODULAR_INDIA_URL = "https://www.modularindia.com";

export default function HeroActions() {
  const router = useRouter();
  const [labelIndex, setLabelIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Fade out → swap label → fade in. Keeps the layout stable and
    // avoids the jarring instant-swap you'd get with plain setState.
    const interval = setInterval(() => {
      setVisible(false);
      const swap = setTimeout(() => {
        setLabelIndex((i) => (i + 1) % ROTATING_LABELS.length);
        setVisible(true);
      }, 200);
      return () => clearTimeout(swap);
    }, ROTATE_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    // Modernist CTA pair: a single bordered box, no gap, a hairline
    // divider between the red primary fill and the ghost secondary.
    <div className="flex mt-2 w-fit border border-brand-cream/35">
      <button
        onClick={() => router.push("/kitchen")}
        className="bg-gold hover:bg-gold-bright text-on-gold font-bold px-6 sm:px-7 py-3.5 sm:py-4 text-sm sm:text-base transition duration-200 ease-in-out"
      >
        Explore Products
      </button>
      <a
        href={MODULAR_INDIA_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${ROTATING_LABELS[labelIndex]} — visit Modular India`}
        className="relative border-l border-brand-cream/35 text-brand-cream hover:text-gold font-bold px-6 sm:px-7 py-3.5 sm:py-4 text-sm sm:text-base transition duration-200 ease-in-out inline-flex items-center justify-center min-w-[200px]"
      >
        <span
          className={`transition-opacity duration-200 ease-in-out ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          {ROTATING_LABELS[labelIndex]}
        </span>
      </a>
    </div>
  );
}