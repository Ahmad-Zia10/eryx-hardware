'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { addProductVariant } from '@/app/admin/actions';
import { Toggle } from '@/components/ui/Toggle';

export default function AddVariantModal({
  parent,
  onClose,
  onSuccess,
}: {
  parent: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    item_code: '',
    name: '',
    finish: '',
    material: '',
    dimension_notes: '',
    mrp: '',
    external_price_url: '',
    is_default: false,
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await addProductVariant(parent.id, {
        item_code: formData.item_code.trim(),
        name: formData.name.trim() || parent.name,
        finish: formData.finish.trim() || null,
        material: formData.material.trim() || null,
        dimension_notes: formData.dimension_notes.trim() || null,
        mrp: formData.mrp ? Number(formData.mrp) : null,
        external_price_url: formData.external_price_url.trim() || null,
        is_default: formData.is_default,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add variant');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-sm max-w-2xl w-full p-6 relative" onClick={(event) => event.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-[#9A9A9A] hover:text-[#D4A017]">
          <X size={20} />
        </button>
        <h2 className="font-serif text-xl text-[#F5F5F5] mb-1">Add Variant</h2>
        <p className="text-xs text-[#9A9A9A] mb-6">{parent.name}</p>

        {error && <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-sm text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required value={formData.item_code} onChange={(event) => setFormData({ ...formData, item_code: event.target.value })} className="bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 rounded-sm" placeholder="Item code *" />
            <input value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} className="bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 rounded-sm" placeholder="Variant name" />
            <input value={formData.finish} onChange={(event) => setFormData({ ...formData, finish: event.target.value })} className="bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 rounded-sm" placeholder="Finish" />
            <input value={formData.material} onChange={(event) => setFormData({ ...formData, material: event.target.value })} className="bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 rounded-sm" placeholder="Material" />
            <input value={formData.dimension_notes} onChange={(event) => setFormData({ ...formData, dimension_notes: event.target.value })} className="bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 rounded-sm" placeholder="Dimensions" />
            <input type="number" min="0" value={formData.mrp} onChange={(event) => setFormData({ ...formData, mrp: event.target.value })} className="bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 rounded-sm" placeholder="MRP" />
          </div>
          <input type="url" value={formData.external_price_url} onChange={(event) => setFormData({ ...formData, external_price_url: event.target.value })} className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 rounded-sm" placeholder="External price URL" />
          <Toggle checked={formData.is_default} onChange={(value) => setFormData({ ...formData, is_default: value })} label="Make default variant" />
          <div className="pt-4 flex justify-end gap-3 border-t border-[#2A2A2A]">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="border border-[#2A2A2A] text-[#9A9A9A] px-4 py-2 text-sm rounded-sm">Cancel</button>
            <button disabled={isSubmitting} className="bg-[#D4A017] hover:bg-[#E8B820] text-[#0A0A0A] font-semibold px-4 py-2 text-sm rounded-sm">
              {isSubmitting ? 'Adding...' : 'Add Variant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
