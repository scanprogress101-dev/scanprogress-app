// pages/api/inbodyapi.js
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req, res) {
  res.setHeader('Allow', 'GET,HEAD,POST');

  // Connectivity check for the device
  if (req.method === 'GET' || req.method === 'HEAD') {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send('INBODYAPI OK');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Optional shared-secret auth
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

  // ------------- Parse payload (supports JSON or x-www-form-urlencoded) -------------
  const ctype = (req.headers['content-type'] || '').toLowerCase();
  let raw = req.body;
  // Next.js parses JSON and form bodies for Pages Router automatically, but
  // if the device sends text, keep as-is:
  if (!raw || typeof raw === 'string') {
    try { raw = raw ? JSON.parse(raw) : {}; } catch { /* keep as string */ }
  }

  // Normalize keys (handle a bunch of common alias names)
  const get = (obj, keys, def = undefined) => {
    for (const k of keys) {
      if (obj && obj[k] !== undefined && obj[k] !== null && obj[k] !== '') return obj[k];
      const lower = Object.keys(obj || {}).find(kk => kk.toLowerCase() === k.toLowerCase());
      if (lower) return obj[lower];
    }
    return def;
  };

  // Allow for both JSON objects and form bodies
  const src = typeof raw === 'object' && raw !== null ? raw : {};

  // Common fields seen from InBody 570 exports / firmwares (names vary by version)
  const parsed = {
    member_id:          String(get(src, ['MemberID','member_id','UserID','ID','Cid'], null) ?? ''),
    name:               get(src, ['Name','FullName','MemberName'], null) ?? '',
    sex:                get(src, ['Sex','Gender'], null) ?? '',                 // 'M'/'F' or 'Male'/'Female'
    age:                num(get(src, ['Age'], null)),
    height_cm:          num(get(src, ['Height','HeightCm','Height_cm'], null)), // often cm
    weight_kg:          num(get(src, ['Weight','WeightKg','Weight_kg','BW'], null)),
    pbf:                num(get(src, ['BodyFatPct','PBF','PercentBodyFat'], null)),            // %
    smm_kg:             num(get(src, ['SkeletalMuscleMass','SMM'], null)),                     // kg
    bmi:                num(get(src, ['BMI'], null)),
    bmr_kcal:           num(get(src, ['BMR','BMRkcal'], null)),
    tbw_l:              num(get(src, ['TBW','TBW_L'], null)),                                   // liters
    ecw_tbw:            num(get(src, ['ECW_TBW','ECW/TBW','ECWoverTBW'], null)),               // ratio
    visceral_fat_level: num(get(src, ['VisceralFatLevel','VFL'], null)),
    impedance:          get(src, ['Impedance','Z','Z50'], null),
    scan_at:            toISO(get(src, ['ScanDate','TestDate','MeasureDate','DateTime'], null)),
    source:             'inbody'
  };

  // Helper: numeric coercion
  function num(v) {
    if (v === null || v === undefined) return null;
    const n = Number(String(v).replace(/[^\d.\-]/g, ''));
    return Number.isFinite(n) ? n : null;
  }
  // Helper: date → ISO
  function toISO(v) {
    if (!v) return null;
    try {
      // Handle "YYYY-MM-DD HH:mm:ss" and similar
      const d = new Date(v);
      if (!isNaN(d.valueOf())) return d.toISOString();
    } catch {}
    return null;
  }

  // ------------- Persist -------------
  try {
    // 1) Store raw payload in staging
    const { data: staged, error: stageErr } = await supabaseAdmin
      .from('inbody_570_stage')
      .insert([{ raw_data: typeof raw === 'object' ? raw : { raw_text: String(raw) } }])
      .select('vsid, created_at')
      .single();

    if (stageErr) {
      console.error('Supabase stage insert error:', stageErr);
      return res.status(500).json({ error: 'Failed to store scan (stage)', detail: stageErr.message });
    }

    // 2) Store normalized row (best-effort)
    const { error: parsedErr } = await supabaseAdmin
      .from('inbody_570')
      .insert([ parsed ]);

    if (parsedErr) {
      // Not fatal for device; we still accepted the payload
      console.warn('Supabase parsed insert warning:', parsedErr);
    }

    return res.status(200).json({ ok: true, stored: { vsid: staged?.vsid, created_at: staged?.created_at } });
  } catch (e) {
    console.error('API error:', e);
    return res.status(500).json({ error: 'Server error', detail: String(e) });
  }
}
