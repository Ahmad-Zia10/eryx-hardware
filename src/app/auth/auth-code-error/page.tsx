import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <AlertCircle className="w-16 h-16 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
          Sign-in didn&apos;t complete
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          Something went wrong while signing you in. This can happen if the
          sign-in link expired or was cancelled. Please try again.
        </p>
        <Link
          href="/login"
          className="inline-block w-full bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] font-medium py-3 rounded-xl"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}