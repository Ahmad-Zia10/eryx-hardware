"use client";

import { useUI } from "@/context/UIContext";

// Small client island so the otherwise-static /products directory can
// stay a server component. Opens the global enquiry modal — the same
// affordance the old grid's "Send Enquiry" used.
export default function TalkToExpertButton({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { openEnquiryModal } = useUI();
  return (
    <button onClick={() => openEnquiryModal()} className={className}>
      {children}
    </button>
  );
}
