# Returns & Refunds Pipeline — Implementation Plan

> Status: **Plan for review.** No code written yet. Supersedes the "Full design (not yet built)" section of `.claude/rules/returns.md` with concrete, verified-against-code decisions. Update `returns.md` when this lands.

## Decisions locked (this session)

| Decision | Choice |
|---|---|
| Refund scope | **Full-order only** for v1 (schema keeps `order_item_id` so per-item is a non-breaking add later) |
| Refund trigger | **Admin-triggered.** Admin reviews → approves → marks received (stock restored) → clicks Process Refund (Razorpay API) |
| Stock restore timing | On the **`returned`** transition (admin marks item physically received) |
| Photo uploads | **Included.** Reuse `uploadSharedFile()` + shared `product-images` bucket, `returns/` folder |
| Return window | **7 days** from `orders.delivered_at` (matches the published Return Policy) |
| Refund vs support | **Separate** (Option B from returns.md). Support requests stay conversation-only |
| Order status set | **Left untouched.** Returns live entirely on `returns.status` |

## Core safety principle

The returns lifecycle lives on a **separate `returns` table with its own status column**. `orders.status` and its CHECK constraint are NOT modified. This isolates the entire feature from checkout, the payment webhook, inventory reservation, the pg_cron expiry sweep, and admin order management — none of them read or write `returns`, so none can be affected.

The ONLY change to existing code is stamping `orders.delivered_at` inside `updateOrderStatus` (purely additive — writes a new nullable column, changes no existing logic).

---

## Verified facts (checked against live code)

- `orders.razorpay_payment_id` EXISTS (`20260624110444_add_orders_schema.sql`) — anchor for refunds.
- `orders.delivered_at` does NOT exist — must be added (nullable, additive).
- `orders.status` CHECK = `pending|paid|failed|cancelled|shipped|delivered` — untouched.
- `stock_movements.reason` CHECK already includes `'return'` — no column change needed.
- `release_order_stock` RPC is the pattern to mirror for the restore RPC.
- `updateOrderStatus(id, status)` at `src/app/admin/actions.ts:332` — where `delivered` is set.
- `uploadSharedFile(file, folder)` in `src/lib/server/storage.ts` — reusable upload (bucket `product-images`); return photos use folder `returns/`.
- Admin pattern: server action w/ inline admin auth (or `requireAdminUser()`), server-component page fetching via `supabaseAdmin`, `'use client'` table, link in `AdminNav`.
- Email via `sendStoreNotification` / `sendCustomerConfirmation` — both degrade gracefully if `RESEND_API_KEY` unset.

---

## Phase 1 — Schema foundation (migrations only; zero behavior change)

**Migration A — `returns` table** (per returns.md schema):
- Columns: `id, order_id (FK CASCADE), order_item_id (FK SET NULL, nullable — reserved for per-item later), customer_id (FK CASCADE), reason (CHECK: defective|wrong_item|not_as_described|changed_mind|other), reason_detail, attachment_urls text[], status (CHECK: requested|approved|rejected|pickup_scheduled|returned|refunded, DEFAULT 'requested'), quantity, refund_amount numeric, refund_method (CHECK: original_payment|store_credit), razorpay_refund_id, admin_id (FK SET NULL — audit), admin_note, reviewed_at, refunded_at, created_at, updated_at`.
- `updated_at` touch trigger (mirror the reviews-lifecycle trigger).
- RLS: enable + service-role ALL + user SELECT own (`auth.uid() = customer_id`) + user INSERT own (`authenticated WITH CHECK auth.uid() = customer_id`).
- Index `(status, created_at DESC)`.

**Migration B — `orders.delivered_at timestamptz` (nullable).** Additive. No backfill. Existing `select('*')` queries just gain a null field.

**Migration C — RPC `apply_return_stock_restore(p_return_id uuid)`** mirroring `release_order_stock`:
- Locks the return row `FOR UPDATE`.
- Verifies it's transitioning from an approved/received prior status (guards against double-restore — idempotent like `release_order_stock`).
- Increments `product_variants.stock_quantity` by `quantity`, inserts `stock_movements` (`reason='return'`, `reference_id=return_id`), flips `returns.status='returned'` — one transaction.
- Never writes `stock_quantity` outside the RPC (inventory.md rule).

