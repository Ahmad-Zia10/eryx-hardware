"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, Search } from "lucide-react";
import { formatProductPrice } from "@/lib/pricing";
import type { DbProduct } from "@/lib/db/products";

interface SearchOverlayProps {
  onClose: () => void;
}

export default function SearchOverlay({ onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DbProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount and lock body scroll
  useEffect(() => {
    inputRef.current?.focus();
    document.body.style.overflow = "hidden";
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  useEffect(() => {
    const controller = new AbortController();
    const value = query.trim();
    if (!value) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(value)}`, {
          signal: controller.signal,
        });
        const data = await response.json();
        setResults(data.products || []);
      } catch (error: any) {
        if (error.name !== "AbortError") {
          setResults([]);
        }
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  const handleSelect = (slug: string) => {
    router.push(`/kitchen/${slug}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-3xl bg-white dark:bg-[#111111] rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[80vh] mt-16 sm:mt-24">
        
        {/* Search Header */}
        <div className="flex items-center px-6 py-4 border-b border-[#E8E4DD] dark:border-[#2A2A2A]">
          <Search className="text-[#9A9A9A] mr-4" size={24} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products by name or code..."
            className="flex-1 bg-transparent text-lg text-[#0A0A0A] dark:text-[#F5F5F5] placeholder-[#9A9A9A] focus:outline-none"
          />
          <button
            onClick={onClose}
            className="text-[#555555] dark:text-[#9A9A9A] hover:text-[#D4A017] p-2 transition"
            aria-label="Close search"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto">
          {!query ? (
            <div className="p-12 text-center text-[#555555] dark:text-[#9A9A9A]">
              <p>Start typing to search products</p>
            </div>
          ) : isSearching ? (
            <div className="p-12 text-center text-[#555555] dark:text-[#9A9A9A]">
              <p>Searching...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-12 text-center text-[#555555] dark:text-[#9A9A9A]">
              <p>No results found for &quot;{query}&quot;</p>
            </div>
          ) : (
            <ul className="divide-y divide-[#E8E4DD] dark:divide-[#2A2A2A]">
              {results.map((product) => (
                <li key={product.code}>
                  <button
                    onClick={() => handleSelect(product.slug)}
                    className="w-full text-left px-6 py-4 hover:bg-[#F5F5F5] dark:hover:bg-[#1F1F1F] transition flex items-center justify-between group"
                  >
                    <div>
                      <h4 className="font-semibold text-[#0A0A0A] dark:text-[#F5F5F5] group-hover:text-[#D4A017] transition">
                        {product.name}
                      </h4>
                      <p className="text-sm text-[#555555] dark:text-[#9A9A9A] mt-1">
                        {product.code} • {product.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-[#0A0A0A] dark:text-[#F5F5F5]">
                        {formatProductPrice(product)}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
