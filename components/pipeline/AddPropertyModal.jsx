'use client';
// "+ Add Property" now collects the one field the database actually requires (address is
// `not null` on public.properties — see the schema migration) before creating anything, instead
// of the old behavior of inserting a blank stub row, which always failed the not-null constraint
// and surfaced as a generic "Could not add the property" toast. Same modal chrome as
// BulkDateModal for visual consistency.

import { useState } from 'react';
import { motion } from 'framer-motion';
import { US_STATES } from './constants';
import { CountyAutocomplete } from '@/components/shared/LocationFields';

const overlayMotion = {
  initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.18 },
};
const modalMotion = {
  initial: { opacity: 0, scale: 0.96, y: 10 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.96, y: 10 },
  transition: { duration: 0.2, ease: 'easeOut' },
};

export default function AddPropertyModal({ defaultState, defaultCounty, onClose, onSubmit }) {
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState(defaultState && defaultState !== '—' ? defaultState : '');
  const [county, setCounty] = useState(defaultCounty && defaultCounty !== 'Unknown County' ? defaultCounty : '');
  const [zip, setZip] = useState('');
  const [error, setError] = useState('');

  function submit() {
    if (!address.trim()) { setError('Address is required.'); return; }
    onSubmit({ address: address.trim(), city: city.trim(), state: state.trim().toUpperCase().slice(0, 2), county: county.trim(), zip: zip.trim() });
  }

  return (
    <motion.div className="modal-overlay open" {...overlayMotion}>
      <motion.div className="modal" {...modalMotion}>
        <h2>Add Property</h2>
        <p>Address is required — everything else can be filled in from the detail panel after it&apos;s added.</p>
        <div className="detail-field" style={{ marginBottom: 14 }}>
          <label>Address *</label>
          <input type="text" autoFocus value={address} onChange={(e) => { setAddress(e.target.value); if (error) setError(''); }}
            placeholder="1010 Falling Water Dr SE" />
        </div>
        <div className="detail-field" style={{ marginBottom: 14 }}>
          <label>City</label>
          <input type="text" value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="detail-field" style={{ marginBottom: 14 }}>
            <label>State</label>
            <select value={state} onChange={(e) => setState(e.target.value)}>
              <option value="">—</option>
              {US_STATES.map((s) => <option value={s} key={s}>{s}</option>)}
            </select>
          </div>
          <div className="detail-field" style={{ marginBottom: 14 }}>
            <label>Zip</label>
            <input type="text" value={zip} onChange={(e) => setZip(e.target.value)} />
          </div>
        </div>
        <div className="detail-field" style={{ marginBottom: 14 }}>
          <label>County</label>
          <CountyAutocomplete state={state} value={county} onChange={setCounty} />
        </div>
        {error && <p style={{ color: 'var(--of-err-text, #b3261e)', marginTop: -6 }}>{error}</p>}
        <div className="modal-actions">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-gold" onClick={submit}>Add Property</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
