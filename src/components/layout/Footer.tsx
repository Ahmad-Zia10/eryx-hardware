import Link from "next/link";
import { Phone, Mail, Globe, Download } from "lucide-react";
import { getCategoriesForLine } from "@/lib/catalogue-data";
import { SITE_CONFIG } from "@/constants";
import {
  InstagramIcon,
  FacebookIcon,
  YoutubeIcon,
  LinkedinIcon,
  PinterestIcon,
} from "@/components/ui/SocialIcons";

// The footer is an always-dark surface in both themes, so it uses the
// warm brand-dark + literal light-on-dark colors rather than the
// adaptive surface/ink tokens.
const footerLink =
  "text-sm text-white/55 hover:text-brand-cream transition duration-200 ease-in-out";

const SOCIALS = [
  { label: "Instagram", url: SITE_CONFIG.socialLinks.instagram.url, Icon: InstagramIcon },
  { label: "Facebook", url: SITE_CONFIG.socialLinks.facebook.url, Icon: FacebookIcon },
  { label: "YouTube", url: SITE_CONFIG.socialLinks.youtube.url, Icon: YoutubeIcon },
  { label: "LinkedIn", url: SITE_CONFIG.socialLinks.linkedin.url, Icon: LinkedinIcon },
  { label: "Pinterest", url: SITE_CONFIG.socialLinks.pinterest.url, Icon: PinterestIcon },
];

export default function Footer() {
  return (
    <footer id="footer" className="bg-brand-dark border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gold text-2xl font-bold">▲</span>
              <span className="font-bold text-2xl tracking-widest text-white">
                ERYX
              </span>
            </div>
            <p className="text-sm text-white/55 leading-relaxed">
              Precision Hardware for Modern Homes. A Division of Modular India.
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <a
                href="tel:+917011184853"
                className="flex items-center gap-2 text-white/55 hover:text-gold transition duration-200 ease-in-out"
              >
                <Phone size={14} /> 70111 84853
              </a>
              <a
                href="mailto:Info@modularindia.com"
                className="flex items-center gap-2 text-white/55 hover:text-gold transition duration-200 ease-in-out"
              >
                <Mail size={14} /> Info@modularindia.com
              </a>
              <a
                href="https://eryxhardware.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/55 hover:text-gold transition duration-200 ease-in-out"
              >
                <Globe size={14} /> eryxhardware.com
              </a>
            </div>
            <div className="flex gap-4 mt-2">
              {SOCIALS.map(({ label, url, Icon }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="opacity-90 hover:opacity-100 hover:-translate-y-0.5 transition duration-200"
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs tracking-widest uppercase text-gold">
              Quick Links
            </h4>
            <Link href="/kitchen" className={footerLink}>
              Kitchen Solutions
            </Link>
            <Link href="/wardrobe" className={footerLink}>
              Wardrobe Solutions
            </Link>
            <Link href="/coming-soon/hardware" className={footerLink}>
              Hardware
            </Link>
            <Link href="/deals" className={footerLink}>
              Deals &amp; Offers
            </Link>
            <Link href="/bulk-enquiry" className={footerLink}>
              Bulk Enquiry
            </Link>
          </div>

          {/* Kitchen */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs tracking-widest uppercase text-gold">
              Kitchen
            </h4>
            {getCategoriesForLine("kitchen").map((cat) => (
              <Link
                key={cat}
                href={`/kitchen?category=${encodeURIComponent(cat)}`}
                className={footerLink}
              >
                {cat}
              </Link>
            ))}
          </div>

          {/* Company */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs tracking-widest uppercase text-gold">
              Company
            </h4>
            <Link href="/about" className={footerLink}>
              About Us
            </Link>
            <Link href="/contact" className={footerLink}>
              Contact Us
            </Link>
            <Link href="/faqs" className={footerLink}>
              FAQs
            </Link>
            <Link href="/blog" className={footerLink}>
              Blog
            </Link>
            <a
              href={SITE_CONFIG.catalogueUrl}
              download="Eryx-Hardware-Catalogue.pdf"
              className={`${footerLink} flex items-center gap-1`}
            >
              <Download size={12} />
              Catalogues
            </a>
            <Link href="/dealer-enquiry" className={footerLink}>
              Dealer Enquiry
            </Link>
          </div>
        </div>

        <div className="border-t border-white/10 pt-5 mt-10">
          <p className="text-center text-xs text-white/45">
            Copyright © 2026, Eryx Hardware · A Division of Modular India. All
            Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
