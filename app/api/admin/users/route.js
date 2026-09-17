// Admin-only. Read-only list for the user management screen — re-checks authorization
// server-side the same way the invite route does, rather than trusting that only admins can
// reach the page that calls this.
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { SUPERADMIN_EMAIL } from '@/lib/auth/superadmin';

export async function GET() {
  const { ok } = await requireAdmin();
  if (!ok) {
    return NextResponse.json({ error: 'Admins only.' }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('profiles')
    .select('id, full_name, email, mobile, role, is_active, must_change_password, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Could not load users.' }, { status: 500 });
  }

  return NextResponse.json({ users: data });
}

// Activate/deactivate a user. A deactivated account is blocked everywhere immediately — every
// page (middleware) and every API route (requireRole()/getSessionProfile()) already checks
// profiles.is_active on each request, and the RLS layer now does too (see
// 20260911000000_deactivation_rls_gap.sql) — so this single flag is the entire mechanism, not
// just a UI label. Deliberately cannot be used to deactivate the caller's own account: an admin
// locking themselves out with no other admin able to undo it is exactly the kind of mistake this
// guards against, not a restriction anyone has a legitimate reason to bypass. The superadmin
// account is additionally protected from every OTHER admin too, not just itself — see
// lib/auth/superadmin.js.
export async function POST(request) {
  const { ok, user } = await requireAdmin();
  if (!ok) {
    return NextResponse.json({ error: 'Admins only.' }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  if (body.action !== 'setActive') {
    return NextResponse.json({ error: `Unknown action "${body.action}"` }, { status: 400 });
  }
  const { userId, isActive } = body;
  if (!userId || typeof isActive !== 'boolean') {
    return NextResponse.json({ error: 'Missing or invalid userId/isActive.' }, { status: 400 });
  }
  if (userId === user.id) {
    return NextResponse.json({ error: 'You cannot deactivate your own account.' }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: target, error: targetError } = await admin
    .from('profiles')
    .select('id, email')
    .eq('id', userId)
    .maybeSingle();
  if (targetError || !target) {
    return NextResponse.json({ error: 'Could not find that account.' }, { status: 404 });
  }
  if (target.email === SUPERADMIN_EMAIL) {
    return NextResponse.json({ error: 'The superadmin account cannot be activated or deactivated.' }, { status: 400 });
  }

  const { data, error } = await admin
    .from('profiles')
    .update({ is_active: isActive })
    .eq('id', userId)
    .select('id, full_name, is_active')
    .single();

  if (error) {
    return NextResponse.json({ error: 'Could not update that account.' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, user: data });
}
