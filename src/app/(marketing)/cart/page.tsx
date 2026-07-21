'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, X, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { createClient } from '@/lib/supabase/client';
import ProductImage from '@/components/ui/ProductImage';
import { formatPrice, getEffectivePrice } from '@/lib/pricing';

// sessionStorage key shared with checkout so an applied promo carries over.
// We persist only the CODE — the discount is always re-validated server-side.
const PROMO_STORAGE_KEY = 'eryx_applied_promo';

type AvailableCode = {
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  eligible: boolean;
  ineligibility_reason?: string;
};

function formatDiscountBadge(code: AvailableCode): string {
  if (code.discount_type === 'percentage') return `${code.discount_value}% off`;
  return `${formatPrice(code.discount_value)} off`;
}

const inputClass =
  'w-full bg-surface border border-line-strong px-3.5 py-2.5 rounded-control text-sm text-ink placeholder:text-ink-faint focus:border-gold outline-none transition-colors duration-200';

export default function CartPage() {
  const { items, updateQuantity, removeItem, cartTotal, cartCount } = useCart();
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [availableCodes, setAvailableCodes] = useState<AvailableCode[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, [supabase.auth]);

  // Load the public promo list (auth-gated server-side). Refetch on subtotal
  // change since min-order eligibility flips with it.
  useEffect(() => {
    if (!user) {
      setAvailableCodes([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/promo-codes/available?subtotal=${cartTotal}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setAvailableCodes(data.codes ?? []);
      } catch {
        // Non-fatal — the manual input still works.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, cartTotal]);

  // Rehydrate a previously-applied promo (e.g. user went cart → checkout →
  // back) and re-validate it against the current subtotal. If it no longer
  // qualifies (cart changed), silently drop it.
  useEffect(() => {
    const stored = sessionStorage.getItem(PROMO_STORAGE_KEY);
    if (!stored || items.length === 0) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/validate-promo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: stored, subtotal: cartTotal }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (res.ok) {
          setAppliedPromo(data);
          setPromoCode(data.code);
        } else {
          sessionStorage.removeItem(PROMO_STORAGE_KEY);
        }
      } catch {
        /* ignore — leave promo unapplied */
      }
    })();
    return () => {
      cancelled = true;
    };
    // Run once on mount; subtotal re-validation on edits is handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If the cart total drops below a promo's minimum after an edit, clear it so
  // the displayed total never lies. (Re-validates the applied code on change.)
  useEffect(() => {
    if (!appliedPromo) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/validate-promo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: appliedPromo.code, subtotal: cartTotal }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (res.ok) {
          setAppliedPromo(data);
          sessionStorage.setItem(PROMO_STORAGE_KEY, data.code);
        } else {
          setAppliedPromo(null);
          setPromoError(data.error || 'Promo no longer applies to this cart.');
          sessionStorage.removeItem(PROMO_STORAGE_KEY);
        }
      } catch {
        /* keep last-known applied state on network error */
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartTotal]);

  const handleApplyPromo = async () => {
    if (!promoCode) return;
    setPromoLoading(true);
    setPromoError('');
    try {
      const res = await fetch('/api/validate-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, subtotal: cartTotal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAppliedPromo(data);
      sessionStorage.setItem(PROMO_STORAGE_KEY, data.code);
    } catch (err: any) {
      setPromoError(err.message);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode('');
    setPromoError('');
    sessionStorage.removeItem(PROMO_STORAGE_KEY);
  };

  const total = cartTotal - (appliedPromo?.discount_amount || 0);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-surface-sunken flex items-center justify-center mb-5">
            <ShoppingBag size={28} className="text-ink-faint" />
          </div>
          <h1 className="font-serif text-2xl text-ink">Your cart is empty</h1>
          <p className="text-sm text-ink-muted mt-1 max-w-sm">
            Browse our kitchen and wardrobe hardware and add items to get started.
          </p>
          <Link
            href="/kitchen"
            className="mt-6 inline-flex items-center gap-2 bg-gold hover:bg-gold-bright text-on-gold font-semibold px-8 py-3 rounded-control transition duration-200 ease-in-out"
          >
            <ShoppingBag size={16} />
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-serif text-3xl text-ink mb-2">Your Cart</h1>
      <p className="text-sm text-ink-muted mb-8">
        {cartCount} {cartCount === 1 ? 'item' : 'items'}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Line items */}
        <div className="lg:col-span-2">
          <div className="border border-line rounded-card divide-y divide-line overflow-hidden">
            {items.map((item) => {
              const price = getEffectivePrice(item.product);
              return (
                <div key={item.product.slug} className="flex gap-4 p-4 bg-surface-raised">
                  <Link
                    href={`/kitchen/${item.product.slug}`}
                    className="w-24 h-24 shrink-0 bg-surface-sunken rounded-control overflow-hidden"
                  >
                    <ProductImage src={item.product.image} alt={item.product.name} className="w-24 h-24" />
                  </Link>
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex justify-between gap-3">
                      <div className="min-w-0">
                        <span className="text-xs text-ink-faint">{item.product.code}</span>
                        <Link
                          href={`/kitchen/${item.product.slug}`}
                          className="block text-sm font-semibold text-ink font-serif hover:text-gold-deep transition-colors duration-200 truncate"
                        >
                          {item.product.name}
                        </Link>
                        {item.product.finish && (
                          <span className="text-xs text-ink-muted">Finish: {item.product.finish}</span>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.product.slug)}
                        aria-label={`Remove ${item.product.name}`}
                        className="text-ink-muted hover:text-red-500 transition duration-200 ease-in-out shrink-0 h-fit"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="mt-auto pt-3 flex items-end justify-between gap-3">
                      <div className="flex items-center border border-line-strong rounded-control">
                        <button
                          onClick={() => updateQuantity(item.product.slug, item.quantity - 1)}
                          aria-label="Decrease quantity"
                          className="p-1.5 text-ink-muted hover:text-gold-deep"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-3 text-sm text-ink tabular-nums">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.slug, item.quantity + 1)}
                          aria-label="Increase quantity"
                          className="p-1.5 text-ink-muted hover:text-gold-deep"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-ink">
                          {typeof price === 'number' ? formatPrice(price * item.quantity) : 'Price on request'}
                        </p>
                        {item.quantity > 1 && typeof price === 'number' && (
                          <p className="text-xs text-ink-faint">{formatPrice(price)} each</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            href="/kitchen"
            className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-gold-deep transition-colors duration-200 mt-4"
          >
            <ArrowRight size={14} className="rotate-180" />
            Continue shopping
          </Link>
        </div>

        {/* Summary + promo */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-28 border border-line rounded-card p-5 bg-surface-raised space-y-5">
            <h2 className="text-lg font-semibold text-ink">Order Summary</h2>

            {/* Promo */}
            <div>
              {appliedPromo ? (
                <div className="flex items-center justify-between gap-3 rounded-control border border-green-500/40 bg-green-500/10 px-3 py-2">
                  <div className="min-w-0">
                    <span className="font-mono font-semibold text-green-600 dark:text-green-500 text-sm">
                      {appliedPromo.code}
                    </span>
                    <p className="text-xs text-ink-muted">
                      applied · -{formatPrice(appliedPromo.discount_amount)}
                    </p>
                  </div>
                  <button
                    onClick={handleRemovePromo}
                    aria-label="Remove promo code"
                    className="text-ink-muted hover:text-red-500 transition duration-200 shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                      placeholder="Enter promo code"
                      className={inputClass}
                    />
                    <button
                      onClick={handleApplyPromo}
                      disabled={promoLoading || !promoCode}
                      className="bg-ink text-surface px-5 py-2 rounded-control text-sm font-medium hover:opacity-90 transition disabled:opacity-40 whitespace-nowrap"
                      type="button"
                    >
                      {promoLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                  {promoError && <p className="text-red-500 text-xs mt-2">{promoError}</p>}

                  {availableCodes.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs uppercase tracking-widest text-ink-muted mb-2">Available codes</p>
                      <ul className="space-y-2">
                        {availableCodes.map((code) => {
                          const selected = promoCode.toUpperCase() === code.code.toUpperCase();
                          const muted = !code.eligible;
                          const rowClass = `flex items-center justify-between gap-3 rounded-control border px-3 py-2 text-sm ${
                            muted
                              ? 'opacity-60 cursor-not-allowed border-line bg-surface-sunken'
                              : 'border-line hover:border-gold cursor-pointer'
                          } ${selected ? 'ring-1 ring-gold' : ''}`;

                          const inner = (
                            <>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-semibold text-gold-deep">{code.code}</span>
                                  <span className="text-xs text-ink-muted">{formatDiscountBadge(code)}</span>
                                </div>
                                {code.description && (
                                  <p className="text-xs text-ink-muted mt-0.5 truncate">{code.description}</p>
                                )}
                              </div>
                              {code.ineligibility_reason && (
                                <span
                                  className={`text-xs whitespace-nowrap ${
                                    code.eligible ? 'text-amber-600 dark:text-amber-400' : 'text-ink-muted'
                                  }`}
                                >
                                  {code.ineligibility_reason}
                                </span>
                              )}
                            </>
                          );

                          return (
                            <li key={code.code}>
                              {code.eligible ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPromoCode(code.code);
                                    setPromoError('');
                                  }}
                                  className={`${rowClass} w-full text-left`}
                                >
                                  {inner}
                                </button>
                              ) : (
                                <div className={rowClass}>{inner}</div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Totals */}
            <div className="pt-4 border-t border-line space-y-2">
              <div className="flex justify-between text-sm text-ink-muted">
                <span>Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between text-sm text-green-600 dark:text-green-500">
                  <span>Discount ({appliedPromo.code})</span>
                  <span>-{formatPrice(appliedPromo.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-ink-muted">
                <span>Shipping</span>
                <span className="text-green-600 dark:text-green-500 font-medium">Free</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-ink pt-2 border-t border-line">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <p className="text-xs text-ink-faint">Taxes included where applicable.</p>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              className="w-full bg-gold hover:bg-gold-bright text-on-gold font-semibold py-3 rounded-control transition duration-200 ease-in-out flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <ArrowRight size={16} />
            </button>

            {/* Trust signals */}
            <div className="flex items-center justify-center gap-5 pt-1 text-xs text-ink-muted">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-gold" />
                Secure checkout
              </span>
              <span className="flex items-center gap-1.5">
                <Truck size={14} className="text-gold" />
                Pan-India delivery
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
