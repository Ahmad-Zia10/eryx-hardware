# Feature: Ryx v1.1 — Unanswered-question insights

**For:** Admin (data comes from customers)
**Why:** Today, when Ryx can't answer, the question is lost. Logging those questions (and product searches that found nothing) tells the team which FAQs to write and which products customers expect. The bot gets smarter with no AI.

**Status:** Built. Defaults chosen: 90-day retention, admin page only (no email digest), in-chat transparency line (no /privacy page yet). Builds on v1 (`.claude/chatbot-v1-spec.md`, DEC-011).

---

## 1. What changes, in one picture

```
 Ryx panel (browser)
   reply = FALLBACK  or  product search found nothing
        │  fire-and-forget: fetch(keepalive), never blocks or alters the reply
        │  client caps: 1 log per message, max 15 per page session
        ▼
 POST /api/chat/unanswered            (NEW — first write path from Ryx)
   1. best-effort per-IP limit (in-memory, same pattern as /api/contact)
   2. Zod: { query ≤300 chars, kind, page_path }
   3. scrub PII server-side (emails, phone numbers, long digit runs, UUIDs)
   4. normalise for grouping (reuse normalise() from src/lib/chat/matcher.ts)
   5. supabaseAdmin.rpc('log_chat_query', …)  → always 204, even on failure
        ▼
 log_chat_query RPC (SECURITY DEFINER)
   • upsert on (normalised_query, kind): hit_count + 1, last_seen_at = now()
   • a resolved query that comes back → status flips to 'new' (the fix didn't work)
   • global ceiling: refuses NEW rows past 300 per hour (flood guard, no IP needed)
        ▼
 chat_queries table ──► /admin/chat-insights  (grouped, sorted by hit_count)
                          actions: Mark resolved · Ignore   (requireAdminUser, reviewed_by)
                          shortcut: "Write an FAQ" → /admin/faqs
 pg_cron: delete rows not seen in 90 days (daily)
```

**Design choice: one row per distinct question, not one row per message.** Repeats only increment `hit_count`. That keeps the table small no matter the traffic, makes the admin view a simple sorted list ("12 people asked about X"), and blunts spam: sending the same junk 1,000 times produces one row.

---

## 2. Requirements

- Log two kinds of misses:
  - `unanswered`: Ryx replied with FALLBACK (no intent, FAQ or product match).
  - `no_product_match`: a product search returned zero results. This is a demand signal for SKUs you don't stock or naming you don't use.
- Never log answered questions, menu/chip taps, pincodes or greetings.
- **No personal data stored:** no IP, no user id, no session id. Query text is scrubbed before insert. `page_path` is stored without the query string.
- Logging must never slow down or change a Ryx reply. If the endpoint fails, the customer sees nothing different.
- Admin page lists queries grouped by normalised text, newest-unresolved first by default, with filters for status and kind.
- Admin can mark a query **resolved** (FAQ written / product added) or **ignored** (junk, off-topic). The admin id and time are recorded.
- A short transparency line in the Ryx panel: *"Questions I can't answer are saved anonymously to help us improve."*

## 3. Acceptance criteria

- [ ] Typing gibberish in Ryx creates one `unanswered` row. Typing it again increments `hit_count` to 2 and creates no new row.
- [ ] "Do you sell door closers" (no such product) creates a `no_product_match` row.
- [ ] Answered questions ("kitne din me delivery") create no row.
- [ ] "call me at 9876543210 or a@b.com" is stored as "call me at [phone] or [email]".
- [ ] More than 15 misses in one page session → client stops sending (checked in the Network tab).
- [ ] Spamming the endpoint directly (curl loop) → per-instance 429 after the limit; the DB never exceeds 300 new rows/hour.
- [ ] Endpoint down or returning 500 → Ryx replies exactly as before, with no console error shown to the user.
- [ ] `/admin/chat-insights` requires admin (middleware **and** `requireAdminUser()` in the server action).
- [ ] Mark resolved → status `resolved`, `reviewed_by`/`reviewed_at` set. The same question asked again → back to `new`.
- [ ] Anon key cannot SELECT from `chat_queries` (test with the anon client).
- [ ] `npm run build` passes.

## 4. Edge cases

- **Very long input:** already capped at 300 chars by Ryx; Zod enforces it again server-side.
- **Same meaning, different text** ("cod?" vs "do u have cod"): grouped only if they normalise identically. Acceptable for v1.1. Smarter grouping (embeddings) belongs to v3.
- **Hinglish / typos:** stored as-is (scrubbed). That's exactly what the team needs to see to add synonyms to `matcher.ts`.
- **Someone pastes an order ID or address:** digit runs and UUIDs are scrubbed. Free-text addresses can slip through, so admin-only access plus 90-day retention limits the exposure.
- **Admin ignores a query and it keeps coming:** it stays `ignored` but `hit_count` keeps rising, so it's still visible if it becomes large.
- **Flood of distinct junk:** the hourly ceiling in the RPC stops new rows. Existing rows still increment. Ceiling hits are logged to console for Vercel logs.
- **Bot crawler traffic:** Ryx only logs after a human types into the panel, so crawlers never trigger it.

