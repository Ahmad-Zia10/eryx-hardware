import { supabaseAdmin } from '@/lib/supabase/server';
import Link from 'next/link';

import { Package, MessageSquare, Clock, AlertTriangle, TrendingUp } from 'lucide-react';

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl text-[#F5F5F5]">Dashboard Overview</h1>
          <p className="text-sm text-[#9A9A9A] mt-1">High-level metrics for Eryx Hardware operations.</p>
        </div>
        <div className="flex gap-3"></div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-[#141414] border border-[#2A2A2A] rounded-sm p-6 hover:-translate-y-1 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <dt className="text-xs tracking-widest uppercase text-[#9A9A9A] mt-1">Active Products</dt>
            <Package className="h-5 w-5 text-[#9A9A9A]" />
          </div>
          <dd className="mt-2 text-3xl font-bold text-[#F5F5F5] font-serif">{productCount || 0}</dd>
        </div>

        <div className={`bg-[#141414] border rounded-sm p-6 hover:-translate-y-1 hover:shadow-md transition-all duration-200 ${newEnquiryCount && newEnquiryCount > 0 ? 'border-[#D4A017]' : 'border-[#2A2A2A]'}`}>
          <div className="flex items-center justify-between">
            <dt className="text-xs tracking-widest uppercase text-[#9A9A9A] mt-1">New Enquiries</dt>
            <MessageSquare className={`h-5 w-5 ${newEnquiryCount && newEnquiryCount > 0 ? 'text-[#D4A017]' : 'text-[#9A9A9A]'}`} />
          </div>
          <dd className="mt-2 flex items-baseline">
            <span className={`text-3xl font-bold font-serif ${newEnquiryCount && newEnquiryCount > 0 ? 'text-[#D4A017]' : 'text-[#F5F5F5]'}`}>
              {newEnquiryCount || 0}
            </span>
          </dd>
        </div>

        <div className="bg-[#141414] border border-[#2A2A2A] rounded-sm p-6 hover:-translate-y-1 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <dt className="text-xs tracking-widest uppercase text-[#9A9A9A] mt-1">Pending Orders</dt>
            <Clock className="h-5 w-5 text-[#9A9A9A]" />
          </div>
          <dd className="mt-2 text-3xl font-bold text-[#F5F5F5] font-serif">{pendingOrderCount || 0}</dd>
        </div>

        <div className={`rounded-sm p-6 border hover:-translate-y-1 hover:shadow-md transition-all duration-200 ${needsReviewCount && needsReviewCount > 0 ? 'bg-red-500/5 border-red-500/30' : 'bg-[#141414] border-[#2A2A2A]'}`}>
          <div className="flex items-center justify-between">
            <dt className="text-xs tracking-widest uppercase text-[#9A9A9A] mt-1">Orders Needing Review</dt>
            <AlertTriangle className={`h-5 w-5 ${needsReviewCount && needsReviewCount > 0 ? 'text-red-400' : 'text-[#9A9A9A]'}`} />
          </div>
          <dd className={`mt-2 text-3xl font-bold font-serif ${needsReviewCount && needsReviewCount > 0 ? 'text-red-400' : 'text-[#F5F5F5]'}`}>{needsReviewCount || 0}</dd>
        </div>

        <div className="bg-[#141414] border border-[#2A2A2A] rounded-sm p-6 sm:col-span-2 lg:col-span-4 hover:-translate-y-1 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <dt className="text-xs tracking-widest uppercase text-[#9A9A9A] mt-1">Total Revenue (Paid)</dt>
            <TrendingUp className="h-5 w-5 text-green-400" />
          </div>
          <dd className="mt-2 text-3xl font-bold text-[#F5F5F5] font-serif">
            ₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </dd>
        </div>
      </div>

      <div>
        <h2 className="font-serif text-lg text-[#F5F5F5]">Quick Links</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link href="/admin/products" className="relative flex items-center space-x-3 rounded-sm border border-[#2A2A2A] bg-[#141414] px-6 py-5 hover:border-[#D4A017] transition-colors">
            <div className="min-w-0 flex-1">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-[#F5F5F5]">Manage Products</p>
              <p className="text-xs text-[#9A9A9A] truncate mt-1">Update pricing and visibility</p>
            </div>
          </Link>
          <Link href="/admin/enquiries" className="relative flex items-center space-x-3 rounded-sm border border-[#2A2A2A] bg-[#141414] px-6 py-5 hover:border-[#D4A017] transition-colors">
            <div className="min-w-0 flex-1">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-[#F5F5F5]">View Enquiries</p>
              <p className="text-xs text-[#9A9A9A] truncate mt-1">Respond to customer requests</p>
            </div>
          </Link>
          <Link href="/admin/orders" className="relative flex items-center space-x-3 rounded-sm border border-[#2A2A2A] bg-[#141414] px-6 py-5 hover:border-[#D4A017] transition-colors">
            <div className="min-w-0 flex-1">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-[#F5F5F5]">Process Orders</p>
              <p className="text-xs text-[#9A9A9A] truncate mt-1">Fulfill and track shipments</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
