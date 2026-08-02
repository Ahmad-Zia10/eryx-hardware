import { getVisibleFaqTree } from '@/lib/db/faqs';
import FAQSearch from './FAQSearch';

export const revalidate = 60;

export default async function FAQsPage() {
  const tree = await getVisibleFaqTree();

  return (
    <main>
      <section className="bg-surface-sunken border-b-2 border-line-strong">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-16">
          <div className="flex items-center gap-3">
            <span className="w-11 h-[2px] bg-gold" />
            <span className="text-xs tracking-[0.2em] uppercase font-extrabold text-gold">
              FAQ
            </span>
          </div>
          <h1 className="font-extrabold tracking-[-0.03em] text-4xl md:text-6xl text-ink mt-3">
            Frequently Asked Questions
          </h1>
          <p className="text-sm md:text-base text-ink-muted mt-3 max-w-2xl">
            Find answers to common questions about our products, orders,
            payments, and support.
          </p>
        </div>
      </section>

      <FAQSearch tree={tree} />
    </main>
  );
}
