// Server-side data layer for the Won-dashboard's monthly funding figures — same service-role
// pattern as /api/properties (see that file, and lib/supabase/admin.js, for why), including the
// same requireRole() check: the Won dashboard is a Pipeline-only feature.

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/auth/session';

const ALLOWED_ROLES = ['admin', 'acquisition'];

export async function GET() {
  const { ok } = await requireRole(ALLOWED_ROLES);
  if (!ok) return NextResponse.json({ error: 'Not authorized.' }, { status: 403 });

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('monthly_funding').select('*');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ records: data });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// Upserts on `month` (unique per the schema), so the caller doesn't need to know whether a row
// already exists for that month — one call either creates it or merges into it.
export async function POST(request) {
  const { ok } = await requireRole(ALLOWED_ROLES);
  if (!ok) return NextResponse.json({ error: 'Not authorized.' }, { status: 403 });

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (!body.month) return NextResponse.json({ error: 'Missing month' }, { status: 400 });

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('monthly_funding')
      .upsert({ month: body.month, ...body.fields }, { onConflict: 'month' })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ record: data });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
