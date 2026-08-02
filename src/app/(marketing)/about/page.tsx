import Link from "next/link";
import { Target, ShieldCheck, Handshake, Award, ArrowRight } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/server";

export const revalidate = 60;

// Hard-coded editorial content. History / Founder / Mission remain CMS-editable
// via /admin/about; the rest lives here until copy stabilises and warrants a
// dedicated admin surface (see plan follow-ups).
const STATS = [
  { value: "2000", label: "Founded" },
  { value: "200+", label: "SKUs" },
  { value: "Pan India", label: "Delivery" },
  { value: "8", label: "Core categories" },
];

const TIMELINE = [
  { year: "2000", label: "Modular India founded, first Delhi showroom." },
  { year: "2005", label: "Introduced German precision hardware line." },
  { year: "2015", label: "Pan-India distribution network established." },
  { year: "2020", label: "Eryx sub-brand launched for direct e-commerce." },
  { year: "Today", label: "200+ SKUs, 8 core categories, growing." },
];

const VALUES = [
  {
    icon: Target,
    title: "Precision",
    body: "German-engineered tolerances on every SKU — because millimetres matter in modular hardware.",
  },
  {
    icon: ShieldCheck,
    title: "Longevity",
    body: "Components rated for the daily use of an Indian home — hinges, slides, and shutters that outlast the cabinet.",
  },
  {
    icon: Handshake,
    title: "Service",
    body: "Direct dealer relationships and Pan-India delivery so contractors and homeowners get what they need on time.",
  },
];

const AWARDS = [
  {
    name: "India Excellence Awards",
    recognition: "Recognition for Modular India Group",
    year: "2023",
  },
  {
    name: "National Business Excellence",
    recognition: "Industry contribution honour",
    year: "2022",
  },
  {
    name: "Featured in Trade Press",
    recognition: "Sandesh, Business Excellence and more",
    year: "Ongoing",
  },
];

