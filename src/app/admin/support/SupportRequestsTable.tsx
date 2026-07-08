"use client";

import { useState } from "react";
import { updateSupportRequestStatus } from "@/app/admin/actions";
import { StatusBadge } from "@/components/ui/StatusBadge";

type SupportRequest = {
  id: string;
  reason: string;
  message: string;
  attachment_url: string | null;
  status: "open" | "in_progress" | "resolved";
  created_at: string;
  order: { id: string; customer_name: string; customer_email: string; customer_phone: string } | null;
};

export default function SupportRequestsTable({ requests }: { requests: SupportRequest[] }) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const updateStatus = async (id: string, status: SupportRequest["status"]) => {
    setUpdatingId(id);
    try {
      await updateSupportRequestStatus(id, status);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div key={request.id} className="border border-[#2A2A2A] rounded-sm bg-[#0A0A0A] p-5">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs text-[#9A9A9A]">{request.id}</p>
              <h2 className="text-[#F5F5F5] font-semibold mt-1">{request.reason.replace(/_/g, " ")}</h2>
              {request.order && (
                <p className="text-xs text-[#9A9A9A] mt-1">
                  Order {request.order.id.split("-")[0]}... · {request.order.customer_name} · {request.order.customer_email} · {request.order.customer_phone}
                </p>
              )}
              <p className="text-xs text-[#9A9A9A] mt-1">{new Date(request.created_at).toLocaleString()}</p>
              <p className="text-sm text-[#D4D4D4] mt-3 whitespace-pre-wrap">{request.message}</p>
              {request.attachment_url && (
                <a href={request.attachment_url} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-sm text-[#D4A017] hover:text-[#E8B820]">
                  View attachment
                </a>
              )}
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={request.status} />
              <select
                value={request.status}
                disabled={updatingId === request.id}
                onChange={(event) => updateStatus(request.id, event.target.value as SupportRequest["status"])}
                className="bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-3 py-2 rounded-sm"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>
      ))}
      {requests.length === 0 && (
        <div className="border border-[#2A2A2A] rounded-sm p-8 text-center text-[#9A9A9A]">No support requests yet.</div>
      )}
    </div>
  );
}
