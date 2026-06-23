"use client";

import { useRouter } from "next/navigation";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useUI } from "@/context/UIContext";
import ProductImage from "@/components/ui/ProductImage";
import { formatPrice } from "@/lib/catalogue-data";

export default function CartDrawer() {
  const { items, updateQuantity, removeItem, cartTotal, cartCount } = useCart();
  const { cartDrawerOpen, closeCartDrawer, openEnquiryModal } = useUI();
  const router = useRouter();

  if (!cartDrawerOpen) return null;

  const handleProceedToEnquiry = () => {
    const summary = items
      .map((item) => `${item.product.name} (Qty: ${item.quantity})`)
      .join(", ");
    closeCartDrawer();
    openEnquiryModal({
      heading: "Send Enquiry",
      prefilledMessage: `I'm interested in the following items: ${summary}.`,
    });
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={closeCartDrawer} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-[#141414] flex flex-col border-l border-[#D4D4D4] dark:border-[#2A2A2A]">
        <div className="flex items-center justify-between p-4 border-b border-[#D4D4D4] dark:border-[#2A2A2A]">
          <h2 className="text-lg font-semibold text-[#0A0A0A] dark:text-[#F5F5F5] font-serif">
            Your Cart ({cartCount} items)
          </h2>
          <button
            onClick={closeCartDrawer}
            className="text-[#555555] dark:text-[#9A9A9A] hover:text-[#D4A017] transition duration-200 ease-in-out"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
              <p className="text-[#555555] dark:text-[#9A9A9A]">Your cart is empty</p>
              <button
                onClick={() => {
                  closeCartDrawer();
                  router.push("/kitchen");
                }}
                className="bg-[#D4A017] hover:bg-[#E8B820] text-[#0A0A0A] font-semibold px-6 py-3 transition duration-200 ease-in-out"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-[#D4D4D4] dark:divide-[#2A2A2A]">
              {items.map((item) => (
                <div key={item.product.slug} className="flex gap-3 p-4">
                  <div className="w-20 h-20 shrink-0 bg-[#EBEBEB] dark:bg-[#1A1A1A] overflow-hidden">
                    <ProductImage
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-20 h-20"
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <span className="text-xs text-[#555555] dark:text-[#9A9A9A]">
                      {item.product.code}
                    </span>
                    <span className="text-sm font-semibold text-[#0A0A0A] dark:text-[#F5F5F5] font-serif">
                      {item.product.name}
                    </span>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center border border-[#D4D4D4] dark:border-[#2A2A2A]">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.slug, item.quantity - 1)
                          }
                          className="p-1 text-[#555555] dark:text-[#9A9A9A] hover:text-[#D4A017]"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-3 text-sm text-[#0A0A0A] dark:text-[#F5F5F5]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.slug, item.quantity + 1)
                          }
                          className="p-1 text-[#555555] dark:text-[#9A9A9A] hover:text-[#D4A017]"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.slug)}
                        className="text-[#555555] dark:text-[#9A9A9A] hover:text-[#D4A017] transition duration-200 ease-in-out"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-xs mt-1">
                      <span className="text-[#555555] dark:text-[#9A9A9A]">
                        {formatPrice(item.product.mrp)} each
                      </span>
                      <span className="text-[#D4A017] font-bold text-sm text-right">
                        {typeof item.product.mrp === "number"
                          ? formatPrice(item.product.mrp * item.quantity)
                          : "Price on request"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-[#D4D4D4] dark:border-[#2A2A2A] p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#555555] dark:text-[#9A9A9A]">Subtotal</span>
              <span className="text-[#D4A017] font-bold text-lg">
                {formatPrice(cartTotal)}
              </span>
            </div>
            <button
              onClick={handleProceedToEnquiry}
              className="bg-[#D4A017] hover:bg-[#E8B820] text-[#0A0A0A] font-semibold py-3 transition duration-200 ease-in-out"
            >
              Proceed to Enquiry
            </button>
            <button
              onClick={closeCartDrawer}
              className="text-sm text-center text-[#555555] dark:text-[#9A9A9A] hover:text-[#D4A017] transition duration-200 ease-in-out"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}