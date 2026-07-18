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
      <section className="relative bg-[#0A0A0A] text-[#F5F5F5] overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4A017]/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <span className="text-xs tracking-[0.3em] uppercase text-[#D4A017]">
            About Eryx Hardware
          </span>
          <h1 className="font-serif text-4xl md:text-6xl leading-[1.05] mt-4 max-w-3xl">
            Precision hardware,
            <br />
            <span className="text-[#D4A017]">engineered to last.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base md:text-lg text-[#D4D4D4] leading-relaxed">
            A division of Modular India — over two decades of premium kitchen
            and wardrobe hardware, shaped by practical engineering and
            thoughtful design.
          </p>
        </div>
      </section>

      {/* ─── Stats strip ──────────────────────────────────────────── */}
      <section className="bg-[#F7F5F2] dark:bg-[#141414] border-b border-[#E8E4DD] dark:border-[#2A2A2A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center md:text-left">
                <p className="font-serif text-3xl md:text-4xl text-[#0A0A0A] dark:text-[#F5F5F5]">
                  {value}
                </p>
                <p className="text-[10px] tracking-widest uppercase text-[#6B6B6B] dark:text-[#9A9A9A] mt-2">
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
              <span className="text-xs tracking-[0.3em] uppercase text-[#D4A017]">
                Our Story
              </span>
              <h2 className="font-serif text-3xl md:text-4xl text-[#0A0A0A] dark:text-[#F5F5F5] mt-3">
                {history?.title || "Where we came from"}
              </h2>
              {history?.content_html && (
                <div
                  className="prose prose-neutral dark:prose-invert max-w-none text-[#555555] dark:text-[#D4D4D4] mt-6 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: history.content_html }}
                />
              )}
            </div>
            {history?.image_url && (
              <div className="w-full aspect-[4/3] bg-[#F5F5F5] dark:bg-[#1A1A1A] rounded-sm overflow-hidden order-first lg:order-last">
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
        <section className="bg-[#F7F5F2] dark:bg-[#141414] border-t border-b border-[#E8E4DD] dark:border-[#2A2A2A]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-10 lg:gap-16 items-center">
              {founder?.image_url && (
                <div className="w-full aspect-[4/5] bg-[#EBEBEB] dark:bg-[#1A1A1A] rounded-sm overflow-hidden max-w-md mx-auto lg:mx-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={founder.image_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <span className="text-xs tracking-[0.3em] uppercase text-[#D4A017]">
                  Founder&apos;s Message
                </span>
                <h2 className="font-serif text-3xl md:text-4xl text-[#0A0A0A] dark:text-[#F5F5F5] mt-3">
                  {founder?.title || "A note from the founder"}
                </h2>
                {founder?.content_html && (
                  <blockquote className="mt-6 border-l-2 border-[#D4A017] pl-6">
                    <div
                      className="prose prose-neutral dark:prose-invert max-w-none text-[#555555] dark:text-[#D4D4D4] leading-relaxed italic"
                      dangerouslySetInnerHTML={{ __html: founder.content_html }}
                    />
                  </blockquote>
                )}
                <div className="mt-8 flex items-center gap-3">
                  <div className="w-10 h-px bg-[#D4A017]" />
                  <p className="text-xs tracking-widest uppercase text-[#0A0A0A] dark:text-[#F5F5F5] font-semibold">
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
          <span className="text-xs tracking-[0.3em] uppercase text-[#D4A017]">
            Milestones
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-[#0A0A0A] dark:text-[#F5F5F5] mt-3">
            How we got here
          </h2>
        </div>

        {/* Desktop: horizontal timeline with connecting line. */}
        <ol className="hidden md:grid grid-cols-5 gap-4 relative">
          <div className="absolute left-0 right-0 top-3 h-px bg-[#D4D4D4] dark:bg-[#2A2A2A]" aria-hidden="true" />
          {TIMELINE.map(({ year, label }) => (
            <li key={year} className="relative pt-10">
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#D4A017] ring-4 ring-[#F7F5F2] dark:ring-[#0A0A0A]" />
              <p className="text-center font-serif text-xl text-[#D4A017] mb-2">
                {year}
              </p>
              <p className="text-center text-xs text-[#555555] dark:text-[#9A9A9A] leading-relaxed">
                {label}
              </p>
            </li>
          ))}
        </ol>

        {/* Mobile: vertical timeline. */}
        <ol className="md:hidden relative pl-8 border-l-2 border-[#D4D4D4] dark:border-[#2A2A2A] space-y-8">
          {TIMELINE.map(({ year, label }) => (
            <li key={year} className="relative">
              <span className="absolute -left-[41px] top-1 w-4 h-4 rounded-full bg-[#D4A017] ring-4 ring-white dark:ring-[#0A0A0A]" />
              <p className="font-serif text-xl text-[#D4A017]">{year}</p>
              <p className="text-sm text-[#555555] dark:text-[#9A9A9A] mt-1 leading-relaxed">
                {label}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* ─── Mission & Values ────────────────────────────────────── */}
      <section className="bg-[#F7F5F2] dark:bg-[#141414] border-t border-b border-[#E8E4DD] dark:border-[#2A2A2A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
          <div className="text-center mb-12">
            <span className="text-xs tracking-[0.3em] uppercase text-[#D4A017]">
              Mission &amp; Values
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-[#0A0A0A] dark:text-[#F5F5F5] mt-3">
              {mission?.title || "What we stand for"}
            </h2>
            {mission?.content_html && (
              <div
                className="prose prose-neutral dark:prose-invert max-w-2xl mx-auto text-[#555555] dark:text-[#D4D4D4] mt-6 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: mission.content_html }}
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
            {VALUES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="bg-white dark:bg-[#1A1A1A] border border-[#E8E4DD] dark:border-[#2A2A2A] rounded-sm p-8"
              >
                <div className="w-11 h-11 flex items-center justify-center rounded-sm bg-[#D4A017]/10 mb-5">
                  <Icon className="text-[#D4A017]" size={22} />
                </div>
                <h3 className="text-lg font-semibold text-[#0A0A0A] dark:text-[#F5F5F5]">
                  {title}
                </h3>
                <p className="text-sm text-[#555555] dark:text-[#9A9A9A] mt-3 leading-relaxed">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Awards & Recognition ────────────────────────────────── */}
      <section className="bg-[#0A0A0A] text-[#F5F5F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
          <div className="text-center mb-12">
            <span className="text-xs tracking-[0.3em] uppercase text-[#D4A017]">
              Awards &amp; Recognition
            </span>
            <h2 className="font-serif text-3xl md:text-4xl mt-3">
              Recognised across the industry
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {AWARDS.map(({ name, recognition, year }) => (
              <div
                key={name}
                className="border border-[#2A2A2A] rounded-sm p-6 bg-[#0F0F0F]"
              >
                <Award className="text-[#D4A017] mb-4" size={26} />
                <p className="text-xs tracking-widest uppercase text-[#D4A017]">
                  {year}
                </p>
                <p className="font-semibold text-[#F5F5F5] mt-2">{name}</p>
                <p className="text-sm text-[#9A9A9A] mt-2 leading-relaxed">
                  {recognition}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────── */}
      <section className="bg-[#F7F5F2] dark:bg-[#141414]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-[#0A0A0A] dark:text-[#F5F5F5]">
            Work with Eryx
          </h2>
          <p className="text-sm md:text-base text-[#555555] dark:text-[#9A9A9A] mt-4 max-w-xl mx-auto">
            Explore the catalogue, request a bulk quote, or talk to us about a
            dealer partnership.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Link
              href="/kitchen"
              className="inline-flex items-center gap-2 bg-[#D4A017] hover:bg-[#E8B820] text-[#0A0A0A] font-semibold px-6 py-3 rounded-sm transition duration-200 ease-in-out"
            >
              Explore Products
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-[#D4A017] text-[#D4A017] hover:bg-[#D4A017] hover:text-[#0A0A0A] font-semibold px-6 py-3 rounded-sm transition duration-200 ease-in-out"
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
