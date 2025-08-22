export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Simple auth
  const expected = process.env.INBODY_WEBHOOK_SECRET;
  const received = req.headers['x-inbody-signature'];
  if (!expected || received !== expected) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const scanData = req.body; // JSON
    const { data, error } = await supabase
      .from('inbody_570_stage')
      .insert([{ raw_data: scanData }])
      .select('vsid, created_at')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to store scan' });
    }

    return res.status(200).json({ ok: true, stored: data });
  } catch (e) {
    console.error('API error:', e);
    return res.status(500).json({ error: 'Server error' });
  }
}
