-- Vercel Hobby caps cron at once per day, so the reservation-release
-- sweep has to run inside Postgres. pg_cron ships as an extension on
-- Supabase; enable it under the extensions schema (Supabase convention)
-- and schedule the release_expired_orders() RPC to fire every 10 minutes.
--
-- If CREATE EXTENSION fails, enable pg_cron once via the Supabase
-- dashboard (Database → Extensions → pg_cron), then re-run this migration.
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Idempotent re-run: drop the prior schedule if it exists so this
-- migration can be applied more than once during dev without erroring.
DO $$
BEGIN
  PERFORM cron.unschedule('release-expired-orders');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

SELECT cron.schedule(
  'release-expired-orders',
  '*/10 * * * *',
  $$SELECT public.release_expired_orders();$$
);
