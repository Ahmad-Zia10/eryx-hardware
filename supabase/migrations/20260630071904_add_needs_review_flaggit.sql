-- Migration: add needs_review flag to orders.
--
-- Context: create-order/route.ts creates the orders row and the
-- Razorpay order first, then inserts order_items. If the order_items
-- insert fails for any reason after the order already succeeded, the
-- customer can still complete payment for an order with zero recorded
-- line items. Previously this only surfaced as a console.error, which
-- is easy to miss entirely. This flag makes that failure state durable
-- and queryable, so it can be checked/alerted on rather than silently
-- lost in logs.

alter table orders add column needs_review boolean default false;
alter table orders add column review_note text;

create index idx_orders_needs_review on orders(needs_review) where needs_review = true;