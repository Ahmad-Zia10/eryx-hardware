'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { updateProduct } from '@/app/admin/actions';
import { Toggle } from '@/components/ui/Toggle';

interface ProductEditModalProps {
  product: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductEditModal({ product, onClose, onSuccess }: ProductEditModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    mrp: product.mrp || '',
    is_active: product.is_active,
    is_featured: product.is_featured,
    is_on_sale: product.is_on_sale || false,
    discount_price: product.discount_price || '',
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
      await updateProduct(product.id, {
        mrp: formData.mrp ? Number(formData.mrp) : null,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        is_on_sale: formData.is_on_sale,
        discount_price: formData.is_on_sale && formData.discount_price ? Number(formData.discount_price) : null,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to update product');
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      <div 
        className="bg-[#141414] border border-[#2A2A2A] rounded-sm max-w-lg w-full mx-4 p-6 relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-[#9A9A9A] hover:text-[#D4A017] transition-colors"
        >
          <X size={20} />
        </button>

        <div className="mb-6">
          <h2 className="font-serif text-xl text-[#F5F5F5]">{product.name}</h2>
          <p className="text-xs text-[#9A9A9A] mt-1">{product.item_code}</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-sm text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-[#F5F5F5] mb-2">MRP (₹)</label>
            <input
              type="number"
              min="0"
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 focus:border-[#D4A017] focus:outline-none placeholder-[#9A9A9A] rounded-sm transition duration-200 ease-in-out"
              value={formData.mrp}
              onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-4 py-2">
            <Toggle 
              checked={formData.is_active} 
              onChange={(v) => setFormData({ ...formData, is_active: v })} 
              label="Is Active (visible on site)" 
            />
            <Toggle 
              checked={formData.is_featured} 
              onChange={(v) => setFormData({ ...formData, is_featured: v })} 
              label="Featured (Top Picks)" 
            />
            <Toggle 
              checked={formData.is_on_sale} 
              onChange={(v) => setFormData({ ...formData, is_on_sale: v })} 
              label="On Sale" 
            />
          </div>

          <div>
            <label className={`block text-sm mb-2 ${formData.is_on_sale ? 'text-[#F5F5F5]' : 'text-[#555555]'}`}>
              Discount Price (₹)
            </label>
            <input
              type="number"
              required={formData.is_on_sale}
              min="0"
              disabled={!formData.is_on_sale}
              className={`w-full bg-[#1A1A1A] border text-sm px-4 py-2.5 rounded-sm transition duration-200 ease-in-out ${
                formData.is_on_sale 
                  ? 'border-[#2A2A2A] text-[#F5F5F5] focus:border-[#D4A017] focus:outline-none placeholder-[#9A9A9A]' 
                  : 'border-[#1A1A1A] text-[#555555] cursor-not-allowed opacity-50'
              }`}
              value={formData.discount_price}
              onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
            />
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
