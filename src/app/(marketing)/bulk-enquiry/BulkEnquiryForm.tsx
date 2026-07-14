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
      <div className="border border-[#D4D4D4] dark:border-[#2A2A2A] rounded-sm p-8 bg-white dark:bg-[#141414]">
        <h2 className="font-serif text-2xl mb-3">Bulk enquiry received</h2>
        <p className="text-sm text-[#555555] dark:text-[#9A9A9A]">Our sales team will review your requirement and contact you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded-sm text-sm">{error}</div>}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <section className="border border-[#D4D4D4] dark:border-[#2A2A2A] rounded-sm p-5 space-y-4">
        <h2 className="font-semibold">Products</h2>
        {preselectedVariantId && (
          <p className="text-xs text-[#D4A017]">
            Pre-selected from product page. Add more products or update the line below.
          </p>
        )}
        {lines.map((line, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_120px_1fr_auto] gap-3">
            <select
              value={line.product_id}
              onChange={(event) => updateLine(index, { product_id: event.target.value })}
              required
              className="bg-white dark:bg-[#141414] border border-[#D4D4D4] dark:border-[#2A2A2A] px-3 py-2 rounded-sm"
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
              className="bg-transparent border border-[#D4D4D4] dark:border-[#2A2A2A] px-3 py-2 rounded-sm"
            />
            <input
              value={line.note}
              onChange={(event) => updateLine(index, { note: event.target.value })}
              placeholder="Line note (optional)"
              className="bg-transparent border border-[#D4D4D4] dark:border-[#2A2A2A] px-3 py-2 rounded-sm"
            />
            <button
              type="button"
              onClick={() => setLines((current) => current.filter((_, lineIndex) => lineIndex !== index))}
              disabled={lines.length === 1}
              className="border border-[#D4D4D4] dark:border-[#2A2A2A] px-3 py-2 rounded-sm disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setLines((current) => [...current, { product_id: "", quantity: 1, note: "" }])}
          className="text-sm text-[#D4A017] hover:text-[#E8B820]"
        >
          Add another product
        </button>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <input name="customer_name" required placeholder="Full name *" className="bg-transparent border border-[#D4D4D4] dark:border-[#2A2A2A] px-4 py-2.5 rounded-sm" />
        <input name="company_name" placeholder="Company name" className="bg-transparent border border-[#D4D4D4] dark:border-[#2A2A2A] px-4 py-2.5 rounded-sm" />
        <input name="email" type="email" required placeholder="Email *" className="bg-transparent border border-[#D4D4D4] dark:border-[#2A2A2A] px-4 py-2.5 rounded-sm" />
        <input name="phone" required pattern="^[0-9+\-\s()]{8,20}$" placeholder="Phone *" className="bg-transparent border border-[#D4D4D4] dark:border-[#2A2A2A] px-4 py-2.5 rounded-sm" />
      </section>

      <textarea name="message" rows={5} maxLength={2000} placeholder="Message (optional)" className="w-full bg-transparent border border-[#D4D4D4] dark:border-[#2A2A2A] px-4 py-2.5 rounded-sm" />

      <button disabled={isSubmitting} className="bg-[#D4A017] hover:bg-[#E8B820] text-[#0A0A0A] font-semibold px-6 py-3 rounded-sm disabled:opacity-50">
        {isSubmitting ? "Submitting..." : "Submit Bulk Enquiry"}
      </button>
    </form>
  );
}
