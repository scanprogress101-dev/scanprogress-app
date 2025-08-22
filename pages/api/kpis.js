// pages/api/kpis.js
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { data, error } = await supabaseAdmin
      .from('inbody_570_raw')
      .select('id, scan_time');

    if (error) {
      console.error('kpis fetch error:', error);
      return res.status(500).json({ error: 'DB error', detail: error.message });
    }

    if (!data || !data.length) {
      return res.status(200).json({
        demo: true,
        kpis: {
          totalScans: 3,
          scansThisMonth: 1,
          activeMembers: 1,
        },
      });
    }

    const totalScans = data.length;
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
    const scansThisMonth = data.filter(r => new Date(r.scan_time) >= monthStart).length;

    // We don't have members normalized yet; approximate unique member_ids pulled from raw_data
    const { data: rich } = await supabaseAdmin
      .from('inbody_570_raw')
      .select('raw_data')
      .limit(1000);

    const memberSet = new Set();
    (rich ?? []).forEach(r => {
      const m = r?.raw_data?.member_id ?? r?.raw_data?.member_no ?? r?.raw_data?.uid ?? r?.raw_data?.user_id;
      if (m) memberSet.add(String(m));
    });

    return res.status(200).json({
      demo: false,
      kpis: {
        totalScans,
        scansThisMonth,
        activeMembers: memberSet.size || null,
      },
    });
  } catch (e) {
    console.error('kpis handler error:', e);
    return res.status(500).json({ error: 'Server error', detail: String(e) });
  }
}
