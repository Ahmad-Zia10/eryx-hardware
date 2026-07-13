'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/catalogue-data';
import { updatePromoCodeStatus } from '@/app/admin/actions';
import AddPromoCodeModal from './AddPromoCodeModal';
import { Toggle } from '@/components/ui/Toggle';

export default function PromoCodesTable({ promoCodes }: { promoCodes: any[] }) {
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setLoadingId(id);
    try {
      await updatePromoCodeStatus(id, !currentStatus);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl text-[#F5F5F5]">Promo Codes</h1>
          <p className="text-sm text-[#9A9A9A] mt-1">Manage discount codes for customers.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#D4A017] hover:bg-[#E8B820] text-[#0A0A0A] font-semibold px-4 py-2.5 text-sm transition duration-200 ease-in-out rounded-sm"
        >
          Create Promo Code
        </button>
      </div>

      <div className="w-full border border-[#2A2A2A] rounded-sm overflow-hidden bg-[#0A0A0A]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#2A2A2A]">
            <thead className="bg-[#1A1A1A] border-b border-[#2A2A2A]">
              <tr>
                <th className="px-6 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Code</th>
                <th className="px-6 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Type</th>
                <th className="px-6 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Value</th>
                <th className="px-6 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Min Order</th>
                <th className="px-6 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Expires At</th>
                <th className="px-6 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Public</th>
                <th className="px-6 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A]">
              {!promoCodes || promoCodes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[#9A9A9A]">
                    No promo codes found. Create one to get started.
                  </td>
                </tr>
              ) : (
                promoCodes.map((promo) => (
                  <tr key={promo.id} className="hover:bg-[#1A1A1A] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#D4A017]">{promo.code}</div>
                      {promo.description && (
                        <div className="text-xs text-[#9A9A9A] mt-0.5">{promo.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 capitalize text-[#F5F5F5] text-sm">
                      {promo.discount_type}
                    </td>
                    <td className="px-6 py-4 text-[#F5F5F5] text-sm">
                      {promo.discount_type === 'fixed'
                        ? formatPrice(promo.discount_value)
                        : `${promo.discount_value}%`}
                    </td>
                    <td className="px-6 py-4 text-[#F5F5F5] text-sm">
                      {promo.min_order_value > 0
                        ? formatPrice(promo.min_order_value)
                        : 'None'}
                    </td>
                    <td className="px-6 py-4 text-[#9A9A9A] text-sm">
                      {promo.expires_at ? new Date(promo.expires_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4">
                      {promo.is_public ? (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-sm bg-[#D4A017]/10 text-[#D4A017] border border-[#D4A017]/30">
                          Yes
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-sm bg-[#2A2A2A]/40 text-[#9A9A9A] border border-[#2A2A2A]">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className={loadingId === promo.id ? 'opacity-50 pointer-events-none' : ''}>
                        <Toggle
                          checked={promo.is_active}
                          onChange={() => handleToggleStatus(promo.id, promo.is_active)}
                          label=""
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <AddPromoCodeModal 
          onClose={() => setIsAddModalOpen(false)} 
          onSuccess={() => {
            setIsAddModalOpen(false);
            router.refresh();
          }} 
        />
      )}
    </>
  );
}
