// pages/api/inbodyapi.js
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req, res) {
  // Always advertise allowed methods
  res.setHeader('Allow', 'GET,HEAD,POST');

  // InBody connectivity handshake: respond 200 to GET/HEAD
  if (req.method === 'GET' || req.method === 'HEAD') {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send('INBODYAPI OK');
  }

  // Only allow POST for data
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Optional shared-secret check (simple header match)
  try {
    const expected = process.env.INBODY_WEBHOOK_SECRET;
    if (expected) {
      const received = req.headers['x-inbody-signature'];
      if (!received || received !== expected) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Next.js parses JSON and x-www-form-urlencoded by default
  const scanData = req.body ?? null;
  if (!scanData || (typeof scanData === 'object' && Object.keys(scanData).length === 0)) {
    return res.status(400).json({ error: 'No body' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('inbody_570_stage')
      .insert([{ raw_data: scanData }])
      .select('vsid, created_at')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to store scan', detail: error.message });
    }

    return res.status(200).json({
      ok: true,
      stored: { vsid: data?.vsid, created_at: data?.created_at },
    });
  } catch (e) {
    console.error('API error:', e);
    return res.status(500).json({ error: 'Server error', detail: String(e) });
  }
}
