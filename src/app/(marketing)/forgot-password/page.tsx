'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { forgotPasswordSchema } from '@/lib/validations/auth';

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      // Always show success regardless of whether the email exists — never
      // reveal which addresses have accounts (enumeration protection).
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Could not send the reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center font-serif text-3xl text-ink">Reset your password</h1>
        <p className="mt-2 text-center text-sm text-ink-muted">
          Enter your email and we&apos;ll send you a link to set a new password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface-raised py-8 px-6 sm:px-10 shadow-sm rounded-card border border-line">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <CheckCircle2 size={24} className="text-green-600 dark:text-green-500" />
              </div>
              <p className="text-sm text-ink">
                If an account exists for <span className="font-medium">{email}</span>, a password reset
                link is on its way. Check your inbox (and spam).
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 mt-6 text-sm text-gold-deep hover:text-gold font-medium"
              >
                <ArrowLeft size={14} /> Back to sign in
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 flex items-start gap-2 rounded-control border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-500">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-ink-muted mb-1.5">Email</label>
                  <div className="flex items-center gap-2 w-full bg-surface border border-line-strong rounded-control px-3 focus-within:border-gold transition-colors">
                    <Mail size={16} className="text-ink-faint shrink-0" />
                    <input
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-transparent py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gold hover:bg-gold-bright text-on-gold font-semibold py-2.5 rounded-control transition-colors disabled:opacity-50"
                >
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 mt-5 text-sm text-ink-muted hover:text-gold-deep"
              >
                <ArrowLeft size={14} /> Back to sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
