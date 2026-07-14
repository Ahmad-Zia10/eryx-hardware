'use client';

import { Fragment, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronDown, ChevronUp, Edit, Plus, Trash2, Package } from 'lucide-react';
import { deleteParentProduct, removeProductVariant } from '@/app/admin/actions';
import ProductEditModal from './ProductEditModal';
import AddProductModal from './AddProductModal';
import ProductParentEditModal from './ProductParentEditModal';
import AddVariantModal from './AddVariantModal';
import AdjustStockModal from '@/components/admin/AdjustStockModal';
import { LOW_STOCK_THRESHOLD } from '@/constants';

function formatPrice(mrp: number | null): string {
  return typeof mrp === 'number' ? `₹${mrp.toLocaleString('en-IN')}` : 'POA';
}

function priceRange(variants: any[]): string {
  const active = variants.filter((v) => v.is_active && v.mrp != null);
  if (active.length === 0) return 'POA';
  const prices = active.map((v) => Number(v.mrp));
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return formatPrice(min);
  return `${formatPrice(min)} – ${formatPrice(max)}`;
}

function totalStock(variants: any[]): { total: number; tracked: boolean } {
  const tracked = variants.filter((v) => v.track_inventory !== false);
  if (tracked.length === 0) return { total: 0, tracked: false };
  return {
    total: tracked.reduce((sum, v) => sum + (v.stock_quantity ?? 0), 0),
    tracked: true,
  };
}

function stockToneClass(qty: number): string {
  if (qty <= 0) return 'bg-red-500/10 text-red-400 border-red-500/30';
  if (qty < LOW_STOCK_THRESHOLD) return 'bg-red-500/10 text-red-400 border-red-500/30';
  if (qty < LOW_STOCK_THRESHOLD * 2) return 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30';
  return 'bg-green-500/10 text-green-400 border-green-500/30';
}

