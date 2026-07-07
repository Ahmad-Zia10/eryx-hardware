'use client';

import { useState, useMemo } from 'react';
import { FAQS } from '@/constants';

export default function FAQSearch() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQS;

    return FAQS.map((section) => ({
      ...section,
      questions: section.questions.filter(
        (item) =>
          item.q.toLowerCase().includes(q) ||
          item.a.toLowerCase().includes(q)
      ),
    })).filter((section) => section.questions.length > 0);
  }, [query]);

  return (
    <div>
      <div className="mb-10">
        <input
          type="search"
          placeholder="Search questions..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-md bg-white dark:bg-[#141414] border border-[#D4D4D4] dark:border-[#2A2A2A] text-[#0A0A0A] dark:text-[#F5F5F5] text-sm px-4 py-3 focus:border-[#D4A017] focus:outline-none rounded-sm transition duration-200 ease-in-out placeholder-[#9A9A9A]"
          aria-label="Search FAQ questions"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-[#555555] dark:text-[#9A9A9A]">No questions match your search.</p>
      ) : (
        <div className="space-y-10">
          {filtered.map((section) => (
            <section key={section.category}>
              <h2 className="font-serif text-xl text-[#0A0A0A] dark:text-[#F5F5F5] mb-4">
                {section.category}
              </h2>
              <div className="space-y-3">
                {section.questions.map((item) => (
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
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
