'use client';
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import AppShell from '@/components/shell/AppShell';
import { adminCSS } from './styles';
import { SUPERADMIN_EMAIL } from '@/lib/auth/superadmin';
import { PERMISSION_FIELDS } from './permissionFields';
import { defaultPermissionsForRole } from '@/lib/permissions/fieldGroups';

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'acquisition', label: 'Acquisition' },
  { value: 'disposition', label: 'Disposition' },
  { value: 'title', label: 'Title' },
  { value: 'partner', label: 'Partner' },
];
const ROLE_LABEL = Object.fromEntries(ROLES.map((r) => [r.value, r.label]));

// Word-by-word relevance: each search word is scored independently against name/email/role (a
// name match outweighs an email match, a prefix match outweighs a mid-string one), then summed,
// with a bonus for hitting every typed word — so "dem part" ranks "Demo Partner" above a user
// who only happens to contain "dem" somewhere. Ties keep the list's original order (Array#sort
// is stable), rather than reshuffling on every keystroke.
function scoreUser(u, words) {
  const name = (u.full_name || '').toLowerCase();
  const email = (u.email || '').toLowerCase();
  const role = (ROLE_LABEL[u.role] || u.role || '').toLowerCase();
  let total = 0;
  let hitAll = true;
  for (const w of words) {
    let best = 0;
    if (name === w) best = 10;
    else if (name.startsWith(w)) best = 7;
    else if (name.includes(w)) best = 4;
    if (email.startsWith(w)) best = Math.max(best, 5);
    else if (email.includes(w)) best = Math.max(best, 3);
    if (role.includes(w)) best = Math.max(best, 1);
    if (best === 0) hitAll = false;
    total += best;
  }
  if (hitAll) total += 3;
  return total;
}

// Wraps every occurrence of any search word in <mark>, case-insensitively — used on the columns
// scoreUser() actually searches (name, email, role) so the highlight always explains the ranking.
function highlight(text, words) {
  const str = text == null ? '' : String(text);
  if (!words.length || !str) return str;
  const escaped = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const re = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = str.split(re);
  if (parts.length === 1) return str;
  const lowerWords = words;
  return parts.map((part, i) =>
    lowerWords.includes(part.toLowerCase())
      ? <mark className="ah-mark" key={i}>{part}</mark>
      : <span key={i}>{part}</span>
  );
}

