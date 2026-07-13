'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { createClient } from '@/lib/supabase/client';
import { formatPrice, getEffectivePrice } from '@/lib/pricing';
import Script from 'next/script';

type OutOfStockItem = {
  code: string;
  name: string;
  requested: number;
  available: number;
};

export default function CheckoutPage() {
  const { items, cartTotal, clearCart, removeItem } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [outOfStock, setOutOfStock] = useState<OutOfStockItem[]>([]);

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    pincode: '',
  });

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
          shippingDetails: formData,
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
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">Your cart is empty</h2>
        <a href="/" className="text-[#D4A017] hover:underline">Continue shopping</a>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Cart Summary */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-neutral-800 dark:text-neutral-200 border-b border-neutral-200 dark:border-neutral-800 pb-2">Order Summary</h2>
            <div className="space-y-4">
              {items.map((item) => {
                const price = getEffectivePrice(item.product);
                const stale = outOfStock.find((o) => o.code === item.product.code);
                return (
                <div
                  key={item.product.slug}
                  className={`flex flex-col text-sm rounded p-2 ${
                    stale ? 'border border-red-500 bg-red-50 dark:bg-red-950/30' : ''
                  }`}
                >
                  <div className="flex justify-between">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded shrink-0 overflow-hidden">
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">{item.product.name}</p>
                        <p className="text-neutral-500 dark:text-neutral-400">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-neutral-900 dark:text-white font-medium">
                      {typeof price === 'number' ? formatPrice(price * item.quantity) : 'Price on request'}
                    </div>
                  </div>
                  {stale && (
                    <div className="mt-2 flex items-center justify-between text-xs text-red-700 dark:text-red-400">
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
                  className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:border-[#D4A017]"
                />
                <button 
                  onClick={handleApplyPromo}
                  disabled={promoLoading || !promoCode}
                  className="bg-neutral-900 dark:bg-neutral-800 text-white px-4 py-2 rounded-md hover:bg-neutral-800 transition disabled:opacity-50"
                  type="button"
                >
                  {promoLoading ? '...' : 'Apply'}
                </button>
              </div>
              {promoError && <p className="text-red-500 text-xs mt-2">{promoError}</p>}
            </div>
            
            <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400 mb-2 text-sm">
                <span>Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between text-green-600 dark:text-green-500 mb-2 text-sm">
                  <span>Discount ({appliedPromo.code})</span>
                  <span>-{formatPrice(appliedPromo.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg text-neutral-900 dark:text-white pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <span>Total</span>
                <span>{formatPrice(cartTotal - (appliedPromo?.discount_amount || 0))}</span>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-neutral-800 dark:text-neutral-200 border-b border-neutral-200 dark:border-neutral-800 pb-2">Shipping Details</h2>
            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Full Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#D4A017] focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Email</label>
                  <input required type="email" name="email" value={formData.email} readOnly={!!user} onChange={handleInputChange} className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white cursor-not-allowed focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Phone</label>
                  <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#D4A017] focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Address</label>
                <textarea required name="address" rows={2} value={formData.address} onChange={handleInputChange} className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#D4A017] focus:outline-none"></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">City</label>
                  <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#D4A017] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Pincode</label>
                  <input required type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#D4A017] focus:outline-none" />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading || outOfStock.length > 0}
                className="w-full mt-6 bg-[#D4A017] hover:bg-[#B8860B] text-white font-bold py-3 px-4 rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center"
              >
                {isLoading
                  ? 'Processing...'
                  : outOfStock.length > 0
                    ? 'Resolve stock issues to continue'
                    : `Pay ${formatPrice(cartTotal - (appliedPromo?.discount_amount || 0))}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
