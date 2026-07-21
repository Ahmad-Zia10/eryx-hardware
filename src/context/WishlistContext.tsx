"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface WishlistContextValue {
  /** Set of saved variant IDs. Empty when logged out or not yet hydrated. */
  savedIds: Set<string>;
  isWishlisted: (variantId: string) => boolean;
  /** Toggle a variant. Logged-out callers are routed to sign in. */
  toggle: (variantId: string) => void;
  wishlistCount: number;
  isLoggedIn: boolean;
  hydrated: boolean;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const loadWishlist = useCallback(async () => {
    try {
      const res = await fetch("/api/wishlist");
      if (!res.ok) {
        // 401 = logged out; treat as empty, not an error.
        setSavedIds(new Set());
        return;
      }
      const data = await res.json();
      setSavedIds(new Set<string>(data.variantIds || []));
    } catch (e) {
      console.error("Failed to load wishlist", e);
      setSavedIds(new Set());
    }
  }, []);

  // Determine auth state on mount and keep it in sync. Hydrate the wishlist
  // whenever the user is (or becomes) logged in; clear it on sign-out.
  useEffect(() => {
    let active = true;

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;
      if (user) {
        setIsLoggedIn(true);
        await loadWishlist();
      }
      setHydrated(true);
    };
    init();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        setIsLoggedIn(true);
        loadWishlist();
      } else if (event === "SIGNED_OUT") {
        setIsLoggedIn(false);
        setSavedIds(new Set());
      }
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase, loadWishlist]);

  const isWishlisted = useCallback(
    (variantId: string) => savedIds.has(variantId),
    [savedIds]
  );

  const toggle = useCallback(
    (variantId: string) => {
      if (!isLoggedIn) {
        // Send them to sign in, returning to where they were.
        const next = encodeURIComponent(pathname || "/");
        router.push(`/login?next=${next}`);
        return;
      }

      const currentlySaved = savedIds.has(variantId);
      const method = currentlySaved ? "DELETE" : "POST";

      // Optimistic update — flip immediately, roll back on failure.
      setSavedIds((prev) => {
        const nextSet = new Set(prev);
        if (currentlySaved) nextSet.delete(variantId);
        else nextSet.add(variantId);
        return nextSet;
      });

      fetch("/api/wishlist", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variant_id: variantId }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("request failed");
        })
        .catch(() => {
          // Roll back to the pre-toggle state.
          setSavedIds((prev) => {
            const nextSet = new Set(prev);
            if (currentlySaved) nextSet.add(variantId);
            else nextSet.delete(variantId);
            return nextSet;
          });
        });
    },
    [isLoggedIn, savedIds, pathname, router]
  );

  return (
    <WishlistContext.Provider
      value={{
        savedIds,
        isWishlisted,
        toggle,
        wishlistCount: savedIds.size,
        isLoggedIn,
        hydrated,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
