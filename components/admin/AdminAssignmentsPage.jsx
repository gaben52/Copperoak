'use client';
// Module 04 admin screen — assign users to states, counties, or properties. Mirrors
// AdminUsersPage.jsx's layout (AppShell + ah-grid-2/ah-field/ah-card).

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AppShell from '@/components/shell/AppShell';
import { adminCSS } from './styles';
import { PERMISSION_FIELDS } from './permissionFields';

const TYPE_LABELS = { state: 'State', county: 'County', property: 'Property' };
const TYPE_BADGE_CLASS = { state: 'ah-badge-ok', county: 'ah-badge-warn', property: '' };

export default function AdminAssignmentsPage({ user }) {
  const searchParams = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  // Arriving from a User Management row click (?userId=...) pre-selects that user here and
  // focuses the "Current assignments" list on them — see the filteredAssignments/isFiltered
  // logic below.
  const [userId, setUserId] = useState(() => searchParams.get('userId') || '');
  const [type, setType] = useState('county');
  const [stateFilter, setStateFilter] = useState('');
  const [countyId, setCountyId] = useState('');
  const [stateId, setStateId] = useState('');
  const [countyQuery, setCountyQuery] = useState('');
  const [propertyQuery, setPropertyQuery] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Individual permissions for whichever user is selected — loaded from their actual saved
  // values (not recomputed from role) whenever the selection changes, editable independently,
  // saved explicitly via the button rather than on every checkbox click.
  const [permissionEdits, setPermissionEdits] = useState(null);
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [permissionResult, setPermissionResult] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/assignments');
      const json = await res.json();
      if (res.ok) setData(json);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  const countiesForState = useMemo(() => {
    if (!data || !stateFilter) return [];
    const list = data.counties.filter((c) => c.state_id === stateFilter);
    const q = countyQuery.trim().toLowerCase();
    const filtered = q ? list.filter((c) => c.name.toLowerCase().includes(q)) : list;
    return filtered.sort((a, b) => (b.propertyCount - a.propertyCount) || a.name.localeCompare(b.name));
  }, [data, stateFilter, countyQuery]);

  const matchingProperties = useMemo(() => {
    if (!data) return [];
    const q = propertyQuery.trim().toLowerCase();
    const list = q ? data.properties.filter((p) => (p.address || '').toLowerCase().includes(q)) : data.properties;
    return list.slice(0, 200); // only ~113 properties exist total right now, this just caps future growth
  }, [data, propertyQuery]);

  async function submitAssignment(e) {
    e.preventDefault();
    setResult(null);
    const targetId = type === 'state' ? stateId : type === 'county' ? countyId : propertyId;
    if (!userId || !targetId) {
      setResult({ kind: 'error', message: 'Pick a user and a target first.' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', type, userId, targetId }),
      });
      const json = await res.json();
      if (!res.ok) {
        setResult({ kind: 'error', message: json.error || 'Could not add that assignment.' });
      } else {
        setResult({ kind: 'success', message: 'Assignment added.' });
        setCountyId(''); setStateId(''); setPropertyQuery(''); setPropertyId('');
        load();
      }
    } catch (e) {
      setResult({ kind: 'error', message: 'Something went wrong. Try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  async function removeAssignment(assignType, aUserId, targetId) {
    try {
      const res = await fetch('/api/admin/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove', type: assignType, userId: aUserId, targetId }),
      });
      if (res.ok) load();
    } catch (e) { /* ignore */ }
  }

  const allAssignments = data ? [
    ...data.assignments.states.map((a) => ({ ...a, type: 'state', targetId: a.stateId })),
    ...data.assignments.counties.map((a) => ({ ...a, type: 'county', targetId: a.countyId })),
    ...data.assignments.properties.map((a) => ({ ...a, type: 'property', targetId: a.propertyId })),
  ] : [];
  const userById = data ? Object.fromEntries(data.users.map((u) => [u.id, u])) : {};
  // Focuses the right-hand list on whichever user is currently selected in the form (pre-filled
  // from ?userId=... when arriving from a User Management row, but this stays live if the admin
  // picks someone else from the dropdown too) — "Show all" clears it back to the full list.
  const isFiltered = !!userId && !!userById[userId];
  const filteredAssignments = isFiltered ? allAssignments.filter((a) => a.userId === userId) : allAssignments;

  // Loads the selected user's real saved permissions whenever the selection (or the underlying
  // data) changes — deliberately not derived from role, since a user's stored permissions may
  // have already been individually customized away from their role's defaults.
  useEffect(() => {
    const u = userById[userId];
    setPermissionEdits(u ? {
      create_property: !!u.perm_create_property,
      edit_acquisition_fields: !!u.perm_edit_acquisition_fields,
      edit_disposition_fields: !!u.perm_edit_disposition_fields,
      edit_title_fields: !!u.perm_edit_title_fields,
    } : null);
    setPermissionResult(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, data]);

  async function savePermissions() {
    if (!userId || !permissionEdits) return;
    setPermissionResult(null);
    setSavingPermissions(true);
    try {
      const res = await fetch('/api/admin/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setPermissions', userId, permissions: permissionEdits }),
      });
      const json = await res.json();
      if (!res.ok) {
        setPermissionResult({ kind: 'error', message: json.error || 'Could not save permissions.' });
      } else {
        setPermissionResult({ kind: 'success', message: 'Permissions saved.' });
        load();
      }
    } catch (e) {
      setPermissionResult({ kind: 'error', message: 'Something went wrong. Try again.' });
    } finally {
      setSavingPermissions(false);
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: adminCSS() }} />
      <AppShell user={user}>
        <div className="ah-page-head">
          <h1>Assignments</h1>
          <p>Who can see what — a state grant covers every county and property in it.</p>
        </div>

        <div className="ah-grid-2">
          <div className="ah-card ah-card-pad">
            <h2>Add an assignment</h2>
            <p className="ah-card-sub">A user sees only what's assigned to them — a state grant covers every county and property in it.</p>

            {loading ? (
              <div className="ah-table-empty">Loading…</div>
            ) : (
              <form onSubmit={submitAssignment}>
                <div className="ah-field">
                  <label htmlFor="assignUser">User</label>
                  <select id="assignUser" required value={userId} onChange={(e) => setUserId(e.target.value)}>
                    <option value="">Select a user…</option>
                    {data.users.map((u) => (
                      <option value={u.id} key={u.id}>{u.full_name} ({u.role})</option>
                    ))}
                  </select>
                </div>

                <div className="ah-field">
                  <label htmlFor="assignType">Type</label>
                  <select id="assignType" value={type} onChange={(e) => { setType(e.target.value); setResult(null); }}>
                    <option value="state">Entire state</option>
                    <option value="county">Single county</option>
                    <option value="property">Single property</option>
                  </select>
                </div>

                {type === 'state' && (
                  <div className="ah-field">
                    <label htmlFor="stateOnly">State</label>
                    <select id="stateOnly" required value={stateId} onChange={(e) => setStateId(e.target.value)}>
                      <option value="">Select a state…</option>
                      {data.states.map((s) => <option value={s.id} key={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                )}

                {type === 'county' && (
                  <>
                    <div className="ah-field">
                      <label htmlFor="countyState">State</label>
                      <select id="countyState" required value={stateFilter} onChange={(e) => { setStateFilter(e.target.value); setCountyId(''); }}>
                        <option value="">Select a state…</option>
                        {data.states.map((s) => <option value={s.id} key={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    {stateFilter && (
                      <>
                        <div className="ah-field">
                          <label htmlFor="countyFilter">Filter counties</label>
                          <input id="countyFilter" placeholder="Start typing a county name…" value={countyQuery} onChange={(e) => setCountyQuery(e.target.value)} />
                        </div>
                        <div className="ah-field">
                          <label htmlFor="countyPick">County</label>
                          <select id="countyPick" required value={countyId} onChange={(e) => setCountyId(e.target.value)}>
                            <option value="">{countiesForState.length ? 'Select a county…' : 'No counties match that'}</option>
                            {countiesForState.map((c) => (
                              <option value={c.id} key={c.id}>{c.name}{c.propertyCount ? ` (${c.propertyCount})` : ''}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}
                  </>
                )}

                {type === 'property' && (
                  <>
                    <div className="ah-field">
                      <label htmlFor="propertySearch">Filter properties</label>
                      <input id="propertySearch" placeholder="Start typing an address…" value={propertyQuery}
                        onChange={(e) => { setPropertyQuery(e.target.value); setPropertyId(''); }} />
                    </div>
                    <div className="ah-field">
                      <label htmlFor="propertyPick">Property ({matchingProperties.length})</label>
                      <select id="propertyPick" required value={propertyId} onChange={(e) => setPropertyId(e.target.value)}>
                        <option value="">{matchingProperties.length ? 'Select a property…' : 'No properties match that'}</option>
                        {matchingProperties.map((p) => (
                          <option value={p.id} key={p.id}>
                            {p.address || '(no address)'}{p.county ? ` — ${p.county}${p.state ? ', ' + p.state : ''}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {result?.kind === 'error' && <div className="ah-banner-error">{result.message}</div>}
                {result?.kind === 'success' && <div className="ah-banner-success">{result.message}</div>}

                <button type="submit" className="ah-btn-gold" style={{ width: '100%' }} disabled={submitting}>
                  {submitting ? 'Adding…' : 'Add Assignment'}
                </button>
              </form>
            )}
          </div>

          <div className="ah-card ah-card-pad">
            <h2>Current assignments ({filteredAssignments.length})</h2>
            {isFiltered ? (
              <p className="ah-card-sub">
                Showing assignments for <b>{userById[userId].full_name}</b> only —{' '}
                <button type="button" className="ah-btn-ghost" onClick={() => setUserId('')}>Show all users</button>
              </p>
            ) : (
              <p className="ah-card-sub">Who can see what.</p>
            )}

            {isFiltered && permissionEdits && (
              <div className="admin-permissions-block">
                <label>Individual Permissions</label>
                <p className="ah-card-sub" style={{ marginTop: 2 }}>
                  What <b>{userById[userId].full_name}</b> can do — on top of their role's defaults,
                  only within the properties they're assigned to.
                </p>
                <div className="permission-checkboxes">
                  {PERMISSION_FIELDS.map((p) => (
                    <label className="permission-checkbox" key={p.key}>
                      <input type="checkbox" checked={!!permissionEdits[p.key]}
                        onChange={(e) => setPermissionEdits((prev) => ({ ...prev, [p.key]: e.target.checked }))} />
                      {p.label}
                    </label>
                  ))}
                </div>
                {permissionResult?.kind === 'error' && <div className="ah-banner-error">{permissionResult.message}</div>}
                {permissionResult?.kind === 'success' && <div className="ah-banner-success">{permissionResult.message}</div>}
                <button type="button" className="ah-btn-gold"
                  disabled={savingPermissions} onClick={savePermissions}>
                  {savingPermissions ? 'Saving…' : 'Save Permissions'}
                </button>
              </div>
            )}

            {loading ? (
              <div className="ah-table-empty">Loading…</div>
            ) : filteredAssignments.length === 0 ? (
              <div className="ah-table-empty">
                {isFiltered ? `${userById[userId].full_name} has no assignments yet — they see nothing until you add one.`
                  : 'No assignments yet — everyone with a non-admin role sees nothing until assigned.'}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="ah-table">
                  <thead>
                    <tr><th>User</th><th>Type</th><th>Assigned to</th><th></th></tr>
                  </thead>
                  <tbody>
                    {filteredAssignments.map((a) => (
                      <tr key={`${a.type}-${a.userId}-${a.targetId}`}>
                        <td>{userById[a.userId]?.full_name || '—'}</td>
                        <td><span className={'ah-badge ' + (TYPE_BADGE_CLASS[a.type] || '')}>{TYPE_LABELS[a.type]}</span></td>
                        <td>{a.label}</td>
                        <td>
                          <button type="button" className="ah-btn-ghost"
                            onClick={() => removeAssignment(a.type, a.userId, a.targetId)}>Remove</button>
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
