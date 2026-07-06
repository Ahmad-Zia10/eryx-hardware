import { supabaseAdmin } from '@/lib/supabase/server';
import { formatPrice } from '@/lib/catalogue-data';

export const revalidate = 0;

export default async function AdminPromoCodesPage() {
  const { data: promoCodes } = await supabaseAdmin
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl text-[#F5F5F5]">Promo Codes</h1>
          <p className="text-sm text-[#9A9A9A] mt-1">Manage discount codes for customers.</p>
        </div>
        <button className="bg-[#D4A017] hover:bg-[#B8860B] text-[#0A0A0A] font-semibold px-4 py-2 rounded-sm transition">
          Create Promo Code
        </button>
      </div>

      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#F5F5F5]">
            <thead className="bg-[#111111] text-[#9A9A9A] border-b border-[#2A2A2A]">
              <tr>
                <th className="px-6 py-4 font-medium whitespace-nowrap">Code</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Value</th>
                <th className="px-6 py-4 font-medium">Min Order</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Expires At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A]">
              {!promoCodes || promoCodes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[#9A9A9A]">
                    No promo codes found. Create one to get started.
                  </td>
                </tr>
              ) : (
                promoCodes.map((promo) => (
                  <tr key={promo.id} className="hover:bg-[#222222] transition-colors">
                    <td className="px-6 py-4 font-semibold text-[#D4A017]">
                      {promo.code}
                    </td>
                    <td className="px-6 py-4 capitalize">
                      {promo.discount_type}
                    </td>
                    <td className="px-6 py-4">
                      {promo.discount_type === 'fixed'
                        ? formatPrice(promo.discount_value)
                        : `${promo.discount_value}%`}
                    </td>
                    <td className="px-6 py-4">
                      {promo.min_order_value > 0
                        ? formatPrice(promo.min_order_value)
                        : 'None'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-sm text-xs font-semibold ${promo.is_active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {promo.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#9A9A9A]">
                      {promo.expires_at ? new Date(promo.expires_at).toLocaleDateString() : 'Never'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
