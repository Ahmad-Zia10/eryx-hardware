create table promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_type text not null check (discount_type in ('fixed', 'percentage')),
  discount_value numeric not null check (discount_value > 0),
  min_order_value numeric default 0 check (min_order_value >= 0),
  is_active boolean default true,
  expires_at timestamptz,
  created_at timestamptz default now()
);

alter table orders 
add column promo_code_id uuid references promo_codes(id) on delete set null,
add column discount_applied numeric default 0;

alter table promo_codes enable row level security;

create policy "Anyone can read active promo codes"
  on promo_codes for select using (true);

-- Drop the old function
drop function if exists create_order_with_items;

-- Create the updated function
create or replace function create_order_with_items(
  p_customer_id uuid,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_shipping_address text,
  p_shipping_city text,
  p_shipping_pincode text,
  p_subtotal numeric,
  p_total numeric,
  p_razorpay_order_id text,
  p_items jsonb,
  p_promo_code_id uuid default null,
  p_discount_applied numeric default 0
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_order_id uuid;
  v_item jsonb;
begin
  -- Insert the order row
  insert into orders (
    customer_id,
    customer_name,
    customer_email,
    customer_phone,
    shipping_address,
    shipping_city,
    shipping_pincode,
    subtotal,
    total,
    status,
    razorpay_order_id,
    promo_code_id,
    discount_applied
  ) values (
    p_customer_id,
    p_customer_name,
    p_customer_email,
    p_customer_phone,
    p_shipping_address,
    p_shipping_city,
    p_shipping_pincode,
    p_subtotal,
    p_total,
    'pending',
    p_razorpay_order_id,
    p_promo_code_id,
    p_discount_applied
  )
  returning id into v_order_id;

  -- Insert all items for this order
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    insert into order_items (
      order_id,
      product_id,
      product_name,
      item_code,
      quantity,
      price_at_purchase
    ) values (
      v_order_id,
      (v_item->>'product_id')::uuid,
      v_item->>'product_name',
      v_item->>'item_code',
      (v_item->>'quantity')::integer,
      (v_item->>'price_at_purchase')::numeric
    );
  end loop;

  return v_order_id;
end;
$$;
