// lib/supabaseAdmin.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  // This will show up in Vercel logs if env vars are missing
  console.warn('Supabase admin missing env vars. URL or SERVICE ROLE KEY not set.');
}

export const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});
