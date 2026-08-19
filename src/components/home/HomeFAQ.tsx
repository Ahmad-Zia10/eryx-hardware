import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { getVisibleFaqTree } from "@/lib/db/faqs";

// ─────────────────────────────────────────────────────────────────────
// 06 · FAQ — two-column ruled accordion (home-only, Modernist).
//
// Server component. Fetches the visible FAQ tree (same source as the
// shipped teaser) but presents a flat, editorial two-column layout: a
// sticky intro on the left, expandable questions on the right. Native
// <details> so it's server-rendered and needs no client JS. Hidden
// entirely if there's no visible FAQ content.
//
// Rebuilt for the new home page — the shipped FAQTeaser (tabs) is only
// used here, so nothing else changes when the home page swaps to this.
// ─────────────────────────────────────────────────────────────────────

export default async function HomeFAQ() {
  const tree = await getVisibleFaqTree();

  // Flatten to a single list — take a handful across categories so the
  // home teaser stays short. Full set lives on /faqs.
  const questions = tree
    .flatMap((c) => c.questions)
    .slice(0, 6);

  if (questions.length === 0) return null;

  return (
    <section className="bg-surface border-t-2 border-line-strong">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-[0.7fr_1.3fr] gap-10">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-baseline gap-4">
            <span className="text-sm font-extrabold text-gold">06</span>
            <h2 className="font-editorial text-3xl sm:text-4xl tracking-[-0.01em] text-ink">
              Questions, answered.
            </h2>
          </div>
          <p className="text-sm text-ink-muted mt-4 leading-relaxed max-w-xs">
            Everything about delivery, warranty, and fitting. Still stuck? Our team
            replies within a day.
          </p>
          <Link
            href="/faqs"
            className="mt-6 inline-flex items-center gap-2 text-gold-deep hover:text-gold font-bold text-sm transition-colors duration-200"
          >
            All FAQs <ArrowRight size={14} />
          </Link>
        </div>
        <div className="border-t-2 border-line-strong">
          {questions.map((q) => (
            <details
              key={q.id}
              className="group border-b border-line py-5 [&_svg]:open:rotate-45"
            >
              <summary className="list-none cursor-pointer flex items-center justify-between gap-4">
                <h3 className="text-lg font-extrabold tracking-[-0.01em] text-ink">
                  {q.question}
                </h3>
                <Plus
                  size={18}
                  className="text-gold shrink-0 transition-transform duration-200"
                />
              </summary>
              <p className="text-sm text-ink-muted leading-relaxed mt-3 max-w-xl whitespace-pre-line">
                {q.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
