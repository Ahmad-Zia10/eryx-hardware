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
  hardware: "/hardware",
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
  // The three customer-facing lines, each with its own listing page.
  const visibleGroups = categoryGroups.filter(
    (g) =>
      g.productLine === "kitchen" ||
      g.productLine === "wardrobe" ||
      g.productLine === "hardware"
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
        <div className="relative overflow-hidden border-2 border-line-strong bg-surface-raised shadow-[0_20px_60px_-15px_rgba(32,30,29,0.25)]">
          {/* Flat red accent rule at the top (Modernist — no gradient) */}
          <div className="h-[2px] w-full bg-gold" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-0 divide-y md:divide-y-0 md:divide-x divide-line">
            {visibleGroups.map((group) => (
              <div key={group.productLine} className="md:col-span-3">
                <MegaColumn group={group} onNavigate={onNavigate} />
              </div>
            ))}
            <div className="md:col-span-3">
              <ExploreColumn onNavigate={onNavigate} />
            </div>
          </div>

          {/* Footer strip */}
          <div className="border-t border-line bg-surface-sunken px-6 py-3 flex items-center justify-between gap-4">
            <p className="text-xs text-ink-muted">
              <span className="text-gold-deep font-semibold">Free shipping</span> on orders over ₹5,000 · Pan-India delivery
            </p>
            <Link
              href="/products"
              onClick={onNavigate}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink hover:text-gold transition-colors"
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
            <span className="h-3 w-[2px] bg-gold" />
            <span className="text-[10px] tracking-[0.3em] uppercase text-gold font-bold">
              {lineLabel}
            </span>
          </div>
          {hasCategories && (
            <Link
              href={lineHref}
              onClick={onNavigate}
              className="inline-flex items-center gap-1 text-[10px] tracking-widest uppercase text-ink-faint hover:text-gold transition-colors"
            >
              View all
              <ArrowRight size={10} />
            </Link>
          )}
        </div>
        <p className="text-xs text-ink-muted pl-3.5">
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
                className="group flex items-center justify-between gap-3 px-3 py-2 text-sm text-ink hover:bg-gold-tint hover:text-gold-deep transition-colors"
              >
                <span className="flex items-center gap-2">
                  <ChevronRight
                    size={14}
                    className="text-gold -ml-1 opacity-0 group-hover:opacity-100 group-hover:ml-0 transition-all"
                  />
                  <span className="group-hover:translate-x-0.5 transition-transform">
                    {cat.name}
                  </span>
                </span>
                <span className="text-[10px] font-semibold text-ink-faint group-hover:text-on-gold bg-surface-sunken group-hover:bg-gold px-2 py-0.5 transition-colors">
                  {cat.count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="border border-dashed border-line-strong p-4 bg-surface-sunken">
          <p className="text-sm text-ink font-medium">
            {lineLabel} range coming soon
          </p>
          <p className="text-xs text-ink-muted mt-1">
            Get in touch for {lineLabel.toLowerCase()} requirements.
          </p>
          <Link
            href="/contact"
            onClick={onNavigate}
            className="inline-flex items-center gap-1 text-xs font-semibold text-gold-deep hover:text-gold mt-3"
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
          <span className="h-3 w-[2px] bg-gold" />
          <span className="text-[10px] tracking-[0.3em] uppercase text-gold font-bold">
            Explore
          </span>
        </div>
        <p className="text-xs text-ink-muted pl-3.5">
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
                className="group flex items-center gap-3 px-3 py-2 text-sm text-ink hover:bg-gold-tint transition-colors"
              >
                <span className="flex items-center justify-center h-8 w-8 bg-surface-sunken group-hover:bg-gold group-hover:text-on-gold text-ink-muted transition-colors shrink-0">
                  <Icon size={14} />
                </span>
                <span className="flex flex-col flex-1 min-w-0">
                  <span className="font-medium group-hover:text-gold-deep transition-colors leading-tight">
                    {link.label}
                  </span>
                  <span className="text-[11px] text-ink-muted leading-tight">
                    {link.description}
                  </span>
                </span>
                <ArrowRight
                  size={14}
                  className="text-gold opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0"
                />
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Promotional callout — flat red poster block (Modernist: full-red
          statement field, no gradient, no rounded decoration). */}
      <div className="mt-4 relative overflow-hidden bg-gold p-4">
        <p className="text-[10px] tracking-[0.2em] uppercase text-on-gold/70 font-bold mb-1">
          Trade & Projects
        </p>
        <p className="text-sm font-semibold text-on-gold leading-snug mb-2">
          Special pricing for architects & dealers
        </p>
        <Link
          href="/dealer-enquiry"
          onClick={onNavigate}
          className="inline-flex items-center gap-1 text-xs font-bold text-on-gold hover:gap-1.5 transition-all"
        >
          Get in touch
          <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}
