// The one account nobody — not even another admin — can activate/deactivate. There's exactly
// one superadmin by design; changing who holds it is a deliberate one-line edit here, not a
// self-service admin-UI action. Matched by email (not id) since that's the stable, human-legible
// handle an operator would actually use when reassigning this later.
export const SUPERADMIN_EMAIL = 'admin@oakasset.com';
