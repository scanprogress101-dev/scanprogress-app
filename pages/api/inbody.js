// pages/api/inbody.js
import supabaseAdmin from '../../lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Simple auth (optional but good if you’re pointing the InBody device here)
  const expected = process.env.INBODY_WEBHOOK_SECRET;
  const received = req.headers['x-inbody-signature'];
  if (!expected || received !== expected) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const scanData = req.body ?? null;

    if (!scanData) {
      return res.status(400).json({ error: 'No body' });
    }

    const { data, error } = await supabaseAdmin
      .from('inbody_570_stage')
      .insert([{ raw_data: scanData }])
      .select('vsid, created_at')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to store scan', detail: error.message });
    }

    return res.status(200).json({ ok: true, stored: data });
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: 'Server error', detail: String(err) });
  }
}
