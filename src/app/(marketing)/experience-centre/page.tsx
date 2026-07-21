import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  ArrowRight,
  Hand,
  Palette,
  Users,
  Ruler,
  Navigation,
} from "lucide-react";
import { EXPERIENCE_CENTRE } from "@/constants";

export const metadata = {
  title: "Experience Centre — Eryx Hardware",
  description:
    "Visit the Eryx Experience Centre in Greater Noida. Touch-test soft-close mechanisms, see finishes in person, and plan your project with our specialists.",
};

const telHref = `tel:+91${EXPERIENCE_CENTRE.phone.replace(/\D/g, "")}`;
const mailHref = `mailto:${EXPERIENCE_CENTRE.email}`;
const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  EXPERIENCE_CENTRE.mapsQuery
)}`;

const HIGHLIGHTS = [
  {
    Icon: Hand,
    title: "Feel the mechanism",
    body: "Test soft-close hinges, drawer slides, and pull-outs by hand — the difference is in the touch.",
  },
  {
    Icon: Palette,
    title: "See every finish",
    body: "Compare chrome, matte, glass, and wood finishes in real light before you commit.",
  },
  {
    Icon: Users,
    title: "Talk to a specialist",
    body: "Our hardware experts help you match the right system to your kitchen or wardrobe.",
  },
  {
    Icon: Ruler,
    title: "Plan your project",
    body: "Bring your measurements and layout — we'll help you spec the full hardware list.",
  },
];

// Local lifestyle imagery — self-hosted, lazy-loaded below the fold.
const GALLERY = [
  { src: "/products/gtpt/gtpt-2-lifestyle-collage.jpg", alt: "Kitchen pull-out systems on display" },
  { src: "/products/s-corner/s-corner-3-lifestyle-collage.jpg", alt: "Corner storage solutions" },
  { src: "/products/basket/basket-3-lifestyle.jpg", alt: "Basket systems in a modular kitchen" },
  { src: "/products/glass-pull-down/glass-pull-down-5-lifestyle.jpg", alt: "Glass pull-down unit" },
];

export default function ExperienceCentrePage() {
  return (
    <main>
      {/* ─── Hero ─────────────────────────────────────────────────── */}
      <section className="relative h-[60vh] min-h-[440px] overflow-hidden bg-brand-dark">
        <Image
          src="/products/hero/slide-1-modular-kitchen.jpg"
          alt="Eryx Experience Centre showroom"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/85 via-black/55 to-transparent pointer-events-none" />
        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-12 lg:pb-16">
          <div className="flex flex-col gap-3 sm:gap-4 max-w-2xl">
            <p className="text-xs text-white/70">
              <Link href="/" className="hover:text-gold hover:underline">
                Home
              </Link>{" "}
              / Experience Centre
            </p>
            <span className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-gold">
              Visit Us In Person
            </span>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold leading-[1.05] text-white font-display">
              Experience Eryx in Person
            </h1>
            <p className="text-sm sm:text-base text-white/80 max-w-lg leading-relaxed">
              Specifications only tell half the story. Visit our Greater Noida
              Experience Centre to feel the engineering behind every mechanism.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <a
                href={directionsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-bright text-on-gold font-semibold px-6 py-3 rounded-control transition duration-200 ease-in-out"
              >
                <Navigation size={16} />
                Get Directions
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 border border-white/40 text-white hover:border-gold hover:text-gold font-semibold px-6 py-3 rounded-control transition duration-200 ease-in-out"
              >
                Book a Visit
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── What you can do here ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-2xl mb-10">
          <span className="text-xs tracking-[0.3em] uppercase text-gold-deep">
            Why Visit
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-ink mt-3">
            The showroom experience
          </h2>
          <p className="text-sm text-ink-muted mt-3 leading-relaxed">
            Premium hardware is a tactile purchase. Here&apos;s what a visit gives
            you that a product page can&apos;t.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {HIGHLIGHTS.map(({ Icon, title, body }) => (
            <div
              key={title}
              className="border border-line rounded-card p-6 bg-surface-raised hover:border-gold/50 transition-colors duration-200"
            >
              <div className="w-11 h-11 rounded-control bg-gold-tint flex items-center justify-center mb-4">
                <Icon size={20} className="text-gold-deep" />
              </div>
              <h3 className="text-base font-semibold text-ink">{title}</h3>
              <p className="text-sm text-ink-muted mt-1.5 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Visit us: details + map ──────────────────────────────── */}
      <section className="bg-surface-sunken border-y border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Details */}
          <div>
            <span className="text-xs tracking-[0.3em] uppercase text-gold-deep">
              Find Us
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-ink mt-3 mb-6">
              Plan your visit
            </h2>

            <div className="space-y-5">
              <div className="flex gap-4">
                <MapPin className="text-gold shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-[10px] tracking-widest uppercase text-ink-faint mb-1">
                    Address
                  </p>
                  <address className="not-italic text-sm text-ink leading-relaxed">
                    {EXPERIENCE_CENTRE.addressLines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </address>
                </div>
              </div>

              <div className="flex gap-4">
                <Clock className="text-gold shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-[10px] tracking-widest uppercase text-ink-faint mb-1">
                    Hours
                  </p>
                  {EXPERIENCE_CENTRE.hours.map((h) => (
                    <p key={h.days} className="text-sm text-ink">
                      <span className="text-ink-muted">{h.days}:</span> {h.time}
                    </p>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                <a href={telHref} className="flex gap-4 group">
                  <Phone className="text-gold shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-[10px] tracking-widest uppercase text-ink-faint mb-1">
                      Phone
                    </p>
                    <p className="text-sm text-ink group-hover:text-gold-deep transition-colors">
                      {EXPERIENCE_CENTRE.phone}
                    </p>
                  </div>
                </a>
                <a href={mailHref} className="flex gap-4 group">
                  <Mail className="text-gold shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-[10px] tracking-widest uppercase text-ink-faint mb-1">
                      Email
                    </p>
                    <p className="text-sm text-ink group-hover:text-gold-deep transition-colors break-all">
                      {EXPERIENCE_CENTRE.email}
                    </p>
                  </div>
                </a>
              </div>
            </div>

            <a
              href={directionsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gold hover:bg-gold-bright text-on-gold font-semibold px-6 py-3 rounded-control transition duration-200 ease-in-out mt-8"
            >
              <Navigation size={16} />
              Get Directions
            </a>
          </div>

          {/* Map card — links out to Google Maps. No third-party JS/iframe on
              load (performance): a lightweight branded card that opens the
              live map in a new tab. */}
          <a
            href={directionsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block rounded-card overflow-hidden border border-line min-h-[320px] bg-brand-dark"
            aria-label="Open Eryx Experience Centre location in Google Maps"
          >
            <Image
              src="/products/hero/slide-2-light-kitchen.jpg"
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover opacity-40 group-hover:opacity-50 group-hover:scale-[1.03] transition-all duration-500"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
              <div className="w-14 h-14 rounded-full bg-gold flex items-center justify-center mb-4 shadow-lg">
                <MapPin size={24} className="text-on-gold" />
              </div>
              <p className="text-white font-semibold text-lg">Greater Noida</p>
              <p className="text-white/70 text-sm mt-1 max-w-xs">
                Surajpur Site 4, Industrial Area
              </p>
              <span className="inline-flex items-center gap-1.5 text-gold text-sm font-semibold mt-4 group-hover:gap-2.5 transition-all">
                Open in Google Maps
                <ArrowRight size={14} />
              </span>
            </div>
          </a>
        </div>
      </section>

      {/* ─── Gallery ──────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-2xl mb-8">
          <span className="text-xs tracking-[0.3em] uppercase text-gold-deep">
            Inside the Centre
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-ink mt-3">
            The range, on display
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {GALLERY.map((img, i) => (
            <div
              key={img.src}
              className={`relative rounded-card overflow-hidden bg-surface-sunken ${
                i === 0 ? "col-span-2 aspect-[2/1] lg:aspect-square" : "aspect-square"
              }`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                loading="lazy"
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover hover:scale-[1.04] transition-transform duration-500"
              />
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────── */}
      <section className="bg-gold">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-bold text-2xl text-on-gold">Planning a visit?</p>
            <p className="text-on-gold/80 mt-1">
              Let us know you&apos;re coming and we&apos;ll have a specialist ready.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={telHref}
              className="bg-brand-dark text-gold font-semibold px-6 py-3 rounded-control hover:bg-black transition duration-200 ease-in-out text-center"
            >
              Call {EXPERIENCE_CENTRE.phone}
            </a>
            <Link
              href="/contact"
              className="bg-brand-dark text-gold font-semibold px-6 py-3 rounded-control hover:bg-black transition duration-200 ease-in-out text-center"
            >
              Book a Visit
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
