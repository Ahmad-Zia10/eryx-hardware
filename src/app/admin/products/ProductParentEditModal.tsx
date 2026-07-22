'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { updateParentProduct } from '@/app/admin/actions';
import { Toggle } from '@/components/ui/Toggle';
import { getCategoriesForLine } from '@/lib/catalogue-data';

export default function ProductParentEditModal({
  product,
  onClose,
  onSuccess,
}: {
  product: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: product.name || '',
    description: product.description || '',
    category: product.category || getCategoriesForLine('kitchen')[0],
    product_line: product.product_line || 'kitchen',
    is_active: product.is_active !== false,
    is_featured: product.is_featured || false,
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await updateParentProduct(product.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        category: formData.category,
        product_line: formData.product_line,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update product');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-sm max-w-2xl w-full p-6 relative" onClick={(event) => event.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-[#9A9A9A] hover:text-[#D4A017]">
          <X size={20} />
        </button>
        <h2 className="font-serif text-xl text-[#F5F5F5] mb-6">Edit Product</h2>

        {error && <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-sm text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            required
            value={formData.name}
            onChange={(event) => setFormData({ ...formData, name: event.target.value })}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 rounded-sm"
            placeholder="Product name"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={formData.category}
              onChange={(event) => setFormData({ ...formData, category: event.target.value })}
              className="bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 rounded-sm"
            >
              {(() => {
                const opts = getCategoriesForLine(formData.product_line);
                const withCurrent =
                  formData.category && !opts.includes(formData.category)
                    ? [formData.category, ...opts]
                    : opts;
                return withCurrent.map((category) => <option key={category} value={category}>{category}</option>);
              })()}
            </select>
            <select
              value={formData.product_line}
              onChange={(event) => {
                const line = event.target.value;
                setFormData({ ...formData, product_line: line, category: getCategoriesForLine(line)[0] });
              }}
              className="bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 rounded-sm"
            >
              <option value="kitchen">Kitchen</option>
              <option value="wardrobe">Wardrobe</option>
              <option value="hardware">Hardware</option>
            </select>
          </div>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(event) => setFormData({ ...formData, description: event.target.value })}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 rounded-sm"
            placeholder="Description"
          />
          <div className="flex flex-wrap gap-6">
            <Toggle checked={formData.is_active} onChange={(value) => setFormData({ ...formData, is_active: value })} label="Active" />
            <Toggle checked={formData.is_featured} onChange={(value) => setFormData({ ...formData, is_featured: value })} label="Featured" />
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-[#2A2A2A]">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="border border-[#2A2A2A] text-[#9A9A9A] px-4 py-2 text-sm rounded-sm">Cancel</button>
            <button disabled={isSubmitting} className="bg-[#D4A017] hover:bg-[#E8B820] text-[#0A0A0A] font-semibold px-4 py-2 text-sm rounded-sm">
              {isSubmitting ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
