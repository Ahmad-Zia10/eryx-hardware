'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

type TeaserCategory = {
  id: string;
  name: string;
  questions: { id: string; question: string; answer: string }[];
};

/**
 * Tabbed category selector + accordion for the home page FAQ teaser.
 * Client-side only for the tab state; everything is server-rendered
 * up until the tab row.
 */
export default function FAQTeaserTabs({
  categories,
}: {
  categories: TeaserCategory[];
}) {
  const [activeId, setActiveId] = useState(categories[0]?.id ?? '');
  const active = categories.find((c) => c.id === activeId) ?? categories[0];
  if (!active) return null;

  return (
    <div className="max-w-3xl mx-auto">
      {categories.length > 1 && (
        <div
          role="tablist"
          className="flex flex-wrap items-center justify-center gap-2 mb-6"
        >
          {categories.map((cat) => {
            const isActive = cat.id === active.id;
            return (
              <button
                key={cat.id}
                role="tab"
                aria-selected={isActive}
                type="button"
                onClick={() => setActiveId(cat.id)}
                className={`text-xs px-4 py-2 rounded-full border transition-colors duration-200 ${
                  isActive
                    ? 'bg-[#D4A017] border-[#D4A017] text-[#0A0A0A] font-semibold'
                    : 'bg-transparent border-[#D4D4D4] dark:border-[#2A2A2A] text-[#555555] dark:text-[#9A9A9A] hover:border-[#D4A017] hover:text-[#D4A017]'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      )}

      <ul className="space-y-3">
        {active.questions.map((item) => (
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
    </div>
  );
}
