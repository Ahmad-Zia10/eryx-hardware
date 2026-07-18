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
  Building2,
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
      <section className="border-b border-[#E8E4DD] dark:border-[#2A2A2A] bg-[#F7F5F2] dark:bg-[#141414]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <span className="text-xs tracking-[0.3em] uppercase text-[#D4A017]">
            We Are At Your Service
          </span>
          <h1 className="font-serif text-3xl md:text-5xl text-[#0A0A0A] dark:text-[#F5F5F5] mt-3">
            Contact Us
          </h1>
          <p className="text-sm md:text-base text-[#555555] dark:text-[#9A9A9A] mt-4 max-w-2xl leading-relaxed">
            Questions about products, orders, dealership, or partnerships? Send
            us a note and the right team will respond.
          </p>

          {/* Quick-reference contact strip: phone / email / hours */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">
            <a
              href={`tel:+91${SITE_CONFIG.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-3 border border-[#E8E4DD] dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] hover:border-[#D4A017] transition duration-200 ease-in-out rounded-sm p-4"
            >
              <Phone className="text-[#D4A017] shrink-0" size={20} />
              <div className="min-w-0">
                <p className="text-[10px] tracking-widest uppercase text-[#9A9A9A]">
                  Phone
                </p>
                <p className="text-sm text-[#0A0A0A] dark:text-[#F5F5F5] font-medium truncate">
                  {SITE_CONFIG.phone}
                </p>
              </div>
            </a>
            <a
              href={`mailto:${SITE_CONFIG.email}`}
              className="flex items-center gap-3 border border-[#E8E4DD] dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] hover:border-[#D4A017] transition duration-200 ease-in-out rounded-sm p-4"
            >
              <Mail className="text-[#D4A017] shrink-0" size={20} />
              <div className="min-w-0">
                <p className="text-[10px] tracking-widest uppercase text-[#9A9A9A]">
                  Email
                </p>
                <p className="text-sm text-[#0A0A0A] dark:text-[#F5F5F5] font-medium truncate">
                  {SITE_CONFIG.email}
                </p>
              </div>
            </a>
            <div className="flex items-center gap-3 border border-[#E8E4DD] dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] rounded-sm p-4">
              <Clock className="text-[#D4A017] shrink-0" size={20} />
              <div className="min-w-0">
                <p className="text-[10px] tracking-widest uppercase text-[#9A9A9A]">
                  Hours
                </p>
                <p className="text-sm text-[#0A0A0A] dark:text-[#F5F5F5] font-medium">
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
          <h2 className="font-serif text-2xl md:text-3xl text-[#0A0A0A] dark:text-[#F5F5F5]">
            Send us a message
          </h2>
          <p className="text-sm text-[#555555] dark:text-[#9A9A9A] mt-2">
            Not sure which team you need? Start here — we&apos;ll route it internally.
          </p>
        </div>
        <ContactForm />
      </section>

      {/* ─── Action cards grid ────────────────────────────────────── */}
      <section className="bg-[#F7F5F2] dark:bg-[#141414] border-t border-b border-[#E8E4DD] dark:border-[#2A2A2A] py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <span className="text-xs tracking-[0.3em] uppercase text-[#D4A017]">
              Further Contact Options
            </span>
            <h2 className="font-serif text-2xl md:text-3xl text-[#0A0A0A] dark:text-[#F5F5F5] mt-3">
              Choose the right path
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {ACTION_CARDS.map(({ title, body, href, icon: Icon, image }) => (
              <Link
                key={title}
                href={href}
                className="group relative flex flex-col bg-white dark:bg-[#1A1A1A] border border-[#E8E4DD] dark:border-[#2A2A2A] hover:border-[#D4A017] hover:shadow-lg dark:hover:shadow-[0_12px_40px_rgba(212,160,23,0.15)] hover:-translate-y-0.5 transition duration-200 ease-in-out rounded-sm overflow-hidden"
              >
                {/* Image band — ~55% of the card's visual weight, matches
                    the Hettich reference. Plain <img> so a future swap
                    to /public/contact/*.jpg is a one-line change and
                    doesn't require whitelisting external hosts in
                    next.config. */}
                <div className="relative w-full aspect-[16/9] overflow-hidden bg-[#F7F5F2] dark:bg-[#2A2A2A]">
                  <img
                    src={image}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                  />
                  {/* Icon chip — bottom-left corner, floats above the
                      image so users get a visual cue even before reading
                      the title. */}
                  <div className="absolute bottom-3 left-3 w-10 h-10 flex items-center justify-center rounded-sm bg-white/95 dark:bg-[#1A1A1A]/95 backdrop-blur-sm shadow-sm">
                    <Icon className="text-[#D4A017]" size={20} />
                  </div>
                </div>

                {/* Text block */}
                <div className="flex flex-col gap-3 p-6">
                  <h3 className="text-lg font-semibold text-[#0A0A0A] dark:text-[#F5F5F5]">
                    {title}
                  </h3>
                  <p className="text-sm text-[#555555] dark:text-[#9A9A9A] leading-relaxed">
                    {body}
                  </p>
                  <div className="flex items-center justify-between pt-2 mt-auto">
                    <span className="text-xs tracking-widest uppercase text-[#D4A017] font-semibold">
                      Continue
                    </span>
                    <ArrowRight
                      className="text-[#D4A017] group-hover:translate-x-1 transition-transform"
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
        <div className="relative overflow-hidden bg-[#1A1A1A] dark:bg-[#141414] border border-[#2A2A2A] rounded-sm px-6 md:px-10 py-10 md:py-14 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Subtle brand accent — mirrors the catalogue-download card on home */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4A017]/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="relative z-10">
            <span className="text-xs tracking-[0.3em] uppercase text-[#D4A017]">
              Head Office
            </span>
            <h2 className="font-serif text-2xl md:text-3xl text-[#F5F5F5] mt-3">
              {SITE_CONFIG.name}
            </h2>
            <p className="text-sm text-[#9A9A9A] mt-1">{SITE_CONFIG.division}</p>

            {/* TODO(contact-info): replace with the confirmed head-office address. */}
            <address className="not-italic text-sm text-[#C4C4C4] mt-6 space-y-1 leading-relaxed">
              <p>[Street address line 1]</p>
              <p>[Street address line 2]</p>
              <p>[City] – [PIN]</p>
              <p>India</p>
            </address>

            <div className="mt-6 space-y-2 text-sm">
              <a
                href={`tel:+91${SITE_CONFIG.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2 text-[#C4C4C4] hover:text-[#D4A017] transition-colors"
              >
                <Phone size={16} className="text-[#D4A017]" />
                {SITE_CONFIG.phone}
              </a>
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="flex items-center gap-2 text-[#C4C4C4] hover:text-[#D4A017] transition-colors"
              >
                <Mail size={16} className="text-[#D4A017]" />
                {SITE_CONFIG.email}
              </a>
            </div>
          </div>

          {/* Right column: embedded Google Map of the head office.
              Uses the shareable short-link through Google's public embed
              path — no Maps API key required. The "Open in Google Maps"
              link below sends the visitor to full directions. */}
          <div className="relative z-10 flex flex-col gap-3 min-h-[220px]">
            <div className="relative flex-1 overflow-hidden rounded-sm border border-[#2A2A2A] bg-[#0F0F0F]">
              <iframe
                title="Eryx Head Office location"
                src="https://maps.google.com/maps?q=https%3A%2F%2Fmaps.app.goo.gl%2FWnKNt1cMGrnEuzn59&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full min-h-[220px] border-0"
                allowFullScreen
              />
            </div>
            <a
              href="https://maps.app.goo.gl/WnKNt1cMGrnEuzn59?g_st=iw"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-[#D4A017] hover:text-[#E8B820] transition-colors self-start"
            >
              <Building2 size={14} />
              Open in Google Maps
            </a>
          </div>
        </div>
      </section>

      <FollowUsSection />
    </main>
  );
}
