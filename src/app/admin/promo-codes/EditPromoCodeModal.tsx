'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { updatePromoCode } from '@/app/admin/actions';

interface EditPromoCodeModalProps {
  promoCode: {
    id: string;
    code: string;
    discount_type: string;
    discount_value: number;
    min_order_value: number | null;
    expires_at: string | null;
    max_uses_per_user: number | null;
    description: string | null;
    is_public: boolean | null;
  };
  onClose: () => void;
  onSuccess: () => void;
}

// Convert a stored ISO timestamp to the YYYY-MM-DD string an <input
// type="date"> needs. Returns '' for null/undefined.
function toDateInputValue(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export default function EditPromoCodeModal({ promoCode, onClose, onSuccess }: EditPromoCodeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: promoCode.code || '',
    discount_type: promoCode.discount_type || 'percentage',
    discount_value: String(promoCode.discount_value ?? ''),
    min_order_value: promoCode.min_order_value != null ? String(promoCode.min_order_value) : '',
    expires_at: toDateInputValue(promoCode.expires_at),
    max_uses_per_user: String(promoCode.max_uses_per_user ?? 1),
    description: promoCode.description ?? '',
    is_public: Boolean(promoCode.is_public),
  });

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await updatePromoCode(promoCode.id, {
        code: formData.code,
        discount_type: formData.discount_type,
        discount_value: Number(formData.discount_value),
        min_order_value: formData.min_order_value ? Number(formData.min_order_value) : 0,
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
        max_uses_per_user: formData.max_uses_per_user ? Number(formData.max_uses_per_user) : 1,
        description: formData.description,
        is_public: formData.is_public,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to update promo code');
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#141414] border border-[#2A2A2A] rounded-sm max-w-lg w-full my-auto p-6 relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#9A9A9A] hover:text-[#D4A017] transition-colors"
        >
          <X size={20} />
        </button>

        <div className="mb-6">
          <h2 className="font-serif text-xl text-[#F5F5F5]">Edit Promo Code</h2>
          <p className="text-xs text-[#9A9A9A] mt-1">
            Changes apply to future uses only. Historical usage records are unaffected.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-sm text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-[#F5F5F5] mb-2">Code *</label>
            <input
              type="text"
              required
              placeholder="e.g. SUMMER20"
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 focus:border-[#D4A017] focus:outline-none placeholder-[#555555] rounded-sm transition duration-200 ease-in-out uppercase"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-[#F5F5F5] mb-2">Discount Type *</label>
              <select
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 focus:border-[#D4A017] focus:outline-none rounded-sm transition duration-200 ease-in-out"
                value={formData.discount_type}
                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-[#F5F5F5] mb-2">Discount Value *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 focus:border-[#D4A017] focus:outline-none rounded-sm transition duration-200 ease-in-out"
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-[#F5F5F5] mb-2">Min Order Value (₹)</label>
              <input
                type="number"
                min="0"
                placeholder="Optional"
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 focus:border-[#D4A017] focus:outline-none placeholder-[#555555] rounded-sm transition duration-200 ease-in-out"
                value={formData.min_order_value}
                onChange={(e) => setFormData({ ...formData, min_order_value: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-[#F5F5F5] mb-2">Expires At</label>
              <input
                type="date"
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 focus:border-[#D4A017] focus:outline-none placeholder-[#555555] rounded-sm transition duration-200 ease-in-out"
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#F5F5F5] mb-2">Max Uses Per User</label>
            <input
              type="number"
              min="1"
              required
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 focus:border-[#D4A017] focus:outline-none rounded-sm transition duration-200 ease-in-out"
              value={formData.max_uses_per_user}
              onChange={(e) => setFormData({ ...formData, max_uses_per_user: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm text-[#F5F5F5] mb-2">Description</label>
            <input
              type="text"
              placeholder="e.g. 10% off summer sale"
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 focus:border-[#D4A017] focus:outline-none placeholder-[#555555] rounded-sm transition duration-200 ease-in-out"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <p className="text-xs text-[#9A9A9A] mt-1">Shown next to the code on the checkout page.</p>
          </div>

          <div>
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 accent-[#D4A017] bg-[#1A1A1A] border-[#2A2A2A]"
                checked={formData.is_public}
                onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
              />
              <span>
                <span className="block text-sm text-[#F5F5F5]">Show in checkout list (public)</span>
                <span className="block text-xs text-[#9A9A9A] mt-0.5">
                  When enabled, this code is listed on the checkout page for logged-in customers. Private codes still work if typed.
                </span>
              </span>
            </label>
          </div>

          <div className="pt-4 flex gap-3 justify-end border-t border-[#2A2A2A]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="border border-[#2A2A2A] text-[#9A9A9A] hover:border-[#D4A017] hover:text-[#D4A017] px-4 py-2 text-sm transition duration-200 ease-in-out rounded-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#D4A017] hover:bg-[#E8B820] text-[#0A0A0A] font-semibold px-4 py-2 text-sm transition duration-200 ease-in-out rounded-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
