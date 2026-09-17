// Resolves stored {id, path, filename} document entries (photos / title_report jsonb columns) to
// {id, url, downloadUrl, filename} with fresh signed URLs, since the property-documents Storage
// bucket is private (see 20260910000500_property_documents_storage.sql — a public bucket would
// bypass Storage RLS on read entirely, defeating the point of scoping documents like property
// rows). Called from /api/properties's GET handler (which now serves every role, partner included,
// per Module 04's consolidation), only for rows the caller has already been confirmed to see — a
// signed URL is generated with the service-role client but only for a row this specific response
// is already returning to this specific caller.
//
// Two URLs per entry, not one: `url` opens/displays inline (a photo renders in the tab, a PDF
// shows in the browser's own viewer), `downloadUrl` sets Content-Disposition: attachment via
// Storage's own `download` option, so it saves to disk regardless of content type or browser —
// relying on Supabase's server-side header rather than the HTML `download` attribute, which
// browsers ignore for cross-origin links like these anyway.
//
// 1 hour expiry: long enough for a normal viewing session, short enough that a copied link isn't
// a standing, permanent bypass of the assignment scoping that gated it in the first place.

import { createAdminClient } from './admin';

const SIGN_TTL_SECONDS = 60 * 60;

export async function signEntries(entries) {
  if (!entries || !entries.length) return entries || [];
  const paths = entries.filter((e) => e && e.path).map((e) => e.path);
  if (!paths.length) return entries; // nothing with a real path to sign (e.g. legacy/malformed rows)

  const supabase = createAdminClient();
  const bucket = supabase.storage.from('property-documents');
  const [{ data: viewData, error: viewError }, { data: downloadData, error: downloadError }] = await Promise.all([
    bucket.createSignedUrls(paths, SIGN_TTL_SECONDS),
    bucket.createSignedUrls(paths, SIGN_TTL_SECONDS, { download: true }),
  ]);
  if (viewError) return entries.map((e) => ({ id: e.id, filename: e.filename, url: null, downloadUrl: null }));

  const urlByPath = Object.fromEntries((viewData || []).map((d) => [d.path, d.signedUrl]));
  const downloadUrlByPath = downloadError ? {} : Object.fromEntries((downloadData || []).map((d) => [d.path, d.signedUrl]));

  return entries.map((e) => ({
    id: e.id,
    filename: e.filename,
    url: e.path ? urlByPath[e.path] || null : null,
    downloadUrl: e.path ? downloadUrlByPath[e.path] || urlByPath[e.path] || null : null,
  }));
}

export async function signPropertyDocuments(row) {
  const [photos, titleReport] = await Promise.all([
    signEntries(row.photos),
    signEntries(row.title_report),
  ]);
  return { ...row, photos, title_report: titleReport };
}

export async function signPropertyDocumentsList(rows) {
  return Promise.all(rows.map(signPropertyDocuments));
}
