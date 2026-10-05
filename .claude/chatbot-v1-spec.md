# Feature: Eryx Assistant — Chatbot v1 (rule-based)

**For:** Customer
**Why:** Answer the repetitive pre-sale and post-sale questions (price, delivery, payment, returns, "how do I reach you") instantly, and route everything else to the right human channel. No AI and no running cost.

**Status:** Built (v1). Bot name: **Ryx**. WhatsApp hand-off skipped for now; hidden on `/checkout` and `/cart`.

---

## 1. What "basic" means here

v1 is a **guided menu plus keyword-matching bot** ("Level 1–3" on the bot spectrum). It does **not** use an LLM, embeddings or RAG.

- It never *generates* text. Every reply is either a scripted line written by us or an FAQ answer an admin wrote in `/admin/faqs`. This means it **cannot make things up**.
- It is **read-only**: no new tables, no new write endpoints, no migrations. All it does is read FAQs and product search results.
- It reuses what already exists: `getVisibleFaqTree()`, `/api/products/search`, `isServiceablePincode()`, `SITE_CONFIG`, `EXPERIENCE_CENTRE`, and `formatProductPrice()` from `pricing.ts`.

Later phases (§10) upgrade the "brain" without touching the UI shell.

---

## 2. Architecture

```
 Browser — marketing routes only (never /admin, hidden on /checkout)
 ┌──────────────────────────────────────────────────────────────────┐
 │ ChatLauncher  ("use client", tiny — mounted in marketing layout) │
 │   │  first click → dynamic import()                              │
 │   ▼                                                              │
 │ ChatPanel  ("use client")                                        │
 │   ├── flows.ts    menu tree + scripted replies (SITE_CONFIG,     │
 │   │               EXPERIENCE_CENTRE — no hardcoded phone/email)  │
 │   ├── matcher.ts  free text → intent or best FAQ (pure function) │
 │   └── isServiceablePincode()   (existing, src/constants)         │
 └──────────┬─────────────────────────────────┬─────────────────────┘
            │ GET /api/faqs  (NEW, read-only)  │ GET /api/products/search?q=
            │ fetched once, on first open      │ (EXISTING — unchanged)
            ▼                                  ▼
     getVisibleFaqTree()                 getAllProducts()
     src/lib/db/faqs.ts (existing)       src/lib/db/products.ts (existing)
            ▼                                  ▼
     faq_categories + faqs              products + product_variants
     (Supabase, read)                   (Supabase, read)
```

**Message pipeline** (all in the browser):

```
user input ──► normalise (lowercase, strip punctuation, synonyms) ──►
   1. button/chip click?           → run that flow
   2. a 6-digit number?            → pincode flow
   3. intent keyword hit?          → that flow  (e.g. "track", "COD", "bulk")
   4. FAQ score ≥ threshold?       → FAQ answer + 2 "related" chips
   5. otherwise                    → fallback: "I'm a simple assistant…" + menu + Talk to a human
```

**Conversation state** is held in React state only. The marketing layout stays mounted across client-side navigation in the App Router, so a conversation survives page changes without localStorage. Nothing is persisted, and no personal data is stored.

---

## 3. What v1 covers

