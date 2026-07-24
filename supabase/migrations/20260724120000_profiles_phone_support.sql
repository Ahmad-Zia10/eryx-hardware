-- Phone-auth support for profiles.
--
-- The original handle_new_user() trigger inserts (id, email, full_name) with
-- email taken straight from auth.users.email. For phone-only signups that
-- column is NULL, and profiles.email is NOT NULL — so the trigger would fail
-- and block the entire signup. This migration:
--   1. adds profiles.phone
--   2. relaxes profiles.email to allow NULL (phone-only users have no email)
--   3. rewrites the trigger to populate email + phone from whichever the user
--      signed up with, tolerating either being NULL.
--
-- Idempotent: ADD COLUMN IF NOT EXISTS, DROP CONSTRAINT via ALTER, CREATE OR
-- REPLACE FUNCTION. Safe to re-apply.

-- 1. Phone column (nullable — email users have no phone and vice versa).
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone text;

-- 2. Email may be null for phone-only accounts.
ALTER TABLE profiles ALTER COLUMN email DROP NOT NULL;

-- 3. Trigger now mirrors both identifiers from auth.users. auth.users.phone is
--    populated by Supabase for phone signups; email for email/OAuth signups.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, phone, full_name)
  VALUES (
    NEW.id,
    NEW.email,                                    -- NULL for phone-only signups
    NEW.phone,                                    -- NULL for email/OAuth signups
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- The trigger itself (on_auth_user_created) is unchanged — it already points
-- at handle_new_user(), which we've just replaced.

NOTIFY pgrst, 'reload schema';
