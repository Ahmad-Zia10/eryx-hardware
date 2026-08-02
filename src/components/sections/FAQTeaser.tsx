import Link from 'next/link';
import { getVisibleFaqTree } from '@/lib/db/faqs';
import FAQTeaserTabs from './FAQTeaserTabs';

/**
 * Home page FAQ teaser. Server component — fetches the tree once, hands
 * it to the small client component that handles tab switching. If the
 * DB has no visible content, the whole section is hidden rather than
 * rendering an empty accordion.
 */
export default async function FAQTeaser() {
  const tree = await getVisibleFaqTree();
  const categoriesWithQuestions = tree.filter((c) => c.questions.length > 0);

  if (categoriesWithQuestions.length === 0) return null;

  // Take up to 5 questions per category — plenty for the teaser.
  const trimmed = categoriesWithQuestions.map((cat) => ({
    id: cat.id,
    name: cat.name,
    questions: cat.questions.slice(0, 5),
  }));

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <div className="flex items-center gap-3">
          <span className="w-11 h-[2px] bg-gold" />
          <span className="text-xs tracking-[0.2em] uppercase font-extrabold text-gold">
            FAQ
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.02em] text-ink mt-3">
          Common questions
        </h2>
        <p className="text-sm text-ink-muted mt-2">
          Quick answers to help you get started
        </p>
      </div>

      <FAQTeaserTabs categories={trimmed} />

      <div className="mt-8">
        <Link
          href="/faqs"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-gold-deep hover:text-gold transition duration-200 ease-in-out"
        >
          View all FAQs
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
