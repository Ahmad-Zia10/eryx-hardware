'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { resetPasswordSchema } from '@/lib/validations/auth';

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();

  const [ready, setReady] = useState(false);       // recovery session detected
  const [invalid, setInvalid] = useState(false);   // no/expired recovery link
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // The reset link lands here with a recovery token in the URL hash. The
  // browser client (detectSessionInUrl) exchanges it and emits
  // PASSWORD_RECOVERY, giving us a short-lived session scoped to updating the
  // password. We wait for that before enabling the form; if it never arrives
  // (direct visit / expired link), we show an "invalid link" state.
  useEffect(() => {
    let settled = false;

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        settled = true;
        setReady(true);
      }
    });

    // Fallback: if a session already exists (event fired before listener
    // attached), enable the form; otherwise mark the link invalid.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        settled = true;
        setReady(true);
      } else {
        // Give the URL-detection a brief window before declaring invalid.
        setTimeout(() => {
          if (!settled) setInvalid(true);
        }, 1500);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);

    const parsed = resetPasswordSchema.safeParse({ password, confirm_password: confirm });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
      if (error) throw error;
      setDone(true);
      // Sign out the recovery session so the user logs in fresh with the new
      // password, then send them to the login page.
      await supabase.auth.signOut();
      setTimeout(() => router.push('/login'), 2500);
    } catch (err: any) {
      setError(err.message || 'Could not update your password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-surface-sunken">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl sm:text-4xl font-extrabold tracking-[-0.02em] text-ink">Set a new password</h1>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface-raised py-8 px-6 sm:px-10 border border-line">
          {done ? (
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-500/10 flex items-center justify-center mb-4">
                <CheckCircle2 size={24} className="text-green-600" />
              </div>
              <p className="text-sm text-ink">Your password has been updated. Redirecting you to sign in…</p>
            </div>
          ) : invalid ? (
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-500/10 flex items-center justify-center mb-4">
                <AlertCircle size={24} className="text-red-600" />
              </div>
              <p className="text-sm text-ink">
                This reset link is invalid or has expired.
              </p>
              <Link
                href="/forgot-password"
                className="inline-block mt-6 text-sm text-gold-deep hover:text-gold font-medium"
              >
                Request a new link
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 flex items-start gap-2 border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-ink-muted mb-1.5">New password</label>
                  <div className="flex items-center gap-2 w-full bg-surface border border-line-strong px-3 focus-within:border-gold transition-colors">
                    <Lock size={16} className="text-ink-faint shrink-0" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      disabled={!ready}
                      className="w-full bg-transparent py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="text-ink-faint hover:text-ink shrink-0"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-muted mb-1.5">Confirm password</label>
                  <div className="flex items-center gap-2 w-full bg-surface border border-line-strong px-3 focus-within:border-gold transition-colors">
                    <Lock size={16} className="text-ink-faint shrink-0" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Re-enter password"
                      disabled={!ready}
                      className="w-full bg-transparent py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none disabled:opacity-50"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading || !ready}
                  className="w-full bg-gold hover:bg-gold-bright text-on-gold font-bold py-3 transition-colors disabled:opacity-50"
                >
                  {!ready ? 'Verifying link…' : loading ? 'Updating…' : 'Update password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
