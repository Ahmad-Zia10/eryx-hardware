"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, Truck, ShieldCheck, Award, ExternalLink, Star } from "lucide-react";
import ProductImage from "@/components/ui/ProductImage";
import ProductCard from "@/components/sections/ProductCard";
import PincodeChecker from "@/components/ui/PincodeChecker";
import { useCart } from "@/context/CartContext";
import { useUI } from "@/context/UIContext";
import { createClient } from "@/lib/supabase/client";
import { formatPrice, getEffectivePrice, hasActiveDiscount } from "@/lib/pricing";
import type { DbProduct } from "@/lib/db/products";

interface ProductDetailProps {
  // Both fetched server-side by page.tsx now (getProductBySlug and
  // getProductsByCategory are async Supabase calls) and passed down
  // as plain props — this component no longer does any data fetching
  // of its own, same pattern as Kitchen.tsx.
  product: DbProduct | null;
  relatedProducts: DbProduct[];
  reviews?: any[];
  ratingSummary?: { average: number; count: number };
}

export default function ProductDetail({ product, relatedProducts, reviews = [], ratingSummary = { average: 0, count: 0 } }: ProductDetailProps) {
  const router = useRouter();
  const supabase = createClient();
  const { addItem } = useCart();
  const { showToast, openEnquiryModal } = useUI();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(
    product?.gallery?.[0] || product?.image
  );
  
  const [user, setUser] = useState<any>(null);
  const [localReviews, setLocalReviews] = useState(reviews);
  const [reviewForm, setReviewForm] = useState({ rating: 5, text: "" });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, [supabase.auth]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setReviewSubmitting(true);
    setReviewError("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.id,
          rating: reviewForm.rating,
          review_text: reviewForm.text,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit review");
      }

      const newReview = await res.json();
      // Optimistically add to list. We mock authorName since API just returns raw row.
      const enrichedReview = {
        ...newReview,
        authorName: user?.user_metadata?.first_name 
          ? `${user.user_metadata.first_name} ${user.user_metadata.last_name?.charAt(0) || ""}.` 
          : "You",
      };
      setLocalReviews([enrichedReview, ...localReviews]);
      setReviewForm({ rating: 5, text: "" });
    } catch (err: any) {
      setReviewError(err.message);
    } finally {
      setReviewSubmitting(false);
    }
  };

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

  const handleAddToCart = () => {
    addItem(product, quantity);
    showToast();
  };
  const effectivePrice = getEffectivePrice(product);
  const discounted = hasActiveDiscount(product);

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
          <div className="flex items-center gap-2 -mt-2">
            <div className="flex text-[#D4A017]">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  fill={star <= Math.round(ratingSummary.average) ? "currentColor" : "none"}
                  className={star <= Math.round(ratingSummary.average) ? "text-[#D4A017]" : "text-[#D4D4D4] dark:text-[#2A2A2A]"}
                />
              ))}
            </div>
            <span className="text-xs text-[#0A0A0A] dark:text-[#F5F5F5] font-semibold">{ratingSummary.average > 0 ? ratingSummary.average.toFixed(1) : ""}</span>
            <span className="text-xs text-[#555555] dark:text-[#9A9A9A]">
              {ratingSummary.count > 0 ? `(${ratingSummary.count})` : "Be the first to review"}
            </span>
          </div>
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

          <PincodeChecker />

          <div className="mt-4">
            <span className="text-xs text-[#555555] dark:text-[#9A9A9A]">MRP</span>
            <div className="flex items-baseline gap-3">
              <p className="text-3xl font-bold text-[#D4A017]">{formatPrice(effectivePrice)}</p>
              {discounted && (
                <span className="text-sm text-[#9A9A9A] line-through">{formatPrice(product.mrp)}</span>
              )}
            </div>
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

          {product.external_price_url && (
            <a
              href={product.external_price_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 mt-2 text-sm text-[#555555] dark:text-[#9A9A9A] hover:text-[#D4A017] transition duration-200 ease-in-out"
            >
              Compare Prices on Another Site <ExternalLink size={12} />
            </a>
          )}

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

      {/* Customer Reviews */}
      <div className="mt-20 border-t border-[#E8E4DD] dark:border-[#2A2A2A] pt-12">
        <h2 className="text-2xl font-bold text-[#0A0A0A] dark:text-[#F5F5F5] mb-8">
          Customer Reviews
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12">
          {/* Review Form */}
          <div>
            <h3 className="font-semibold text-lg text-[#0A0A0A] dark:text-[#F5F5F5] mb-4">Write a Review</h3>
            {user ? (
              <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4 bg-[#F5F5F5] dark:bg-[#1A1A1A] p-6 border border-[#E8E4DD] dark:border-[#2A2A2A]">
                <div>
                  <label className="block text-sm text-[#555555] dark:text-[#9A9A9A] mb-2">Rating</label>
                  <div className="flex gap-1 cursor-pointer">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={24}
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        fill={star <= reviewForm.rating ? "currentColor" : "none"}
                        className={star <= reviewForm.rating ? "text-[#D4A017]" : "text-[#D4D4D4] dark:text-[#2A2A2A]"}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-[#555555] dark:text-[#9A9A9A] mb-2">Review (Optional)</label>
                  <textarea
                    value={reviewForm.text}
                    onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                    rows={4}
                    className="w-full bg-white dark:bg-[#111111] border border-[#D4D4D4] dark:border-[#2A2A2A] text-[#0A0A0A] dark:text-[#F5F5F5] p-3 text-sm focus:outline-none focus:border-[#D4A017] resize-none"
                    placeholder="What did you like or dislike?"
                  />
                </div>
                {reviewError && <p className="text-red-500 text-sm">{reviewError}</p>}
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="bg-[#0A0A0A] dark:bg-[#F5F5F5] text-white dark:text-[#0A0A0A] font-semibold py-3 hover:opacity-90 transition disabled:opacity-50"
                >
                  {reviewSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            ) : (
              <div className="bg-[#F5F5F5] dark:bg-[#1A1A1A] p-6 border border-[#E8E4DD] dark:border-[#2A2A2A] text-sm text-[#555555] dark:text-[#9A9A9A]">
                Please <Link href="/login" className="text-[#D4A017] hover:underline">log in</Link> to write a review.
              </div>
            )}
          </div>

          {/* Reviews List */}
          <div className="flex flex-col gap-6">
            {localReviews.length === 0 ? (
              <p className="text-[#555555] dark:text-[#9A9A9A]">No reviews yet.</p>
            ) : (
              localReviews.map((review) => (
                <div key={review.id} className="border-b border-[#E8E4DD] dark:border-[#2A2A2A] pb-6 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="flex text-[#D4A017]">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            fill={star <= review.rating ? "currentColor" : "none"}
                            className={star <= review.rating ? "text-[#D4A017]" : "text-[#D4D4D4] dark:text-[#2A2A2A]"}
                          />
                        ))}
                      </div>
                      <span className="font-medium text-[#0A0A0A] dark:text-[#F5F5F5] text-sm">{review.authorName}</span>
                      {review.is_verified_purchase && (
                        <span className="text-[10px] uppercase tracking-wider text-green-600 dark:text-green-500 border border-green-600 dark:border-green-500 px-1.5 py-0.5 rounded-sm">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#555555] dark:text-[#9A9A9A]">
                      {new Date(review.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </span>
                  </div>
                  {review.review_text && (
                    <p className="text-sm text-[#555555] dark:text-[#F5F5F5] whitespace-pre-wrap">{review.review_text}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