| # | Menu item | Behaviour | Data source |
|---|---|---|---|
| 1 | **Find a product** | Asks for a name or code, then shows up to 4 results (image, name, price via `formatProductPrice`, "View" → PDP). No results → links to `/kitchen` and `/wardrobe`, plus a bulk-enquiry nudge. | `/api/products/search` (existing) |
| 2 | **Delivery to my pincode** | Validates 6 digits. Serviceable → "Yes, we deliver there, usually 5–7 business days". Not serviceable → "Not in our standard zone yet. Contact us, our team may still arrange it" + contact link. | `isServiceablePincode()` |
| 3 | **Track my order** | Signed in → link to `/account` orders. Signed out → "Sign in to see your orders" + login link. The bot itself never reads order data. | Auth state only |
| 4 | **Payments** | Accepted methods (Razorpay). **COD is not available yet** (stated plainly). For a failed or deducted payment → reassurance + Talk to a human. | Scripted + FAQ |
| 5 | **Returns & warranty** | Policy text from the FAQ, then: delivered orders → `/account` return page; anything else → human. States clearly that it can't start a return itself. | FAQ + scripted |
| 6 | **Bulk / dealer / showroom** | Links to `/bulk-enquiry`, `/dealer-enquiry` and `/experience-centre` (address and hours from `EXPERIENCE_CENTRE`). | Constants |
| 7 | **Talk to a human** | Phone (`tel:`), email (`mailto:`), `/contact`, business hours. Shown in every fallback. | `SITE_CONFIG`, `EXPERIENCE_CENTRE` |
| — | **Free-text FAQ** | Any typed question is matched against all visible FAQs, and the best answer is shown. | `/api/faqs` |
| — | **Greetings / thanks / bye** | Short scripted replies followed by the menu. | Scripted |

## 4. What v1 does NOT cover (by design)

| Out of scope | Why | Where it goes instead |
|---|---|---|
| Guest order lookup (order no. + email) | Needs an ownership check, rate limiting and anti-enumeration work. That's real security surface. | v1.2. For now: sign in → `/account`. |
| Live stock numbers in chat | PDP already shows stock; keeps v1 read-only on one endpoint. | Results link to PDP |
| Starting a return / refund / cancellation | Returns workflow isn't built (`returns.md`); the bot must not promise a process that doesn't exist. | Human / `/account` return page |
| Creating enquiries from inside chat | That would be a new write path; the existing forms already have validation and email. | Link to the form |
| Installation / compatibility Q&A beyond the FAQs | Needs product-spec reasoning, i.e. LLM territory. | Human |
| Promo-code listing | Already shown at checkout (`/api/promo-codes/available`). | Checkout |
| Hindi / Hinglish understanding | Only a handful of synonym keywords in v1 (see §5). | v2 (LLM) |
| Chat history, transcripts, analytics | Needs a table, RLS, retention policy | v1.1 |
| Live agent hand-off / WhatsApp | No WhatsApp number in `SITE_CONFIG` yet | Open question (§9) |

---

## 5. Matching logic (`src/lib/chat/matcher.ts`)

A pure function with no React and no I/O, so it's trivially testable later:
`match(input, faqs) → { type: "intent", intent } | { type: "faq", faq, related } | { type: "none" }`

1. **Normalise:** lowercase, strip punctuation, collapse whitespace.
2. **Synonyms → canonical token** (small hand-written map), for example:
   `guarantee→warranty`, `cod / cash on delivery→cod`, `ship / shipping / courier→delivery`,
   `money back / refund→refund`, `kitne din→delivery`, `paisa wapas→refund`, `kahan hai→track`.
3. **Intent keywords first:** `track|status|where is my order` → track; `pincode|deliver to` → pincode; `cod` → payments; `bulk|wholesale|dealer|distributor` → bulk/dealer; `human|agent|call|talk` → human.
4. **FAQ scoring** (a mini BM25 idea, sized for ~11–50 FAQs):
   - Tokenise the question, answer and category name of each FAQ, and remove stopwords.
   - Score = Σ over query tokens of `idf(token) × weight`, where a match in the **question** weighs 2 and a match in the **answer** weighs 1.
   - `idf = log(1 + N / df)`, so rare words ("warranty", "invoice") count more than common ones ("order").
   - Return the top FAQ if score ≥ threshold (tune by hand against a test list), plus the next 2 as "related" chips.
5. Below threshold → `none` → fallback.

The index is built once in memory when the FAQs load. At this size, a real inverted index or search engine would be over-engineering.

---

## 6. Files

