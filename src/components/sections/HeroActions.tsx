"use client";

import { useRouter } from "next/navigation";

export default function HeroActions() {
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-4 mt-2">
      <button
        onClick={() => router.push("/kitchen")}
        className="bg-[#D4A017] hover:bg-[#E8B820] text-[#0A0A0A] font-semibold px-8 py-4 transition duration-200 ease-in-out"
      >
        Explore Products
      </button>
      <button
        onClick={() => router.push("/kitchen?category=Basket")}
        className="border border-[#0A0A0A] dark:border-[#F5F5F5] text-[#0A0A0A] dark:text-[#F5F5F5] hover:border-[#D4A017] hover:text-[#D4A017] font-semibold px-8 py-4 transition duration-200 ease-in-out"
      >
        Kitchen Solutions
      </button>
    </div>
  );
}