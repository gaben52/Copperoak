// Server-side only. Cryptographically secure random temporary password for the admin invite
// flow — never exposed to the admin, never logged, only ever held in memory long enough to
// create the auth user and send the invite email (see app/api/admin/invite/route.js).
import crypto from 'crypto';
import { validatePassword } from '@/components/auth/passwordPolicy';

// Excludes visually ambiguous characters (0/O, 1/l/I) since this gets read off an email and
// typed back in by hand.
const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';

function randomFromCharset(length) {
  const bytes = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) out += CHARSET[bytes[i] % CHARSET.length];
  return out;
}

// Loops only in the astronomically unlikely case the random draw doesn't satisfy the app's own
// policy (e.g. no digit at all in 14 draws) — reuses passwordPolicy.js rather than restating the
// rule here, so generated passwords are held to exactly the same bar as user-chosen ones.
export function generateTempPassword() {
  let pw = randomFromCharset(14);
  let guard = 0;
  while (validatePassword(pw) && guard < 20) {
    pw = randomFromCharset(14);
    guard += 1;
  }
  return pw;
}
