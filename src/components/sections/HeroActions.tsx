"use client";

import { useRouter } from "next/navigation";

export default function HeroActions() {
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-4 mt-2">
      <button
        onClick={() => router.push("/kitchen")}
        className="bg-brand-gold hover:bg-brand-bronze text-brand-dark font-semibold px-8 py-4 transition duration-200 ease-in-out"
      >
        Explore Products
      </button>
      <button
        onClick={() => router.push("/kitchen?category=Basket")}
        className="border border-white/50 text-white hover:border-brand-gold hover:text-brand-gold font-semibold px-8 py-4 transition duration-200 ease-in-out"
      >
        Kitchen Solutions
      </button>
    </div>
  );
}