import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { order_id?: string };
}) {
  const orderId = searchParams.order_id;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle2 className="w-20 h-20 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Payment Successful!</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          Thank you for your purchase. Your order has been placed successfully.
        </p>
        
        {orderId && (
          <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 mb-8">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Order Reference</p>
            <p className="font-mono text-neutral-900 dark:text-white font-medium">{orderId}</p>
          </div>
        )}

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
