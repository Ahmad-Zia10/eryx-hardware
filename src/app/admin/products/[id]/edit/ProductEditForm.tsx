'use client';

import { useState } from 'react';
import { updateProduct } from '@/app/admin/actions';
import Link from 'next/link';

export default function ProductEditForm({ product }: { product: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    mrp: product.mrp,
    is_active: product.is_active,
    is_featured: product.is_featured,
    is_on_sale: product.is_on_sale || false,
    discount_price: product.discount_price || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await updateProduct(product.id, {
        mrp: Number(formData.mrp),
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        is_on_sale: formData.is_on_sale,
        discount_price: formData.is_on_sale && formData.discount_price ? Number(formData.discount_price) : null,
      });
      // The Server Action handles the redirect on success
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to update product');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow border border-gray-200">
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">MRP (₹)</label>
        <input
          type="number"
          required
          min="0"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#D4A017] focus:outline-none focus:ring-[#D4A017] sm:text-sm"
          value={formData.mrp}
          onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
        />
      </div>

      <div className="flex items-center">
        <input
          id="is_active"
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-[#D4A017] focus:ring-[#D4A017]"
          checked={formData.is_active}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
        />
        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
          Is Active (visible in store)
        </label>
      </div>

      <div className="flex items-center">
        <input
          id="is_featured"
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-[#D4A017] focus:ring-[#D4A017]"
          checked={formData.is_featured}
          onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
        />
        <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-900">
          Is Featured
        </label>
      </div>

      <div className="flex items-center">
        <input
          id="is_on_sale"
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-[#D4A017] focus:ring-[#D4A017]"
          checked={formData.is_on_sale}
          onChange={(e) => setFormData({ ...formData, is_on_sale: e.target.checked })}
        />
        <label htmlFor="is_on_sale" className="ml-2 block text-sm text-gray-900">
          Is On Sale
        </label>
      </div>

      {formData.is_on_sale && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Discount Price (₹)</label>
          <input
            type="number"
            required={formData.is_on_sale}
            min="0"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#D4A017] focus:outline-none focus:ring-[#D4A017] sm:text-sm"
            value={formData.discount_price}
            onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
          />
        </div>
      )}

      <div className="pt-4 flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#1A1A1A] text-white px-4 py-2 rounded-lg hover:bg-black transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
        <Link
          href="/admin/products"
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
