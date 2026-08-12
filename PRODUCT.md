# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: the homeowner / DIY buyer.** An individual in India renovating or building their own kitchen or wardrobe, sourcing a handful of premium hardware SKUs (hinges, drawer slides, tandem boxes, baskets, shutter systems) directly online. They are spec-conscious but not specialists — they need enough guidance, trust signals, and clear specifications to buy confidently without a showroom visit. When trade-offs arise, their success is the design center of gravity.

Secondary audiences, each with their own path rather than the retail cart:
- **Contractors / fabricators** (carpenters, modular-kitchen makers) sourcing for client jobs — served by bulk enquiry.
- **Dealers / distributors** reselling Eryx — served by the dealer-enquiry pipeline and partnership channel, not the retail checkout.

## Product Purpose

Eryx Hardware is a production B2C e-commerce platform selling premium kitchen and wardrobe hardware in India — a direct-to-consumer channel for a catalog of ~100–200 SKUs across 8 core categories. It exists to let Indian homeowners buy German-engineered modular hardware online with confidence: browse the catalog, check serviceability, pay in INR, and receive Pan-India delivery. Success means a homeowner completes a trustworthy purchase (or routes a bulk/dealer enquiry) without needing a showroom, and the business runs it safely at real revenue scale.

## Positioning

German-engineered precision hardware, sold direct by **Eryx — a division of Modular India**, a company operating in this space since 2000 (Eryx sub-brand launched 2020 for direct e-commerce). The claim a neighboring reseller could not truthfully copy: two decades of Modular India distribution and dealer relationships behind a focused, premium own-brand catalog — precision tolerances, longevity rated for daily Indian-home use, and Pan-India fulfillment, positioned as premium rather than a discount hardware bin.

## Operating Context

- **India market.** Prices in INR, displayed `₹X,XX,XXX` via `toLocaleString("en-IN")`. Serviceability gated by pincode prefix (Delhi NCR, Mumbai, Bangalore, Hyderabad, Chennai, Pune at present) — a client-side convenience gate; real serviceability is confirmed by ops.
- **Payments.** Razorpay (INR, webhook-confirmed). COD is planned (schema ready, checkout path not yet wired). GST invoicing (GSTIN, HSN, tax breakdown) is a likely future requirement, not yet built.
- **Fulfillment.** Pan-India delivery; logistics integration (likely Shiprocket — AWB, tracking URL, status callbacks) planned, not yet built.
- **Two-tier catalog.** Parent products with variants; cart/checkout pricing always derives from `product_variants`, never the `products` table.
- **Multiple admins** operate a dashboard managing catalog, orders, inventory, blog/about CMS, FAQs, and five enquiry channels (product, contact, bulk, dealer, support). Admin activity should be traceable.
- **Physical presence.** Eryx Experience Centre / showroom in Greater Noida, UP (currently marked "coming soon" in nav).

## Capabilities and Constraints

- **Confirmed capabilities:** catalog browse (kitchen, wardrobe, hardware, categories directory), product detail with variants and pincode check, cart (localStorage), checkout with promo codes, account/auth (email + Google OAuth), wishlist, blog and About CMS (Tiptap), FAQs, deals, five enquiry pipelines, admin dashboard with inventory reservation/release and stock-movement audit.
- **Terminology:** SKU / variant, item_code (product slugs derived from it at runtime, not stored), "Kitchen Accessories," "Wardrobe Accessories," core categories, "Experience Centre" (not "showroom" in nav), dealer vs bulk enquiry are distinct channels.
- **Hard constraints (must never break):**
  - **Production-safe always** — real revenue platform; no change may risk checkout, pricing, or stock integrity. *(User-confirmed as the single non-negotiable.)*
  - Pricing and stock re-derived server-side; single source is `getEffectivePrice()` / `formatPrice()` in `src/lib/pricing.ts`. Null price → "Price on request," not purchasable.
  - India-first economics (INR, GST-ready, pincode serviceability) — factual to the market, not a style choice.
  - Eryx is a **division of Modular India**; the parent relationship is part of the identity.
- **Undecided / not yet built:** COD checkout path, shipping/logistics integration, GST invoicing, returns/refund lifecycle (design agreed, not built), API rate limiting, SEO structured data on PDPs. Do not present any of these as live.

## Brand Commitments

- **Name:** Eryx Hardware. **Parent:** A Division of Modular India.
- **Tagline:** "Precision Hardware for Modern Homes."
- **Descriptor:** "German-engineered kitchen and wardrobe hardware for the modern Indian home."
- **Assets:** logo at `public/eryx-logo.png` and `public/eryx-logo-transparent.png`; product/catalogue imagery under `public/`; downloadable catalogue PDF at `/catalogue/eryx-catalogue.pdf`.
- **Founder:** Zeeshan Haider Rizvi (named on the About page).
- **Voice (as shipped):** confident, precise, engineering-literate but plain — "millimetres matter," "outlast the cabinet." Trade-credible without jargon dumping. Not playful, not luxury-florid.
- **Social:** Instagram, Facebook, YouTube, LinkedIn, Pinterest all under @eryxhardware.
- **Contact:** phone 70111 84853, Info@modularindia.com, site eryxhardware.com.

*(These are recorded brand facts, not an aesthetic direction — visual world is decided separately in new-work.)*

## Evidence on Hand

- **Real, user-verified facts (preserve; safe to present as proof):** founded 2000; Eryx e-commerce sub-brand 2020; 200+ SKUs; 8 core categories; Pan-India delivery; **10-year hardware warranty** (user-confirmed 2026-08-13 as a real, defensible term); founder Zeeshan Haider Rizvi; awards — India Excellence Awards (2023), National Business Excellence (2022), ongoing trade-press features (Sandesh, Business Excellence and others). User confirmed these are real and verified.
- **CMS-editable content:** About page History / Founder / Mission sections (`about_page_sections`); blog; FAQs — live business content, not fabricated.
- **Do not fabricate:** additional testimonials, customer counts, benchmark numbers, pricing claims, delivery SLAs, or press mentions beyond those above. Serviceable-pincode list is a convenience gate, not a coverage guarantee — don't restate it as "we deliver only to these cities."

## Product Principles

1. **Homeowner confidence over specialist density.** Design for a spec-conscious non-expert: earn trust with clarity, specs, and proof, not with a professional-tool learning curve.
2. **Production-safe is sacred.** Every change protects checkout, pricing, and stock integrity first; this platform takes real money.
3. **Premium, precise, and honest.** Hold the German-engineered / precision positioning; never drift toward discount-bin framing, and never dress up unbuilt features (COD, shipping tracking, GST, returns) as live.
4. **One truth for pricing and catalog.** Prices and stock come from the variant layer and `pricing.ts`; the site's credibility depends on those never diverging.
5. **Serve trade without breaking retail.** Contractors and dealers get dedicated enquiry paths; the retail experience stays centered on the homeowner.

## Accessibility & Inclusion

No product-specific accessibility standard was established during init. General web accessibility (semantic structure, keyboard access, sufficient contrast, alt text on product imagery) applies as baseline craft; record a formal requirement here if one is later mandated.
