// Module 04 field-level permissions for public.properties, per the brief's permission matrix
// (Section 7): acquisition/disposition/title each edit only their own field group by default;
// admin is unrestricted; partner edits nothing by default (its one carve-out, document upload, is
// handled separately by app/api/properties/[id]/documents/route.js, not this module).
//
// Layered on top of role: each user also carries four individual permission flags
// (profiles.perm_create_property / perm_edit_acquisition_fields / perm_edit_disposition_fields /
// perm_edit_title_fields — see 20260913000000_individual_permissions.sql) that an admin can grant
// or remove per user, independent of role. Role decides the *default* value of those flags at
// invite time (ROLE_DEFAULT_PERMISSIONS below); after that, the stored flags are the actual source
// of truth, not the role. This mirrors exactly what the database's own
// private.enforce_property_field_groups() trigger and the properties_insert/properties_update RLS
// policies do — changing the logic here without changing there (or vice versa) reopens a gap.
//
// This exact column-to-group mapping is inferred from dbMapping.js's existing field naming, NOT
// specified column-by-column in the brief ("the acquisition, title, and disposition fields
// confirmed in the audit" — Section 6.1) — flagged for the same client sign-off as the matrix
// itself. Changing any single cell is a one-line edit here (and in the SQL trigger), not a
// re-architecture.

const COMMON_FIELDS = ['address', 'city', 'state', 'county', 'zip', 'beds', 'baths', 'sq_ft', 'year_built', 'photos', 'notes'];
const STATUS_FIELDS = ['status', 'property_status']; // the matrix's "Update property status" covers
  // both — Pipeline's pre-bid `status` and Property Operations' post-acquisition `property_status`.
  // Not individually overridable — every active non-partner role gets this regardless of the four
  // permission flags, exactly as before this feature existed.

const ACQUISITION_FIELDS = ['location', 'sale_date', 'open_bid', 'max_bid', 'arv', 'arv_2nd', 'reno_cost',
  'auction_outcome', 'trustee_name', 'trustee_phone', 'trustee_email', 'payment_method', 'drive_report_notes'];
const DISPOSITION_FIELDS = ['reno_spent', 'contract_price', 'sale_price', 'holding_costs', 'acquired_date',
  'listed_date', 'closed_date', 'expected_closing_date', 'buyer_side', 'expected_refund_amount', 'occupancy'];
// mortgage_balance stays with Title (not treated as a "purchase/rehab figure" below) — it's a lien/
// payoff fact Title needs to assess clear-title status, distinct from OUR bidding/rehab economics.
const TITLE_FIELDS = ['clear_title', 'title_report', 'deed_recorded', 'mortgage_balance', 'winning_bid'];

// Role -> default individual-permission values, applied when a user is invited (and used to
// backfill everyone who existed before this feature — see the migration). After creation, the
// stored profiles columns are authoritative; changing a user's role later does NOT retroactively
// change their already-granted individual permissions.
export const ROLE_DEFAULT_PERMISSIONS = {
  admin: { create_property: true, edit_acquisition_fields: true, edit_disposition_fields: true, edit_title_fields: true },
  acquisition: { create_property: true, edit_acquisition_fields: true, edit_disposition_fields: false, edit_title_fields: false },
  disposition: { create_property: false, edit_acquisition_fields: false, edit_disposition_fields: true, edit_title_fields: false },
  title: { create_property: false, edit_acquisition_fields: false, edit_disposition_fields: false, edit_title_fields: true },
  partner: { create_property: false, edit_acquisition_fields: false, edit_disposition_fields: false, edit_title_fields: false },
};
export function defaultPermissionsForRole(role) {
  return ROLE_DEFAULT_PERMISSIONS[role] || ROLE_DEFAULT_PERMISSIONS.partner;
}

// `profile` needs at minimum { role, perm_edit_acquisition_fields, perm_edit_disposition_fields,
// perm_edit_title_fields }. null = unrestricted (admin only).
//
// Common+status fields are still tied to role, not to the individual flags (acquisition/
// disposition/title always get them; partner never does, even if granted a field-group
// permission) — an individual permission grants exactly the field group named, nothing wider. This
// is what lets a Partner be granted `edit_acquisition_fields` without also silently handing them
// address/notes/status editing they were never given.
export function allowedFieldsForProfile(profile) {
  if (!profile) return new Set();
  if (profile.role === 'admin') return null;
  const set = new Set();
  if (profile.role === 'acquisition' || profile.role === 'disposition' || profile.role === 'title') {
    COMMON_FIELDS.forEach((f) => set.add(f));
    STATUS_FIELDS.forEach((f) => set.add(f));
  }
  if (profile.perm_edit_acquisition_fields) ACQUISITION_FIELDS.forEach((f) => set.add(f));
  if (profile.perm_edit_disposition_fields) DISPOSITION_FIELDS.forEach((f) => set.add(f));
  if (profile.perm_edit_title_fields) TITLE_FIELDS.forEach((f) => set.add(f));
  return set;
}

// Whether `profile` may create a property record — admin always can; anyone else needs the
// individual flag (defaults to true for acquisition, false otherwise — see
// ROLE_DEFAULT_PERMISSIONS — but the stored flag, not the role, is what's actually checked).
export function canCreateProperty(profile) {
  return !!profile && (profile.role === 'admin' || !!profile.perm_create_property);
}

// The matrix's one explicit read-side redaction: "View purchase and rehab figures: Title = N."
// Deliberately narrower than TITLE_FIELDS' own edit list — mortgage_balance/winning_bid stay
// visible to Title (they're lien/payoff facts Title edits directly), this is specifically OUR
// bidding and renovation economics, which Title has no reason to see. Unrelated to the individual
// permissions feature — this is a read-side rule keyed on role, not on the edit_title_fields flag.
export const FINANCIAL_FIELDS = ['open_bid', 'max_bid', 'arv', 'arv_2nd', 'reno_cost', 'reno_spent',
  'contract_price', 'sale_price', 'holding_costs', 'expected_refund_amount', 'variance', 'profit'];

export function redactFinancialFields(row, role) {
  if (role !== 'title') return row;
  const copy = { ...row };
  FINANCIAL_FIELDS.forEach((f) => { delete copy[f]; });
  return copy;
}

// Roles allowed to delete, per the matrix exactly — not part of the individual-permissions
// feature (only create + the three edit groups were asked to be individually overridable).
export const CAN_DELETE_ROLES = ['admin'];
