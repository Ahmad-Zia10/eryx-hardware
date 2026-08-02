"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useUI } from "@/context/UIContext";
import ProductImage from "@/components/ui/ProductImage";
import { formatPrice, getEffectivePrice } from "@/lib/pricing";

export default function CartDrawer() {
  const { items, updateQuantity, removeItem, cartTotal, cartCount } = useCart();
  const { cartDrawerOpen, closeCartDrawer } = useUI();
  const router = useRouter();

  // Escape-to-close for keyboard users. Registered only while open.
  useEffect(() => {
    if (!cartDrawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCartDrawer();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [cartDrawerOpen, closeCartDrawer]);

  if (!cartDrawerOpen) return null;

  const handleProceedToCheckout = () => {
    closeCartDrawer();
    router.push("/checkout");
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <div className="absolute inset-0 bg-black/60" onClick={closeCartDrawer} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-surface-raised flex flex-col border-l border-line">
        <div className="flex items-center justify-between p-4 border-b border-line">
          <h2 className="text-lg font-semibold text-ink">
            Your Cart ({cartCount} {cartCount === 1 ? "item" : "items"})
          </h2>
          <button
            onClick={closeCartDrawer}
            aria-label="Close cart"
            className="text-ink-muted hover:text-gold-deep transition duration-200 ease-in-out"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
              <p className="text-ink-muted">Your cart is empty</p>
              <button
                onClick={() => {
                  closeCartDrawer();
                  router.push("/kitchen");
                }}
                className="bg-gold hover:bg-gold-bright text-on-gold font-semibold px-6 py-3 rounded-control transition duration-200 ease-in-out"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-line">
              {items.map((item) => {
                const price = getEffectivePrice(item.product);
                return (
                <div key={item.product.slug} className="flex gap-3 p-4">
                  <Link
                    href={`/kitchen/${item.product.slug}`}
                    onClick={closeCartDrawer}
                    className="w-20 h-20 shrink-0 bg-surface-sunken rounded-control overflow-hidden"
                  >
                    <ProductImage
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-20 h-20"
                    />
                  </Link>
                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <span className="text-xs text-ink-faint">
                      {item.product.code}
                    </span>
                    <Link
                      href={`/kitchen/${item.product.slug}`}
                      onClick={closeCartDrawer}
                      className="text-sm font-semibold text-ink hover:text-gold-deep transition-colors duration-200"
                    >
                      {item.product.name}
                    </Link>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center border border-line-strong rounded-control">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.slug, item.quantity - 1)
                          }
                          aria-label="Decrease quantity"
                          className="p-1 text-ink-muted hover:text-gold-deep"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-3 text-sm text-ink">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.slug, item.quantity + 1)
                          }
                          aria-label="Increase quantity"
                          className="p-1 text-ink-muted hover:text-gold-deep"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.slug)}
                        aria-label={`Remove ${item.product.name}`}
                        className="text-ink-muted hover:text-red-500 transition duration-200 ease-in-out"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-xs mt-1">
                      {/* "each" only matters at qty >= 2 */}
                      <span className="text-ink-faint">
                        {item.quantity > 1 ? `${formatPrice(price)} each` : " "}
                      </span>
                      <span className="text-ink font-semibold text-sm text-right">
                        {typeof price === "number"
                          ? formatPrice(price * item.quantity)
                          : "Price on request"}
                      </span>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-line p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-muted">Subtotal</span>
              <span className="text-ink font-bold text-lg">
                {formatPrice(cartTotal)}
              </span>
            </div>
            <p className="text-xs text-ink-faint -mt-1">
              Shipping &amp; taxes calculated at checkout.
            </p>
            <button
              onClick={handleProceedToCheckout}
              className="bg-gold hover:bg-gold-bright text-on-gold font-semibold py-3 rounded-control transition duration-200 ease-in-out"
            >
              Proceed to Checkout
            </button>
            <button
              onClick={closeCartDrawer}
              className="text-sm text-center border border-line text-ink-muted hover:border-gold hover:text-gold-deep py-2.5 rounded-control transition duration-200 ease-in-out"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
