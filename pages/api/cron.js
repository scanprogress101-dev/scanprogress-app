// pages/api/cron.js
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  console.log("Cron job triggered at:", new Date().toISOString());

  // 🔹 Put your scheduled task logic here
  // Example: Call a Supabase function, clean up old records, etc.

  return res.status(200).json({ ok: true, ranAt: new Date().toISOString() });
}
