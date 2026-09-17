'use client';
// Shared state/county picker — used by Pipeline's RowsTable (inline table cell) and Property
// Operations' PropertyDrawer (a labeled form field), so a property's location is always
// constrained to a real state/county instead of free text. Free text was a real, live risk for
// Module 04: a misspelled county never resolves to a county_id (see the
// properties_sync_county_id trigger), which silently makes that row invisible to anyone scoped
// to that county rather than throwing an error anyone would notice.

import { useEffect, useRef, useState } from 'react';
import { US_STATES, COUNTIES_BY_STATE } from '@/lib/counties';

export function StateSelect({ value, onChange, disabled, className, style }) {
  return (
    <select className={className} style={style} disabled={disabled} value={value || ''}
      onChange={(e) => onChange(e.target.value)}>
      <option value="">-</option>
      {US_STATES.map((s) => <option value={s} key={s}>{s}</option>)}
    </select>
  );
}

// Scoped to `state`'s real county list; a county typed before Module 04 existed (or one genuinely
// missing from the list) stays selectable via "(custom)" rather than silently dropped, and
// "+ Type custom county..." keeps that escape hatch available going forward too.
export function CountySelect({ state, county, onChange, disabled, className, style }) {
  const list = state && COUNTIES_BY_STATE[state] ? COUNTIES_BY_STATE[state] : [];
  const matched = county && list.some((c) => c.toLowerCase() === county.toLowerCase());
  return (
    <select className={className} style={style} disabled={disabled}
      value={matched ? list.find((c) => c.toLowerCase() === county.toLowerCase()) : (county ? '__existing__' : '')}
      onChange={(e) => {
        if (e.target.value === '__custom__') {
          const v = prompt('Enter county name:');
          if (v) onChange(v);
          // else: leave the select's value as-is; the next render reverts it to the stored county.
          return;
        }
        onChange(e.target.value);
      }}>
      <option value="">{list.length ? 'Select county...' : (state ? 'No list for state' : 'Select state first')}</option>
      {list.map((c) => <option value={c} key={c}>{c}</option>)}
      {county && !matched && <option value="__existing__">{county} (custom)</option>}
      <option value="__custom__">+ Type custom county...</option>
    </select>
  );
}

// A prefix match ("Green" -> Greenville) ranks above a mid-string one ("Green" -> McGreenwood"),
// so the most relevant county is always the top suggestion rather than whatever happens to sort
// alphabetically first.
function rankCounties(list, query) {
  const q = query.trim().toLowerCase();
  if (!q) return list.slice(0, 8);
  return list
    .map((c) => {
      const low = c.toLowerCase();
      let score = 0;
      if (low === q) score = 3;
      else if (low.startsWith(q)) score = 2;
      else if (low.includes(q)) score = 1;
      return { c, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.c.localeCompare(b.c))
    .slice(0, 8)
    .map((x) => x.c);
}

// Free-typing combobox version of CountySelect — used where a full always-listed dropdown is
// unwieldy (some states have 200+ counties) and typing to filter is the more natural interaction,
// e.g. AddPropertyModal. Still constrained to `state`'s real county list; an unrecognized value
// is accepted as typed (not blocked) since the caller may be entering a county missing from this
// state's seed data, same escape hatch CountySelect gives via "(custom)".
export function CountyAutocomplete({ state, value, onChange, placeholder, className }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const list = state && COUNTIES_BY_STATE[state] ? COUNTIES_BY_STATE[state] : [];
  const suggestions = rankCounties(list, value || '');

  useEffect(() => {
    function onOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <input type="text" className={className} value={value || ''}
        placeholder={placeholder || (state ? 'Start typing a county…' : 'Select a state first')}
        disabled={!state}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)} />
      {open && state && suggestions.length > 0 && (
        <ul className="county-autocomplete-list">
          {suggestions.map((c) => (
            <li key={c}
              // onMouseDown (not onClick) fires before the input's onBlur/outside-click handler,
              // so the selection registers instead of the dropdown closing first.
              onMouseDown={(e) => { e.preventDefault(); onChange(c); setOpen(false); }}>
              {c}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
