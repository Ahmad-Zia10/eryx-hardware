-- ═══════════════════════════════════════════════════════════
-- PRODUCTS TABLE
-- ═══════════════════════════════════════════════════════════
create table products (
  id uuid primary key default gen_random_uuid(),
  item_code text unique not null,
  catalogue_sno integer,
  name text not null,
  description text,
  series text,
  material text,
  category text not null,
  product_line text not null check (product_line in ('kitchen', 'wardrobe', 'hardware')),
  finish text,
  weight_capacity_kg numeric,
  width_mm numeric,
  depth_mm numeric,
  height_mm numeric,
  dimension_notes text,
  mrp numeric not null,
  is_featured boolean default false,
  is_active boolean default true,
  image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_products_category on products(category);
create index idx_products_product_line on products(product_line);
create index idx_products_is_active on products(is_active);

-- ═══════════════════════════════════════════════════════════
-- PRODUCT IMAGES TABLE (supports multi-image gallery — needed
-- for the Drive folder structure with ~5 photos per product)
-- ═══════════════════════════════════════════════════════════
create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade not null,
  image_url text not null,
  display_order integer default 0,
  is_primary boolean default false,
  created_at timestamptz default now()
);

create index idx_product_images_product_id on product_images(product_id);

-- ═══════════════════════════════════════════════════════════
-- ENQUIRIES TABLE
-- ═══════════════════════════════════════════════════════════
create table enquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text not null,
  city text,
  message text,
  enquiry_type text not null check (enquiry_type in ('product', 'dealer', 'bulk', 'general')),
  status text default 'new' check (status in ('new', 'contacted', 'resolved', 'closed')),
  product_id uuid references products(id) on delete set null,
  product_name text,
  created_at timestamptz default now()
);

create index idx_enquiries_status on enquiries(status);
create index idx_enquiries_created_at on enquiries(created_at desc);

-- ═══════════════════════════════════════════════════════════
-- BLOG POSTS TABLE
-- ═══════════════════════════════════════════════════════════
create table blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  content text not null,
  cover_image_url text,
  status text default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz default now()
);

create index idx_blog_posts_slug on blog_posts(slug);
create index idx_blog_posts_status on blog_posts(status);


-- Enable RLS on all tables
alter table products enable row level security;
alter table product_images enable row level security;
alter table enquiries enable row level security;
alter table blog_posts enable row level security;

-- ─── PRODUCTS: public can read active products, only admin can write ───
create policy "Public can view active products"
  on products for select
  using (is_active = true);

create policy "Service role can do anything on products"
  on products for all
  using (auth.role() = 'service_role');

-- ─── PRODUCT IMAGES: public can read, only admin can write ───
create policy "Public can view product images"
  on product_images for select
  using (true);

create policy "Service role can do anything on product images"
  on product_images for all
  using (auth.role() = 'service_role');

-- ─── ENQUIRIES: public can INSERT only, never read others' enquiries ───
create policy "Public can submit enquiries"
  on enquiries for insert
  with check (true);

create policy "Service role can do anything on enquiries"
  on enquiries for all
  using (auth.role() = 'service_role');

-- ─── BLOG POSTS: public can read published posts only ───
create policy "Public can view published posts"
  on blog_posts for select
  using (status = 'published');

create policy "Service role can do anything on blog posts"
  on blog_posts for all
  using (auth.role() = 'service_role');