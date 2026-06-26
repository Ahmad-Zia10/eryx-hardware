-- Migration: Update orders RLS for authenticated users.

-- 1. Drop existing 'Public can create orders' policy since guest checkout is disabled.
drop policy if exists "Public can create orders" on orders;

-- 2. Add policy to allow authenticated users to create their own orders.
create policy "Authenticated users can create their own orders"
  on orders for insert
  to authenticated
  with check (auth.uid() = customer_id);

-- 3. Add policy to allow authenticated users to read their own orders.
create policy "Authenticated users can view their own orders"
  on orders for select
  to authenticated
  using (auth.uid() = customer_id);

-- Update order_items RLS
drop policy if exists "Public can create order items" on order_items;

create policy "Authenticated users can create their own order items"
  on order_items for insert
  to authenticated
  with check (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and orders.customer_id = auth.uid()
    )
  );

create policy "Authenticated users can view their own order items"
  on order_items for select
  to authenticated
  using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and orders.customer_id = auth.uid()
    )
  );
