-- Links public.partner_access (created in 20260903000000, 0 rows, previously keyed by a
-- manually-typed "access code" for the old Airtable-backed Partner Portal gate) to a real
-- Supabase Auth account instead. The Partner Portal now authenticates through /login like every
-- other role (Module 03) — a partner's scope (which counties they can see) is still defined by
-- their partner_access row, just looked up by their authenticated profile instead of a code they
-- had to be told out-of-band.
--
-- Additive only: no existing column is dropped, no row is touched (the table has 0 rows both
-- before and after this migration — it was never wired to the live Airtable-backed flow either).
-- access_code is kept (harmless, unused going forward) but no longer required, since new rows are
-- created by an admin linking a profile, not by inventing a code for someone to type in.

alter table public.partner_access
  add column if not exists profile_id uuid references public.profiles(id) on delete cascade;

alter table public.partner_access
  alter column access_code drop not null;

create unique index if not exists partner_access_profile_id_idx
  on public.partner_access (profile_id)
  where profile_id is not null;

-- Still zero SELECT/INSERT/UPDATE policies here on purpose (RLS enabled + forced, same as
-- properties/monthly_funding) — the new /api/partner-portal route reads this table with the
-- service-role client, exactly like the other data routes already do. A partner's own browser
-- session still has no direct access to this table.
