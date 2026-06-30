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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Products Management</h1>
        <p className="mt-2 text-sm text-gray-600">Update pricing, visibility, and features for all catalogue items.</p>
      </div>

      <ProductsTable products={products || []} />
    </div>
  );
}
