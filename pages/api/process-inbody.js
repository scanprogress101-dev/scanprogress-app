// pages/api/process-inbody.js
import { createClient } from '@supabase/supabase-js';

// IMPORTANT: service role key must be server-only (not exposed to the browser)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST' });
  }

  try {
    // This calls the Postgres function you created earlier:
    // public.process_inbody_stage()
    const { data, error } = await supabase.rpc('process_inbody_stage');
    if (error) throw error;

    // Your function likely returns null/void; that’s fine.
    return res.status(200).json({ ok: true, result: data ?? null });
  } catch (err) {
    console.error('process_inbody error:', err);
    return res.status(500).json({ ok: false, error: String(err.message ?? err) });
  }
}
