-- Closes a real gap found while building the admin deactivation toggle: private.is_admin()
-- already checks is_active (from 20260907000000_profiles_auth.sql), but
-- private.can_access_property() — the function every non-admin role's RLS access is built on
-- (20260910000400_properties_rls.sql) — never did. A deactivated acquisition/disposition/title/
-- partner user whose Supabase session token hadn't yet expired could still satisfy their own
-- assignment-table rows and read/write via a direct PostgREST call, even though the app itself
-- (middleware + requireRole()) already correctly blocks them everywhere in the UI.
--
-- This directly matters for the brief's own acceptance criterion: "A deactivated user cannot
-- sign in and cannot use a session token issued before deactivation." The app-level checks always
-- satisfied "cannot sign in"; this closes the "cannot use a session token" half for the
-- direct-API path, matching how is_admin() already behaved.

create or replace function private.can_access_property(pid uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select
    exists (select 1 from public.profiles where id = auth.uid() and is_active)
    and (
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
    )
$$;
