import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getProductsByVariantIds } from '@/lib/db/products';
import WishlistGrid from './WishlistGrid';

export const metadata = {
  title: 'My Wishlist — Eryx Hardware',
};

export default async function WishlistPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/wishlist');
  }

  // Read the saved variant ids through the authed client (RLS scopes to the
  // caller). Newest-first — matches the account/nav ordering.
  const { data: rows } = await supabase
    .from('wishlist_items')
    .select('variant_id')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false });

  const variantIds = (rows || []).map((r) => r.variant_id);
  const products = await getProductsByVariantIds(variantIds);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-ink">My Wishlist</h1>
        <p className="text-sm text-ink-muted mt-1">
          {products.length > 0
            ? `${products.length} saved ${products.length === 1 ? 'item' : 'items'}`
            : 'Items you save will appear here.'}
        </p>
      </div>
      <WishlistGrid initialProducts={products} />
    </div>
  );
}
