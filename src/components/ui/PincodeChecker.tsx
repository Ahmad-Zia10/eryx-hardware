"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { isServiceablePincode } from "@/constants";

export default function PincodeChecker() {
  const [pincode, setPincode] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "serviceable" | "unserviceable">("idle");
  const [error, setError] = useState("");

  const handleCheck = () => {
    setError("");
    setStatus("idle");

    if (pincode.length !== 6 || !/^\d+$/.test(pincode)) {
      setError("Please enter a valid 6-digit pincode.");
      return;
    }

    setStatus("checking");
    setTimeout(() => {
      setStatus(isServiceablePincode(pincode) ? "serviceable" : "unserviceable");
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCheck();
  };

  return (
    <div className="mt-8 border-t border-b border-line py-6">
      <h3 className="font-semibold text-ink mb-3 text-sm">
        Check Delivery Availability
      </h3>
      <div className="flex gap-2">
        <input
          type="text"
          maxLength={6}
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
          onKeyDown={handleKeyDown}
          placeholder="Enter 6-digit Pincode"
          className="flex-1 border border-line-strong bg-surface text-ink px-4 py-2 text-sm rounded-control focus:outline-none focus:border-gold transition"
        />
        <button
          onClick={handleCheck}
          disabled={status === "checking" || pincode.length !== 6}
          className="bg-ink text-surface px-6 py-2 text-sm font-semibold rounded-control hover:opacity-90 transition disabled:opacity-50 min-w-[100px] flex justify-center items-center"
        >
          {status === "checking" ? <Loader2 size={16} className="animate-spin" /> : "Check"}
        </button>
      </div>

      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

      {status === "serviceable" && (
        <div className="flex items-start gap-2 mt-3 text-sm text-green-600 dark:text-green-500">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          <p>Delivery available to this area. Estimated 5-7 business days.</p>
        </div>
      )}

      {status === "unserviceable" && (
        <div className="flex items-start gap-2 mt-3 text-sm text-red-600 dark:text-red-500">
          <XCircle size={16} className="mt-0.5 shrink-0" />
          <p>We don&apos;t deliver to this pincode yet. Contact us for bulk/dealer orders.</p>
        </div>
      )}
    </div>
  );
}
