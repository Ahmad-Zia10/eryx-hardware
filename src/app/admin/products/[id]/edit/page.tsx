import { supabaseAdmin } from '@/lib/supabase/server';
import ProductEditForm from './ProductEditForm';
import { notFound } from 'next/navigation';

export const revalidate = 0;

export default async function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { data: product } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', resolvedParams.id)
    .single();

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Product: {product.item_code}</h1>
        <p className="mt-1 text-sm text-gray-500">{product.name}</p>
      </div>

      <ProductEditForm product={product} />
    </div>
  );
}
