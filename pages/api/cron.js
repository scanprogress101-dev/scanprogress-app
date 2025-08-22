// pages/api/cron.js
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req, res) {
  // Allow GET (Vercel Cron) and HEAD (some monitors ping with HEAD)
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Token gate (recommended). If CRON_SECRET is not set, we skip auth.
  const secret = process.env.CRON_SECRET;
  if (secret && secret.length > 0) {
    const provided =
      // query string
      req.query.token ||
      // header: x-cron-token: <secret>
      req.headers['x-cron-token'] ||
      // header: Authorization: Bearer <secret>
      (req.headers['authorization']?.replace(/^Bearer\s+/i, '') ?? '');

    if (!provided || provided !== secret) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  try {
    // Call your Postgres function that processes staged rows
    // Make sure this function exists and you GRANT EXECUTE to anon/service
    const { data, error } = await supabaseAdmin.rpc('process_inbody_stage');

    if (error) {
      console.error('process_inbody_stage RPC error:', error);
      return res.status(500).json({
        ok: false,
        error: 'RPC failed',
        detail: error.message ?? String(error),
      });
    }

    // Normalize response (adjust to match what your RPC returns)
    const processed = data?.processed ?? data?.moved ?? 0;
    const failed = data?.failed ?? 0;

    return res.status(200).json({ ok: true, processed, failed });
  } catch (e) {
    console.error('Cron handler error:', e);
    return res.status(500).json({ ok: false, error: 'Server error', detail: String(e) });
  }
}
