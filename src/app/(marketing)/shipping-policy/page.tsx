import type { Metadata } from "next";
import { PolicyLayout, PolicySection, PolicyList } from "@/components/sections/PolicyLayout";
import { SITE_CONFIG } from "@/constants";

export const metadata: Metadata = {
  title: "Shipping Policy | Eryx Hardware",
  description:
    "How and when Eryx Hardware processes and delivers orders across India.",
};

export default function ShippingPolicyPage() {
  return (
    <PolicyLayout
      eyebrow="Policy"
      title="Shipping Policy"
      intro="This policy explains how we process and deliver your order."
      lastUpdated="30 July 2026"
    >
      <PolicySection heading="Order processing">
        <p>
          Orders are processed within <strong>2–4 business days</strong> of
          successful payment. You will receive a confirmation once your order is
          placed, and a further update when it is dispatched.
        </p>
      </PolicySection>

      <PolicySection heading="Delivery timelines">
        <PolicyList
          items={[
            "Estimated delivery is typically 5–10 business days from dispatch, depending on your location.",
            "Delivery timelines are estimates and may vary due to courier schedules, remote locations, or circumstances beyond our control.",
            "The courier partner and tracking details, where available, are shared at the time of dispatch.",
          ]}
        />
      </PolicySection>

      <PolicySection heading="Shipping charges">
        <p>
          Shipping charges, where applicable, are calculated and shown at checkout
          before you complete your payment. Any applicable charges are displayed
          clearly before the order is confirmed.
        </p>
      </PolicySection>

      <PolicySection heading="Serviceable areas">
        <p>
          We currently deliver across serviceable locations in India. If your
          delivery location is not serviceable, we will contact you to arrange an
          alternative or issue a full refund.
        </p>
      </PolicySection>

      <PolicySection heading="Delays and issues">
        <p>
          If your order is delayed beyond the estimated window, or if you have any
          delivery concern, contact us at {SITE_CONFIG.email} or {SITE_CONFIG.phone}{" "}
          with your order number and we will help resolve it.
        </p>
      </PolicySection>
    </PolicyLayout>
  );
}
