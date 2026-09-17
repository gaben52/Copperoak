// Returns the caller's own state/county/property assignments, by name — not derived from which
// properties happen to be visible right now (a county assigned but currently empty should still
// read as "you have an assignment," not "you have none"). Any active authenticated role can call
// this for itself; there's nothing here a user couldn't already see about their own account.
//
// Originally built for Partner Portal's "you're assigned to X" banner, now also the generic
// source for that same banner on Pipeline once acquisition/disposition/title are scoped too —
// see AuctionPipeline.jsx's emptyMessage logic.

import { NextResponse } from 'next/server';
import { getSessionProfile } from '@/lib/auth/session';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const { user, profile } = await getSessionProfile();
  if (!user || !profile || !profile.is_active) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 403 });
  }

  // Individual permission flags — used by Property Operations to decide which controls to show
  // (e.g. "+ Property", which fields are editable). This is a self-lookup of the caller's own
  // already-granted permissions, not a way to set them — that's admin-only, see
  // app/api/admin/assignments/route.js's setPermissions action.
  const permissions = {
    perm_create_property: !!profile.perm_create_property,
    perm_edit_acquisition_fields: !!profile.perm_edit_acquisition_fields,
    perm_edit_disposition_fields: !!profile.perm_edit_disposition_fields,
    perm_edit_title_fields: !!profile.perm_edit_title_fields,
  };

  if (profile.role === 'admin') {
    return NextResponse.json({ fullName: profile.full_name || '', role: profile.role, unrestricted: true, states: [], counties: [], properties: [], ...permissions });
  }

  const supabase = createAdminClient();
  const [{ data: stateAssignments }, { data: countyAssignments }, { data: propertyAssignments }] = await Promise.all([
    supabase.from('user_state_assignments').select('states(name)').eq('user_id', profile.id),
    supabase.from('user_county_assignments').select('counties(name)').eq('user_id', profile.id),
    supabase.from('user_property_assignments').select('properties(address)').eq('user_id', profile.id),
  ]);

  return NextResponse.json({
    fullName: profile.full_name || '',
    role: profile.role,
    unrestricted: false,
    states: (stateAssignments || []).map((a) => a.states?.name).filter(Boolean),
    counties: (countyAssignments || []).map((a) => a.counties?.name).filter(Boolean),
    properties: (propertyAssignments || []).map((a) => a.properties?.address).filter(Boolean),
    ...permissions,
  });
}
