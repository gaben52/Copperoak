'use client';
// Shown before Bulk Paste / CSV & Excel Import ever write to Supabase. Both sources already
// parse into DB-column-keyed field objects (dbMapping.js's rowToDbFields) before reaching here,
// so this one modal serves both — same preview table, same valid/invalid split, same confirm gate.
// A row counts as valid the same way the pre-existing import filter already did (address or
// county present) — this modal doesn't invent a new bar, it just stops silently applying it.

import { motion } from 'framer-motion';

const overlayMotion = {
  initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.18 },
};
const modalMotion = {
  initial: { opacity: 0, scale: 0.96, y: 10 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.96, y: 10 },
  transition: { duration: 0.2, ease: 'easeOut' },
};

export default function ImportPreviewModal({ sourceLabel, rows, onCancel, onConfirm }) {
  const validRows = rows.filter((r) => r._valid);
  const invalidRows = rows.filter((r) => !r._valid);

  return (
    <motion.div className="modal-overlay open" {...overlayMotion}>
      <motion.div className="modal" style={{ width: 760 }} {...modalMotion}>
        <h2>Review before importing — {sourceLabel}</h2>
        <p>
          {validRows.length} of {rows.length} row{rows.length === 1 ? '' : 's'} will be added to the Auction Pipeline.
          {invalidRows.length > 0 && <> <b>{invalidRows.length}</b> row{invalidRows.length === 1 ? '' : 's'} {invalidRows.length === 1 ? 'is' : 'are'} missing both an address and a county and will be skipped.</>}
        </p>
        <div style={{ maxHeight: '48vh', overflow: 'auto', border: '1px solid var(--of-border)', borderRadius: 'var(--of-r)' }}>
          <table style={{ width: '100%', minWidth: 0, fontSize: 12.5, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--of-surface-2)', position: 'sticky', top: 0 }}>
                <th style={{ textAlign: 'left', padding: '6px 8px' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '6px 8px' }}>Address</th>
                <th style={{ textAlign: 'left', padding: '6px 8px' }}>City</th>
                <th style={{ textAlign: 'left', padding: '6px 8px' }}>State</th>
                <th style={{ textAlign: 'left', padding: '6px 8px' }}>County</th>
                <th style={{ textAlign: 'left', padding: '6px 8px' }}>Sale Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} style={{ borderTop: '1px solid var(--of-border)', opacity: r._valid ? 1 : 0.6, whiteSpace: 'nowrap' }}>
                  <td style={{ padding: '6px 8px' }}>
                    {r._valid
                      ? <span style={{ color: 'var(--of-ok-text, #2e7d4f)' }}>&#10003; Valid</span>
                      : <span style={{ color: 'var(--of-err-text, #b3261e)' }}>&#9888; Skipped — no address/county</span>}
                  </td>
                  <td style={{ padding: '6px 8px' }}>{r.address || '—'}</td>
                  <td style={{ padding: '6px 8px' }}>{r.city || '—'}</td>
                  <td style={{ padding: '6px 8px' }}>{r.state || '—'}</td>
                  <td style={{ padding: '6px 8px' }}>{r.county || '—'}</td>
                  <td style={{ padding: '6px 8px' }}>{r.sale_date || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="modal-actions">
          <button className="btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn-gold" disabled={!validRows.length} onClick={() => onConfirm(validRows)}>
            Import {validRows.length} Propert{validRows.length === 1 ? 'y' : 'ies'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
