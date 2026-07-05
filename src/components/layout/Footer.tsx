import Link from "next/link";
import { Phone, Mail, Globe, Download } from "lucide-react";
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
              {/* Instagram */}
              <a
                href={SITE_CONFIG.socialLinks.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-[#9A9A9A] hover:text-[#D4A017] transition duration-200 ease-in-out"
              >
                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                </svg>
              </a>
              {/* Facebook */}
              <a
                href={SITE_CONFIG.socialLinks.facebook.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-[#9A9A9A] hover:text-[#D4A017] transition duration-200 ease-in-out"
              >
                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              {/* YouTube */}
              <a
                href={SITE_CONFIG.socialLinks.youtube.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="text-[#9A9A9A] hover:text-[#D4A017] transition duration-200 ease-in-out"
              >
                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              {/* LinkedIn */}
              <a
                href={SITE_CONFIG.socialLinks.linkedin.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-[#9A9A9A] hover:text-[#D4A017] transition duration-200 ease-in-out"
              >
                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              {/* Pinterest */}
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