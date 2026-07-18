-- FAQ CRUD: move FAQs from the hardcoded FAQS constant in src/constants
-- into two Supabase tables so admins can add / edit / reorder / delete
-- categories and questions without a deploy. Seeds the exact content
-- currently in the constant so the public site (home teaser and /faqs)
-- doesn't regress on cutover.

CREATE TABLE faq_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Partial index — the hot path is "list visible categories, ordered".
CREATE INDEX idx_faq_categories_visible_order
  ON faq_categories(is_visible, display_order)
  WHERE is_visible = true;

CREATE TABLE faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES faq_categories(id) ON DELETE CASCADE NOT NULL,
  question text NOT NULL,
  answer text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_faqs_category_order ON faqs(category_id, display_order);

ALTER TABLE faq_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads visible categories"
  ON faq_categories FOR SELECT USING (is_visible = true);
CREATE POLICY "Service role full access on categories"
  ON faq_categories FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public reads visible faqs"
  ON faqs FOR SELECT USING (is_visible = true);
CREATE POLICY "Service role full access on faqs"
  ON faqs FOR ALL USING (auth.role() = 'service_role');

-- ─── Seed ─────────────────────────────────────────────────────────
-- Mirror of the current FAQS constant in src/constants/index.ts.
-- display_order matches the array position so the public output is
-- byte-identical to what the constant produced.
WITH cats AS (
  INSERT INTO faq_categories (name, display_order)
  VALUES
    ('Products', 0),
    ('Orders & Delivery', 1),
    ('Payments', 2),
    ('Returns & Support', 3)
  RETURNING id, name
)
INSERT INTO faqs (category_id, question, answer, display_order)
SELECT
  c.id,
  q.question,
  q.answer,
  q.display_order
FROM cats c
JOIN (
  VALUES
    ('Products', 0, 'What materials are used in Eryx kitchen hardware?', 'All Eryx hardware uses German-engineered steel components certified by SGS, with finishes available in Golden, Chrome, Dark Grey, Satin, and Glass options.'),
    ('Products', 1, 'Do you offer products for both modular kitchens and wardrobes?', 'Yes, Eryx offers a complete range covering kitchen storage systems, wardrobe accessories, and hardware fittings.'),
    ('Products', 2, 'Are dimensions listed per product?', 'Yes, every product listing includes exact dimensions in millimetres and a full specification table.'),
    ('Orders & Delivery', 0, 'Which areas do you deliver to?', 'We deliver pan India. Use the pincode checker on any product page to confirm serviceability to your specific area.'),
    ('Orders & Delivery', 1, 'How long does delivery take?', 'Standard delivery takes 5-7 business days. Delivery timelines may vary for remote areas.'),
    ('Orders & Delivery', 2, 'Can I track my order?', 'Yes, once your order is shipped you will receive a tracking link via email at the address used during checkout.'),
    ('Payments', 0, 'What payment methods do you accept?', 'We accept UPI, net banking, credit/debit cards, and EMI options through our secure Razorpay payment gateway.'),
    ('Payments', 1, 'Is it safe to pay on this website?', 'Yes, all payments are processed through Razorpay with bank-grade encryption. We do not store any card details.'),
    ('Payments', 2, 'Can I get an invoice for my order?', 'Yes, a GST invoice is generated for every order and sent to your registered email address.'),
    ('Returns & Support', 0, 'What is the return policy?', 'We accept returns for manufacturing defects within 7 days of delivery. Please contact us with photographs of the issue.'),
    ('Returns & Support', 1, 'How do I contact support?', 'Call us at 70111 84853 or email Info@modularindia.com. Our team is available Monday to Saturday, 9:30 AM to 6 PM.')
) AS q(cat_name, display_order, question, answer)
  ON q.cat_name = c.name;
