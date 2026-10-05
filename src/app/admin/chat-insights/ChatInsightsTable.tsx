'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { updateChatQueryStatus } from '@/app/admin/actions';

type Status = 'new' | 'resolved' | 'ignored';
type Kind = 'unanswered' | 'no_product_match';

export type ChatQueryRow = {
  id: string;
  kind: Kind;
  sample_query: string;
  last_page_path: string | null;
  hit_count: number;
  status: Status;
  reviewed_at: string | null;
  first_seen_at: string;
  last_seen_at: string;
};

const STATUS_FILTERS: { id: Status | 'all'; label: string }[] = [
  { id: 'new', label: 'New' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'ignored', label: 'Ignored' },
  { id: 'all', label: 'All' },
];

const KIND_FILTERS: { id: Kind | 'all'; label: string }[] = [
  { id: 'all', label: 'All types' },
  { id: 'unanswered', label: 'Unanswered questions' },
  { id: 'no_product_match', label: 'Product not found' },
];

function statusChipClass(status: Status) {
  switch (status) {
    case 'new':
      return 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30';
    case 'resolved':
      return 'bg-green-500/10 text-green-400 border-green-500/30';
    case 'ignored':
      return 'bg-[#2A2A2A]/40 text-[#9A9A9A] border-[#2A2A2A]';
  }
}

function filterButtonClass(active: boolean) {
  return `px-3 py-1.5 text-xs rounded-sm border transition-colors ${
    active
      ? 'border-[#D4A017] text-[#D4A017] bg-[#D4A017]/10'
      : 'border-[#2A2A2A] text-[#9A9A9A] hover:text-[#F5F5F5]'
  }`;
}

export default function ChatInsightsTable({ rows, loadFailed }: { rows: ChatQueryRow[]; loadFailed: boolean }) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('new');
  const [kindFilter, setKindFilter] = useState<Kind | 'all'>('all');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(loadFailed ? 'Could not load chat insights.' : null);

  const counts = useMemo(() => {
    const c: Record<Status, number> = { new: 0, resolved: 0, ignored: 0 };
    for (const row of rows) c[row.status] += 1;
    return c;
  }, [rows]);

  const visible = rows.filter(
    (row) =>
      (statusFilter === 'all' || row.status === statusFilter) &&
      (kindFilter === 'all' || row.kind === kindFilter)
  );

  const setStatus = async (id: string, status: Status) => {
    setBusyId(id);
    setError(null);
    const result = await updateChatQueryStatus(id, status);
    setBusyId(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setStatusFilter(f.id)}
            className={filterButtonClass(statusFilter === f.id)}
          >
            {f.label}
            {f.id !== 'all' && <span className="ml-1.5 opacity-70">{counts[f.id]}</span>}
          </button>
        ))}
        <span className="mx-2 h-5 w-px bg-[#2A2A2A]" aria-hidden />
        {KIND_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setKindFilter(f.id)}
            className={filterButtonClass(kindFilter === f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="w-full border border-[#2A2A2A] rounded-sm overflow-hidden bg-[#0A0A0A]">
        {error && (
          <div className="px-6 py-3 text-sm text-red-400 border-b border-[#2A2A2A] bg-red-500/5">
            {error}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#2A2A2A]">
            <thead className="bg-[#1A1A1A] border-b border-[#2A2A2A]">
              <tr>
                <th className="px-6 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Question</th>
                <th className="px-6 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Type</th>
                <th className="px-6 py-3 text-right text-xs tracking-widest uppercase text-[#9A9A9A]">Asked</th>
                <th className="px-6 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Last asked</th>
                <th className="px-6 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Status</th>
                <th className="px-6 py-3 text-right text-xs tracking-widest uppercase text-[#9A9A9A]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A]">
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[#9A9A9A]">
                    {rows.length === 0
                      ? 'Nothing yet. Questions Ryx can’t answer will show up here.'
                      : 'No questions match these filters.'}
                  </td>
                </tr>
              ) : (
                visible.map((row) => {
                  const busy = busyId === row.id;
                  return (
                    <tr key={row.id} className="hover:bg-[#1A1A1A] transition-colors">
                      <td className="px-6 py-4 max-w-md">
                        <div className="text-sm text-[#F5F5F5] break-words">“{row.sample_query}”</div>
                        {row.last_page_path && (
                          <div className="text-xs text-[#9A9A9A] font-mono mt-0.5">on {row.last_page_path}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-[#9A9A9A] whitespace-nowrap">
                        {row.kind === 'unanswered' ? 'Unanswered' : 'Product not found'}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-[#F5F5F5]">{row.hit_count}×</td>
                      <td className="px-6 py-4 text-sm text-[#9A9A9A] whitespace-nowrap">
                        {new Date(row.last_seen_at).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-sm border ${statusChipClass(row.status)}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-3 text-xs">
                          {row.kind === 'unanswered' && row.status === 'new' && (
                            <Link href="/admin/faqs" className="text-[#D4A017] hover:underline">
                              Write FAQ
                            </Link>
                          )}
                          {row.status !== 'resolved' && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => setStatus(row.id, 'resolved')}
                              className="text-[#9A9A9A] hover:text-green-400 disabled:opacity-50"
                            >
                              Resolve
                            </button>
                          )}
                          {row.status !== 'ignored' && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => setStatus(row.id, 'ignored')}
                              className="text-[#9A9A9A] hover:text-red-400 disabled:opacity-50"
                            >
                              Ignore
                            </button>
                          )}
                          {row.status !== 'new' && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => setStatus(row.id, 'new')}
                              className="text-[#9A9A9A] hover:text-[#F5F5F5] disabled:opacity-50"
                            >
                              Reopen
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
