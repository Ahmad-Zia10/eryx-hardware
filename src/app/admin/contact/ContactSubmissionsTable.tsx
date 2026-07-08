"use client";

import { useState } from "react";
import { updateContactSubmissionStatus } from "@/app/admin/actions";
import { StatusBadge } from "@/components/ui/StatusBadge";

type Submission = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  order_reference: string | null;
  status: "new" | "in_progress" | "resolved";
  created_at: string;
};

export default function ContactSubmissionsTable({ submissions }: { submissions: Submission[] }) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const updateStatus = async (id: string, status: Submission["status"]) => {
    setUpdatingId(id);
    try {
      await updateContactSubmissionStatus(id, status);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="border border-[#2A2A2A] rounded-sm overflow-hidden bg-[#0A0A0A]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#2A2A2A]">
          <thead className="bg-[#1A1A1A]">
            <tr>
              <th className="px-5 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Customer</th>
              <th className="px-5 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Message</th>
              <th className="px-5 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Status</th>
              <th className="px-5 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A2A2A]">
            {submissions.map((submission) => (
              <tr key={submission.id}>
                <td className="px-5 py-4 align-top">
                  <p className="text-sm font-medium text-[#F5F5F5]">{submission.name}</p>
                  <p className="text-xs text-[#9A9A9A]">{submission.email}</p>
                  <p className="text-xs text-[#9A9A9A]">{submission.phone}</p>
                  <p className="text-xs text-[#9A9A9A] mt-2">{new Date(submission.created_at).toLocaleString()}</p>
                </td>
                <td className="px-5 py-4 align-top max-w-xl">
                  <p className="text-xs uppercase tracking-widest text-[#D4A017]">{submission.subject.replace("_", " ")}</p>
                  {submission.order_reference && <p className="text-xs text-[#9A9A9A] mt-1">Order: {submission.order_reference}</p>}
                  <p className="text-sm text-[#D4D4D4] mt-2 whitespace-pre-wrap">{submission.message}</p>
                </td>
                <td className="px-5 py-4 align-top">
                  <StatusBadge status={submission.status} />
                </td>
                <td className="px-5 py-4 align-top">
                  <select
                    value={submission.status}
                    disabled={updatingId === submission.id}
                    onChange={(event) => updateStatus(submission.id, event.target.value as Submission["status"])}
                    className="bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-3 py-2 rounded-sm"
                  >
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </td>
              </tr>
            ))}
            {submissions.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-[#9A9A9A]">No contact submissions yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
