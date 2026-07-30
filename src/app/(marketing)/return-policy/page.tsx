import type { Metadata } from "next";
import { PolicyLayout, PolicySection, PolicyList } from "@/components/sections/PolicyLayout";
import { SITE_CONFIG } from "@/constants";

export const metadata: Metadata = {
  title: "Return Policy | Eryx Hardware",
  description:
    "How to return eligible products purchased from Eryx Hardware, including timelines and conditions.",
};

export default function ReturnPolicyPage() {
  return (
    <PolicyLayout
      eyebrow="Policy"
      title="Return Policy"
      intro="We want you to be satisfied with your purchase. If something isn't right, here's how returns work."
      lastUpdated="30 July 2026"
    >
      <PolicySection heading="Return window">
        <p>
          You may request a return within <strong>7 days of delivery</strong>. To
          be eligible, the item must be unused, undamaged, and returned in its
          original packaging with all accessories and documentation included.
        </p>
      </PolicySection>

      <PolicySection heading="Eligible and non-eligible items">
        <PolicyList
          items={[
            "Eligible: items that are unused and in original, resalable condition, or items that arrived damaged, defective, or incorrect.",
            "Not eligible: items that have been installed or used, items missing original packaging or parts, and made-to-order or customised products.",
          ]}
        />
      </PolicySection>

      <PolicySection heading="Damaged, defective or incorrect items">
        <p>
          If your order arrives damaged, defective, or incorrect, please contact
          us within <strong>48 hours of delivery</strong> with your order number
          and photographs of the item and packaging. We will arrange a
          replacement or refund at no additional cost to you.
        </p>
      </PolicySection>

      <PolicySection heading="How to request a return">
        <PolicyList
          items={[
            <>
              Contact us at {SITE_CONFIG.email} or {SITE_CONFIG.phone} with your
              order number and reason for return.
            </>,
            "Our team will confirm eligibility and share return instructions.",
            "Once the returned item is received and inspected, we will process your refund per our Refund & Cancellation Policy.",
          ]}
        />
      </PolicySection>

      <PolicySection heading="Related policies">
        <p>
          Refund timelines and cancellations are covered in our{" "}
          <a href="/refund-policy" className="text-[#D4A017] hover:underline">
            Refund &amp; Cancellation Policy
          </a>
          . Delivery details are in our{" "}
          <a href="/shipping-policy" className="text-[#D4A017] hover:underline">
            Shipping Policy
          </a>
          .
        </p>
      </PolicySection>
    </PolicyLayout>
  );
}
