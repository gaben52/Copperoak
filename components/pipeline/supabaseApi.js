// Replaces direct-Airtable calls for the Auction Pipeline's full/staff mode. All actual database
// access happens server-side in /api/properties and /api/monthly-funding (service-role key,
// never sent to the browser) — this file just calls those routes and converts between the app's
// camelCase row shape and the API's payloads. See dbMapping.js for the field-name translation.
//
// Partner mode also goes through this file now (fetchPartnerRecords below) — /api/properties
// itself scopes a partner's results server-side to their real assignments (Module 04), the same
// route full/staff mode uses. There is no more Airtable proxy, access-code lookup, or dedicated
// partner-portal route — /api/my-assignments supplies just the "you're assigned to X" display text.

import { dbRowToRow, rowChangesToDb } from './dbMapping';

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

export async function fetchAllRecords() {
  const { records } = await callApi('/api/properties', { method: 'GET' });
  return (records || []).map(dbRowToRow);
}

// The caller's own role + individual permission flags — used by both modes to compute per-field
// editability in the UI (lib/permissions/fieldGroups.js's allowedFieldsForProfile()/
// canCreateProperty()). This is a self-lookup, same data /api/my-assignments already exposes.
export async function fetchMyProfile() {
  return callApi('/api/my-assignments', { method: 'GET' });
}

export async function fetchPartnerRecords() {
  const [{ records }, assignments] = await Promise.all([
    callApi('/api/properties', { method: 'GET' }),
    callApi('/api/my-assignments', { method: 'GET' }),
  ]);
  return {
    partnerName: assignments.fullName || '',
    counties: assignments.counties || [],
    records: (records || []).map(dbRowToRow),
  };
}

export async function fetchFundingRecords() {
  const { records } = await callApi('/api/monthly-funding', { method: 'GET' });
  const fundingByMonth = {};
  (records || []).forEach((r) => {
    fundingByMonth[r.month] = {
      id: r.id,
      auctionCom: r.auction_com_amount ?? '',
      cashierChecks: r.cashier_checks_amount ?? '',
    };
  });
  return fundingByMonth;
}

export async function createProperty(changes) {
  const { records } = await callApi('/api/properties', {
    method: 'POST',
    body: JSON.stringify({ action: 'create', records: [rowChangesToDb(changes)] }),
  });
  return dbRowToRow(records[0]);
}

// `dbFieldsList` is already DB-column-keyed (from rowToDbFields), used by CSV/Excel import and
// Bulk Paste, which build rows through dbMapping.js directly rather than a camelCase change-set.
export async function createProperties(dbFieldsList) {
  const { records } = await callApi('/api/properties', {
    method: 'POST',
    body: JSON.stringify({ action: 'create', records: dbFieldsList }),
  });
  return (records || []).map(dbRowToRow);
}

export async function updatePropertyDb(id, changes) {
  await callApi('/api/properties', {
    method: 'POST',
    body: JSON.stringify({ action: 'update', updates: [{ id, fields: rowChangesToDb(changes) }] }),
  });
}

export async function updatePropertiesBulk(ids, changes) {
  const dbFields = rowChangesToDb(changes);
  await callApi('/api/properties', {
    method: 'POST',
    body: JSON.stringify({ action: 'update', updates: ids.map((id) => ({ id, fields: dbFields })) }),
  });
}

export async function deleteProperties(ids) {
  await callApi('/api/properties', {
    method: 'POST',
    body: JSON.stringify({ action: 'delete', ids }),
  });
}

const FUNDING_FIELD_MAP = { auctionCom: 'auction_com_amount', cashierChecks: 'cashier_checks_amount' };

export async function upsertFunding(month, field, value) {
  const dbField = FUNDING_FIELD_MAP[field];
  await callApi('/api/monthly-funding', {
    method: 'POST',
    body: JSON.stringify({ month, fields: { [dbField]: value === '' ? null : value } }),
  });
}
