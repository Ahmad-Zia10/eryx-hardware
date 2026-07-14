'use client';

import { forwardRef, useEffect, useState } from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';

interface NotifyMeFormProps {
  variantId: string;
  variantName: string;
  defaultEmail?: string;
}

const NotifyMeForm = forwardRef<HTMLInputElement, NotifyMeFormProps>(
  function NotifyMeForm({ variantId, variantName, defaultEmail = '' }, ref) {
    const [email, setEmail] = useState(defaultEmail);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<
      { subscribed: true; email: string; already: boolean } | null
    >(null);

    // Re-sync when defaultEmail arrives (e.g. the PDP's auth effect
    // resolves after this component has already mounted with '').
    // Guarded on `!email` so we never stomp a value the user typed while
    // the auth check was still in flight.
    useEffect(() => {
      if (defaultEmail && !email) setEmail(defaultEmail);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaultEmail]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setSubmitting(true);
      try {
        const res = await fetch('/api/notify-me', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ variant_id: variantId, email: email.trim() }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Something went wrong.');
          return;
        }
        setResult({
          subscribed: true,
          email: email.trim(),
          already: Boolean(data.alreadySubscribed),
        });
      } catch {
        setError('Network error. Please try again.');
      } finally {
        setSubmitting(false);
      }
    };

    if (result) {
      return (
        <div className="w-full py-3 px-4 border border-[#D4A017]/40 bg-[#D4A017]/5 flex items-start gap-3">
          <CheckCircle2
            className="text-[#D4A017] shrink-0 mt-0.5"
            size={20}
          />
          <div className="text-sm">
            <p className="font-semibold text-[#0A0A0A] dark:text-[#F5F5F5]">
              {result.already
                ? "You're already on the list."
                : "You're on the list."}
            </p>
            <p className="text-xs text-[#555555] dark:text-[#9A9A9A] mt-1">
              We&apos;ll email <span className="font-medium">{result.email}</span>{' '}
              when {variantName} is back in stock.
            </p>
          </div>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-[#0A0A0A] dark:text-[#F5F5F5]">
          <Bell size={16} className="text-[#D4A017]" />
          <span className="font-semibold">Notify me when back in stock</span>
        </div>
        <div className="flex gap-2">
          <input
            ref={ref}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="flex-1 px-3 py-2.5 border border-[#D4D4D4] dark:border-[#2A2A2A] rounded-sm bg-white dark:bg-[#1A1A1A] text-sm text-[#0A0A0A] dark:text-[#F5F5F5] focus:outline-none focus:border-[#D4A017]"
          />
          <button
            type="submit"
            disabled={submitting || !email.trim()}
            className="bg-[#D4A017] hover:bg-[#E8B820] text-[#0A0A0A] font-semibold px-4 py-2.5 text-sm transition duration-200 ease-in-out rounded-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? '…' : 'Notify Me'}
          </button>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </form>
    );
  }
);

export default NotifyMeForm;
