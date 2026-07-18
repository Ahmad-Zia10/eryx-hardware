import { getVisibleFaqTree } from '@/lib/db/faqs';
import FAQSearch from './FAQSearch';

export const revalidate = 60;

export default async function FAQsPage() {
  const tree = await getVisibleFaqTree();

  return (
    <main>
      <section className="bg-[#F7F5F2] dark:bg-[#141414] border-b border-[#E8E4DD] dark:border-[#2A2A2A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-16">
          <span className="text-xs tracking-[0.3em] uppercase text-[#D4A017]">
            FAQ
          </span>
          <h1 className="font-serif text-3xl md:text-4xl text-[#0A0A0A] dark:text-[#F5F5F5] mt-3">
            Frequently Asked Questions
          </h1>
          <p className="text-sm md:text-base text-[#555555] dark:text-[#9A9A9A] mt-3 max-w-2xl">
            Find answers to common questions about our products, orders,
            payments, and support.
          </p>
        </div>
      </section>

      <FAQSearch tree={tree} />
    </main>
  );
}
