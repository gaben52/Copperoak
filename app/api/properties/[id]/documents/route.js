// Appends/removes an entry in a property's `photos` or `title_report` jsonb array, after the
// browser has already uploaded the file directly to Supabase Storage (see
// 20260910000500_property_documents_storage.sql — Storage RLS is what actually gates the upload
// itself; this route just records the resulting {id, path, filename} on the property row).
//
// The bucket is private (public: false — a public bucket would bypass Storage RLS entirely on
// read, defeating the whole point of scoping documents like property rows), so what's stored here
// is the object PATH, not a permanent URL. /api/properties's GET handler resolves fresh signed
// URLs (lib/supabase/signDocuments.js) right before responding, valid for an hour — the
// frontend's own {id, url, filename} shape never changes, only where `url` comes from.
//
// Kept separate from the general field-group update path in /api/properties/route.js on purpose:
// "upload a document" is the one narrow capability the matrix grants Partner ("Upload and view
// documents: A") even though Partner can edit nothing else — folding it into the generic
// field-group allowlist would mean either giving Partner a field-group entry (confusing, since it
// has none for anything else) or special-casing it there anyway. A dedicated route keeps that
// carve-out in one obvious place.
//
// requireRole() covers every role that can reach a page with this feature (admin/acquisition/
// disposition/title on Pipeline, partner on Partner Portal) — canAccessProperty() is the real
// scoping check, run unconditionally (no rollout switch): this is brand-new functionality nobody
// had before, so there's no prior behavior to regress.

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/auth/session';
import { canAccessProperty } from '@/lib/auth/scoping';
import { signEntries } from '@/lib/supabase/signDocuments';

const ALLOWED_ROLES = ['admin', 'acquisition', 'disposition', 'title', 'partner'];
const CAN_REMOVE_ROLES = ['admin', 'acquisition', 'disposition', 'title']; // not partner — matrix
  // grants Partner "upload and view," not "manage."

const COLUMN_BY_TYPE = { photo: 'photos', titleReport: 'title_report' };

export async function POST(request, { params }) {
  const { ok, profile } = await requireRole(ALLOWED_ROLES);
  if (!ok) return NextResponse.json({ error: 'Not authorized.' }, { status: 403 });

  const propertyId = params.id;
  const hasAccess = await canAccessProperty(profile.id, propertyId, profile.role);
  if (!hasAccess) return NextResponse.json({ error: 'Not authorized for this property.' }, { status: 403 });

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const column = COLUMN_BY_TYPE[body.type];
  if (!column || !body.id || !body.path) {
    return NextResponse.json({ error: 'Missing or invalid type/id/path.' }, { status: 400 });
  }
  // The path is otherwise just a client-supplied string — without pinning its leading segment to
  // this URL's own propertyId (which canAccessProperty() already vetted above), a caller could
  // record a path pointing into a DIFFERENT property's Storage folder here. Storage's own upload
  // policy would have refused to let them put a file there, but signing (lib/supabase/
  // signDocuments.js) runs on the service-role client and bypasses Storage RLS entirely by
  // design — so anything recorded in this array gets a valid signed URL minted for it on every
  // later fetch, regardless of whether this caller ever had upload rights to that path.
  if (!body.path.startsWith(`${propertyId}/`)) {
    return NextResponse.json({ error: 'That path does not belong to this property.' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: existing, error: readError } = await supabase
    .from('properties')
    .select(column)
    .eq('id', propertyId)
    .maybeSingle();
  if (readError) return NextResponse.json({ error: readError.message }, { status: 500 });
  if (!existing) return NextResponse.json({ error: 'Property not found.' }, { status: 404 });

  const updated = [...(existing[column] || []), { id: body.id, path: body.path, filename: body.filename || '' }];
  const { data, error } = await supabase
    .from('properties')
    .update({ [column]: updated })
    .eq('id', propertyId)
    .select(column)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ [column]: await signEntries(data[column]) });
}

export async function DELETE(request, { params }) {
  const { ok, profile } = await requireRole(ALLOWED_ROLES);
  if (!ok) return NextResponse.json({ error: 'Not authorized.' }, { status: 403 });
  if (!CAN_REMOVE_ROLES.includes(profile.role)) {
    return NextResponse.json({ error: 'Not authorized to remove documents.' }, { status: 403 });
  }

  const propertyId = params.id;
  const hasAccess = await canAccessProperty(profile.id, propertyId, profile.role);
  if (!hasAccess) return NextResponse.json({ error: 'Not authorized for this property.' }, { status: 403 });

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const column = COLUMN_BY_TYPE[body.type];
  if (!column || !body.documentId) {
    return NextResponse.json({ error: 'Missing or invalid type/documentId.' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: existing, error: readError } = await supabase
    .from('properties')
    .select(column)
    .eq('id', propertyId)
    .maybeSingle();
  if (readError) return NextResponse.json({ error: readError.message }, { status: 500 });
  if (!existing) return NextResponse.json({ error: 'Property not found.' }, { status: 404 });

  const removedEntry = (existing[column] || []).find((d) => d.id === body.documentId);
  const updated = (existing[column] || []).filter((d) => d.id !== body.documentId);
  if (removedEntry?.path) {
    await supabase.storage.from('property-documents').remove([removedEntry.path]);
  }
  const { data, error } = await supabase
    .from('properties')
    .update({ [column]: updated })
    .eq('id', propertyId)
    .select(column)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ [column]: await signEntries(data[column]) });
}
