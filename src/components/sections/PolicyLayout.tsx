import type { ReactNode } from "react";

// Shared shell for the four legal/policy pages (Terms, Return, Refund &
// Cancellation, Shipping). Matches the FAQ/marketing header pattern so the
// pages read as part of the site, not bolt-ons. Content is passed as children
// composed from the <PolicySection> / <PolicyList> primitives below.
export function PolicyLayout({
  eyebrow,
  title,
  intro,
  lastUpdated,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  lastUpdated: string;
  children: ReactNode;
}) {
  return (
    <main>
      <section className="bg-surface-sunken border-b-2 border-line-strong">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-16">
          <div className="flex items-center gap-3">
            <span className="w-11 h-[2px] bg-gold" />
            <span className="text-xs tracking-[0.2em] uppercase font-extrabold text-gold">
              {eyebrow}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-[-0.03em] text-ink mt-3">
            {title}
          </h1>
          <p className="text-sm md:text-base text-ink-muted mt-3 max-w-2xl">
            {intro}
          </p>
          <p className="text-xs text-ink-faint mt-4">
            Last updated: {lastUpdated}
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex flex-col gap-8">{children}</div>
      </section>
    </main>
  );
}

export function PolicySection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xl md:text-2xl font-extrabold tracking-[-0.01em] text-ink">
        {heading}
      </h2>
      <div className="flex flex-col gap-3 text-sm md:text-[15px] leading-relaxed text-ink-muted">
        {children}
      </div>
    </div>
  );
}

export function PolicyList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex flex-col gap-2 list-disc pl-5 marker:text-gold">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
