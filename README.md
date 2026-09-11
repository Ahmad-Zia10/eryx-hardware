# Eryx Hardware

Production B2C e-commerce platform selling premium kitchen and wardrobe hardware in India.
A division of **Modular India**.

> **This is a real business handling real money.** Every change must be production-safe.
> Checkout, pricing, and stock integrity are the three things that must never break.

- **Live:** [eryxhardware.com](https://eryxhardware.com)
- **Catalog scale:** ~100–200 SKUs across 8 core categories
- **Currency:** INR only, Pan-India delivery

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
  - [Two-tier catalog](#two-tier-catalog-products--variants)
  - [Pricing](#pricing-single-source-of-truth)
  - [Checkout & payments](#checkout--payments)
  - [Inventory](#inventory)
  - [Auth & access control](#auth--access-control)
  - [Enquiry pipelines](#enquiry-pipelines)
- [Database](#database)
- [Admin Dashboard](#admin-dashboard)
- [Deployment](#deployment)
- [Contributing Rules](#contributing-rules)
- [Known Gaps](#known-gaps)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript (strict) |
| Database | Supabase PostgreSQL + Row Level Security |
| Auth | Supabase Auth — email/password + Google OAuth |
| Storage | Supabase Storage (product imagery, blog media) |
| Payments | Razorpay (INR, webhook-confirmed) |
| Email | Resend (transactional) |
| Styling | Tailwind CSS v4 + PostCSS |
| Rich text | Tiptap 3 (blog + About CMS) |
| Validation | Zod v4 |
| Scheduling | Supabase `pg_cron` |
| Hosting | Railway (Nixpacks) |

> **Note on Next.js 16:** this version has breaking changes from earlier releases. Root
> middleware is now **`src/proxy.ts`**, not `middleware.ts`. Consult
> `node_modules/next/dist/docs/` before writing framework-level code rather than relying
> on familiarity with Next.js 13–15 conventions.

Node `>=20.9.0` is required.

---

## Getting Started

```bash
npm install
```

Create `.env.local` from the template and fill in real values:

```bash
cp .env.example .env.local
```

Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other commands

```bash
npm run build
```

```bash
npm run start
```

```bash
npm run lint
```

### Utility scripts

Run with `tsx`. All three read `.env.local` and use the service-role key.

| Script | Purpose |
|---|---|
| `scripts/seed.ts` | Seeds sample products/variants into a fresh database |
| `scripts/seed-catalogue.ts` | Seeds the fuller catalogue dataset |
| `scripts/test-rls.ts` | Sanity-checks RLS by comparing anon-client vs admin-client reads |

```bash
npx tsx scripts/test-rls.ts
```

> These write with the service-role key and **bypass RLS**. Never point them at production.

---

## Environment Variables

All variables are documented inline in [`.env.example`](.env.example). Summary:

### Supabase
| Variable | Exposure | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Project → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | RLS-constrained client key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server-only** | Bypasses RLS entirely |

### Razorpay
| Variable | Exposure | Notes |
|---|---|---|
| `RAZORPAY_KEY_ID` | Server-only | Order creation |
| `RAZORPAY_KEY_SECRET` | **Server-only** | Order creation |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Public | Browser checkout widget |
| `RAZORPAY_WEBHOOK_SECRET` | **Server-only** | HMAC verification for `/api/webhooks/razorpay` |

### Resend
`RESEND_API_KEY`, `SUPPORT_EMAIL`, `NOTIFICATION_FROM_EMAIL`

### Cron
`CRON_SECRET` — bearer token for the manual/debug sweep at
`/api/cron/release-expired-orders`. The primary sweep runs in Supabase `pg_cron`, so this
is only needed for hand-triggered runs.

### Optional
`NEXT_PUBLIC_SITE_URL` — not currently read anywhere in `src/` (auth redirects derive from
the request origin), but set it to the production origin for future absolute-URL needs.

> **Never** expose `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`,
> `RAZORPAY_WEBHOOK_SECRET`, or `CRON_SECRET` to client code, and never import
> `supabaseAdmin` into a `"use client"` file.

---

## Project Structure

```
src/
  app/
    (marketing)/      Public pages — home, kitchen, wardrobe, hardware, products,
                      cart, checkout, account, wishlist, deals, blog, about,
                      contact, faqs, enquiry forms, policy pages, auth flows
    admin/            Admin dashboard + actions.ts (all admin server actions)
    api/              Route handlers — checkout, webhooks, cron, search, reviews,
                      enquiries, promo codes, wishlist, admin CRUD/uploads
  components/         layout/, sections/, ui/, admin/
  context/            CartContext, WishlistContext, ThemeContext, UIContext
  lib/
    db/               Data access — products, categories, blog, faqs
    server/           Server-only — admin auth, Resend notifications,
                      blog content, storage
    supabase/         Client factories — client.ts, server.ts, middleware.ts
    validations/      Zod schemas
    pricing.ts        getEffectivePrice(), formatPrice() — SINGLE pricing source
  constants/          Site config, nav links, serviceable pincodes,
                      LOW_STOCK_THRESHOLD
  types/              TypeScript interfaces
  proxy.ts            Root middleware (Next.js 16 naming)
supabase/migrations/  Sequential SQL migrations
scripts/              Seeding + RLS test utilities
.claude/              AI workflow — rules/, playbooks/, templates/, memory.md
```

---

## Architecture

### Two-tier catalog (products → variants)

Products are **parents**; `product_variants` carry the purchasable units (finish, size,
SKU, price, stock). Every parent must have exactly one default variant — enforced by the
`check_product_default_variant_invariant()` RPC, and violations are surfaced as a banner on
the admin dashboard with deep links to fix each one.

Consequences worth internalising:

- **Cart and checkout pricing always read `product_variants`, never `products`.**
- Product slugs are derived from `item_code` at runtime (lowercase + hyphenate). They are
  not stored in the database.
- Variant options live in `product_variant_options` / `product_variant_option_values`.
- Products carry a `product_line` (`kitchen` / `wardrobe`) used to route SKUs to the right
  listing pages and to group the nav mega-menu.

### Pricing (single source of truth)

All price display and calculation goes through `getEffectivePrice()` and `formatPrice()` in
[`src/lib/pricing.ts`](src/lib/pricing.ts). No exceptions.

- Display format: `₹X,XX,XXX` via `toLocaleString("en-IN")`.
- A null price renders **"Price on request"** and is **not purchasable**.
- Client-submitted prices are never trusted — everything is re-derived server-side at
  checkout.

### Checkout & payments

`POST /api/checkout/create-order` runs this sequence:

1. Authenticate the user (401 otherwise).
2. Re-validate the cart server-side — variant existence, active status, live pricing, live
   stock. Client-supplied prices and quantities are discarded.
3. Call the atomic RPC **`create_order_with_items`**, which inserts the order and its items
   *and* reserves stock in one transaction. **This is the only path that may insert into
   `orders` / `order_items`** — never insert into those tables separately.
4. Create the Razorpay order.
5. Backfill `razorpay_order_id` onto the order row.

If step 4 or 5 fails, `release_order_stock` is called immediately so reserved inventory is
never stranded by a failed payment-gateway handoff.

Payment is confirmed **only by webhook**, never by the browser. `POST /api/webhooks/razorpay`:

- Verifies the HMAC signature with `crypto.timingSafeEqual` after a length check.
  **Do not modify this verification.** A plain `!==` comparison is timing-attack-prone and
  was deliberately replaced.
- Handles `payment.captured` and `order.paid`.
- Calls `mark_order_paid_and_record_promo`, which flips order status and records promo
  usage atomically.

Unpaid orders expire after 48 hours; `release_expired_orders()` runs on `pg_cron` and
returns their reserved stock.

### Inventory

Stock lives on `product_variants.stock_quantity`. **Application code never writes to it
directly.** Every mutation goes through one of three RPCs:

| RPC | Used by |
|---|---|
| `create_order_with_items` | Checkout — reserves stock |
| `release_order_stock` | Failed checkout, cancellation, expiry sweep |
| `adjust_stock` | Admin manual adjustment |

All movements are journaled to `stock_movements`, which records `admin_id` — this table is
the current template for what an audit record should look like in this codebase.

Out-of-stock variants surface a "notify me" form backed by `stock_notifications`.
`LOW_STOCK_THRESHOLD` in `src/constants/` drives low-stock badging.

### Auth & access control

Supabase Auth with email/password and Google OAuth. Session refresh and route gating run in
`src/proxy.ts` → `updateSession()` in
[`src/lib/supabase/middleware.ts`](src/lib/supabase/middleware.ts):

- `/checkout` and `/account` require a signed-in user.
- `/admin/**` requires a signed-in user whose `profiles.role` is `admin`.
- Signed-in users hitting `/login` are redirected home.

There are three Supabase client factories, and picking the right one matters:

| File | Client | Use for |
|---|---|---|
| `lib/supabase/client.ts` | Browser, anon key | Client components |
| `lib/supabase/server.ts` | Server, cookie-bound anon key + `supabaseAdmin` | Server components, route handlers |
| `lib/supabase/middleware.ts` | Session refresh | Proxy/middleware only |

RLS is enabled on every table. **Middleware gating is not a substitute for the in-action
check** — every admin server action independently calls its own admin verification, even
where middleware already covers the route.

### Enquiry pipelines

Five distinct channels, each with its own table, validation schema, and admin surface:

| Channel | Endpoint | Table | Admin page |
|---|---|---|---|
| Product enquiry (legacy) | `/api/enquiry` | `enquiries` | `/admin/enquiries` |
| Contact form | `/api/contact` | `contact_submissions` | `/admin/contact` |
| Bulk enquiry | `/api/bulk-enquiries` | `bulk_enquiries` + `bulk_enquiry_items` | `/admin/bulk-enquiries` |
| Dealer enquiry | `/api/dealer-enquiries` | `dealer_enquiries` | `/admin/dealer-enquiries` |
| Support request | `/api/support-requests` | `support_requests` | `/admin/support` |

Dealer and bulk are deliberately separate channels — dealers resell Eryx, bulk buyers are
contractors sourcing for jobs. All public form input is Zod-validated before it reaches the
database.

---

## Database

Migrations are sequential SQL files in `supabase/migrations/`, named
`YYYYMMDDHHMMSS_description.sql`. **All schema changes are new migrations** — never edit a
migration that has already been applied.

To change an existing RPC, write a new migration containing the full
`CREATE OR REPLACE FUNCTION` body. Postgres has no partial-function patching.

### Core tables

**Catalog** — `products`, `product_variants`, `product_variant_options`,
`product_variant_option_values`, `product_images`

**Commerce** — `orders`, `order_items`, `promo_codes`, `promo_usages`, `returns`,
`wishlist_items`

**Inventory** — `stock_movements`, `stock_notifications`

**Content** — `blog_posts`, `about_page_sections`, `faq_categories`, `faqs`,
`product_reviews`

**Enquiries** — `enquiries`, `contact_submissions`, `bulk_enquiries`,
`bulk_enquiry_items`, `dealer_enquiries`, `support_requests`

**Identity** — `profiles` (carries the `role` column)

### Key RPCs

| Function | Purpose |
|---|---|
| `create_order_with_items` | Atomic order insert + stock reservation |
| `mark_order_paid_and_record_promo` | Webhook payment confirmation + promo usage |
| `release_order_stock` | Return reserved stock to a variant |
| `release_expired_orders` | `pg_cron` sweep of unpaid orders past 48h |
| `adjust_stock` | Admin manual stock adjustment with journaling |
| `apply_return_stock_restore` | Restore stock on an accepted return |
| `check_product_default_variant_invariant` | Detect parents missing a default variant |
| `set_primary_product_image` | Promote an image to primary |
| `delete_product_image_and_reassign` | Delete an image, reassign primary if needed |

### RLS conventions

Every new table must enable RLS and carry **both** a service-role policy and the narrowest
public/authenticated policy that fits the access pattern.

All timestamps are `timestamptz` (UTC).

---

## Admin Dashboard

`/admin`, gated by `profiles.role = 'admin'`. Multiple admins operate it concurrently, so
activity should be traceable.

| Surface | Route |
|---|---|
| Dashboard + invariant alerts | `/admin` |
| Products & variants | `/admin/products` |
| Orders | `/admin/orders` |
| Promo codes | `/admin/promo-codes` |
| Reviews (approval queue) | `/admin/reviews` |
| Blog (Tiptap) | `/admin/blog` |
| About page CMS | `/admin/about` |
| FAQs | `/admin/faqs` |
| Back-in-stock signups | `/admin/notify-me` |
| Enquiry inboxes | `/admin/{enquiries,contact,bulk-enquiries,dealer-enquiries,support}` |

**Mutation convention:** admin mutations are **server actions** in
[`src/app/admin/actions.ts`](src/app/admin/actions.ts). Reach for an API route only when
you genuinely need request/response control — webhooks, checkout, file uploads, cron.

Every mutation that affects a public page must call `revalidatePath()`.

---

## Deployment

Production runs on [Railway](https://railway.app). Build and start commands and the
healthcheck path are pinned in [`railway.json`](railway.json); `npm run start` binds to
Railway's injected `$PORT`.

### One-time setup

1. **Create the service** — New Project → Deploy from GitHub repo → select this repo.
   Railway auto-detects Next.js (Nixpacks) and reads `railway.json`.
2. **Environment variables** — in the service's **Variables** tab, add every variable from
   `.env.example` with real values.
3. **Deploy** — note the generated `*.up.railway.app` URL.
4. **Custom domain** — Settings → Networking → Custom Domain → add `eryxhardware.com`,
   then create the CNAME it shows at your DNS provider.

### External services to repoint after a domain change

These live outside this repo and must be updated by hand:

- **Supabase** → Authentication → URL Configuration: set **Site URL** to
  `https://eryxhardware.com`; add redirect URLs `https://eryxhardware.com/auth/callback`
  and `https://eryxhardware.com/reset-password`.
- **Google Cloud Console** (OAuth client): add `https://eryxhardware.com/auth/callback` to
  Authorized redirect URIs.
- **Razorpay** dashboard: point the webhook at
  `https://eryxhardware.com/api/webhooks/razorpay` (same `RAZORPAY_WEBHOOK_SECRET`).

The order-release sweep runs in Supabase `pg_cron`, so no scheduler needs configuring on
Railway.

---

## Contributing Rules

Detailed domain rules live in `.claude/rules/` and cover orders and payments, inventory,
admin operations, auth and RLS, migrations, catalog and variants, enquiry pipelines, and
returns. **When a rule describes how a shipped feature works, trust the rule** — the rules
are audited against current code.

### Never

- Trust client pricing or client stock quantities — re-derive server-side at checkout.
- Expose server-only secrets to client code, or import `supabaseAdmin` in a `"use client"` file.
- Insert `orders` and `order_items` outside `create_order_with_items`.
- Write directly to `product_variants.stock_quantity` from application code.
- Modify the Razorpay webhook HMAC verification — `crypto.timingSafeEqual` stays.
- Use the `products` table for cart or checkout pricing.
- Hard-delete a variant that has order items or reviews — soft-delete via `is_active = false`.
- Skip the admin auth check in a server action, even when middleware seems to cover it.

### Always

- Use `getEffectivePrice()` for all price display and calculation.
- Validate public form input with Zod before touching the database.
- Call `revalidatePath()` after mutations affecting public pages.
- Ship schema changes as new sequential migrations.
- Enable RLS on new tables, with a service-role policy and a narrow public policy.
- Reserve `"use client"` for components that genuinely need browser APIs, event handlers,
  or React state.

### Commits

One commit per complete, working change — a feature, a fix, a migration, a refactor. A
change spanning a migration, an API route, and UI is still **one** commit if it is one
feature. Never bundle unrelated work, and never split a feature into partial commits that
leave the app broken in between.

Commit only after the change is verified and `npm run build` passes. Stage deliberately
with `git add <specific files>` — never `git add .`. **Never `git push`;** pushing is the
human's call.

Conventional Commits format — `type(scope): summary`, under ~70 characters:

```
feat(checkout): show eligible promo codes with tap-to-apply
fix(inventory): release stock immediately when Razorpay order creation fails
refactor(admin): extract requireAdminUser wrapper
```

Types: `feat`, `fix`, `refactor`, `migration`, `chore`, `style`.

---

## Known Gaps

Not built — do not present any of these as live:

1. **Return / refund lifecycle.** A v1 stopgap ships: delivered orders link to
   `/account/orders/[id]/return`, which shows call-us instructions. No `returns` row is
   created, no email sent, no refund initiated. The `returns` table and
   `apply_return_stock_restore` exist as foundation; the full pipeline is designed in
   `.claude/rules/returns.md` but unbuilt.
2. **COD checkout path.** Schema is ready (`orders.payment_method`, 48-hour expiry sweep);
   the checkout API always sends `'online'` and the UI is unwired.
3. **Shipping / logistics integration.** Likely Shiprocket — AWB, tracking URL, status
   callbacks. Nothing built.
4. **GST invoicing.** GSTIN, HSN codes, tax breakdowns. Schema should accommodate it when
   requested; not implemented.
5. **Back-in-stock send-out worker.** Signups collect in `stock_notifications`; the worker
   that flips `pending → notified` and emails on a 0 → positive stock transition is
   deferred pending batching/cooldown design.
6. **Order status transition validation.** `updateOrderStatus` accepts any status → any
   status.
7. **Admin activity log.** No audit trail beyond `stock_movements.admin_id`.
8. **API rate limiting** on public endpoints.
9. **Test coverage** and **error boundary components**.
10. **SEO structured data** on product detail pages.

### Known tech debt

- Admin auth check inlined ~15 times in `actions.ts`; `requireAdminUser()` exists in
  `src/lib/server/admin.ts` and newer actions use it, but migration of the old ones isn't
  scheduled.
- `src/lib/catalogue-data.ts` still coexists with the database as a dual source of truth
  (legacy).
- `CartContext` is localStorage-only — no server cart, no abandoned-cart recovery.
- Reviews are keyed to `variant_id`, so they don't aggregate across finishes or sizes.
- `promo_codes` RLS `SELECT` is `USING (true)` — the checkout list is gated at the API
  route, but the RLS itself doesn't enforce.
