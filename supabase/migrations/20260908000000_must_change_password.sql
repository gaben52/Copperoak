-- Module 03 follow-up: forced password change for invited users.
--
-- Adds profiles.must_change_password and updates handle_new_user() (from
-- 20260907000000_profiles_auth.sql) to read it from invite metadata, defaulting to false so
-- existing accounts (and any future non-invite creation path) aren't unexpectedly forced into
-- the change-password flow.
--
-- Existing rows (the bootstrap admin account) get the column's default (false) automatically —
-- nothing else needs to change for them.

alter table public.profiles
  add column if not exists must_change_password boolean not null default false;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, mobile, role, invited_by, must_change_password)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'mobile',
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'partner'),
    (new.raw_user_meta_data->>'invited_by')::uuid,
    coalesce((new.raw_user_meta_data->>'must_change_password')::boolean, false)
  );
  return new;
end;
$$;

-- Note: profiles_update policy (admin-only) is unchanged on purpose — a user completing the
-- forced password change does NOT get a general self-update RLS grant. Flipping their own
-- must_change_password to false happens through /api/auth/complete-password-change, a server
-- route that verifies the caller's own session and writes with the service-role client, scoped
-- to exactly that one field on exactly that caller's row. See that route for the full reasoning.
