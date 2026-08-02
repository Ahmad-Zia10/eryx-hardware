'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import ProductCard from '@/components/sections/ProductCard';
import { useWishlist } from '@/context/WishlistContext';
import type { DbProduct } from '@/lib/db/products';

interface WishlistGridProps {
  initialProducts: DbProduct[];
}

/**
 * Renders the saved products. The server provides the initial set; live
 * context state (savedIds) then drives removal — unhearting a card in place
 * drops it from the grid without a full page reload. New saves made elsewhere
 * this session won't appear until the next server fetch (router.refresh or
 * navigation), which is fine: this page is where you curate, not discover.
 */
export default function WishlistGrid({ initialProducts }: WishlistGridProps) {
  const { savedIds, hydrated } = useWishlist();

  // Once the context has hydrated, filter to what's still saved so in-place
  // unhearts vanish immediately. Before hydration, trust the server list.
  const visible = useMemo(() => {
    if (!hydrated) return initialProducts;
    return initialProducts.filter((p) => savedIds.has(p.id));
  }, [initialProducts, savedIds, hydrated]);

  if (visible.length === 0) {
    return (
      <div className="text-center py-20 flex flex-col items-center">
        <div className="w-16 h-16 bg-surface-sunken flex items-center justify-center mb-5">
          <Heart size={28} className="text-ink-faint" />
        </div>
        <p className="text-lg font-semibold text-ink">Your wishlist is empty</p>
        <p className="text-sm text-ink-muted mt-1 max-w-sm">
          Tap the heart on any product to save it here for later.
        </p>
        <Link
          href="/kitchen"
          className="mt-6 inline-flex items-center gap-2 bg-gold hover:bg-gold-bright text-on-gold font-semibold px-8 py-3 rounded-control transition duration-200 ease-in-out"
        >
          <ShoppingBag size={16} />
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {visible.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
