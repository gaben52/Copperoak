-- Module 04, Stage 5 — real RLS policies on public.properties.
--
-- Every current route (/api/properties, /api/partner-portal, /api/monthly-funding) uses the
-- service-role client (lib/supabase/admin.js), which bypasses RLS entirely — so shipping this has
-- ZERO effect on the running app. It closes a real, independent gap instead: Supabase exposes
-- every table via PostgREST regardless of what our own Next.js routes do, so a partner's own
-- session JWT + the public anon key could always attempt `GET {SUPABASE_URL}/rest/v1/properties`
-- directly. This is the one place that direct-API-call attack surface can be closed — verify with
-- a real curl call using a real user's JWT, not by clicking through the app.
--
-- can_access_property() reuses the existing private.is_admin() helper from
-- 20260907000000_profiles_auth.sql. It does NOT attempt field-group precision (which columns a
-- role can edit) or financial-column redaction — those are application-layer concerns (Stage 6,
-- lib/permissions/fieldGroups.js) since RLS predicates operate per-row, not per-column. This
-- policy only answers "can this role touch this row at all."

create or replace function private.can_access_property(pid uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select
    private.is_admin()
    or exists (
      select 1 from public.user_property_assignments a
      where a.user_id = auth.uid() and a.property_id = pid)
    or exists (
      select 1 from public.user_county_assignments a
      join public.properties p on p.id = pid
      where a.user_id = auth.uid() and a.county_id = p.county_id)
    or exists (
      select 1 from public.user_state_assignments a
      join public.counties c on c.state_id = a.state_id
      join public.properties p on p.id = pid
      where a.user_id = auth.uid() and c.id = p.county_id)
$$;

-- RLS was already enabled+forced on properties (20260903000000, zero policies = fail-closed).
-- These are the first real policies it gets.
create policy properties_select on public.properties
  for select using (private.can_access_property(id));

create policy properties_update on public.properties
  for update
  using (private.can_access_property(id) and private.auth_role() in ('admin', 'acquisition', 'disposition', 'title'))
  with check (private.can_access_property(id) and private.auth_role() in ('admin', 'acquisition', 'disposition', 'title'));

-- Matches the matrix exactly: only admin/acquisition may create, only admin may delete. This also
-- closes a real pre-existing gap in app/api/properties/route.js, where disposition and title
-- could previously call the delete action (fixed at the app layer too in Stage 6).
create policy properties_insert on public.properties
  for insert
  with check (private.auth_role() in ('admin', 'acquisition'));

create policy properties_delete on public.properties
  for delete using (private.is_admin());
