import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

// NOTE: This file only demonstrates auth protection + page frame.
// Keep your charts/table code below the "authorized" state.

export default function Scans() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (!session?.user) {
        // Not signed in: send to login and return them here afterward
        const next = encodeURIComponent("/scans");
        router.replace(`/login?next=${next}`);
      } else {
        setAuthorized(true);
      }
      setChecking(false);
    })();
  }, [router]);

  if (checking) return null;
  if (!authorized) return null;

  // >>> Your existing Scans UI (charts + table) below <<<
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">Customer Scan History</h1>
          <p className="text-slate-500 text-sm">Only visible when logged in.</p>
        </header>

        {/* Keep your current graphs/table code here */}
        {/* ... */}
      </div>
    </main>
  );
}
