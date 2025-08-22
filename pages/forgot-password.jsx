import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    // Supabase will send a reset link that lands on /reset-password (configured in Supabase).
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);
    if (error) {
      setErr(error.message || "Failed to send reset email");
      return;
    }
    setSent(true);
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-md mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl shadow p-8">
          <h1 className="text-2xl font-semibold text-slate-800">Forgot Password</h1>
          {sent ? (
            <p className="mt-4 text-slate-700">
              If an account exists for that email, a password reset link has been sent.
              Please check your inbox.
            </p>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {err && <p className="text-sm text-rose-600">{err}</p>}

              <button
                disabled={loading}
                className="w-full rounded-lg bg-cyan-600 text-white py-2 hover:bg-cyan-700 disabled:opacity-60"
                type="submit"
              >
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
