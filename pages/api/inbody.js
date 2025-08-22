// pages/api/inbody.js
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req, res) {
  // Basic logging so we can see what Vercel is receiving
  console.log('Incoming method:', req.method);
  console.log('Headers Content-Type:', req.headers['content-type']);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', method: req.method });
  }

  // Ensure JSON
  if (!req.headers['content-type']?.toLowerCase().includes('application/json')) {
    return res.status(400).json({ error: 'Content-Type must be application/json' });
  }

  try {
    const scanData = req.body; // Next.js parses JSON automatically

    // Insert raw payload to staging
    const { data, error } = await supabaseAdmin
      .from('inbody_570_stage')
      .insert([{ raw_data: scanData }])
      .select('vsid, created_at');

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to store scan' });
    }

    return res.status(200).json({ ok: true, stored: data?.[0] ?? null });
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