## 5. Rate limiting — honest assessment

The existing `/api/contact` limiter is an **in-memory Map per server instance**. On Vercel, each instance has its own memory, so it slows casual abuse but is **not** a real limit. v1.1 copies that pattern as a first layer, but the real protection is in layers that don't depend on it:

| Layer | Protects against | Strength |
|---|---|---|
| Client caps (1/message, 15/session) | Accidental loops, normal heavy users | Bypassable, but covers the 99% case |
| In-memory per-IP limit (20/hour) | Casual scripted spam | Best-effort (per instance) |
| One-row-per-distinct-query upsert | Repeated spam | Strong: repeats can't grow the table |
| RPC hourly ceiling (300 new rows/hour) | Distinct-junk floods | Strong: enforced in Postgres, shared across instances |
| pg_cron 90-day retention | Long-term growth | Strong |

The helper goes in `src/lib/server/rate-limit.ts` so it's reusable. Making rate limiting truly shared across the site (Upstash Redis, a Postgres limiter, or Vercel Firewall rules) is **known gap #7**. It's out of scope here and recorded in memory as a separate project.

## 6. Database changes

**New migration** `YYYYMMDDHHMMSS_chat_queries.sql`:

```sql
CREATE TABLE chat_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('unanswered', 'no_product_match')),
  normalised_query text NOT NULL,        -- grouping key
  sample_query text NOT NULL,            -- latest scrubbed original wording
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
CREATE INDEX idx_chat_queries_status_hits ON chat_queries(status, hit_count DESC);
CREATE INDEX idx_chat_queries_last_seen ON chat_queries(last_seen_at);  -- retention sweep

ALTER TABLE chat_queries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on chat_queries"
  ON chat_queries FOR ALL USING (auth.role() = 'service_role');
-- No anon/authenticated policies at all: inserts go only through the RPC
-- called by the API route with the service role. Nothing is public.
```

- **RPC** `log_chat_query(p_kind text, p_normalised text, p_sample text, p_path text) RETURNS boolean`: SECURITY DEFINER, `SET search_path = public`. Checks the hourly ceiling (`count(*) WHERE first_seen_at > now() - interval '1 hour'`), then `INSERT … ON CONFLICT (normalised_query, kind) DO UPDATE SET hit_count = chat_queries.hit_count + 1, last_seen_at = now(), sample_query = EXCLUDED.sample_query, status = CASE WHEN chat_queries.status = 'resolved' THEN 'new' ELSE chat_queries.status END`. `REVOKE EXECUTE … FROM anon, authenticated`.
- **pg_cron:** a daily job deletes rows where `last_seen_at < now() - interval '90 days'`. Same `CREATE EXTENSION IF NOT EXISTS pg_cron` pattern as `20260713120100_schedule_release_expired_orders.sql`, using `cron.unschedule` before `cron.schedule` so re-runs are idempotent.
- **Modified tables:** none. **Existing RPCs:** untouched.

## 7. Affected routes / files

**New**
- `supabase/migrations/…_chat_queries.sql`: table, RLS, RPC, cron.
- `src/app/api/chat/unanswered/route.ts`: POST; always returns 204 (or 429), never leaks errors.
- `src/lib/validations/chat.ts`: Zod schema.
- `src/lib/server/rate-limit.ts`: the reusable in-memory limiter.
- `src/lib/chat/scrub.ts`: PII scrubbing, a pure function used on the server (and optionally the client).
- `src/app/admin/chat-insights/page.tsx` + `ChatInsightsTable.tsx`.

**Modified**
- `src/components/chat/ChatPanel.tsx`: `logMiss(kind, query)` at the two miss points, plus the session cap and the transparency line.
- `src/app/admin/actions.ts`: `updateChatQueryStatus(id, status)` using `requireAdminUser()`, Zod-validated, records `reviewed_by`/`reviewed_at`, revalidates `/admin/chat-insights`.
- `src/components/layout/AdminNav.tsx`: "Chat Insights" entry.
- `.claude/memory.md`, `.claude/decisions.md`, and a `.claude/rules/` note if a chat rule file is added.

**Not touched:** checkout, payments, auth, inventory, existing enquiry pipelines, the `/api/contact` limiter (refactoring it onto the shared helper is a separate change).

## 8. Rollout

1. Apply the migration (`npx supabase db push`) **before** deploying code. The route fails silently without the RPC anyway, so the order is forgiving.
2. Deploy, then trigger a few misses on the live site and confirm the rows appear in `/admin/chat-insights`.
3. Review weekly: write FAQs for the top `unanswered`, add synonyms to `matcher.ts` for near-misses, and treat top `no_product_match` items as catalogue feedback.

## 9. Open questions

1. **Retention:** is 90 days right, or keep it longer for seasonal trends?
2. **Notifications:** do you want a weekly email digest of the top 10 unanswered questions (via existing Resend), or is the admin page enough for now? *Suggest: page only for v1.1; add the digest once there's data.*
3. **Privacy policy:** there's no `/privacy` page. Is the in-chat transparency line enough for now?
