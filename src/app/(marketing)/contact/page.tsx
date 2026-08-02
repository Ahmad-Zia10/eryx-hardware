import Link from "next/link";
import {
  Mail,
  MapPin,
  Phone,
  Clock,
  Handshake,
  Package,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { SITE_CONFIG } from "@/constants";
import ContactForm from "./ContactForm";
import FollowUsSection from "@/components/sections/FollowUsSection";

// Cards linking to the specialised enquiry surfaces. All routes already
// exist; the placeholder body copy can be edited freely once we have
// approved marketing text — search for TODO(contact-info).
//
// TODO(contact-info): swap `image` URLs below with self-hosted assets
// under public/contact/ once brand-approved photography is available.
// Current URLs point at Unsplash (permissive license) as a stopgap.
const ACTION_CARDS = [
  {
    title: "Dealer Enquiry",
    body: "Apply to stock and sell Eryx hardware in your region.",
    href: "/dealer-enquiry",
    icon: Handshake,
    // Business handshake / partnership scene.
    image:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&auto=format&fit=crop&q=75",
  },
  {
    title: "Bulk / Wholesale Orders",
    body: "Large-volume requirements for projects, builders, and contractors.",
    href: "/bulk-enquiry",
    icon: Package,
    // Warehouse / logistics context.
    image:
      "https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&auto=format&fit=crop&q=75",
  },
  {
    title: "Visit Experience Centre",
    body: "See the full hardware range in person at our showroom.",
    href: "/experience-centre",
    icon: MapPin,
    // Modern architectural interior — "showroom" cue.
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&auto=format&fit=crop&q=75",
  },
  {
    title: "Frequently Asked Questions",
    body: "Answers on shipping, warranty, installation, and returns.",
    href: "/faqs",
    icon: HelpCircle,
    // Soft, information-forward scene.
    image:
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&auto=format&fit=crop&q=75",
  },
];

export default function ContactPage() {
  return (
    <main>
      {/* ─── Hero band ────────────────────────────────────────────── */}
      <section className="border-b border-line bg-surface-sunken">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex items-center gap-3">
            <span className="w-11 h-[2px] bg-gold" />
            <span className="text-xs tracking-[0.2em] uppercase font-extrabold text-gold">
              We are at your service
            </span>
          </div>
          <h1 className="font-extrabold tracking-[-0.03em] text-4xl md:text-6xl text-ink mt-3">
            Contact Us
          </h1>
          <p className="text-sm md:text-base text-ink-muted mt-4 max-w-2xl leading-relaxed">
            Questions about products, orders, dealership, or partnerships? Send
            us a note and the right team will respond.
          </p>

          {/* Quick-reference contact strip: phone / email / hours */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">
            <a
              href={`tel:+91${SITE_CONFIG.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-3 border border-line bg-surface-raised hover:border-gold transition duration-200 ease-in-out p-4"
            >
              <Phone className="text-gold shrink-0" size={20} />
              <div className="min-w-0">
                <p className="text-[10px] tracking-widest uppercase text-ink-muted">
                  Phone
                </p>
                <p className="text-sm text-ink font-medium truncate">
                  {SITE_CONFIG.phone}
                </p>
              </div>
            </a>
            <a
              href={`mailto:${SITE_CONFIG.email}`}
              className="flex items-center gap-3 border border-line bg-surface-raised hover:border-gold transition duration-200 ease-in-out p-4"
            >
              <Mail className="text-gold shrink-0" size={20} />
              <div className="min-w-0">
                <p className="text-[10px] tracking-widest uppercase text-ink-muted">
                  Email
                </p>
                <p className="text-sm text-ink font-medium truncate">
                  {SITE_CONFIG.email}
                </p>
              </div>
            </a>
            <div className="flex items-center gap-3 border border-line bg-surface-raised p-4">
              <Clock className="text-gold shrink-0" size={20} />
              <div className="min-w-0">
                <p className="text-[10px] tracking-widest uppercase text-ink-muted">
                  Hours
                </p>
                <p className="text-sm text-ink font-medium">
                  Mon–Sat, 9:30 AM – 6 PM
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Primary contact form ─────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <h2 className="font-extrabold tracking-[-0.02em] text-2xl md:text-3xl text-ink">
            Send us a message
          </h2>
          <p className="text-sm text-ink-muted mt-2">
            Not sure which team you need? Start here — we&apos;ll route it internally.
          </p>
        </div>
        <ContactForm />
      </section>

      {/* ─── Action cards grid ────────────────────────────────────── */}
      <section className="bg-surface-sunken border-t border-b border-line py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <span className="text-xs tracking-[0.3em] uppercase text-gold">
              Further Contact Options
            </span>
            <h2 className="font-extrabold tracking-[-0.02em] text-2xl md:text-3xl text-ink mt-3">
              Choose the right path
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {ACTION_CARDS.map(({ title, body, href, icon: Icon, image }) => (
              <Link
                key={title}
                href={href}
                className="group relative flex flex-col bg-surface-raised border border-line hover:border-gold [0_12px_40px_rgba(212,160,23,0.15)] hover:-translate-y-0.5 transition duration-200 ease-in-out overflow-hidden"
              >
                {/* Image band — ~55% of the card's visual weight, matches
                    the Hettich reference. Plain <img> so a future swap
                    to /public/contact/*.jpg is a one-line change and
                    doesn't require whitelisting external hosts in
                    next.config. */}
                <div className="relative w-full aspect-[16/9] overflow-hidden bg-surface-sunken">
                  <img
                    src={image}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                  />
                  {/* Icon chip — bottom-left corner, floats above the
                      image so users get a visual cue even before reading
                      the title. */}
                  <div className="absolute bottom-3 left-3 w-10 h-10 flex items-center justify-center bg-surface-raised/95/95 backdrop-blur-sm shadow-sm">
                    <Icon className="text-gold" size={20} />
                  </div>
                </div>

                {/* Text block */}
                <div className="flex flex-col gap-3 p-6">
                  <h3 className="text-lg font-semibold text-ink">
                    {title}
                  </h3>
                  <p className="text-sm text-ink-muted leading-relaxed">
                    {body}
                  </p>
                  <div className="flex items-center justify-between pt-2 mt-auto">
                    <span className="text-xs tracking-widest uppercase text-gold font-semibold">
                      Continue
                    </span>
                    <ArrowRight
                      className="text-gold group-hover:translate-x-1 transition-transform"
                      size={18}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Head Office block ────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative overflow-hidden bg-brand-dark border border-brand-cream/15 px-6 md:px-10 py-10 md:py-14 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Subtle brand accent — mirrors the catalogue-download card on home */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="relative z-10">
            <span className="text-xs tracking-[0.3em] uppercase text-gold">
              Head Office
            </span>
            <h2 className="font-extrabold tracking-[-0.02em] text-2xl md:text-3xl text-brand-cream mt-3">
              {SITE_CONFIG.name}
            </h2>
            <p className="text-sm text-brand-cream/60 mt-1">{SITE_CONFIG.division}</p>

            {/* TODO(contact-info): add the confirmed head-office address
                here when the team supplies it. The bracketed placeholder
                lines that used to render here were visible to customers
                in production, so the block is omitted until the real
                address exists — phone, email, and the map pin below
                already locate the office. */}

            <div className="mt-6 space-y-2 text-sm">
              <a
                href={`tel:+91${SITE_CONFIG.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2 text-brand-cream/70 hover:text-gold transition-colors"
              >
                <Phone size={16} className="text-gold" />
                {SITE_CONFIG.phone}
              </a>
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="flex items-center gap-2 text-brand-cream/70 hover:text-gold transition-colors"
              >
                <Mail size={16} className="text-gold" />
                {SITE_CONFIG.email}
              </a>
            </div>
          </div>

          {/* Embedded Google Map — using the official "Share → Embed a map"
              HTML from Google Maps. No API key needed. Wrapped in a card
              with a subtle border + external link below for full-screen
              directions. */}
          <div className="relative z-10 flex flex-col gap-3 min-h-[280px]">
            <div className="relative flex-1 overflow-hidden border border-brand-cream/15 bg-brand-dark">
              <iframe
                title="Eryx Head Office location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3507.895910390877!2d77.5311007!3d28.452553999999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cc1ab4e066047%3A0x67935001040c1ada!2sModcasa%20Ventures-%20Boral%20Gypsum%2C%20Hindalco%20Aluminium!5e0!3m2!1sen!2sin!4v1784378499367!5m2!1sen!2sin"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full h-full min-h-[280px] border-0"
              />
            </div>
            <a
              href="https://maps.app.goo.gl/WnKNt1cMGrnEuzn59?g_st=iw"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-gold hover:text-gold-bright transition-colors self-start"
            >
              Open in Google Maps
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>

      <FollowUsSection />
    </main>
  );
}
