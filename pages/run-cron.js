// pages/api/run-cron.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.CRON_SECRET;
  if (!token) {
    return res.status(500).json({ error: "CRON_SECRET not set" });
  }

  // Build a base URL for this deployment
  const base =
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    const resp = await fetch(`${base}/api/cron?token=${encodeURIComponent(token)}`);
    const json = await resp.json();
    if (!resp.ok) {
      return res.status(resp.status).json(json);
    }
    // Normalize the response for the dashboard message
    res.status(200).json({
      ok: true,
      processed: json.processed ?? 0,
      failed: json.failed ?? 0
    });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
