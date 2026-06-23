"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, Truck, ShieldCheck, Award } from "lucide-react";
import ProductImage from "@/components/ui/ProductImage";
import ProductCard from "@/components/sections/ProductCard";
import { useCart } from "@/context/CartContext";
import { useUI } from "@/context/UIContext";
import { formatPrice, getProductBySlug, getProductsByCategory } from "@/lib/catalogue-data";

interface ProductDetailProps {
  slug: string;
}

export default function ProductDetail({ slug }: ProductDetailProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { showToast, openEnquiryModal } = useUI();
  const [quantity, setQuantity] = useState(1);

  const product = getProductBySlug(slug);
  const [selectedImage, setSelectedImage] = useState(
    product?.gallery?.[0] || product?.image
  );

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <p className="text-[#0A0A0A] dark:text-[#F5F5F5] text-lg">Product not found.</p>
        <button
          onClick={() => router.push("/kitchen")}
          className="mt-4 bg-[#D4A017] text-[#0A0A0A] font-semibold px-6 py-3"
        >
          Back to Kitchen Solutions
        </button>
      </div>
    );
  }

  const relatedProducts = getProductsByCategory(product.category)
    .filter((p) => p.slug !== product.slug)
    .slice(0, 4);

  const handleAddToCart = () => {
    addItem(product, quantity);
    showToast();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <p className="text-xs text-[#555555] dark:text-[#9A9A9A]">
        <Link href="/" className="hover:text-[#D4A017] transition duration-200 ease-in-out">
          Home
        </Link>{" "}
        /{" "}
        <Link
          href="/kitchen"
          className="hover:text-[#D4A017] transition duration-200 ease-in-out"
        >
          Kitchen Solutions
        </Link>{" "}
        /{" "}
        <Link
          href={`/kitchen?category=${encodeURIComponent(product.category)}`}
          className="hover:text-[#D4A017] transition duration-200 ease-in-out"
        >
          {product.category}
        </Link>{" "}
        / <span className="text-[#0A0A0A] dark:text-[#F5F5F5]">{product.name}</span>
      </p>

      <button
        onClick={() => router.push("/kitchen")}
        className="text-sm text-[#555555] dark:text-[#9A9A9A] hover:text-[#D4A017] transition duration-200 ease-in-out mt-2"
      >
        ← Back to Kitchen Solutions
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-10 mt-8">
        {/* Left: Gallery */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#EBEBEB] dark:bg-[#1A1A1A] border border-[#D4D4D4] dark:border-[#2A2A2A] rounded-sm min-h-125 overflow-hidden">
            <ProductImage
              src={selectedImage!}
              alt={product.name}
              className="w-full h-full min-h-125"
              loading="eager"
            />
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {product.gallery.map((image) => (
              <button
                key={image}
                onClick={() => setSelectedImage(image)}
                className={`w-24 h-20 shrink-0 border rounded-sm overflow-hidden bg-[#EBEBEB] dark:bg-[#1A1A1A] transition duration-200 ease-in-out ${
                  selectedImage === image
                    ? "border-[#D4A017]"
                    : "border-[#D4D4D4] dark:border-[#2A2A2A] hover:border-[#D4A017]"
                }`}
              >
                <ProductImage src={image} alt="" className="w-full h-full" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Details */}
        <div className="flex flex-col gap-4">
          <span className="text-xs text-[#555555] dark:text-[#9A9A9A]">
            Item Code: {product.code}
          </span>
          <h1 className="text-4xl font-semibold text-[#0A0A0A] dark:text-[#F5F5F5]">
            {product.name}
          </h1>
          <div className="flex gap-2">
            <span className="border border-[#D4A017] text-[#D4A017] text-xs px-2 py-0.5">
              {product.category}
            </span>
            <span className="border border-[#D4A017] text-[#D4A017] text-xs px-2 py-0.5">
              {product.finish}
            </span>
          </div>
          <p className="text-sm text-[#555555] dark:text-[#9A9A9A]">{product.description}</p>

          <div className="border-t border-[#D4D4D4] dark:border-[#2A2A2A]" />

          <div className="flex flex-col divide-y divide-[#D4D4D4] dark:divide-[#2A2A2A]">
            {[
              ["Dimensions", product.dimensions],
              ["Finish", product.finish],
              ["Material", product.material],
              ["Category", product.category],
              ["Item Code", product.code],
              ["Technology", "German Tech"],
              ["Unit", "Set"],
            ].map(([key, value]) => (
              <div key={key} className="flex justify-between py-2 text-sm">
                <span className="text-[#555555] dark:text-[#9A9A9A]">{key}</span>
                <span className="text-[#0A0A0A] dark:text-[#F5F5F5] font-medium">{value}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-[#D4D4D4] dark:border-[#2A2A2A]" />

          <div>
            <span className="text-xs text-[#555555] dark:text-[#9A9A9A]">MRP</span>
            <p className="text-3xl font-bold text-[#D4A017]">{formatPrice(product.mrp)}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center border border-[#D4D4D4] dark:border-[#2A2A2A]">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-3 text-[#555555] dark:text-[#9A9A9A] hover:text-[#D4A017]"
              >
                <Minus size={16} />
              </button>
              <span className="px-4 text-[#0A0A0A] dark:text-[#F5F5F5]">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="p-3 text-[#555555] dark:text-[#9A9A9A] hover:text-[#D4A017]"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className="bg-[#0A0A0A] dark:bg-[#1A1A1A] text-white w-full py-3 font-semibold flex items-center justify-center gap-2 transition duration-200 ease-in-out hover:opacity-90"
          >
            <ShoppingCart size={18} /> Add to Cart
          </button>

          <button
            onClick={() => openEnquiryModal({ productName: product.name })}
            className="border border-[#D4A017] text-[#D4A017] hover:bg-[#D4A017] hover:text-[#0A0A0A] w-full py-3 font-semibold transition duration-200 ease-in-out"
          >
            Enquire Now
          </button>

          <div className="flex flex-wrap gap-6 mt-2">
            <div className="flex items-center gap-2 text-xs text-[#555555] dark:text-[#9A9A9A]">
              <Truck size={16} /> Pan India Delivery
            </div>
            <div className="flex items-center gap-2 text-xs text-[#555555] dark:text-[#9A9A9A]">
              <ShieldCheck size={16} /> German Tech
            </div>
            <div className="flex items-center gap-2 text-xs text-[#555555] dark:text-[#9A9A9A]">
              <Award size={16} /> Certified Quality
            </div>
          </div>
        </div>
      </div>

      {/* You May Also Like */}
      {relatedProducts.length > 0 && (
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-[#0A0A0A] dark:text-[#F5F5F5] mb-6">
            You May Also Like
          </h2>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.slug}
                product={p}
                className="min-w-65 sm:min-w-70 w-65 sm:w-70 shrink-0"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}