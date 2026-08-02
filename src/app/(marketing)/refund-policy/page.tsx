import type { Metadata } from "next";
import { PolicyLayout, PolicySection, PolicyList } from "@/components/sections/PolicyLayout";
import { SITE_CONFIG } from "@/constants";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | Eryx Hardware",
  description:
    "How refunds are processed and how you can cancel an order with Eryx Hardware.",
};

export default function RefundPolicyPage() {
  return (
    <PolicyLayout
      eyebrow="Policy"
      title="Refund & Cancellation Policy"
      intro="This policy explains when you can cancel an order and how refunds are issued."
      lastUpdated="30 July 2026"
    >
      <PolicySection heading="Order cancellation">
        <p>
          You may cancel your order at any time <strong>before it is dispatched</strong>{" "}
          for a full refund. Once an order has been dispatched, it can no longer be
          cancelled, but it may be eligible for return under our{" "}
          <a href="/return-policy" className="text-gold-deep hover:underline">
            Return Policy
          </a>
          . To cancel, contact us at {SITE_CONFIG.email} or {SITE_CONFIG.phone} with
          your order number.
        </p>
      </PolicySection>

      <PolicySection heading="Refunds">
        <PolicyList
          items={[
            "Approved refunds are issued to your original payment method.",
            "Refunds are processed within 5–7 business days after a cancellation is confirmed or a returned item is received and inspected.",
            "The time for the amount to reflect in your account depends on your bank or payment provider.",
          ]}
        />
      </PolicySection>

      <PolicySection heading="Failed or duplicate payments">
        <p>
          If a payment fails but an amount was debited, or if you were charged more
          than once for the same order, the excess is refunded automatically to the
          original payment method. If you do not see the reversal within 7 business
          days, contact us and we will assist.
        </p>
      </PolicySection>

      <PolicySection heading="Non-refundable situations">
        <PolicyList
          items={[
            "Items returned outside the eligible return window or not meeting return conditions.",
            "Made-to-order or customised products, unless they arrived damaged, defective, or incorrect.",
          ]}
        />
      </PolicySection>

      <PolicySection heading="Contact">
        <p>
          For any refund or cancellation query, reach us at {SITE_CONFIG.email} or{" "}
          {SITE_CONFIG.phone}.
        </p>
      </PolicySection>
    </PolicyLayout>
  );
}