export default function AdminUsersPage({ user }) {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState('partner');
  // Auto-set to that role's defaults whenever role changes (see the effect below) — admin can
  // still check/uncheck any of them individually before inviting; changing role again resets to
  // the new role's defaults rather than trying to guess which manual edits to keep.
  const [permissions, setPermissions] = useState(() => defaultPermissionsForRole('partner'));
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { kind: 'success' | 'warning' | 'error', message }

  const [currentUserId, setCurrentUserId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [toggleError, setToggleError] = useState('');

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const searchWords = useMemo(
    () => search.trim().toLowerCase().split(/\s+/).filter(Boolean),
    [search]
  );
  const roleFilteredUsers = useMemo(
    () => (roleFilter ? users.filter((u) => u.role === roleFilter) : users),
    [users, roleFilter]
  );
  const sortedUsers = useMemo(() => {
    if (!searchWords.length) return roleFilteredUsers;
    return roleFilteredUsers
      .map((u) => ({ u, score: scoreUser(u, searchWords) }))
      .sort((a, b) => b.score - a.score)
      .map((x) => x.u);
  }, [roleFilteredUsers, searchWords]);
  const topMatchId = searchWords.length && sortedUsers.length && scoreUser(sortedUsers[0], searchWords) > 0
    ? sortedUsers[0].id
    : null;

  // "When a role is selected, automatically check the permissions normally allowed by that role."
  useEffect(() => { setPermissions(defaultPermissionsForRole(role)); }, [role]);

  async function loadUsers() {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (res.ok) setUsers(data.users || []);
    } finally {
      setLoadingUsers(false);
    }
  }

  useEffect(() => {
    loadUsers();
    createClient().auth.getUser().then(({ data }) => setCurrentUserId(data?.user?.id || null));
  }, []);

  // Deactivating blocks the account everywhere immediately (every page and API route already
  // checks profiles.is_active on each request — this flag is the entire mechanism, not just a
  // label). The server independently refuses to let you deactivate yourself; disabling your own
  // row's toggle here is just to avoid a confusing error rather than being the real protection.
  async function toggleActive(u) {
    setToggleError('');
    setTogglingId(u.id);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setActive', userId: u.id, isActive: !u.is_active }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToggleError(data.error || 'Could not update that account.');
      } else {
        setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, is_active: data.user.is_active } : x)));
      }
    } catch (e) {
      setToggleError('Something went wrong. Try again.');
    } finally {
      setTogglingId(null);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setResult(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, mobile, role, permissions }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ kind: 'error', message: data.error || 'Could not invite this user.' });
      } else if (data.warning) {
        setResult({ kind: 'warning', message: data.warning });
      } else {
        setResult({ kind: 'success', message: `Invitation sent to ${email}.` });
        setFullName(''); setEmail(''); setMobile(''); setRole('partner');
        loadUsers();
      }
    } catch (e) {
      setResult({ kind: 'error', message: 'Something went wrong. Try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* dangerouslySetInnerHTML — see the note in LoginForm.jsx (<style> raw-text + server
          HTML-escaping of string children is a guaranteed hydration mismatch otherwise). */}
      <style dangerouslySetInnerHTML={{ __html: adminCSS() }} />
      <AppShell user={user}>
        <div className="ah-page-head">
          <h1>User Management</h1>
          <p>Add a user and manage who has access to Acquire Hub, including roles, invites, and account status.</p>
        </div>

        <div className="ah-grid-2">
          <div className="ah-card ah-card-pad">
            <h2>Invite a user</h2>
            <p className="ah-card-sub">A temporary password is generated automatically and emailed to them — you never see or set it.</p>

            <form onSubmit={handleSubmit}>
              <div className="ah-field">
                <label htmlFor="fullName">Full name</label>
                <input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="ah-field">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="ah-field">
                <label htmlFor="mobile">Mobile number</label>
                <input id="mobile" type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} />
              </div>
              <div className="ah-field">
                <label htmlFor="role">Role</label>
                <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                  {ROLES.map((r) => <option value={r.value} key={r.value}>{r.label}</option>)}
                </select>
              </div>

              <div className="ah-field">
                <label>Individual Permissions</label>
                <div className="permission-checkboxes">
                  {PERMISSION_FIELDS.map((p) => (
                    <label className="permission-checkbox" key={p.key}>
                      <input type="checkbox" checked={!!permissions[p.key]}
                        onChange={(e) => setPermissions((prev) => ({ ...prev, [p.key]: e.target.checked }))} />
                      {p.label}
                    </label>
                  ))}
                </div>
              </div>

              {result?.kind === 'error' && <div className="ah-banner-error">{result.message}</div>}
              {result?.kind === 'warning' && <div className="ah-banner-warn">{result.message}</div>}
              {result?.kind === 'success' && <div className="ah-banner-success">{result.message}</div>}

              <button type="submit" className="ah-btn-gold" style={{ width: '100%' }} disabled={submitting}>
                {submitting ? 'Inviting…' : 'Invite User'}
              </button>
            </form>
          </div>

          <div className="ah-card ah-card-pad">
            <h2>Users ({users.length})</h2>
            <p className="ah-card-sub">Everyone with an Acquire Hub account. Click a non-admin user's row to manage their state/county/property assignments; use the Status button to activate or deactivate their account.</p>

            <div className="user-filters-row">
              <div className="ah-field user-search-field">
                <label htmlFor="userSearch">Search users</label>
                <input id="userSearch" placeholder="Search by name, email, or role…"
                  value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="ah-field user-role-filter">
                <label htmlFor="userRoleFilter">Role</label>
                <select id="userRoleFilter" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                  <option value="">All roles</option>
                  {ROLES.map((r) => <option value={r.value} key={r.value}>{r.label}</option>)}
                </select>
              </div>
            </div>

            {toggleError && <div className="ah-banner-error">{toggleError}</div>}

            {loadingUsers ? (
              <div className="ah-table-empty">Loading…</div>
            ) : users.length === 0 ? (
              <div className="ah-table-empty">No users yet.</div>
            ) : sortedUsers.length === 0 ? (
              <div className="ah-table-empty">
                {search.trim() && roleFilter
                  ? `No ${ROLE_LABEL[roleFilter]} users match "${search.trim()}".`
                  : search.trim()
                  ? `No users match "${search.trim()}".`
                  : `No ${ROLE_LABEL[roleFilter]} users.`}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="ah-table">
                  <thead>
                    <tr>
                      <th>Name</th><th>Email</th><th>Mobile</th><th>Role</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedUsers.map((u) => (
                      <tr key={u.id}
                        className={u.id === topMatchId ? 'ah-row-best-match' : undefined}
                        onClick={u.role === 'admin' ? undefined : () => { window.location.href = `/admin/assignments?userId=${u.id}`; }}
                        style={u.role === 'admin' ? undefined : { cursor: 'pointer' }}
                        title={u.role === 'admin' ? 'Admin sees everything — no assignments to manage' : `Manage assignments for ${u.full_name}`}>
                        <td>{highlight(u.full_name, searchWords)}</td>
                        <td>{highlight(u.email, searchWords)}</td>
                        <td>{u.mobile || '—'}</td>
                        <td><span className="ah-badge">{highlight(ROLE_LABEL[u.role] || u.role, searchWords)}</span></td>
                        <td>
                          {(() => {
                            const isSelf = u.id === currentUserId;
                            const isSuperadmin = u.email === SUPERADMIN_EMAIL;
                            const title = isSelf
                              ? "You can't deactivate your own account"
                              : isSuperadmin
                              ? "The superadmin account can't be deactivated"
                              : (u.is_active ? 'Click to deactivate' : 'Click to activate');
                            return (
                              <button type="button"
                                className={'ah-badge ah-badge-toggle ' + (u.is_active ? 'ah-badge-ok' : 'ah-badge-err')}
                                disabled={isSelf || isSuperadmin || togglingId === u.id}
                                title={title}
                                onClick={(e) => { e.stopPropagation(); toggleActive(u); }}>
                                {togglingId === u.id ? 'Updating…' : (u.is_active ? 'Active' : 'Deactivated')}
                              </button>
                            );
                          })()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </AppShell>
    </>
  );
}
