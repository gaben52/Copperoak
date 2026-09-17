// Supabase client for Client Components ('use client' files) — browser-side, uses the
// publishable (anon) key only. Safe to expose: it can only do what your RLS policies allow.
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}
