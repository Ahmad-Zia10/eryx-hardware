"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, SlidersHorizontal, X } from "lucide-react";
import ProductImage from "@/components/ui/ProductImage";
import ProductCard from "@/components/sections/ProductCard";
import { useUI } from "@/context/UIContext";
import { IMAGES } from "@/lib/catalogue-data";
import type { DbProduct } from "@/lib/db/products";

const MAX_PRICE = 35000;

type SortKey = "featured" | "price-asc" | "price-desc";

// Product-line filter values. "all" shows every line.
const LINES: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "kitchen", label: "Kitchen" },
  { key: "wardrobe", label: "Wardrobe" },
  { key: "hardware", label: "Hardware" },
];

interface AllProductsProps {
  products: DbProduct[];
}

export default function AllProducts({ products }: AllProductsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL is the source of truth for line + category so the page is
  // shareable/deep-linkable (e.g. /products?line=wardrobe).
  const activeLine = searchParams.get("line") || "all";
  const activeCategory = searchParams.get("category") || "All";

  const [selectedFinishes, setSelectedFinishes] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(MAX_PRICE);
  const [sortKey, setSortKey] = useState<SortKey>("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const { openEnquiryModal } = useUI();

  // Derive the category + finish option lists from the actual product set,
  // scoped to the active line, so the filters never list something that
  // can't appear. This keeps the page correct as inventory changes — no
  // hardcoded category arrays to drift.
  const productsInLine = useMemo(
    () =>
      activeLine === "all"
        ? products
        : products.filter((p) => p.product_line === activeLine),
    [products, activeLine]
  );

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of productsInLine) if (p.category) set.add(p.category);
    return Array.from(set).sort();
  }, [productsInLine]);

  const finishes = useMemo(() => {
    const set = new Set<string>();
    for (const p of productsInLine) if (p.finish) set.add(p.finish);
    return Array.from(set).sort();
  }, [productsInLine]);

  const pushParams = (mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    const query = params.toString();
    router.push(query ? `/products?${query}` : "/products");
  };

  const handleLineClick = (line: string) => {
    pushParams((params) => {
      if (line === "all") params.delete("line");
      else params.set("line", line);
      // Category options change per line — reset category to avoid an
      // orphaned filter that matches nothing.
      params.delete("category");
    });
  };

  const handleCategoryClick = (category: string) => {
    pushParams((params) => {
      if (category === "All") params.delete("category");
      else params.set("category", category);
    });
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
    if (activeCategory !== "All") handleCategoryClick("All");
  };

  const filteredProducts = useMemo(() => {
    const filtered = productsInLine.filter((p) => {
      const matchesCategory = activeCategory === "All" || p.category === activeCategory;
      const matchesFinish =
        selectedFinishes.length === 0 || selectedFinishes.includes(p.finish);
      const matchesPrice =
        typeof p.mrp !== "number" || (p.mrp >= priceMin && p.mrp <= priceMax);
      return matchesCategory && matchesFinish && matchesPrice;
    });
    if (sortKey === "featured") return filtered;
    return [...filtered].sort((a, b) => {
      const pa = typeof a.mrp === "number" ? a.mrp : null;
      const pb = typeof b.mrp === "number" ? b.mrp : null;
      if (pa === null && pb === null) return 0;
      if (pa === null) return 1;
      if (pb === null) return -1;
      return sortKey === "price-asc" ? pa - pb : pb - pa;
    });
  }, [productsInLine, activeCategory, selectedFinishes, priceMin, priceMax, sortKey]);

  const filterSidebarContent = (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-line pb-2.5">
        <span className="text-xs font-extrabold tracking-[0.06em] uppercase text-ink">
          Filters
        </span>
        {(selectedFinishes.length > 0 || priceFiltered) && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-gold-deep hover:text-gold transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {finishes.length > 0 && (
        <div className="border-b border-line pb-6">
          <h4 className="text-[11px] font-semibold tracking-[0.12em] uppercase text-ink-faint mb-3">
            Finish
          </h4>
          <div className="flex flex-col gap-2">
            {finishes.map((finish) => (
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
      )}

      <div>
        <h4 className="text-[11px] font-semibold tracking-[0.12em] uppercase text-ink-faint mb-3">
          Price range
        </h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={MAX_PRICE}
            step={500}
            placeholder="Min"
            aria-label="Minimum price"
            value={priceMin === 0 ? "" : priceMin}
            onChange={(e) => setPriceMin(Math.max(0, Number(e.target.value) || 0))}
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
          ₹{priceMin.toLocaleString("en-IN")} – ₹{priceMax.toLocaleString("en-IN")}
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
          className="flex items-center gap-1.5 bg-gold-tint text-gold-deep border border-gold/40 px-3 py-1 text-xs font-medium hover:border-gold transition-colors duration-200"
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
          className="flex items-center gap-1.5 bg-gold-tint text-gold-deep border border-gold/40 px-3 py-1 text-xs font-medium hover:border-gold transition-colors duration-200"
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

      {/* Hero */}
      <section className="relative h-[48vh] min-h-[360px] overflow-hidden mt-4 bg-brand-dark">
        <ProductImage
          src={IMAGES.allProductsHero}
          alt="All Eryx products"
          grayscale
          className="absolute inset-0 w-full h-full opacity-70"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/90 via-brand-dark/50 to-transparent pointer-events-none" />
        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-10 sm:pb-14 lg:pb-16">
          <div className="flex flex-col gap-3 sm:gap-4 max-w-2xl">
            <p className="text-xs text-brand-cream/70">
              <span
                onClick={() => router.push("/")}
                className="hover:text-gold cursor-pointer hover:underline"
              >
                Home
              </span>{" "}
              / <span className="text-brand-cream font-bold">All Products</span>
            </p>
            <div className="flex items-center gap-3">
              <span className="w-11 h-[2px] bg-gold" />
              <span className="text-[10px] sm:text-xs tracking-[0.2em] uppercase font-extrabold text-gold">
                The Full Catalogue
              </span>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold leading-[0.96] tracking-[-0.03em] text-brand-cream font-display">
              All Products
            </h1>
            <p className="text-sm sm:text-base text-brand-cream/80 max-w-lg leading-relaxed">
              Every Eryx accessory in one place — kitchen storage, wardrobe
              fittings, and precision hardware. Filter by line, category, finish,
              and price.
            </p>
          </div>
        </div>
      </section>

      {/* Product-line + category filter bar */}
      <div className="sticky top-25 z-30 bg-surface border-b-2 border-line-strong">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Product line */}
          <div className="flex overflow-x-auto no-scrollbar">
            {LINES.map((line, i) => (
              <button
                key={line.key}
                onClick={() => handleLineClick(line.key)}
                className={`text-sm whitespace-nowrap px-5 py-3 transition duration-200 ease-in-out ${
                  i > 0 ? "border-l border-line" : ""
                } ${
                  activeLine === line.key
                    ? "bg-ink text-brand-cream font-extrabold"
                    : "text-ink-muted hover:text-gold-deep"
                }`}
              >
                {line.label}
              </button>
            ))}
          </div>
          {/* Category (scoped to the active line) */}
          {categories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-3 border-t border-line">
              {["All", ...categories].map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`text-xs whitespace-nowrap px-3 py-1.5 border transition duration-200 ease-in-out ${
                    activeCategory === cat
                      ? "bg-ink text-brand-cream border-ink font-bold"
                      : "border-line text-ink-muted hover:border-gold hover:text-gold-deep"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
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
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileFiltersOpen(false)} />
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
          <div className="flex items-center justify-between gap-4 mb-5 border-b border-line pb-4">
            <p className="text-sm text-ink-muted">
              <strong className="text-ink font-bold">{filteredProducts.length}</strong>{" "}
              {filteredProducts.length === 1 ? "product" : "products"}
            </p>
            <label className="flex items-center gap-2 text-xs uppercase tracking-[0.1em] text-ink-faint">
              Sort
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="border border-line-strong bg-surface text-ink text-sm font-bold px-3 py-1.5 cursor-pointer normal-case tracking-normal"
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
            <div className="text-center py-16 border border-line">
              <p className="text-ink font-medium">No products match the selected filters.</p>
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

      {/* "Can't find your fitting?" — full-red statement band. */}
      <section className="bg-gold text-on-gold">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <p className="font-extrabold text-2xl sm:text-3xl tracking-[-0.02em]">
              Can&apos;t find your fitting?
            </p>
            <p className="text-on-gold/85 mt-2">
              Our team will help you find the right hardware for your project.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <a
              href="tel:+917011184853"
              className="bg-brand-cream text-ink font-bold px-6 py-3.5 hover:bg-surface-raised transition duration-200 ease-in-out text-center"
            >
              Call Us: 70111 84853
            </a>
            <button
              onClick={() => openEnquiryModal()}
              className="border border-on-gold/50 text-on-gold font-bold px-6 py-3.5 hover:bg-on-gold hover:text-gold transition duration-200 ease-in-out"
            >
              Send Enquiry
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
