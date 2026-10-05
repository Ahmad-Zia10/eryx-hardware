# Decision Log

> Add entries when making significant technical decisions.
> Human provides the reasoning, Claude formats. Don't backfill decisions you don't remember.

## Format
Date | Decision | Context | Options | Chosen | Why | Tradeoffs

---

### DEC-001: Use Supabase as Backend
**Date:** June 2026
**Context:** Needed auth, database, storage, and RLS for an e-commerce platform.
**Options:** Supabase, Firebase, custom Node.js + PostgreSQL, PlanetScale
**Chosen:** Supabase
**Why:** Built-in PostgreSQL with RLS. Auth with Google OAuth. Storage for product images. SQL migrations for schema evolution.
**Tradeoffs:** Vendor lock-in. Service role key bypasses RLS (acceptable for server-only).

### DEC-002: Parent-Variant Product Model
**Date:** July 9, 2026
**Context:** Products come in multiple finishes at different prices. One-table model couldn't represent this cleanly.
**Options:** (A) JSON variants column, (B) Separate variants table with FK, (C) EAV model
**Chosen:** (B) — Renamed products → product_variants, new products parent table
**Why:** Relational, queryable, indexable. Rename-based migration preserved all FKs and data.
**Tradeoffs:** Two-table joins. is_default flag needed. Reviews don't aggregate across variants.

### DEC-003: Razorpay for Payments
**Date:** June 2026
**Context:** Need payment gateway with UPI, cards, net banking for Indian market.
**Options:** Razorpay, Paytm, Cashfree, Stripe
**Chosen:** Razorpay
**Why:** Best UPI support, robust webhook system, good Node.js SDK, dominant in Indian e-commerce.
**Tradeoffs:** India-only. Webhook-based means order status is eventually consistent.

### DEC-004: Atomic Order Creation via Postgres RPC
**Date:** July 3, 2026
**Context:** Separate inserts for order + items could leave orphaned/incomplete orders.
**Chosen:** Postgres function `create_order_with_items` — single transaction.
**Why:** Database-level atomicity. All-or-nothing.
**Tradeoffs:** Business logic in SQL (harder to unit test). Signature changes need migration.

### DEC-005: Resend for Email
**Date:** July 2026
**Context:** Need transactional emails for order confirmation and enquiry notifications.
**Chosen:** Resend
**Why:** Simple API, free tier, graceful degradation when API key not set.
**Tradeoffs:** Plain text emails only for now. No HTML template builder.

---

> Add new entries below this line.

### DEC-006: Anonymous email for stock notify-me
**Date:** July 14, 2026
**Context:** Out-of-stock variants need a "Notify me when back in stock" affordance. Whether to gate it behind login was the open question.
**Options:** (A) Require login, (B) Accept anonymous email (auto-fill from `user.email` when logged in)
**Chosen:** (B)
**Why:** Standard e-commerce practice (Zara, H&M, Ikea, Amazon). Captures the widest signal from OOS visitors who would otherwise bounce. `stock_notifications.email NOT NULL` is the anchor; `customer_id nullable` links the row to a user when they happen to be signed in. `UNIQUE(variant_id, email)` makes repeat clicks idempotent.
**Tradeoffs:** Someone could subscribe another person's email. Practical impact is low (worst case: one unwanted notification email) and blocking that would kill the anonymous-conversion win.

### DEC-007: OOS soft visual treatment on ProductCard
**Date:** July 14, 2026
**Context:** OOS variants need to be visible on listings but clearly not purchasable.
**Options:** (A) Soft — small pill overlay, image at full opacity, floating cart button swaps to a bell icon; (B) Heavy — 60% opacity fade + "SOLD OUT" ribbon; (C) Mixed — 70% opacity + grayscale
**Chosen:** (A)
**Why:** Zara/Everlane pattern. Preserves the browsing feel; OOS product stays visually present so shoppers can still click through, learn about it, and subscribe to notify-me. Heavy fades read as final and push OOS products off the mental map even for shoppers who'd wait. Grayscale often looks like a bug, not a design choice.
**Tradeoffs:** Less immediate as a signal. Compensated by the color contrast of the pill and the bell icon replacing the cart affordance.

### DEC-008: Return v1 is a static "call us" page, not a workflow
**Date:** July 15, 2026
**Context:** Full returns lifecycle (returns table, refund via payment gateway, stock restore, admin review) is designed in `returns.md` but not scoped in yet. Customer-facing return handling was blocking the launch checklist.
**Options:** (A) Ship the full workflow, (B) Ship nothing until the workflow lands, (C) Static "here's how to reach us" page with phone + email
**Chosen:** (C)
**Why:** Team's business decision: for v1, returns are handled entirely offline via phone. The stopgap gets customers to the right conversation in one click without over-promising a lifecycle that doesn't exist. Preserves the `refund_return` option in the existing support-request form as a backup path for customers who can't call.
**Tradeoffs:** No structured record of returns yet — no return rate metric, no admin queue. The full design in `returns.md` is unblocked whenever the team is ready to build it; the stopgap doesn't create migration debt because no `returns` table exists.