export default async function AboutPage() {
  const { data: sections } = await supabaseAdmin
    .from("about_page_sections")
    .select("id, section_key, title, content_html, image_url, is_visible")
    .eq("is_visible", true)
    .order("display_order", { ascending: true });

  const byKey = new Map(
    (sections || []).map((s: any) => [s.section_key as string, s])
  );
  const history = byKey.get("history");
  const founder = byKey.get("founder");
  const mission = byKey.get("mission");

  const hasContent = (row: any | undefined) =>
    row && (row.content_html?.trim() || row.image_url);

  return (
    <main>
      {/* ─── Hero ─────────────────────────────────────────────────── */}
      <section className="relative bg-brand-dark text-brand-cream overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="flex items-center gap-3">
            <span className="w-11 h-[2px] bg-gold" />
            <span className="text-xs tracking-[0.2em] uppercase font-extrabold text-gold">
              About Eryx Hardware
            </span>
          </div>
          <h1 className="font-extrabold tracking-[-0.03em] text-4xl md:text-7xl leading-[0.96] mt-4 max-w-3xl">
            Precision hardware,
            <br />
            engineered to last.
          </h1>
          <p className="mt-6 max-w-2xl text-base md:text-lg text-brand-cream/70 leading-relaxed">
            A division of Modular India — over two decades of premium kitchen
            and wardrobe hardware, shaped by practical engineering and
            thoughtful design.
          </p>
        </div>
      </section>

      {/* ─── Stats strip ──────────────────────────────────────────── */}
      <section className="bg-surface-sunken border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center md:text-left">
                <p className="font-extrabold tracking-[-0.02em] text-3xl md:text-4xl text-ink">
                  {value}
                </p>
                <p className="text-[10px] tracking-widest uppercase text-ink-muted mt-2">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Our Story ────────────────────────────────────────────── */}
      {hasContent(history) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <span className="text-xs tracking-[0.3em] uppercase text-gold">
                Our Story
              </span>
              <h2 className="font-extrabold tracking-[-0.02em] text-3xl md:text-4xl text-ink mt-3">
                {history?.title || "Where we came from"}
              </h2>
              {history?.content_html && (
                <div
                  className="prose prose-neutral max-w-none text-ink-muted mt-6 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: history.content_html }}
                />
              )}
            </div>
            {history?.image_url && (
              <div className="w-full aspect-[4/3] bg-surface-sunken  overflow-hidden order-first lg:order-last">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={history.image_url}
                  alt=""
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── Founder's Message ───────────────────────────────────── */}
      {hasContent(founder) && (
        <section className="bg-surface-sunken border-t border-b border-line">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-10 lg:gap-16 items-center">
              {founder?.image_url && (
                <div className="w-full aspect-[4/5] bg-surface-sunken  overflow-hidden max-w-md mx-auto lg:mx-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={founder.image_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <span className="text-xs tracking-[0.3em] uppercase text-gold">
                  Founder&apos;s Message
                </span>
                <h2 className="font-extrabold tracking-[-0.02em] text-3xl md:text-4xl text-ink mt-3">
                  {founder?.title || "A note from the founder"}
                </h2>
                {founder?.content_html && (
                  <blockquote className="mt-6 border-l-2 border-gold pl-6">
                    <div
                      className="prose prose-neutral max-w-none text-ink-muted leading-relaxed italic"
                      dangerouslySetInnerHTML={{ __html: founder.content_html }}
                    />
                  </blockquote>
                )}
                <div className="mt-8 flex items-center gap-3">
                  <div className="w-10 h-px bg-gold" />
                  <p className="text-xs tracking-widest uppercase text-ink font-semibold">
                    Zeeshan Haider Rizvi, Founder
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── Timeline ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
        <div className="text-center mb-14">
          <span className="text-xs tracking-[0.3em] uppercase text-gold">
            Milestones
          </span>
          <h2 className="font-extrabold tracking-[-0.02em] text-3xl md:text-4xl text-ink mt-3">
            How we got here
          </h2>
        </div>

        {/* Desktop: horizontal timeline with connecting line. */}
        <ol className="hidden md:grid grid-cols-5 gap-4 relative">
          <div className="absolute left-0 right-0 top-3 h-px bg-line-strong" aria-hidden="true" />
          {TIMELINE.map(({ year, label }) => (
            <li key={year} className="relative pt-10">
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-gold ring-4 ring-surface-sunken" />
              <p className="text-center font-extrabold tracking-[-0.02em] text-xl text-gold mb-2">
                {year}
              </p>
              <p className="text-center text-xs text-ink-muted leading-relaxed">
                {label}
              </p>
            </li>
          ))}
        </ol>

        {/* Mobile: vertical timeline. */}
        <ol className="md:hidden relative pl-8 border-l-2 border-line-strong space-y-8">
          {TIMELINE.map(({ year, label }) => (
            <li key={year} className="relative">
              <span className="absolute -left-[41px] top-1 w-4 h-4 bg-gold ring-4 ring-surface-raised" />
              <p className="font-extrabold tracking-[-0.02em] text-xl text-gold">{year}</p>
              <p className="text-sm text-ink-muted mt-1 leading-relaxed">
                {label}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* ─── Mission & Values ────────────────────────────────────── */}
      <section className="bg-surface-sunken border-t border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
          <div className="text-center mb-12">
            <span className="text-xs tracking-[0.3em] uppercase text-gold">
              Mission &amp; Values
            </span>
            <h2 className="font-extrabold tracking-[-0.02em] text-3xl md:text-4xl text-ink mt-3">
              {mission?.title || "What we stand for"}
            </h2>
            {mission?.content_html && (
              <div
                className="prose prose-neutral max-w-2xl mx-auto text-ink-muted mt-6 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: mission.content_html }}
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
            {VALUES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="bg-surface-raised border border-line  p-8"
              >
                <div className="w-11 h-11 flex items-center justify-center  bg-gold-tint mb-5">
                  <Icon className="text-gold" size={22} />
                </div>
                <h3 className="text-lg font-semibold text-ink">
                  {title}
                </h3>
                <p className="text-sm text-ink-muted mt-3 leading-relaxed">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Awards & Recognition ────────────────────────────────── */}
      <section className="bg-brand-dark text-brand-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
          <div className="text-center mb-12">
            <span className="text-xs tracking-[0.3em] uppercase text-gold">
              Awards &amp; Recognition
            </span>
            <h2 className="font-extrabold tracking-[-0.02em] text-3xl md:text-4xl mt-3">
              Recognised across the industry
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {AWARDS.map(({ name, recognition, year }) => (
              <div
                key={name}
                className="border border-brand-cream/15 p-6 bg-brand-cream/[0.03]"
              >
                <Award className="text-gold mb-4" size={26} />
                <p className="text-xs tracking-widest uppercase text-gold">
                  {year}
                </p>
                <p className="font-semibold text-brand-cream mt-2">{name}</p>
                <p className="text-sm text-brand-cream/60 mt-2 leading-relaxed">
                  {recognition}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────── */}
      <section className="bg-surface-sunken">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
          <h2 className="font-extrabold tracking-[-0.02em] text-3xl md:text-4xl text-ink">
            Work with Eryx
          </h2>
          <p className="text-sm md:text-base text-ink-muted mt-4 max-w-xl mx-auto">
            Explore the catalogue, request a bulk quote, or talk to us about a
            dealer partnership.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Link
              href="/kitchen"
              className="inline-flex items-center gap-2 bg-gold hover:bg-gold-bright text-on-gold font-bold px-6 py-3 transition duration-200 ease-in-out"
            >
              Explore Products
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-gold text-gold hover:bg-gold hover:text-on-gold font-semibold px-6 py-3  transition duration-200 ease-in-out"
            >
              Get in touch
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
