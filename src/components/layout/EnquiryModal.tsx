"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import { useUI } from "@/context/UIContext";

const inputClasses =
  "w-full border border-[#D4D4D4] dark:border-[#2A2A2A] bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#F5F5F5] text-sm px-4 py-3 focus:border-[#D4A017] focus:outline-none placeholder-[#555555] dark:placeholder-[#9A9A9A]";

export default function EnquiryModal() {
  const { enquiryModal, closeEnquiryModal } = useUI();
  const { open, productName, prefilledMessage, heading } = enquiryModal;

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeEnquiryModal();
    };
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, closeEnquiryModal]);

  if (!open) return null;

  return (
    <EnquiryModalContent
      key={`${productName || ""}-${prefilledMessage || ""}-${heading}`}
      productName={productName}
      prefilledMessage={prefilledMessage}
      heading={heading}
      closeEnquiryModal={closeEnquiryModal}
    />
  );
}

interface EnquiryModalContentProps {
  productName: string | null;
  prefilledMessage: string;
  heading: string;
  closeEnquiryModal: () => void;
}

function EnquiryModalContent({
  productName,
  prefilledMessage,
  heading,
  closeEnquiryModal,
}: EnquiryModalContentProps) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    message: prefilledMessage || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.name,
          phone: form.phone,
          email: form.email,
          city: form.city,
          message: form.message,
          enquiry_type: productName ? "product" : "general",
          product_name: productName || undefined,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setErrorMessage(result.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setErrorMessage("Could not reach the server. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    closeEnquiryModal();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center overflow-y-auto"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-[#141414] border border-[#D4D4D4] dark:border-[#2A2A2A] max-w-md w-full mx-4 mt-20 rounded-sm relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-[#555555] dark:text-[#9A9A9A] hover:text-[#D4A017] transition duration-200 ease-in-out"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="p-6">
          {submitted ? (
            <div className="flex flex-col items-center text-center gap-3 py-6">
              <CheckCircle className="text-[#D4A017]" size={48} />
              <h2 className="text-xl font-bold text-[#0A0A0A] dark:text-[#F5F5F5] font-serif">
                Enquiry Sent!
              </h2>
              <p className="text-[#555555] dark:text-[#9A9A9A]">
                Our team will contact you within 24 hours.
              </p>
              <button
                onClick={handleClose}
                className="mt-2 border border-[#D4D4D4] dark:border-[#2A2A2A] text-[#555555] dark:text-[#9A9A9A] hover:border-[#D4A017] px-6 py-2 transition duration-200 ease-in-out"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-[#0A0A0A] dark:text-[#F5F5F5] font-serif">
                {heading}
              </h2>
              {productName && (
                <p className="text-[#D4A017] text-sm mt-1">{productName}</p>
              )}

              {errorMessage && (
                <div className="flex items-center gap-2 mt-3 text-sm text-red-500">
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-4">
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  className={inputClasses}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <input
                  type="tel"
                  required
                  placeholder="Phone Number"
                  className={inputClasses}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  className={inputClasses}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <input
                  type="text"
                  required
                  placeholder="City"
                  className={inputClasses}
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
                <textarea
                  required
                  rows={3}
                  placeholder="Tell us about your project or requirement"
                  className={inputClasses}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#D4A017] hover:bg-[#E8B820] disabled:opacity-60 disabled:cursor-not-allowed text-[#0A0A0A] font-semibold w-full py-3 transition duration-200 ease-in-out"
                >
                  {submitting ? "Sending..." : "Send Enquiry"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}