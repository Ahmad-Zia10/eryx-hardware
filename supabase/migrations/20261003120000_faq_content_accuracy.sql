-- FAQ content accuracy pass. Four seeded answers promised things the
-- platform doesn't do: pan-India delivery (SERVICEABLE_PINCODES covers
-- six metro prefixes), emailed tracking links (no shipping integration),
-- GST invoices (not implemented) and EMI (not offered). The Ryx chat
-- assistant repeats FAQ answers verbatim, so these must be truthful
-- before it ships.
--
-- Matched on question text, not id: ids are generated per environment.
-- If an admin has already reworded a question in /admin/faqs, that row
-- is left alone — their edit wins.

UPDATE faqs SET
  answer = 'We currently deliver to Delhi NCR, Mumbai, Bangalore, Hyderabad, Chennai and Pune. Use the pincode checker on any product page to confirm your area. Outside these cities? Contact us and our team will check whether we can arrange delivery.',
  updated_at = now()
WHERE question = 'Which areas do you deliver to?';

UPDATE faqs SET
  answer = 'You can see the status of every order anytime under My Account. For dispatch or delivery updates, call or email us with your order number and our team will help.',
  updated_at = now()
WHERE question = 'Can I track my order?';

UPDATE faqs SET
  answer = 'We accept UPI, net banking and credit/debit cards through our secure Razorpay payment gateway. Cash on Delivery is not available at the moment.',
  updated_at = now()
WHERE question = 'What payment methods do you accept?';

UPDATE faqs SET
  answer = 'Your order details are always available under My Account. If you need an invoice for your records, email us with your order number and our team will help.',
  updated_at = now()
WHERE question = 'Can I get an invoice for my order?';
