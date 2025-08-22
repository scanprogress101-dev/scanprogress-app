// pages/api/scans.js
import { supabaseAdmin } from '../../lib/supabaseAdmin';

/**
 * Returns latest scans from inbody_570_raw (staged archive).
 * If empty, returns a small demo dataset so the UI stays alive.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { data, error } = await supabaseAdmin
      .from('inbody_570_raw')
      .select('id, vsid, scan_time, raw_data')
      .order('scan_time', { ascending: false })
      .limit(200);

    if (error) {
      console.error('scans fetch error:', error);
      return res.status(500).json({ error: 'DB error', detail: error.message });
    }

    // Map into a simple shape the UI understands. Try to pull key metrics from raw_data.
    const mapped = (data ?? []).map(row => {
      const r = row.raw_data || {};
      const num = v => (Number.isFinite(Number(v)) ? Number(v) : null);
      const str = v => (v == null ? null : String(v));

      return {
        id: row.id,
        vsid: row.vsid,
        scan_time: row.scan_time,
        member_id: str(r.member_id ?? r.member_no ?? r.uid ?? r.user_id ?? '—'),
        gender: str(r.gender ?? '—'),
        age: num(r.age),
        weight: num(r.weight),
        bodyFatPct: num(r.pbf ?? r.body_fat ?? r.bodyfat),
        smm: num(r.smm ?? r.skeletal_muscle_mass),
        bmi: num(r.bmi),
        raw: r,
      };
    });

    // If no scans yet, return demo rows so the UI renders
    if (!mapped.length) {
      const now = new Date();
      const daysAgo = d => new Date(now.getTime() - d * 24 * 3600 * 1000).toISOString();
      return res.status(200).json({
        demo: true,
        items: [
          { id: 1, vsid: 'demo-1', scan_time: daysAgo(2), member_id: '2144994155', gender: 'M', age: 28, weight: 191.4, bodyFatPct: 24.1, smm: 69.0, bmi: 27.4 },
          { id: 2, vsid: 'demo-2', scan_time: daysAgo(9), member_id: '2144994155', gender: 'M', age: 28, weight: 194.0, bodyFatPct: 25.2, smm: 68.2, bmi: 27.8 },
          { id: 3, vsid: 'demo-3', scan_time: daysAgo(16), member_id: '2144994155', gender: 'M', age: 28, weight: 197.2, bodyFatPct: 26.0, smm: 67.9, bmi: 28.3 },
        ],
      });
    }

    return res.status(200).json({ demo: false, items: mapped });
  } catch (e) {
    console.error('scans handler error:', e);
    return res.status(500).json({ error: 'Server error', detail: String(e) });
  }
}
