'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  Package,
  PencilLine,
  Trash2,
  CheckCircle2,
  Star,
  LifeBuoy,
  RotateCcw,
  ShoppingBag,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import StarRating from '@/components/ui/StarRating';

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

interface OrderItem {
  id: string;
  variant_id: string | null;
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
  product_id: string;
  rating: number;
  title: string | null;
  review_text: string | null;
  approval_status: string;
  created_at: string;
  updated_at: string;
  product: { name: string; item_code: string } | null;
}

interface ReviewableItem {
  variantId: string;
  productName: string;
  itemCode: string;
  orderId: string;
  deliveredAt: string;
}

interface Profile {
  full_name: string | null;
  email: string;
  created_at: string;
}

interface SupportRequest {
  id: string;
  order_id: string;
  reason: string;
  message: string;
  attachment_url: string | null;
  status: string;
  created_at: string;
}

interface AccountTabsProps {
  profile: Profile;
  orders: Order[];
  reviews: Review[];
  reviewableItems: ReviewableItem[];
  supportRequests: SupportRequest[];
  avatarUrl: string | null;
}

type Tab = 'overview' | 'orders' | 'reviews';

export default function AccountTabs({
  profile,
  orders,
  reviews,
  reviewableItems,
  supportRequests,
  avatarUrl,
}: AccountTabsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [helpOrderId, setHelpOrderId] = useState<string | null>(null);
  const [helpSubmitting, setHelpSubmitting] = useState(false);
  const [helpMessage, setHelpMessage] = useState<string | null>(null);

  const displayName = profile.full_name || profile.email.split('@')[0];
  const avatarInitial = displayName.charAt(0).toUpperCase();

  const paidOrders = orders.filter(
    (o) => o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered'
  );
  const totalSpent = paidOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const recentOrders = orders.slice(0, 3);
  const pendingReviewCount = reviewableItems.length;

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'orders', label: 'Orders' },
    { id: 'reviews', label: 'Reviews', badge: pendingReviewCount || undefined },
  ];

  const getItemsSummary = (order: Order) => {
    const count = order.order_items?.length || 0;
    const first = order.order_items?.[0];
    if (count === 0) return 'No items';
    if (count === 1) return first.product_name;
    return `${first.product_name} +${count - 1} more`;
  };

  const submitHelpRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHelpSubmitting(true);
    setHelpMessage(null);

    try {
      const response = await fetch('/api/support-requests', {
        method: 'POST',
        body: new FormData(event.currentTarget),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not submit request');
      setHelpMessage('Support request submitted. Our team will get back to you.');
      setHelpOrderId(null);
    } catch (err: any) {
      setHelpMessage(err.message || 'Could not submit request');
    } finally {
      setHelpSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex border-b border-line mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-6 py-3 text-sm font-medium border-b-2 transition duration-200 ease-in-out ${
              activeTab === tab.id
                ? 'border-gold text-gold-deep'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            {tab.label}
            {tab.badge ? (
              <span className="ml-2 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-gold text-on-gold text-[10px] font-bold align-middle">
                {tab.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="bg-surface-raised border border-line rounded-card p-6 flex items-center gap-6">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gold text-on-gold flex items-center justify-center text-2xl font-bold">
                {avatarInitial}
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-ink">{displayName}</h2>
              <p className="text-sm text-ink-muted">{profile.email}</p>
              <p className="text-xs text-ink-muted mt-1">
                Member since {new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface-raised border border-line rounded-card p-5">
              <p className="text-xs tracking-widest uppercase text-ink-faint">Total Orders</p>
              <p className="text-2xl font-bold text-ink mt-1">{orders.length}</p>
            </div>
            <div className="bg-surface-raised border border-line rounded-card p-5">
              <p className="text-xs tracking-widest uppercase text-ink-faint">Total Spent</p>
              <p className="text-2xl font-bold text-ink mt-1">₹{totalSpent.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-surface-raised border border-line rounded-card p-5">
              <p className="text-xs tracking-widest uppercase text-ink-faint">Pending Orders</p>
              <p className="text-2xl font-bold text-ink mt-1">{pendingOrders}</p>
            </div>
          </div>

          {pendingReviewCount > 0 && (
            <button
              onClick={() => setActiveTab('reviews')}
              className="w-full text-left bg-gold-tint border border-gold/40 rounded-card p-4 flex items-center gap-3 hover:border-gold transition duration-200"
            >
              <Star size={18} className="fill-gold text-gold shrink-0" />
              <span className="text-sm text-ink">
                You have <strong>{pendingReviewCount}</strong> {pendingReviewCount === 1 ? 'product' : 'products'} waiting to be reviewed.
                <span className="text-gold-deep font-semibold ml-1">Write a review →</span>
              </span>
            </button>
          )}

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-ink">Recent Orders</h3>
              {orders.length > 0 && (
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-sm text-gold-deep hover:text-gold transition duration-200"
                >
                  View All Orders →
                </button>
              )}
            </div>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-ink-muted">No orders yet.</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-surface-raised border border-line rounded-card p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-mono text-sm text-ink">#{order.id.split('-')[0].toUpperCase()}</p>
                      <p className="text-xs text-ink-muted">{formatDate(order.created_at)}</p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <p className="text-sm font-semibold text-ink">₹{Number(order.total).toLocaleString('en-IN')}</p>
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
            <EmptyState
              icon={<Package size={40} className="text-line-strong" />}
              title="No orders yet"
              body="When you place an order, it will show up here with tracking and support options."
              cta={{ href: '/kitchen', label: 'Start Shopping' }}
            />
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const isExpanded = expandedOrderId === order.id;
                const isDelivered = order.status === 'delivered';
                return (
                  <div
                    key={order.id}
                    className="bg-surface-raised border border-line rounded-card overflow-hidden"
                  >
                    {/* Header row */}
                    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-medium text-ink">
                            #{order.id.split('-')[0].toUpperCase()}
                          </span>
                          <StatusBadge status={order.status} />
                        </div>
                        <span className="text-xs text-ink-muted">
                          {formatDate(order.created_at)} · {getItemsSummary(order)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-ink">
                          ₹{Number(order.total).toLocaleString('en-IN')}
                        </span>
                        <button
                          onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                          className="flex items-center gap-1 text-xs text-ink-muted hover:text-gold-deep transition duration-200"
                          aria-expanded={isExpanded}
                        >
                          Details
                          <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Expanded items */}
                    {isExpanded && order.order_items?.length > 0 && (
                      <div className="border-t border-line bg-surface-sunken divide-y divide-line">
                        {order.order_items.map((item) => {
                          const slug = item.item_code ? slugify(item.item_code) : null;
                          const reviewable = isDelivered && reviewableItems.some((r) => r.variantId === item.variant_id);
                          const alreadyReviewed =
                            isDelivered &&
                            item.variant_id != null &&
                            !reviewable &&
                            reviews.some((rv) => rv.product_id === item.variant_id);
                          return (
                            <div key={item.id} className="px-4 py-3 flex items-center justify-between gap-4">
                              <div className="min-w-0">
                                {slug ? (
                                  <Link
                                    href={`/kitchen/${slug}`}
                                    className="text-sm text-ink hover:text-gold-deep transition-colors truncate block"
                                  >
                                    {item.product_name}
                                  </Link>
                                ) : (
                                  <span className="text-sm text-ink truncate block">{item.product_name}</span>
                                )}
                                <span className="text-xs text-ink-faint font-mono">{item.item_code} · Qty {item.quantity}</span>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <span className="text-sm text-ink">
                                  ₹{Number(item.price_at_purchase).toLocaleString('en-IN')}
                                </span>
                                {reviewable && (
                                  <button
                                    onClick={() => setActiveTab('reviews')}
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-gold-deep hover:text-gold transition duration-200 whitespace-nowrap"
                                  >
                                    <Star size={12} />
                                    Review
                                  </button>
                                )}
                                {alreadyReviewed && (
                                  <span className="inline-flex items-center gap-1 text-xs text-emerald-500 whitespace-nowrap">
                                    <CheckCircle2 size={12} />
                                    Reviewed
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Footer actions */}
                    <div className="border-t border-line px-4 py-2.5 flex items-center gap-4 bg-surface-raised">
                      <button
                        type="button"
                        onClick={() => {
                          setHelpOrderId(helpOrderId === order.id ? null : order.id);
                          setHelpMessage(null);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-gold-deep transition duration-200"
                      >
                        <LifeBuoy size={13} />
                        Need help?
                      </button>
                      {isDelivered && (
                        <Link
                          href={`/account/orders/${order.id}/return`}
                          className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-gold-deep transition duration-200"
                        >
                          <RotateCcw size={13} />
                          Return
                        </Link>
                      )}
                    </div>

                    {/* Help form */}
                    {helpOrderId === order.id && (
                      <form
                        onSubmit={submitHelpRequest}
                        className="border-t border-line px-4 py-4 bg-surface-sunken space-y-3"
                      >
                        <input type="hidden" name="order_id" value={order.id} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <select
                            name="reason"
                            required
                            className="bg-surface-raised border border-line px-3 py-2 rounded-control text-sm text-ink"
                          >
                            <option value="order_not_received">Order not received</option>
                            <option value="wrong_item">Wrong item received</option>
                            <option value="damaged_product">Damaged product</option>
                            <option value="refund_return">Refund/Return</option>
                            <option value="other">Other</option>
                          </select>
                          <input
                            name="attachment"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="text-sm text-ink-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-control file:border-0 file:text-xs file:font-semibold file:bg-gold file:text-on-gold"
                          />
                        </div>
                        <textarea
                          name="message"
                          required
                          minLength={10}
                          maxLength={2000}
                          rows={3}
                          placeholder="Tell us what happened"
                          className="w-full bg-surface-raised border border-line px-3 py-2 rounded-control text-sm text-ink"
                        />
                        <button
                          disabled={helpSubmitting}
                          className="bg-gold hover:bg-gold-bright text-on-gold font-semibold px-4 py-2 text-sm rounded-control disabled:opacity-50 transition duration-200"
                        >
                          {helpSubmitting ? 'Submitting...' : 'Submit Request'}
                        </button>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {helpMessage && (
            <p className="text-sm text-ink mt-4 bg-gold-tint border border-gold/40 rounded-card px-4 py-3">
              {helpMessage}
            </p>
          )}
          {supportRequests.length > 0 && (
            <div className="mt-10">
              <h3 className="text-lg font-semibold text-ink mb-4">Your help requests</h3>
              <div className="space-y-3">
                {supportRequests.map((request) => (
                  <div key={request.id} className="bg-surface-raised border border-line rounded-card p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-mono text-xs text-ink-muted">
                          #{request.id.split('-')[0].toUpperCase()} · Order #{request.order_id.split('-')[0].toUpperCase()}
                        </p>
                        <p className="text-sm text-ink mt-1 capitalize">
                          {request.reason.replace(/_/g, ' ')}
                        </p>
                      </div>
                      <StatusBadge status={request.status} />
                    </div>
                    <p className="text-sm text-ink-muted mt-3 whitespace-pre-wrap">{request.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <ReviewsTab
          reviews={reviews}
          reviewableItems={reviewableItems}
          onChanged={() => router.refresh()}
        />
      )}
    </div>
  );
}

function EmptyState({
  icon,
  title,
  body,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="text-center py-16 flex flex-col items-center">
      <div className="mb-4">{icon}</div>
      <p className="text-lg font-semibold text-ink">{title}</p>
      <p className="text-sm text-ink-muted mt-1 max-w-sm">{body}</p>
      {cta && (
        <Link
          href={cta.href}
          className="mt-6 inline-flex items-center gap-2 bg-gold hover:bg-gold-bright text-on-gold font-semibold px-8 py-3 rounded-control transition duration-200 ease-in-out"
        >
          <ShoppingBag size={16} />
          {cta.label}
        </Link>
      )}
    </div>
  );
}

// ─── Reviews tab ─────────────────────────────────────────────────────

function ReviewsTab({
  reviews,
  reviewableItems,
  onChanged,
}: {
  reviews: Review[];
  reviewableItems: ReviewableItem[];
  onChanged: () => void;
}) {
  return (
    <div className="space-y-10">
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold text-ink">Awaiting your review</h3>
          {reviewableItems.length > 0 && (
            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-gold text-on-gold text-[10px] font-bold">
              {reviewableItems.length}
            </span>
          )}
        </div>
        {reviewableItems.length === 0 ? (
          <p className="text-sm text-ink-muted">
            Nothing to review right now. Delivered products you haven&apos;t reviewed will appear here.
          </p>
        ) : (
          <div className="space-y-4">
            {reviewableItems.map((item) => (
              <PendingReviewCard key={item.variantId} item={item} onSubmitted={onChanged} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="text-lg font-semibold text-ink mb-4">Your reviews</h3>
        {reviews.length === 0 ? (
          <p className="text-sm text-ink-muted">You haven&apos;t submitted any reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <SubmittedReviewCard key={review.id} review={review} onChanged={onChanged} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function PendingReviewCard({ item, onSubmitted }: { item: ReviewableItem; onSubmitted: () => void }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const slug = item.itemCode ? slugify(item.itemCode) : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      setError('Please select a star rating.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: item.variantId,
          rating,
          title: title.trim() || undefined,
          review_text: text.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit review');
      onSubmitted();
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-surface-raised border border-line rounded-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {slug ? (
            <Link
              href={`/kitchen/${slug}`}
              className="font-medium text-ink hover:text-gold-deep transition-colors"
            >
              {item.productName}
            </Link>
          ) : (
            <span className="font-medium text-ink">{item.productName}</span>
          )}
          <p className="text-xs text-ink-faint mt-0.5">
            Delivered {formatDate(item.deliveredAt)} · Order #{item.orderId.split('-')[0].toUpperCase()}
          </p>
        </div>
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 bg-gold hover:bg-gold-bright text-on-gold font-semibold px-4 py-2 text-sm rounded-control transition duration-200 shrink-0"
          >
            <Star size={14} />
            Write a review
          </button>
        )}
      </div>

      {open && (
        <form onSubmit={submit} className="mt-4 pt-4 border-t border-line space-y-3">
          <div>
            <label className="block text-xs tracking-widest uppercase text-ink-faint mb-1.5">Your rating</label>
            <StarRating value={rating} onChange={setRating} size={24} label="Your rating" />
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            placeholder="Add a headline (optional)"
            className="w-full bg-surface border border-line px-3 py-2 rounded-control text-sm text-ink"
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={2000}
            rows={3}
            placeholder="Share what you liked or didn't (optional)"
            className="w-full bg-surface border border-line px-3 py-2 rounded-control text-sm text-ink"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex items-center gap-3">
            <button
              disabled={submitting}
              className="bg-gold hover:bg-gold-bright text-on-gold font-semibold px-4 py-2 text-sm rounded-control disabled:opacity-50 transition duration-200"
            >
              {submitting ? 'Submitting...' : 'Submit review'}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm text-ink-muted hover:text-ink transition duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function SubmittedReviewCard({ review, onChanged }: { review: Review; onChanged: () => void }) {
  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(review.rating);
  const [title, setTitle] = useState(review.title || '');
  const [text, setText] = useState(review.review_text || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const productSlug = review.product ? slugify(review.product.item_code) : null;
  const edited = review.updated_at && review.updated_at !== review.created_at;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          review_id: review.id,
          rating,
          title: title.trim() || undefined,
          review_text: text.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update review');
      setEditing(false);
      onChanged();
    } catch (err: any) {
      setError(err.message);
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/reviews', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review_id: review.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete review');
      onChanged();
    } catch (err: any) {
      setError(err.message);
      setBusy(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="bg-surface-raised border border-line rounded-card p-5">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="min-w-0">
          {productSlug ? (
            <Link
              href={`/kitchen/${productSlug}`}
              className="font-medium text-ink hover:text-gold-deep transition duration-200"
            >
              {review.product?.name || 'Unknown Product'}
            </Link>
          ) : (
            <span className="font-medium text-ink">{review.product?.name || 'Unknown Product'}</span>
          )}
          {!editing && <div className="mt-1.5"><StarRating value={review.rating} size={16} /></div>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ReviewStatusPill status={review.approval_status} />
        </div>
      </div>

      {!editing ? (
        <>
          {review.title && <p className="mt-3 text-sm font-semibold text-ink">{review.title}</p>}
          {review.review_text && (
            <p className="mt-1 text-sm text-ink-muted whitespace-pre-wrap">{review.review_text}</p>
          )}
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xs text-ink-faint">
              {formatDate(review.created_at)}
              {edited && ' · edited'}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setEditing(true);
                  setError('');
                }}
                className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-gold-deep transition duration-200"
              >
                <PencilLine size={13} />
                Edit
              </button>
              {confirmDelete ? (
                <span className="inline-flex items-center gap-2 text-xs">
                  <span className="text-ink-muted">Delete?</span>
                  <button
                    onClick={remove}
                    disabled={busy}
                    className="text-red-500 hover:text-red-600 font-semibold disabled:opacity-50"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-ink-muted hover:text-ink"
                  >
                    No
                  </button>
                </span>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-red-500 transition duration-200"
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              )}
            </div>
          </div>
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </>
      ) : (
        <form onSubmit={save} className="mt-4 pt-4 border-t border-line space-y-3">
          <div>
            <label className="block text-xs tracking-widest uppercase text-ink-faint mb-1.5">Your rating</label>
            <StarRating value={rating} onChange={setRating} size={24} label="Your rating" />
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            placeholder="Add a headline (optional)"
            className="w-full bg-surface border border-line px-3 py-2 rounded-control text-sm text-ink"
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={2000}
            rows={3}
            placeholder="Share what you liked or didn't (optional)"
            className="w-full bg-surface border border-line px-3 py-2 rounded-control text-sm text-ink"
          />
          <p className="text-xs text-ink-faint">Editing sends your review back for approval before it shows publicly.</p>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex items-center gap-3">
            <button
              disabled={busy}
              className="bg-gold hover:bg-gold-bright text-on-gold font-semibold px-4 py-2 text-sm rounded-control disabled:opacity-50 transition duration-200"
            >
              {busy ? 'Saving...' : 'Save changes'}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setRating(review.rating);
                setTitle(review.title || '');
                setText(review.review_text || '');
                setError('');
              }}
              className="text-sm text-ink-muted hover:text-ink transition duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function ReviewStatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    approved: { label: 'Published', cls: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' },
    pending: { label: 'Under review', cls: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30' },
    rejected: { label: 'Not approved', cls: 'bg-red-500/10 text-red-500 border border-red-500/30' },
  };
  const entry = map[status] || map.pending;
  return (
    <span
      className={`px-2 py-0.5 text-xs font-medium rounded-control ${entry.cls}`}
      title={
        status === 'pending'
          ? 'Waiting for admin approval before it appears on the product page.'
          : status === 'rejected'
          ? 'This review was not approved for public display.'
          : 'Live on the product page.'
      }
    >
      {entry.label}
    </span>
  );
}
