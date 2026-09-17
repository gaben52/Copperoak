// Called after a successful supabase.auth.updateUser({ password }) — from BOTH the forced
// first-login change (/change-password) and the ordinary forgot-password reset
// (/reset-password), since either one means the user now has a real, self-chosen password and
// neither should leave them stuck being redirected back to the forced-change screen.
//
// This exists as its own narrow route rather than a client-side write because profiles_update
// RLS is admin-only (see 20260907000000_profiles_auth.sql — deliberately, so a user can't grant
// themselves a different role through the same policy). This route verifies the caller's own
// session, then uses the service-role client to flip exactly one field on exactly that caller's
// own row. It is not a general-purpose profile-update endpoint.

import { NextResponse } from 'next/server';
import { getSessionProfile } from '@/lib/auth/session';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST() {
  const { user } = await getSessionProfile();
  if (!user) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from('profiles')
    .update({ must_change_password: false })
    .eq('id', user.id);

  if (error) {
    return NextResponse.json({ error: 'Could not update your account. Try again.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
