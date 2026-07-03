-- Atomic order creation function.
-- Both the order row and its items are inserted inside a single
-- transaction. If either insert fails for any reason, the entire
-- transaction rolls back — no orphaned order rows, no orders with
-- zero line items. This replaces the two sequential writes that
-- previously existed in create-order/route.ts.

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
  p_items jsonb  -- array of {item_code, product_name, quantity, price_at_purchase, product_id}
)
returns uuid  -- returns the new order's id
language plpgsql
security definer  -- runs with the privileges of the function owner (postgres),
                  -- not the calling role — necessary since order_items RLS
                  -- requires an exists() check against orders, and within a
                  -- single transaction the order row must be visible to that
                  -- check immediately. security definer bypasses this timing issue.
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
    razorpay_order_id
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
    p_razorpay_order_id
  )
  returning id into v_order_id;

  -- Insert each order item in the same transaction
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    insert into order_items (
      order_id,
      item_code,
      product_name,
      quantity,
      price_at_purchase,
      product_id
    ) values (
      v_order_id,
      (v_item->>'item_code')::text,
      (v_item->>'product_name')::text,
      (v_item->>'quantity')::integer,
      (v_item->>'price_at_purchase')::numeric,
      (v_item->>'product_id')::uuid
    );
  end loop;

  return v_order_id;
end;
$$;