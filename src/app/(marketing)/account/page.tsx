import { createClient, supabaseAdmin } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AccountTabs from './AccountTabs';

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/account');
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('full_name, email, created_at')
    .eq('id', user.id)
    .single();

  const { data: orders } = await supabaseAdmin
    .from('orders')
    .select(`
      id,
      created_at,
      total,
      status,
      order_items (
        id,
        variant_id,
        product_name,
        item_code,
        quantity,
        price_at_purchase
      )
    `)
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false });

  // product_reviews.product_id references product_variants.id (legacy column
  // name — see catalog-and-variants.md). Embed through the variant, which
  // carries name + item_code. The slug for the PDP link is derived from
  // item_code at runtime.
  const { data: reviews } = await supabaseAdmin
    .from('product_reviews')
    .select(`
      id,
      product_id,
      rating,
      title,
      review_text,
      approval_status,
      created_at,
      updated_at,
      product:product_variants(name, item_code)
    `)
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false });

  const { data: supportRequests } = await supabaseAdmin
    .from('support_requests')
    .select('id, order_id, reason, message, attachment_url, status, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

  // Build the "awaiting your review" list: distinct variants from delivered
  // orders that the customer hasn't reviewed yet. Reviews are per-variant, so
  // we dedupe on variant_id and skip any variant already present in `reviews`.
  const reviewedVariantIds = new Set(
    ((reviews as any[]) || []).map((r) => r.product_id)
  );
  const reviewableMap = new Map<
    string,
    { variantId: string; productName: string; itemCode: string; orderId: string; deliveredAt: string }
  >();
  for (const order of (orders as any[]) || []) {
    if (order.status !== 'delivered') continue;
    for (const item of order.order_items || []) {
      if (!item.variant_id) continue;
      if (reviewedVariantIds.has(item.variant_id)) continue;
      if (reviewableMap.has(item.variant_id)) continue;
      reviewableMap.set(item.variant_id, {
        variantId: item.variant_id,
        productName: item.product_name,
        itemCode: item.item_code,
        orderId: order.id,
        deliveredAt: order.created_at,
      });
    }
  }
  const reviewableItems = Array.from(reviewableMap.values());

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-serif text-3xl text-[#0A0A0A] dark:text-[#F5F5F5] mb-8">My Account</h1>
      <AccountTabs
        profile={profile || { full_name: null, email: user.email || '', created_at: user.created_at }}
        orders={(orders as any[]) || []}
        reviews={(reviews as any[]) || []}
        reviewableItems={reviewableItems}
        supportRequests={(supportRequests as any[]) || []}
        avatarUrl={avatarUrl}
      />
    </div>
  );
}
