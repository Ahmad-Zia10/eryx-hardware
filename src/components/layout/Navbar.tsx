"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ChevronRight,
  Search,
  User,
  ShoppingCart,
  Heart,
  Menu,
  X,
  LogOut,
  ShieldAlert
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/context/CartContext";
import { useUI } from "@/context/UIContext";
import { useWishlist } from "@/context/WishlistContext";
import SearchOverlay from "./SearchOverlay";

// Kitchen/Wardrobe entries removed on purpose — both lines are reachable
// via Products (the category directory), the footer, and the home
// category strip.
const NAV_LINKS = [
  { label: "Deals", href: "/deals" },
  { label: "Blog", href: "/blog" },
];

// Mirrors react-router's <NavLink isActive> behavior — Next.js has no
// built-in equivalent, so we compare the current pathname ourselves.
function navLinkClass(isActive: boolean) {
  return `px-5 text-[13px] transition duration-200 ease-in-out hover:text-gold ${
    isActive ? "text-gold font-extrabold" : "text-ink"
  }`;
}

export default function Navbar() {
  const { cartCount } = useCart();
  const { openCartDrawer } = useUI();
  const { wishlistCount } = useWishlist();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
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
  };

  return (
    <nav className="sticky top-9.25 z-40 bg-surface border-b-2 border-line-strong relative">
      <div className="h-16 flex items-stretch">
        {/* Modernist: the logo lives in its own bordered compartment,
            a 2px rule splitting it from the nav — architectural, boxed. */}
        <Link
          href="/"
          className="flex items-center shrink-0 px-6 lg:px-[30px] border-r-2 border-line-strong"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/eryx-logo-transparent.png" alt="ERYX" className="h-8.5 object-contain" />
        </Link>

        <div className="hidden lg:flex items-center">
          <Link href="/" className={navLinkClass(pathname === "/")}>
            Home
          </Link>

          <Link href="/products" className={navLinkClass(pathname === "/products")}>
            Products
          </Link>

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
            Contact
          </Link>
        </div>

        {/* Modernist action cluster: full-height cells separated by short,
            centered 1px hairline rules (icon-height, floating). Cart is the
            red-filled cell flush to the right edge. */}
        <div className="flex items-stretch ml-auto">
            {/* Leading rule between the links region and the icon cluster. */}
            <span className="hidden sm:block self-center h-6 w-px bg-line" aria-hidden="true" />

            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center px-4 text-ink hover:text-gold transition duration-200"
              aria-label="Search"
            >
              <Search size={18} />
            </button>

            <span className="hidden sm:block self-center h-6 w-px bg-line" aria-hidden="true" />

          <div className="relative flex items-stretch" ref={userMenuRef}>
            {user ? (
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="hidden sm:flex items-center px-4 text-ink hover:text-gold transition duration-200 ease-in-out"
                aria-label="Account"
                aria-expanded={userDropdownOpen}
                aria-haspopup="menu"
              >
                <User size={18} />
              </button>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex items-center px-4 text-ink hover:text-gold transition duration-200 ease-in-out"
                aria-label="Sign in"
              >
                <User size={18} />
              </Link>
            )}

            {userDropdownOpen && user && (
              <div
                role="menu"
                className="absolute right-0 mt-3 w-64 bg-surface-raised border border-line shadow-[0_16px_48px_rgba(32,30,29,0.16)] rounded-card overflow-hidden z-50 origin-top-right animate-[dropdown_140ms_ease-out]"
              >
                {/* Identity header — gold-ringed avatar + name/email,
                    mirroring the account page's profile block. */}
                <div className="flex items-center gap-3 p-4 bg-surface-sunken border-b border-line">
                  <div className="w-11 h-11 shrink-0 bg-gold-tint text-gold-deep ring-1 ring-gold/30 flex items-center justify-center text-lg font-semibold uppercase">
                    {(user.user_metadata?.full_name || user.email || "?").charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">
                      {user.user_metadata?.full_name || user.email}
                    </p>
                    <p className="text-xs text-ink-muted truncate">{user.email}</p>
                  </div>
                </div>

                <div className="p-1.5">
                  {isAdmin && (
                    <Link
                      href="/admin"
                      role="menuitem"
                      onClick={() => setUserDropdownOpen(false)}
                      className="group/item flex items-center gap-3 px-3 py-2.5 text-sm text-gold-deep rounded-control hover:bg-gold-tint transition-colors duration-150"
                    >
                      <ShieldAlert size={16} className="shrink-0" />
                      <span className="flex-1 font-medium">Admin Panel</span>
                      <ChevronRight size={14} className="opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-150" />
                    </Link>
                  )}
                  <Link
                    href="/account"
                    role="menuitem"
                    onClick={() => setUserDropdownOpen(false)}
                    className="group/item flex items-center gap-3 px-3 py-2.5 text-sm text-ink-muted rounded-control hover:bg-surface-sunken hover:text-ink transition-colors duration-150"
                  >
                    <User size={16} className="shrink-0" />
                    <span className="flex-1">My Account</span>
                    <ChevronRight size={14} className="opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-150" />
                  </Link>
                  <Link
                    href="/wishlist"
                    role="menuitem"
                    onClick={() => setUserDropdownOpen(false)}
                    className="group/item flex items-center gap-3 px-3 py-2.5 text-sm text-ink-muted rounded-control hover:bg-surface-sunken hover:text-ink transition-colors duration-150"
                  >
                    <Heart size={16} className="shrink-0" />
                    <span className="flex-1">Wishlist</span>
                    <ChevronRight size={14} className="opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-150" />
                  </Link>

                  <div className="my-1.5 border-t border-line" />

                  <button
                    onClick={handleSignOut}
                    role="menuitem"
                    className="group/item flex w-full items-center gap-3 px-3 py-2.5 text-sm text-red-600 rounded-control hover:bg-red-500/10 transition-colors duration-150"
                  >
                    <LogOut size={16} className="shrink-0" />
                    <span className="flex-1 text-left">Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
            <span className="hidden sm:block self-center h-6 w-px bg-line" aria-hidden="true" />

          <Link
            href="/wishlist"
            className="relative flex items-center px-4 text-ink hover:text-gold transition duration-200 ease-in-out"
            aria-label="Wishlist"
          >
            <Heart size={18} />
            {wishlistCount > 0 && (
              <span className="absolute top-2.5 right-2 bg-gold text-on-gold text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-pill">
                {wishlistCount}
              </span>
            )}
          </Link>
            <span className="hidden sm:block self-center h-6 w-px bg-line" aria-hidden="true" />

          {/* Modernist: Cart is the one filled control in the bar — red fill,
              weight 800, count inline (poster-style). self-center + fixed
              height insets the red block vertically so it sits inline with
              the icons instead of stretching the full bar height. */}
          <button
            onClick={openCartDrawer}
            className="self-center flex items-center gap-2 h-11 px-5.5 bg-gold hover:bg-gold-bright text-on-gold font-extrabold text-[13px] transition duration-200 ease-in-out"
            aria-label="Cart"
          >
            <ShoppingCart size={17} />
            <span>Cart{cartCount > 0 ? ` · ${cartCount}` : ""}</span>
          </button>
          <button
            className="lg:hidden flex items-center pl-4 text-ink"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-line bg-surface">
          <div className="flex flex-col px-4 py-2">
            <Link
              href="/products"
              onClick={closeMenus}
              className={`py-3 text-sm border-b border-line hover:text-gold transition duration-200 ease-in-out ${
                pathname === "/products" ? "text-gold" : "text-ink-muted"
              }`}
            >
              Products
            </Link>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={closeMenus}
                className={`py-3 text-sm border-b border-line hover:text-gold transition duration-200 ease-in-out ${
                  pathname === link.href
                    ? "text-gold"
                    : "text-ink-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={closeMenus}
              className={`py-3 text-sm border-b border-line hover:text-gold transition duration-200 ease-in-out ${
                pathname === "/contact"
                  ? "text-gold"
                  : "text-ink-muted"
              }`}
            >
              Contact
            </Link>
          </div>
        </div>
      )}

      {/* Search Overlay */}
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </nav>
  );
}
