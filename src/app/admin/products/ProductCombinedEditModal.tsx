'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { updateParentProduct, updateProduct } from '@/app/admin/actions';
import { Toggle } from '@/components/ui/Toggle';
import { CATEGORIES } from '@/lib/catalogue-data';
import ProductImageManager from './ProductImageManager';

interface Props {
  parent: any;
  variant: any;
  onClose: () => void;
  onSuccess: () => void;
}

type TabId = 'product' | 'variant';

// Combined edit surface for single-variant products. Merges what used
// to be two separate modals (ProductParentEditModal + ProductEditModal)
// into a single tabbed dialog so admins can't accidentally toggle
// is_active on only one of the two backing tables and wonder why
// public visibility didn't change.
export default function ProductCombinedEditModal({ parent, variant, onClose, onSuccess }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('product');
  const [submitting, setSubmitting] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);
  const [variantError, setVariantError] = useState<string | null>(null);
  const [productSavedNotice, setProductSavedNotice] = useState(false);

  const [productForm, setProductForm] = useState({
    name: parent.name || '',
    description: parent.description || '',
    category: parent.category || CATEGORIES[0],
    product_line: parent.product_line || 'kitchen',
    is_active: parent.is_active !== false,
    is_featured: parent.is_featured || false,
  });

  const [variantForm, setVariantForm] = useState({
    mrp: variant.mrp || '',
    is_active: variant.is_active,
    is_featured: variant.is_featured,
    is_on_sale: variant.is_on_sale || false,
    discount_price: variant.discount_price || '',
    external_price_url: variant.external_price_url || '',
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
    if (submitting) return;

    setSubmitting(true);
    setProductError(null);
    setVariantError(null);

    // 1. Parent update first.
    try {
      await updateParentProduct(parent.id, {
        name: productForm.name.trim(),
        description: productForm.description.trim() || null,
        category: productForm.category,
        product_line: productForm.product_line,
        is_active: productForm.is_active,
        is_featured: productForm.is_featured,
      });
    } catch (err: any) {
      setProductError(err.message || 'Failed to save product details');
      setActiveTab('product');
      setSubmitting(false);
      return;
    }

    // 2. Variant update — if this fails after parent succeeded, the
    // parent-side changes are already committed. The modal surfaces
    // this explicitly rather than silently rolling back.
    try {
      await updateProduct(variant.id, {
        mrp: variantForm.mrp ? Number(variantForm.mrp) : null,
        is_active: variantForm.is_active,
        is_featured: variantForm.is_featured,
        is_on_sale: variantForm.is_on_sale,
        discount_price:
          variantForm.is_on_sale && variantForm.discount_price
            ? Number(variantForm.discount_price)
            : null,
        external_price_url: variantForm.external_price_url || null,
      });
    } catch (err: any) {
      setProductSavedNotice(true);
      setVariantError(err.message || 'Failed to save variant details');
      setActiveTab('variant');
      setSubmitting(false);
      return;
    }

    onSuccess();
    onClose();
  };

  const tabButtonClass = (tab: TabId) =>
    `px-4 py-2 text-sm font-medium rounded-sm transition-colors ${
      activeTab === tab
        ? 'bg-[#D4A017] text-[#0A0A0A]'
        : 'text-[#9A9A9A] hover:text-[#F5F5F5] border border-[#2A2A2A]'
    }`;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#141414] border border-[#2A2A2A] rounded-sm max-w-3xl w-full p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#9A9A9A] hover:text-[#D4A017] transition-colors"
        >
          <X size={20} />
        </button>

        <div className="mb-4">
          <h2 className="font-serif text-xl text-[#F5F5F5]">{parent.name}</h2>
          <p className="text-xs text-[#9A9A9A] mt-1 font-mono">{variant.item_code}</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button type="button" onClick={() => setActiveTab('product')} className={tabButtonClass('product')}>
            Product
          </button>
          <button type="button" onClick={() => setActiveTab('variant')} className={tabButtonClass('variant')}>
            Variant
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {activeTab === 'product' && (
            <div className="space-y-5">
              {productError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-sm text-sm">
                  {productError}
                </div>
              )}

              <div>
                <label className="block text-xs uppercase tracking-widest text-[#9A9A9A] mb-2">Name</label>
                <input
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 rounded-sm focus:border-[#D4A017] focus:outline-none"
                  placeholder="Product name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#9A9A9A] mb-2">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 rounded-sm focus:border-[#D4A017] focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#9A9A9A] mb-2">Product line</label>
                  <select
                    value={productForm.product_line}
                    onChange={(e) => setProductForm({ ...productForm, product_line: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 rounded-sm focus:border-[#D4A017] focus:outline-none"
                  >
                    <option value="kitchen">Kitchen</option>
                    <option value="wardrobe">Wardrobe</option>
                    <option value="hardware">Hardware</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-[#9A9A9A] mb-2">Description</label>
                <textarea
                  rows={4}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 rounded-sm focus:border-[#D4A017] focus:outline-none"
                  placeholder="Description"
                />
              </div>

              <div className="flex flex-col gap-4 py-2">
                <Toggle
                  checked={productForm.is_active}
                  onChange={(v) => setProductForm({ ...productForm, is_active: v })}
                  label="Product active (affects the catalogue overall)"
                />
                <Toggle
                  checked={productForm.is_featured}
                  onChange={(v) => setProductForm({ ...productForm, is_featured: v })}
                  label="Featured (parent-level flag)"
                />
              </div>
            </div>
          )}

          {activeTab === 'variant' && (
            <div className="space-y-5">
              {variantError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-sm text-sm">
                  <p className="font-semibold mb-1">Variant save failed</p>
                  <p>{variantError}</p>
                  {productSavedNotice && (
                    <p className="mt-2 text-xs text-red-300">
                      Note: your Product-tab changes were saved successfully before this error. Only the variant fields need to be retried.
                    </p>
                  )}
                </div>
              )}

              <div className="pb-6 border-b border-[#2A2A2A]">
                <ProductImageManager productId={variant.id} initialImages={variant.product_images || []} />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-[#9A9A9A] mb-2">MRP (₹)</label>
                <input
                  type="number"
                  min="0"
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 rounded-sm focus:border-[#D4A017] focus:outline-none"
                  value={variantForm.mrp}
                  onChange={(e) => setVariantForm({ ...variantForm, mrp: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-[#9A9A9A] mb-2">
                  External price comparison URL
                </label>
                <input
                  type="url"
                  value={variantForm.external_price_url}
                  onChange={(e) => setVariantForm({ ...variantForm, external_price_url: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 rounded-sm focus:border-[#D4A017] focus:outline-none"
                  placeholder="https://example.com/product"
                />
              </div>

              <div className="flex flex-col gap-4 py-2">
                <Toggle
                  checked={variantForm.is_active}
                  onChange={(v) => setVariantForm({ ...variantForm, is_active: v })}
                  label="Variant active (this specific SKU — required for public visibility)"
                />
                <Toggle
                  checked={variantForm.is_featured}
                  onChange={(v) => setVariantForm({ ...variantForm, is_featured: v })}
                  label="Featured (Top Picks — SKU-level flag)"
                />
                <Toggle
                  checked={variantForm.is_on_sale}
                  onChange={(v) => setVariantForm({ ...variantForm, is_on_sale: v })}
                  label="On sale"
                />
              </div>

              <div>
                <label
                  className={`block text-xs uppercase tracking-widest mb-2 ${
                    variantForm.is_on_sale ? 'text-[#9A9A9A]' : 'text-[#555555]'
                  }`}
                >
                  Discount price (₹)
                </label>
                <input
                  type="number"
                  required={variantForm.is_on_sale}
                  min="0"
                  disabled={!variantForm.is_on_sale}
                  className={`w-full bg-[#1A1A1A] border text-sm px-4 py-2.5 rounded-sm ${
                    variantForm.is_on_sale
                      ? 'border-[#2A2A2A] text-[#F5F5F5] focus:border-[#D4A017] focus:outline-none'
                      : 'border-[#1A1A1A] text-[#555555] cursor-not-allowed opacity-50'
                  }`}
                  value={variantForm.discount_price}
                  onChange={(e) => setVariantForm({ ...variantForm, discount_price: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3 border-t border-[#2A2A2A]">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="border border-[#2A2A2A] text-[#9A9A9A] hover:border-[#D4A017] hover:text-[#D4A017] px-4 py-2 text-sm rounded-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#D4A017] hover:bg-[#E8B820] text-[#0A0A0A] font-semibold px-4 py-2 text-sm rounded-sm disabled:opacity-50"
            >
              {submitting ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
