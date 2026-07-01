'use client';

import { useState } from 'react';
import { updateOrderStatus } from '@/app/admin/actions';
import { useRouter } from 'next/navigation';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function OrdersTable({ orders: initialOrders }: { orders: any[] }) {
  const router = useRouter();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [orders, setOrders] = useState(initialOrders);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    // Optimistic update
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    setUpdatingId(orderId);

    try {
      await updateOrderStatus(orderId, newStatus);
      router.refresh(); 
    } catch (err) {
      console.error('Failed to update order:', err);
      alert('Failed to update order status');
      router.refresh(); // Revert optimistic update
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="w-full border border-[#2A2A2A] rounded-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#2A2A2A]">
          <thead className="bg-[#1A1A1A] border-b border-[#2A2A2A]">
            <tr>
              <th className="px-4 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Order Info</th>
              <th className="px-4 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Customer</th>
              <th className="px-4 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Items</th>
              <th className="px-4 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Total</th>
              <th className="px-4 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Status</th>
              <th className="px-4 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Action</th>
            </tr>
          </thead>
          <tbody className="bg-[#0A0A0A] divide-y divide-[#2A2A2A]">
            {orders.map((order) => {
              const itemsCount = order.order_items?.length || 0;
              const firstItem = order.order_items?.[0];
              const summary = itemsCount > 1 
                ? `${itemsCount} items — ${firstItem?.product_name}, ...`
                : `${itemsCount} item — ${firstItem?.product_name || 'Unknown'}`;

              return (
                <tr key={order.id} className="hover:bg-[#1A1A1A] transition duration-150 ease-in-out">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-mono text-[#F5F5F5]">{order.id.split('-')[0]}...</div>
                    <div className="text-xs text-[#9A9A9A]">{new Date(order.created_at).toLocaleDateString()}</div>
                    {order.needs_review && (
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/30">
                          ⚠ Review
                        </span>
                        {order.review_note && (
                          <div className="text-xs text-red-400 mt-1 max-w-[150px] truncate" title={order.review_note}>
                            {order.review_note}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-[#F5F5F5]">{order.customer_name}</div>
                    <div className="text-sm text-[#9A9A9A]">{order.email}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#F5F5F5]">
                    {summary}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-[#F5F5F5]">
                    ₹{order.total}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      disabled={updatingId === order.id}
                      className={`w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-3 py-1.5 focus:border-[#D4A017] focus:outline-none rounded-sm transition duration-200 ease-in-out cursor-pointer ${updatingId === order.id ? 'opacity-50' : ''}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="failed">Failed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#9A9A9A]">No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
