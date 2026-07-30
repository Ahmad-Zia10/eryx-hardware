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
      <section className="bg-[#F7F5F2] dark:bg-[#141414] border-b border-[#E8E4DD] dark:border-[#2A2A2A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-16">
          <span className="text-xs tracking-[0.3em] uppercase text-[#D4A017]">
            {eyebrow}
          </span>
          <h1 className="font-serif text-3xl md:text-4xl text-[#0A0A0A] dark:text-[#F5F5F5] mt-3">
            {title}
          </h1>
          <p className="text-sm md:text-base text-[#555555] dark:text-[#9A9A9A] mt-3 max-w-2xl">
            {intro}
          </p>
          <p className="text-xs text-[#8A8A8A] dark:text-[#6A6A6A] mt-4">
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
      <h2 className="font-serif text-xl md:text-2xl text-[#0A0A0A] dark:text-[#F5F5F5]">
        {heading}
      </h2>
      <div className="flex flex-col gap-3 text-sm md:text-[15px] leading-relaxed text-[#444444] dark:text-[#B5B5B5]">
        {children}
      </div>
    </div>
  );
}

export function PolicyList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex flex-col gap-2 list-disc pl-5 marker:text-[#D4A017]">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
