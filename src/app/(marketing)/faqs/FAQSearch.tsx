'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Search } from 'lucide-react';
import type { FaqTreeCategory } from '@/lib/db/faqs';

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function FAQSearch({ tree }: { tree: FaqTreeCategory[] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tree;

    return tree
      .map((section) => ({
        ...section,
        questions: section.questions.filter(
          (item) =>
            item.question.toLowerCase().includes(q) ||
            item.answer.toLowerCase().includes(q)
        ),
      }))
      .filter((section) => section.questions.length > 0);
  }, [query, tree]);

  const totalQuestions = filtered.reduce(
    (sum, section) => sum + section.questions.length,
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 max-w-2xl">
        <label className="relative block">
          <span className="sr-only">Search FAQ questions</span>
          <Search
            className="absolute top-1/2 left-4 -translate-y-1/2 text-[#9A9A9A]"
            size={18}
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search questions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white dark:bg-[#141414] border border-[#D4D4D4] dark:border-[#2A2A2A] text-[#0A0A0A] dark:text-[#F5F5F5] text-sm pl-12 pr-4 py-3 focus:border-[#D4A017] focus:outline-none rounded-sm transition duration-200 ease-in-out placeholder-[#9A9A9A]"
          />
        </label>
        {query.trim() && (
          <p className="text-xs text-[#6B6B6B] dark:text-[#9A9A9A] mt-2">
            {totalQuestions} match{totalQuestions === 1 ? '' : 'es'}
          </p>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="border border-[#D4D4D4] dark:border-[#2A2A2A] rounded-sm p-10 text-center max-w-2xl">
          <p className="text-[#0A0A0A] dark:text-[#F5F5F5] font-semibold">
            No questions match your search.
          </p>
          <p className="text-sm text-[#6B6B6B] dark:text-[#9A9A9A] mt-2">
            Can&apos;t find what you&apos;re looking for?
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-[#D4A017] hover:text-[#E8B820]"
          >
            Contact us
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10 lg:gap-14">
          {/* Sidebar / mobile chip row */}
          <nav
            aria-label="FAQ categories"
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <p className="hidden lg:block text-xs tracking-widest uppercase text-[#9A9A9A] mb-4">
              Browse
            </p>
            <ul className="flex flex-nowrap overflow-x-auto lg:flex-col gap-2 lg:gap-1 no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
              {filtered.map((section) => (
                <li key={section.id} className="shrink-0">
                  <a
                    href={`#cat-${slugify(section.name)}`}
                    className="flex items-center justify-between gap-3 px-4 py-2 rounded-full lg:rounded-sm border border-[#D4D4D4] dark:border-[#2A2A2A] lg:border-transparent hover:border-[#D4A017] hover:text-[#D4A017] text-xs text-[#555555] dark:text-[#9A9A9A] transition-colors lg:px-3 lg:py-2 whitespace-nowrap lg:whitespace-normal"
                  >
                    <span>{section.name}</span>
                    <span className="text-[10px] text-[#9A9A9A] lg:ml-auto shrink-0">
                      {section.questions.length}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Categories + accordion */}
          <div className="space-y-10">
            {filtered.map((section) => (
              <section
                key={section.id}
                id={`cat-${slugify(section.name)}`}
                className="scroll-mt-24"
              >
                <h2 className="font-serif text-2xl text-[#0A0A0A] dark:text-[#F5F5F5] mb-4">
                  {section.name}
                </h2>
                <ul className="space-y-3">
                  {section.questions.map((item) => (
                    <li key={item.id}>
                      <details className="group bg-white dark:bg-[#141414] border border-[#D4D4D4] dark:border-[#2A2A2A] rounded-sm hover:border-[#D4A017] open:border-[#D4A017] transition-colors duration-200">
                        <summary className="list-none cursor-pointer px-5 py-4 flex items-center justify-between gap-4 text-sm font-medium text-[#0A0A0A] dark:text-[#F5F5F5]">
                          <span>{item.question}</span>
                          <ChevronDown
                            size={18}
                            className="shrink-0 text-[#D4A017] group-open:rotate-180 transition-transform duration-200"
                          />
                        </summary>
                        <div className="px-5 pb-4 text-sm text-[#555555] dark:text-[#9A9A9A] leading-relaxed border-t border-[#D4D4D4] dark:border-[#2A2A2A] pt-4 whitespace-pre-line">
                          {item.answer}
                        </div>
                      </details>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
