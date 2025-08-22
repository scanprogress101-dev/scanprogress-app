import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function ResetPassword() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  // Supabase will open this page with a recovery session in the URL (access_token),
  // and supabase-js will pick it up automatically if your project is configured.
  useEffect(() => {
    // Wait for router to be ready so query params exist
    if (router.isReady) setReady(true);
  }, [router.isReady]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    setSaving(true);

    // Update the user's password with the current recovery session
    const { data, error } = await supabase.auth.updateUser({ password });

    setSaving(false);
    if (error) {
      setErr(error.message || "Failed to update password");
      return;
    }
    setMsg("Password updated. You can now log in.");
  };

  if (!ready) return null;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-md mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl shadow p-8">
          <h1 className="text-2xl font-semibold text-slate-800">Set a new password</h1>
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="block text-sm text-slate-600 mb-1">New Password</label>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                type="password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {err && <p className="text-sm text-rose-600">{err}</p>}
            {msg && <p className="text-sm text-emerald-600">{msg}</p>}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-cyan-600 text-white py-2 hover:bg-cyan-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Update password"}
            </button>
          </form>

          <div className="mt-4 text-sm">
            <button
              onClick={() => router.push("/login")}
              className="text-slate-600 underline"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
