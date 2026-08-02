"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import ProductImage from "@/components/ui/ProductImage";

export type FocusPanel = {
  label: string;
  href: string;
  image: string;
  count?: number;
  // Preformatted cheapest price, e.g. "₹1,800". Rendered as "from ₹…".
  fromPrice?: string;
};

/**
 * "Categories in focus" — the Modernist draggable filmstrip.
 *
 * One small client island by design (the rest of the home page stays a
 * server component). Interaction is built on native `overflow-x` scroll
 * plus pointer-drag and wheel-to-horizontal — NO new libraries, no
 * WebGL/canvas (rejected in the handoff for weight + it breaks the flat
 * zero-radius system). A red progress bar tracks scroll position.
 *
 * Imagery is EDITORIAL here, so panels render grayscale.
 */
export default function CategoriesFocus({ panels }: { panels: FocusPanel[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);

  // Pointer-drag state. Refs (not state) so the move handler doesn't
  // re-run React on every mousemove — this is a 60fps path.
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: false });

  const updateProgress = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 0);
  }, []);

  useEffect(() => {
    updateProgress();
    window.addEventListener("resize", updateProgress);
    return () => window.removeEventListener("resize", updateProgress);
  }, [updateProgress]);

  // Wheel → horizontal. Registered as a NON-passive native listener so
  // preventDefault actually works (React's synthetic onWheel is passive
  // at the root, where preventDefault is a no-op + warns). Only hijacks
  // vertical wheel intent when there's somewhere to scroll horizontally,
  // so the page keeps scrolling once the rail hits its end.
  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        const atStart = el.scrollLeft <= 0;
        const atEnd = el.scrollLeft >= max - 1;
        if ((e.deltaY < 0 && atStart) || (e.deltaY > 0 && atEnd)) return;
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    const el = railRef.current;
    if (!el) return;
    drag.current = {
      active: true,
      startX: e.clientX,
      startScroll: el.scrollLeft,
      moved: false,
    };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const el = railRef.current;
    if (!el || !drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    el.scrollLeft = drag.current.startScroll - dx;
  };

  const endDrag = () => {
    drag.current.active = false;
    setDragging(false);
  };

  // Suppress the click that follows a drag (so dragging the rail doesn't
  // navigate). A genuine click leaves `moved` false.
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  return (
    <section className="bg-brand-dark text-brand-cream py-11">
      {/* Section header — red kicker + title + drag hint, 2px rule */}
      <div className="flex items-baseline justify-between border-b-2 border-brand-cream/30 pb-3.5 mx-4 sm:mx-6 lg:mx-12">
        <div className="flex items-baseline gap-4">
          <span className="text-sm font-extrabold text-gold">02</span>
          <h2 className="text-2xl sm:text-3xl tracking-[-0.02em] font-extrabold text-brand-cream">
            Categories in focus
          </h2>
        </div>
        <span className="hidden sm:block text-[11px] tracking-[0.16em] uppercase text-brand-cream/50">
          Drag or scroll to explore →
        </span>
      </div>

      {/* Rail */}
      <div
        ref={railRef}
        onScroll={updateProgress}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={onClickCapture}
        onDragStart={(e) => e.preventDefault()}
        className={`flex gap-0.5 overflow-x-auto no-scrollbar select-none px-4 sm:px-6 lg:px-12 pt-6 ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {panels.map((panel, i) => (
          <Link
            key={panel.label}
            href={panel.href}
            draggable={false}
            className="group relative shrink-0 w-[260px] sm:w-[300px] h-[380px] sm:h-[430px] overflow-hidden bg-brand-dark"
          >
            <ProductImage
              src={panel.image}
              alt={panel.label}
              grayscale
              className="absolute inset-0 w-full h-full opacity-90 transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
            <span className="absolute top-3.5 left-3.5 text-xs font-extrabold text-brand-cream">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-dark via-brand-dark/60 to-transparent pt-8 px-4 pb-4">
              <div className="text-lg sm:text-xl font-extrabold tracking-[-0.01em]">
                {panel.label}
              </div>
              {typeof panel.count === "number" && (
                <div className="text-xs text-brand-cream/60 mt-1">
                  {panel.count} {panel.count === 1 ? "product" : "products"}
                  {panel.fromPrice ? ` · from ${panel.fromPrice}` : ""}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Scroll-progress bar — red fill on a faint track */}
      <div className="relative h-[3px] bg-brand-cream/15 mx-4 sm:mx-6 lg:mx-12 mt-6">
        <div
          className="absolute left-0 top-0 bottom-0 bg-gold transition-[width] duration-150 ease-out"
          style={{ width: `${Math.max(12, progress * 100)}%` }}
        />
      </div>
    </section>
  );
}
