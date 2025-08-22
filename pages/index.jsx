import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // If already signed in, take them where they belong.
    // Default: /dashboard (store staff) or /scans (customers). If you don’t have roles yet, pick one.
    const run = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (session?.user) {
        // If you store a role, uncomment and route by role.
        // const role = session.user.user_metadata?.role;
        // if (role === "store") router.replace("/dashboard");
        // else router.replace("/scans");
        router.replace("/dashboard"); // or "/scans" if you prefer
      } else {
        setChecking(false);
      }
    };
    run();
  }, [router]);

  if (checking) return null;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="rounded-2xl bg-white shadow p-8">
          <h1 className="text-3xl font-semibold text-slate-800">ScanProgress</h1>
          <p className="mt-2 text-slate-600">
            Track body composition changes from your InBody scans.
          </p>

          <div className="mt-8 flex gap-3 flex-wrap">
            <button
              className="px-5 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700"
              onClick={() => router.push("/login")}
            >
              Login
            </button>

            <button
              className="px-5 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
              onClick={() => router.push("/signup")}
            >
              Customer Sign&nbsp;Up
            </button>

            <button
              className="px-5 py-2 rounded-lg text-slate-600 underline"
              onClick={() => router.push("/forgot-password")}
            >
              Forgot password?
            </button>
          </div>

          <p className="mt-6 text-xs text-slate-400">
            Sign‑up is for **your store’s customers** only. (Not for other Nutrishop locations.)
          </p>
        </div>
      </div>
    </main>
  );
}
