import type { Metadata } from "next";
import { PolicyLayout, PolicySection, PolicyList } from "@/components/sections/PolicyLayout";
import { SITE_CONFIG, EXPERIENCE_CENTRE } from "@/constants";

export const metadata: Metadata = {
  title: "Terms & Conditions | Eryx Hardware",
  description:
    "The terms and conditions governing use of the Eryx Hardware website and purchases made through it.",
};

const ADDRESS = EXPERIENCE_CENTRE.addressLines.join(", ");

export default function TermsPage() {
  return (
    <PolicyLayout
      eyebrow="Legal"
      title="Terms & Conditions"
      intro="These terms govern your use of the Eryx Hardware website and any purchase you make through it. By using this website, you agree to these terms."
      lastUpdated="30 July 2026"
    >
      <PolicySection heading="1. About us">
        <p>
          This website is operated by {SITE_CONFIG.name}, {SITE_CONFIG.division},
          with its registered place of business at {ADDRESS}. Throughout the site,
          the terms &ldquo;we&rdquo;, &ldquo;us&rdquo; and &ldquo;our&rdquo; refer
          to {SITE_CONFIG.name}. You can reach us at {SITE_CONFIG.email} or{" "}
          {SITE_CONFIG.phone}.
        </p>
      </PolicySection>

      <PolicySection heading="2. Use of the website">
        <p>
          You may use this website to browse our catalogue and place orders for
          products for lawful purposes only. You agree not to misuse the site,
          attempt to gain unauthorised access, or interfere with its normal
          operation.
        </p>
      </PolicySection>

      <PolicySection heading="3. Products, pricing and availability">
        <PolicyList
          items={[
            "All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise.",
            "We make every effort to display product details, specifications and prices accurately. Errors may occasionally occur; where a product's correct price differs from the price shown, we will contact you before dispatch.",
            "Products are subject to availability. If an item you have ordered is unavailable, we will inform you and offer a suitable alternative or a full refund.",
          ]}
        />
      </PolicySection>

      <PolicySection heading="4. Orders and payment">
        <p>
          When you place an order, you will receive confirmation once payment is
          successfully processed through our payment partner. Payment is handled
          securely and we do not store your card or banking details. We reserve
          the right to accept or decline any order.
        </p>
      </PolicySection>

      <PolicySection heading="5. Returns, refunds and shipping">
        <p>
          Returns, refunds, cancellations and delivery are governed by our{" "}
          <a href="/return-policy" className="text-gold-deep hover:underline">
            Return Policy
          </a>
          ,{" "}
          <a href="/refund-policy" className="text-gold-deep hover:underline">
            Refund &amp; Cancellation Policy
          </a>{" "}
          and{" "}
          <a href="/shipping-policy" className="text-gold-deep hover:underline">
            Shipping Policy
          </a>
          , which form part of these terms.
        </p>
      </PolicySection>

      <PolicySection heading="6. Intellectual property">
        <p>
          All content on this website — including text, images, product
          photography, logos and design — is the property of {SITE_CONFIG.name} or
          its licensors and may not be reproduced without permission.
        </p>
      </PolicySection>

      <PolicySection heading="7. Limitation of liability">
        <p>
          To the extent permitted by law, {SITE_CONFIG.name} shall not be liable
          for any indirect or consequential loss arising from the use of this
          website or products purchased through it. Nothing in these terms limits
          your statutory rights as a consumer.
        </p>
      </PolicySection>

      <PolicySection heading="8. Governing law">
        <p>
          These terms are governed by the laws of India, and any disputes shall be
          subject to the jurisdiction of the courts of Uttar Pradesh, India.
        </p>
      </PolicySection>

      <PolicySection heading="9. Contact">
        <p>
          For any questions about these terms, contact us at {SITE_CONFIG.email} or{" "}
          {SITE_CONFIG.phone}.
        </p>
      </PolicySection>
    </PolicyLayout>
  );
}