**After Phase 1: app behaves identically. Pure additive schema.**

## Phase 2 — Stamp `delivered_at`

- In `updateOrderStatus`: when `status === 'delivered'` and `delivered_at` is null, also set `delivered_at = now()`. Only edit to existing code in the feature.

## Phase 3 — Customer request flow

- Replace v1 stopgap `src/app/(marketing)/account/orders/[id]/return/page.tsx` (contact card) with a real form: reason dropdown, description, photo upload (optional, multi).
- Zod schema in `src/lib/validations/return.ts`.
- **`POST /api/returns`**: verify ownership + `order.status='delivered'` + within 7 days of `delivered_at`; upload photos via `uploadSharedFile(file, 'returns')`; insert `returns` row (`status='requested'`); `sendStoreNotification`.
- Account page (`AccountTabs`) shows return status per order for tracking.

## Phase 4 — Admin review + refund

- New page `src/app/admin/returns/page.tsx` + `ReturnsTable.tsx` (`'use client'`); link in `AdminNav`.
- Server actions (with `admin_id` audit):
  - `approveReturn(id, note?)` → `status='approved'`, `reviewed_at`, `admin_id`.
  - `rejectReturn(id, note)` → `status='rejected'`.
  - `markReturnReceived(id)` → calls `apply_return_stock_restore` (stock restored, `status='returned'`).
  - `processReturnRefund(id)` → Razorpay `POST /payments/{razorpay_payment_id}/refund` (server-side, secret never leaves server); store `razorpay_refund_id`, `refund_amount`, `status='refunded'`, `refunded_at`.
- `revalidatePath('/admin/returns')` after each.

## Phase 5 — Refund webhook (idempotent, additive)

- Extend EXISTING `src/app/api/webhooks/razorpay/route.ts` to also branch on `refund.processed` / `refund.created` — **behind the same HMAC/`timingSafeEqual` check** (existing signature verification NOT modified).
- Reconciles the return to `refunded` by `razorpay_refund_id` / `razorpay_payment_id`, idempotently (safe if the admin action already set it). Closes the "dashboard refund doesn't update DB" gap.
- Manual step: add `refund.processed` event to the live Razorpay webhook config.

---

## Safety matrix — existing systems unaffected

| System | Why untouched |
|---|---|
| Checkout / create-order | No column it reads changes; no RPC it calls changes |
| Payment webhook | New event branch behind same HMAC gate; captured/paid paths unchanged |
| Inventory / stock | Restore via new RPC mirroring existing pattern; `reason='return'` already allowed |
| Expiry sweep (pg_cron) | Only touches `pending`; returns act on `delivered` — no overlap |
| `orders.status` machine | Not modified; returns live on `returns.status` |
| Admin order mgmt | `updateOrderStatus` only gains a `delivered_at` stamp |
| Support requests | Kept separate (Option B) |
| RLS | New table gets own policies; no existing policy changes |

## Open items needing user input before/during build

1. **Refund amount source for full-order:** use `orders.total` (post-discount) as `refund_amount`. Confirm this is the intended refundable amount (vs. subtotal).
2. **COD orders:** `refund_method='original_payment'` only works for online orders. COD isn't wired yet, so v1 restricts returns to online-paid orders (`razorpay_payment_id` present). COD returns deferred with COD checkout.
3. **Live Razorpay:** refund testing must be done carefully — a live refund moves real money. Plan to test the refund leg in Razorpay TEST mode first (separate keys), or with a ₹1 live order you then refund.

## Files touched (summary)

**New:** 3 migrations, `src/lib/validations/return.ts`, `POST /api/returns` route, rebuilt `account/orders/[id]/return` form, `admin/returns` page + table, return server actions.
**Modified (minimal):** `updateOrderStatus` (delivered_at), Razorpay webhook (new event branch), `AccountTabs` (status display), `AdminNav` (link), `returns.md` (mark shipped).
