# Memory — Eryx Hardware

> Claude updates this file after completing work. Human reviews and corrects.

## Current Priorities

1. **Vercel → Hostinger/Railway hosting migration.** Discussed at length last session. Recommendation stands: **Railway** for the Node app (Hostinger VPS + Coolify is the alternative if there's Linux muscle around). Requires DNS cutover, updating Razorpay webhook URL, Google OAuth callback in Supabase + Google Cloud console, Resend from-domain if using a custom domain. Do this in its own session with the prompt template already saved from the analysis discussion.
2. **Payment gateway migration: Razorpay → PhonePe.** Same as before — planned as a fresh-session job. Full audit brief already written out. Touches checkout API, webhook, `create_order_with_items` return handling, `mark_order_paid_and_record_promo`, order columns, env vars, admin surfaces. Bring PhonePe API docs URL to that session.
3. **Real content pending on Contact hub.** Placeholder Unsplash URLs on the 4 action cards (grep `TODO(contact-info)` in `src/app/(marketing)/contact/page.tsx`). Head Office address is still bracketed placeholder text; the Google Maps embed IS wired to the real location, only the text lines are stale.
4. **Full return / refund lifecycle.** V1 stopgap page shipped (`/account/orders/[id]/return` shows call-us instructions). Full pipeline (returns table, refund via payment gateway, stock restore via `release_order_stock`, admin review workflow) still designed in `.claude/rules/returns.md` — not built.
5. **"Back in stock" send-out worker** for `stock_notifications`. Signups collect; worker that flips `pending → notified` and emails subscribers when `variant.stock_quantity` transitions 0 → positive is deferred. Needs batching + cooldown design once we see signup volume.
6. **COD checkout path.** Schema ready (`orders.payment_method`, 48-hour expiry sweep). Checkout API only sends `p_payment_method: 'online'`; UI not wired. Coordinate with PhonePe migration (item 2) — deciding gateway before wiring COD flow avoids double-work.
7. **Order status state machine enforcement.** `updateOrderStatus` accepts any status; needs transition validation.
8. **Admin activity log table.** Multiple admins, no audit trail beyond `stock_movements.admin_id`.
9. **Cleanup of the per-product enquiry path.** OOS/notify-me + Bulk-Enquiry rework replaced "Enquire Now". `openEnquiryModal` / `/api/enquiry` / `enquiries` table / `EnquiryModal` / `/admin/enquiries` still in place — one-release grace period, then delete if no other surface calls in.

## In Progress

- Nothing actively in flight. Last session ended with the nav mega-menu + admin banner deep-link ship (commit `26d2715`).

## Recently Completed

### Latest session

- **Nav mega-menu + admin banner deep-link** — Products dropdown replaced with full-width 3-column mega-menu (Kitchen / Wardrobe / Explore). Data-driven grouping via `getCategoriesByProductLine()` in `src/lib/db/categories.ts` — categories appear under the right line based on their products' `product_line`, no schema change. Empty column state ("Range coming soon → contact us") keeps shape stable when a line has no inventory. 150ms open + 250ms close hover delays with panel-hover forwarding so cursor traversal doesn't flash-close. Marketing layout became async to fetch `categoryGroups` server-side and pass as prop, keeping Navbar a `'use client'` component. Mobile menu regrouped: Kitchen / Wardrobe sections with 2-col grids or a fallback. Nav link `/coming-soon/*` → `/wardrobe`, `/deals` fixed. Admin dashboard's invariant-violation banner: each name now links to `/admin/products?edit=<parent_id>` with a Fix → affordance; ProductsTable reads the param, opens Combined Edit (single-variant) or Parent Edit (multi-variant), clears the param. Committed `26d2715`.
- **Product-line routing + /deals + /wardrobe + rotating CTA + brand fonts** — `getAllProducts` accepts optional `product_line` filter; `/kitchen` passes `'kitchen'` so wardrobe SKUs don't leak. New `/wardrobe` page: hero + product grid + friendly empty state. New `getDiscountedProducts()` powers `/deals`. Nav `comingSoon` flags dropped from Wardrobe + Deals. Slide-1 outlined CTA cycles `Kitchen Solutions → Modular India → Click Here` every 2s with a 200ms fade, links to `https://www.modularindia.com` in new tab, min-width reserved so layout doesn't shift. Loaded Marcellus + Libre Baskerville + Fraunces alongside existing Prata + Inter (Cormorant Garamond removed). Committed `f05b62c`.
- **Hero contain-fit letterbox fix** — flat gradient replaced with a blurred + scaled copy of the same slide image, so the extended backdrop matches each shot's own palette instead of clashing (hinge shot had a silver-diagonal that seamed against the previous dark gradient). Committed `570c568`.
- **FAQ CRUD + public UI refresh** — FAQs moved from hardcoded `FAQS` constant into `faq_categories` + `faqs` tables with RLS and a seed migration that preserves the current content. Admin `/admin/faqs` surface: add/edit/delete categories and questions, per-item visibility toggle, Up/Down reorder at both levels (server swaps `display_order` with immediate neighbour). Redesigned FAQ home teaser (server-fetched tree, small client-side tabbed category selector, accordion rows with Lucide chevron replacing the ugly Unicode `▼`). Redesigned `/faqs` page: hero band + sticky category sidebar on desktop / chip row on mobile + category-count badges + friendlier "no results" state with a Contact link. Committed `1cb3eae`.
- **Blog paste crash fix** — two-layer defence against "Server Components render" crash when pasting long formatted content into the blog editor. Client: `RichTextEditor` now sanitizes pasted HTML via `transformPastedHTML` — whitelist of tags the server-side Tiptap extension set understands, unwrap the rest, strip disallowed attributes. Server: `tiptapJsonToHtml` wraps `generateHTML` in try/catch with plain-text fallback so saves never fail even on malformed JSON. Committed `1a4c75d`.
- **About page editorial redesign** — Widened `about_page_sections.section_key` CHECK to include `awards`, `timeline`, `stats`, `expertise` (migration `20260719120000`). Full rewrite of `/about`: hero → stats strip → CMS-driven Our Story → CMS-driven Founder's Message with portrait + pull-quote → hard-coded milestone timeline (horizontal desktop / vertical mobile) → CMS-driven Mission section + hard-coded value cards → dark Awards & Recognition band → CTA strip. Image cropping fixed via aspect-ratio wrapper + `object-contain` over a neutral background. `/admin/about` gained a note about the code-managed sections. Committed `b286ee7`.
- **Hero slide imagery + kitchen page hero** — 5 slides with real product images for slides 3/4/5 (Basket brand shot, Rolling Shutter brand shot, Hinges shot); `next.config.ts` allows `qualities: [75, 80]`; `/kitchen` page hero fully redesigned. Committed `f2f0c8d` and superseded predecessor `e3f7159`.
- **Follow Us + Google Maps embed** — Social icons restored to colored brand SVG variants (mono variant looked flat). Real Google Maps `Share → Embed a map` HTML wired for the head office location. Committed `f5200e7`.
- **Home trust-strip cleanup** — German Technology tile dropped from the yellow trust strip below Categories In Focus; strip drops to 3 columns. First removed the whole strip in `8e05489`; restored 3 remaining items when the request was clarified.
- **Promo code CRUD** — `updatePromoCode` + `deletePromoCode` server actions with Zod validation and usage-aware guardrail (blocks hard-delete when `promo_usages` has rows referencing the code, with friendly "toggle inactive to retire" message). Migration flips `promo_usages.promo_code_id` FK from CASCADE to RESTRICT for defence-in-depth. `EditPromoCodeModal` component; `PromoCodesTable` gained an Actions column with pencil + trash icons. Committed `1b582de`.
- **Product visibility invariant fix (`is_default = false` bug)** — Single-variant products' two Edit buttons merged into one Combined Edit tabbed modal (Product | Variant tabs), sequential save. Status pill now reflects actual public visibility (green Active / amber Not listed / red Inactive). `is_default` guardrails on `addProductVariant` + `removeProductVariant`. New migration one-time cleans up existing defaultless parents + adds `check_product_default_variant_invariant()` RPC. Admin dashboard surfaces a red banner when violations exist. `updateProduct` + `updateParentProduct` now Zod-validated. Committed `d20dd3a`.
- **Return-link stopgap on delivered orders** — `Return` Link on delivered orders in `/account` → `/account/orders/[id]/return` (ownership + eligibility guards, tel/mailto cards). No returns table yet — full workflow still in `.claude/rules/returns.md`. Committed `1587fc8`.
- **Notify-me email pre-fill fix** — Signed-in user email now correctly pre-populates the notify form. Committed `30b56c6`.

### Earlier (historical)

- **OOS UX + notify-me + bulk-enquiry deep-link** (commit `6023d5a`): `stock_notifications` table, `/api/notify-me`, `NotifyMeForm`, PDP CTA rework, ProductCard OOS treatment, BulkEnquiryForm `?variant=` handling, `/admin/notify-me`, AdminNav Bell entry.
- **`.claude/` restructure** — 8 skills → 8 `.claude/rules/*.md` with `paths:` frontmatter (auto-load).
- **Contact page hub redesign** — commit `64faadf`.
- **Home Categories-In-Focus hover** — commit `6dc7e40`.
- **Available promo codes on checkout** — `is_public` + `description` columns, `GET /api/promo-codes/available`, tap-to-fill. Commit `01ec6c9`.
- **Inventory management shipped end-to-end** — commit `d0ee76c` + follow-up `954c5d4`.
- Product variant model, promo codes, blog CMS, five enquiry pipelines, About admin editing. Historical.

## Known Bugs

- **`promo_codes` RLS SELECT is `USING (true)`** — anyone with the anon key can read every promo code. Practical impact contained (API-route gates the checkout list), but the RLS itself doesn't enforce. Tightening deferred until admin-side promo access patterns settle.
- **HeroSlider has an unused `router` variable at line 77.** Pre-existing lint smell.
- **`products.is_active` + `products.is_featured` schema smell** — see Known Tech Debt. The Combined Edit modal + Status pill fix papers over it; underlying two-column model still generates confusion in admin edits.

## Known Tech Debt

- **Admin auth check duplicated ~15 times in `actions.ts`.** `requireAdminUser()` exists in `src/lib/server/admin.ts`. New actions (notify-me cancel, FAQ CRUD) now use the wrapper; old ones still inline the pattern. Migration is safe but not scheduled.
- **`catalogue-data.ts` still exists alongside DB `product_variants`** — dual source of truth. Legacy.
- **`CartContext` is localStorage-only.** No server-side cart, no abandoned-cart recovery.
- **Reviews keyed to `variant_id`, not the parent.** Reviews don't aggregate across finishes/sizes.
- **No error boundary components.**
- **No SEO structured data (JSON-LD) on product pages.** Also `FAQPage` schema on `/faqs` would be a mechanical win.
- **No test coverage.** Manual QA is the only safety net.
- **No API rate limiting on public form endpoints.**
- **Order status transitions not validated.** `updateOrderStatus` accepts any status → any status.
- **No admin activity log.** `stock_movements.admin_id` is the pattern to generalize when this ships.
- **`products.is_active` and `products.is_featured` duplicated on `product_variants`.** Two flags for what admins perceive as "one product" — root cause of "I toggled active and nothing changed" bugs. Cleanup involves auditing every read site, deciding whether the parent-level flag has independent meaning (probably not), and migrating to drop columns or compute-on-read.
- **`Kitchen.tsx` client component isn't reused by `/wardrobe`.** Wardrobe page uses a lightweight grid. Extract into a generic `ProductLineListing` when wardrobe SKUs justify the filter UX.
- **NAV_LINKS duplicated** in `src/constants/index.ts` and inline in `Navbar.tsx`. Only the inline one is consumed. Consolidate in a later refactor.

## Deferred Production-Grade Audits (Products/Variants)

Recorded from the earlier production-readiness audit; safe to defer, none actively harming users. Prompt any of these with "plan the [item] cleanup" in a new session — auto-loaded rules will supply context.

- **Two `is_active` columns (parent + variant) — schema smell.** (Also listed under Known Tech Debt.)
- **`is_default` UX in `AddVariantModal`** for the first-ever variant — the guardrail auto-promotes silently. Fix: force the checkbox on and disable it with a helper text when parent has zero defaults.
- **Zod pass on remaining admin server actions** — `addProductVariant`, `removeProductVariant`, `deleteParentProduct`, `updateOrderStatus`, and the enquiry status setters lack validation. ~20 actions × 5 lines each.
- **`ProductEditForm` at `/admin/products/[id]/edit`** is a separate surface from the modals. Could benefit from the tabbed treatment for consistency.
- **Bulk stock adjustment** — CSV upload or inline-editable stock cell. Not critical until first real inventory reconciliation.
- **Price history / audit trail** — same class of gap as the missing admin activity log.
- **Product images: orphan cleanup** — hard-deleted variants leave Storage objects behind. Needs a cron sweep.

## Do Not Forget

- Razorpay webhook uses `crypto.timingSafeEqual` for HMAC — never simplify to `!==`.
- Never trust client pricing or client stock. Re-derive from DB every time.
- Soft-delete variants that have orders or reviews. Never hard-delete.
- Promo usage recorded ONLY after the payment webhook confirms — never at checkout creation.
- `is_default` variant = what shows on listing pages. Every parent needs exactly one. `addProductVariant` + `removeProductVariant` guardrails + `check_product_default_variant_invariant()` RPC enforce this.
- **Stock reservation happens INSIDE `create_order_with_items`, not before it.** The `SELECT ... FOR UPDATE` on variant rows is what serialises concurrent checkouts.
- **Never write `product_variants.stock_quantity` from application code.** Go through `create_order_with_items`, `release_order_stock`, or `adjust_stock`.
- The expiry sweep is **pg_cron every 10 minutes**, not a Vercel Cron. Vercel Hobby caps cron at once per day, which is why the schedule lives inside Postgres.
- COD orders need a different status flow than online payments — schema is ready, checkout UI isn't wired.
- **`CRON_SECRET` still gates the manual `/api/cron/release-expired-orders` route.** Even though pg_cron is the primary scheduler, don't delete the route — it's the only shell-accessible way to trigger the sweep on demand.
- When adding a new `stock_movements.reason`, update BOTH the CHECK constraint AND every write site in the RPCs.
- **Notify-me signups are collecting but nothing sends them.** Send-out worker deferred (see Current Priorities #5).
- **The per-product enquiry path (`openEnquiryModal`, `/api/enquiry`, `enquiries` table, `EnquiryModal`, `/admin/enquiries`) is still live but no longer wired.** Do not build new features against it — use `bulk_enquiries`, `stock_notifications`, or `support_requests` instead.
- **FAQs live in DB now** (`faq_categories` + `faqs`), not in `src/constants/index.ts`. Admin edits at `/admin/faqs`. `getVisibleFaqTree()` in `src/lib/db/faqs.ts` powers both public surfaces.
- **Nav mega-menu is data-driven** from `getCategoriesByProductLine()` — categories auto-appear under the right product-line column when products are added with that `product_line`. Adding a wardrobe product with a new category populates the Wardrobe column of the menu on next revalidation.
- **Blog paste can silently degrade to plain text** on unknown Tiptap nodes. Server-side fallback logs the error to console. If an author reports "my formatting disappeared", check the `[tiptapJsonToHtml]` console logs for what tripped the sanitizer.
- **Hero product slides use `object-contain` with a blurred image-copy backdrop.** If adding a new product slide, set `fit: 'contain'` in the SLIDES entry — otherwise `object-cover` will crop it.
- **Brand fonts consolidated to TWO families** (DEC-010, July 2026): Inter (sans) + Fraunces (every serif role). The `font-display / font-heading / font-serif / font-accent` utilities all resolve to Fraunces via globals.css — do NOT re-add Prata/Marcellus/Libre Baskerville.
- **Semantic design tokens exist** (DEC-010): `bg-surface / surface-raised / surface-sunken`, `text-ink / ink-muted / ink-faint`, `border-line / line-strong`, gold ramp `gold / gold-bright / gold-deep / on-gold / gold-tint`, radii `rounded-control / card / pill`. They flip with `.dark` automatically — new code must use these, never hardcoded hex neutrals or `dark:` color pairs.

## UI overhaul — remaining follow-ups (July 2026)

- **Account pages restyled** (done — AccountTabs, account page, return page migrated to tokens; StatusBadge inactive states now render as a quiet neutral chip instead of near-black). ✅
- **Checkout + cart drawer restyled** (done). Cart drawer: pluralization, PDP links, Escape-close, tokens. Checkout: structured address form, pincode serviceability check, Razorpay trust line, shipping row, tokens.
- **⚠️ DEFERRED SCHEMA WORK — structured shipping address.** The checkout form now collects Address line 1 / line 2 / City / **State** / Pincode, but the `orders` table still only has `shipping_address` (text), `shipping_city`, `shipping_pincode` — the form **composes line1+line2+state into `shipping_address`**. When Shiprocket/GST work starts, add real columns (`shipping_address_line2`, `shipping_state`) via migration AND update `create_order_with_items` (p_ params) AND the create-order API route AND checkout page to stop composing. All three are coupled (see orders-and-payments.md). Until then, State is captured but only inside the address text blob.
- **`isServiceablePincode(pincode)` lives in `src/constants/index.ts`** — shared by PincodeChecker (PDP) and checkout. Prefix-match against `SERVICEABLE_PINCODES`; client-side convenience gate only, not enforced server-side. Checkout shows a soft warning for unserviceable pincodes but does NOT block the order.
- **Admin panel untouched by the token migration** (out of scope per the overhaul brief); many marketing files still carry old hardcoded hexes with matching values — migrate opportunistically when touching them.
- **Contact page head-office address is still missing** — placeholder block removed (it leaked `[Street address line 1]` to production); TODO(contact-info) in `contact/page.tsx` awaits the real address from the team.
- **PDP (`kitchen/[slug]/ProductDetail.tsx`) restyled** (done — tokens, price in ink except when discounted, Add to Cart is the single gold primary with Bulk Enquiry demoted to a neutral outline, gold-tint chips, serif headings). ✅ All marketing surfaces now migrated except the admin panel (intentionally out of scope).
- **Raw OAuth display name shows unfiltered** (e.g. `21BEC036 Ahmad zia`) on the account header AND prefilled into checkout Full Name. One fix at the profile-save source would clean up both surfaces.
