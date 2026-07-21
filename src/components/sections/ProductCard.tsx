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
}

export default function ProductCard({ product, className = "", averageRating, reviewCount }: ProductCardProps) {
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

  return (
    <div
      onClick={handleCardClick}
      className={`group bg-surface-raised border border-line hover:border-line-strong hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.45)] hover:-translate-y-0.5 transition duration-300 ease-out cursor-pointer rounded-card overflow-hidden flex flex-col ${className}`}
    >
      <div className="relative overflow-hidden aspect-square w-full bg-surface-sunken">
        <ProductImage
          src={product.image}
          alt={product.name}
          className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
        {outOfStock ? (
          <span className="absolute top-3 left-3 px-2 py-1 text-[10px] font-semibold tracking-widest uppercase bg-surface-raised/95 text-red-500 backdrop-blur-sm rounded-control">
            Out of Stock
          </span>
        ) : (
          discounted && (
            <span className="absolute top-3 left-3 px-2 py-1 text-[10px] font-semibold tracking-widest uppercase bg-gold text-on-gold rounded-control">
              Sale
            </span>
          )
        )}
        {/* Wishlist heart — top-right, always visible so saving is one tap
            on mobile too. Sits opposite the Sale/Out-of-Stock badge. */}
        <WishlistButton variantId={variantId} className="absolute top-3 right-3" />
        {/* Primary action floats on the image. Mobile: always visible
            (no hover). Desktop: revealed on card hover / keyboard focus. */}
        {outOfStock ? (
          <button
            onClick={handleNotifyMe}
            aria-label="Notify me when back in stock"
            title="Notify me when back in stock"
            className="absolute bottom-3 right-3 bg-surface-raised/95 hover:bg-gold hover:text-on-gold text-gold p-2.5 rounded-control shadow-md backdrop-blur-sm transition duration-300 ease-out lg:opacity-0 lg:translate-y-1 lg:group-hover:opacity-100 lg:group-hover:translate-y-0 focus-visible:opacity-100 focus-visible:translate-y-0"
          >
            <Bell size={18} />
          </button>
        ) : (
          <button
            onClick={handleAddToCart}
            aria-label="Add to cart"
            className="absolute bottom-3 right-3 bg-gold hover:bg-gold-bright text-on-gold p-2.5 rounded-control shadow-md transition duration-300 ease-out lg:opacity-0 lg:translate-y-1 lg:group-hover:opacity-100 lg:group-hover:translate-y-0 focus-visible:opacity-100 focus-visible:translate-y-0"
          >
            <ShoppingCart size={18} />
          </button>
        )}
      </div>
      <div className="p-4 flex flex-col gap-1 flex-1">
        <span className="text-[11px] uppercase tracking-wider text-ink-faint">
          {product.code}
        </span>
        <h3 className="text-[15px] font-medium leading-snug text-ink font-serif">
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
        <div className="mt-auto pt-3 flex items-end justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-ink font-semibold">
              {formatPrice(effectivePrice)}
            </span>
            {discounted && (
              <span className="text-xs text-ink-faint line-through">
                {formatPrice(product.mrp)}
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/bulk-enquiry?variant=${variantId}`);
            }}
            className="text-xs text-ink-muted hover:text-gold-deep underline-offset-4 hover:underline transition-colors duration-200 whitespace-nowrap"
          >
            Bulk Enquiry
          </button>
        </div>
      </div>
    </div>
  );
}
