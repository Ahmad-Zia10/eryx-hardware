-- Ryx v1.1: log the questions the chat assistant could NOT answer, so
-- the team learns which FAQs to write and which products customers
-- expect. See .claude/chatbot-v1.1-spec.md.
--
-- One row per distinct (normalised_query, kind) with a hit counter —
-- not one row per message. Repeats only bump hit_count, which keeps the
-- table small under any traffic and makes repeat-spam produce one row.
--
-- No personal data: no IP, no user id, no session. Query text is
-- scrubbed of emails / phone numbers / long digit runs / UUIDs by the
-- API route before it reaches this table.

CREATE TABLE chat_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('unanswered', 'no_product_match')),
  normalised_query text NOT NULL,   -- grouping key
  sample_query text NOT NULL,       -- latest scrubbed original wording
  last_page_path text,
  hit_count integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'resolved', 'ignored')),
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (normalised_query, kind)
);

-- Admin view: "new questions, most-asked first".
CREATE INDEX idx_chat_queries_status_hits ON chat_queries(status, hit_count DESC);
-- Hourly flood ceiling in the RPC + the retention sweep.
CREATE INDEX idx_chat_queries_first_seen ON chat_queries(first_seen_at);
CREATE INDEX idx_chat_queries_last_seen ON chat_queries(last_seen_at);

ALTER TABLE chat_queries ENABLE ROW LEVEL SECURITY;

-- Service role only. Deliberately NO anon/authenticated policies: the
-- public never reads this table, and writes go exclusively through
-- log_chat_query() called by /api/chat/unanswered with the service role.
CREATE POLICY "Service role full access on chat_queries"
  ON chat_queries FOR ALL USING (auth.role() = 'service_role');

-- ─── Logging RPC ──────────────────────────────────────────────────
-- Upserts a miss. Returns false (and writes nothing) when the hourly
-- ceiling of NEW distinct questions is reached — a flood guard enforced
-- in Postgres, so it holds across every serverless instance. Existing
-- questions still increment past the ceiling.
--
-- A question an admin marked 'resolved' that keeps arriving flips back
-- to 'new': the FAQ written for it isn't working. 'ignored' stays
-- ignored (hit_count still climbs, so a big one stays visible).
CREATE OR REPLACE FUNCTION log_chat_query(
  p_kind text,
  p_normalised text,
  p_sample text,
  p_path text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_exists boolean;
  v_new_last_hour integer;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM chat_queries
    WHERE normalised_query = p_normalised AND kind = p_kind
  ) INTO v_exists;

  IF NOT v_exists THEN
    SELECT count(*) INTO v_new_last_hour
    FROM chat_queries
    WHERE first_seen_at > now() - interval '1 hour';

    IF v_new_last_hour >= 300 THEN
      RETURN false;
    END IF;
  END IF;

  INSERT INTO chat_queries (kind, normalised_query, sample_query, last_page_path)
  VALUES (p_kind, p_normalised, p_sample, p_path)
  ON CONFLICT (normalised_query, kind) DO UPDATE SET
    hit_count = chat_queries.hit_count + 1,
    sample_query = EXCLUDED.sample_query,
    last_page_path = EXCLUDED.last_page_path,
    last_seen_at = now(),
    updated_at = now(),
    status = CASE WHEN chat_queries.status = 'resolved' THEN 'new' ELSE chat_queries.status END;

  RETURN true;
END;
$$;

-- Only the service role (the API route) may call it.
REVOKE EXECUTE ON FUNCTION log_chat_query(text, text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION log_chat_query(text, text, text, text) TO service_role;

-- ─── Retention ────────────────────────────────────────────────────
-- Questions nobody has asked for 90 days are dropped daily. Same pg_cron
-- pattern as 20260713120100_schedule_release_expired_orders.sql.
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

DO $$
BEGIN
  PERFORM cron.unschedule('prune-chat-queries');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

SELECT cron.schedule(
  'prune-chat-queries',
  '30 3 * * *',
  $$DELETE FROM public.chat_queries WHERE last_seen_at < now() - interval '90 days';$$
);
