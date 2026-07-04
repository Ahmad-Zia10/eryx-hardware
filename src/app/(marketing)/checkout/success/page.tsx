import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/catalogue-data";

interface CheckoutSuccessPageProps {
  searchParams: Promise<{ order_id?: string }>;
}

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const { order_id } = await searchParams;

  if (!order_id) {
    redirect("/");
  }

  const supabase = await createClient();

  // This query is protected by RLS — the "Authenticated users can view
  // their own orders" policy means this will only ever return a row if
  // the currently logged-in user actually owns this order. If the user
  // is logged out, or this order_id belongs to someone else, this
  // returns null — not because we checked manually, but because the
  // database itself refuses to return it. This is what actually closes
  // the gap where anyone could view /checkout/success?order_id=<guessed>
  // and see another customer's order.
  const { data: order } = await supabase
    .from("orders")
    .select("id, status, total, customer_name, created_at")
    .eq("id", order_id)
    .single();

  if (!order) {
    // Either this order doesn't exist, doesn't belong to this user, or
    // the user isn't logged in. Same response for all three cases —
    // deliberately not distinguishing "not found" from "not yours" in
    // the UI, since revealing that an order ID exists but isn't theirs
    // is its own small information leak.
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
            Order not found
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            We couldn&apos;t find that order, or you may need to sign in to view it.
          </p>
          <Link
            href="/"
            className="inline-block w-full bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] font-medium py-3 rounded-xl"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // This is the fix for the payment-confirmation race condition: the
  // customer can land here via Razorpay's client-side redirect before
  // the webhook has actually updated status to 'paid'. Rather than
  // trusting the redirect itself, we check the real, current status
  // straight from the database and show an honest "confirming" state
  // if the webhook hasn't landed yet, instead of a false "success".
  if (order.status !== "paid") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <Clock className="w-16 h-16 text-[#D4A017] animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
            Confirming your payment
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            This usually takes just a few seconds. This page will update
            automatically — no need to refresh.
          </p>
          <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
              Order Reference
            </p>
            <p className="font-mono text-neutral-900 dark:text-white font-medium">
              {order.id}
            </p>
          </div>
          {/* Client-side polling component picks up from here — see
              PaymentStatusPoller below. This page itself stays a Server
              Component; only the small polling piece needs to be a
              client island, same pattern used throughout this project. */}
          <PaymentStatusPoller orderId={order.id} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle2 className="w-20 h-20 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
          Payment Successful!
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          Thank you, {order.customer_name}. Your order has been placed successfully.
        </p>

        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 mb-8 flex flex-col gap-2">
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
              Order Reference
            </p>
            <p className="font-mono text-neutral-900 dark:text-white font-medium">
              {order.id}
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
              Amount Paid
            </p>
            <p className="text-neutral-900 dark:text-white font-medium">
              {formatPrice(order.total)}
            </p>
          </div>
        </div>

        <Link
          href="/kitchen"
          className="inline-block w-full bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] font-medium py-3 rounded-xl transition-transform active:scale-[0.98] hover:bg-neutral-800 dark:hover:bg-neutral-200"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

// Lazily import the client polling component at the bottom to keep the
// Server/Client boundary obvious when reading this file top to bottom.
import PaymentStatusPoller from "./PaymentStatusPoller";