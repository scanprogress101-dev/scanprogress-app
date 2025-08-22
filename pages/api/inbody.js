// pages/api/inbody.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,   // use the admin key on the server
  { auth: { persistSession: false } }
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const scanData = req.body;

    const { data, error } = await supabase
      .from('inbody_570_stage')
      .insert([{ raw_data: scanData }])
      .select('id')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return res
        .status(500)
        .json({ error: 'Failed to store scan', detail: error.message });
    }

    return res.status(200).json({ ok: true, message: 'Scan received', id: data.id });
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}
