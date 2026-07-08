alter table blog_posts
  add column if not exists content_json jsonb,
  add column if not exists author text,
  add column if not exists meta_title text,
  add column if not exists meta_description text,
  add column if not exists updated_at timestamptz default now();

create table contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  subject text not null check (subject in ('general', 'order_support', 'product_question', 'partnership', 'other')),
  message text not null,
  order_reference text,
  status text not null default 'new' check (status in ('new', 'in_progress', 'resolved')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_contact_submissions_status on contact_submissions(status);
create index idx_contact_submissions_created_at on contact_submissions(created_at desc);

create table bulk_enquiries (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  company_name text,
  email text not null,
  phone text not null,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'quoted', 'closed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table bulk_enquiry_items (
  id uuid primary key default gen_random_uuid(),
  bulk_enquiry_id uuid references bulk_enquiries(id) on delete cascade not null,
  product_id uuid references products(id) on delete set null,
  product_name_snapshot text not null,
  quantity integer not null check (quantity > 0),
  note text
);

create index idx_bulk_enquiries_status on bulk_enquiries(status);
create index idx_bulk_enquiries_created_at on bulk_enquiries(created_at desc);
create index idx_bulk_enquiry_items_bulk_enquiry_id on bulk_enquiry_items(bulk_enquiry_id);

create table dealer_enquiries (
  id uuid primary key default gen_random_uuid(),
  contact_name text not null,
  company_name text not null,
  email text not null,
  phone text not null,
  address_line text not null,
  city text not null,
  state text not null,
  pincode text not null,
  country text not null default 'India',
  message text,
  visiting_card_url text,
  status text not null default 'new' check (status in ('new', 'reviewing', 'approved', 'rejected')),
  review_note text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  converted_dealer_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_dealer_enquiries_status on dealer_enquiries(status);
create index idx_dealer_enquiries_city_state on dealer_enquiries(city, state);
create index idx_dealer_enquiries_created_at on dealer_enquiries(created_at desc);

create table support_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  order_id uuid references orders(id) on delete cascade not null,
  order_item_id uuid references order_items(id) on delete set null,
  reason text not null check (reason in ('order_not_received', 'wrong_item', 'damaged_product', 'refund_return', 'other')),
  message text not null,
  attachment_url text,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_support_requests_user_id on support_requests(user_id);
create index idx_support_requests_order_id on support_requests(order_id);
create index idx_support_requests_status on support_requests(status);
create index idx_support_requests_created_at on support_requests(created_at desc);

create table about_page_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique check (section_key in ('history', 'founder', 'mission')),
  title text not null,
  content_json jsonb,
  content_html text,
  image_url text,
  display_order integer not null default 0,
  is_visible boolean not null default true,
  updated_at timestamptz default now(),
  updated_by uuid references auth.users(id) on delete set null
);

insert into about_page_sections (section_key, title, display_order, is_visible)
values
  ('history', 'Our Story', 1, true),
  ('founder', 'Founder''s Message', 2, true),
  ('mission', 'Mission & Values', 3, true)
on conflict (section_key) do nothing;

alter table contact_submissions enable row level security;
alter table bulk_enquiries enable row level security;
alter table bulk_enquiry_items enable row level security;
alter table dealer_enquiries enable row level security;
alter table support_requests enable row level security;
alter table about_page_sections enable row level security;

create policy "Service role can manage contact submissions"
  on contact_submissions for all using (auth.role() = 'service_role');

create policy "Service role can manage bulk enquiries"
  on bulk_enquiries for all using (auth.role() = 'service_role');

create policy "Service role can manage bulk enquiry items"
  on bulk_enquiry_items for all using (auth.role() = 'service_role');

create policy "Service role can manage dealer enquiries"
  on dealer_enquiries for all using (auth.role() = 'service_role');

create policy "Service role can manage support requests"
  on support_requests for all using (auth.role() = 'service_role');

create policy "Users can read their support requests"
  on support_requests for select using (auth.uid() = user_id);

create policy "Service role can manage about sections"
  on about_page_sections for all using (auth.role() = 'service_role');

create policy "Public can view visible about sections"
  on about_page_sections for select using (is_visible = true);
