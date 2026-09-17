// Ported verbatim from the Foreclosure Pre-Bid Command Center <script> — options/config section.

export { US_STATES, COUNTIES_BY_STATE } from '@/lib/counties';

// Must match the `location` CHECK constraint on public.properties exactly — 'Other' used to be
// offered here but isn't a valid value; picking it made the save hard-fail against the database.
export const LOCATION_OPTIONS = ['Courthouse', 'Auction.com', 'Unrated', 'Low', 'Medium', 'High', 'DNB'];
export const CLEAR_TITLE_OPTIONS = ['Unknown', 'Request Title', 'Clear (1st Lien)', 'Clear (2nd Lien)', 'Not Found', 'Do NOT Bid'];
export const OUTCOME_OPTIONS = ['Unknown', 'Cancelled', '3rd Party', 'We Won', 'Reverted Back'];
export const PROPERTY_STATUS_OPTIONS = ['Acquired', 'Renovating', 'Listed For Sale', 'Under Contract', 'Sold', 'Refund Pending', 'Refunded'];
export const PAYMENT_METHOD_OPTIONS = ["Auction.com", "Cashier's Check (On-Site)"];
export const OCCUPANCY_OPTIONS = ['Vacant', 'Occupied', 'Unknown'];
export const STATUSES = ['New', 'Researching', 'Bid Ready', 'Bid Submitted', 'Won', 'Lost', 'DNB', 'Postponed', 'Cancelled'];

// Both full/staff mode and Partner mode read/write through Supabase now (see supabaseApi.js) —
// there is no more Airtable token, field-name map, or base/table ID anywhere in this app.
