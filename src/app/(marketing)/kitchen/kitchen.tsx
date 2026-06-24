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
  const [priceRange, setPriceRange] = useState(MAX_PRICE);
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

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = activeTab === "All" || p.category === activeTab;
      const matchesFinish =
        selectedFinishes.length === 0 || selectedFinishes.includes(p.finish);
      const matchesPrice = typeof p.mrp !== "number" || p.mrp <= priceRange;
      return matchesCategory && matchesFinish && matchesPrice;
    });
  }, [products, activeTab, selectedFinishes, priceRange]);

  const filterSidebarContent = (
    <div className="flex flex-col gap-8">
      <span className="text-xs tracking-widest text-[#D4A017]">FILTERS</span>

      <div>
        <h4 className="text-sm font-semibold text-[#0A0A0A] dark:text-[#F5F5F5] mb-3">
          Category
        </h4>
        <div className="flex flex-col gap-2">
          {CATEGORIES.map((cat) => (
            <label
              key={cat}
              className="flex items-center gap-2 text-sm text-[#555555] dark:text-[#9A9A9A] cursor-pointer"
            >
              <input
                type="checkbox"
                checked={activeTab === cat}
                onChange={() => handleTabClick(activeTab === cat ? "All" : cat)}
              />
              {cat}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-[#0A0A0A] dark:text-[#F5F5F5] mb-3">
          Finish
        </h4>
        <div className="flex flex-col gap-2">
          {FINISHES.map((finish) => (
            <label
              key={finish}
              className="flex items-center gap-2 text-sm text-[#555555] dark:text-[#9A9A9A] cursor-pointer"
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
        <h4 className="text-sm font-semibold text-[#0A0A0A] dark:text-[#F5F5F5] mb-3">
          Price Range
        </h4>
        <input
          type="range"
          min={0}
          max={MAX_PRICE}
          step={500}
          value={priceRange}
          onChange={(e) => setPriceRange(Number(e.target.value))}
          className="w-full"
        />
        <p className="text-xs text-[#555555] dark:text-[#9A9A9A] mt-2">
          ₹0 – ₹{priceRange.toLocaleString("en-IN")}
        </p>
      </div>
    </div>
  );

  return (
    <div>
      {/* Back button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1 text-sm text-[#555555] dark:text-[#9A9A9A] hover:text-[#D4A017] transition duration-200 ease-in-out"
        >
          <ChevronLeft size={16} /> Back to Home
        </button>
      </div>

      {/* Hero */}
      <section
        className="relative h-[60vh] flex items-center justify-center text-center overflow-hidden mt-4"
        style={{
          background: "linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 50%, #EBEBEB 100%)",
        }}
      >
        <style>{`.kitchen-hero-dark { background: linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 50%, #0F0F0F 100%); }`}</style>
        <div className="absolute inset-0 hidden dark:block kitchen-hero-dark" />
        <ProductImage
          src={IMAGES.kitchenHero}
          alt="Kitchen Solutions"
          className="absolute inset-0 w-full h-full opacity-30"
          loading="eager"
        />
        <div className="relative px-4 max-w-2xl">
          <p className="text-xs text-[#555555] dark:text-[#9A9A9A]">
            <span
              onClick={() => router.push("/")}
              className="hover:text-[#D4A017] cursor-pointer hover:underline"
            >
              Home
            </span>{" "}
            / Kitchen Solutions
          </p>
          <h1 className="text-5xl font-bold text-[#0A0A0A] dark:text-[#F5F5F5] mt-4">
            Kitchen Solutions
          </h1>
          <p className="text-lg text-[#555555] dark:text-[#9A9A9A] mt-4">
            Explore Eryx hardware categories for baskets, shutters, hinges, pull-down
            systems, corners, and wardrobe fittings.
          </p>
          <div className="w-16 h-0.5 bg-[#D4A017] mx-auto mt-4" />
        </div>
      </section>

      {/* Category Tabs */}
      <div className="sticky top-25 z-30 bg-white dark:bg-[#0A0A0A] border-b border-[#D4D4D4] dark:border-[#2A2A2A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6 overflow-x-auto no-scrollbar py-4">
            {["All", ...CATEGORIES].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`text-sm whitespace-nowrap pb-2 border-b-2 transition duration-200 ease-in-out ${
                  activeTab === tab
                    ? "text-[#D4A017] border-[#D4A017]"
                    : "text-[#555555] dark:text-[#9A9A9A] border-transparent hover:text-[#D4A017]"
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
          className="flex items-center gap-2 border border-[#D4D4D4] dark:border-[#2A2A2A] px-4 py-2 text-sm text-[#0A0A0A] dark:text-[#F5F5F5]"
        >
          <SlidersHorizontal size={16} /> Filters
        </button>
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-80 bg-[#F5F5F5] dark:bg-[#141414] p-6 overflow-y-auto">
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="mb-6 text-[#555555] dark:text-[#9A9A9A]"
            >
              <X size={20} />
            </button>
            {filterSidebarContent}
          </div>
        </div>
      )}

      {/* Grid + Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex gap-8">
        <aside className="hidden lg:block w-60 shrink-0 bg-[#F5F5F5] dark:bg-[#141414] border-r border-[#D4D4D4] dark:border-[#2A2A2A] p-6 self-start">
          {filterSidebarContent}
        </aside>

        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <p className="text-center text-[#555555] dark:text-[#9A9A9A] py-12">
              No products match the selected filters.
            </p>
          )}
        </div>
      </div>

      {/* Enquire CTA Banner */}
      <section className="bg-[#D4A017]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-bold text-2xl text-[#0A0A0A]">
              Can&apos;t find what you&apos;re looking for?
            </p>
            <p className="text-[#0A0A0A]/80 mt-1">
              Our team will help you find the right hardware for your project.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="tel:+917011184853"
              className="bg-[#0A0A0A] text-[#D4A017] font-semibold px-6 py-3 hover:bg-[#1A1A1A] transition duration-200 ease-in-out text-center"
            >
              Call Us: 70111 84853
            </a>
            <button
              onClick={() => openEnquiryModal()}
              className="bg-[#0A0A0A] text-[#D4A017] font-semibold px-6 py-3 hover:bg-[#1A1A1A] transition duration-200 ease-in-out"
            >
              Send Enquiry
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}