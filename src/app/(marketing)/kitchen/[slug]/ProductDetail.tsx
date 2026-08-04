"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Minus, Plus, ShoppingCart, Truck, Award, ExternalLink, Star, Layers } from "lucide-react";
import ProductImage from "@/components/ui/ProductImage";
import ProductCard from "@/components/sections/ProductCard";
import WishlistButton from "@/components/ui/WishlistButton";
import PincodeChecker from "@/components/ui/PincodeChecker";
import NotifyMeForm from "@/components/sections/NotifyMeForm";
import { useCart } from "@/context/CartContext";
import { useUI } from "@/context/UIContext";
import { createClient } from "@/lib/supabase/client";
import { formatPrice, getEffectivePrice, hasActiveDiscount } from "@/lib/pricing";
import type { DbProduct, ProductVariant } from "@/lib/db/products";

interface ProductDetailProps {
  product: DbProduct | null;
  relatedProducts: DbProduct[];
  reviews?: any[];
  ratingSummary?: { average: number; count: number };
  variants?: ProductVariant[];
}

type VariantAxis = {
  name: string;
  values: string[];
};

function getVariantAxes(variants: ProductVariant[]): VariantAxis[] {
  const orderedNames: string[] = [];

  for (const variant of variants) {
    for (const name of variant.optionOrder || Object.keys(variant.optionValues || {})) {
      if (!orderedNames.includes(name)) orderedNames.push(name);
    }
  }

  return orderedNames
    .map((name) => ({
      name,
      values: Array.from(
        new Set(
          variants
            .map((variant) => variant.optionValues?.[name])
            .filter((value): value is string => Boolean(value))
        )
      ),
    }))
    .filter((axis) => axis.values.length > 1);
}

function variantMatchesSelection(
  variant: ProductVariant,
  axes: VariantAxis[],
  selection: Record<string, string>
) {
  return axes.every((axis) => {
    const selected = selection[axis.name];
    return !selected || variant.optionValues?.[axis.name] === selected;
  });
}

function getFlatVariantLabel(variant: ProductVariant) {
  const dimensions = variant.dimension_notes?.trim();
  if (dimensions && dimensions.toLowerCase() !== "contact for specifications") {
    return dimensions;
  }
  return variant.finish || variant.item_code;
}

