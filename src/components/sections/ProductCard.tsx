"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ShoppingCart, Star } from "lucide-react";
import ProductImage from "@/components/ui/ProductImage";
import WishlistButton from "@/components/ui/WishlistButton";
import { useCart } from "@/context/CartContext";
import { useUI } from "@/context/UIContext";
import { formatPrice, getEffectivePrice, hasActiveDiscount } from "@/lib/pricing";
import type { DbProduct } from "@/lib/db/products";

interface ProductCardProps {
  product: DbProduct | any;
  className?: string;
  averageRating?: number;
  reviewCount?: number;
  /**
   * Hover treatment. Two surfaces exist across the site:
   *  - "still" (default): only the product image scales a touch; the card
   *    itself stays put. Used in dense grids — PLP, All Products, Deals,
   *    Wishlist — where lifting every card feels noisy.
   *  - "lift": the whole card scales up and casts a drop shadow. Used in
   *    curated, spaced-out rails — Home "Top picks", PDP "You may also
   *    like" — where a card is a feature, not a list row.
   * Both share every other style; only the wrapper's hover changes.
   */
  variant?: "still" | "lift";
}

export default function ProductCard({
  product,
  className = "",
  averageRating,
  reviewCount,
  variant = "still",
}: ProductCardProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { showToast } = useUI();
  const effectivePrice = getEffectivePrice(product);
  const discounted = hasActiveDiscount(product);
  const outOfStock =
    (product.track_inventory ?? true) && (product.stock_quantity ?? 0) <= 0;
  const variantId = product.variantId ?? product.id;

  const handleCardClick = () => {
    router.push(`/kitchen/${product.slug}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, 1);
    showToast();
  };

  const handleNotifyMe = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Send the shopper to the PDP with the notify deep-link. The PDP's
    // full notify form (with email prefill for logged-in users) lives
    // there — inline notify on the card would need a mini modal we
    // don't have yet.
    router.push(`/kitchen/${product.slug}?notify=1#notify`);
  };

  // Wrapper hover differs by variant; everything else is shared. No red
  // border on hover on either — the border stays a quiet hairline.
  const wrapperHover =
    variant === "lift"
      ? "hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_18px_40px_-12px_rgba(0,0,0,0.28)] hover:border-line-strong"
      : "hover:border-line-strong";

  // "still" scales the image on hover; "lift" moves the whole card, so
  // the image holds steady inside it (double-scaling looks jittery).
  const imageHover =
    variant === "still" ? "group-hover:scale-[1.04]" : "";

  return (
    <div
      onClick={handleCardClick}
      className={`group bg-surface-raised border border-line transition duration-300 ease-out cursor-pointer overflow-hidden flex flex-col ${wrapperHover} ${className}`}
    >
      {/* Image well is white so the product reads cleanly; the info
          footer below sits on the greyer surface-sunken band, giving the
          card the two-tone split from the redesign. */}
      <div className="relative overflow-hidden aspect-square w-full bg-surface-raised">
        <ProductImage
          src={product.image}
          alt={product.name}
          className={`h-full w-full transition-transform duration-500 ease-out ${imageHover}`}
        />
        {outOfStock ? (
          <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-extrabold tracking-[0.06em] uppercase bg-transparent text-gold border border-gold">
            Out of Stock
          </span>
        ) : (
          discounted && (
            <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-extrabold tracking-[0.06em] uppercase bg-gold text-on-gold">
              Sale
            </span>
          )
        )}
        {/* Wishlist heart — top-right, opposite the badge. Hidden on
            desktop until card hover (revealOnHover) to keep the resting
            card clean; stays visible on mobile and when already saved. */}
        <WishlistButton
          variantId={variantId}
          revealOnHover
          className="absolute top-3 right-3"
        />
        {/* Primary action floats on the image. Mobile: always visible
            (no hover). Desktop: revealed on card hover / keyboard focus. */}
        {outOfStock ? (
          <button
            onClick={handleNotifyMe}
            aria-label="Notify me when back in stock"
            title="Notify me when back in stock"
            className="absolute bottom-3 right-3 bg-surface-raised/95 hover:bg-gold hover:text-on-gold text-gold p-2.5 shadow-md backdrop-blur-sm transition duration-300 ease-out lg:opacity-0 lg:translate-y-1 lg:group-hover:opacity-100 lg:group-hover:translate-y-0 focus-visible:opacity-100 focus-visible:translate-y-0"
          >
            <Bell size={18} />
          </button>
        ) : (
          <button
            onClick={handleAddToCart}
            aria-label="Add to cart"
            className="absolute bottom-3 right-3 bg-gold hover:bg-gold-bright text-on-gold p-2.5 shadow-md transition duration-300 ease-out lg:opacity-0 lg:translate-y-1 lg:group-hover:opacity-100 lg:group-hover:translate-y-0 focus-visible:opacity-100 focus-visible:translate-y-0"
          >
            <ShoppingCart size={18} />
          </button>
        )}
      </div>
      {/* Info footer sits on the greyer surface-sunken band with a
          hairline divider above, giving the card its two-tone split. */}
      <div className="p-4 flex flex-col gap-1 flex-1 bg-surface-sunken border-t border-line">
        <span className="text-[11px] uppercase tracking-wider text-ink-faint">
          {product.code}
        </span>
        <h3 className="text-[15px] font-extrabold tracking-[-0.01em] leading-tight text-ink">
          {/* Real link for keyboard users / SEO; same destination as the
              card click, stopPropagation avoids a double push. */}
          <Link
            href={`/kitchen/${product.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="hover:text-gold-deep transition-colors duration-200"
          >
            {product.name}
          </Link>
        </h3>
        {averageRating !== undefined && reviewCount !== undefined && reviewCount > 0 && (
          <div className="flex items-center gap-1 mt-0.5">
            <Star size={12} fill="currentColor" className="text-gold" />
            <span className="text-xs text-ink font-semibold">{averageRating.toFixed(1)}</span>
            <span className="text-xs text-ink-muted">({reviewCount})</span>
          </div>
        )}
        <span className="text-xs text-ink-faint">{product.dimensions}</span>
        <div className="mt-auto pt-3 flex items-baseline gap-2">
          <span className={`font-extrabold ${discounted ? "text-gold-deep" : "text-ink"}`}>
            {formatPrice(effectivePrice)}
          </span>
          {discounted && (
            <span className="text-xs text-ink-faint line-through">
              {formatPrice(product.mrp)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
