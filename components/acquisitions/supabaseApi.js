// Replaces direct-Airtable calls for Property Operations. Reads/writes go through the SAME
// /api/properties route Auction Pipeline uses — same public.properties table, same service-role
// backing (see lib/supabase/admin.js) — this file just filters to Auction Outcome = 'We Won' and
// maps to/from the "deal" shape via dbMapping.js. No new route needed: the shared route already
// takes arbitrary DB-column-keyed field objects, so it doesn't need to know "deal" exists.

import { dbRowToDeal, dealToDbFields } from './dbMapping';

async function callApi(path, options) {
  const res = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request to ${path} failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export async function loadDeals() {
  const { records } = await callApi('/api/properties', { method: 'GET' });
  return (records || [])
    .filter((r) => r.auction_outcome === 'We Won')
    .map(dbRowToDeal);
}

export async function updateDeal(id, deal, opts) {
  await callApi('/api/properties', {
    method: 'POST',
    body: JSON.stringify({ action: 'update', updates: [{ id, fields: dealToDbFields(deal, opts) }] }),
  });
}

export async function createDeal(deal) {
  const { records } = await callApi('/api/properties', {
    method: 'POST',
    body: JSON.stringify({ action: 'create', records: [dealToDbFields(deal, { isNew: true })] }),
  });
  return dbRowToDeal(records[0]);
}

// Bulk create for the Import modal — one insert call for the whole batch (the shared route
// already accepts an array), rather than one round trip per row.
export async function createDeals(deals) {
  const { records } = await callApi('/api/properties', {
    method: 'POST',
    body: JSON.stringify({ action: 'create', records: deals.map((d) => dealToDbFields(d, { isNew: true })) }),
  });
  return (records || []).map(dbRowToDeal);
}

export async function deleteDeal(id) {
  await callApi('/api/properties', {
    method: 'POST',
    body: JSON.stringify({ action: 'delete', ids: [id] }),
  });
}