export default function ProductsTable({ products }: { products: any[] }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [selectedParent, setSelectedParent] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isParentEditModalOpen, setIsParentEditModalOpen] = useState(false);
  const [isAddVariantModalOpen, setIsAddVariantModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [stockVariant, setStockVariant] = useState<any | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    if (!term) return true;
    if (p.name?.toLowerCase().includes(term)) return true;
    return (p.product_variants || []).some(
      (v: any) =>
        v.item_code?.toLowerCase().includes(term) ||
        v.name?.toLowerCase().includes(term)
    );
  });

  const toggleExpand = (id: string) => {
    setExpandedParents((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const openVariantEdit = (parent: any, variant: any) => {
    setSelectedParent(parent);
    setSelectedVariant(variant);
    setIsEditModalOpen(true);
  };

  const handleRemoveVariant = async (variant: any) => {
    if (!window.confirm(`Remove variant ${variant.item_code}? Variants with history will be deactivated instead of hard-deleted.`)) return;
    setActionError(null);
    try {
      await removeProductVariant(variant.id);
      router.refresh();
    } catch (err: any) {
      setActionError(err.message || 'Failed to remove variant');
    }
  };

  const handleDeleteProduct = async (parent: any) => {
    if (!window.confirm(`Delete or deactivate ${parent.name}? Products with order/review history will be deactivated.`)) return;
    setActionError(null);
    try {
      await deleteParentProduct(parent.id);
      router.refresh();
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete product');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9A9A] h-5 w-5" />
          <input
            type="text"
            placeholder="Search by name or item code..."
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm pl-10 pr-4 py-2.5 focus:border-[#D4A017] focus:outline-none placeholder-[#9A9A9A] rounded-sm transition duration-200 ease-in-out"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#D4A017] hover:bg-[#E8B820] text-[#0A0A0A] font-semibold px-4 py-2.5 text-sm transition duration-200 ease-in-out rounded-sm ml-4"
        >
          Add Product
        </button>
      </div>

      {actionError && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-sm text-sm">
          {actionError}
        </div>
      )}

      <div className="w-full border border-[#2A2A2A] rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#2A2A2A]">
            <thead className="bg-[#1A1A1A] border-b border-[#2A2A2A]">
              <tr>
                <th className="px-4 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A] w-8"></th>
                <th className="px-4 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Product</th>
                <th className="px-4 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Variants</th>
                <th className="px-4 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Price Range</th>
                <th className="px-4 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Stock</th>
                <th className="px-4 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Status</th>
                <th className="px-4 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Tags</th>
                <th className="px-4 py-3 text-right text-xs tracking-widest uppercase text-[#9A9A9A]">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-[#0A0A0A] divide-y divide-[#2A2A2A]">
              {filteredProducts.map((parent) => {
                const variants = parent.product_variants || [];
                const isExpanded = expandedParents.has(parent.id);
                const hasMultiple = variants.length > 1;

                return (
                  <Fragment key={parent.id}>
                    {/* Parent row */}
                    <tr
                      key={parent.id}
                      className="hover:bg-[#1A1A1A] transition duration-150 ease-in-out"
                    >
                      <td className="px-4 py-3 w-8">
                        {hasMultiple && (
                          <button
                            onClick={() => toggleExpand(parent.id)}
                            className="text-[#9A9A9A] hover:text-[#D4A017] transition-colors"
                            aria-label={isExpanded ? 'Collapse variants' : 'Expand variants'}
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-[#F5F5F5]">{parent.name}</div>
                        <div className="text-xs text-[#9A9A9A] mt-0.5">{parent.category}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#9A9A9A]">
                        {variants.length} {variants.length === 1 ? 'variant' : 'variants'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-[#F5F5F5]">
                        {priceRange(variants)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {(() => {
                          // Single-variant products show the concrete
                          // variant's stock (aggregate == the one row);
                          // multi-variant shows the summed aggregate.
                          if (variants.length === 1) {
                            const v = variants[0];
                            if (v.track_inventory === false) {
                              return <span className="text-[#555555] text-xs">Not tracked</span>;
                            }
                            return (
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-sm border ${stockToneClass(v.stock_quantity ?? 0)}`}>
                                {v.stock_quantity ?? 0}
                              </span>
                            );
                          }
                          const s = totalStock(variants);
                          if (!s.tracked) return <span className="text-[#555555]">—</span>;
                          return (
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-sm border ${stockToneClass(s.total)}`}>
                              {s.total}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-sm ${parent.is_active ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                          {parent.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {parent.is_featured && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-sm bg-[#D4A017]/10 text-[#D4A017] border border-[#D4A017]/30">
                            Featured
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => { setSelectedParent(parent); setIsParentEditModalOpen(true); }}
                            className="text-[#9A9A9A] hover:text-[#D4A017]"
                            title="Edit product"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => { setSelectedParent(parent); setIsAddVariantModalOpen(true); }}
                            className="text-[#9A9A9A] hover:text-[#D4A017]"
                            title="Add variant"
                          >
                            <Plus size={15} />
                          </button>
                          {variants.length === 1 && (
                            <>
                              <button
                                type="button"
                                onClick={() => setStockVariant(variants[0])}
                                className="text-[#9A9A9A] hover:text-[#D4A017]"
                                title="Adjust stock"
                              >
                                <Package size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => openVariantEdit(parent, variants[0])}
                                className="text-[#9A9A9A] hover:text-[#D4A017]"
                                title="Edit variant"
                              >
                                <Edit size={15} />
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(parent)}
                            className="text-[#9A9A9A] hover:text-red-400"
                            title="Delete or deactivate product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded variant rows */}
                    {isExpanded && variants.map((variant: any) => (
                      <tr
                        key={variant.id}
                        className="bg-[#111111] hover:bg-[#181818] transition duration-150 ease-in-out cursor-pointer border-t border-[#2A2A2A]/50"
                        onClick={() => openVariantEdit(parent, variant)}
                      >
                        <td className="px-4 py-2.5"></td>
                        <td className="px-4 py-2.5 pl-8">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#9A9A9A] font-mono">{variant.item_code}</span>
                            {variant.is_default && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-[#D4A017]/10 text-[#D4A017] border border-[#D4A017]/30">Default</span>
                            )}
                          </div>
                          {variant.finish && (
                            <div className="text-xs text-[#555555] mt-0.5">{variant.finish}</div>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-[#555555]">
                          {variant.dimension_notes || '—'}
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap text-sm">
                          {variant.mrp ? (
                            <span className="text-[#F5F5F5]">
                              ₹{Number(variant.mrp).toLocaleString('en-IN')}
                              {variant.is_on_sale && (
                                <span className="ml-2 text-xs text-[#D4A017]">
                                  (Sale: ₹{Number(variant.discount_price)?.toLocaleString('en-IN')})
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-[#555555]">POA</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap text-sm">
                          {variant.track_inventory === false ? (
                            <span className="text-[#555555] text-xs">Not tracked</span>
                          ) : (
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-sm border ${stockToneClass(variant.stock_quantity ?? 0)}`}>
                              {variant.stock_quantity ?? 0}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-sm ${variant.is_active ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                            {variant.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5"></td>
                        <td className="px-4 py-2.5 text-xs text-[#555555]">
                          <div className="flex justify-end gap-2 items-center">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                setStockVariant(variant);
                              }}
                              className="text-[#9A9A9A] hover:text-[#D4A017]"
                              title="Adjust stock"
                            >
                              <Package size={14} />
                            </button>
                            <span>Edit</span>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleRemoveVariant(variant);
                              }}
                              className="text-[#9A9A9A] hover:text-red-400"
                              title="Remove variant"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {/* Single-variant products — make the parent row itself clickable */}
                    {!hasMultiple && variants.length === 1 && (
                      <tr
                        key={`${parent.id}-single-action`}
                        className="hidden"
                        onClick={() => openVariantEdit(parent, variants[0])}
                      />
                    )}
                  </Fragment>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-[#9A9A9A]">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isEditModalOpen && selectedVariant && (
        <ProductEditModal
          product={selectedVariant}
          onClose={() => { setIsEditModalOpen(false); setSelectedVariant(null); setSelectedParent(null); }}
          onSuccess={() => router.refresh()}
        />
      )}

      {isParentEditModalOpen && selectedParent && (
        <ProductParentEditModal
          product={selectedParent}
          onClose={() => { setIsParentEditModalOpen(false); setSelectedParent(null); }}
          onSuccess={() => router.refresh()}
        />
      )}

      {isAddVariantModalOpen && selectedParent && (
        <AddVariantModal
          parent={selectedParent}
          onClose={() => { setIsAddVariantModalOpen(false); setSelectedParent(null); }}
          onSuccess={() => router.refresh()}
        />
      )}

      {isAddModalOpen && (
        <AddProductModal
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => router.refresh()}
        />
      )}

      {stockVariant && (
        <AdjustStockModal
          variant={stockVariant}
          onClose={() => setStockVariant(null)}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  );
}
