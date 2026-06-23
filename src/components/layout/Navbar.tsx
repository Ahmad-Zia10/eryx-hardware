"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ChevronDown,
  Search,
  Moon,
  Sun,
  User,
  ShoppingCart,
  Menu,
  X,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useCart } from "@/context/CartContext";
import { useUI } from "@/context/UIContext";
import { CATALOG_CATEGORIES } from "@/lib/catalogue-data";

const NAV_LINKS = [
  { label: "Kitchen Solutions", href: "/kitchen" },
  { label: "Wardrobe Solutions", href: "/coming-soon/wardrobe" },
  { label: "Deals & Offers", href: "/coming-soon/deals" },
];

function ProductsMenu({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="absolute left-0 top-full w-72 bg-white dark:bg-[#111111] text-[#0A0A0A] dark:text-white border border-[#D4D4D4] dark:border-[#2A2A2A] shadow-2xl py-2">
      {CATALOG_CATEGORIES.map((category) => (
        <Link
          key={category.slug}
          href={`/kitchen?category=${encodeURIComponent(category.name)}`}
          onClick={onNavigate}
          className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#F5F5F5] dark:hover:bg-[#1F1F1F] hover:text-[#D4A017] transition duration-200 ease-in-out"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={category.image}
            alt=""
            className="w-10 h-10 rounded-full object-cover bg-[#EBEBEB] dark:bg-[#2A2A2A]"
            loading="lazy"
          />
          <span className="flex-1">{category.name}</span>
          <span className="text-[#D4A017]">›</span>
        </Link>
      ))}
    </div>
  );
}

// Mirrors react-router's <NavLink isActive> behavior — Next.js has no
// built-in equivalent, so we compare the current pathname ourselves.
function navLinkClass(isActive: boolean) {
  return `text-sm transition duration-200 ease-in-out hover:text-[#D4A017] ${
    isActive ? "text-[#D4A017]" : "text-[#555555] dark:text-[#9A9A9A]"
  }`;
}

export default function Navbar() {
  const { isDark, toggleTheme } = useTheme();
  const { cartCount } = useCart();
  const { openCartDrawer } = useUI();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);

  const closeMenus = () => {
    setMobileOpen(false);
    setProductsOpen(false);
  };

  const handleContactClick = () => {
    closeMenus();
    const footer = document.getElementById("footer");
    if (footer) {
      footer.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/");
      setTimeout(() => {
        document.getElementById("footer")?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  };

  return (
    <nav className="sticky top-9.25 z-40 bg-white dark:bg-[#0A0A0A] border-b border-[#D4D4D4] dark:border-[#2A2A2A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/eryx-logo.png" alt="" className="h-9 w-9 object-contain" />
          <span className="font-bold text-2xl tracking-widest text-[#0A0A0A] dark:text-[#F5F5F5]">
            ERYX
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          <Link href="/" className={navLinkClass(pathname === "/")}>
            Home
          </Link>

          <div
            className="relative"
            onMouseEnter={() => setProductsOpen(true)}
            onMouseLeave={() => setProductsOpen(false)}
          >
            <button
              onClick={() => setProductsOpen((open) => !open)}
              className="flex items-center gap-1 text-sm text-[#555555] dark:text-[#9A9A9A] transition duration-200 ease-in-out hover:text-[#D4A017]"
            >
              Products <ChevronDown size={14} />
            </button>
            {productsOpen && <ProductsMenu onNavigate={closeMenus} />}
          </div>

          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={navLinkClass(pathname === link.href)}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleContactClick}
            className="text-sm text-[#555555] dark:text-[#9A9A9A] hover:text-[#D4A017] transition duration-200 ease-in-out"
          >
            Contact Us
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            className="hidden sm:block text-[#555555] dark:text-[#9A9A9A] hover:text-[#D4A017] transition duration-200 ease-in-out"
            aria-label="Search"
          >
            <Search size={20} />
          </button>
          <button
            onClick={toggleTheme}
            className="text-[#555555] dark:text-[#9A9A9A] hover:text-[#D4A017] transition duration-200 ease-in-out"
            aria-label="Toggle theme"
          >
            {isDark ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button
            className="hidden sm:block text-[#555555] dark:text-[#9A9A9A] hover:text-[#D4A017] transition duration-200 ease-in-out"
            aria-label="Account"
          >
            <User size={20} />
          </button>
          <button
            onClick={openCartDrawer}
            className="relative text-[#555555] dark:text-[#9A9A9A] hover:text-[#D4A017] transition duration-200 ease-in-out"
            aria-label="Cart"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#D4A017] text-[#0A0A0A] text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-sm">
                {cartCount}
              </span>
            )}
          </button>
          <button
            className="lg:hidden text-[#0A0A0A] dark:text-[#F5F5F5]"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-[#D4D4D4] dark:border-[#2A2A2A] bg-white dark:bg-[#0A0A0A]">
          <div className="flex flex-col px-4 py-2">
            <button
              onClick={() => setProductsOpen((open) => !open)}
              className="flex items-center justify-between py-3 text-sm border-b border-[#D4D4D4] dark:border-[#2A2A2A] text-[#555555] dark:text-[#9A9A9A]"
            >
              Products{" "}
              <ChevronDown size={14} className={productsOpen ? "rotate-180" : ""} />
            </button>
            {productsOpen && (
              <div className="grid grid-cols-2 gap-2 py-3 border-b border-[#D4D4D4] dark:border-[#2A2A2A]">
                {CATALOG_CATEGORIES.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/kitchen?category=${encodeURIComponent(category.name)}`}
                    onClick={closeMenus}
                    className="flex items-center gap-2 text-xs text-[#555555] dark:text-[#9A9A9A]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={category.image}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    {category.name}
                  </Link>
                ))}
              </div>
            )}
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={closeMenus}
                className={`py-3 text-sm border-b border-[#D4D4D4] dark:border-[#2A2A2A] hover:text-[#D4A017] transition duration-200 ease-in-out ${
                  pathname === link.href
                    ? "text-[#D4A017]"
                    : "text-[#555555] dark:text-[#9A9A9A]"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleContactClick}
              className="py-3 text-sm text-left text-[#555555] dark:text-[#9A9A9A] hover:text-[#D4A017] transition duration-200 ease-in-out"
            >
              Contact Us
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}