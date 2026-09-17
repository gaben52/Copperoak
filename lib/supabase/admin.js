// Service-role Supabase client — Route Handlers only, NEVER import this from a 'use client'
// component or anything that ships to the browser. The service role key bypasses Row Level
// Security entirely, which is the whole point right now: `properties`/`monthly_funding` have
// RLS enabled and forced with ZERO policies (fail-closed by design, until Module 04's signed-off
// permission matrix ships real per-role policies). Until then, this is how the app's own
// server-side routes read/write the data at all — the browser itself still has no direct access
// and never holds this key.
import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      'Supabase admin client is not configured: set SUPABASE_SERVICE_ROLE_KEY in the root .env ' +
      '(Supabase dashboard → Project Settings → API → service_role secret). Never prefix it with ' +
      'NEXT_PUBLIC_ — that would ship it to the browser.'
    );
  }
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
