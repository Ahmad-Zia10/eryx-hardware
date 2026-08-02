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
      <h3 className="text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-faint mb-3">
        Check delivery availability
      </h3>
      {/* Single bordered field with a left-ruled Check button (Modernist). */}
      <div className="flex items-stretch border border-line-strong focus-within:border-gold transition-colors">
        <input
          type="text"
          maxLength={6}
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
          onKeyDown={handleKeyDown}
          placeholder="Check delivery pincode"
          className="flex-1 bg-transparent text-ink px-4 py-3 text-sm focus:outline-none placeholder:text-ink-faint"
        />
        <button
          onClick={handleCheck}
          disabled={status === "checking" || pincode.length !== 6}
          className="border-l border-line-strong px-5 text-sm font-extrabold text-ink hover:text-gold transition disabled:opacity-50 min-w-[90px] flex justify-center items-center"
        >
          {status === "checking" ? <Loader2 size={16} className="animate-spin" /> : "Check"}
        </button>
      </div>

      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

      {status === "serviceable" && (
        <div className="flex items-start gap-2 mt-3 text-sm text-green-600">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          <p>Delivery available to this area. Estimated 5-7 business days.</p>
        </div>
      )}

      {status === "unserviceable" && (
        <div className="flex items-start gap-2 mt-3 text-sm text-red-600">
          <XCircle size={16} className="mt-0.5 shrink-0" />
          <p>We don&apos;t deliver to this pincode yet. Contact us for bulk/dealer orders.</p>
        </div>
      )}
    </div>
  );
}
