import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-surface-raised border border-line p-8 text-center">
        <div className="flex justify-center mb-6">
          <AlertCircle className="w-16 h-16 text-red-500" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-[-0.02em] text-ink mb-2">
          Sign-in didn&apos;t complete
        </h1>
        <p className="text-ink-muted mb-6">
          Something went wrong while signing you in. This can happen if the
          sign-in link expired or was cancelled. Please try again.
        </p>
        <Link
          href="/login"
          className="inline-block w-full bg-ink text-brand-cream font-bold py-3 hover:bg-gold hover:text-on-gold transition-colors"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}