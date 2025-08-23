// pages/api/inbodyapi.js
import { randomUUID } from "crypto";

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-inbody-signature");
}

export default async function handler(req, res) {
  setCors(res);

  // 1) CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // 2) Cheap health check
  if (req.method === "GET") {
    return res.status(200).json({ ok: true, route: "/api/inbodyapi" });
  }

  // 3) Only allow POST for data
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 4) Verify secret
  const expected = process.env.INBODY_WEBHOOK_SECRET || "";
  const received = req.headers["x-inbody-signature"];
  if (!expected) {
    return res.status(500).json({ error: "Server not configured: missing INBODY_WEBHOOK_SECRET" });
  }
  if (!received || received !== expected) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Next.js parses JSON bodies automatically for API routes
    const payload = req.body ?? null;
    if (!payload) return res.status(400).json({ error: "No JSON body" });

    // TODO: add DB insert here if/when you want it
    // console.log so you can see it in Vercel logs
    console.log("InBody payload:", payload);

    return res.status(200).json({
      ok: true,
      stored: {
        vsid: randomUUID(),
        created_at: new Date().toISOString(),
      },
      echo: payload,
    });
  } catch (err) {
    console.error("inbodyapi error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
