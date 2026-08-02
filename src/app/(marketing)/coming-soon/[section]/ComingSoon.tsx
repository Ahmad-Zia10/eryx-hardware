"use client";

import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";

const SECTION_NAMES: Record<string, string> = {
  wardrobe: "Wardrobe Solutions",
  deals: "Deals & Offers",
  hardware: "Hardware",
};

interface ComingSoonProps {
  section: string;
}

export default function ComingSoon({ section }: ComingSoonProps) {
  const router = useRouter();
  const sectionName = SECTION_NAMES[section] || "This Section";

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="flex flex-col items-center text-center gap-4 max-w-md">
        <Clock className="text-gold" size={48} />
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-[-0.03em] text-ink">
          Coming Soon
        </h1>
        <p className="text-lg text-ink-muted">
          We&apos;re working on bringing you {sectionName}. Check back shortly.
        </p>
        <button
          onClick={() => router.push("/")}
          className="border border-gold text-gold-deep hover:bg-gold hover:text-on-gold px-6 py-3 font-bold transition duration-200 ease-in-out mt-2"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}