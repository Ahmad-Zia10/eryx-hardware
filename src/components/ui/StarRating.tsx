"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  /** When provided, the stars become an interactive picker. */
  onChange?: (value: number) => void;
  size?: number;
  className?: string;
  /** Accessible label prefix, e.g. "Your rating". */
  label?: string;
}

/**
 * Star rating used in both display and input modes. Display mode (no onChange)
 * renders filled/empty stars; input mode adds hover preview + keyboard/click
 * selection. Gold fill matches the brand accent (#D4A017).
 */
export default function StarRating({
  value,
  onChange,
  size = 16,
  className = "",
  label = "Rating",
}: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const interactive = typeof onChange === "function";
  const shown = hover ?? value;

  if (!interactive) {
    return (
      <span
        className={`inline-flex items-center gap-0.5 ${className}`}
        role="img"
        aria-label={`${value} out of 5 stars`}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={
              star <= value
                ? "fill-[#D4A017] text-[#D4A017]"
                : "fill-transparent text-[#D4D4D4] dark:text-[#3A3A3A]"
            }
          />
        ))}
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1 ${className}`}
      onMouseLeave={() => setHover(null)}
      role="radiogroup"
      aria-label={label}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          onMouseEnter={() => setHover(star)}
          onClick={() => onChange!(star)}
          className="p-0.5 rounded-sm transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A017]"
        >
          <Star
            size={size}
            className={
              star <= shown
                ? "fill-[#D4A017] text-[#D4A017]"
                : "fill-transparent text-[#D4D4D4] dark:text-[#3A3A3A]"
            }
          />
        </button>
      ))}
    </div>
  );
}
