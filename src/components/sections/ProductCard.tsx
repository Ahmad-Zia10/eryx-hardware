"use client";

import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import ProductImage from "@/components/ui/ProductImage";
import { useCart } from "@/context/CartContext";
import { useUI } from "@/context/UIContext";
import { formatPrice, CatalogueProduct } from "@/lib/catalogue-data";

interface ProductCardProps {
  product: CatalogueProduct;
  className?: string;
}

export default function ProductCard({ product, className = "" }: ProductCardProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { showToast, openEnquiryModal } = useUI();

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
        <span className="text-xs text-[#555555] dark:text-[#9A9A9A]">
          {product.dimensions}
        </span>
        <span className="text-[#D4A017] font-bold mt-1">
          {formatPrice(product.mrp)}
        </span>
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