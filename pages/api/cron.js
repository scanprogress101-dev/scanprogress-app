// pages/api/cron.js
import { supabase } from '../../lib/supabaseClient';

function authOk(req) {
  const expected = process.env.CRON_SECRET;
  const header = req.headers['x-cron-secret'];
  const token = req.query?.token;
  return expected && (header === expected || token === expected);
}

// Very defensive: map whatever keys exist in raw_data into our normalized row.
function mapRawToScan(raw, stagedRow) {
  // Fallbacks so cron is robust while we learn actual payload shape.
  const weight = num(raw.weight);
  const pbf = num(raw.pbf ?? raw.body_fat ?? raw.bodyfat);
  const bmi = num(raw.bmi);
  const smm = num(raw.smm ?? raw.skeletal_muscle_mass);
  const lbm = num(raw.lbm ?? raw.lean_body_mass);
  const bfm = num(raw.bfm ?? raw.body_fat_mass);
  const tbw = num(raw.tbw ?? raw.total_body_water);
  const icw = num(raw.icw);
  const ecw = num(raw.ecw);
  const dlm = num(raw.dlm ?? raw.dry_lean_mass);
  const age = int(raw.age);
  const gender = str(raw.gender);
  const member_id = str(raw.member_id ?? raw.member_no ?? raw.user_id ?? raw.uid ?? 'unknown');

  // Scan timestamp from payload if present; fallback to staged created_at
  const scan_ts = ts(raw.scan_ts ?? raw.datetime ?? stagedRow.created_at);

  // You can fill store_id once you know it (keep null for now)
  const store_id = raw.store_id && isUuid(raw.store_id) ? raw.store_id : null;

  return {
    store_id,
    member_id,
    scan_ts,
    gender,
    age,
    weight,
    tbw, icw, ecw, dlm, bfm, lbm, smm, bmi, pbf
  };
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function int(v) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}
function str(v) {
  return (v === undefined || v === null) ? null : String(v);
}
function ts(v) {
  try { return new Date(v).toISOString(); } catch { return null; }
}
function isUuid(v) {
  return typeof v === 'string' && /^[0-9a-f-]{36}$/i.test(v);
}

export default async function handler(req, res) {
  if (!authOk(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Allow GET (cron) and POST (manual trigger) for convenience
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Pull a batch of unprocessed rows
  const BATCH = 100;
  const { data: staged, error: fetchErr } = await supabase
    .from('inbody_570_stage')
    .select('vsid, created_at, raw_data, processed_at, error_text')
    .is('processed_at', null)
    .order('created_at', { ascending: true })
    .limit(BATCH);

  if (fetchErr) {
    console.error('Fetch staged error:', fetchErr);
    return res.status(500).json({ error: 'Failed to fetch staged' });
  }
  if (!staged || staged.length === 0) {
    return res.status(200).json({ ok: true, processed: 0 });
  }

  let ok = 0, failed = 0;
  for (const row of staged) {
    try {
      const payload = row.raw_data || {};
      const scanRow = mapRawToScan(payload, row);

      // Basic sanity: must have member_id and scan_ts
      if (!scanRow.member_id || !scanRow.scan_ts) {
        throw new Error('Missing member_id or scan_ts');
      }

      // UPSERT (idempotent) using the unique index
      const { error: upsertErr } = await supabase
        .from('inbody_570')
        .upsert([scanRow], {
          onConflict: 'store_id, member_id, scan_ts',
          ignoreDuplicates: false
        });

      if (upsertErr) throw upsertErr;

      // Mark staged row processed
      const { error: updErr } = await supabase
        .from('inbody_570_stage')
        .update({ processed_at: new Date().toISOString(), error_text: null })
        .eq('vsid', row.vsid);

      if (updErr) throw updErr;

      ok++;
    } catch (e) {
      failed++;
      console.error('Process row failed vsid=', row.vsid, e);

      // Save error on the staged row
      await supabase
        .from('inbody_570_stage')
        .update({ error_text: String(e?.message ?? e), processed_at: new Date().toISOString() })
        .eq('vsid', row.vsid);
    }
  }

  return res.status(200).json({ ok: true, processed: ok, failed });
}
