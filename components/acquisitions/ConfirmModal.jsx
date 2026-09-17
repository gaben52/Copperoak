'use client';
// A small, reusable confirmation dialog — replaces window.confirm() for destructive actions
// (deleting a property) with something that matches the app instead of a native browser dialog.
// Deliberately doesn't reuse the .modal class here: that name is overridden elsewhere in this
// app's own stylesheet into a large, full-inset panel (see styles.js) sized for the Import modal
// and drawer, not a small confirm box — so this is styled inline against the same design tokens
// instead, sitting on the shared .modal-overlay backdrop.

import { motion } from 'framer-motion';

const overlayMotion = {
  initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.18 },
};
const modalMotion = {
  initial: { opacity: 0, scale: 0.96, y: 10 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.96, y: 10 },
  transition: { duration: 0.2, ease: 'easeOut' },
};

export default function ConfirmModal({ title, message, confirmLabel = 'Confirm', onCancel, onConfirm }) {
  return (
    <motion.div className="modal-overlay open" {...overlayMotion} onClick={onCancel} style={{ zIndex: 220 }}>
      <motion.div {...modalMotion} onClick={(e) => e.stopPropagation()} style={{
        background: 'var(--of-surface)', border: '1px solid var(--of-border)', borderRadius: 'var(--of-r-lg)',
        boxShadow: 'var(--of-shadow-lg)', width: 420, maxWidth: '100%', padding: 'var(--of-s6)',
      }}>
        <h2 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600, letterSpacing: '-.01em', color: 'var(--of-text)' }}>{title}</h2>
        <p style={{ color: 'var(--of-text-2)', fontSize: 13, lineHeight: 1.55, margin: 0 }}>{message}</p>
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 8,
          marginTop: 'var(--of-s5)', paddingTop: 'var(--of-s4)', borderTop: '1px solid var(--of-border)',
        }}>
          <button className="btn btn-sm" onClick={onCancel}>Cancel</button>
          <button className="btn btn-sm btn-danger" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
