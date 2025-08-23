import type { NextApiRequest, NextApiResponse } from "next";

/**
 * InBody webhook endpoint
 * - GET/HEAD: returns 200 text/plain so the device's connectivity check passes
 * - POST: accepts JSON or x-www-form-urlencoded payloads and returns { ok: true }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Allow these methods
  res.setHeader("Allow", "GET,HEAD,POST");

  // Connectivity handshake for InBody device
  if (req.method === "GET" || req.method === "HEAD") {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(200).send("INBODYAPI OK");
  }

  if (req.method === "POST") {
    try {
      // Next.js API routes automatically parse JSON and application/x-www-form-urlencoded
      const payload = req.body ?? {};

      // TODO: Auth/validation (if you require a token, header, or basic auth)
      // TODO: Persist payload to your DB

      // Minimal OK response for InBody
      return res.status(200).json({ ok: true });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: err?.message ?? "Server error" });
    }
  }

  // Unsupported method
  return res.status(405).end("Method Not Allowed");
}
