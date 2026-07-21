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
  Heart,
  Menu,
  X,
  LogOut,
  ShieldAlert
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/context/ThemeContext";
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
  return `text-sm transition duration-200 ease-in-out hover:text-gold ${
    isActive ? "text-gold font-medium" : "text-ink-muted"
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
    <nav className="sticky top-9.25 z-40 bg-surface border-b border-line relative">
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
            onMouseEnter={openProductsWithDelay}
            onMouseLeave={closeProductsWithDelay}
          >
            <button
              onClick={() => setProductsOpen((open) => !open)}
              className="flex items-center gap-1 text-sm text-ink-muted transition duration-200 ease-in-out hover:text-gold"
            >
              Products <ChevronDown size={14} />
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
            Contact Us
          </Link>
        </div>

        <div className="flex items-center gap-4">
            {/* Search */}
            <button 
              onClick={() => setSearchOpen(true)}
              className="p-2 text-ink hover:text-gold transition duration-200" 
              aria-label="Search"
            >
              <Search size={20} />
            </button>
          <button
            onClick={toggleTheme}
            className="text-ink-muted hover:text-gold transition duration-200 ease-in-out"
            aria-label="Toggle theme"
          >
            {isDark ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <div className="relative" ref={userMenuRef}>
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
              <div className="absolute right-0 mt-2 w-48 bg-surface-raised border border-line shadow-xl rounded-md py-1 z-50">
                <div className="px-4 py-2 border-b border-line">
                  <p className="text-sm font-medium text-ink truncate">{user.user_metadata?.full_name || user.email}</p>
                  <p className="text-xs text-ink-muted truncate">{user.email}</p>
                </div>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center px-4 py-2 text-sm text-gold hover:bg-surface-sunken"
                  >
                    <ShieldAlert size={14} className="mr-2" />
                    Admin Panel
                  </Link>
                )}
                <Link
                  href="/account"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center px-4 py-2 text-sm text-ink-muted hover:bg-surface-sunken hover:text-gold"
                >
                  <User size={14} className="mr-2" />
                  My Account
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-surface-sunken"
                >
                  <LogOut size={14} className="mr-2" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
          <Link
            href="/wishlist"
            className="relative text-ink-muted hover:text-gold transition duration-200 ease-in-out"
            aria-label="Wishlist"
          >
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold text-on-gold text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-pill">
                {wishlistCount}
              </span>
            )}
          </Link>
          <button
            onClick={openCartDrawer}
            className="relative text-ink-muted hover:text-gold transition duration-200 ease-in-out"
            aria-label="Cart"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold text-on-gold text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-pill">
                {cartCount}
              </span>
            )}
          </button>
          <button
            className="lg:hidden text-ink"
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
                    (g) => g.productLine === "kitchen" || g.productLine === "wardrobe"
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
