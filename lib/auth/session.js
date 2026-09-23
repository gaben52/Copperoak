// Server-side only. Reads the caller's own identity + profile via the session-scoped (anon key +
// cookies) client — this is a self-lookup, permitted by profiles' own RLS policy
// (`id = auth.uid()`), so it never needs the service role key just to answer "who is this and
// are they an admin." Route handlers use this to verify authorization themselves rather than
// trusting the frontend to hide a button.
import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';

// cache(): the root layout (for the sidebar) and the page both call this on a full page load —
// React memoizes it per request, so that's one lookup, not two. Never shared across requests.
export const getSessionProfile = cache(async function getSessionProfile() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null };
  const { data: profile } = await supabase
    .from('profiles')
    .select(`id, full_name, email, role, is_active, must_change_password,
      perm_create_property, perm_edit_acquisition_fields, perm_edit_disposition_fields, perm_edit_title_fields`)
    .eq('id', user.id)
    .maybeSingle();
  return { user, profile: profile || null };
});

export async function requireAdmin() {
  return requireRole(['admin']);
}

// Coarse "is this caller even allowed to call this API at all" check for data routes —
// role-based route access (Module 03), not the fine-grained per-row RLS/assignment scoping
// that's Module 04's job. Every data-serving Route Handler should call this: middleware only
// protects *pages*, it explicitly skips /api/* (each route verifies itself), so skipping this
// here would mean anyone — including someone with no session at all — could call the route
// directly and bypass every page-level redirect.
export async function requireRole(allowedRoles) {
  const { user, profile } = await getSessionProfile();
  if (!user || !profile || !profile.is_active || !allowedRoles.includes(profile.role)) {
    return { ok: false, user: null, profile: null };
  }
  return { ok: true, user, profile };
}
