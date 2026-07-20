"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, SlidersHorizontal, X } from "lucide-react";
import ProductImage from "@/components/ui/ProductImage";
import ProductCard from "@/components/sections/ProductCard";
import { useUI } from "@/context/UIContext";
import { CATEGORIES, FINISHES, IMAGES } from "@/lib/catalogue-data";
import type { CatalogueProduct } from "@/lib/catalogue-data";

const MAX_PRICE = 35000;

type SortKey = "featured" | "price-asc" | "price-desc";

interface KitchenProps {
  // Fetched server-side by page.tsx and passed down — this component
  // no longer imports ALL_PRODUCTS directly. All filtering still
  // happens client-side against this prop, same as it did against the
  // static array before; only the data source changed.
  products: CatalogueProduct[];
}

export default function Kitchen({ products }: KitchenProps) {
  const router = useRouter();
  // next/navigation's useSearchParams is READ-ONLY — unlike react-router's
  // version, you can't call .set()/.delete() on it directly. To change the
  // URL you build a fresh URLSearchParams from the current one, mutate
  // that copy, then push the resulting string via the router yourself.
  const searchParams = useSearchParams();

  const activeTab = searchParams.get("category") || "All";
  const [selectedFinishes, setSelectedFinishes] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(MAX_PRICE);
  const [sortKey, setSortKey] = useState<SortKey>("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const { openEnquiryModal } = useUI();

  const handleTabClick = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "All") {
      params.delete("category");
    } else {
      params.set("category", tab);
    }
    const query = params.toString();
    router.push(query ? `/kitchen?${query}` : "/kitchen");
  };

  const toggleFinish = (finish: string) => {
    setSelectedFinishes((prev) =>
      prev.includes(finish) ? prev.filter((f) => f !== finish) : [...prev, finish]
    );
  };

  const priceFiltered = priceMin > 0 || priceMax < MAX_PRICE;

  const clearAllFilters = () => {
    setSelectedFinishes([]);
    setPriceMin(0);
    setPriceMax(MAX_PRICE);
    if (activeTab !== "All") handleTabClick("All");
  };

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((p) => {
      const matchesCategory = activeTab === "All" || p.category === activeTab;
      const matchesFinish =
        selectedFinishes.length === 0 || selectedFinishes.includes(p.finish);
      const matchesPrice =
        typeof p.mrp !== "number" || (p.mrp >= priceMin && p.mrp <= priceMax);
      return matchesCategory && matchesFinish && matchesPrice;
    });
    if (sortKey === "featured") return filtered;
    // Price sorts: null-price ("Price on request") items always sink to
    // the end regardless of direction.
    return [...filtered].sort((a, b) => {
      const pa = typeof a.mrp === "number" ? a.mrp : null;
      const pb = typeof b.mrp === "number" ? b.mrp : null;
      if (pa === null && pb === null) return 0;
      if (pa === null) return 1;
      if (pb === null) return -1;
      return sortKey === "price-asc" ? pa - pb : pb - pa;
    });
  }, [products, activeTab, selectedFinishes, priceMin, priceMax, sortKey]);

  const filterSidebarContent = (
    <div className="flex flex-col gap-8">
      <span className="text-xs tracking-widest uppercase text-gold-deep">
        Filters
      </span>

      <div>
        <h4 className="text-sm font-semibold text-ink mb-3">Finish</h4>
        <div className="flex flex-col gap-2">
          {FINISHES.map((finish) => (
            <label
              key={finish}
              className="flex items-center gap-2 text-sm text-ink-muted hover:text-ink cursor-pointer transition-colors duration-200"
            >
              <input
                type="checkbox"
                checked={selectedFinishes.includes(finish)}
                onChange={() => toggleFinish(finish)}
              />
              {finish}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-ink mb-3">Price</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={MAX_PRICE}
            step={500}
            placeholder="Min"
            aria-label="Minimum price"
            value={priceMin === 0 ? "" : priceMin}
            onChange={(e) =>
              setPriceMin(Math.max(0, Number(e.target.value) || 0))
            }
            className="w-full border border-line-strong bg-surface text-ink text-sm px-2.5 py-1.5 rounded-control placeholder:text-ink-faint"
          />
          <span className="text-ink-faint text-sm">–</span>
          <input
            type="number"
            min={0}
            max={MAX_PRICE}
            step={500}
            placeholder="Max"
            aria-label="Maximum price"
            value={priceMax === MAX_PRICE ? "" : priceMax}
            onChange={(e) => {
              const v = Number(e.target.value);
              setPriceMax(v > 0 ? Math.min(v, MAX_PRICE) : MAX_PRICE);
            }}
            className="w-full border border-line-strong bg-surface text-ink text-sm px-2.5 py-1.5 rounded-control placeholder:text-ink-faint"
          />
        </div>
        <p className="text-xs text-ink-faint mt-2">
          ₹{priceMin.toLocaleString("en-IN")} – ₹
          {priceMax.toLocaleString("en-IN")}
        </p>
      </div>
    </div>
  );

  const activeFilterChips = (selectedFinishes.length > 0 || priceFiltered) && (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {selectedFinishes.map((finish) => (
        <button
          key={finish}
          onClick={() => toggleFinish(finish)}
          className="flex items-center gap-1.5 bg-gold-tint text-gold-deep border border-gold/30 rounded-pill px-3 py-1 text-xs font-medium hover:border-gold transition-colors duration-200"
        >
          {finish}
          <X size={12} />
        </button>
      ))}
      {priceFiltered && (
        <button
          onClick={() => {
            setPriceMin(0);
            setPriceMax(MAX_PRICE);
          }}
          className="flex items-center gap-1.5 bg-gold-tint text-gold-deep border border-gold/30 rounded-pill px-3 py-1 text-xs font-medium hover:border-gold transition-colors duration-200"
        >
          ₹{priceMin.toLocaleString("en-IN")} – ₹{priceMax.toLocaleString("en-IN")}
          <X size={12} />
        </button>
      )}
      <button
        onClick={clearAllFilters}
        className="text-xs text-ink-muted hover:text-gold-deep underline underline-offset-4 transition-colors duration-200"
      >
        Clear all
      </button>
    </div>
  );

  return (
    <div>
      {/* Back button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1 text-sm text-ink-muted hover:text-gold-deep transition duration-200 ease-in-out"
        >
          <ChevronLeft size={16} /> Back to Home
        </button>
      </div>

      {/* Hero — full-bleed lifestyle image at full opacity, dark scrim
          for text legibility, left-aligned stack matching the home
          HeroSlider's visual language. */}
      <section className="relative h-[55vh] min-h-[420px] overflow-hidden mt-4 bg-brand-dark">
        <ProductImage
          src={IMAGES.kitchenHero}
          alt="Kitchen Solutions"
          className="absolute inset-0 w-full h-full"
          loading="eager"
        />

        {/* Single continuous scrim: dark at bottom-left, transparent to
            top-right so the image dominates the upper-right quadrant. */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/85 via-black/50 to-transparent pointer-events-none" />

        {/* Content stack — bottom-left, mirrors HeroSlider positioning */}
        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-10 sm:pb-14 lg:pb-16">
          <div className="flex flex-col gap-3 sm:gap-4 max-w-2xl">
            <p className="text-xs text-white/70">
              <span
                onClick={() => router.push("/")}
                className="hover:text-gold cursor-pointer hover:underline"
              >
                Home
              </span>{" "}
              / Kitchen Solutions
            </p>
            <div>
              <span className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-gold">
                Kitchen Accessories
              </span>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold leading-[1.05] text-white font-display mt-2 sm:mt-3">
                Kitchen Solutions
              </h1>
            </div>
            <p className="text-sm sm:text-base text-white/80 max-w-lg leading-relaxed">
              Explore Eryx hardware categories for baskets, shutters, hinges, pull-down
              systems, corners, and wardrobe fittings.
            </p>
            <div className="w-16 h-0.5 bg-gold mt-1" />
          </div>
        </div>
      </section>

      {/* Category chips — the single home of category filtering (the
          sidebar no longer duplicates it). */}
      <div className="sticky top-25 z-30 bg-surface border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-3">
            {["All", ...CATEGORIES].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`text-sm whitespace-nowrap rounded-pill px-4 py-1.5 transition duration-200 ease-in-out ${
                  activeTab === tab
                    ? "bg-gold text-on-gold font-medium"
                    : "border border-line text-ink-muted hover:border-gold hover:text-gold-deep"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile filter trigger */}
      <div className="lg:hidden max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="flex items-center gap-2 border border-line-strong px-4 py-2 text-sm text-ink rounded-control"
        >
          <SlidersHorizontal size={16} /> Filters
          {selectedFinishes.length > 0 && (
            <span className="bg-gold text-on-gold text-xs rounded-pill px-1.5 py-0.5 leading-none">
              {selectedFinishes.length}
            </span>
          )}
        </button>
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-80 bg-surface p-6 overflow-y-auto">
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="mb-6 text-ink-muted"
              aria-label="Close filters"
            >
              <X size={20} />
            </button>
            {filterSidebarContent}
          </div>
        </div>
      )}

      {/* Grid + Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex gap-10">
        <aside className="hidden lg:block w-56 shrink-0 self-start lg:sticky lg:top-44">
          {filterSidebarContent}
        </aside>

        <div className="flex-1 min-w-0">
          {/* Toolbar: result count + sort */}
          <div className="flex items-center justify-between gap-4 mb-5">
            <p className="text-sm text-ink-muted">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "product" : "products"}
            </p>
            <label className="flex items-center gap-2 text-sm text-ink-muted">
              Sort
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="border border-line-strong bg-surface text-ink text-sm px-3 py-1.5 rounded-control cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </label>
          </div>

          {activeFilterChips}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="text-center py-16 border border-line rounded-card">
              <p className="text-ink font-medium">
                No products match the selected filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-3 text-sm text-gold-deep hover:underline underline-offset-4"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Enquire CTA Banner */}
      <section className="bg-gold">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-bold text-2xl text-on-gold">
              Can&apos;t find what you&apos;re looking for?
            </p>
            <p className="text-on-gold/80 mt-1">
              Our team will help you find the right hardware for your project.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="tel:+917011184853"
              className="bg-brand-dark text-gold font-semibold px-6 py-3 rounded-control hover:bg-black transition duration-200 ease-in-out text-center"
            >
              Call Us: 70111 84853
            </a>
            <button
              onClick={() => openEnquiryModal()}
              className="bg-brand-dark text-gold font-semibold px-6 py-3 rounded-control hover:bg-black transition duration-200 ease-in-out"
            >
              Send Enquiry
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
