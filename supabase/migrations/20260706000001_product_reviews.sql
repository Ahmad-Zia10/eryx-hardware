create table product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade not null,
  customer_id uuid references auth.users(id) on delete cascade not null,
  rating integer not null check (rating between 1 and 5),
  review_text text,
  is_verified_purchase boolean default false,
  created_at timestamptz default now(),
  unique(product_id, customer_id)
);

alter table product_reviews enable row level security;

create policy "Anyone can read reviews"
  on product_reviews for select using (true);

create policy "Authenticated users can write their own review"
  on product_reviews for insert
  to authenticated
  with check (auth.uid() = customer_id);
