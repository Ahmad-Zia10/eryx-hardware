"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, ChevronRight, Sparkles, ShoppingBag, PhoneCall, Tag } from "lucide-react";
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

const PRODUCT_LINE_TAGLINES: Record<ProductLine, string> = {
  kitchen: "Storage systems, hinges & pull-outs",
  wardrobe: "Sliding, lifting & organiser hardware",
  hardware: "Precision fittings for modular spaces",
};

const PRODUCT_LINE_HREF: Record<ProductLine, string> = {
  kitchen: "/kitchen",
  wardrobe: "/wardrobe",
  // No dedicated route yet — fall back to the shop root.
  hardware: "/kitchen",
};

type ExploreLink = {
  label: string;
  description: string;
  href: string;
  Icon: typeof ShoppingBag;
};

const EXPLORE_LINKS: ExploreLink[] = [
  { label: "All products", description: "Browse the full catalogue", href: "/products", Icon: ShoppingBag },
  { label: "Deals & Offers", description: "Discounts on select SKUs", href: "/deals", Icon: Tag },
  { label: "Bulk enquiry", description: "Trade & project pricing", href: "/bulk-enquiry", Icon: Sparkles },
  { label: "Contact us", description: "Talk to our team", href: "/contact", Icon: PhoneCall },
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
    // Positioning: anchored to the nav bar (not the Products button) so the
    // panel spans the header's max-w-7xl container. `left-0 right-0` + inner
    // `max-w-7xl mx-auto` keeps it aligned with the rest of the site content
    // and prevents left-edge clipping on wide viewports.
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute left-0 right-0 top-full z-40 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto mt-3">
        <div className="relative overflow-hidden rounded-lg border border-[#D4D4D4] dark:border-[#2A2A2A] bg-white dark:bg-[#0F0F0F] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]">
          {/* Gold accent stripe at the top */}
          <div className="h-[3px] w-full bg-gradient-to-r from-[#D4A017] via-[#E8B820] to-[#D4A017]" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-0 divide-y md:divide-y-0 md:divide-x divide-[#EDEDED] dark:divide-[#222222]">
            {visibleGroups.map((group) => (
              <div key={group.productLine} className="md:col-span-4">
                <MegaColumn group={group} onNavigate={onNavigate} />
              </div>
            ))}
            <div className="md:col-span-4">
              <ExploreColumn onNavigate={onNavigate} />
            </div>
          </div>

          {/* Footer strip */}
          <div className="border-t border-[#EDEDED] dark:border-[#222222] bg-[#FAFAFA] dark:bg-[#0A0A0A] px-6 py-3 flex items-center justify-between gap-4">
            <p className="text-xs text-[#6B6B6B] dark:text-[#9A9A9A]">
              <span className="text-[#D4A017] font-semibold">Free shipping</span> on orders over ₹5,000 · Pan-India delivery
            </p>
            <Link
              href="/products"
              onClick={onNavigate}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0A0A0A] dark:text-[#F5F5F5] hover:text-[#D4A017] transition-colors"
            >
              Shop everything
              <ArrowUpRight size={12} />
            </Link>
          </div>
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
  const lineTagline = PRODUCT_LINE_TAGLINES[group.productLine];
  const lineHref = PRODUCT_LINE_HREF[group.productLine];
  const hasCategories = group.categories.length > 0;

  return (
    <div className="p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D4A017]" />
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#D4A017] font-semibold">
              {lineLabel}
            </span>
          </div>
          {hasCategories && (
            <Link
              href={lineHref}
              onClick={onNavigate}
              className="inline-flex items-center gap-1 text-[10px] tracking-widest uppercase text-[#9A9A9A] hover:text-[#D4A017] transition-colors"
            >
              View all
              <ArrowRight size={10} />
            </Link>
          )}
        </div>
        <p className="text-xs text-[#6B6B6B] dark:text-[#9A9A9A] pl-3.5">
          {lineTagline}
        </p>
      </div>

      {hasCategories ? (
        <ul className="flex flex-col gap-0.5">
          {group.categories.map((cat) => (
            <li key={cat.slug}>
              <Link
                href={`${lineHref}?category=${encodeURIComponent(cat.name)}`}
                onClick={onNavigate}
                className="group flex items-center justify-between gap-3 px-3 py-2 rounded-md text-sm text-[#0A0A0A] dark:text-[#F5F5F5] hover:bg-[#FFF9EB] dark:hover:bg-[#1F1A0F] hover:text-[#D4A017] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <ChevronRight
                    size={14}
                    className="text-[#D4A017] -ml-1 opacity-0 group-hover:opacity-100 group-hover:ml-0 transition-all"
                  />
                  <span className="group-hover:translate-x-0.5 transition-transform">
                    {cat.name}
                  </span>
                </span>
                <span className="text-[10px] font-semibold text-[#9A9A9A] group-hover:text-[#D4A017] bg-[#F5F5F5] dark:bg-[#1F1F1F] group-hover:bg-[#FFF3D1] dark:group-hover:bg-[#2A2210] px-2 py-0.5 rounded-full transition-colors">
                  {cat.count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-md border border-dashed border-[#D4D4D4] dark:border-[#2A2A2A] p-4 bg-[#FAFAFA] dark:bg-[#141414]">
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
    <div className="p-6 flex flex-col h-full">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#D4A017]" />
          <span className="text-[10px] tracking-[0.3em] uppercase text-[#D4A017] font-semibold">
            Explore
          </span>
        </div>
        <p className="text-xs text-[#6B6B6B] dark:text-[#9A9A9A] pl-3.5">
          Shortcuts, deals & help
        </p>
      </div>

      <ul className="flex flex-col gap-0.5">
        {EXPLORE_LINKS.map((link) => {
          const Icon = link.Icon;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={onNavigate}
                className="group flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[#0A0A0A] dark:text-[#F5F5F5] hover:bg-[#FFF9EB] dark:hover:bg-[#1F1A0F] transition-colors"
              >
                <span className="flex items-center justify-center h-8 w-8 rounded-md bg-[#F5F5F5] dark:bg-[#1F1F1F] group-hover:bg-[#D4A017] group-hover:text-[#0A0A0A] text-[#555555] dark:text-[#9A9A9A] transition-colors shrink-0">
                  <Icon size={14} />
                </span>
                <span className="flex flex-col flex-1 min-w-0">
                  <span className="font-medium group-hover:text-[#D4A017] transition-colors leading-tight">
                    {link.label}
                  </span>
                  <span className="text-[11px] text-[#6B6B6B] dark:text-[#9A9A9A] leading-tight">
                    {link.description}
                  </span>
                </span>
                <ArrowRight
                  size={14}
                  className="text-[#D4A017] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0"
                />
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Promotional callout — fills the visual gap at the bottom of the column */}
      <div className="mt-4 relative overflow-hidden rounded-md bg-gradient-to-br from-[#D4A017] to-[#B8890F] p-4">
        <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/10" />
        <div className="absolute -right-8 -bottom-8 h-20 w-20 rounded-full bg-white/5" />
        <div className="relative">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#0A0A0A]/70 font-bold mb-1">
            Trade & Projects
          </p>
          <p className="text-sm font-semibold text-[#0A0A0A] leading-snug mb-2">
            Special pricing for architects & dealers
          </p>
          <Link
            href="/dealer-enquiry"
            onClick={onNavigate}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#0A0A0A] hover:gap-1.5 transition-all"
          >
            Get in touch
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
