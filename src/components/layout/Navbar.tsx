"use client";

import { useState, useEffect, useRef } from "react";
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
  LogOut,
  ShieldAlert
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/context/ThemeContext";
import { useCart } from "@/context/CartContext";
import { useUI } from "@/context/UIContext";
import SearchOverlay from "./SearchOverlay";
import ProductsMegaMenu from "./ProductsMegaMenu";
import type { CategoryGroup, ProductLine } from "@/lib/db/categories";

const NAV_LINKS = [
  { label: "Kitchen Accessories", href: "/kitchen" },
  { label: "Wardrobe Accessories", href: "/wardrobe" },
  { label: "Deals & Offers", href: "/deals" },
  { label: "Blog", href: "/blog" },
];

const MOBILE_PRODUCT_LINE_LABELS: Record<ProductLine, string> = {
  kitchen: "Kitchen",
  wardrobe: "Wardrobe",
  hardware: "Hardware",
};

const MOBILE_PRODUCT_LINE_HREF: Record<ProductLine, string> = {
  kitchen: "/kitchen",
  wardrobe: "/wardrobe",
  hardware: "/kitchen",
};

// Mirrors react-router's <NavLink isActive> behavior — Next.js has no
// built-in equivalent, so we compare the current pathname ourselves.
function navLinkClass(isActive: boolean) {
  return `text-sm transition duration-200 ease-in-out hover:text-[#D4A017] ${
    isActive ? "text-[#D4A017]" : "text-[#555555] dark:text-[#9A9A9A]"
  }`;
}

