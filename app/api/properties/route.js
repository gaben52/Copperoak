// Server-side data layer for the Auction Pipeline's properties table, using the Supabase
// service-role client (see lib/supabase/admin.js for why: RLS is on with real policies as of
// Module 04, but this route stays on the service-role client and does its own explicit scoping —
// see lib/auth/scoping.js's header comment for why both exist).
//
// Module 04: every non-admin role is scoped to its state/county/property assignments (the
// matrix's "View properties: A" row). Partner is scoped unconditionally (it never had
// unrestricted access to begin with); acquisition/disposition/title are scoped once their role is
// in SCOPING_ENABLED_ROLES (lib/permissions/rolloutSwitch.js) — see that file for why the switch
// exists. Partner Portal used to be a separate route (/api/partner-portal); it's consolidated
// here now that scoping isn't partner-specific — see /api/my-assignments for the "you're assigned
// to X" banner text that used to come bundled in that route's response.
//
// requireRole() below is what actually protects this data — middleware only gates *pages* and
// explicitly skips /api/*, so without this check anyone (including a fully unauthenticated
// caller) could hit this route directly and read/write every property, bypassing every
// page-level redirect entirely.

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/auth/session';
import { getAccessibleScope, applyPropertyScope, canAccessProperty } from '@/lib/auth/scoping';
import { signPropertyDocumentsList } from '@/lib/supabase/signDocuments';
import { allowedFieldsForProfile, redactFinancialFields, canCreateProperty, CAN_DELETE_ROLES } from '@/lib/permissions/fieldGroups';
import { SCOPING_ENABLED_ROLES } from '@/lib/permissions/rolloutSwitch';

const ALLOWED_ROLES = ['admin', 'acquisition', 'disposition', 'title', 'partner'];

// Partner is always scoped (no prior unrestricted behavior to regress from); acquisition/
// disposition/title only once their role is flipped on in the rollout switch.
function isScopingActive(role) {
  return role !== 'admin' && (role === 'partner' || SCOPING_ENABLED_ROLES.has(role));
}

export async function GET() {
  const { ok, profile } = await requireRole(ALLOWED_ROLES);
  if (!ok) return NextResponse.json({ error: 'Not authorized.' }, { status: 403 });

  try {
    const supabase = createAdminClient();
    let query = supabase.from('properties').select('*').order('created_at', { ascending: false });

    const scopingActive = isScopingActive(profile.role);
    if (scopingActive) {
      const scope = await getAccessibleScope(profile.id);
      query = applyPropertyScope(query, scope);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const withFields = scopingActive ? data.map((row) => redactFinancialFields(row, profile.role)) : data;
    const records = await signPropertyDocumentsList(withFields);
    return NextResponse.json({ records });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  const { ok, profile } = await requireRole(ALLOWED_ROLES);
  if (!ok) return NextResponse.json({ error: 'Not authorized.' }, { status: 403 });

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  let supabase;
  try {
    supabase = createAdminClient();
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }

  if (body.action === 'create') {
    if (!canCreateProperty(profile)) {
      return NextResponse.json({ error: 'Not authorized to create properties.' }, { status: 403 });
    }
    const { data, error } = await supabase.from('properties').insert(body.records).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ records: data });
  }

  if (body.action === 'update') {
    const scopingActive = isScopingActive(profile.role);
    const allowedFields = scopingActive ? allowedFieldsForProfile(profile) : null;
    const results = [];
    for (const u of body.updates || []) {
      if (scopingActive) {
        const hasAccess = await canAccessProperty(profile.id, u.id, profile.role);
        if (!hasAccess) {
          return NextResponse.json({ error: `Not authorized to edit property ${u.id}.` }, { status: 403 });
        }
        const offending = Object.keys(u.fields || {}).filter((k) => !allowedFields.has(k));
        if (offending.length) {
          return NextResponse.json(
            { error: `Not authorized to edit field(s): ${offending.join(', ')}` },
            { status: 403 }
          );
        }
      }
      const { data, error } = await supabase
        .from('properties')
        .update(u.fields)
        .eq('id', u.id)
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      results.push(data);
    }
    return NextResponse.json({ records: results });
  }

  if (body.action === 'delete') {
    if (!CAN_DELETE_ROLES.includes(profile.role)) {
      return NextResponse.json({ error: 'Not authorized to delete properties.' }, { status: 403 });
    }
    const { error } = await supabase.from('properties').delete().in('id', body.ids || []);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: `Unknown action "${body.action}"` }, { status: 400 });
}
