import { supabaseAdmin } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function AdminDashboard() {
  const [
    { count: productCount },
    { count: newEnquiryCount },
    { count: pendingOrderCount },
    { count: needsReviewCount },
    { data: revenueData },
  ] = await Promise.all([
    supabaseAdmin.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabaseAdmin.from('enquiries').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('needs_review', true),
    supabaseAdmin.from('orders').select('total').eq('status', 'paid'),
  ]);

  const totalRevenue = revenueData?.reduce((sum, order) => sum + Number(order.total), 0) || 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-2 text-sm text-gray-600">High-level metrics for Eryx Hardware operations.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-xl p-6 border border-gray-100">
          <dt className="text-sm font-medium text-gray-500 truncate">Active Products</dt>
          <dd className="mt-2 text-3xl font-semibold text-gray-900">{productCount || 0}</dd>
        </div>

        <div className={`bg-white overflow-hidden shadow rounded-xl p-6 border ${newEnquiryCount && newEnquiryCount > 0 ? 'border-[#D4A017] ring-1 ring-[#D4A017]' : 'border-gray-100'}`}>
          <dt className="text-sm font-medium text-gray-500 truncate">New Enquiries</dt>
          <dd className="mt-2 flex items-baseline">
            <span className={`text-3xl font-semibold ${newEnquiryCount && newEnquiryCount > 0 ? 'text-[#D4A017]' : 'text-gray-900'}`}>
              {newEnquiryCount || 0}
            </span>
          </dd>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-xl p-6 border border-gray-100">
          <dt className="text-sm font-medium text-gray-500 truncate">Pending Orders</dt>
          <dd className="mt-2 text-3xl font-semibold text-gray-900">{pendingOrderCount || 0}</dd>
        </div>

        <div className={`bg-white overflow-hidden shadow rounded-xl p-6 border ${needsReviewCount && needsReviewCount > 0 ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-100'}`}>
          <dt className="text-sm font-medium text-gray-500 truncate">Orders Needing Review</dt>
          <dd className="mt-2 text-3xl font-semibold text-red-600">{needsReviewCount || 0}</dd>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-xl p-6 border border-gray-100 sm:col-span-2 lg:col-span-4">
           <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue (Paid)</dt>
           <dd className="mt-2 text-3xl font-semibold text-green-600">
             ₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
           </dd>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium text-gray-900">Quick Links</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link href="/admin/products" className="relative flex items-center space-x-3 rounded-xl border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-[#D4A017] hover:ring-1 hover:ring-[#D4A017]">
            <div className="min-w-0 flex-1">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900">Manage Products</p>
              <p className="text-sm text-gray-500 truncate">Update pricing and visibility</p>
            </div>
          </Link>
          <Link href="/admin/enquiries" className="relative flex items-center space-x-3 rounded-xl border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-[#D4A017] hover:ring-1 hover:ring-[#D4A017]">
            <div className="min-w-0 flex-1">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900">View Enquiries</p>
              <p className="text-sm text-gray-500 truncate">Respond to customer requests</p>
            </div>
          </Link>
          <Link href="/admin/orders" className="relative flex items-center space-x-3 rounded-xl border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-[#D4A017] hover:ring-1 hover:ring-[#D4A017]">
            <div className="min-w-0 flex-1">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900">Process Orders</p>
              <p className="text-sm text-gray-500 truncate">Fulfill and track shipments</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
