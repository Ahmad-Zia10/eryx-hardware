import { supabaseAdmin } from '@/lib/supabase/server';
import PromoCodesTable from './PromoCodesTable';

export const revalidate = 0;

export default async function AdminPromoCodesPage() {
  const { data: promoCodes } = await supabaseAdmin
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <PromoCodesTable promoCodes={promoCodes || []} />
    </div>
  );
}
