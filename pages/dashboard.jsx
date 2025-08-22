import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function Dashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (!session?.user) {
        const next = encodeURIComponent("/dashboard");
        router.replace(`/login?next=${next}`);
      } else {
        // Optional: enforce a "store" role only
        // const role = session.user.user_metadata?.role;
        // if (role !== "store") router.replace("/scans");
        setAuthorized(true);
      }
      setChecking(false);
    })();
  }, [router]);

  if (checking) return null;
  if (!authorized) return null;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-slate-800">Store Dashboard</h1>
        <p className="text-slate-500 text-sm">Visible to signed‑in staff.</p>

        {/* Your dashboard content here */}
      </div>
    </main>
  );
}
