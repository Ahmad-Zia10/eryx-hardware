import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductImage from "@/components/ui/ProductImage";
import TalkToExpertButton from "./TalkToExpertButton";
import { IMAGES } from "@/lib/catalogue-data";
import type {
  LineOverview,
  OverviewCategory,
  ProductLine,
  ProductsOverview,
} from "@/lib/db/categories";
import { formatPrice } from "@/lib/pricing";

// Per-line presentation: the listing-page href, hero photo, and the
// short editorial line shown over the collection tile. The category
// counts / prices come from live data (ProductsOverview) — only the
// imagery and copy are hand-set here.
const LINE_META: Record<
  ProductLine,
  { label: string; href: string; image: string; blurb: string }
> = {
  kitchen: {
    label: "Kitchen",
    href: "/kitchen",
    image: IMAGES.kitchenHero,
    blurb: "Intelligent storage — baskets, pull-downs, shutters and corner solutions.",
  },
  wardrobe: {
    label: "Wardrobe",
    href: "/wardrobe",
    image: IMAGES.wardrobeHero,
    blurb: "Racks, baskets and lifts that make every inch of a wardrobe usable.",
  },
  hardware: {
    label: "Hardware",
    href: "/hardware",
    image: IMAGES.hardwareHero,
    blurb: "The fittings behind every good cabinet — hinges, slides, handles and locks.",
  },
};

interface AllProductsProps {
  overview: ProductsOverview;
}

// /products is a category DIRECTORY, not a product grid: three collection
// blocks (Kitchen / Wardrobe / Hardware), each pairing a hero tile with a
// list of that line's categories. Every row links into the line's PLP
// filtered to the category. Pure server markup — filtering lives on the
// per-line pages.
// Fixed row height (desktop) and the block height derived from the
// most-populated line — every collection block shares this height, so
// lines with fewer categories simply leave blank space below their rows
// (rather than stretching rows or resizing the photo).
const ROW_H = 72;

export default function AllProducts({ overview }: AllProductsProps) {
  // Only lines that actually have stock render a block.
  const liveLines = overview.lines.filter((l) => l.categoryCount > 0);
  const maxRows = Math.max(1, ...liveLines.map((l) => l.categoryCount));
  const blockHeight = maxRows * ROW_H;

  return (
    <div className="bg-surface">
      {/* Header — Modernist: breadcrumb kicker, oversized Archivo display,
          left-aligned, with the live SKU/collection stat pinned right.
          Compact vertical rhythm so it doesn't eat the fold. */}
      <header className="border-b-2 border-line-strong">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-[11px] tracking-[0.2em] uppercase text-ink-faint font-bold mb-2.5">
              <Link href="/" className="hover:text-gold transition-colors">
                Home
              </Link>{" "}
              / <span className="text-ink">Products</span>
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[0.92] tracking-[-0.03em] text-ink font-display">
              All products.
            </h1>
            <p className="text-sm text-ink-muted mt-3 max-w-md leading-relaxed">
              Every line across kitchen, wardrobe and hardware fittings — browse a
              category to see the full range.
            </p>
          </div>
          <div className="shrink-0 md:text-right">
            <p className="text-4xl sm:text-5xl font-extrabold tracking-[-0.03em] text-ink font-display leading-none">
              {overview.totalProducts}+
            </p>
            <p className="text-[11px] tracking-[0.14em] uppercase text-ink-faint font-bold mt-1.5">
              SKUs across {overview.collectionCount}{" "}
              {overview.collectionCount === 1 ? "collection" : "collections"}
            </p>
          </div>
        </div>
      </header>

      {/* Collection blocks — photo side alternates left / right / left.
          All share blockHeight so the three lines read as equal bands. */}
      {liveLines.map((line, i) => (
        <CollectionBlock
          key={line.productLine}
          line={line}
          index={i}
          photoRight={i % 2 === 1}
          blockHeight={blockHeight}
        />
      ))}

      {/* "Can't find your fitting?" — full-red statement band. */}
      <section className="bg-gold text-on-gold">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 flex flex-col items-center text-center gap-5">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.02em]">
            Can&apos;t find your fitting?
          </h2>
          <p className="text-on-gold/85 max-w-md leading-relaxed">
            Our team stocks {overview.totalProducts}+ SKUs and sources to spec.
            Send us your requirement and we&apos;ll quote within 24 hours.
          </p>
          <TalkToExpertButton className="bg-brand-cream text-ink font-bold px-8 py-3.5 hover:bg-surface-raised transition duration-200 ease-in-out mt-2">
            Talk to an expert
          </TalkToExpertButton>
        </div>
      </section>
    </div>
  );
}

