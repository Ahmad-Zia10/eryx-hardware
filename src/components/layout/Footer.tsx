import Link from "next/link";
import { Phone, Mail, Globe, Instagram, Facebook, Youtube, Linkedin, Download } from "lucide-react";
import { CATEGORIES } from "@/lib/catalogue-data";
import { SITE_CONFIG } from "@/constants";

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
                className="text-[#9A9A9A] hover:text-[#D4A017] transition duration-200 ease-in-out"
              >
                <Instagram size={18} />
              </a>
              <a
                href={SITE_CONFIG.socialLinks.facebook.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-[#9A9A9A] hover:text-[#D4A017] transition duration-200 ease-in-out"
              >
                <Facebook size={18} />
              </a>
              <a
                href={SITE_CONFIG.socialLinks.youtube.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Youtube"
                className="text-[#9A9A9A] hover:text-[#D4A017] transition duration-200 ease-in-out"
              >
                <Youtube size={18} />
              </a>
              <a
                href={SITE_CONFIG.socialLinks.linkedin.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-[#9A9A9A] hover:text-[#D4A017] transition duration-200 ease-in-out"
              >
                <Linkedin size={18} />
              </a>
              <a
                href={SITE_CONFIG.socialLinks.pinterest.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest"
                className="text-[#9A9A9A] hover:text-[#D4A017] transition duration-200 ease-in-out"
              >
                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                </svg>
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