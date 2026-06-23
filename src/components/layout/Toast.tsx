"use client";

import { useUI } from "@/context/UIContext";

export default function Toast() {
  const { toastVisible } = useUI();

  return (
    <div
      className={`fixed top-20 right-4 z-60 bg-[#D4A017] text-[#0A0A0A] text-sm font-medium px-4 py-3 rounded-sm shadow-none transition-all duration-300 ease-in-out ${
        toastVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-4 pointer-events-none"
      }`}
    >
      Added to cart ✓
    </div>
  );
}