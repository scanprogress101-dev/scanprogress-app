// pages/api/cron.js
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req, res) {
  // Pages router: allow GET (Vercel Cron will call it)
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Protect with a token so randoms can't trigger your job
  const okToken =
    typeof process.env.CRON_SECRET === 'string' &&
    process.env.CRON_SECRET.length > 0;

  if (okToken) {
    const token =
      req.query.token ||
      req.headers['x-cron-token'] ||
      req.headers['authorization']?.replace(/^Bearer\s+/i, '');

    if (!token || token !== process.env.CRON_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  try {
    // Run your Postgres function that processes staged rows
    // (make sure this function exists & GRANT EXECUTE was run)
    const { data, error } = await supabaseAdmin.rpc('process_inbody_stage');

    if (error) {
      console.error('RPC error:', error);
      return res
        .status(500)
        .json({ error: 'RPC failed', detail: error.message });
    }

    // Shape a friendly response; adjust if your RPC returns different fields
    const processed = data?.processed ?? data?.moved ?? 0;
    const failed = data?.failed ?? 0;

    return res.status(200).json({ ok: true, processed, failed });
  } catch (e) {
    console.error('Cron error:', e);
    return res
      .status(500)
      .json({ error: 'Server error', detail: String(e) });
  }
}
