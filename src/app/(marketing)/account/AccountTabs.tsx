'use client';

import { useState } from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/StatusBadge';

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

interface OrderItem {
  id: string;
  product_name: string;
  item_code: string;
  quantity: number;
  price_at_purchase: number;
}

interface Order {
  id: string;
  created_at: string;
  total: number;
  status: string;
  order_items: OrderItem[];
}

interface Review {
  id: string;
  rating: number;
  review_text: string | null;
  approval_status: string;
  created_at: string;
  product: { name: string; item_code: string } | null;
}

interface Profile {
  full_name: string | null;
  email: string;
  created_at: string;
}

interface AccountTabsProps {
  profile: Profile;
  orders: Order[];
  reviews: Review[];
  avatarUrl: string | null;
}

type Tab = 'overview' | 'orders' | 'reviews';

export default function AccountTabs({ profile, orders, reviews, avatarUrl }: AccountTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const displayName = profile.full_name || profile.email.split('@')[0];
  const avatarInitial = displayName.charAt(0).toUpperCase();

  const paidOrders = orders.filter((o) => o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered');
  const totalSpent = paidOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const recentOrders = orders.slice(0, 3);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'orders', label: 'Orders' },
    { id: 'reviews', label: 'Reviews' },
  ];

  const getItemsSummary = (order: Order) => {
    const count = order.order_items?.length || 0;
    const first = order.order_items?.[0];
    if (count === 0) return 'No items';
    if (count === 1) return first.product_name;
    return `${count} items — ${first.product_name}, ...`;
  };

  return (
    <div>
      <div className="flex border-b border-[#D4D4D4] dark:border-[#2A2A2A] mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition duration-200 ease-in-out ${
              activeTab === tab.id
                ? 'border-[#D4A017] text-[#D4A017]'
                : 'border-transparent text-[#555555] dark:text-[#9A9A9A] hover:text-[#0A0A0A] dark:hover:text-[#F5F5F5]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="bg-white dark:bg-[#141414] border border-[#D4D4D4] dark:border-[#2A2A2A] rounded-sm p-6 flex items-center gap-6">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#D4A017] text-[#0A0A0A] flex items-center justify-center text-2xl font-bold">
                {avatarInitial}
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-[#0A0A0A] dark:text-[#F5F5F5]">{displayName}</h2>
              <p className="text-sm text-[#555555] dark:text-[#9A9A9A]">{profile.email}</p>
              <p className="text-xs text-[#555555] dark:text-[#9A9A9A] mt-1">
                Member since {new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#141414] border border-[#D4D4D4] dark:border-[#2A2A2A] rounded-sm p-5">
              <p className="text-xs tracking-widest uppercase text-[#9A9A9A]">Total Orders</p>
              <p className="text-2xl font-bold text-[#0A0A0A] dark:text-[#F5F5F5] mt-1">{orders.length}</p>
            </div>
            <div className="bg-white dark:bg-[#141414] border border-[#D4D4D4] dark:border-[#2A2A2A] rounded-sm p-5">
              <p className="text-xs tracking-widest uppercase text-[#9A9A9A]">Total Spent</p>
              <p className="text-2xl font-bold text-[#0A0A0A] dark:text-[#F5F5F5] mt-1">₹{totalSpent.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-white dark:bg-[#141414] border border-[#D4D4D4] dark:border-[#2A2A2A] rounded-sm p-5">
              <p className="text-xs tracking-widest uppercase text-[#9A9A9A]">Pending Orders</p>
              <p className="text-2xl font-bold text-[#0A0A0A] dark:text-[#F5F5F5] mt-1">{pendingOrders}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#0A0A0A] dark:text-[#F5F5F5]">Recent Orders</h3>
              {orders.length > 0 && (
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-sm text-[#D4A017] hover:text-[#E8B820] transition duration-200"
                >
                  View All Orders →
                </button>
              )}
            </div>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-[#555555] dark:text-[#9A9A9A]">No orders yet.</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white dark:bg-[#141414] border border-[#D4D4D4] dark:border-[#2A2A2A] rounded-sm p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-mono text-sm text-[#0A0A0A] dark:text-[#F5F5F5]">{order.id.split('-')[0]}...</p>
                      <p className="text-xs text-[#555555] dark:text-[#9A9A9A]">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#0A0A0A] dark:text-[#F5F5F5]">₹{Number(order.total).toLocaleString('en-IN')}</p>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div>
          {orders.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#555555] dark:text-[#9A9A9A] mb-6">You haven&apos;t placed any orders yet</p>
              <Link
                href="/kitchen"
                className="inline-block bg-[#D4A017] hover:bg-[#E8B820] text-[#0A0A0A] font-semibold px-8 py-3 transition duration-200 ease-in-out"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white dark:bg-[#141414] border border-[#D4D4D4] dark:border-[#2A2A2A] rounded-sm overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                    className="w-full p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition duration-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                      <span className="font-mono text-sm text-[#0A0A0A] dark:text-[#F5F5F5]">{order.id.split('-')[0]}...</span>
                      <span className="text-sm text-[#555555] dark:text-[#9A9A9A]">{new Date(order.created_at).toLocaleDateString()}</span>
                      <span className="text-sm text-[#555555] dark:text-[#9A9A9A]">{getItemsSummary(order)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-[#0A0A0A] dark:text-[#F5F5F5]">₹{Number(order.total).toLocaleString('en-IN')}</span>
                      <StatusBadge status={order.status} />
                    </div>
                  </button>
                  {expandedOrderId === order.id && order.order_items?.length > 0 && (
                    <div className="border-t border-[#D4D4D4] dark:border-[#2A2A2A] bg-[#F5F5F5] dark:bg-[#0A0A0A] px-4 py-3">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs tracking-widest uppercase text-[#9A9A9A]">
                            <th className="text-left py-2">Product</th>
                            <th className="text-left py-2">Code</th>
                            <th className="text-right py-2">Qty</th>
                            <th className="text-right py-2">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.order_items.map((item) => (
                            <tr key={item.id} className="text-[#0A0A0A] dark:text-[#F5F5F5]">
                              <td className="py-2">{item.product_name}</td>
                              <td className="py-2 font-mono text-xs">{item.item_code}</td>
                              <td className="py-2 text-right">{item.quantity}</td>
                              <td className="py-2 text-right">₹{Number(item.price_at_purchase).toLocaleString('en-IN')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div>
          {reviews.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#555555] dark:text-[#9A9A9A]">You haven&apos;t submitted any reviews yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => {
                const productSlug = review.product ? slugify(review.product.item_code) : null;
                return (
                  <div
                    key={review.id}
                    className="bg-white dark:bg-[#141414] border border-[#D4D4D4] dark:border-[#2A2A2A] rounded-sm p-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                      {productSlug ? (
                        <Link
                          href={`/kitchen/${productSlug}`}
                          className="font-medium text-[#0A0A0A] dark:text-[#F5F5F5] hover:text-[#D4A017] transition duration-200"
                        >
                          {review.product?.name}
                        </Link>
                      ) : (
                        <span className="font-medium text-[#0A0A0A] dark:text-[#F5F5F5]">Unknown Product</span>
                      )}
                      <div className="flex items-center gap-3">
                        <span className="text-[#D4A017] text-sm">
                          {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                        </span>
                        <StatusBadge status={review.approval_status} />
                      </div>
                    </div>
                    {review.review_text && (
                      <p className="text-sm text-[#555555] dark:text-[#9A9A9A] mb-2">{review.review_text}</p>
                    )}
                    <p className="text-xs text-[#9A9A9A]">{new Date(review.created_at).toLocaleDateString()}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