function CollectionBlock({
  line,
  index,
  photoRight,
  blockHeight,
}: {
  line: LineOverview;
  index: number;
  photoRight: boolean;
  blockHeight: number;
}) {
  const meta = LINE_META[line.productLine];
  const tag = String(index + 1).padStart(2, "0");

  return (
    // Every block is the SAME fixed height (blockHeight, set from the
    // most-populated line). Photo cell = 2/5, list = 3/5. The list packs
    // its rows from the top; lines with fewer categories leave blank space
    // below rather than stretching rows or resizing the photo.
    <section className="border-b-2 border-line-strong">
      {/* Fixed block height on desktop (inline style — the height comes
          from the most-populated line at render time). max-lg:!h-auto lets
          the grid stack and size naturally on mobile. Both children use
          h-full so they fill this exact height. */}
      <div
        className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 items-stretch max-lg:!h-auto"
        style={{ height: `${blockHeight}px` }}
      >
        {/* Photo tile — spans 2 of 5 columns (narrower than the list, per
            the design). h-full fills the block height. order-* flips the
            photo side without reordering the DOM so categories stay first
            in reading order. */}
        <Link
          href={meta.href}
          className={`group relative h-64 sm:h-80 lg:h-full lg:col-span-2 overflow-hidden bg-brand-dark ${
            photoRight ? "lg:order-2" : "lg:order-1"
          }`}
        >
          <ProductImage
            src={meta.image}
            alt={`${meta.label} collection`}
            grayscale
            loading="eager"
            className="absolute inset-0 w-full h-full transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-brand-dark/25 to-transparent" />
          <span className="absolute top-0 left-0 bg-gold text-on-gold text-xs font-extrabold px-3 py-1.5">
            {tag}
          </span>
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.02em] text-brand-cream font-display">
              {meta.label}
            </h2>
            <p className="text-sm text-brand-cream/75 mt-2 max-w-xs leading-relaxed">
              {meta.blurb}
            </p>
          </div>
        </Link>

        {/* Category list — spans 3 of 5 columns, fills the block height.
            Rows sit at ROW_H from the top; leftover height stays blank. */}
        <div
          className={`flex flex-col lg:h-full lg:overflow-hidden lg:col-span-3 ${
            photoRight ? "lg:order-1" : "lg:order-2"
          }`}
        >
          {line.categories.map((cat, ci) => (
            <CategoryRow
              key={cat.slug}
              cat={cat}
              index={ci}
              href={`${meta.href}?category=${encodeURIComponent(cat.name)}`}
              ruled={ci > 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// One category row — number, name, "X products · from ₹Y", arrow.
function CategoryRow({
  cat,
  index,
  href,
  ruled,
}: {
  cat: OverviewCategory;
  index: number;
  href: string;
  ruled: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-4 sm:gap-6 px-4 sm:px-6 lg:px-8 py-4 lg:h-[72px] lg:shrink-0 transition-colors duration-200 hover:bg-surface-sunken ${
        ruled ? "border-t border-line" : ""
      }`}
    >
      <span className="text-xs font-bold text-ink-faint tabular-nums w-6 shrink-0">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="text-base sm:text-lg font-bold text-ink group-hover:text-gold-deep transition-colors flex-1 min-w-0">
        {cat.name}
      </span>
      <span className="hidden sm:block text-xs text-ink-muted whitespace-nowrap">
        {cat.count} {cat.count === 1 ? "product" : "products"}
        {cat.minPrice !== null && <> · from {formatPrice(cat.minPrice)}</>}
      </span>
      <ArrowRight
        size={18}
        className="text-gold shrink-0 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
      />
    </Link>
  );
}
