// Admin-only. Manages public.user_state_assignments / user_county_assignments /
// user_property_assignments (Module 04) — mirrors app/api/admin/users/route.js's shape exactly
// (requireAdmin() -> createAdminClient() -> typed JSON).
//
// GET returns everything the admin screen needs in one call: assignable users (non-admin —
// admin already sees everything, assigning it would be meaningless), the full state/county
// reference list (with a live property count per county, so the picker can surface
// counties-with-actual-data first without hiding any of the other ~3,100 seeded counties), a
// lightweight property list for the property-level picker, and every current assignment joined
// for display.

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { createAdminClient } from '@/lib/supabase/admin';

// The Supabase project's own PostgREST row cap (commonly 1000) applies server-side regardless of
// a larger .range() request — a single query for the ~3,101-row counties table silently
// truncates otherwise. Paginate in pages of 1000 until a short page confirms the end.
async function fetchAll(query) {
  const pageSize = 1000;
  let all = [];
  let from = 0;
  while (true) {
    const { data, error } = await query.range(from, from + pageSize - 1);
    if (error) return { data: null, error };
    all = all.concat(data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return { data: all, error: null };
}

export async function GET() {
  const { ok } = await requireAdmin();
  if (!ok) return NextResponse.json({ error: 'Admins only.' }, { status: 403 });

  const admin = createAdminClient();

  const [
    { data: users, error: usersErr },
    { data: states, error: statesErr },
    { data: counties, error: countiesErr },
    { data: properties, error: propertiesErr },
    { data: stateAssignments, error: stateAErr },
    { data: countyAssignments, error: countyAErr },
    { data: propertyAssignments, error: propertyAErr },
  ] = await Promise.all([
    admin.from('profiles')
      .select(`id, full_name, email, role,
        perm_create_property, perm_edit_acquisition_fields, perm_edit_disposition_fields, perm_edit_title_fields`)
      .neq('role', 'admin').order('full_name'),
    admin.from('states').select('id, code, name').order('name'),
    fetchAll(admin.from('counties').select('id, state_id, name').order('name')),
    admin.from('properties').select('id, address, county, state, county_id').order('address'),
    admin.from('user_state_assignments').select('user_id, state_id'),
    admin.from('user_county_assignments').select('user_id, county_id'),
    admin.from('user_property_assignments').select('user_id, property_id'),
  ]);

  const firstError = usersErr || statesErr || countiesErr || propertiesErr || stateAErr || countyAErr || propertyAErr;
  if (firstError) return NextResponse.json({ error: firstError.message }, { status: 500 });

  const stateById = Object.fromEntries(states.map((s) => [s.id, s]));
  const countyById = Object.fromEntries(counties.map((c) => [c.id, c]));
  const userById = Object.fromEntries(users.map((u) => [u.id, u]));

  const propertyCountByCounty = {};
  properties.forEach((p) => {
    if (p.county_id) propertyCountByCounty[p.county_id] = (propertyCountByCounty[p.county_id] || 0) + 1;
  });

  const countiesWithCounts = counties.map((c) => ({ ...c, propertyCount: propertyCountByCounty[c.id] || 0 }));

  return NextResponse.json({
    users,
    states,
    counties: countiesWithCounts,
    properties: properties.map((p) => ({ id: p.id, address: p.address, county: p.county, state: p.state })),
    assignments: {
      states: stateAssignments
        .filter((a) => userById[a.user_id] && stateById[a.state_id])
        .map((a) => ({ userId: a.user_id, stateId: a.state_id, label: stateById[a.state_id].name })),
      counties: countyAssignments
        .filter((a) => userById[a.user_id] && countyById[a.county_id])
        .map((a) => {
          const county = countyById[a.county_id];
          const state = stateById[county.state_id];
          return { userId: a.user_id, countyId: a.county_id, label: `${county.name}, ${state ? state.code : '?'}` };
        }),
      properties: propertyAssignments
        .map((a) => {
          const property = properties.find((p) => p.id === a.property_id);
          if (!userById[a.user_id] || !property) return null;
          return { userId: a.user_id, propertyId: a.property_id, label: property.address || '(no address)' };
        })
        .filter(Boolean),
    },
  });
}

const PERMISSION_COLUMNS = {
  create_property: 'perm_create_property',
  edit_acquisition_fields: 'perm_edit_acquisition_fields',
  edit_disposition_fields: 'perm_edit_disposition_fields',
  edit_title_fields: 'perm_edit_title_fields',
};

export async function POST(request) {
  const { ok } = await requireAdmin();
  if (!ok) return NextResponse.json({ error: 'Admins only.' }, { status: 403 });

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Individual permission overrides — separate from the state/county/property assignment actions
  // below (those decide *which properties* a user can reach; this decides *what they can do* with
  // them). Admin-only, same as everything else in this route — requireAdmin() above already
  // covers it, and profiles' own RLS (admin-only writes) is the independent backstop against a
  // non-admin somehow calling this directly.
  if (body.action === 'setPermissions') {
    const { userId: targetUserId, permissions } = body;
    if (!targetUserId || !permissions || typeof permissions !== 'object') {
      return NextResponse.json({ error: 'Missing or invalid userId/permissions.' }, { status: 400 });
    }
    const update = {};
    for (const [key, column] of Object.entries(PERMISSION_COLUMNS)) {
      if (typeof permissions[key] === 'boolean') update[column] = permissions[key];
    }
    if (!Object.keys(update).length) {
      return NextResponse.json({ error: 'No valid permission fields provided.' }, { status: 400 });
    }
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('profiles')
      .update(update)
      .eq('id', targetUserId)
      .select('id, perm_create_property, perm_edit_acquisition_fields, perm_edit_disposition_fields, perm_edit_title_fields')
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, user: data });
  }

  const { action, type, userId, targetId } = body;
  const TABLE_BY_TYPE = {
    state: { table: 'user_state_assignments', column: 'state_id' },
    county: { table: 'user_county_assignments', column: 'county_id' },
    property: { table: 'user_property_assignments', column: 'property_id' },
  };
  const spec = TABLE_BY_TYPE[type];
  if (!spec || !userId || !targetId) {
    return NextResponse.json({ error: 'Missing or invalid type/userId/targetId.' }, { status: 400 });
  }

  const admin = createAdminClient();

  if (action === 'add') {
    const { error } = await admin.from(spec.table).insert({ user_id: userId, [spec.column]: targetId });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  if (action === 'remove') {
    const { error } = await admin.from(spec.table).delete().eq('user_id', userId).eq(spec.column, targetId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: `Unknown action "${action}"` }, { status: 400 });
}
