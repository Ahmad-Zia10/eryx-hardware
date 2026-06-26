-- Migration: orders and order_items for guest checkout (Phase 2, Version A).
--
-- Design notes:
-- - customer_id is nullable and unused for now, reserved for when
--   Supabase Auth is introduced later. New orders will populate it;
--   existing guest orders stay valid with it NULL — no migration
--   needed when Auth arrives, this column just starts being used.
-- - customer_name/email/phone/address are stored directly on the
--   order itself rather than only via a foreign key, since guest
--   orders have no account row to join against.
-- - order_items.price_at_purchase is captured at checkout time and
--   never recalculated from products.mrp later — protects order
--   history from changing if a product's price changes afterward.

create table orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references auth.users(id) on delete set null, -- reserved for future Auth
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address text not null,
  shipping_city text not null,
  shipping_pincode text not null,
  subtotal numeric not null,
  total numeric not null,
  status text default 'pending' check (status in ('pending', 'paid', 'failed', 'cancelled', 'shipped', 'delivered')),
  razorpay_order_id text unique,
  razorpay_payment_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_orders_status on orders(status);
create index idx_orders_customer_email on orders(customer_email);
create index idx_orders_razorpay_order_id on orders(razorpay_order_id);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade not null,
  product_id uuid references products(id) on delete set null,
  product_name text not null, -- captured at purchase time, survives product deletion
  item_code text not null,
  quantity integer not null check (quantity > 0),
  price_at_purchase numeric not null,
  created_at timestamptz default now()
);

create index idx_order_items_order_id on order_items(order_id);

-- ─── RLS ──────────────────────────────────────────────────────────
alter table orders enable row level security;
alter table order_items enable row level security;

-- Public (anon) can INSERT an order during checkout, but can never
-- read any order back through the anon key — order status/confirmation
-- is returned directly from the API route response at creation time,
-- not via a later anon SELECT. This mirrors the enquiries table pattern.
create policy "Public can create orders"
  on orders for insert
  with check (true);

create policy "Service role can do anything on orders"
  on orders for all
  using (auth.role() = 'service_role');

create policy "Public can create order items"
  on order_items for insert
  with check (true);

create policy "Service role can do anything on order items"
  on order_items for all
  using (auth.role() = 'service_role');