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

  // Match the card's floating action buttons: same rounded-control,
  // shadow, and translucent-surface backdrop. Gold is the brand's
  // "active/selected" accent (Sale badge, selected states) — a saved
  // heart uses it so the card stays in one palette instead of
  // introducing a lone saturated red.
  const base =
    variant === "floating"
      ? "bg-surface-raised/95 backdrop-blur-sm shadow-md p-2.5 rounded-control ring-1 ring-black/5 dark:ring-white/10 hover:bg-surface-raised"
      : "p-2 rounded-control border border-line hover:border-line-strong";

  return (
    <button
      onClick={handleClick}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      aria-pressed={saved}
      title={saved ? "Saved — remove from wishlist" : "Save to wishlist"}
      className={`group/heart transition duration-300 ease-out ${base} ${
        saved ? "text-gold" : "text-ink-muted hover:text-gold-deep"
      } ${className}`}
    >
      <Heart
        size={size}
        className={`transition-transform duration-200 group-hover/heart:scale-110 group-active/heart:scale-90 ${
          saved ? "fill-gold" : "fill-transparent"
        }`}
      />
    </button>
  );
}
