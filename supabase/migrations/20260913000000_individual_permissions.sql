-- Individual per-user permission overrides, layered on top of the existing role system.
-- Role = default permissions. Individual permissions = per-user customization on top of that
-- default. Assignments (user_state/county/property_assignments) = which properties a user can
-- reach at all — unchanged by this migration, still the only thing that gates row-level access.
--
-- Four permissions only, matching exactly what was asked for: create a property record, and edit
-- each of the three field groups (acquisition/disposition/title). Nothing about "update status" or
-- "delete" is made individually overridable here — those stay exactly as the existing matrix
-- already has them (status: any active non-partner role; delete: admin only).
--
-- Stored as four plain booleans on profiles (same style as is_active), not a separate table or a
-- jsonb blob — the set is small, fixed, and named, so a real column is more legible in the
-- database and simpler to reference from both RLS and the app than parsing a blob everywhere.

alter table public.profiles
  add column perm_create_property boolean not null default false,
  add column perm_edit_acquisition_fields boolean not null default false,
  add column perm_edit_disposition_fields boolean not null default false,
  add column perm_edit_title_fields boolean not null default false;

-- Backfill every existing user from their current role, matching today's matrix exactly — this
-- migration changes nothing about what anyone can do until an admin explicitly customizes a user
-- afterward. (lib/permissions/fieldGroups.js's ROLE_DEFAULT_PERMISSIONS is the JS mirror of this
-- same mapping, used when inviting a new user.)
update public.profiles set
  perm_create_property = (role in ('admin', 'acquisition')),
  perm_edit_acquisition_fields = (role in ('admin', 'acquisition')),
  perm_edit_disposition_fields = (role in ('admin', 'disposition')),
  perm_edit_title_fields = (role in ('admin', 'title'));

-- ---- column-level enforcement (private.enforce_property_field_groups(), the BEFORE UPDATE
-- trigger from 20260912000000) now reads the caller's individual flags instead of switching
-- purely on role. common_status stays tied to role (acquisition/disposition/title, never
-- partner) — the four permissions above grant exactly the field group named, nothing more; they
-- do not imply common/status field access for a role that wouldn't otherwise have it (i.e. a
-- Partner granted perm_edit_acquisition_fields can write acquisition-group columns specifically,
-- not address/notes/status too). This is what makes "individual permissions actually work for a
-- Partner without silently widening what Partner can touch beyond what was explicitly granted.
create or replace function private.enforce_property_field_groups()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  prof record;
  allowed text[];
  ignored text[] := array['id','created_at','updated_at','county_id','airtable_record_id',
    'auction_month','variance','profit'];
  common_status text[] := array['address','city','state','county','zip','beds','baths','sq_ft',
    'year_built','photos','notes','status','property_status'];
  k text;
  old_j jsonb;
  new_j jsonb;
begin
  if auth.role() = 'service_role' or private.is_admin() then
    return new;
  end if;

  select role, perm_edit_acquisition_fields, perm_edit_disposition_fields, perm_edit_title_fields
    into prof
    from public.profiles where id = auth.uid();

  allowed := array[]::text[];
  if prof.role in ('acquisition', 'disposition', 'title') then
    allowed := allowed || common_status;
  end if;
  if coalesce(prof.perm_edit_acquisition_fields, false) then
    allowed := allowed || array['location','sale_date','open_bid','max_bid','arv','arv_2nd',
      'reno_cost','auction_outcome','trustee_name','trustee_phone','trustee_email',
      'payment_method','drive_report_notes'];
  end if;
  if coalesce(prof.perm_edit_disposition_fields, false) then
    allowed := allowed || array['reno_spent','contract_price','sale_price','holding_costs',
      'acquired_date','listed_date','closed_date','expected_closing_date','buyer_side',
      'expected_refund_amount','occupancy'];
  end if;
  if coalesce(prof.perm_edit_title_fields, false) then
    allowed := allowed || array['clear_title','title_report','deed_recorded',
      'mortgage_balance','winning_bid'];
  end if;

  old_j := to_jsonb(old);
  new_j := to_jsonb(new);

  for k in select jsonb_object_keys(new_j) loop
    if k = any(ignored) then
      continue;
    end if;
    if not (k = any(allowed)) and old_j -> k is distinct from new_j -> k then
      raise exception 'Not authorized to edit field "%"', k using errcode = '42501';
    end if;
  end loop;

  return new;
end;
$$;

-- ---- row-level policies ----
-- Insert: was role-only (admin/acquisition). Now admin, or anyone with perm_create_property —
-- lets an admin grant create rights to e.g. a specific Disposition user without changing their
-- role, while an inactive account with the flag still set stays blocked.
drop policy if exists properties_insert on public.properties;
create policy properties_insert on public.properties
  for insert
  with check (
    private.is_admin()
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and is_active and perm_create_property
    )
  );

-- Update: was role-only (admin/acquisition/disposition/title), which is exactly why a Partner
-- granted an individual edit permission would previously have it silently do nothing — RLS
-- rejected the row before the trigger's column check even ran. Now also admits anyone (Partner
-- included) with at least one of the three edit-field-group permissions; the trigger above still
-- narrowly enforces exactly which columns that grant covers.
drop policy if exists properties_update on public.properties;
create policy properties_update on public.properties
  for update
  using (
    private.can_access_property(id)
    and (
      private.auth_role() in ('admin', 'acquisition', 'disposition', 'title')
      or exists (
        select 1 from public.profiles
        where id = auth.uid() and is_active
        and (perm_edit_acquisition_fields or perm_edit_disposition_fields or perm_edit_title_fields)
      )
    )
  )
  with check (
    private.can_access_property(id)
    and (
      private.auth_role() in ('admin', 'acquisition', 'disposition', 'title')
      or exists (
        select 1 from public.profiles
        where id = auth.uid() and is_active
        and (perm_edit_acquisition_fields or perm_edit_disposition_fields or perm_edit_title_fields)
      )
    )
  );

-- No RLS changes needed for profiles itself: profiles_update (20260907000000) is already
-- admin-only ("using/with check (private.is_admin())") — a normal user already cannot modify
-- their own row, including these four new columns, via any direct call. That policy is what
-- actually satisfies "a user must not be able to grant themselves additional permissions."
