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

  const [firstLine, ...restLines] = liveLines;

  return (
    <div className="bg-surface">
      {/* First fold — header + the first collection block are sized together
          to fit one viewport (minus the sticky announcement bar + navbar),
          so the opening collection renders COMPLETE on landing instead of
          being sliced mid-list. `--chrome` is the sticky chrome height
          (announcement ~37px + navbar 64px). On mobile the fold constraint
          is relaxed (max-lg:min-h-0) so blocks stack naturally.
          The remaining lines + CTA band scroll below as the reward. */}
      <div
        className="flex flex-col lg:min-h-[calc(100dvh-var(--chrome))] max-lg:min-h-0"
        style={{ ["--chrome" as string]: "133px" }}
      >
        {/* Header — Modernist: breadcrumb kicker, oversized Archivo display,
            left-aligned, with the live SKU/collection stat pinned right.
            Compact vertical rhythm so it doesn't eat the fold. */}
        <header className="border-b-2 border-line-strong">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
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
                Every line across kitchen, wardrobe and hardware fittings — browse
                a category to see the full range.
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

        {/* First collection block — flex-1 so it fills the rest of the fold.
            Its inner grid stretches to this height, so the opening block
            ends at the viewport bottom instead of being cut. */}
        {firstLine && (
          <CollectionBlock
            line={firstLine}
            index={0}
            photoRight={false}
            blockHeight={blockHeight}
            fillFold
          />
        )}
      </div>

      {/* Remaining collection blocks — natural equal-height bands below the
          fold. Photo side keeps alternating (block 2 = right, block 3 = left…). */}
      {restLines.map((line, i) => (
        <CollectionBlock
          key={line.productLine}
          line={line}
          index={i + 1}
          photoRight={(i + 1) % 2 === 1}
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
  fillFold = false,
}: {
  line: LineOverview;
  index: number;
  photoRight: boolean;
  blockHeight: number;
  // When true (the first block), the block flexes to fill the remaining
  // first-fold height instead of using the fixed blockHeight — so the
  // opening collection ends cleanly at the viewport bottom.
  fillFold?: boolean;
}) {
  const meta = LINE_META[line.productLine];
  const tag = String(index + 1).padStart(2, "0");

  return (
    // Fixed-height band (blockHeight, from the most-populated line) for the
    // below-fold blocks; the first block flexes to fill the fold instead.
    // Photo cell = 2/5, list = 3/5. The list packs its rows from the top;
    // lines with fewer categories leave blank space below rather than
    // stretching rows or resizing the photo.
    <section
      className={`border-b-2 border-line-strong ${
        fillFold ? "lg:flex-1 lg:min-h-0 lg:flex lg:flex-col" : ""
      }`}
    >
      {/* Desktop height: the first block fills the fold (grid is lg:flex-1
          inside the flex-col section); the rest use the fixed blockHeight.
          max-lg:!h-auto lets the grid stack and size naturally on mobile.
          Both children use h-full so they fill this height. */}
      <div
        className={`max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-5 items-stretch max-lg:!h-auto ${
          fillFold ? "lg:flex-1 lg:min-h-0" : ""
        }`}
        style={fillFold ? undefined : { height: `${blockHeight}px` }}
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
            Below-fold blocks: rows sit at ROW_H from the top, leftover stays
            blank. First (fillFold) block: rows flex to share the fold height
            equally, so every category fits the opening frame without a cut. */}
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
              fillFold={fillFold}
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
  fillFold = false,
}: {
  cat: OverviewCategory;
  index: number;
  href: string;
  ruled: boolean;
  // First-fold rows flex to share the available height (min 64px) so every
  // category fits the opening frame; below-fold rows keep the fixed 72px.
  fillFold?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-4 sm:gap-6 px-4 sm:px-6 lg:px-8 transition-colors duration-200 hover:bg-surface-sunken ${
        fillFold
          ? "py-4 lg:py-0 lg:flex-1 lg:min-h-[64px]"
          : "py-4 lg:h-[72px] lg:shrink-0"
      } ${ruled ? "border-t border-line" : ""}`}
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
