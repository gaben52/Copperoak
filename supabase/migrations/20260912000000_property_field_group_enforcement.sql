-- Closes a real gap found during Disposition/Title verification: properties_update's RLS policy
-- (20260910000400_properties_rls.sql) checks role + assignment scope, but not WHICH COLUMNS are
-- being written — that check only existed in app/api/properties/route.js (lib/permissions/
-- fieldGroups.js's allowedFieldsForRole()). Proven live: a disposition user's own JWT, called
-- directly against PostgREST (bypassing the Next.js app entirely), successfully overwrote `arv`
-- (an acquisition-only field) on a property it's genuinely assigned to. This is exactly the class
-- of gap the brief calls out explicitly:
--   "Hiding a button in the interface is not a permission. Every restriction has to survive a
--    direct API call with a valid token." (Brief Document.docx, Section 5.1)
--   "Column level restrictions... are handled with a restricted view or a column grant, not by
--    trimming the field in the frontend." (Section 8.3)
--
-- A BEFORE UPDATE trigger is used rather than column-level GRANT/REVOKE: Supabase maps every
-- signed-in user onto the single shared `authenticated` Postgres role regardless of their
-- application-level profiles.role, so native per-column Postgres grants can't distinguish
-- acquisition from disposition from title the way this app's roles need. A trigger reading
-- private.auth_role() can.
--
-- ⚠ This mirrors lib/permissions/fieldGroups.js's field lists in SQL. The two are NOT
-- automatically kept in sync — changing one without the other reopens exactly this gap or, in the
-- other direction, blocks a field the app layer meant to allow. Update both together.

create or replace function private.enforce_property_field_groups()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  role_ public.user_role;
  allowed text[];
  -- Primary key, timestamps, the trigger-maintained county_id, and the three GENERATED ALWAYS AS
  -- columns (auction_month/variance/profit) are never user-supplied — diffing them would false-
  -- positive any time an allowed field's change causes a generated column to recompute.
  ignored text[] := array['id','created_at','updated_at','county_id','airtable_record_id',
    'auction_month','variance','profit'];
  common_status text[] := array['address','city','state','county','zip','beds','baths','sq_ft',
    'year_built','photos','notes','status','property_status'];
  k text;
  old_j jsonb;
  new_j jsonb;
begin
  -- The app's OWN writes (already validated in JS against the exact same field groups) go
  -- through the service-role client — auth.uid() is null in that context, which would otherwise
  -- fall through to the most restrictive branch below and break every legitimate update the app
  -- already makes (including the document-upload route's photos/title_report writes). A real
  -- admin's own session is also fully unrestricted, matching every other admin bypass in this
  -- schema (private.is_admin()).
  if auth.role() = 'service_role' or private.is_admin() then
    return new;
  end if;

  role_ := private.auth_role();

  if role_ = 'acquisition' then
    allowed := common_status || array['location','sale_date','open_bid','max_bid','arv','arv_2nd',
      'reno_cost','auction_outcome','trustee_name','trustee_phone','trustee_email',
      'payment_method','drive_report_notes'];
  elsif role_ = 'disposition' then
    allowed := common_status || array['reno_spent','contract_price','sale_price','holding_costs',
      'acquired_date','listed_date','closed_date','expected_closing_date','buyer_side',
      'expected_refund_amount','occupancy'];
  elsif role_ = 'title' then
    allowed := common_status || array['clear_title','title_report','deed_recorded',
      'mortgage_balance','winning_bid'];
  else
    -- Partner (or any unrecognized/null role) never reaches this trigger in practice —
    -- properties_update's own USING/WITH CHECK clause already excludes every role but
    -- admin/acquisition/disposition/title. Kept as a hard-restrictive fallback regardless.
    allowed := common_status;
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

drop trigger if exists properties_enforce_field_groups on public.properties;
create trigger properties_enforce_field_groups
  before update on public.properties
  for each row
  execute function private.enforce_property_field_groups();
