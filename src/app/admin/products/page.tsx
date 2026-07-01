import { supabaseAdmin } from '@/lib/supabase/server';
import ProductsTable from './ProductsTable';

export const revalidate = 0; // Ensure fresh data for admin

export default async function AdminProductsPage() {
  const { data: products } = await supabaseAdmin
    .from('products')
    .select('*')
    .order('catalogue_sno', { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl text-[#F5F5F5]">Products Management</h1>
          <p className="text-sm text-[#9A9A9A] mt-1">Update pricing, visibility, and features for all catalogue items.</p>
        </div>
      </div>

      <ProductsTable products={products || []} />
    </div>
  );
}
