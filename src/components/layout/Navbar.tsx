"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ChevronDown,
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
import ProductsMegaMenu from "./ProductsMegaMenu";
import type { CategoryGroup, ProductLine } from "@/lib/db/categories";

// Kitchen/Wardrobe entries removed on purpose — they duplicated the
// Products mega-menu (which groups by product line) and crowded the
// bar. Both remain reachable via Products, the footer, and the home
// category strip.
const NAV_LINKS = [
  { label: "Deals", href: "/deals" },
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
  hardware: "/hardware",
};

// Mirrors react-router's <NavLink isActive> behavior — Next.js has no
// built-in equivalent, so we compare the current pathname ourselves.
function navLinkClass(isActive: boolean) {
  return `text-sm transition duration-200 ease-in-out hover:text-gold ${
    isActive ? "text-gold font-bold" : "text-ink"
  }`;
}

export default function Navbar({
  categoryGroups = [],
}: {
  categoryGroups?: CategoryGroup[];
}) {
  const { cartCount } = useCart();
  const { openCartDrawer } = useUI();
  const { wishlistCount } = useWishlist();
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
    <nav className="sticky top-9.25 z-40 bg-surface border-b-2 border-line-strong relative">
      <div className="max-w-7xl mx-auto pr-4 sm:pr-6 lg:pr-8 h-16 flex items-center justify-between">
        {/* Modernist: the logo lives in its own bordered compartment,
            a 2px rule splitting it from the nav — architectural, boxed. */}
        <Link
          href="/"
          className="flex items-center gap-2 shrink-0 self-stretch px-4 sm:px-6 lg:px-8 border-r-2 border-line-strong"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/eryx-logo-transparent.png" alt="ERYX" className="h-12 object-contain" />
        </Link>

        <div className="hidden lg:flex items-center gap-8 pl-2">
          <Link href="/" className={navLinkClass(pathname === "/")}>
            Home
          </Link>

          <div
            onMouseEnter={openProductsWithDelay}
            onMouseLeave={closeProductsWithDelay}
          >
            <button
              onClick={() => setProductsOpen((open) => !open)}
              className="text-sm text-ink transition duration-200 ease-in-out hover:text-gold"
            >
              Products
            </button>
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
            Contact
          </Link>
        </div>

        <div className="flex items-center">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="px-3 text-ink hover:text-gold transition duration-200"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Modernist: 2px rules compartmentalize the icon cluster. */}
            <span className="hidden sm:block h-6 w-px bg-line-strong" aria-hidden="true" />

          <div className="relative px-3 flex items-center" ref={userMenuRef}>
            {user ? (
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="hidden sm:block text-ink-muted hover:text-gold transition duration-200 ease-in-out"
                aria-label="Account"
                aria-expanded={userDropdownOpen}
                aria-haspopup="menu"
              >
                <User size={20} />
              </button>
            ) : (
              <Link
                href="/login"
                className="hidden sm:block text-sm font-medium text-ink-muted hover:text-gold transition duration-200 ease-in-out"
              >
                Sign In
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
            {/* Modernist: 2px rule between account and wishlist. */}
            <span className="hidden sm:block h-6 w-px bg-line-strong" aria-hidden="true" />

          <Link
            href="/wishlist"
            className="relative px-3 text-ink-muted hover:text-gold transition duration-200 ease-in-out"
            aria-label="Wishlist"
          >
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span className="absolute top-0 right-0 bg-gold text-on-gold text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-pill">
                {wishlistCount}
              </span>
            )}
          </Link>
          {/* Modernist: Cart is the one filled control in the bar —
              red fill, weight 800, count inline (poster-style) rather
              than a floating badge. */}
          <button
            onClick={openCartDrawer}
            className="relative flex items-center gap-2 ml-3 bg-gold hover:bg-gold-bright text-on-gold font-extrabold text-sm px-4 py-2 transition duration-200 ease-in-out"
            aria-label="Cart"
          >
            <ShoppingCart size={18} />
            <span className="hidden sm:inline">Cart{cartCount > 0 ? ` · ${cartCount}` : ""}</span>
            {cartCount > 0 && (
              <span className="sm:hidden absolute -top-1.5 -right-1.5 bg-ink text-brand-cream text-[10px] font-bold w-4 h-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          <button
            className="lg:hidden text-ink ml-3"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Desktop-only mega menu — rendered at nav level (not inside the button's
          wrapper) so its absolute positioning binds to <nav>. This keeps the
          panel centered within the max-w-7xl content area on wide viewports
          instead of getting clipped when anchored to the narrow Products
          trigger. */}
      {productsOpen && (
        <div
          className="hidden lg:block"
          onMouseEnter={openProductsWithDelay}
          onMouseLeave={closeProductsWithDelay}
        >
          <ProductsMegaMenu
            categoryGroups={categoryGroups}
            onNavigate={closeMenus}
            onMouseEnter={openProductsWithDelay}
            onMouseLeave={closeProductsWithDelay}
          />
        </div>
      )}

      {mobileOpen && (
        <div className="lg:hidden border-t border-line bg-surface">
          <div className="flex flex-col px-4 py-2">
            <button
              onClick={() => setProductsOpen((open) => !open)}
              className="flex items-center justify-between py-3 text-sm border-b border-line text-ink-muted"
            >
              Products{" "}
              <ChevronDown size={14} className={productsOpen ? "rotate-180" : ""} />
            </button>
            {productsOpen && (
              <div className="py-3 border-b border-line space-y-4">
                {categoryGroups
                  .filter(
                    (g) =>
                      g.productLine === "kitchen" ||
                      g.productLine === "wardrobe" ||
                      g.productLine === "hardware"
                  )
                  .map((group) => (
                    <div key={group.productLine}>
                      <p className="text-[10px] tracking-[0.3em] uppercase text-gold font-semibold mb-2">
                        {MOBILE_PRODUCT_LINE_LABELS[group.productLine]}
                      </p>
                      {group.categories.length > 0 ? (
                        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                          {group.categories.map((cat) => (
                            <Link
                              key={cat.slug}
                              href={`${MOBILE_PRODUCT_LINE_HREF[group.productLine]}?category=${encodeURIComponent(cat.name)}`}
                              onClick={closeMenus}
                              className="text-xs text-ink-muted hover:text-gold"
                            >
                              {cat.name}{" "}
                              <span className="text-ink-faint">({cat.count})</span>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-ink-muted">
                          Range coming soon —{" "}
                          <Link
                            href="/contact"
                            onClick={closeMenus}
                            className="text-gold"
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
