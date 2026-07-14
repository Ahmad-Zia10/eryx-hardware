'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cancelStockNotification } from '@/app/admin/actions';

type Row = {
  id: string;
  email: string;
  status: 'pending' | 'notified' | 'cancelled';
  created_at: string;
  customer_id: string | null;
  notified_at: string | null;
  variant: {
    id: string;
    item_code: string;
    name: string;
    stock_quantity: number;
    track_inventory: boolean;
  } | null;
};

function statusChipClass(status: Row['status']) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30';
    case 'notified':
      return 'bg-green-500/10 text-green-400 border-green-500/30';
    case 'cancelled':
      return 'bg-[#2A2A2A]/40 text-[#9A9A9A] border-[#2A2A2A]';
  }
}

export default function NotifyMeTable({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async (id: string) => {
    if (!window.confirm('Cancel this notify-me signup?')) return;
    setBusyId(id);
    setError(null);
    const result = await cancelStockNotification(id);
    setBusyId(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  };

  return (
    <div className="w-full border border-[#2A2A2A] rounded-sm overflow-hidden bg-[#0A0A0A]">
      {error && (
        <div className="px-6 py-3 text-sm text-red-400 border-b border-[#2A2A2A] bg-red-500/5">
          {error}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#2A2A2A]">
          <thead className="bg-[#1A1A1A] border-b border-[#2A2A2A]">
            <tr>
              <th className="px-6 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Variant</th>
              <th className="px-6 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Email</th>
              <th className="px-6 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Current Stock</th>
              <th className="px-6 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Status</th>
              <th className="px-6 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Subscribed</th>
              <th className="px-6 py-3 text-right text-xs tracking-widest uppercase text-[#9A9A9A]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A2A2A]">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-[#9A9A9A]">
                  No signups yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const stock = row.variant?.stock_quantity ?? 0;
                const backInStock = row.variant?.track_inventory && stock > 0;
                return (
                  <tr key={row.id} className="hover:bg-[#1A1A1A] transition-colors">
                    <td className="px-6 py-4">
                      {row.variant ? (
                        <>
                          <div className="text-sm font-medium text-[#F5F5F5]">
                            {row.variant.name}
                          </div>
                          <div className="text-xs text-[#9A9A9A] font-mono mt-0.5">
                            {row.variant.item_code}
                          </div>
                        </>
                      ) : (
                        <span className="text-xs text-[#555555]">Variant deleted</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#F5F5F5]">
                      {row.email}
                      {row.customer_id && (
                        <div className="text-[10px] text-[#9A9A9A] uppercase tracking-widest mt-0.5">
                          Registered
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {row.variant?.track_inventory === false ? (
                        <span className="text-[#555555] text-xs">Not tracked</span>
                      ) : (
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-sm border ${
                            backInStock
                              ? 'bg-green-500/10 text-green-400 border-green-500/30'
                              : 'bg-red-500/10 text-red-400 border-red-500/30'
                          }`}
                        >
                          {stock}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-sm border ${statusChipClass(row.status)}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#9A9A9A]">
                      {new Date(row.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {row.status === 'pending' ? (
                        <button
                          type="button"
                          onClick={() => handleCancel(row.id)}
                          disabled={busyId === row.id}
                          className="text-xs text-[#9A9A9A] hover:text-red-400 disabled:opacity-50"
                        >
                          {busyId === row.id ? 'Cancelling…' : 'Cancel'}
                        </button>
                      ) : (
                        <span className="text-xs text-[#555555]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
