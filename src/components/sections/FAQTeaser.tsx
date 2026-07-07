import Link from 'next/link';
import { FAQS } from '@/constants';

const TEASER_QUESTIONS = [
  ...FAQS[0].questions.slice(0, 3),
  FAQS[1].questions[0],
  FAQS[1].questions[1],
];

export default function FAQTeaser() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-10">
        <h2 className="font-serif text-2xl text-[#0A0A0A] dark:text-[#F5F5F5]">
          Common Questions
        </h2>
        <p className="text-sm text-[#555555] dark:text-[#9A9A9A] mt-2">
          Quick answers to help you get started
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-3">
        {TEASER_QUESTIONS.map((item) => (
          <details
            key={item.q}
            className="group bg-white dark:bg-[#141414] border border-[#D4D4D4] dark:border-[#2A2A2A] rounded-sm overflow-hidden"
          >
            <summary className="cursor-pointer px-5 py-4 text-sm font-medium text-[#0A0A0A] dark:text-[#F5F5F5] hover:text-[#D4A017] transition duration-200 ease-in-out list-none flex items-center justify-between">
              {item.q}
              <span className="text-[#D4A017] ml-4 shrink-0 group-open:rotate-180 transition-transform duration-200">▼</span>
            </summary>
            <div className="px-5 pb-4 text-sm text-[#555555] dark:text-[#9A9A9A] leading-relaxed border-t border-[#D4D4D4] dark:border-[#2A2A2A] pt-4">
              {item.a}
            </div>
          </details>
        ))}
      </div>

      <div className="text-center mt-8">
        <Link
          href="/faqs"
          className="text-sm text-[#D4A017] hover:text-[#E8B820] transition duration-200 ease-in-out"
        >
          View All FAQs →
        </Link>
      </div>
    </section>
  );
}
