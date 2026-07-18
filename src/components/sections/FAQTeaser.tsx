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
      <div className="text-center mb-10">
        <span className="text-xs tracking-[0.3em] uppercase text-[#D4A017]">
          FAQ
        </span>
        <h2 className="font-serif text-3xl text-[#0A0A0A] dark:text-[#F5F5F5] mt-3">
          Common Questions
        </h2>
        <p className="text-sm text-[#6B6B6B] dark:text-[#9A9A9A] mt-3">
          Quick answers to help you get started
        </p>
      </div>

      <FAQTeaserTabs categories={trimmed} />

      <div className="text-center mt-8">
        <Link
          href="/faqs"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#D4A017] hover:text-[#E8B820] transition duration-200 ease-in-out"
        >
          View All FAQs
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
