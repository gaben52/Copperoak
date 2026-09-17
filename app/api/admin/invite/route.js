// Admin-only. Creates a new user with a server-generated temporary password and emails it —
// never the frontend's job, and never trusted from the frontend: authorization is re-checked
// here regardless of what the UI shows or hides.
//
// Flow: verify caller is an active admin -> validate input -> generate a temp password (never
// logged, never returned in any response) -> create the Supabase Auth user (service role,
// server-side only) -> the existing handle_new_user() trigger populates profiles -> email the
// temp password -> report the outcome. If the account is created but the email fails, that's
// reported as its own distinct state — never silently swallowed, never claimed as "sent" when it
// wasn't, and the account is NOT rolled back (the admin can fall back to the password-reset flow
// for that user, which needs no temp password at all).

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateTempPassword } from '@/lib/auth/generateTempPassword';
import { sendInviteEmail } from '@/lib/email/sendInviteEmail';
import { defaultPermissionsForRole } from '@/lib/permissions/fieldGroups';

const VALID_ROLES = new Set(['admin', 'acquisition', 'disposition', 'title', 'partner']);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PERMISSION_KEYS = ['create_property', 'edit_acquisition_fields', 'edit_disposition_fields', 'edit_title_fields'];

export async function POST(request) {
  const { ok, user } = await requireAdmin();
  if (!ok) {
    // Deliberately the same generic message whether the caller is unauthenticated, not an
    // admin, or deactivated — no need to hint at which.
    return NextResponse.json({ error: 'Admins only.' }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const fullName = (body.fullName || '').trim();
  const email = (body.email || '').trim().toLowerCase();
  const mobile = (body.mobile || '').trim();
  const role = body.role;

  if (!fullName) return NextResponse.json({ error: 'Full name is required.' }, { status: 400 });
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  if (!VALID_ROLES.has(role)) return NextResponse.json({ error: 'Select a valid role.' }, { status: 400 });

  // Individual permissions, admin-editable before inviting (see AdminUsersPage.jsx's "Individual
  // Permissions" section). Anything missing or not a real boolean falls back to that role's
  // default — never trust an arbitrary client payload for the actual value, only for the parts
  // the admin genuinely customized. These become the row's actual stored permissions once
  // created (not a live link to role — changing this user's role later does not change them).
  const permissionsInput = body.permissions && typeof body.permissions === 'object' ? body.permissions : {};
  const roleDefaults = defaultPermissionsForRole(role);
  const permissions = {};
  PERMISSION_KEYS.forEach((key) => {
    permissions[key] = typeof permissionsInput[key] === 'boolean' ? permissionsInput[key] : roleDefaults[key];
  });

  const tempPassword = generateTempPassword();
  const admin = createAdminClient();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      mobile: mobile || null,
      role,
      invited_by: user.id,
      must_change_password: true,
    },
  });

  if (createError) {
    // `code`/`error_code` ("email_exists") is the stable field Supabase documents for this —
    // matching on message text too as a fallback, since wording is more likely to drift than
    // the code (confirmed against a live duplicate-email call: "A user with this email address
    // has already been registered" — note "already ... registered", not the literal contiguous
    // phrase "already registered").
    const alreadyExists = createError.code === 'email_exists'
      || /already.*registered|already exists/i.test(createError.message || '');
    return NextResponse.json(
      { error: alreadyExists ? 'An account with this email already exists.' : 'Could not create the account. Try again.' },
      { status: alreadyExists ? 409 : 502 }
    );
  }

  // The on_auth_user_created trigger only populates full_name/email/mobile/role/invited_by from
  // metadata — the new perm_* columns aren't part of it, so a fresh row would otherwise sit at
  // their plain column default (false) regardless of role. This follow-up is what actually makes
  // "the default role permissions are already checked when the user is created" true.
  const { error: permError } = await admin
    .from('profiles')
    .update({
      perm_create_property: permissions.create_property,
      perm_edit_acquisition_fields: permissions.edit_acquisition_fields,
      perm_edit_disposition_fields: permissions.edit_disposition_fields,
      perm_edit_title_fields: permissions.edit_title_fields,
    })
    .eq('id', created.user.id);

  const loginUrl = new URL('/login', request.url).toString();

  if (permError) {
    // The account itself is real and already usable — same philosophy as the email-failure
    // branch below: never claim something happened that didn't. Not rolled back; an admin can
    // fix the permissions afterward from that user's row on the Assignments page.
    return NextResponse.json({
      ok: true,
      emailSent: null,
      warning: `Account created for ${email}, but its permissions could not be saved (they defaulted to none). ` +
        'Set them from that user\'s row on the Assignments page.',
    });
  }

  try {
    await sendInviteEmail({ fullName, email, role, tempPassword, loginUrl });
  } catch (emailError) {
    // The account is real and usable — say so plainly, and point at the honest fallback instead
    // of pretending the invite email went out.
    return NextResponse.json({
      ok: true,
      emailSent: false,
      warning:
        `Account created for ${email}, but the invitation email could not be sent. ` +
        'Use "Forgot password" on the sign-in screen to let them set their own password instead.',
    });
  }

  return NextResponse.json({ ok: true, emailSent: true, id: created.user.id });
}
