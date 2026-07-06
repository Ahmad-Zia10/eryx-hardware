create table promo_usages (
  id uuid primary key default gen_random_uuid(),
  promo_code_id uuid references promo_codes(id) on delete cascade not null,
  customer_id uuid references auth.users(id) on delete cascade not null,
  order_id uuid references orders(id) on delete set null,
  used_at timestamptz default now(),
  unique(promo_code_id, customer_id)
);

alter table promo_usages enable row level security;

create policy "Service role manages promo usages"
  on promo_usages for all
  using (auth.role() = 'service_role');

alter table promo_codes add column max_uses_per_user integer default 1;
