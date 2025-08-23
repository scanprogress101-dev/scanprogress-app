// pages/api/inbodyapi.js
import { randomUUID } from "crypto";

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-inbody-signature, authorization");
}

function okText(res, text = "OK") {
  res.status(200).setHeader("Content-Type", "text/plain");
  res.send(text);
}

function checkHeaderSecret(req) {
  const expected = process.env.INBODY_WEBHOOK_SECRET || "";
  if (!expected) return { enabled: false, ok: false };
  const received = req.headers["x-inbody-signature"];
  return { enabled: true, ok: !!received && received === expected };
}

function checkBasicAuth(req) {
  const user = process.env.INBODY_USER || "";
  const pass = process.env.INBODY_PASS || "";
  if (!user || !pass) return { enabled: false, ok: false };
  const hdr = req.headers.authorization || "";
  if (!hdr.startsWith("Basic ")) return { enabled: true, ok: false };
  try {
    const [u, p] = Buffer.from(hdr.slice(6), "base64").toString("utf8").split(":");
    return { enabled: true, ok: u === user && p === pass };
  } catch {
    return { enabled: true, ok: false };
  }
}

export default async function handler(req, res) {
  setCors(res);

  // 1) Preflight
  if (req.method === "OPTIONS") return res.status(204).end();

  // 2) Health check
  if (req.method === "GET") {
    return res.status(200).json({ ok: true, route: "/api/inbodyapi", ts: new Date().toISOString() });
  }

  // 3) Only POST for data
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 4) Auth — accept either x-inbody-signature or Basic Auth (if configured)
  const secret = checkHeaderSecret(req);
  const basic = checkBasicAuth(req);
  if (secret.enabled || basic.enabled) {
    if (!(secret.ok || basic.ok)) return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Next parses JSON and urlencoded bodies by default
    const payload = req.body ?? null;
    if (!payload || (typeof payload === "object" && Object.keys(payload).length === 0)) {
      return res.status(400).json({ error: "No body" });
    }

    // Optional normalization
    const deviceId = payload.device_id || payload.deviceId || payload.device || null;
    const memberId = payload.member_id || payload.memberId || payload.account || null;

    // Log (swap for DB/queue)
    console.log("[INBODY] incoming payload", {
      vsid: randomUUID(),
      receivedAt: new Date().toISOString(),
      deviceId,
      memberId,
      payload,
    });

    // Plain OK for device; JSON echo if ?verbose=1
    if (req.query?.verbose === "1") {
      return res.status(200).json({
        ok: true,
        stored: { vsid: randomUUID(), created_at: new Date().toISOString() },
        echo: payload,
      });
    }
    return okText(res, "OK");
  } catch (err) {
    console.error("inbodyapi error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