**New**
- `src/app/api/faqs/route.ts`: `GET`, calls `getVisibleFaqTree()`, returns `{ categories }`. Read-only, cached for a few minutes. Confirm the Next 16 route-handler caching API in `node_modules/next/dist/docs/` before writing it (AGENTS.md).
- `src/components/chat/ChatLauncher.tsx`: floating button. Dynamically imports the panel on first click.
- `src/components/chat/ChatPanel.tsx`: message list, chips, input, flows.
- `src/lib/chat/flows.ts`: menu tree and all scripted copy, in one file so copy is easy to review.
- `src/lib/chat/matcher.ts`: §5.

**Modified**
- `src/app/(marketing)/layout.tsx`: one line, `<ChatLauncher />`, behind the flag.
- `.claude/memory.md`, `.claude/decisions.md` (DEC-011: rule-based bot first, LLM later).

**Not touched:** any existing API route, RPC, table, migration, checkout, auth or payment code.

---

## 7. Acceptance criteria

- [ ] Launcher shows on marketing pages, **not** on `/admin/*`, and is hidden on `/checkout` (it must not cover the Pay button).
- [ ] The panel JS loads only after the first click (check the Network tab), so there's no impact on first page load.
- [ ] Each of the 7 menu flows works end to end on desktop and at 375px mobile.
- [ ] "do you give guarantee" → warranty FAQ. "kitne din me delivery" → delivery FAQ. "asdfgh" → fallback with human contact.
- [ ] Pincode `560034` → serviceable. `799001` → not serviceable + contact. `12345` → "please enter 6 digits".
- [ ] Product search shows prices via `formatProductPrice` (null → "Price on request").
- [ ] Editing an FAQ in `/admin/faqs` shows up in the bot within the cache window.
- [ ] Keyboard: Tab reaches the launcher, Enter opens, focus moves into the panel, Esc closes and returns focus. New messages are announced (`aria-live="polite"`).
- [ ] Light and dark mode both correct (semantic tokens only, no hex values, inside the `.modernist` scope).
- [ ] No collision with the Toast, CartDrawer or mobile UI (z-index and position checked).
- [ ] FAQ API down → the bot still opens, the menu flows still work, and free-text falls back to "Talk to a human".
- [ ] `npm run build` passes with zero TS errors.

## 8. Edge cases

- Empty or whitespace input → ignored. Input over 300 characters → truncated before matching.
- The user types an order ID → the track flow, never a lookup.
- The user types a phone number or email → not stored and not sent anywhere. Reply with the human-contact options.
- Rapid repeat searches → product search only runs on submit (no keystroke search), so the existing unrate-limited route gets no extra load.
- The FAQ list is empty (an admin hid everything) → free text falls back. The menu still works.
- Product search returns an inactive/OOS item → not possible; `getAllProducts()` already filters. Results link to the PDP, which is the source of truth.

## 9. Open questions (need a business answer before build)

1. **The FAQ content contradicts the code.** The bot will repeat these answers, so fix them in `/admin/faqs` first:
   - "We deliver **pan India**", but `SERVICEABLE_PINCODES` covers only 6 metro prefixes.
   - "you will receive a **tracking link** via email", but no shipping integration exists yet.
   - "a **GST invoice is generated** for every order", but GST invoicing isn't implemented.
   - "**EMI** options": check whether EMI is actually enabled on the Razorpay account.
2. Is there a **WhatsApp Business** number? It's the hand-off most Indian buyers expect.
3. Bot name and tone: "Eryx Assistant"? Formal or friendly?
4. Should it also be hidden on `/cart`?

## 10. Roadmap after v1

| Phase | Adds | New surface |
|---|---|---|
| **v1.1** | Log unanswered questions (text only, no PII) so we learn what to add to the FAQs | 1 table (insert-only RLS), 1 POST route + rate limiting |
| **v1.2** | Guest order-status lookup (order no. + email must match) | Rate-limited read route |
| **v2** | LLM with tool calls (`search_products`, `check_pincode`, `get_my_orders`) and FAQs in the prompt; Hinglish | API key, cost cap, streaming route |
| **v3** | RAG over blog / installation guides with `pgvector` + Postgres full-text (hybrid) | Embeddings table + sync job |

The UI shell (launcher + panel) is built once in v1. Each later phase only swaps the "brain" behind it.
