"use client";

import { useState } from "react";
import { updateDealerEnquiryStatus } from "@/app/admin/actions";
import { StatusBadge } from "@/components/ui/StatusBadge";

type DealerEnquiry = {
  id: string;
  contact_name: string;
  company_name: string;
  email: string;
  phone: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  message: string | null;
  visiting_card_url: string | null;
  status: "new" | "reviewing" | "approved" | "rejected";
  review_note: string | null;
  created_at: string;
};

export default function DealerEnquiriesTable({ enquiries }: { enquiries: DealerEnquiry[] }) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>(() =>
    Object.fromEntries(enquiries.map((enquiry) => [enquiry.id, enquiry.review_note || ""]))
  );

  const updateStatus = async (id: string, status: DealerEnquiry["status"]) => {
    setUpdatingId(id);
    try {
      await updateDealerEnquiryStatus(id, status, notes[id]);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {enquiries.map((enquiry) => (
        <div key={enquiry.id} className="border border-[#2A2A2A] rounded-sm bg-[#0A0A0A] p-5">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div>
              <h2 className="text-[#F5F5F5] font-semibold">{enquiry.company_name}</h2>
              <p className="text-sm text-[#D4D4D4]">{enquiry.contact_name} · {enquiry.email} · {enquiry.phone}</p>
              <p className="text-xs text-[#9A9A9A] mt-2">{enquiry.address_line}, {enquiry.city}, {enquiry.state} {enquiry.pincode}, {enquiry.country}</p>
              <p className="text-xs text-[#9A9A9A] mt-1">{new Date(enquiry.created_at).toLocaleString()}</p>
              {enquiry.message && <p className="text-sm text-[#D4D4D4] mt-3 whitespace-pre-wrap">{enquiry.message}</p>}
              {enquiry.visiting_card_url && (
                <a href={enquiry.visiting_card_url} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-sm text-[#D4A017] hover:text-[#E8B820]">
                  View visiting card
                </a>
              )}
            </div>
            <div className="w-full lg:w-72 space-y-3">
              <StatusBadge status={enquiry.status} />
              <select
                value={enquiry.status}
                disabled={updatingId === enquiry.id}
                onChange={(event) => updateStatus(enquiry.id, event.target.value as DealerEnquiry["status"])}
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-3 py-2 rounded-sm"
              >
                <option value="new">New</option>
                <option value="reviewing">Reviewing</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <textarea
                value={notes[enquiry.id] || ""}
                onChange={(event) => setNotes((current) => ({ ...current, [enquiry.id]: event.target.value }))}
                placeholder="Review note"
                rows={3}
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-3 py-2 rounded-sm"
              />
            </div>
          </div>
        </div>
      ))}
      {enquiries.length === 0 && (
        <div className="border border-[#2A2A2A] rounded-sm p-8 text-center text-[#9A9A9A]">No dealer enquiries yet.</div>
      )}
    </div>
  );
}
