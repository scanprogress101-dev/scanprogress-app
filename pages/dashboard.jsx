// pages/dashboard.jsx
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

function Stat({ label, value, hint }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: "16px 18px",
      boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
    }}>
      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
      {hint ? <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 6 }}>{hint}</div> : null}
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRaw: 0,
    stagePending: 0,
    stageErrored: 0,
  });
  const [recent, setRecent] = useState([]);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("");

  // Gate this page: must be signed in
  useEffect(() => {
    let ignore = false;

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }
      if (ignore) return;

      setEmail(session.user.email ?? "");
      setSessionChecked(true);
    })();

    return () => { ignore = true; };
  }, [router]);

  const loadData = useCallback(async () => {
    setLoading(true);

    // 1) total scans stored in raw table
    const { count: totalRaw = 0 } = await supabase
      .from("inbody_570_raw")
      .select("id", { head: true, count: "exact" });

    // 2) staged pending (not processed yet)
    const { count: stagePending = 0 } = await supabase
      .from("inbody_570_stage")
      .select("vsid", { head: true, count: "exact" })
      .is("processed_at", null);

    // 3) staged errored (processed but has error_text)
    const { count: stageErrored = 0 } = await supabase
      .from("inbody_570_stage")
      .select("vsid", { head: true, count: "exact" })
      .not("error_text", "is", null);

    // 4) recent scans list (from raw)
    const { data: recentRows = [] } = await supabase
      .from("inbody_570_raw")
      .select("id, vsid, scan_time, inserted_at")
      .order("inserted_at", { ascending: false })
      .limit(10);

    setStats({ totalRaw, stagePending, stageErrored });
    setRecent(recentRows ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (sessionChecked) loadData();
  }, [sessionChecked, loadData]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  const runSync = async () => {
    setMessage("");
    setRunning(true);
    try {
      const res = await fetch("/api/run-cron", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Sync failed");
      setMessage(`Sync OK — processed: ${json.processed}  failed: ${json.failed}`);
      // reload numbers after a moment
      setTimeout(() => loadData(), 800);
    } catch (e) {
      setMessage(`Sync error: ${e.message}`);
    } finally {
      setRunning(false);
    }
  };

  // Basic page chrome
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Top bar */}
      <div style={{
        background: "#0ea5e9",
        color: "#fff",
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 6,
            background: "linear-gradient(135deg,#22d3ee,#0ea5e9)"
          }}/>
          <div style={{ fontWeight: 700 }}>ScanProgress</div>
          <div style={{ opacity: 0.85 }}>• Store Dashboard</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {email ? <div style={{ fontSize: 13, opacity: 0.85 }}>{email}</div> : null}
          <button
            onClick={signOut}
            style={{
              background: "#fff",
              color: "#0ea5e9",
              border: "none",
              borderRadius: 8,
              padding: "8px 14px",
              fontWeight: 600,
              cursor: "pointer"
            }}>
            Sign out
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1100, margin: "26px auto", padding: "0 14px" }}>
        <div style={{ marginBottom: 14, color: "#6b7280" }}>
          Visible to signed‑in staff. Use this page to monitor your InBody sync.
        </div>

        {/* Controls */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16
        }}>
          <button
            onClick={runSync}
            disabled={running}
            style={{
              background: running ? "#94a3b8" : "#0ea5e9",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "10px 16px",
              fontWeight: 700,
              cursor: running ? "default" : "pointer"
            }}
          >
            {running ? "Syncing…" : "Run sync now"}
          </button>

          <button
            onClick={loadData}
            disabled={loading}
            style={{
              background: "#111827",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "10px 16px",
              fontWeight: 700,
              cursor: loading ? "default" : "pointer"
            }}
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>

          {message ? (
            <div style={{ marginLeft: 8, color: "#374151", fontSize: 14 }}>{message}</div>
          ) : null}
        </div>

        {/* Stats */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 14,
          marginBottom: 20
        }}>
          <Stat label="Total scans stored" value={stats.totalRaw} />
          <Stat label="Stage pending" value={stats.stagePending} hint="Awaiting processing" />
          <Stat label="Stage errors" value={stats.stageErrored} hint="Need attention" />
        </div>

        {/* Recent scans */}
        <div style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
        }}>
          <div style={{ padding: 14, borderBottom: "1px solid #e5e7eb", fontWeight: 700 }}>
            Recent scans
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9fafb", textAlign: "left" }}>
                  <th style={{ padding: "10px 14px", fontSize: 12, color: "#6b7280" }}>ID</th>
                  <th style={{ padding: "10px 14px", fontSize: 12, color: "#6b7280" }}>VSID</th>
                  <th style={{ padding: "10px 14px", fontSize: 12, color: "#6b7280" }}>Scan time</th>
                  <th style={{ padding: "10px 14px", fontSize: 12, color: "#6b7280" }}>Inserted</th>
                </tr>
              </thead>
              <tbody>
                {recent.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={4} style={{ padding: 14, color: "#6b7280" }}>
                      No rows yet.
                    </td>
                  </tr>
                ) : null}
                {recent.map((r) => (
                  <tr key={r.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "10px 14px" }}>{r.id}</td>
                    <td style={{ padding: "10px 14px", fontFamily: "monospace" }}>
                      {r.vsid ?? "—"}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      {r.scan_time ? new Date(r.scan_time).toLocaleString() : "—"}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      {r.inserted_at ? new Date(r.inserted_at).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
