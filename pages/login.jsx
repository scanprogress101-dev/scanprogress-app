import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const router = useRouter();
  const next = typeof router.query.next === "string" ? router.query.next : null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // If already logged in, bounce right away
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        router.replace(next || "/dashboard"); // or "/scans"
      }
    })();
  }, [router, next]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setSubmitting(false);

    if (error) {
      setError(error.message || "Login failed");
      return;
    }

    // Optional: route by role if you store one (uncomment and adjust):
    // const role = data?.user?.user_metadata?.role;
    // const dst = next || (role === "store" ? "/dashboard" : "/scans");
    const dst = next || "/dashboard"; // or "/scans"
    router.replace(dst);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-md mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl shadow p-8">
          <h1 className="text-2xl font-semibold text-slate-800">Welcome back</h1>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Email</label>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">Password</label>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-rose-600">
                {error}
              </p>
            )}

            <button
              disabled={submitting}
              className="w-full rounded-lg bg-cyan-600 text-white py-2 hover:bg-cyan-700 disabled:opacity-60"
              type="submit"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-4 text-sm">
            <button
              className="text-slate-600 underline"
              onClick={() => router.push("/forgot-password")}
            >
              Forgot password?
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