export default function Navbar({
  categoryGroups = [],
}: {
  categoryGroups?: CategoryGroup[];
}) {
  const { isDark, toggleTheme } = useTheme();
  const { cartCount } = useCart();
  const { openCartDrawer } = useUI();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  // Hover-with-forgiveness pattern for the Products mega-menu. Open on
  // hover after 150ms (avoid accidental triggers), close after 250ms
  // (lets the cursor traverse from trigger → panel without a flash-close).
  const productsHoverRef = useRef<{ open: ReturnType<typeof setTimeout> | null; close: ReturnType<typeof setTimeout> | null }>({
    open: null,
    close: null,
  });

  const openProductsWithDelay = () => {
    if (productsHoverRef.current.close) {
      clearTimeout(productsHoverRef.current.close);
      productsHoverRef.current.close = null;
    }
    if (productsHoverRef.current.open) return;
    productsHoverRef.current.open = setTimeout(() => {
      setProductsOpen(true);
      productsHoverRef.current.open = null;
    }, 150);
  };

  const closeProductsWithDelay = () => {
    if (productsHoverRef.current.open) {
      clearTimeout(productsHoverRef.current.open);
      productsHoverRef.current.open = null;
    }
    if (productsHoverRef.current.close) return;
    productsHoverRef.current.close = setTimeout(() => {
      setProductsOpen(false);
      productsHoverRef.current.close = null;
    }, 250);
  };
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role === 'admin') setIsAdmin(true);
      }
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
         setUser(session?.user || null);
         const { data: profile } = await supabase.from('profiles').select('role').eq('id', session?.user?.id).single();
         if (profile?.role === 'admin') setIsAdmin(true);
      } else if (event === 'SIGNED_OUT') {
         setUser(null);
         setIsAdmin(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!userDropdownOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setUserDropdownOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [userDropdownOpen]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserDropdownOpen(false);
    router.refresh();
  };

  const closeMenus = () => {
    setMobileOpen(false);
    setProductsOpen(false);
  };

  return (
    <nav className="sticky top-9.25 z-40 bg-white dark:bg-[#0A0A0A] border-b border-[#D4D4D4] dark:border-[#2A2A2A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/eryx-logo-transparent.png" alt="ERYX" className="h-12 object-contain" />
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          <Link href="/" className={navLinkClass(pathname === "/")}>
            Home
          </Link>

          <div
            className="relative"
            onMouseEnter={openProductsWithDelay}
            onMouseLeave={closeProductsWithDelay}
          >
            <button
              onClick={() => setProductsOpen((open) => !open)}
              className="flex items-center gap-1 text-sm text-[#555555] dark:text-[#9A9A9A] transition duration-200 ease-in-out hover:text-[#D4A017]"
            >
              Products <ChevronDown size={14} />
            </button>
            {productsOpen && (
              <ProductsMegaMenu
                categoryGroups={categoryGroups}
                onNavigate={closeMenus}
                onMouseEnter={openProductsWithDelay}
                onMouseLeave={closeProductsWithDelay}
              />
            )}
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
          <Link
            href="/contact"
            className={navLinkClass(pathname === "/contact")}
          >
            Contact Us
          </Link>
        </div>

        <div className="flex items-center gap-4">
            {/* Search */}
            <button 
              onClick={() => setSearchOpen(true)}
              className="p-2 text-[#0A0A0A] dark:text-white hover:text-[#D4A017] transition duration-200" 
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
          <div className="relative" ref={userMenuRef}>
            {user ? (
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="hidden sm:block text-[#555555] dark:text-[#9A9A9A] hover:text-[#D4A017] transition duration-200 ease-in-out"
                aria-label="Account"
                aria-expanded={userDropdownOpen}
                aria-haspopup="menu"
              >
                <User size={20} />
              </button>
            ) : (
              <Link
                href="/login"
                className="hidden sm:block text-sm font-medium text-[#555555] dark:text-[#9A9A9A] hover:text-[#D4A017] transition duration-200 ease-in-out"
              >
                Sign In
              </Link>
            )}

            {userDropdownOpen && user && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#111111] border border-[#D4D4D4] dark:border-[#2A2A2A] shadow-xl rounded-md py-1 z-50">
                <div className="px-4 py-2 border-b border-[#D4D4D4] dark:border-[#2A2A2A]">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.user_metadata?.full_name || user.email}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                </div>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center px-4 py-2 text-sm text-[#D4A017] hover:bg-[#F5F5F5] dark:hover:bg-[#1F1F1F]"
                  >
                    <ShieldAlert size={14} className="mr-2" />
                    Admin Panel
                  </Link>
                )}
                <Link
                  href="/account"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center px-4 py-2 text-sm text-[#555555] dark:text-[#9A9A9A] hover:bg-[#F5F5F5] dark:hover:bg-[#1F1F1F] hover:text-[#D4A017]"
                >
                  <User size={14} className="mr-2" />
                  My Account
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-[#F5F5F5] dark:hover:bg-[#1F1F1F]"
                >
                  <LogOut size={14} className="mr-2" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
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
              <div className="py-3 border-b border-[#D4D4D4] dark:border-[#2A2A2A] space-y-4">
                {categoryGroups
                  .filter(
                    (g) => g.productLine === "kitchen" || g.productLine === "wardrobe"
                  )
                  .map((group) => (
                    <div key={group.productLine}>
                      <p className="text-[10px] tracking-[0.3em] uppercase text-[#D4A017] font-semibold mb-2">
                        {MOBILE_PRODUCT_LINE_LABELS[group.productLine]}
                      </p>
                      {group.categories.length > 0 ? (
                        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                          {group.categories.map((cat) => (
                            <Link
                              key={cat.slug}
                              href={`${MOBILE_PRODUCT_LINE_HREF[group.productLine]}?category=${encodeURIComponent(cat.name)}`}
                              onClick={closeMenus}
                              className="text-xs text-[#555555] dark:text-[#9A9A9A] hover:text-[#D4A017]"
                            >
                              {cat.name}{" "}
                              <span className="text-[#9A9A9A]">({cat.count})</span>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[#6B6B6B] dark:text-[#9A9A9A]">
                          Range coming soon —{" "}
                          <Link
                            href="/contact"
                            onClick={closeMenus}
                            className="text-[#D4A017]"
                          >
                            contact us
                          </Link>
                          .
                        </p>
                      )}
                    </div>
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
            <Link
              href="/contact"
              onClick={closeMenus}
              className={`py-3 text-sm border-b border-[#D4D4D4] dark:border-[#2A2A2A] hover:text-[#D4A017] transition duration-200 ease-in-out ${
                pathname === "/contact"
                  ? "text-[#D4A017]"
                  : "text-[#555555] dark:text-[#9A9A9A]"
              }`}
            >
              Contact Us
            </Link>
          </div>
        </div>
      )}

      {/* Search Overlay */}
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </nav>
  );
}
