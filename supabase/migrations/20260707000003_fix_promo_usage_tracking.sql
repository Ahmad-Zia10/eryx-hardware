alter table promo_usages
  drop constraint if exists promo_usages_promo_code_id_customer_id_key;

create index if not exists idx_promo_usages_code_customer
  on promo_usages(promo_code_id, customer_id);

create or replace function mark_order_paid_and_record_promo(
  p_razorpay_order_id text,
  p_razorpay_payment_id text default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order orders%rowtype;
  v_usage_count integer;
  v_max_uses integer;
  v_lock_key bigint;
begin
  select *
    into v_order
    from orders
   where razorpay_order_id = p_razorpay_order_id
   for update;

  if not found then
    raise exception 'Order not found for Razorpay order id %', p_razorpay_order_id;
  end if;

  if v_order.status = 'paid' then
    return 'already_processed';
  end if;

  update orders
     set status = 'paid',
         razorpay_payment_id = p_razorpay_payment_id,
         updated_at = now()
   where id = v_order.id;

  if v_order.promo_code_id is not null then
    if v_order.customer_id is null then
      update orders
         set needs_review = true,
             review_note = coalesce(review_note || ' ', '') || 'Promo usage could not be recorded because customer_id is missing.',
             updated_at = now()
       where id = v_order.id;
      return 'paid_needs_review';
    end if;

    v_lock_key := ('x' || substr(md5(v_order.promo_code_id::text || ':' || v_order.customer_id::text), 1, 16))::bit(64)::bigint;
    perform pg_advisory_xact_lock(v_lock_key);

    select coalesce(max_uses_per_user, 1)
      into v_max_uses
      from promo_codes
     where id = v_order.promo_code_id;

    select count(*)
      into v_usage_count
      from promo_usages
     where promo_code_id = v_order.promo_code_id
       and customer_id = v_order.customer_id;

    if v_usage_count >= coalesce(v_max_uses, 1) then
      update orders
         set needs_review = true,
             review_note = coalesce(review_note || ' ', '') || 'Promo usage limit was exceeded after payment capture; manual review required.',
             updated_at = now()
       where id = v_order.id;
      return 'paid_needs_review';
    end if;

    insert into promo_usages (promo_code_id, customer_id, order_id)
    values (v_order.promo_code_id, v_order.customer_id, v_order.id);
  end if;

  return 'paid';
end;
$$;
