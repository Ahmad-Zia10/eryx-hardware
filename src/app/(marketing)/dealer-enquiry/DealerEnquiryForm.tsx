"use client";

import { useState } from "react";

// Shared control styling — visible labels + these classes are the
// standard for public forms (placeholder-only inputs fail a11y: the
// "label" disappears the moment the user types).
const inputClass =
  "w-full bg-surface border border-line-strong px-3.5 py-2.5 rounded-control text-sm text-ink placeholder:text-ink-faint focus:border-gold outline-none transition-colors duration-200";
const labelClass = "block text-sm font-medium text-ink mb-1.5";

const required = <span className="text-gold-deep">*</span>;

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
      <div className="border border-line rounded-card p-8 bg-surface-raised">
        <h2 className="font-serif text-2xl mb-3">Dealer enquiry received</h2>
        <p className="text-sm text-ink-muted">Thanks for your interest. Our team will review your details and get in touch.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface-raised border border-line rounded-card p-6 space-y-5">
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded-control text-sm">{error}</div>}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="de-contact" className={labelClass}>Contact name {required}</label>
          <input id="de-contact" name="contact_name" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="de-company" className={labelClass}>Company name {required}</label>
          <input id="de-company" name="company_name" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="de-email" className={labelClass}>Email {required}</label>
          <input id="de-email" name="email" type="email" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="de-phone" className={labelClass}>Phone {required}</label>
          <input id="de-phone" name="phone" required pattern="^[0-9+\-\s()]{8,20}$" className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="de-address" className={labelClass}>Address line {required}</label>
          <input id="de-address" name="address_line" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="de-city" className={labelClass}>City {required}</label>
          <input id="de-city" name="city" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="de-state" className={labelClass}>State {required}</label>
          <input id="de-state" name="state" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="de-pincode" className={labelClass}>Pincode {required}</label>
          <input id="de-pincode" name="pincode" required pattern="^[0-9A-Za-z\-\s]{4,12}$" className={inputClass} />
        </div>
        <div>
          <label htmlFor="de-country" className={labelClass}>Country {required}</label>
          <input id="de-country" name="country" required defaultValue="India" className={inputClass} />
        </div>
        <div>
          <label htmlFor="de-card" className={labelClass}>
            Visiting card <span className="text-ink-faint font-normal">(image or PDF)</span>
          </label>
          <input
            id="de-card"
            name="visiting_card"
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className={`${inputClass} file:mr-3 file:border-0 file:bg-gold-tint file:text-gold-deep file:font-medium file:text-xs file:px-3 file:py-1.5 file:rounded-control file:cursor-pointer`}
          />
        </div>
      </div>

      <div>
        <label htmlFor="de-message" className={labelClass}>
          Message or notes <span className="text-ink-faint font-normal">(optional)</span>
        </label>
        <textarea id="de-message" name="message" rows={5} maxLength={2000} className={inputClass} />
      </div>

      <button disabled={isSubmitting} className="bg-gold hover:bg-gold-bright text-on-gold font-semibold px-6 py-3 rounded-control disabled:opacity-50 transition duration-200 ease-in-out">
        {isSubmitting ? "Submitting..." : "Submit Dealer Enquiry"}
      </button>
    </form>
  );
}
