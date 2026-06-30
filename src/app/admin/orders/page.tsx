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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="mt-2 text-sm text-gray-600">Track and manage customer orders.</p>
      </div>

      <OrdersTable orders={orders || []} />
    </div>
  );
}
