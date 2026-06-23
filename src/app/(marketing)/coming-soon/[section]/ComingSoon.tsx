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
        <Clock className="text-[#D4A017]" size={48} />
        <h1 className="text-4xl font-bold text-[#0A0A0A] dark:text-[#F5F5F5]">
          Coming Soon
        </h1>
        <p className="text-lg text-[#555555] dark:text-[#9A9A9A]">
          We&apos;re working on bringing you {sectionName}. Check back shortly.
        </p>
        <button
          onClick={() => router.push("/")}
          className="border border-[#D4A017] text-[#D4A017] hover:bg-[#D4A017] hover:text-[#0A0A0A] px-6 py-3 font-semibold transition duration-200 ease-in-out mt-2"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}