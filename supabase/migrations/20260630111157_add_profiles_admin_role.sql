-- Migration: admin access control via a profiles table.
--
-- Design notes:
-- - One row per authenticated user, created automatically on first
--   sign-in via a trigger (not manually) — see trigger below.
-- - role defaults to 'customer'. Becoming 'admin' is a deliberate,
--   manual action (you updating a row directly in Supabase, or a
--   superadmin doing it later via a dedicated admin-management screen
--   — not built yet, not needed for the current scale).
-- - RLS is intentionally restrictive: a user can read their own
--   profile, but CANNOT update their own role. If users could update
--   their own profiles.role, any logged-in customer could grant
--   themselves admin access by just calling the Supabase client
--   directly — this is the actual privilege-escalation hole this
--   schema exists to prevent.

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_profiles_role on profiles(role);

-- ─── Auto-create a profile row on first sign-in ───────────────────
-- Without this, a user could authenticate via Google but have no
-- profiles row at all, which would make every admin-role check below
-- silently fail closed (good for security) but also break anything
-- that expects every authenticated user to have a profile (bad for
-- normal customer flows). This trigger keeps the two tables in sync
-- automatically, the same "single source of truth, no manual drift"
-- principle used throughout this project's schema design.
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── RLS ──────────────────────────────────────────────────────────
alter table profiles enable row level security;

-- Users can read their own profile (needed so the app can check "am I
-- an admin?" client-side for UI purposes — though the REAL enforcement
-- always happens server-side, see note in implementation plan below).
create policy "Users can view their own profile"
  on profiles for select
  to authenticated
  using (auth.uid() = id);

-- Deliberately NO update/insert policy for the 'authenticated' role.
-- Regular users cannot modify their own profile row at all through
-- the anon/authenticated client — not their role, not anything else.
-- Only supabaseAdmin (service role, bypasses RLS entirely) can change
-- roles. This is the actual security boundary.
create policy "Service role can do anything on profiles"
  on profiles for all
  using (auth.role() = 'service_role');