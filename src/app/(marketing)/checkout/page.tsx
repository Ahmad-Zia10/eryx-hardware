'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { createClient } from '@/lib/supabase/client';
import { formatPrice, getEffectivePrice } from '@/lib/pricing';
import { isServiceablePincode } from '@/constants';
import { CheckCircle2, Lock, XCircle } from 'lucide-react';
import Script from 'next/script';

type OutOfStockItem = {
  code: string;
  name: string;
  requested: number;
  available: number;
};

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

// Shared control styling — matches the enquiry/dealer forms.
const inputClass =
  'w-full bg-surface border border-line-strong px-3.5 py-2.5 rounded-control text-sm text-ink placeholder:text-ink-faint focus:border-gold outline-none transition-colors duration-200';
const labelClass = 'block text-sm font-medium text-ink mb-1.5';

// Shared with the cart page so a promo applied there carries into checkout.
// Only the CODE is persisted; the discount is always re-validated server-side.
const PROMO_STORAGE_KEY = 'eryx_applied_promo';

export default function CheckoutPage() {
  const { items, cartTotal, clearCart, removeItem } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [outOfStock, setOutOfStock] = useState<OutOfStockItem[]>([]);

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [availableCodes, setAvailableCodes] = useState<AvailableCode[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  });
  // Serviceability is checked on blur; null = not yet checked.
  const [pincodeServiceable, setPincodeServiceable] = useState<boolean | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        setFormData(prev => ({
          ...prev,
          name: user.user_metadata?.full_name || '',
          email: user.email || '',
        }));
      }
    };
    fetchUser();
  }, [supabase.auth]);

  // Load the public promo codes list (auth-gated on the server). Refetch
  // when cartTotal changes because min-order eligibility flips with it.
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
        // Non-fatal — the input still works if the list fails to load.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, cartTotal]);

  // Rehydrate a promo applied on the cart page and re-validate it against the
  // current subtotal (server authoritative — never trust a stored discount).
  // If it no longer qualifies, drop it silently.
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
        /* leave unapplied on network error */
      }
    })();
    return () => {
      cancelled = true;
    };
    // Run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Digits only, max 6 — reset the serviceability verdict as they type.
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setFormData({ ...formData, pincode: value });
    setPincodeServiceable(null);
  };

  const handlePincodeBlur = () => {
    if (formData.pincode.length === 6) {
      setPincodeServiceable(isServiceablePincode(formData.pincode));
    }
  };

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

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setIsLoading(true);
    setOutOfStock([]);

    // Compose the structured address into the single shipping_address
    // column the orders table + create_order_with_items RPC expect. The
    // form collects line1/line2/state separately (needed for the future
    // logistics + GST work) but the DB schema for that is a separate
    // migration — until then we keep the full address in one field.
    const composedAddress = [
      formData.addressLine1,
      formData.addressLine2,
      formData.state && `${formData.state}`,
    ]
      .filter(Boolean)
      .join(', ');

    try {
      // 1. Create order on backend
      const res = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            code: item.product.code,
            quantity: item.quantity
          })),
          shippingDetails: {
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            address: composedAddress,
            city: formData.city,
            pincode: formData.pincode,
          },
          promoCode: appliedPromo?.code,
        }),
      });

      const data = await res.json();

      if (res.status === 409 && Array.isArray(data.outOfStockItems)) {
        setOutOfStock(data.outOfStockItems);
        setIsLoading(false);
        return;
      }

      if (!res.ok) throw new Error(data.error || 'Failed to create order');

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: "INR",
        name: "Eryx Hardware",
        description: "Order Payment",
        order_id: data.razorpayOrderId,
        handler: function (response: any) {
          // 2. Redirect to success on successful payment
          // Note: Webhook handles actual db status update
          clearCart();
          sessionStorage.removeItem(PROMO_STORAGE_KEY);
          window.location.href = `/checkout/success?order_id=${data.orderId}`;
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#D4A017",
        },
        method: {
          emi: true,
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        alert("Payment Failed. Please try again.");
      });
      rzp.open();
    } catch (err: any) {
      alert(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <h2 className="font-serif text-2xl text-ink mb-4">Your cart is empty</h2>
        <Link href="/kitchen" className="text-gold-deep hover:text-gold hover:underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  const total = cartTotal - (appliedPromo?.discount_amount || 0);

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        <h1 className="font-serif text-3xl md:text-4xl text-ink mb-8">Checkout</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Order Summary */}
          <div className="md:sticky md:top-28 self-start">
            <div className="flex items-center justify-between mb-4 border-b border-line pb-2">
              <h2 className="text-xl font-semibold text-ink">Order Summary</h2>
              <Link
                href="/cart"
                className="text-xs text-gold-deep hover:text-gold transition-colors duration-200"
              >
                Edit cart
              </Link>
            </div>
            <div className="space-y-4">
              {items.map((item) => {
                const price = getEffectivePrice(item.product);
                const stale = outOfStock.find((o) => o.code === item.product.code);
                return (
                <div
                  key={item.product.slug}
                  className={`flex flex-col text-sm rounded-control p-2 ${
                    stale ? 'border border-red-500 bg-red-500/10' : ''
                  }`}
                >
                  <div className="flex justify-between gap-3">
                    <div className="flex gap-4 min-w-0">
                      <div className="w-16 h-16 bg-surface-sunken rounded-control shrink-0 overflow-hidden">
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-ink truncate">{item.product.name}</p>
                        <p className="text-ink-muted">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-ink font-medium whitespace-nowrap">
                      {typeof price === 'number' ? formatPrice(price * item.quantity) : 'Price on request'}
                    </div>
                  </div>
                  {stale && (
                    <div className="mt-2 flex items-center justify-between text-xs text-red-600 dark:text-red-400">
                      <span>
                        {stale.available === 0
                          ? 'Out of stock — remove to continue.'
                          : `Only ${stale.available} available. Reduce quantity or remove.`}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          removeItem(item.product.slug);
                          setOutOfStock((prev) => prev.filter((o) => o.code !== item.product.code));
                        }}
                        className="ml-3 underline hover:no-underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
                );
              })}
            </div>

            <div className="mt-8">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter Promo Code"
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
                <div className="mt-4">
                  <p className="text-xs uppercase tracking-widest text-ink-muted mb-2">
                    Available codes
                  </p>
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
                              <span className="font-mono font-semibold text-gold-deep">
                                {code.code}
                              </span>
                              <span className="text-xs text-ink-muted">
                                {formatDiscountBadge(code)}
                              </span>
                            </div>
                            {code.description && (
                              <p className="text-xs text-ink-muted mt-0.5 truncate">
                                {code.description}
                              </p>
                            )}
                          </div>
                          {code.ineligibility_reason && (
                            <span
                              className={`text-xs whitespace-nowrap ${
                                code.eligible
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-ink-muted'
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
            </div>

            <div className="mt-6 pt-4 border-t border-line">
              <div className="flex justify-between text-ink-muted mb-2 text-sm">
                <span>Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between text-green-600 dark:text-green-500 mb-2 text-sm">
                  <span>Discount ({appliedPromo.code})</span>
                  <span>-{formatPrice(appliedPromo.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-ink-muted mb-2 text-sm">
                <span>Shipping</span>
                <span className="text-green-600 dark:text-green-500 font-medium">Free</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-ink pt-2 border-t border-line">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <p className="text-xs text-ink-faint mt-2">
                Taxes included where applicable.
              </p>
            </div>
          </div>

          {/* Shipping + Payment */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-ink border-b border-line pb-2">Shipping Details</h2>
            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label htmlFor="co-name" className={labelClass}>
                  Full Name <span className="text-gold-deep">*</span>
                </label>
                <input id="co-name" required type="text" name="name" value={formData.name} onChange={handleInputChange} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="co-email" className={labelClass}>Email</label>
                  <input id="co-email" required type="email" name="email" value={formData.email} readOnly={!!user} onChange={handleInputChange} className={`${inputClass} ${user ? 'bg-surface-sunken cursor-not-allowed' : ''}`} />
                </div>
                <div>
                  <label htmlFor="co-phone" className={labelClass}>
                    Phone <span className="text-gold-deep">*</span>
                  </label>
                  <input id="co-phone" required type="tel" name="phone" pattern="^[0-9+\-\s()]{8,20}$" value={formData.phone} onChange={handleInputChange} className={inputClass} />
                </div>
              </div>
              <div>
                <label htmlFor="co-addr1" className={labelClass}>
                  Address line 1 <span className="text-gold-deep">*</span>
                </label>
                <input id="co-addr1" required type="text" name="addressLine1" value={formData.addressLine1} onChange={handleInputChange} placeholder="House / flat no., building, street" className={inputClass} />
              </div>
              <div>
                <label htmlFor="co-addr2" className={labelClass}>
                  Address line 2 <span className="text-ink-faint font-normal">(optional)</span>
                </label>
                <input id="co-addr2" type="text" name="addressLine2" value={formData.addressLine2} onChange={handleInputChange} placeholder="Area, landmark" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="co-city" className={labelClass}>
                    City <span className="text-gold-deep">*</span>
                  </label>
                  <input id="co-city" required type="text" name="city" value={formData.city} onChange={handleInputChange} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="co-state" className={labelClass}>
                    State <span className="text-gold-deep">*</span>
                  </label>
                  <input id="co-state" required type="text" name="state" value={formData.state} onChange={handleInputChange} className={inputClass} />
                </div>
              </div>
              <div>
                <label htmlFor="co-pincode" className={labelClass}>
                  Pincode <span className="text-gold-deep">*</span>
                </label>
                <input
                  id="co-pincode"
                  required
                  type="text"
                  inputMode="numeric"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handlePincodeChange}
                  onBlur={handlePincodeBlur}
                  placeholder="6-digit pincode"
                  className={inputClass}
                />
                {pincodeServiceable === true && (
                  <p className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-500 mt-1.5">
                    <CheckCircle2 size={13} /> We deliver here — estimated 5–7 business days.
                  </p>
                )}
                {pincodeServiceable === false && (
                  <p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 mt-1.5">
                    <XCircle size={13} /> We don&apos;t deliver to this pincode yet — our team will reach out to arrange it.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || outOfStock.length > 0}
                className="w-full mt-2 bg-gold hover:bg-gold-bright text-on-gold font-bold py-3.5 px-4 rounded-control transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center"
              >
                {isLoading
                  ? 'Processing...'
                  : outOfStock.length > 0
                    ? 'Resolve stock issues to continue'
                    : `Pay ${formatPrice(total)}`}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-xs text-ink-muted">
                <Lock size={12} />
                <span>Secured by Razorpay · UPI, Cards &amp; Netbanking</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
