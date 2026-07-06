alter table product_reviews
  add column approval_status text not null default 'pending'
  check (approval_status in ('pending', 'approved', 'rejected'));

create index idx_product_reviews_approval_status on product_reviews(approval_status);

drop policy "Anyone can read reviews" on product_reviews;

create policy "Anyone can read approved reviews"
  on product_reviews for select
  using (approval_status = 'approved');

create policy "Service role can read all reviews"
  on product_reviews for select
  using (auth.role() = 'service_role');
