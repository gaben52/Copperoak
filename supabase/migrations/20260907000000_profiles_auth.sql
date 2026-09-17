-- Module 03 — User Accounts & Secure Authentication: the profiles table, its populate-on-signup
-- trigger, and the role-checking helper functions that this migration's own policies (and
-- Module 04's, later) build on.
--
-- Per the developer brief Section 8.1: reading `role` directly from `profiles` inside a
-- `profiles` policy causes infinite recursion, so the helpers below are SECURITY DEFINER and
-- live in a `private` schema — not exposed through PostgREST, only callable from inside the
-- database (policies, triggers), per the brief's own guidance.
--
-- This does NOT include the states/counties/user_*_assignments tables or the properties RLS
-- policies — that's Module 04, gated on the permission matrix (brief Section 7) being signed
-- off. This migration only creates individual accounts with a role field; it doesn't yet
-- enforce anything with that role beyond profiles' own access.

create schema if not exists private;

create type public.user_role as enum (
  'admin', 'acquisition', 'disposition', 'title', 'partner'
);

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  email       text not null unique,
  mobile      text,
  role        public.user_role not null default 'partner',
  is_active   boolean not null default true,
  invited_by  uuid references public.profiles(id),
  created_at  timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role);

-- ---- role-checking helpers ----
create or replace function private.auth_role()
returns public.user_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

-- Bundles the is_active check in here rather than at every call site — see brief Section 8.3:
-- "is_active false must fail the policy, not only hide the login button."
create or replace function private.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select role = 'admin' and is_active from public.profiles where id = auth.uid()),
    false
  )
$$;

-- ---- populate-on-signup trigger ----
-- Supabase's admin.inviteUserByEmail() inserts the auth.users row immediately at invite time
-- (the user "completing signup" later just sets a password on that same row) — so an AFTER
-- INSERT trigger on auth.users is what actually implements "populate profiles when an invited
-- user completes sign up." full_name/mobile/role/invited_by come from the metadata the invite
-- call sets (see the admin invite route this migration's follow-up work adds).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, mobile, role, invited_by)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'mobile',
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'partner'),
    (new.raw_user_meta_data->>'invited_by')::uuid
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---- RLS ----
alter table public.profiles enable row level security;
alter table public.profiles force row level security;

-- Admins see everyone; anyone can see their own row (so a deactivated user can still tell why
-- they're locked out, instead of a blank screen with no explanation).
create policy profiles_select on public.profiles
  for select using (private.is_admin() or id = auth.uid());

-- Admin-only writes for now. No self-service profile editing is asked for in the brief, and a
-- naive "users can update their own row" policy would let a user edit their own `role` unless
-- carefully restricted — left out rather than half-built.
create policy profiles_update on public.profiles
  for update using (private.is_admin()) with check (private.is_admin());

-- No insert/delete policy: rows are created only by the trigger above (SECURITY DEFINER, runs
-- outside RLS) and users are deactivated (is_active = false), never deleted.
