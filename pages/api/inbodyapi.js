// pages/api/inbodyapi.js

export default function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Verify secret header
  const signature = req.headers["x-inbody-signature"];
  const expectedSecret = process.env.INBODY_WEBHOOK_SECRET;

  if (!signature || signature !== expectedSecret) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Parse body
    const data = req.body;

    // Example: store, log, or process InBody data
    console.log("Received InBody data:", data);

    return res.status(200).json({
      ok: true,
      stored: {
        vsid: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        payload: data,
      },
    });
  } catch (err) {
    console.error("Error in InBody API:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
