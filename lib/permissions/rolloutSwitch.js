// Module 04 staged rollout switch (plan Stage 6). Flipped on for all three roles as of this
// commit — verified safe first: as of the flip, the only real account in the live system is
// admin@oakasset.com (confirmed via /api/admin/users), so there is no active
// acquisition/disposition/title user whose current view this changes. From this point on,
// inviting a real user into one of these roles means they see nothing until an admin assigns
// them a state, county, or property in /admin/assignments — that's the intended final behavior,
// not a bug. If a real user with one of these roles is ever invited before being assigned
// anything, warn them in advance rather than let them discover an empty screen.
//
// Partner is not listed here (and never needs to be) — Partner Portal applies real scoping
// unconditionally already, since it never had unrestricted access to begin with.
export const SCOPING_ENABLED_ROLES = new Set([
  'acquisition',
  'disposition',
  'title',
]);
