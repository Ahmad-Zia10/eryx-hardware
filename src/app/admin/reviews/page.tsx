import { supabaseAdmin } from '@/lib/supabase/server';
import ReviewsTable from './ReviewsTable';

export const revalidate = 0;

export default async function AdminReviewsPage() {
  const { data: reviews } = await supabaseAdmin
    .from('product_reviews')
    .select('id, product_id, customer_id, rating, review_text, created_at, approval_status')
    .eq('approval_status', 'pending')
    .order('created_at', { ascending: false });

  const productIds = [...new Set(reviews?.map((review) => review.product_id).filter(Boolean) || [])];
  const customerIds = [...new Set(reviews?.map((review) => review.customer_id).filter(Boolean) || [])];

  const [{ data: products }, { data: profiles }] = await Promise.all([
    productIds.length > 0
      ? supabaseAdmin.from('product_variants').select('id, name').in('id', productIds)
      : Promise.resolve({ data: [] }),
    customerIds.length > 0
      ? supabaseAdmin.from('profiles').select('id, email, full_name').in('id', customerIds)
      : Promise.resolve({ data: [] }),
  ]);

  const productMap = new Map((products || []).map((product) => [product.id, product]));
  const profileMap = new Map((profiles || []).map((profile) => [profile.id, profile]));

  const enrichedReviews = (reviews || []).map((review) => {
    const product = productMap.get(review.product_id);
    const profile = profileMap.get(review.customer_id);

    return {
      ...review,
      product_name: product?.name || 'Unknown Product',
      reviewer_email: profile?.email || 'Unknown',
      reviewer_name: profile?.full_name || 'Unknown',
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl text-[#F5F5F5]">Reviews</h1>
          <p className="text-sm text-[#9A9A9A] mt-1">Moderate customer product reviews before they appear publicly.</p>
        </div>
      </div>

      <ReviewsTable reviews={enrichedReviews} />
    </div>
  );
}
