-- Module 04, Stage 2 — add properties.county_id, additive and silent.
--
-- Every existing call site across both apps (RowsTable.jsx's CountySelect, CSV import/export,
-- printing, county-tab grouping, filters) keeps reading/writing the existing free-text state/
-- county columns completely untouched. county_id is a derived side effect nobody reads yet
-- (Stage 5's RLS and Stage 6's app-level scoping are what consume it) — this migration has zero
-- visible effect on the running app.
--
-- The trigger tolerates anything it can't match (typo, blank, "Unknown", a state not in the
-- reference set): county_id simply stays null. A write must never fail because of a location
-- mismatch, and admin visibility never depends on county_id (admin bypasses assignment checks
-- entirely in every later stage).

alter table public.properties add column county_id uuid references public.counties(id);
create index properties_county_id_idx on public.properties (county_id);

create or replace function public.properties_sync_county_id()
returns trigger
language plpgsql
as $$
begin
  select c.id into new.county_id
  from public.counties c
  join public.states s on s.id = c.state_id
  where upper(trim(coalesce(new.state, ''))) = s.code
    and lower(trim(regexp_replace(coalesce(new.county, ''), '\s+(county|parish|borough)$', '', 'i')))
        = lower(trim(c.name))
  limit 1;
  return new;
end;
$$;

drop trigger if exists properties_sync_county_id on public.properties;
create trigger properties_sync_county_id
  before insert or update of state, county on public.properties
  for each row execute function public.properties_sync_county_id();
