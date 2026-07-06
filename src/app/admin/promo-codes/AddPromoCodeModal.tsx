'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { addPromoCode } from '@/app/admin/actions';

interface AddPromoCodeModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddPromoCodeModal({ onClose, onSuccess }: AddPromoCodeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_value: '',
    expires_at: '',
  });

  // Escape key closes modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Body scroll lock
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
      await addPromoCode({
        code: formData.code,
        discount_type: formData.discount_type,
        discount_value: Number(formData.discount_value),
        min_order_value: formData.min_order_value ? Number(formData.min_order_value) : 0,
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to add promo code');
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
          <h2 className="font-serif text-xl text-[#F5F5F5]">Create Promo Code</h2>
          <p className="text-xs text-[#9A9A9A] mt-1">Create a new discount code for customers.</p>
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
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 focus:border-[#D4A017] focus:outline-none placeholder-[#9A9A9A] rounded-sm transition duration-200 ease-in-out"
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
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 focus:border-[#D4A017] focus:outline-none placeholder-[#9A9A9A] rounded-sm transition duration-200 ease-in-out"
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
              {isSubmitting ? 'Creating...' : 'Create Code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
