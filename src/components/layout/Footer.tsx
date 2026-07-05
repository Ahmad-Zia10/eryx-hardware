import Link from "next/link";
import { Phone, Mail, Globe, Download } from "lucide-react";
import { CATEGORIES } from "@/lib/catalogue-data";
import { SITE_CONFIG } from "@/constants";
import {
  InstagramIcon,
  FacebookIcon,
  YoutubeIcon,
  LinkedinIcon,
  PinterestIcon,
} from "@/components/ui/SocialIcons";

export default function Footer() {
  return (
    <footer id="footer" className="bg-[#1A1A1A] border-t border-[#2A2A2A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[#D4A017] text-2xl font-bold">▲</span>
              <span className="font-bold text-2xl tracking-widest text-[#F5F5F5]">
                ERYX
              </span>
            </div>
            <p className="text-sm text-[#9A9A9A]">
              Precision Hardware for Modern Homes. A Division of Modular India.
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <a
                href="tel:+917011184853"
                className="flex items-center gap-2 text-[#9A9A9A] hover:text-[#D4A017] transition duration-200 ease-in-out"
              >
                <Phone size={14} /> 70111 84853
              </a>
              <a
                href="mailto:Info@modularindia.com"
                className="flex items-center gap-2 text-[#9A9A9A] hover:text-[#D4A017] transition duration-200 ease-in-out"
              >
                <Mail size={14} /> Info@modularindia.com
              </a>
              <a
                href="https://eryxhardware.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#9A9A9A] hover:text-[#D4A017] transition duration-200 ease-in-out"
              >
                <Globe size={14} /> eryxhardware.com
              </a>
            </div>
            <div className="flex gap-4 mt-2">
              <a
                href={SITE_CONFIG.socialLinks.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="hover:opacity-80 transition-opacity duration-200"
              >
                <InstagramIcon size={20} />
              </a>
              <a
                href={SITE_CONFIG.socialLinks.facebook.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="hover:opacity-80 transition-opacity duration-200"
              >
                <FacebookIcon size={20} />
              </a>
              <a
                href={SITE_CONFIG.socialLinks.youtube.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="hover:opacity-80 transition-opacity duration-200"
              >
                <YoutubeIcon size={20} />
              </a>
              <a
                href={SITE_CONFIG.socialLinks.linkedin.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="hover:opacity-80 transition-opacity duration-200"
              >
                <LinkedinIcon size={20} />
              </a>
              <a
                href={SITE_CONFIG.socialLinks.pinterest.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest"
                className="hover:opacity-80 transition-opacity duration-200"
              >
                <PinterestIcon size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs tracking-widest uppercase text-[#D4A017]">
              Quick Links
            </h4>
            <Link
              href="/kitchen"
              className="text-sm text-[#9A9A9A] hover:text-[#F5F5F5] transition duration-200 ease-in-out"
            >
              Kitchen Solutions
            </Link>
            <Link
              href="/coming-soon/wardrobe"
              className="text-sm text-[#9A9A9A] hover:text-[#F5F5F5] transition duration-200 ease-in-out"
            >
              Wardrobe Solutions
            </Link>
            <Link
              href="/coming-soon/hardware"
              className="text-sm text-[#9A9A9A] hover:text-[#F5F5F5] transition duration-200 ease-in-out"
            >
              Hardware
            </Link>
            <a
              href="#"
              className="text-sm text-[#9A9A9A] hover:text-[#F5F5F5] transition duration-200 ease-in-out"
            >
              Accessories
            </a>
            <Link
              href="/coming-soon/deals"
              className="text-sm text-[#9A9A9A] hover:text-[#F5F5F5] transition duration-200 ease-in-out"
            >
              Deals &amp; Offers
            </Link>
            <a
              href="#"
              className="text-sm text-[#9A9A9A] hover:text-[#F5F5F5] transition duration-200 ease-in-out"
            >
              Dealer Enquiry
            </a>
          </div>

          {/* Kitchen */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs tracking-widest uppercase text-[#D4A017]">
              Kitchen
            </h4>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/kitchen?category=${encodeURIComponent(cat)}`}
                className="text-sm text-[#9A9A9A] hover:text-[#F5F5F5] transition duration-200 ease-in-out"
              >
                {cat}
              </Link>
            ))}
          </div>

          {/* Company */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs tracking-widest uppercase text-[#D4A017]">
              Company
            </h4>
            <a
              href="#"
              className="text-sm text-[#9A9A9A] hover:text-[#F5F5F5] transition duration-200 ease-in-out"
            >
              About Us
            </a>
            {/* Plain anchor + scrollIntoView is fine here without client
                state, but the onClick handler technically needs a client
                boundary in Next.js. Since this whole Footer has no other
                interactivity, it's simplest to leave this one link as a
                plain anchor to #footer (default browser jump-to-anchor
                behavior) rather than promoting the entire Footer to a
                Client Component just for a smooth-scroll nicety. */}
            <a
              href="#footer"
              className="text-sm text-[#9A9A9A] hover:text-[#F5F5F5] transition duration-200 ease-in-out"
            >
              Contact Us
            </a>
            <a
              href="#"
              className="text-sm text-[#9A9A9A] hover:text-[#F5F5F5] transition duration-200 ease-in-out"
            >
              Experience Centre
            </a>
            <a
              href="#"
              className="text-sm text-[#9A9A9A] hover:text-[#F5F5F5] transition duration-200 ease-in-out"
            >
              Blog
            </a>
            <a
              href={SITE_CONFIG.catalogueUrl}
              download="Eryx-Hardware-Catalogue.pdf"
              className="text-sm text-[#9A9A9A] hover:text-[#F5F5F5] transition duration-200 ease-in-out flex items-center gap-1"
            >
              <Download size={12} />
              Catalogues
            </a>
            <a
              href="mailto:Info@modularindia.com"
              className="text-sm text-[#9A9A9A] hover:text-[#F5F5F5] transition duration-200 ease-in-out"
            >
              Bulk Enquiry
            </a>
          </div>
        </div>

        <div className="border-t border-[#2A2A2A] pt-4 mt-8">
          <p className="text-center text-xs text-[#9A9A9A]">
            Copyright © 2026, Eryx Hardware · A Division of Modular India. All
            Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}