### DEC-009: PhonePe migration deferred to a fresh Claude Code session
**Date:** July 15, 2026
**Context:** The team wants to migrate the payment gateway from Razorpay to PhonePe. The current session had accumulated significant context from the OOS/notify-me + return-link work.
**Options:** (A) Do PhonePe in the same session, (B) New session with the plan-mode prompt and PhonePe API docs URL
**Chosen:** (B)
**Why:** PhonePe migration touches checkout API, webhook, `create_order_with_items` return handling, `mark_order_paid_and_record_promo`, order columns (`razorpay_order_id` / `razorpay_payment_id`), env vars, and admin surfaces. Fresh context matters for architectural changes of this size. The `.claude/rules/` restructure with `paths:` auto-loading means a new session automatically loads all relevant domain context — no manual context re-pasting needed.
**Tradeoffs:** Slight setup friction (open new session, paste PhonePe docs URL). Massively outweighed by not making architectural decisions with degraded context.

### DEC-010: Design-token foundation + font consolidation (UI overhaul Phase 1)
**Date:** July 20, 2026
**Context:** Site-wide UI overhaul kickoff. Audit found two competing golds (#fec201 kit vs #D4A017 hardcoded), ~424 hardcoded neutral hex values across 65 files, and five Google font families loading on every page.
**Options:** (A) Migrate all components to tokens in one pass, (B) Define tokens + consolidate fonts now, migrate components per-phase as they're touched
**Chosen:** (B)
**Why:** Fonts: 5 families → 2 (Inter + Fraunces). The four serif tokens (--font-display/heading/serif/accent) all remap to Fraunces in globals.css, so ~50 files using those utilities needed zero edits. Gold: --color-brand-gold redefined to #D4A017 (muted) with a gold/gold-bright/gold-deep/on-gold ramp; the kit's bright #fec201 stays reserved for logo artwork. Neutrals: semantic theme-adaptive tokens (surface/ink/line families) flip via .dark using Tailwind v4 `@theme inline`, so migrated components drop their dark: prefixes. Radius system: rounded-control/card/pill. Also added global focus-visible gold ring, gold selection color, prefers-reduced-motion support.
**Tradeoffs:** Until later phases land, old hardcoded hexes coexist with tokens (values match, so no visual drift). Libre Baskerville italics are now synthesized (one prose block on About uses italic — acceptable). New code must use semantic tokens, never hardcoded neutrals.

### DEC-011: Chat assistant v1 is rule-based (no LLM)
**Date:** October 3, 2026
**Context:** Customers ask the same pre/post-sale questions repeatedly (delivery, payment, returns, contact). We wanted an on-site assistant without adding hallucination risk, running cost or new write surface to the live store.
**Options:** (A) LLM with tool calls from day one, (B) RAG over FAQs/blog, (C) Guided menu + keyword/IDF matching over admin-editable FAQs
**Chosen:** (C) — "Ryx", see `.claude/chatbot-v1-spec.md`
**Why:** Every reply is either scripted copy (`src/lib/chat/flows.ts`) or an FAQ an admin wrote, so it cannot invent prices, policies or promises. Read-only: no tables, no write endpoints, no migrations beyond an FAQ copy fix. Zero per-message cost. The launcher/panel shell is reusable — later phases (unanswered-query logging, guest order lookup, LLM + tools, RAG) swap the "brain" in `src/lib/chat/` without touching the UI.
**Tradeoffs:** Only understands phrasings covered by intents, synonyms and FAQ keywords; Hinglish support is a handful of synonyms. Bot answers are only as accurate as the FAQ table — FAQ copy must stay truthful (it now ships verbatim in chat).

### DEC-012: Chat insights store one row per distinct question, flood-guarded in Postgres
**Date:** October 5, 2026
**Context:** Ryx v1.1 logs questions it couldn't answer. First write path from the chat widget; public, anonymous, and on serverless where in-memory rate limits don't hold across instances.
**Options:** (A) One row per message + IP-based limiter in a shared store (Upstash), (B) One row per distinct normalised question with hit_count, hourly new-row ceiling inside the `log_chat_query` RPC, best-effort in-memory per-IP limit on top
**Chosen:** (B)
**Why:** Repeats can't grow the table (spam of the same text = one row); the admin view becomes a ranked list for free; the ceiling is enforced in Postgres so it holds across every instance; no new service or dependency; no IP or user id stored. Query text is PII-scrubbed (`src/lib/chat/scrub.ts`) and rows are pruned by pg_cron after 90 days of silence.
**Tradeoffs:** Grouping is by exact normalised text, so paraphrases appear as separate rows. Per-IP limiting is still best-effort — real shared rate limiting site-wide remains a known gap.
