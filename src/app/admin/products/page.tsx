import { supabaseAdmin } from '@/lib/supabase/server';
import ProductsTable from './ProductsTable';

export const revalidate = 0;

export default async function AdminProductsPage() {
  // Fetch parent products with all their variants and images.
  // The admin table shows one row per parent and expands to show variants.
  const { data: parents } = await supabaseAdmin
    .from('products')
    .select(`
      id, name, description, category, product_line, is_featured, is_active,
      product_variants!product_variants_product_id_fkey(
        id, item_code, catalogue_sno, name, finish, dimension_notes,
        mrp, is_on_sale, discount_price, is_featured, is_active,
        is_default, external_price_url,
        product_images(id, image_url, display_order, is_primary)
      )
    `)
    .order('name', { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl text-[#F5F5F5]">Products Management</h1>
          <p className="text-sm text-[#9A9A9A] mt-1">Manage products and their variants.</p>
        </div>
      </div>

      <ProductsTable products={parents || []} />
    </div>
  );
}
