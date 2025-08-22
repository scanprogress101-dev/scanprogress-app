// pages/login.jsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  // If already signed in, go straight to dashboard
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      if (data?.session) {
        router.replace('/dashboard');
      }
    })();
    return () => { mounted = false; };
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message || 'Sign in failed');
      return;
    }

    if (data?.session) {
      setNotice('Signed in. Redirecting…');
      // replace so user can’t go “Back” to /login
      router.replace('/dashboard');
      return;
    }

    setError('Unexpected response: no session returned.');
  };

  return (
    <div className="min-h-screen bg-[#F6FAFB] bg-gradient-to-b from-[#F0F7F8] to-white">
      {/* Top bar */}
      <header className="max-w-6xl mx-auto px-6 pt-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-teal-500" />
          <div>
            <div className="text-lg font-semibold">ScanProgress</div>
            <div className="text-sm text-slate-500">Login</div>
          </div>
          <div className="ml-auto text-xs text-slate-400">Secure access</div>
        </div>
      </header>

      {/* Card */}
      <main className="max-w-6xl mx-auto px-6">
        <div className="mx-auto mt-12 sm:mt-16 w-full max-w-xl">
          <div className="rounded-2xl bg-white shadow-xl ring-1 ring-slate-100 p-6 sm:p-8">
            <h1 className="text-2xl font-semibold mb-2">Welcome back</h1>

            {notice ? (
              <div className="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
                {notice}
              </div>
            ) : null}

            {error ? (
              <div className="mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-3 py-2">
                {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border-slate-200 focus:border-teal-400 focus:ring-teal-400
                             bg-white px-3 py-2 text-slate-900 shadow-sm outline-none"
                  placeholder="you@company.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border-slate-200 focus:border-teal-400 focus:ring-teal-400
                             bg-white px-3 py-2 text-slate-900 shadow-sm outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-teal-600 hover:bg-teal-700 disabled:opacity-60
                           text-white font-semibold py-2.5 transition-colors shadow-sm"
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <p className="mt-3 text-xs text-slate-500">
              Trouble signing in? Ask your ScanProgress admin to reset your account.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
