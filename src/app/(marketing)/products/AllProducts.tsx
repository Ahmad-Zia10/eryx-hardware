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
export default function AllProducts({ overview }: AllProductsProps) {
  // Only lines that actually have stock render a block.
  const liveLines = overview.lines.filter((l) => l.categoryCount > 0);

  return (
    <div className="bg-surface">
      {/* Header — Modernist: breadcrumb kicker, oversized Archivo display,
          left-aligned, with the live SKU/collection stat pinned right. */}
      <header className="border-b-2 border-line-strong">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-[11px] tracking-[0.2em] uppercase text-ink-faint font-bold mb-4">
              <Link href="/" className="hover:text-gold transition-colors">
                Home
              </Link>{" "}
              / <span className="text-ink">Products</span>
            </p>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[0.92] tracking-[-0.03em] text-ink font-display">
              All products.
            </h1>
            <p className="text-sm sm:text-base text-ink-muted mt-4 max-w-md leading-relaxed">
              Every line across kitchen, wardrobe and hardware fittings — browse a
              category to see the full range.
            </p>
          </div>
          <div className="shrink-0 md:text-right">
            <p className="text-5xl sm:text-6xl font-extrabold tracking-[-0.03em] text-ink font-display leading-none">
              {overview.totalProducts}+
            </p>
            <p className="text-[11px] tracking-[0.14em] uppercase text-ink-faint font-bold mt-2">
              SKUs across {overview.collectionCount}{" "}
              {overview.collectionCount === 1 ? "collection" : "collections"}
            </p>
          </div>
        </div>
      </header>

      {/* Collection blocks — photo side alternates left / right / left. */}
      {liveLines.map((line, i) => (
        <CollectionBlock
          key={line.productLine}
          line={line}
          index={i}
          photoRight={i % 2 === 1}
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
}: {
  line: LineOverview;
  index: number;
  photoRight: boolean;
}) {
  const meta = LINE_META[line.productLine];
  const tag = String(index + 1).padStart(2, "0");

  // The photo tile is a FIXED height (four rows tall). The first four
  // categories sit beside it; any remaining categories flow full-width
  // below the photo. This keeps every collection block a consistent,
  // contained height instead of the photo stretching to a long list.
  const BESIDE = 4;
  const beside = line.categories.slice(0, BESIDE);
  const below = line.categories.slice(BESIDE);

  return (
    <section className="border-b-2 border-line-strong">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2">
        {/* Photo tile — numbered red tag, name + blurb overlaid at the
            bottom. order-* flips the photo side without reordering the DOM
            (categories stay first in source for a11y/reading order). */}
        <Link
          href={meta.href}
          className={`group relative h-64 sm:h-80 lg:h-[440px] overflow-hidden bg-brand-dark ${
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

        {/* Category rows beside the photo — locked to the photo height and
            split into equal-height rows so they always line up with it. */}
        <div
          className={`grid ${photoRight ? "lg:order-1" : "lg:order-2"}`}
          style={{ gridTemplateRows: `repeat(${beside.length}, minmax(0, 1fr))` }}
        >
          {beside.map((cat, ci) => (
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

      {/* Overflow categories — full-width row below the photo. */}
      {below.length > 0 && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 border-t border-line-strong">
          {below.map((cat, ci) => (
            <CategoryRow
              key={cat.slug}
              cat={cat}
              index={BESIDE + ci}
              href={`${meta.href}?category=${encodeURIComponent(cat.name)}`}
              // Rule between stacked rows; on 2-col, also rule the right cell.
              ruled={ci >= (below.length > 1 ? 2 : 1)}
              className={ci % 2 === 1 ? "sm:border-l border-line" : ""}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// One category row — number, name, "X products · from ₹Y", arrow. Shared
// between the beside-photo grid and the overflow row below.
function CategoryRow({
  cat,
  index,
  href,
  ruled,
  className = "",
}: {
  cat: OverviewCategory;
  index: number;
  href: string;
  ruled: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-4 sm:gap-6 px-4 sm:px-6 lg:px-8 py-4 transition-colors duration-200 hover:bg-surface-sunken ${
        ruled ? "border-t border-line" : ""
      } ${className}`}
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
