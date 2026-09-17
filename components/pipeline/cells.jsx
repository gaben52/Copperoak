'use client';
// Small reusable table-cell inputs matching the original's onchange (blur-commit) behavior —
// React's onChange fires per-keystroke, so a fully-controlled input would fight the user's
// typing. These stay uncontrolled (defaultValue) and commit on blur, exactly like the source's
// plain-DOM inputs with an `onchange` handler. The `remountKey` forces a fresh DOM node (and so
// a fresh defaultValue) whenever the committed value changes elsewhere, so the field never goes
// stale after an update from outside itself.

import { fmtMoney } from './helpers';

export function TextCell({ value, onCommit, placeholder, style, disabled }) {
  return (
    <input
      key={String(value)}
      defaultValue={value || ''}
      placeholder={placeholder}
      style={style}
      disabled={disabled}
      onBlur={(e) => { if (e.target.value !== (value || '')) onCommit(e.target.value); }}
    />
  );
}

export function MoneyCell({ value, onCommit, className, disabled }) {
  return (
    <input
      key={String(value)}
      className={className}
      defaultValue={value === '' ? '' : fmtMoney(value)}
      disabled={disabled}
      onFocus={(e) => { e.target.value = value === '' ? '' : String(value); }}
      onBlur={(e) => {
        let v = e.target.value.replace(/[^0-9.\-]/g, '');
        v = v === '' ? '' : parseFloat(v);
        e.target.value = v === '' ? '' : fmtMoney(v);
        if (v !== value) onCommit(v === '' ? '' : String(v));
      }}
    />
  );
}

export function DateCell({ value, onCommit, className, disabled }) {
  return (
    <input
      key={String(value)}
      type="date"
      className={className}
      defaultValue={value || ''}
      disabled={disabled}
      onBlur={(e) => { if (e.target.value !== (value || '')) onCommit(e.target.value); }}
      onChange={(e) => { if (e.target.value !== (value || '')) onCommit(e.target.value); }}
    />
  );
}

export function TextAreaCell({ value, onCommit, placeholder, disabled }) {
  return (
    <textarea
      key={String(value)}
      defaultValue={value || ''}
      placeholder={placeholder}
      disabled={disabled}
      onBlur={(e) => { if (e.target.value !== (value || '')) onCommit(e.target.value); }}
    />
  );
}
