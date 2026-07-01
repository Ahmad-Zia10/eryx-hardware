'use client';

import { useState } from 'react';
import { updateEnquiryStatus } from '@/app/admin/actions';
import { useRouter } from 'next/navigation';

export default function EnquiriesTable({ enquiries: initialEnquiries }: { enquiries: any[] }) {
  const router = useRouter();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'contacted' | 'resolved'>('all');
  const [enquiries, setEnquiries] = useState(initialEnquiries);

  const handleStatusChange = async (id: string, newStatus: string) => {
    // Optimistic update
    setEnquiries(prev => 
      prev.map(enq => enq.id === id ? { ...enq, status: newStatus } : enq)
    );
    setUpdatingId(id);

    try {
      await updateEnquiryStatus(id, newStatus);
      router.refresh();
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status');
      router.refresh(); // revert optimistic update on failure
    } finally {
      setUpdatingId(null);
    }
  };

  const counts = {
    all: enquiries.length,
    new: enquiries.filter(e => e.status === 'new').length,
    contacted: enquiries.filter(e => e.status === 'contacted').length,
    resolved: enquiries.filter(e => e.status === 'resolved').length,
  };

  const filteredEnquiries = activeTab === 'all' 
    ? enquiries 
    : enquiries.filter(e => e.status === activeTab);

  const getStatusBadgeColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'new': return 'bg-[#D4A017]/10 text-[#D4A017] border border-[#D4A017]/30';
      case 'contacted':
      case 'resolved':
      case 'closed':
      default: return 'bg-[#1A1A1A] text-[#9A9A9A] border border-[#2A2A2A]';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex text-sm font-medium border-b border-[#2A2A2A]">
        {(['all', 'new', 'contacted', 'resolved'] as const).map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 border-b-2 transition-colors capitalize ${
              activeTab === tab 
                ? 'border-[#D4A017] text-[#D4A017] bg-[#141414]' 
                : 'border-transparent text-[#9A9A9A] hover:text-[#F5F5F5] hover:bg-[#141414]'
            }`}
          >
            {tab} ({counts[tab]})
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredEnquiries.map((enq) => {
          const isNew = enq.status === 'new';
          return (
            <div key={enq.id} className="bg-[#141414] rounded-sm border border-[#2A2A2A] overflow-hidden hover:shadow-lg transition-shadow">
              <div className={`p-6 ${isNew ? 'border-l-4 border-l-[#D4A017]' : 'border-l-4 border-l-transparent'}`}>
                
                {/* Header Row */}
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-serif font-bold text-[#F5F5F5]">{enq.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-sm text-xs font-semibold ${getStatusBadgeColor(enq.status)} capitalize`}>
                      {enq.status}
                    </span>
                  </div>
                  <div>
                    <select
                      value={enq.status}
                      onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                      disabled={updatingId === enq.id}
                      className={`block w-36 pl-3 pr-8 py-1.5 text-sm text-[#F5F5F5] border border-[#2A2A2A] bg-[#1A1A1A] hover:bg-[#222] cursor-pointer focus:outline-none focus:border-[#D4A017] rounded-sm transition duration-200 ease-in-out ${updatingId === enq.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                {/* Subheader Data */}
                <div className="flex items-center gap-4 text-xs text-[#9A9A9A] mb-4">
                  <span>{enq.phone}</span>
                  <span>{enq.email}</span>
                  <span>{new Date(enq.created_at).toLocaleDateString()}</span>
                  {enq.city && <span>· {enq.city}</span>}
                </div>

                {/* Product Interest */}
                {enq.product_name && (
                  <div className="mb-2 text-sm font-medium text-[#D4A017]">
                    Interested in: {enq.product_name}
                  </div>
                )}

                {/* Message Body */}
                <div className="text-[#F5F5F5] text-sm mb-6">
                  {enq.message}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center gap-4 pt-4 border-t border-[#2A2A2A]">
                  <a href={`tel:${enq.phone}`} className="text-sm font-medium text-[#D4A017] hover:text-[#E8B820] transition-colors">
                    Call
                  </a>
                  <a href={`mailto:${enq.email}`} className="text-sm font-medium text-[#D4A017] hover:text-[#E8B820] transition-colors">
                    Email
                  </a>
                </div>
              </div>
            </div>
          );
        })}
        {filteredEnquiries.length === 0 && (
          <div className="text-center py-12 bg-[#141414] rounded-sm border border-[#2A2A2A]">
            <p className="text-[#9A9A9A]">No enquiries found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
