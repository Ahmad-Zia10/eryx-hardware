"use client";

import { useMemo, useState } from "react";

const SUBJECTS = [
  ["general", "General Inquiry"],
  ["order_support", "Order Support"],
  ["product_question", "Product Question"],
  ["partnership", "Partnership"],
  ["other", "Other"],
] as const;

export default function ContactForm() {
  const [subject, setSubject] = useState("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const showOrderReference = useMemo(() => subject === "order_support", [subject]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not submit your message");
      }

      event.currentTarget.reset();
      setSubject("general");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Could not submit your message");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-surface-raised border border-line-strong p-8">
        <h2 className="font-extrabold tracking-[-0.02em] text-2xl text-ink mb-3">Message received</h2>
        <p className="text-sm text-ink-muted">
          Thanks for reaching out. Our team will get back to you soon.
        </p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="mt-6 bg-gold hover:bg-gold-bright text-on-gold font-semibold px-5 py-2.5 text-sm transition duration-200"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface-raised border border-line-strong p-6 space-y-5">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 text-sm">
          {error}
        </div>
      )}

      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium mb-2">Full name *</label>
          <input name="name" required minLength={2} className="w-full bg-transparent border border-line-strong px-4 py-2.5 focus:border-gold focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Email *</label>
          <input name="email" type="email" required className="w-full bg-transparent border border-line-strong px-4 py-2.5 focus:border-gold focus:outline-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium mb-2">Phone number *</label>
          <input name="phone" required pattern="^[0-9+\-\s()]{8,20}$" className="w-full bg-transparent border border-line-strong px-4 py-2.5 focus:border-gold focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Reason *</label>
          <select
            name="subject"
            required
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className="w-full bg-surface-raised border border-line-strong px-4 py-2.5 focus:border-gold focus:outline-none"
          >
            {SUBJECTS.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {showOrderReference && (
        <div>
          <label className="block text-sm font-medium mb-2">Order number</label>
          <input name="order_reference" className="w-full bg-transparent border border-line-strong px-4 py-2.5 focus:border-gold focus:outline-none" />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">Message *</label>
        <textarea name="message" required minLength={10} maxLength={2000} rows={6} className="w-full bg-transparent border border-line-strong px-4 py-2.5 focus:border-gold focus:outline-none" />
      </div>

      <button
        disabled={isSubmitting}
        className="bg-gold hover:bg-gold-bright text-on-gold font-semibold px-6 py-3 transition duration-200 disabled:opacity-50"
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
