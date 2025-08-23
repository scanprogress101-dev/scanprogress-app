// pages/api/inbody.js
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req, res) {
  // Only allow POST from the InBody device / webhook
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Optional shared-secret check (useful when pointing the InBody directly here)
  // If you didn't set INBODY_WEBHOOK_SECRET in Vercel, this is skipped.
  try {
    const expected = process.env.INBODY_WEBHOOK_SECRET;
    if (expected) {
      const received = req.headers['x-inbody-signature'];
      if (!received || received !== expected) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }
  } catch {
    // If anything odd happens above, fail closed
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Body should be the raw scan JSON
  const scanData = req.body ?? null;
  if (!scanData) {
    return res.status(400).json({ error: 'No body' });
  }

  try {
    // Store raw scan in the staging table
    const { data, error } = await supabaseAdmin
      .from('inbody_570_stage')
      .insert([{ raw_data: scanData }])
      .select('vsid, created_at')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return res
        .status(500)
        .json({ error: 'Failed to store scan', detail: error.message });
    }

    // Success
    return res.status(200).json({
      ok: true,
      stored: { vsid: data?.vsid, created_at: data?.created_at },
    });
  } catch (e) {
    console.error('API error:', e);
    return res
      .status(500)
      .json({ error: 'Server error', detail: String(e) });
  }
}
