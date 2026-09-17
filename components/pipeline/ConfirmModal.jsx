'use client';
// A small, reusable confirmation dialog — replaces window.confirm() for destructive actions
// (removing a property) with something that matches the rest of the app instead of a native
// browser dialog box. Same overlay/modal chrome as the other Pipeline modals.

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
    <motion.div className="modal-overlay open" {...overlayMotion} onClick={onCancel}>
      <motion.div className="modal" style={{ width: 420 }} {...modalMotion} onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
