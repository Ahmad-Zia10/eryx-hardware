'use client';

import { useState } from 'react';
import { updateEnquiryStatus } from '@/app/admin/actions';

export default function EnquiriesTable({ enquiries }: { enquiries: any[] }) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'contacted' | 'resolved'>('all');

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      await updateEnquiryStatus(id, newStatus);
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status');
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
    switch(status) {
      case 'new': return 'bg-blue-100 text-blue-700';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-emerald-100 text-emerald-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex text-sm font-medium border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 border-b-2 transition-colors ${activeTab === 'all' ? 'border-[#D4A017] text-gray-900 bg-gray-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
          All ({counts.all})
        </button>
        <button 
          onClick={() => setActiveTab('new')}
          className={`px-4 py-2 border-b-2 transition-colors ${activeTab === 'new' ? 'border-[#D4A017] text-gray-900 bg-gray-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
          New ({counts.new})
        </button>
        <button 
          onClick={() => setActiveTab('contacted')}
          className={`px-4 py-2 border-b-2 transition-colors ${activeTab === 'contacted' ? 'border-[#D4A017] text-gray-900 bg-gray-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
          Contacted ({counts.contacted})
        </button>
        <button 
          onClick={() => setActiveTab('resolved')}
          className={`px-4 py-2 border-b-2 transition-colors ${activeTab === 'resolved' ? 'border-[#D4A017] text-gray-900 bg-gray-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
          Resolved ({counts.resolved})
        </button>
      </div>

      <div className="space-y-4">
        {filteredEnquiries.map((enq) => {
          const isNew = enq.status === 'new';
          return (
            <div key={enq.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className={`p-6 ${isNew ? 'border-l-4 border-l-[#D4A017]' : 'border-l-4 border-l-transparent'}`}>
                
                {/* Header Row */}
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-gray-900">{enq.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeColor(enq.status)} capitalize`}>
                      {enq.status}
                    </span>
                  </div>
                  <div>
                    <select
                      value={enq.status}
                      onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                      disabled={updatingId === enq.id}
                      className={`block w-36 pl-3 pr-8 py-1.5 text-sm border border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#D4A017] focus:border-[#D4A017] rounded-md ${updatingId === enq.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                {/* Subheader Data */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span>{enq.phone}</span>
                  <span>{enq.email}</span>
                  <span className="text-gray-400">{new Date(enq.created_at).toLocaleDateString()}</span>
                  {enq.city && <span className="text-gray-400">· {enq.city}</span>}
                </div>

                {/* Product Interest */}
                {enq.product_name && (
                  <div className="mb-2 text-sm font-medium text-[#D4A017]">
                    Interested in: {enq.product_name}
                  </div>
                )}

                {/* Message Body */}
                <div className="text-gray-700 text-sm mb-6">
                  {enq.message}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                  <a href={`tel:${enq.phone}`} className="text-sm font-medium text-[#D4A017] hover:text-[#B38712] transition-colors">
                    Call
                  </a>
                  <a href={`mailto:${enq.email}`} className="text-sm font-medium text-[#D4A017] hover:text-[#B38712] transition-colors">
                    Email
                  </a>
                </div>
              </div>
            </div>
          );
        })}
        {filteredEnquiries.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">No enquiries found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
