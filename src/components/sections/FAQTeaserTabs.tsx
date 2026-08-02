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
    <div className="max-w-3xl">
      {categories.length > 1 && (
        <div
          role="tablist"
          className="flex flex-wrap items-center gap-2 mb-6"
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
                className={`text-xs px-4 py-2 border transition-colors duration-200 ${
                  isActive
                    ? 'bg-gold border-gold text-on-gold font-bold'
                    : 'bg-transparent border-line-strong text-ink-muted hover:border-gold hover:text-gold-deep'
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
            <details className="group bg-surface-raised border border-line hover:border-gold open:border-gold transition-colors duration-200">
              <summary className="list-none cursor-pointer px-5 py-4 flex items-center justify-between gap-4 text-sm font-medium text-ink">
                <span>{item.question}</span>
                <ChevronDown
                  size={18}
                  className="shrink-0 text-gold group-open:rotate-180 transition-transform duration-200"
                />
              </summary>
              <div className="px-5 pb-4 text-sm text-ink-muted leading-relaxed border-t border-line pt-4 whitespace-pre-line">
                {item.answer}
              </div>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
