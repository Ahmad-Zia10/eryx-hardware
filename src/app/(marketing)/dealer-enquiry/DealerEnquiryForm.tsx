"use client";

import { useState } from "react";

export default function DealerEnquiryForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/dealer-enquiries", {
        method: "POST",
        body: new FormData(event.currentTarget),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Could not submit dealer enquiry");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Could not submit dealer enquiry");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="border border-[#D4D4D4] dark:border-[#2A2A2A] rounded-sm p-8 bg-white dark:bg-[#141414]">
        <h2 className="font-serif text-2xl mb-3">Dealer enquiry received</h2>
        <p className="text-sm text-[#555555] dark:text-[#9A9A9A]">Thanks for your interest. Our team will review your details and get in touch.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-[#141414] border border-[#D4D4D4] dark:border-[#2A2A2A] rounded-sm p-6 space-y-5">
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded-sm text-sm">{error}</div>}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <input name="contact_name" required placeholder="Contact name *" className="bg-transparent border border-[#D4D4D4] dark:border-[#2A2A2A] px-4 py-2.5 rounded-sm" />
        <input name="company_name" required placeholder="Company name *" className="bg-transparent border border-[#D4D4D4] dark:border-[#2A2A2A] px-4 py-2.5 rounded-sm" />
        <input name="email" type="email" required placeholder="Email *" className="bg-transparent border border-[#D4D4D4] dark:border-[#2A2A2A] px-4 py-2.5 rounded-sm" />
        <input name="phone" required pattern="^[0-9+\-\s()]{8,20}$" placeholder="Phone *" className="bg-transparent border border-[#D4D4D4] dark:border-[#2A2A2A] px-4 py-2.5 rounded-sm" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <input name="address_line" required placeholder="Address line *" className="bg-transparent border border-[#D4D4D4] dark:border-[#2A2A2A] px-4 py-2.5 rounded-sm" />
        <input name="city" required placeholder="City *" className="bg-transparent border border-[#D4D4D4] dark:border-[#2A2A2A] px-4 py-2.5 rounded-sm" />
        <input name="state" required placeholder="State *" className="bg-transparent border border-[#D4D4D4] dark:border-[#2A2A2A] px-4 py-2.5 rounded-sm" />
        <input name="pincode" required pattern="^[0-9A-Za-z\-\s]{4,12}$" placeholder="Pincode *" className="bg-transparent border border-[#D4D4D4] dark:border-[#2A2A2A] px-4 py-2.5 rounded-sm" />
        <input name="country" required defaultValue="India" placeholder="Country *" className="bg-transparent border border-[#D4D4D4] dark:border-[#2A2A2A] px-4 py-2.5 rounded-sm" />
        <input name="visiting_card" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="bg-transparent border border-[#D4D4D4] dark:border-[#2A2A2A] px-4 py-2.5 rounded-sm" />
      </div>

      <textarea name="message" rows={5} maxLength={2000} placeholder="Message or notes (optional)" className="w-full bg-transparent border border-[#D4D4D4] dark:border-[#2A2A2A] px-4 py-2.5 rounded-sm" />

      <button disabled={isSubmitting} className="bg-[#D4A017] hover:bg-[#E8B820] text-[#0A0A0A] font-semibold px-6 py-3 rounded-sm disabled:opacity-50">
        {isSubmitting ? "Submitting..." : "Submit Dealer Enquiry"}
      </button>
    </form>
  );
}
