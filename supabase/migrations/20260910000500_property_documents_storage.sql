-- Module 04, Stage 7 — real photo/title-report upload via Supabase Storage, replacing the
-- "not available yet" stub. Path convention: {property_id}/{photos|title-reports}/{filename} —
-- storage.foldername(name) splits that into ['<property_id>', 'photos'|'title-reports'], so
-- (storage.foldername(name))[1] recovers the property_id to check against
-- private.can_access_property(), the SAME function Stage 5's properties RLS uses. One scoping
-- rule, reused, per the brief's own instruction ("Storage buckets have their own policies.
-- Property documents need the same scoping as property rows.").
--
-- The browser uploads DIRECTLY to Storage using the signed-in user's own session (anon key + JWT)
-- — not a server relay holding a shared credential (that was the old /api/upload-photo's design
-- flaw: unauthenticated, and it relayed a caller-supplied Airtable token). RLS below is what
-- actually enforces scoping at upload time, not app code.
--
-- Delete is intentionally NOT granted to 'partner' — the matrix's exact wording for that role is
-- "Upload and view documents," not "manage." Every other assignment-scoped role (already able to
-- edit within its own domain) can also remove a document within its own scope; admin always can.

insert into storage.buckets (id, name, public)
values ('property-documents', 'property-documents', false)
on conflict (id) do nothing;

create policy property_documents_select on storage.objects
  for select using (
    bucket_id = 'property-documents'
    and private.can_access_property((storage.foldername(name))[1]::uuid)
  );

create policy property_documents_insert on storage.objects
  for insert with check (
    bucket_id = 'property-documents'
    and private.can_access_property((storage.foldername(name))[1]::uuid)
  );

create policy property_documents_delete on storage.objects
  for delete using (
    bucket_id = 'property-documents'
    and private.can_access_property((storage.foldername(name))[1]::uuid)
    and private.auth_role() in ('admin', 'acquisition', 'disposition', 'title')
  );
