import { supabaseAdmin } from '@/lib/supabase/server';
import Link from 'next/link';

import { Package, MessageSquare, Clock, AlertTriangle, TrendingUp, ShieldAlert } from 'lucide-react';

export default async function AdminDashboard() {
  const [
    { count: productCount },
    { count: newEnquiryCount },
    { count: pendingOrderCount },
    { count: needsReviewCount },
    { data: revenueData },
    { data: invariantViolations },
  ] = await Promise.all([
    supabaseAdmin.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabaseAdmin.from('enquiries').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('needs_review', true),
    supabaseAdmin.from('orders').select('total').eq('status', 'paid'),
    // Data-integrity check: any product missing an active default variant
    // is invisible on the public site. The write paths (addProductVariant /
    // removeProductVariant) guardrail this, but direct SQL edits, seed
    // imports, or future write paths could still violate it — surface it
    // here so it's caught at admin login, not from a customer support ticket.
    supabaseAdmin.rpc('check_product_default_variant_invariant'),
  ]);

  const totalRevenue = revenueData?.reduce((sum, order) => sum + Number(order.total), 0) || 0;
  const violations = (invariantViolations as { parent_id: string; parent_name: string; issue: string }[] | null) || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl text-[#F5F5F5]">Dashboard Overview</h1>
          <p className="text-sm text-[#9A9A9A] mt-1">High-level metrics for Eryx Hardware operations.</p>
        </div>
        <div className="flex gap-3"></div>
      </div>

      {violations.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/40 rounded-sm p-4 flex items-start gap-3">
          <ShieldAlert className="text-red-400 shrink-0 mt-0.5" size={20} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-300">
              {violations.length} product{violations.length === 1 ? '' : 's'} not visible on the public site
            </p>
            <p className="text-xs text-red-300/80 mt-1">
              Each of these products has no variant that is both active and marked as default —
              the public catalogue filters them out. Open Edit → Variant tab to mark a variant active and default.
            </p>
            <ul className="mt-3 space-y-1 text-xs">
              {violations.slice(0, 5).map((v) => (
                <li key={v.parent_id} className="text-red-200 flex items-baseline gap-2">
                  <Link
                    href={`/admin/products?edit=${v.parent_id}`}
                    className="font-medium underline decoration-red-500/30 hover:decoration-red-300 hover:text-red-100 transition-colors"
                  >
                    {v.parent_name}
                  </Link>
                  <span className="text-red-300/60">— {v.issue}</span>
                  <Link
                    href={`/admin/products?edit=${v.parent_id}`}
                    className="ml-auto text-[10px] tracking-widest uppercase text-red-300 hover:text-red-100"
                  >
                    Fix →
                  </Link>
                </li>
              ))}
              {violations.length > 5 && (
                <li className="text-red-300/60 italic">
                  … and {violations.length - 5} more.
                </li>
              )}
            </ul>
            <Link
              href="/admin/products"
              className="inline-block mt-3 text-xs font-semibold text-red-200 hover:text-red-100 underline"
            >
              Review in Products →
            </Link>
          </div>
        </div>
      )}

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
