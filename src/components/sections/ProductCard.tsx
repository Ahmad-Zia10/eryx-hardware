"use client";

import { useRouter } from "next/navigation";
import { ShoppingCart, Star } from "lucide-react";
import ProductImage from "@/components/ui/ProductImage";
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
  const { showToast, openEnquiryModal } = useUI();
  const effectivePrice = getEffectivePrice(product);
  const discounted = hasActiveDiscount(product);

  const handleCardClick = () => {
    router.push(`/kitchen/${product.slug}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, 1);
    showToast();
  };

  const handleEnquire = (e: React.MouseEvent) => {
    e.stopPropagation();
    openEnquiryModal({ productName: product.name });
  };

  return (
    <div
      onClick={handleCardClick}
      className={`bg-white dark:bg-[#141414] border border-[#D4D4D4] dark:border-[#2A2A2A] hover:border-[#D4A017] transition duration-200 ease-in-out cursor-pointer rounded-sm flex flex-col ${className}`}
    >
      <div className="relative overflow-hidden h-52 w-full bg-[#EBEBEB] dark:bg-[#1A1A1A]">
        <ProductImage src={product.image} alt={product.name} className="h-52 w-full" />
        <button
          onClick={handleAddToCart}
          aria-label="Add to cart"
          className="absolute bottom-2 right-2 bg-[#D4A017] hover:bg-[#E8B820] text-[#0A0A0A] p-2 rounded-sm transition duration-200 ease-in-out"
        >
          <ShoppingCart size={18} />
        </button>
      </div>
      <div className="p-4 flex flex-col gap-1 flex-1">
        <span className="text-xs text-[#555555] dark:text-[#9A9A9A]">
          {product.code}
        </span>
        <h3 className="text-sm font-semibold text-[#0A0A0A] dark:text-[#F5F5F5] font-serif">
          {product.name}
        </h3>
        {averageRating !== undefined && reviewCount !== undefined && reviewCount > 0 && (
          <div className="flex items-center gap-1 mt-0.5">
            <Star size={12} fill="currentColor" className="text-[#D4A017]" />
            <span className="text-xs text-[#0A0A0A] dark:text-[#F5F5F5] font-semibold">{averageRating.toFixed(1)}</span>
            <span className="text-xs text-[#555555] dark:text-[#9A9A9A]">({reviewCount})</span>
          </div>
        )}
        <span className="text-xs text-[#555555] dark:text-[#9A9A9A]">
          {product.dimensions}
        </span>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-[#D4A017] font-bold">
            {formatPrice(effectivePrice)}
          </span>
          {discounted && (
            <span className="text-xs text-[#9A9A9A] line-through">
              {formatPrice(product.mrp)}
            </span>
          )}
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/kitchen/${product.slug}`);
            }}
            className="flex-1 border border-[#D4D4D4] dark:border-[#2A2A2A] text-[#555555] dark:text-[#9A9A9A] hover:border-[#D4A017] hover:text-[#D4A017] text-xs font-medium py-2 transition duration-200 ease-in-out"
          >
            View Details
          </button>
          <button
            onClick={handleEnquire}
            className="flex-1 bg-[#D4A017] hover:bg-[#E8B820] text-[#0A0A0A] text-xs font-semibold py-2 transition duration-200 ease-in-out"
          >
            Enquire
          </button>
        </div>
      </div>
    </div>
  );
}
