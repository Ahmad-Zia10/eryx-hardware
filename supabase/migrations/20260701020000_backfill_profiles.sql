-- Backfill missing profiles for users who signed up before the trigger was created
insert into public.profiles (id, email, full_name)
select id, email, raw_user_meta_data->>'full_name'
from auth.users
where id not in (select id from public.profiles);
