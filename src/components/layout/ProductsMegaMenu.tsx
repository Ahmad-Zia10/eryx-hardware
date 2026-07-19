"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import type { CategoryGroup, ProductLine } from "@/lib/db/categories";

interface Props {
  categoryGroups: CategoryGroup[];
  onNavigate: () => void;
  // Optional hover forwarding — lets the parent Navbar cancel its
  // pending close timer when the cursor enters the menu, and start
  // one when it leaves. Without this, moving from trigger to menu
  // would fire mouseleave-on-trigger and close the panel.
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const PRODUCT_LINE_LABELS: Record<ProductLine, string> = {
  kitchen: "Kitchen",
  wardrobe: "Wardrobe",
  hardware: "Hardware",
};

const PRODUCT_LINE_HREF: Record<ProductLine, string> = {
  kitchen: "/kitchen",
  wardrobe: "/wardrobe",
  // No dedicated route yet — fall back to the shop root.
  hardware: "/kitchen",
};

const EXPLORE_LINKS = [
  { label: "All products", href: "/kitchen" },
  { label: "Deals & Offers", href: "/deals" },
  { label: "Bulk enquiry", href: "/bulk-enquiry" },
  { label: "Contact us", href: "/contact" },
];

export default function ProductsMegaMenu({
  categoryGroups,
  onNavigate,
  onMouseEnter,
  onMouseLeave,
}: Props) {
  // Filter to the two customer-facing lines by default. Hardware is
  // a real product_line value but there's no /hardware page today
  // and the products under it currently overlap kitchen categories.
  const visibleGroups = categoryGroups.filter(
    (g) => g.productLine === "kitchen" || g.productLine === "wardrobe"
  );

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute left-1/2 -translate-x-1/2 top-full z-40 w-screen max-w-6xl px-4 sm:px-6 lg:px-8"
    >
      <div className="mt-2 bg-white dark:bg-[#111111] border border-[#D4D4D4] dark:border-[#2A2A2A] shadow-2xl rounded-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-[#D4D4D4] dark:divide-[#2A2A2A]">
          {visibleGroups.map((group) => (
            <MegaColumn
              key={group.productLine}
              group={group}
              onNavigate={onNavigate}
            />
          ))}
          <ExploreColumn onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
}

function MegaColumn({
  group,
  onNavigate,
}: {
  group: CategoryGroup;
  onNavigate: () => void;
}) {
  const lineLabel = PRODUCT_LINE_LABELS[group.productLine];
  const lineHref = PRODUCT_LINE_HREF[group.productLine];
  const hasCategories = group.categories.length > 0;

  return (
    <div className="p-6">
      <div className="flex items-baseline justify-between mb-4">
        <span className="text-[10px] tracking-[0.3em] uppercase text-[#D4A017] font-semibold">
          {lineLabel}
        </span>
        {hasCategories && (
          <Link
            href={lineHref}
            onClick={onNavigate}
            className="text-[10px] tracking-widest uppercase text-[#9A9A9A] hover:text-[#D4A017] transition-colors"
          >
            All
          </Link>
        )}
      </div>

      {hasCategories ? (
        <ul className="flex flex-col gap-0.5">
          {group.categories.map((cat) => (
            <li key={cat.slug}>
              <Link
                href={`${lineHref}?category=${encodeURIComponent(cat.name)}`}
                onClick={onNavigate}
                className="group flex items-center justify-between gap-3 px-3 py-2 rounded-sm text-sm text-[#0A0A0A] dark:text-[#F5F5F5] hover:bg-[#F5F5F5] dark:hover:bg-[#1F1F1F] hover:text-[#D4A017] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <ChevronRight
                    size={14}
                    className="text-[#D4A017] opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                  {cat.name}
                </span>
                <span className="text-xs text-[#9A9A9A]">{cat.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-sm border border-dashed border-[#D4D4D4] dark:border-[#2A2A2A] p-4">
          <p className="text-sm text-[#0A0A0A] dark:text-[#F5F5F5] font-medium">
            {lineLabel} range coming soon
          </p>
          <p className="text-xs text-[#6B6B6B] dark:text-[#9A9A9A] mt-1">
            Get in touch for {lineLabel.toLowerCase()} requirements.
          </p>
          <Link
            href="/contact"
            onClick={onNavigate}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#D4A017] hover:text-[#E8B820] mt-3"
          >
            Contact us
            <ArrowRight size={12} />
          </Link>
        </div>
      )}
    </div>
  );
}

function ExploreColumn({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="p-6">
      <span className="text-[10px] tracking-[0.3em] uppercase text-[#D4A017] font-semibold block mb-4">
        Explore
      </span>
      <ul className="flex flex-col gap-0.5">
        {EXPLORE_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              onClick={onNavigate}
              className="group flex items-center justify-between gap-3 px-3 py-2 rounded-sm text-sm text-[#0A0A0A] dark:text-[#F5F5F5] hover:bg-[#F5F5F5] dark:hover:bg-[#1F1F1F] hover:text-[#D4A017] transition-colors"
            >
              <span>{link.label}</span>
              <ArrowRight
                size={14}
                className="text-[#D4A017] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
