import { supabaseAdmin } from '@/lib/supabase/server';
import ReviewsTable from './ReviewsTable';

export const revalidate = 0;

export default async function AdminReviewsPage() {
  const { data: reviews } = await supabaseAdmin
    .from('product_reviews')
    .select(`
      id,
      rating,
      review_text,
      created_at,
      product:products(name),
      customer:profiles!customer_id(email)
    `)
    .eq('approval_status', 'pending')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl text-[#F5F5F5]">Reviews</h1>
          <p className="text-sm text-[#9A9A9A] mt-1">Moderate customer product reviews before they appear publicly.</p>
        </div>
      </div>

      <ReviewsTable reviews={(reviews as any[]) || []} />
    </div>
  );
}
