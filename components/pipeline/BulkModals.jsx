'use client';
// Ported from the Foreclosure Pre-Bid Command Center <script> — the "Bulk Paste" and
// "Change Sale Date" modals (openBulkModal/submitBulk, openBulkDateModal/applyBulkSaleDate).
// Conditionally mounted by the parent (inside AnimatePresence) so these only need to render
// their "open" state.

import { useState } from 'react';
import { motion } from 'framer-motion';

const overlayMotion = {
  initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.18 },
};
const modalMotion = {
  initial: { opacity: 0, scale: 0.96, y: 10 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.96, y: 10 },
  transition: { duration: 0.2, ease: 'easeOut' },
};

export function BulkPasteModal({ onClose, onSubmit }) {
  const [text, setText] = useState('');
  return (
    <motion.div className="modal-overlay open" {...overlayMotion}>
      <motion.div className="modal" {...modalMotion}>
        <h2>Bulk Paste from foreclosurebidlist.com</h2>
        <p>Copy rows from the site&apos;s listing table and paste below. One property per line, fields separated by tabs (default when copying a table) or commas.<br />
          Order: <b>State, County, Address, City, Zip, Sale Date, Mortgage Balance, Open Bid, Trustee Name, Trustee Phone, Trustee Email</b> (missing fields are OK — leave blank).</p>
        <textarea value={text} onChange={(e) => setText(e.target.value)}
          placeholder="GA, Cobb, 1010 Falling Water Dr SE, Smyrna, 30080, 2026-08-04, 167810, 155000, ABC Trustee Services, (555) 555-5555, contact@abctrustee.com"></textarea>
        <div className="modal-actions">
          <button className="btn-ghost" onClick={() => { setText(''); onClose(); }}>Cancel</button>
          <button className="btn-gold" onClick={() => { onSubmit(text); setText(''); }}>Add Properties</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function BulkDateModal({ count, onClose, onApply }) {
  const [date, setDate] = useState('');
  return (
    <motion.div className="modal-overlay open" {...overlayMotion}>
      <motion.div className="modal" {...modalMotion}>
        <h2>Change Sale Date</h2>
        <p>Apply a new Sale Date to <b>{count}</b> selected propert(y/ies). Each one automatically moves to the board for that month.</p>
        <div className="detail-field" style={{ marginBottom: 14 }}>
          <label>New Sale Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="modal-actions">
          <button className="btn-ghost" onClick={() => { setDate(''); onClose(); }}>Cancel</button>
          <button className="btn-gold" onClick={() => { onApply(date); setDate(''); }}>Apply</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
