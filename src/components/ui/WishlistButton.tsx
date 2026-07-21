"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";

interface WishlistButtonProps {
  variantId: string;
  /** Visual style. "floating" sits on a product image; "inline" sits in a row. */
  variant?: "floating" | "inline";
  size?: number;
  className?: string;
}

/**
 * Heart toggle backed by WishlistContext. Optimistic — the fill flips
 * instantly; the context handles the network round-trip and rollback.
 * Logged-out taps are routed to sign in by the context.
 */
export default function WishlistButton({
  variantId,
  variant = "floating",
  size = 18,
  className = "",
}: WishlistButtonProps) {
  const { isWishlisted, toggle } = useWishlist();
  const saved = isWishlisted(variantId);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggle(variantId);
  };

  const base =
    variant === "floating"
      ? "bg-surface-raised/95 backdrop-blur-sm shadow-md p-2.5 rounded-control"
      : "p-2 rounded-control border border-line hover:border-line-strong";

  return (
    <button
      onClick={handleClick}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      aria-pressed={saved}
      title={saved ? "Saved — remove from wishlist" : "Save to wishlist"}
      className={`group/heart transition duration-300 ease-out ${base} ${
        saved ? "text-red-500" : "text-ink-muted hover:text-red-500"
      } ${className}`}
    >
      <Heart
        size={size}
        className={`transition-transform duration-200 group-active/heart:scale-90 ${
          saved ? "fill-red-500" : "fill-transparent"
        }`}
      />
    </button>
  );
}
