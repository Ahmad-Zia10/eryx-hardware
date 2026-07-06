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
        product_name,
        item_code,
        quantity,
        price_at_purchase
      )
    `)
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false });

  const { data: reviews } = await supabaseAdmin
    .from('product_reviews')
    .select(`
      id,
      rating,
      review_text,
      approval_status,
      created_at,
      product:products(name, item_code)
    `)
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false });

  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-serif text-3xl text-[#0A0A0A] dark:text-[#F5F5F5] mb-8">My Account</h1>
      <AccountTabs
        profile={profile || { full_name: null, email: user.email || '', created_at: user.created_at }}
        orders={(orders as any[]) || []}
        reviews={(reviews as any[]) || []}
        avatarUrl={avatarUrl}
      />
    </div>
  );
}
