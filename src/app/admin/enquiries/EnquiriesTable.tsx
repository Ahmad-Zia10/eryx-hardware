'use client';

import { useState } from 'react';
import { updateEnquiryStatus } from '@/app/admin/actions';

export default function EnquiriesTable({ enquiries }: { enquiries: any[] }) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product / Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {enquiries.map((enq) => {
              const isNew = enq.status === 'new';
              return (
                <tr key={enq.id} className={`hover:bg-gray-50 ${isNew ? 'bg-[#FFFAF0] border-l-4 border-l-[#D4A017]' : 'border-l-4 border-l-transparent'}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(enq.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{enq.name}</div>
                    <div className="text-sm text-gray-500">{enq.phone}</div>
                    <div className="text-sm text-gray-500">{enq.email}</div>
                    <div className="text-xs text-gray-400">{enq.city}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{enq.product_name || 'N/A'}</div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {enq.enquiry_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs group relative">
                    <div className="truncate group-hover:whitespace-normal group-hover:break-words group-hover:absolute group-hover:z-10 group-hover:bg-white group-hover:p-4 group-hover:shadow-lg group-hover:border group-hover:rounded-md">
                      {enq.message}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <select
                      value={enq.status}
                      onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                      disabled={updatingId === enq.id}
                      className={`block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#D4A017] focus:border-[#D4A017] sm:text-sm rounded-md ${updatingId === enq.id ? 'opacity-50' : ''}`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                </tr>
              );
            })}
            {enquiries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No enquiries found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
