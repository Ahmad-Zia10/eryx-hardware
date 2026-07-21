"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, Search, ChevronRight, Loader2, SearchX } from "lucide-react";
import ProductImage from "@/components/ui/ProductImage";
import { formatProductPrice } from "@/lib/pricing";
import type { DbProduct } from "@/lib/db/products";

interface SearchOverlayProps {
  onClose: () => void;
}

export default function SearchOverlay({ onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DbProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  // Index of the keyboard-highlighted result (-1 = none).
  const [activeIndex, setActiveIndex] = useState(-1);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

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
      setActiveIndex(-1);
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
        setActiveIndex(-1);
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

  // Arrow keys move the highlight; Enter opens the highlighted result
  // (or the first result if none is highlighted yet).
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      const target = activeIndex >= 0 ? results[activeIndex] : results[0];
      if (target) handleSelect(target.slug);
    }
  };

  // Keep the highlighted row scrolled into view.
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const el = listRef.current.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-center p-4 sm:p-6 lg:p-8"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Product search"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl bg-surface-raised rounded-card shadow-[0_24px_64px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[80vh] mt-16 sm:mt-24 origin-top animate-[dropdown_140ms_ease-out]"
      >
        {/* Search Header */}
        <div className="flex items-center px-5 py-4 border-b border-line">
          <Search className="text-ink-faint mr-3 shrink-0" size={22} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search products by name or code..."
            className="flex-1 bg-transparent text-lg text-ink placeholder:text-ink-faint focus:outline-none"
          />
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-gold-deep p-2 -mr-2 transition-colors duration-200"
            aria-label="Close search"
          >
            <X size={22} />
          </button>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto">
          {!query ? (
            <EmptyState
              icon={<Search size={26} className="text-ink-faint" />}
              title="Start typing to search"
              body="Find any product by name or item code."
            />
          ) : isSearching ? (
            <div className="p-16 flex flex-col items-center text-ink-muted">
              <Loader2 size={26} className="animate-spin text-gold" />
              <p className="mt-3 text-sm">Searching…</p>
            </div>
          ) : results.length === 0 ? (
            <EmptyState
              icon={<SearchX size={26} className="text-ink-faint" />}
              title={`No results for “${query}”`}
              body="Try a different name or item code."
            />
          ) : (
            <ul ref={listRef} className="p-2">
              {results.map((product, index) => {
                const active = index === activeIndex;
                return (
                  <li key={product.code}>
                    <button
                      onClick={() => handleSelect(product.slug)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`group/row w-full text-left px-3 py-3 rounded-control flex items-center gap-4 transition-colors duration-150 ${
                        active ? "bg-surface-sunken" : "hover:bg-surface-sunken"
                      }`}
                    >
                      <div className="w-14 h-14 shrink-0 rounded-control overflow-hidden bg-surface-sunken border border-line">
                        <ProductImage
                          src={product.image}
                          alt={product.name}
                          fit="contain"
                          className="w-full h-full"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4
                          className={`font-medium font-serif truncate transition-colors duration-150 ${
                            active ? "text-gold-deep" : "text-ink group-hover/row:text-gold-deep"
                          }`}
                        >
                          {product.name}
                        </h4>
                        <p className="text-xs text-ink-muted mt-0.5 truncate">
                          <span className="uppercase tracking-wider">{product.code}</span>
                          <span className="mx-1.5 text-ink-faint">·</span>
                          {product.category}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-ink whitespace-nowrap">
                        {formatProductPrice(product)}
                      </span>
                      <ChevronRight
                        size={16}
                        className={`shrink-0 text-ink-faint transition-all duration-150 ${
                          active
                            ? "opacity-100 translate-x-0"
                            : "opacity-0 -translate-x-1 group-hover/row:opacity-100 group-hover/row:translate-x-0"
                        }`}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer hint — keyboard affordances */}
        {results.length > 0 && (
          <div className="hidden sm:flex items-center gap-4 px-5 py-2.5 border-t border-line text-[11px] text-ink-faint">
            <span>
              <kbd className="font-sans">↑</kbd> <kbd className="font-sans">↓</kbd> to navigate
            </span>
            <span>
              <kbd className="font-sans">↵</kbd> to open
            </span>
            <span>
              <kbd className="font-sans">esc</kbd> to close
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="p-16 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-full bg-surface-sunken flex items-center justify-center mb-4">
        {icon}
      </div>
      <p className="text-ink font-medium">{title}</p>
      <p className="text-sm text-ink-muted mt-1">{body}</p>
    </div>
  );
}
