// Refreshes the Supabase session cookie on every request, requires authentication for every
// application page (including '/' now — an unauthenticated visitor always lands on /login),
// enforces the forced-password-change state, and applies coarse role-based route gating so a
// role can only reach the general area it belongs to. Fine-grained per-row scoping (which
// counties/properties a given user can see) is Module 04's job (RLS + assignment tables) — this
// is "can this role be on this page at all," not "which rows within it."
//
// Called from the root middleware.js — on its own this file does nothing, since Next.js only
// invokes middleware.js at the project root.
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

// Reachable with NO session at all. '/' and '/partner-portal' are deliberately NOT here — every
// role, Partner included, now authenticates through Supabase Auth (Module 03); there is no more
// access-code gate.
const NO_SESSION_REQUIRED = new Set(['/login', '/forgot-password', '/reset-password']);

// Always usable once signed in, regardless of must_change_password — /login shows its own
// "already signed in" state rather than needing the gate, and forgot/reset-password stay
// available as an alternate path out for someone who's lost even their temporary password.
const SKIP_FORCED_CHANGE_CHECK = new Set(['/login', '/forgot-password', '/reset-password']);
const CHANGE_PASSWORD_PATH = '/change-password';

// The exact mapping from the spec. Doubles as the fallback destination whenever a role gets
// bounced off a page it doesn't belong on (forced-change complete, admin-only page, wrong role
// for a gated route, etc.) — one source of truth for "where does this role actually live."
const ROLE_LANDING = {
  admin: '/',
  acquisition: '/pipeline',
  disposition: '/acquisitions',
  title: '/acquisitions',
  partner: '/partner-portal',
};

// Coarse, path-level role gating. Only the paths listed here are restricted by role; anything
// absent (e.g. /change-password) is handled by the checks around it instead.
const ROUTE_ALLOWED_ROLES = {
  '/': ['admin'],
  '/pipeline': ['admin', 'acquisition'],
  '/acquisitions': ['admin', 'disposition', 'title'],
  '/partner-portal': ['admin', 'partner'],
};

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
        },
      },
    }
  );

  // Touching auth here is what actually refreshes the session — without this call the cookie
  // just sits there and silently expires.
  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  function redirectTo(path, params) {
    const url = new URL(path, request.url);
    if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const redirectResponse = NextResponse.redirect(url);
    // Carry over any cookies the session-refresh call above just set, so a redirect never drops
    // a legitimately refreshed session.
    supabaseResponse.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  // Every API route checks its own auth (see requireRole() in lib/auth/session.js) — page-level
  // gating here doesn't apply to them, and shouldn't: a route being reachable doesn't make it
  // authorized, and vice versa.
  if (pathname.startsWith('/api/')) return supabaseResponse;

  if (!user) {
    if (NO_SESSION_REQUIRED.has(pathname)) return supabaseResponse;
    return redirectTo('/login', { next: pathname });
  }

  // Signed in from here on.
  if (SKIP_FORCED_CHANGE_CHECK.has(pathname)) return supabaseResponse;

  // One combined lookup for every check below. Permitted by profiles' own RLS policy
  // (`id = auth.uid()` in the select policy) via this session-scoped anon-key client — reading
  // your own role/flag never needs the service role key.
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_active, must_change_password')
    .eq('id', user.id)
    .maybeSingle();

  // No profile row (shouldn't happen — the trigger always creates one) or a deactivated
  // account: treat the same as signed-out rather than leaving them in an undefined state.
  // `disabled=1` (only set in the is_active===false case, not the no-profile case, which
  // shouldn't happen in practice) is what LoginForm.jsx keys off to show a clear "your account
  // was disabled" message instead of the generic sign-in screen or a misleading "already signed
  // in" state — their Supabase session may still be technically valid, but is_active=false has
  // already fully blocked them from every page and API route regardless.
  if (!profile) {
    return redirectTo('/login', { next: pathname });
  }
  if (profile.is_active === false) {
    return redirectTo('/login', { next: pathname, disabled: '1' });
  }

  const landing = ROLE_LANDING[profile.role] || '/login';

  // Mandatory password change takes priority over everything below, including role routing —
  // per spec, this must be resolved before role-based access is even considered.
  if (profile.must_change_password && pathname !== CHANGE_PASSWORD_PATH) {
    return redirectTo(CHANGE_PASSWORD_PATH);
  }
  if (!profile.must_change_password && pathname === CHANGE_PASSWORD_PATH) {
    return redirectTo(landing);
  }

  // Coarse role gating — this is what actually stops e.g. a Partner from reaching /pipeline by
  // typing the URL directly (the exact scenario called out in the spec): the redirect target
  // itself was never the authorization, this check is.
  const allowedRoles = ROUTE_ALLOWED_ROLES[pathname];
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return redirectTo(landing);
  }

  if (pathname.startsWith('/admin') && profile.role !== 'admin') {
    return redirectTo(landing);
  }

  return supabaseResponse;
}