export default function ProductDetail({
  product,
  relatedProducts,
  reviews = [],
  ratingSummary = { average: 0, count: 0 },
  variants = [],
}: ProductDetailProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { addItem } = useCart();
  const { showToast } = useUI();
  const [quantity, setQuantity] = useState(1);
  const notifyEmailRef = useRef<HTMLInputElement>(null);
  const notifySectionRef = useRef<HTMLDivElement>(null);

  // Variant selector — initialised to the selected variant. Single- and
  // multi-variant products follow the SAME path: activeVariant is the sole
  // variant (single) or the default variant (multi). This keeps pricing —
  // including is_on_sale / discount_price — sourced from the variant in both
  // cases, rather than relying on the parent `product` prop to carry those
  // fields for the single-variant case. Only falls back to null when no
  // variants array was supplied at all.
  const [activeVariant, setActiveVariant] = useState<ProductVariant | null>(
    variants.length > 0
      ? (variants.find((v) => v.is_default) ?? variants[0])
      : null
  );
  const variantAxes = getVariantAxes(variants);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    () => activeVariant?.optionValues || {}
  );

  // The "live" product merges the parent prop with whichever variant is selected.
  const liveProduct: DbProduct | null = activeVariant
    ? {
        ...product!,
        id: activeVariant.id,
        variantId: activeVariant.id,
        code: activeVariant.item_code,
        slug: activeVariant.slug,
        finish: activeVariant.finish,
        dimensions: activeVariant.dimension_notes,
        mrp: activeVariant.mrp,
        is_on_sale: activeVariant.is_on_sale,
        discount_price: activeVariant.discount_price,
        image: activeVariant.image,
        gallery: activeVariant.gallery,
        external_price_url: activeVariant.external_price_url,
        stock_quantity: activeVariant.stock_quantity,
        track_inventory: activeVariant.track_inventory,
      }
    : product;

  const [selectedImage, setSelectedImage] = useState<string | undefined>(
    liveProduct?.gallery?.[0] || liveProduct?.image
  );

  // Reset selected image to the new variant's primary when the selection changes.
  useEffect(() => {
    setSelectedImage(liveProduct?.gallery?.[0] || liveProduct?.image);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeVariant?.id]);

  useEffect(() => {
    if (activeVariant?.optionValues) {
      setSelectedOptions(activeVariant.optionValues);
    }
  }, [activeVariant?.id, activeVariant?.optionValues]);

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

  // Deep-link from the listing card's bell icon: scroll to and focus the
  // notify-me form. Only fires once (checked via a ref sentinel) so a
  // scroll-jumping variant switch doesn't re-trigger it.
  const notifyScrolledRef = useRef(false);
  useEffect(() => {
    if (notifyScrolledRef.current) return;
    if (searchParams.get('notify') !== '1') return;
    // Wait a beat so the notify section has definitely mounted for the
    // OOS branch.
    const timer = setTimeout(() => {
      notifySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      notifyEmailRef.current?.focus();
      notifyScrolledRef.current = true;
    }, 120);
    return () => clearTimeout(timer);
  }, [searchParams]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveProduct) return;
    setReviewSubmitting(true);
    setReviewError("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: liveProduct.id,
          rating: reviewForm.rating,
          review_text: reviewForm.text,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit review");
      }

      const newReview = await res.json();
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

  if (!product || !liveProduct) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <p className="text-ink text-lg">Product not found.</p>
        <button
          onClick={() => router.push("/kitchen")}
          className="mt-4 bg-gold hover:bg-gold-bright text-on-gold font-bold px-6 py-3 transition duration-200 ease-in-out"
        >
          Back to Kitchen Solutions
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(liveProduct, quantity);
    showToast();
  };

  const handleOptionSelect = (axisName: string, value: string) => {
    const nextSelection = { ...selectedOptions, [axisName]: value };
    const exactMatch = variants.find((variant) =>
      variantMatchesSelection(variant, variantAxes, nextSelection)
    );
    const fallbackMatch = variants.find((variant) => variant.optionValues?.[axisName] === value);
    const nextVariant = exactMatch || fallbackMatch;

    setSelectedOptions(nextSelection);
    if (nextVariant) setActiveVariant(nextVariant);
  };

  const effectivePrice = getEffectivePrice(liveProduct);
  const discounted = hasActiveDiscount(liveProduct);
  const outOfStock =
    (liveProduct.track_inventory ?? true) && (liveProduct.stock_quantity ?? 0) <= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <p className="text-xs text-ink-muted">
        <Link href="/" className="hover:text-gold-deep transition duration-200 ease-in-out">
          Home
        </Link>{" "}
        /{" "}
        <Link
          href="/kitchen"
          className="hover:text-gold-deep transition duration-200 ease-in-out"
        >
          Kitchen Solutions
        </Link>{" "}
        /{" "}
        <Link
          href={`/kitchen?category=${encodeURIComponent(liveProduct.category)}`}
          className="hover:text-gold-deep transition duration-200 ease-in-out"
        >
          {liveProduct.category}
        </Link>{" "}
        / <span className="text-ink">{product.name}</span>
      </p>

      <button
        onClick={() => router.push("/kitchen")}
        className="text-sm text-ink-muted hover:text-gold-deep transition duration-200 ease-in-out mt-2"
      >
        ← Back to Kitchen Solutions
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-10 mt-8">
        {/* Left: Gallery — specific SKU, shown in COLOR (default). */}
        <div className="flex flex-col gap-3">
          <div className="bg-surface-sunken border border-line min-h-125 overflow-hidden">
            <ProductImage
              src={selectedImage!}
              alt={liveProduct.name}
              className="w-full h-full min-h-125"
              loading="eager"
            />
          </div>
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
            {liveProduct.gallery.map((image) => (
              <button
                key={image}
                onClick={() => setSelectedImage(image)}
                className={`w-24 h-20 shrink-0 overflow-hidden bg-surface-sunken transition duration-200 ease-in-out ${
                  selectedImage === image
                    ? "border-2 border-gold"
                    : "border border-line hover:border-gold"
                }`}
              >
                <ProductImage src={image} alt="" className="w-full h-full" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Details */}
        <div className="flex flex-col gap-4">
          <span className="text-xs text-ink-muted tracking-[0.06em]">
            Item Code: {liveProduct.code}
          </span>

          {/* Rating summary */}
          <div className="flex items-center gap-2 -mt-2">
            <div className="flex text-gold">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  fill={star <= Math.round(ratingSummary.average) ? "currentColor" : "none"}
                  className={
                    star <= Math.round(ratingSummary.average)
                      ? "text-gold"
                      : "text-line-strong"
                  }
                />
              ))}
            </div>
            <span className="text-xs text-ink font-semibold">
              {ratingSummary.average > 0 ? ratingSummary.average.toFixed(1) : ""}
            </span>
            <span className="text-xs text-ink-muted">
              {ratingSummary.count > 0 ? `(${ratingSummary.count})` : "Be the first to review"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-[1] tracking-[-0.025em] text-ink">
            {product.name}
          </h1>

          <div className="flex gap-2 flex-wrap">
            <span className="text-[11px] font-bold tracking-[0.06em] uppercase text-ink border border-line-strong px-2.5 py-1">
              {liveProduct.category}
            </span>
            {liveProduct.finish && (
              <span className="text-[11px] font-bold tracking-[0.06em] uppercase text-ink border border-line-strong px-2.5 py-1">
                {liveProduct.finish}
              </span>
            )}
          </div>

          <p className="text-sm text-ink-muted">{product.description}</p>

          {/* ── Variant selector ── */}
          {variants.length > 1 && (
            <div className="flex flex-col gap-2">
              {variantAxes.length > 0 ? (
                variantAxes.map((axis) => (
                  <div key={axis.name} className="space-y-2">
                    <span className="text-[11px] font-medium text-ink-faint uppercase tracking-[0.1em]">
                      Select {axis.name}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {axis.values.map((value) => {
                        const isActive = selectedOptions[axis.name] === value;
                        const candidateSelection = { ...selectedOptions, [axis.name]: value };
                        const isAvailable = variants.some((variant) =>
                          variantMatchesSelection(variant, variantAxes, candidateSelection)
                        );

                        return (
                          <button
                            key={`${axis.name}-${value}`}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => handleOptionSelect(axis.name, value)}
                            className={`px-4 py-2 text-sm border font-bold transition duration-200 ease-in-out disabled:opacity-40 disabled:cursor-not-allowed ${
                              isActive
                                ? "border-ink bg-ink text-brand-cream"
                                : "border-line-strong text-ink hover:border-gold hover:text-gold-deep"
                            }`}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="space-y-2">
                  <span className="text-[11px] font-medium text-ink-faint uppercase tracking-[0.1em]">
                    Select Variant
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((variant) => {
                      const isActive = (activeVariant?.id ?? product.id) === variant.id;
                      return (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={() => setActiveVariant(variant)}
                          className={`px-4 py-2 text-sm border font-bold transition duration-200 ease-in-out ${
                            isActive
                              ? "border-ink bg-ink text-brand-cream"
                              : "border-line-strong text-ink hover:border-gold hover:text-gold-deep"
                          }`}
                        >
                          {getFlatVariantLabel(variant)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="border-t border-line" />

          {/* Spec table */}
          <div className="flex flex-col divide-y divide-line">
            {[
              ["Dimensions", liveProduct.dimensions],
              ["Finish", liveProduct.finish],
              ["Material", liveProduct.material],
              ["Category", liveProduct.category],
              ["Item Code", liveProduct.code],
              ["Unit", "Set"],
            ].map(([key, value]) => (
              <div key={key} className="flex justify-between py-2 text-sm">
                <span className="text-ink-muted">{key}</span>
                <span className="text-ink font-medium">{value}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-line" />

          <PincodeChecker />

          {/* Price — ink by default; deep red reserved for an active sale
              so the discount reads as the highlight, with a SAVE badge. */}
          <div className="mt-4">
            <span className="text-xs text-ink-muted">MRP</span>
            <div className="flex items-baseline gap-3 flex-wrap">
              <p className={`text-4xl font-extrabold tracking-[-0.02em] ${discounted ? "text-gold-deep" : "text-ink"}`}>
                {formatPrice(effectivePrice)}
              </p>
              {discounted && (
                <>
                  <span className="text-sm text-ink-faint line-through">
                    {formatPrice(liveProduct.mrp)}
                  </span>
                  {typeof liveProduct.mrp === "number" && typeof effectivePrice === "number" && (
                    <span className="text-[11px] font-extrabold bg-gold text-on-gold px-2 py-1">
                      SAVE {Math.round(((liveProduct.mrp - effectivePrice) / liveProduct.mrp) * 100)}%
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Quantity + Add to cart */}
          <div className="flex items-center gap-4">
            <div className="flex items-center border border-line">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-3 text-ink-muted hover:text-gold-deep"
              >
                <Minus size={16} />
              </button>
              <span className="px-4 text-ink">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="p-3 text-ink-muted hover:text-gold-deep"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-stretch gap-3">
            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              className={`flex-1 py-3.5 font-bold flex items-center justify-center gap-2 transition duration-200 ease-in-out ${
                outOfStock
                  ? "bg-surface-sunken text-ink-faint cursor-not-allowed"
                  : "bg-gold hover:bg-gold-bright text-on-gold"
              }`}
            >
              <ShoppingCart size={18} /> {outOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
            <WishlistButton
              variant="inline"
              size={20}
              variantId={liveProduct.variantId ?? liveProduct.id}
              className="px-4 shrink-0"
            />
          </div>

          {outOfStock ? (
            <div
              id="notify"
              ref={notifySectionRef}
              className="border border-gold/40 bg-gold-tint p-4"
            >
              <NotifyMeForm
                ref={notifyEmailRef}
                variantId={liveProduct.variantId ?? liveProduct.id}
                variantName={liveProduct.name}
                defaultEmail={user?.email ?? ''}
              />
            </div>
          ) : (
            <Link
              href={`/bulk-enquiry?variant=${liveProduct.variantId ?? liveProduct.id}`}
              className="border border-line-strong text-ink hover:border-gold hover:text-gold-deep w-full py-3 font-bold transition duration-200 ease-in-out flex flex-col items-center justify-center gap-0.5"
            >
              <span className="flex items-center gap-2">
                <Layers size={18} /> Bulk Enquiry
              </span>
              <span className="text-xs font-normal opacity-80">
                For contractors, projects, and volume orders
              </span>
            </Link>
          )}

          {liveProduct.external_price_url && (
            <a
              href={liveProduct.external_price_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 mt-2 text-sm text-ink-muted hover:text-gold-deep transition duration-200 ease-in-out"
            >
              Compare Prices on Another Site <ExternalLink size={12} />
            </a>
          )}

          <div className="flex flex-wrap gap-6 mt-2">
            <div className="flex items-center gap-2 text-xs text-ink-muted">
              <Truck size={16} /> Pan India Delivery
            </div>
            <div className="flex items-center gap-2 text-xs text-ink-muted">
              <Award size={16} /> Certified Quality
            </div>
          </div>
        </div>
      </div>

      {/* You May Also Like */}
      {relatedProducts.length > 0 && (
        <div className="mt-20 border-t-2 border-line-strong pt-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.02em] text-ink mb-6">
            You may also like
          </h2>
          {/* px-1 py-3 gives the "lift" cards room so their scale + shadow
              isn't clipped: overflow-x-auto forces overflow-y to auto per
              spec, so an unpadded scroll container would crop the lift. */}
          <div className="flex gap-4 overflow-x-auto no-scrollbar px-1 py-3">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.slug}
                product={p}
                variant="lift"
                className="min-w-65 sm:min-w-70 w-65 sm:w-70 shrink-0"
              />
            ))}
          </div>
        </div>
      )}

      {/* Customer Reviews */}
      <div className="mt-20 border-t-2 border-line-strong pt-12">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.02em] text-ink mb-8">
          Customer reviews
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12">
          {/* Review Form */}
          <div>
            <h3 className="font-semibold text-lg text-ink mb-4">
              Write a Review
            </h3>
            {user ? (
              <form
                onSubmit={handleReviewSubmit}
                className="flex flex-col gap-4 bg-surface-sunken p-6 border border-line"
              >
                <div>
                  <label className="block text-sm text-ink-muted mb-2">
                    Rating
                  </label>
                  <div className="flex gap-1 cursor-pointer">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={24}
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        fill={star <= reviewForm.rating ? "currentColor" : "none"}
                        className={
                          star <= reviewForm.rating
                            ? "text-gold"
                            : "text-line-strong"
                        }
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-ink-muted mb-2">
                    Review (Optional)
                  </label>
                  <textarea
                    value={reviewForm.text}
                    onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                    rows={4}
                    className="w-full bg-surface border border-line-strong text-ink p-3 text-sm focus:outline-none focus:border-gold resize-none transition-colors duration-200"
                    placeholder="What did you like or dislike?"
                  />
                </div>
                {reviewError && <p className="text-red-500 text-sm">{reviewError}</p>}
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="bg-gold hover:bg-gold-bright text-on-gold font-bold py-3 transition disabled:opacity-50"
                >
                  {reviewSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            ) : (
              <div className="bg-surface-sunken p-6 border border-line text-sm text-ink-muted">
                Please{" "}
                <Link href="/login" className="text-gold-deep hover:underline">
                  log in
                </Link>{" "}
                to write a review.
              </div>
            )}
          </div>

          {/* Reviews List */}
          <div className="flex flex-col gap-6">
            {localReviews.length === 0 ? (
              <p className="text-ink-muted">No reviews yet.</p>
            ) : (
              localReviews.map((review) => (
                <div
                  key={review.id}
                  className="border-b border-line pb-6 last:border-0 last:pb-0"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="flex text-gold">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            fill={star <= review.rating ? "currentColor" : "none"}
                            className={
                              star <= review.rating
                                ? "text-gold"
                                : "text-line-strong"
                            }
                          />
                        ))}
                      </div>
                      <span className="font-medium text-ink text-sm">
                        {review.authorName}
                      </span>
                      {review.is_verified_purchase && (
                        <span className="text-[10px] uppercase tracking-[0.08em] text-green-700 border border-green-700 px-1.5 py-0.5">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-ink-muted">
                      {new Date(review.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {review.review_text && (
                    <p className="text-sm text-ink-muted whitespace-pre-wrap">
                      {review.review_text}
                    </p>
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
