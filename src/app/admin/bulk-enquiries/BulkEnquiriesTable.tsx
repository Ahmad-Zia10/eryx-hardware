"use client";

import { useState } from "react";
import { updateBulkEnquiryStatus } from "@/app/admin/actions";
import { StatusBadge } from "@/components/ui/StatusBadge";

type BulkEnquiry = {
  id: string;
  customer_name: string;
  company_name: string | null;
  email: string;
  phone: string;
  message: string | null;
  status: "new" | "contacted" | "quoted" | "closed";
  created_at: string;
  bulk_enquiry_items: Array<{
    id: string;
    product_name_snapshot: string;
    quantity: number;
    note: string | null;
    product: { name: string; image_url: string | null } | null;
  }>;
};

export default function BulkEnquiriesTable({ enquiries }: { enquiries: BulkEnquiry[] }) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const updateStatus = async (id: string, status: BulkEnquiry["status"]) => {
    setUpdatingId(id);
    try {
      await updateBulkEnquiryStatus(id, status);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {enquiries.map((enquiry) => (
        <div key={enquiry.id} className="border border-[#2A2A2A] rounded-sm bg-[#0A0A0A] p-5">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h2 className="text-[#F5F5F5] font-semibold">{enquiry.customer_name}</h2>
              <p className="text-xs text-[#9A9A9A]">{enquiry.company_name || "Individual"} · {enquiry.email} · {enquiry.phone}</p>
              <p className="text-xs text-[#9A9A9A] mt-1">{new Date(enquiry.created_at).toLocaleString()}</p>
              {enquiry.message && <p className="text-sm text-[#D4D4D4] mt-3 whitespace-pre-wrap">{enquiry.message}</p>}
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={enquiry.status} />
              <select
                value={enquiry.status}
                disabled={updatingId === enquiry.id}
                onChange={(event) => updateStatus(enquiry.id, event.target.value as BulkEnquiry["status"])}
                className="bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-3 py-2 rounded-sm"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="quoted">Quoted</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="mt-4 border-t border-[#2A2A2A] pt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {enquiry.bulk_enquiry_items.map((item) => (
              <div key={item.id} className="flex gap-3 bg-[#141414] border border-[#2A2A2A] rounded-sm p-3">
                {item.product?.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.product.image_url} alt="" className="w-14 h-14 object-cover rounded-sm" />
                )}
                <div>
                  <p className="text-sm text-[#F5F5F5]">{item.product?.name || item.product_name_snapshot}</p>
                  <p className="text-xs text-[#9A9A9A]">Qty: {item.quantity}</p>
                  {item.note && <p className="text-xs text-[#9A9A9A] mt-1">{item.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {enquiries.length === 0 && (
        <div className="border border-[#2A2A2A] rounded-sm p-8 text-center text-[#9A9A9A]">No bulk enquiries yet.</div>
      )}
    </div>
  );
}
