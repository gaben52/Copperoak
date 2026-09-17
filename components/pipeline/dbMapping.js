// Bridges the app's existing camelCase row shape (established by the old recordToRow() in
// airtable.js, and baked into every component that reads a row — RowsTable, DetailModal,
// WonDashboard, helpers.js) to the Postgres column names in public.properties. Keeping the
// camelCase shape identical on this side of the boundary is what made swapping the data source
// a service-layer change instead of a rewrite of every component that touches a row.

export const DB_FIELD_MAP = {
  location: 'location', state: 'state', county: 'county', address: 'address', city: 'city', zip: 'zip',
  saleDate: 'sale_date', clearTitle: 'clear_title', mortgageBalance: 'mortgage_balance', openBid: 'open_bid',
  arv: 'arv', arv2: 'arv_2nd', maxBid: 'max_bid', renoCost: 'reno_cost', winningBid: 'winning_bid',
  outcome: 'auction_outcome', propertyStatus: 'property_status', expectedRefund: 'expected_refund_amount',
  paymentMethod: 'payment_method', occupancy: 'occupancy',
  trusteeName: 'trustee_name', trusteePhone: 'trustee_phone', trusteeEmail: 'trustee_email',
  notes: 'notes', driveNotes: 'drive_report_notes', status: 'status',
  photos: 'photos', titleReports: 'title_report',
};

// Postgres row -> the app's row shape (mirrors the old recordToRow()'s output exactly).
export function dbRowToRow(r) {
  return {
    id: r.id,
    location: r.location || '',
    state: r.state || '',
    county: r.county || '',
    address: r.address || '',
    city: r.city || '',
    zip: r.zip || '',
    saleDate: r.sale_date || '',
    clearTitle: r.clear_title || 'Unknown',
    mortgageBalance: r.mortgage_balance ?? '',
    openBid: r.open_bid ?? '',
    arv: r.arv ?? '',
    arv2: r.arv_2nd ?? '',
    maxBid: r.max_bid ?? '',
    renoCost: r.reno_cost ?? '',
    winningBid: r.winning_bid ?? '',
    outcome: r.auction_outcome || 'Unknown',
    propertyStatus: r.property_status || '',
    expectedRefund: r.expected_refund_amount ?? '',
    paymentMethod: r.payment_method || '',
    occupancy: r.occupancy || '',
    trusteeName: r.trustee_name || '',
    trusteePhone: r.trustee_phone || '',
    trusteeEmail: r.trustee_email || '',
    notes: r.notes || '',
    driveNotes: r.drive_report_notes || '',
    status: r.status || 'New',
    photos: r.photos || [],
    titleReports: r.title_report || [],
  };
}

// camelCase change-set -> Postgres column names, for PATCH-style updates. '' becomes null
// (Postgres CHECK constraints reject '' for the constrained columns; null passes them).
export function rowChangesToDb(changes) {
  const dbFields = {};
  Object.keys(changes).forEach((key) => {
    const col = DB_FIELD_MAP[key];
    if (!col) return;
    const v = changes[key];
    dbFields[col] = v === '' ? null : v;
  });
  return dbFields;
}

// Same shape/behavior as the old rowToCreateFields() in airtable.js, targeting DB columns
// instead of Airtable field names — used by CSV/Excel import and Bulk Paste.
export function rowToDbFields(overrides) {
  const f = {};
  Object.keys(DB_FIELD_MAP).forEach((key) => {
    const v = overrides[key];
    if (v !== undefined && v !== '') f[DB_FIELD_MAP[key]] = v;
  });
  return f;
}
