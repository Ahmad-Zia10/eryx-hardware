"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";

interface WishlistButtonProps {
  variantId: string;
  /** Visual style. "floating" sits on a product image; "inline" sits in a row. */
  variant?: "floating" | "inline";
  size?: number;
  className?: string;
  /**
   * When true, the heart is hidden on desktop until the parent `.group`
   * is hovered/focused (or keyboard focus lands on it) — used on product
   * cards so the resting card stays clean. It ALWAYS stays visible when
   * the item is already saved (so a saved state never disappears) and on
   * touch viewports (no hover → one-tap saving must stay reachable).
   * Requires an ancestor with the `group` class.
   */
  revealOnHover?: boolean;
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
  revealOnHover = false,
}: WishlistButtonProps) {
  const { isWishlisted, toggle } = useWishlist();
  const saved = isWishlisted(variantId);

  // Hover-reveal on desktop only. Saved hearts and touch viewports keep
  // it visible. lg: guards the hide so mobile (no hover) never loses it;
  // focus-visible keeps it keyboard-reachable.
  const reveal =
    revealOnHover && !saved
      ? "lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100 lg:focus-within:opacity-100"
      : "";

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
      ? "bg-surface-raised/95 backdrop-blur-sm shadow-md p-2.5 ring-1 ring-ink/5 hover:bg-surface-raised"
      : "p-2 border border-line hover:border-line-strong";

  return (
    <button
      onClick={handleClick}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      aria-pressed={saved}
      title={saved ? "Saved — remove from wishlist" : "Save to wishlist"}
      className={`group/heart transition duration-300 ease-out ${base} ${reveal} ${
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
