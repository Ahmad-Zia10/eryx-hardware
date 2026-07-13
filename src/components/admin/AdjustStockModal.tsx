'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { adjustStock } from '@/app/admin/actions';

type Variant = {
  id: string;
  item_code: string;
  name?: string;
  stock_quantity: number;
  track_inventory: boolean;
};

interface Props {
  variant: Variant;
  onClose: () => void;
  onSuccess: () => void;
}

type Reason = 'restock' | 'manual_adjustment';

export default function AdjustStockModal({ variant, onClose, onSuccess }: Props) {
  const [delta, setDelta] = useState<string>('');
  const [reason, setReason] = useState<Reason>('restock');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsedDelta = Number(delta);
  const canSubmit =
    delta.trim() !== '' &&
    Number.isInteger(parsedDelta) &&
    parsedDelta !== 0 &&
    !submitting;

  const projected =
    Number.isInteger(parsedDelta) && parsedDelta !== 0
      ? variant.stock_quantity + parsedDelta
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    const result = await adjustStock(variant.id, parsedDelta, reason);
    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md bg-[#111111] border border-[#2A2A2A] rounded-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A2A2A]">
          <div>
            <h2 className="text-sm font-medium text-[#F5F5F5]">Adjust Stock</h2>
            <p className="text-xs text-[#9A9A9A] mt-0.5 font-mono">{variant.item_code}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#9A9A9A] hover:text-[#F5F5F5]"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#9A9A9A] mb-1">
              Current stock
            </label>
            <div className="text-lg text-[#F5F5F5] font-mono">
              {variant.track_inventory ? variant.stock_quantity : 'Not tracked'}
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-[#9A9A9A] mb-1">
              Change (positive to add, negative to remove)
            </label>
            <input
              type="number"
              step={1}
              value={delta}
              onChange={(e) => setDelta(e.target.value)}
              placeholder="e.g. 10 or -3"
              className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm rounded-sm focus:outline-none focus:border-[#D4A017]"
              autoFocus
            />
            {projected !== null && (
              <p className="text-xs text-[#9A9A9A] mt-1">
                New stock:{' '}
                <span
                  className={projected < 0 ? 'text-red-400' : 'text-[#F5F5F5]'}
                >
                  {projected}
                </span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-[#9A9A9A] mb-1">
              Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as Reason)}
              className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm rounded-sm focus:outline-none focus:border-[#D4A017]"
            >
              <option value="restock">Restock</option>
              <option value="manual_adjustment">Manual correction</option>
            </select>
          </div>

          {error && (
            <div className="text-xs text-red-400 border border-red-500/30 bg-red-500/10 rounded-sm px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-[#9A9A9A] hover:text-[#F5F5F5]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="px-4 py-2 text-sm font-semibold bg-[#D4A017] text-[#0A0A0A] rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving…' : 'Apply'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
