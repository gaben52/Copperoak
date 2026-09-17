-- Module 04, Stage 3 — backfill county_id for the 113 existing properties.
--
-- Idempotent (safe to re-run): re-derives county_id from the current state/county text using the
-- exact same normalization as the sync trigger (20260910000100). Anything that doesn't match a
-- real county keeps county_id = null — it stays fully visible to admin (who never consults
-- county_id) and simply won't be visible to an assignment-scoped role until someone re-saves that
-- row's county through the existing dropdown, which the trigger then resolves automatically.
--
-- Run this AFTER 20260910000000 and 20260910000100. Nothing reads county_id yet at this stage —
-- zero visible effect on the running app either way.

update public.properties p
set county_id = c.id
from public.counties c
join public.states s on s.id = c.state_id
where upper(trim(coalesce(p.state, ''))) = s.code
  and lower(trim(regexp_replace(coalesce(p.county, ''), '\s+(county|parish|borough)$', '', 'i')))
      = lower(trim(c.name))
  and p.county_id is distinct from c.id;

-- Quick sanity readout for whoever runs this in the SQL Editor — not part of the schema, just a
-- SELECT to eyeball the result immediately after running the UPDATE above.
select
  count(*) filter (where county_id is not null) as matched,
  count(*) filter (where county_id is null and (state is not null or county is not null)) as unmatched,
  count(*) as total
from public.properties;
