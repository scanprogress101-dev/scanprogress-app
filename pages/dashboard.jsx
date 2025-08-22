// pages/dashboard.jsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function Dashboard() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);

  // Require auth
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      if (!data?.session) {
        router.replace('/login');
        return;
      }
      setUser(data.session.user);
      setChecking(false);
    })();

    // Respond to sign-out in other tabs/windows
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace('/login');
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  if (checking) {
    return (
      <div className="min-h-screen grid place-items-center text-slate-500">
        Checking session…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center gap-3 max-w-6xl mx-auto px-6 py-5">
        <div className="w-8 h-8 rounded-md bg-teal-500" />
        <div className="font-semibold">ScanProgress</div>
        <div className="ml-auto text-sm text-slate-600">
          {user?.email}
        </div>
        <button
          onClick={signOut}
          className="ml-4 rounded-md border border-slate-200 px-3 py-1.5 text-sm hover:bg-white bg-slate-100"
        >
          Sign out
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-16">
        <h1 className="text-2xl font-semibold mb-3">Store Dashboard</h1>
        <p className="text-slate-600 mb-8">
          Welcome! This page is protected. Only signed‑in users can view it.
        </p>

        {/* TODO: Real dashboard widgets */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="text-sm text-slate-500">Today</div>
            <div className="text-3xl font-semibold mt-1">0 scans</div>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="text-sm text-slate-500">This Week</div>
            <div className="text-3xl font-semibold mt-1">0 scans</div>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="text-sm text-slate-500">Errors</div>
            <div className="text-3xl font-semibold mt-1 text-rose-600">0</div>
          </div>
        </div>
      </main>
    </div>
  );
}
