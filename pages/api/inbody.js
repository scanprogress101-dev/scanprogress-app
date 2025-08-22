// pages/api/inbody.js
import { supabase } from "../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // InBody will POST JSON data here
    const scanData = req.body;

    // Save raw scan to staging table for safety
    const { data, error } = await supabase
      .from("inbody_570_stage")
      .insert([{ raw_data: scanData }]);

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ error: "Failed to store scan" });
    }

    return res.status(200).json({ ok: true, message: "Scan received", id: data[0].id });
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
