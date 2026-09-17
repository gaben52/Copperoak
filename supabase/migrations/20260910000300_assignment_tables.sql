-- Module 04, Stage 4 — per-user state/county/property assignment tables.
--
-- Nothing consults these yet (Stage 5's RLS and Stage 6's app-level scoping are what read them) —
-- this migration has zero visible effect on the running app. It exists so the founder can start
-- populating real assignments (via the new /admin/assignments screen) ahead of enforcement being
-- turned on, per the brief's own "reconcile before cutover" migration philosophy.
--
-- Composite primary keys double as the uniqueness constraint (can't assign the same user to the
-- same state/county/property twice) and are indexed on user_id per the brief's own guidance
-- ("policy subqueries run on every row read").

create table public.user_state_assignments (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  state_id    uuid not null references public.states(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  primary key (user_id, state_id)
);
create index user_state_assignments_user_idx on public.user_state_assignments (user_id);

create table public.user_county_assignments (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  county_id   uuid not null references public.counties(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  primary key (user_id, county_id)
);
create index user_county_assignments_user_idx on public.user_county_assignments (user_id);

create table public.user_property_assignments (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  primary key (user_id, property_id)
);
create index user_property_assignments_user_idx on public.user_property_assignments (user_id);

alter table public.user_state_assignments enable row level security;
alter table public.user_state_assignments force row level security;
alter table public.user_county_assignments enable row level security;
alter table public.user_county_assignments force row level security;
alter table public.user_property_assignments enable row level security;
alter table public.user_property_assignments force row level security;

-- Admin-only, both ways: a user can see which counties/states/properties THEY are assigned to
-- (needed for the "you're assigned to X" banner text), but only admin can write. No policy at all
-- for insert/update/delete — those happen only via the service-role client
-- (app/api/admin/assignments), matching every other admin-managed table in this app.
create policy user_state_assignments_select on public.user_state_assignments
  for select using (private.is_admin() or user_id = auth.uid());
create policy user_county_assignments_select on public.user_county_assignments
  for select using (private.is_admin() or user_id = auth.uid());
create policy user_property_assignments_select on public.user_property_assignments
  for select using (private.is_admin() or user_id = auth.uid());
