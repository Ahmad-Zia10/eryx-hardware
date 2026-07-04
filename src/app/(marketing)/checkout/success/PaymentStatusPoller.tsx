"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface PaymentStatusPollerProps {
  orderId: string;
}

// Polls a tiny status-check API route every 2 seconds, up to 30 seconds
// total, and triggers a router.refresh() the moment the order flips to
// 'paid' — which re-runs the Server Component above and shows the real
// success state. This exists because the webhook is asynchronous and
// can genuinely take a few seconds; without this, the customer would
// see "Confirming your payment" and have to manually refresh to find
// out when it's done.
export default function PaymentStatusPoller({ orderId }: PaymentStatusPollerProps) {
  const router = useRouter();

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 15; // 15 * 2s = 30s ceiling

    const interval = setInterval(async () => {
      attempts++;

      try {
        const res = await fetch(`/api/checkout/status?order_id=${orderId}`);
        const data = await res.json();

        if (data.status === "paid") {
          clearInterval(interval);
          router.refresh();
        }
      } catch {
        // Silently ignore a single failed poll — it'll just retry on
        // the next interval tick rather than surfacing a transient
        // network blip to the customer.
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [orderId, router]);

  return null;
}