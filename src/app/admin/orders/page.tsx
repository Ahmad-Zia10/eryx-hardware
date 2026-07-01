import { supabaseAdmin } from '@/lib/supabase/server';
import OrdersTable from './OrdersTable';

export const revalidate = 0;

export default async function AdminOrdersPage() {
  const { data: orders } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*)')
    .order('needs_review', { ascending: false })
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl text-[#F5F5F5]">Orders</h1>
          <p className="text-sm text-[#9A9A9A] mt-1">Track and manage customer orders.</p>
        </div>
      </div>

      <OrdersTable orders={orders || []} />
    </div>
  );
}
