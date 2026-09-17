// Module 04 application-level scoping — the JS-side mirror of private.can_access_property() in
// 20260910000400_properties_rls.sql. Both exist deliberately (defense-in-depth: a bug in one
// doesn't compromise the other) — this one is what /api/properties actually filters by, since
// every route uses the service-role client (which bypasses RLS entirely). The SQL policy is the
// independent second lock that holds even against a direct PostgREST call.
//
// Admin bypasses this whole module — every call site should check profile.role === 'admin' first
// and skip straight to "return everything" rather than routing admin through here.

import { createAdminClient } from '@/lib/supabase/admin';

// Returns the set of county_ids a non-admin user can see property rows in — the union of direct
// county assignments and county assignments implied by a state-level grant. Property-level
// assignments (a single property, independent of its county) are returned separately since they
// don't fit a "county_id in (...)" filter — a caller needs both.
export async function getAccessibleScope(userId) {
  const supabase = createAdminClient();

  const [{ data: countyGrants }, { data: stateGrants }, { data: propertyGrants }] = await Promise.all([
    supabase.from('user_county_assignments').select('county_id').eq('user_id', userId),
    supabase.from('user_state_assignments').select('state_id').eq('user_id', userId),
    supabase.from('user_property_assignments').select('property_id').eq('user_id', userId),
  ]);

  const countyIds = new Set((countyGrants || []).map((r) => r.county_id));

  const stateIds = (stateGrants || []).map((r) => r.state_id);
  if (stateIds.length) {
    const { data: countiesInStates } = await supabase
      .from('counties')
      .select('id')
      .in('state_id', stateIds);
    (countiesInStates || []).forEach((c) => countyIds.add(c.id));
  }

  const propertyIds = (propertyGrants || []).map((r) => r.property_id);

  return { countyIds: Array.from(countyIds), propertyIds };
}

// Applies scope to a Supabase query builder for public.properties. Admin should never reach this
// (callers check role first) — an empty scope correctly yields zero rows rather than every row,
// since an unassigned user must see nothing, not everything.
export function applyPropertyScope(query, scope) {
  const { countyIds, propertyIds } = scope;
  if (!countyIds.length && !propertyIds.length) {
    return query.eq('id', '00000000-0000-0000-0000-000000000000'); // deliberately unsatisfiable
  }
  const clauses = [];
  if (countyIds.length) clauses.push(`county_id.in.(${countyIds.join(',')})`);
  if (propertyIds.length) clauses.push(`id.in.(${propertyIds.join(',')})`);
  return query.or(clauses.join(','));
}

// Single-row check for the update/delete/documents paths, where fetching the whole scoped list
// just to check membership would be wasteful — checks the three assignment tables directly for
// one property id. Short-circuits true for admin itself (rather than relying on every call site
// to remember to check role first) since admin has no assignment rows of its own to match against.
export async function canAccessProperty(userId, propertyId, role) {
  if (role === 'admin') return true;

  const supabase = createAdminClient();

  const { data: direct } = await supabase
    .from('user_property_assignments')
    .select('user_id')
    .eq('user_id', userId)
    .eq('property_id', propertyId)
    .maybeSingle();
  if (direct) return true;

  const { data: property } = await supabase
    .from('properties')
    .select('county_id')
    .eq('id', propertyId)
    .maybeSingle();
  if (!property || !property.county_id) return false;

  const { data: countyGrant } = await supabase
    .from('user_county_assignments')
    .select('user_id')
    .eq('user_id', userId)
    .eq('county_id', property.county_id)
    .maybeSingle();
  if (countyGrant) return true;

  const { data: county } = await supabase
    .from('counties')
    .select('state_id')
    .eq('id', property.county_id)
    .maybeSingle();
  if (!county) return false;

  const { data: stateGrant } = await supabase
    .from('user_state_assignments')
    .select('user_id')
    .eq('user_id', userId)
    .eq('state_id', county.state_id)
    .maybeSingle();
  return !!stateGrant;
}
