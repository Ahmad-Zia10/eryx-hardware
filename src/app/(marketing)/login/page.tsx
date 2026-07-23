'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mail, Lock, User, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { signInSchema, signUpSchema } from '@/lib/validations/auth';

type Mode = 'signin' | 'signup';

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

const inputWrap =
  'flex items-center gap-2 w-full bg-surface border border-line-strong rounded-control px-3 focus-within:border-gold transition-colors';
const inputEl =
  'w-full bg-transparent py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none';

function LoginForm() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';

  const [mode, setMode] = useState<Mode>('signin');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  // When a sign-in fails because the email isn't confirmed, we surface a
  // resend affordance keyed to that email.
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
  });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const resetMessages = () => {
    setError(null);
    setNotice(null);
    setUnconfirmedEmail(null);
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    resetMessages();
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    resetMessages();
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Could not connect to Google.');
      setGoogleLoading(false);
    }
  };

  const handleSignIn = async () => {
    const parsed = signInSchema.safeParse({ email: form.email, password: form.password });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    resetMessages();
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });
      if (error) {
        // Supabase returns this message when confirm-email is on and the
        // address hasn't been verified yet.
        if (/email not confirmed|not confirmed/i.test(error.message)) {
          setUnconfirmedEmail(parsed.data.email);
          setError('Please verify your email before signing in.');
        } else {
          setError('Incorrect email or password.');
        }
        setLoading(false);
        return;
      }
      // Success — hard-navigate so the server picks up the new session cookie
      // and middleware/layout re-render with the authenticated user.
      window.location.href = next;
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    const parsed = signUpSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    resetMessages();
    try {
      const { data, error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          data: { full_name: parsed.data.full_name },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) throw error;

      // If a user already exists, Supabase returns a user object with an
      // empty identities array rather than an error (avoids account probing).
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setError('An account with this email already exists. Try signing in.');
        setLoading(false);
        return;
      }

      setNotice(
        `We've sent a verification link to ${parsed.data.email}. Click it to activate your account, then sign in.`
      );
      setMode('signin');
      setForm((f) => ({ ...f, password: '', confirm_password: '' }));
    } catch (err: any) {
      setError(err.message || 'Could not create your account.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unconfirmedEmail) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: unconfirmedEmail,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
      });
      if (error) throw error;
      setNotice(`Verification link re-sent to ${unconfirmedEmail}.`);
      setError(null);
      setUnconfirmedEmail(null);
    } catch (err: any) {
      setError(err.message || 'Could not resend the verification email.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    mode === 'signin' ? handleSignIn() : handleSignUp();
  };

  return (
    <div className="flex min-h-[80vh] flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center font-serif text-3xl text-ink">
          {mode === 'signin' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="mt-2 text-center text-sm text-ink-muted">
          {mode === 'signin'
            ? 'Sign in to track orders, save wishlists, and check out faster.'
            : 'Join Eryx to track orders, save wishlists, and check out faster.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface-raised py-8 px-6 sm:px-10 shadow-sm rounded-card border border-line">
          {/* Mode tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-surface-sunken rounded-control mb-6">
            {(['signin', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`py-2 text-sm font-medium rounded-sm transition-colors ${
                  mode === m ? 'bg-surface-raised text-gold-deep shadow-sm' : 'text-ink-muted hover:text-ink'
                }`}
              >
                {m === 'signin' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-line-strong rounded-control bg-surface text-sm font-medium text-ink hover:bg-surface-sunken transition-colors disabled:opacity-50"
          >
            <GoogleIcon />
            {googleLoading ? 'Connecting…' : 'Continue with Google'}
          </button>

          <div className="flex items-center gap-3 my-6">
            <span className="h-px flex-1 bg-line" />
            <span className="text-xs text-ink-faint uppercase tracking-widest">or</span>
            <span className="h-px flex-1 bg-line" />
          </div>

          {/* Messages */}
          {notice && (
            <div className="mb-4 flex items-start gap-2 rounded-control border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-500">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
              <span>{notice}</span>
            </div>
          )}
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-control border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-500">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <div>
                <p>{error}</p>
                {unconfirmedEmail && (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={loading}
                    className="mt-1 font-semibold underline underline-offset-2 hover:no-underline disabled:opacity-50"
                  >
                    Resend verification email
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Email/password form */}
          <form onSubmit={onSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1.5">Full name</label>
                <div className={inputWrap}>
                  <User size={16} className="text-ink-faint shrink-0" />
                  <input
                    type="text"
                    autoComplete="name"
                    value={form.full_name}
                    onChange={(e) => set('full_name', e.target.value)}
                    placeholder="Your name"
                    className={inputEl}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1.5">Email</label>
              <div className={inputWrap}>
                <Mail size={16} className="text-ink-faint shrink-0" />
                <input
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="you@example.com"
                  className={inputEl}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-ink-muted">Password</label>
                {mode === 'signin' && (
                  <Link href="/forgot-password" className="text-xs text-gold-deep hover:text-gold">
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className={inputWrap}>
                <Lock size={16} className="text-ink-faint shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'}
                  className={inputEl}
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

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1.5">Confirm password</label>
                <div className={inputWrap}>
                  <Lock size={16} className="text-ink-faint shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={form.confirm_password}
                    onChange={(e) => set('confirm_password', e.target.value)}
                    placeholder="Re-enter password"
                    className={inputEl}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full bg-gold hover:bg-gold-bright text-on-gold font-semibold py-2.5 rounded-control transition-colors disabled:opacity-50"
            >
              {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-ink-muted">
            {mode === 'signin' ? (
              <>
                New to Eryx?{' '}
                <button onClick={() => switchMode('signup')} className="text-gold-deep hover:text-gold font-medium">
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button onClick={() => switchMode('signin')} className="text-gold-deep hover:text-gold font-medium">
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex justify-center items-center text-ink-muted">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
