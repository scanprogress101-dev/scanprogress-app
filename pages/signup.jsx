import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

// Optional: require a store access code so random non-customers can't register.
// Set NEXT_PUBLIC_STORE_ACCESS_CODE in your Vercel env if you want this.
const ACCESS_CODE = process.env.NEXT_PUBLIC_STORE_ACCESS_CODE || "";

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");

    if (ACCESS_CODE) {
      if (!code || code.trim() !== ACCESS_CODE) {
        setErr("Invalid store access code.");
        return;
      }
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      // You can stamp user_metadata here if you want, e.g. role: "customer"
      options: {
        data: { role: "customer" },
        // If your project requires email confirmations, an email will be sent.
        // Ensure the Redirect URL is configured in Supabase Auth settings.
      },
    });
    setLoading(false);

    if (error) {
      setErr(error.message || "Sign up failed");
      return;
    }

    // If email confirmations are enabled, they'll need to confirm.
    setMsg(
      "Account created. Please check your email to confirm your address before logging in."
    );
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-md mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl shadow p-8">
          <h1 className="text-2xl font-semibold text-slate-800">Customer Sign‑Up</h1>
          <p className="text-sm text-slate-600 mt-2">
            For your store’s customers to view their InBody results.
          </p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            {ACCESS_CODE && (
              <div>
                <label className="block text-sm text-slate-600 mb-1">Store Access Code</label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-slate-600 mb-1">Email</label>
              <input
                type="email"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">Password</label>
              <input
                type="password"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={8}
              />
            </div>

            {err && <p className="text-sm text-rose-600">{err}</p>}
            {msg && <p className="text-sm text-emerald-600">{msg}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-cyan-600 text-white py-2 hover:bg-cyan-700 disabled:opacity-60"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <div className="mt-4 text-sm">
            <button
              className="text-slate-600 underline"
              onClick={() => router.push("/login")}
            >
              Already have an account? Login
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
