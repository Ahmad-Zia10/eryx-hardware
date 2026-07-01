'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { addProduct } from '@/app/admin/actions';
import { Toggle } from '@/components/ui/Toggle';
import { CATEGORIES } from '@/lib/catalogue-data';

interface AddProductModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddProductModal({ onClose, onSuccess }: AddProductModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    item_code: '',
    name: '',
    category: CATEGORIES[0],
    product_line: 'kitchen',
    finish: '',
    material: '',
    dimension_notes: '',
    mrp: '',
    description: '',
    image_url: '',
    is_active: true,
    is_featured: false,
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
      await addProduct({
        ...formData,
        mrp: formData.mrp ? Number(formData.mrp) : null,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to add product');
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-[#141414] border border-[#2A2A2A] rounded-sm max-w-2xl w-full my-auto p-6 relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-[#9A9A9A] hover:text-[#D4A017] transition-colors"
        >
          <X size={20} />
        </button>

        <div className="mb-6">
          <h2 className="font-serif text-xl text-[#F5F5F5]">Add New Product</h2>
          <p className="text-xs text-[#9A9A9A] mt-1">Create a new product listing in the catalogue.</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-sm text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-[#F5F5F5] mb-2">Item Code *</label>
              <input
                type="text"
                required
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 focus:border-[#D4A017] focus:outline-none placeholder-[#9A9A9A] rounded-sm transition duration-200 ease-in-out"
                value={formData.item_code}
                onChange={(e) => setFormData({ ...formData, item_code: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-[#F5F5F5] mb-2">Product Name *</label>
              <input
                type="text"
                required
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 focus:border-[#D4A017] focus:outline-none placeholder-[#9A9A9A] rounded-sm transition duration-200 ease-in-out"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-[#F5F5F5] mb-2">Category *</label>
              <select
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 focus:border-[#D4A017] focus:outline-none placeholder-[#9A9A9A] rounded-sm transition duration-200 ease-in-out"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-[#F5F5F5] mb-2">Product Line *</label>
              <select
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 focus:border-[#D4A017] focus:outline-none placeholder-[#9A9A9A] rounded-sm transition duration-200 ease-in-out"
                value={formData.product_line}
                onChange={(e) => setFormData({ ...formData, product_line: e.target.value })}
              >
                <option value="kitchen">Kitchen</option>
                <option value="wardrobe">Wardrobe</option>
                <option value="hardware">Hardware</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-[#F5F5F5] mb-2">Finish</label>
              <input
                type="text"
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 focus:border-[#D4A017] focus:outline-none placeholder-[#9A9A9A] rounded-sm transition duration-200 ease-in-out"
                value={formData.finish}
                onChange={(e) => setFormData({ ...formData, finish: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-[#F5F5F5] mb-2">Material</label>
              <input
                type="text"
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 focus:border-[#D4A017] focus:outline-none placeholder-[#9A9A9A] rounded-sm transition duration-200 ease-in-out"
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-[#F5F5F5] mb-2">Dimensions (Notes)</label>
              <input
                type="text"
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 focus:border-[#D4A017] focus:outline-none placeholder-[#9A9A9A] rounded-sm transition duration-200 ease-in-out"
                value={formData.dimension_notes}
                onChange={(e) => setFormData({ ...formData, dimension_notes: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-[#F5F5F5] mb-2">MRP (₹)</label>
              <input
                type="number"
                min="0"
                placeholder="Leave blank for 'Price on Request'"
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 focus:border-[#D4A017] focus:outline-none placeholder-[#9A9A9A] rounded-sm transition duration-200 ease-in-out"
                value={formData.mrp}
                onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#F5F5F5] mb-2">Image URL</label>
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 focus:border-[#D4A017] focus:outline-none placeholder-[#555555] rounded-sm transition duration-200 ease-in-out"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm text-[#F5F5F5] mb-2">Description</label>
            <textarea
              rows={3}
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 focus:border-[#D4A017] focus:outline-none placeholder-[#9A9A9A] rounded-sm transition duration-200 ease-in-out"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-6 py-2">
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
              {isSubmitting ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
