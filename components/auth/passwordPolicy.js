// Shared complexity rule for every "set a password" surface (reset, and eventually invite
// accept). Kept in one place so the rule is stated once and can't drift between screens.
// Policy: 8+ characters, at least one letter and one number. Adjust here if the client wants
// something stricter (e.g. a symbol requirement) — nothing else needs to change.

export const PASSWORD_HINT = 'At least 8 characters, with a mix of letters and numbers.';

export function validatePassword(pw) {
  if (!pw || pw.length < 8) return 'Password must be at least 8 characters.';
  if (!/[a-zA-Z]/.test(pw)) return 'Password must include at least one letter.';
  if (!/[0-9]/.test(pw)) return 'Password must include at least one number.';
  return null;
}
