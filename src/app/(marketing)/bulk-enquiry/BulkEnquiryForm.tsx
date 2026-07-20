"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type ProductOption = {
  id: string;
  name: string;
  item_code: string;
  image_url: string | null;
};

type Line = {
  product_id: string;
  quantity: number;
  note: string;
};

// Shared control styling — visible labels + these classes are the
// standard for public forms (placeholder-only inputs fail a11y: the
// "label" disappears the moment the user types).
const inputClass =
  "w-full bg-surface border border-line-strong px-3.5 py-2.5 rounded-control text-sm text-ink placeholder:text-ink-faint focus:border-gold outline-none transition-colors duration-200";
const labelClass = "block text-sm font-medium text-ink mb-1.5";

export default function BulkEnquiryForm({ products }: { products: ProductOption[] }) {
  const searchParams = useSearchParams();

  // Resolve ?variant=<uuid> against the products prop. If present and
  // valid, seed the first line with it so PDP → Bulk Enquiry deep-links
  // land with the right product preselected. Silent fallback to the
  // current default when the variant isn't in the picker's options.
  const preselectedVariantId = useMemo(() => {
    const raw = searchParams.get("variant");
    if (!raw) return null;
    return products.some((p) => p.id === raw) ? raw : null;
  }, [searchParams, products]);

  const [lines, setLines] = useState<Line[]>([
    {
      product_id: preselectedVariantId || products[0]?.id || "",
      quantity: 1,
      note: "",
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // If the search param changes after mount (rare — e.g. same-page nav),
  // update the first line to reflect it. Only touches the first line;
  // any user-added lines are left alone.
  useEffect(() => {
    if (!preselectedVariantId) return;
    setLines((current) => {
      if (current[0]?.product_id === preselectedVariantId) return current;
      return current.map((line, idx) =>
        idx === 0 ? { ...line, product_id: preselectedVariantId } : line
      );
    });
  }, [preselectedVariantId]);

  const updateLine = (index: number, patch: Partial<Line>) => {
    setLines((current) => current.map((line, lineIndex) => lineIndex === index ? { ...line, ...patch } : line));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      customer_name: String(formData.get("customer_name") || ""),
      company_name: String(formData.get("company_name") || ""),
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || ""),
      message: String(formData.get("message") || ""),
      website: String(formData.get("website") || ""),
      items: lines.filter((line) => line.product_id && line.quantity > 0),
    };

    try {
      const response = await fetch("/api/bulk-enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Could not submit enquiry");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Could not submit enquiry");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="border border-line rounded-card p-8 bg-surface-raised">
        <h2 className="font-serif text-2xl mb-3">Bulk enquiry received</h2>
        <p className="text-sm text-ink-muted">Our sales team will review your requirement and contact you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded-sm text-sm">{error}</div>}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <section className="border border-line rounded-card p-5 space-y-4">
        <h2 className="font-semibold">Products</h2>
        {preselectedVariantId && (
          <p className="text-xs text-gold-deep">
            Pre-selected from product page. Add more products or update the line below.
          </p>
        )}
        {lines.map((line, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_120px_1fr_auto] gap-3">
            <select
              value={line.product_id}
              onChange={(event) => updateLine(index, { product_id: event.target.value })}
              required
              aria-label="Product"
              className={inputClass}
            >
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>{product.item_code} - {product.name}</option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              value={line.quantity}
              onChange={(event) => updateLine(index, { quantity: Number(event.target.value) })}
              aria-label="Quantity"
              className={inputClass}
            />
            <input
              value={line.note}
              onChange={(event) => updateLine(index, { note: event.target.value })}
              placeholder="Line note (optional)"
              aria-label="Line note"
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => setLines((current) => current.filter((_, lineIndex) => lineIndex !== index))}
              disabled={lines.length === 1}
              className="border border-line-strong text-ink-muted hover:border-gold hover:text-gold-deep px-3 py-2 rounded-control disabled:opacity-50 transition-colors duration-200"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setLines((current) => [...current, { product_id: "", quantity: 1, note: "" }])}
          className="text-sm text-gold-deep hover:text-gold transition-colors duration-200"
        >
          Add another product
        </button>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="be-name" className={labelClass}>
            Full name <span className="text-gold-deep">*</span>
          </label>
          <input id="be-name" name="customer_name" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="be-company" className={labelClass}>
            Company name
          </label>
          <input id="be-company" name="company_name" className={inputClass} />
        </div>
        <div>
          <label htmlFor="be-email" className={labelClass}>
            Email <span className="text-gold-deep">*</span>
          </label>
          <input id="be-email" name="email" type="email" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="be-phone" className={labelClass}>
            Phone <span className="text-gold-deep">*</span>
          </label>
          <input id="be-phone" name="phone" required pattern="^[0-9+\-\s()]{8,20}$" className={inputClass} />
        </div>
      </section>

      <div>
        <label htmlFor="be-message" className={labelClass}>
          Message <span className="text-ink-faint font-normal">(optional)</span>
        </label>
        <textarea id="be-message" name="message" rows={5} maxLength={2000} className={inputClass} />
      </div>

      <button disabled={isSubmitting} className="bg-gold hover:bg-gold-bright text-on-gold font-semibold px-6 py-3 rounded-control disabled:opacity-50 transition duration-200 ease-in-out">
        {isSubmitting ? "Submitting..." : "Submit Bulk Enquiry"}
      </button>
    </form>
  );
}
