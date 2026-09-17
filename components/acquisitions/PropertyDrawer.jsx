'use client';
// Ported from Acquisitions_Center_LIVE.html — the property drawer (openDrawer/readForm/updateCalc).

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { STAGES, DEFAULT_BID_PCT, DEFAULT_SELL_PCT } from './constants';
import { calc, money, pct, zillowUrl, n } from './helpers';
import { StateSelect, CountySelect } from '@/components/shared/LocationFields';
import { DEAL_DB_FIELD_MAP } from './dbMapping';
import { allowedFieldsForProfile } from '@/lib/permissions/fieldGroups';

export default function PropertyDrawer({
  open, form, isNew, profile, canDelete, onChange, onSave, onDelete, onClose,
  onUploadPhoto, onRemovePhoto, onUploadTitleReport, onRemoveTitleReport,
}) {
  const photoInputRef = useRef(null);
  const titleInputRef = useRef(null);
  if (!form) return null;
  const c = calc(form);
  const set = (k) => (e) => onChange(k, e.target.type === 'checkbox' ? e.target.checked : e.target.value);

  // null = unrestricted (admin, or the instant before the caller's real profile has loaded — see
  // AcquisitionsApp.jsx's comment on why that default is safe). Reflects this specific user's
  // individual permissions, not just their role — an admin may have granted e.g. a Disposition
  // user the acquisition-fields permission too, on top of their own. Only gates the acquisition/
  // disposition/title-specific fieldsets below; address/city/state/zip/county/beds/baths/sqft/
  // year/stage/notes are common+status fields every acquisition/disposition/title role can edit
  // regardless of individual permissions (unchanged from before this feature existed).
  const allowedFields = allowedFieldsForProfile(profile);
  const editable = (dealField) => allowedFields === null || allowedFields.has(DEAL_DB_FIELD_MAP[dealField]);
  const lockTitle = "Not part of your permissions";

  const calcLines = [
    ['Auto max bid (' + (n(form.bidPct) || DEFAULT_BID_PCT) + '% of ARV, minus reno & holding)', money(c.autoMax), ''],
    ['Max bid in use', money(c.maxBid), c.overBid ? 'color:var(--oxblood)' : 'color:var(--brass)'],
    ['Room over opening bid', n(form.openingBid) ? money(c.room) : '—', c.room < 0 ? 'color:var(--oxblood)' : ''],
    ['Holding / carry cost', money(c.holding), ''],
    ['All-in basis', money(c.useBasis), ''],
    [c.isSold ? 'Sale price' : 'Exit assumption', money(c.exit), ''],
    ['Selling costs (' + (n(form.sellPct) || DEFAULT_SELL_PCT) + '%)', '-' + money(c.sellCosts), ''],
  ];
  if (c.held !== null) calcLines.push(['Days held', c.held + 'd', '']);

  return (
    <motion.aside className="drawer" aria-hidden="false"
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}>
      <div className="drawer-head">
        <h2>{isNew ? 'New property' : (form.address || 'Edit property')}</h2>
        <button className="btn btn-sm" onClick={onClose}>Close</button>
      </div>
      <div className="drawer-body" data-lenis-armable>
        <a className="linkout" href={zillowUrl(form)} target="_blank" rel="noopener" style={{ display: form.address ? '' : 'none' }}>Open in Zillow &rarr;</a>

        <div className="fieldset">
          <span className="fs-title">Property</span>
          <div className="grid2">
            <div className="f full"><label>Street address</label><input className="inp" placeholder="1428 Baker St" value={form.address || ''} onChange={set('address')} /></div>
            <div className="f"><label>City</label><input className="inp" value={form.city || ''} onChange={set('city')} /></div>
            <div className="f"><label>State</label>
              <StateSelect className="inp" value={form.stateAb} onChange={(v) => onChange('stateAb', v)} />
            </div>
            <div className="f"><label>Zip</label><input className="inp" value={form.zip || ''} onChange={set('zip')} /></div>
            <div className="f"><label>County</label>
              <CountySelect className="inp" state={form.stateAb} county={form.county} onChange={(v) => onChange('county', v)} />
            </div>
            <div className="f"><label>Beds</label><input className="inp num" type="number" value={form.beds ?? ''} onChange={set('beds')} /></div>
            <div className="f"><label>Baths</label><input className="inp num" type="number" step="0.5" value={form.baths ?? ''} onChange={set('baths')} /></div>
            <div className="f"><label>Sq ft</label><input className="inp num" type="number" value={form.sqft ?? ''} onChange={set('sqft')} /></div>
            <div className="f"><label>Year built</label><input className="inp num" type="number" value={form.year ?? ''} onChange={set('year')} /></div>
            <div className="f full"><label>Stage</label>
              <select className="inp" value={form.stage || 'research'} onChange={set('stage')}>
                {STAGES.map((s) => <option value={s.id} key={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="fieldset">
          <span className="fs-title">Auction file</span>
          <div className="grid2">
            <div className="f"><label>Sale date</label><input className="inp date" type="date" disabled={!editable('auctionDate')} title={!editable('auctionDate') ? lockTitle : undefined} value={form.auctionDate || ''} onChange={set('auctionDate')} /></div>
            <div className="f"><label>Opening bid</label><input className="inp num" type="number" inputMode="numeric" disabled={!editable('openingBid')} title={!editable('openingBid') ? lockTitle : undefined} value={form.openingBid ?? ''} onChange={set('openingBid')} /></div>
            <div className="f"><label>Mortgage balance</label><input className="inp num" type="number" inputMode="numeric" disabled={!editable('unpaid')} title={!editable('unpaid') ? lockTitle : undefined} value={form.unpaid ?? ''} onChange={set('unpaid')} /></div>
            <div className="f full"><label>Trustee</label><input className="inp" disabled={!editable('attorney')} title={!editable('attorney') ? lockTitle : undefined} value={form.attorney || ''} onChange={set('attorney')} /></div>
          </div>
        </div>

        <div className="fieldset">
          <span className="fs-title">Underwriting</span>
          <div className="grid2">
            <div className="f"><label>ARV</label><input className="inp num" type="number" inputMode="numeric" disabled={!editable('arv')} title={!editable('arv') ? lockTitle : undefined} value={form.arv ?? ''} onChange={set('arv')} /></div>
            <div className="f"><label>Reno budget</label><input className="inp num" type="number" inputMode="numeric" disabled={!editable('renoBudget')} title={!editable('renoBudget') ? lockTitle : undefined} value={form.renoBudget ?? ''} onChange={set('renoBudget')} /></div>
            <div className="f"><label>Holding / carry costs (blank = $0)</label><input className="inp num" type="number" inputMode="numeric" placeholder="0" disabled={!editable('holding')} title={!editable('holding') ? lockTitle : undefined} value={form.holding ?? ''} onChange={set('holding')} /></div>
          </div>
        </div>

        <div className="fieldset">
          <span className="fs-title">Ownership</span>
          <div className="grid2">
            <div className="f"><label>Purchase price</label><input className="inp num" type="number" inputMode="numeric" disabled={!editable('purchasePrice')} title={!editable('purchasePrice') ? lockTitle : undefined} value={form.purchasePrice ?? ''} onChange={set('purchasePrice')} /></div>
            <div className="f"><label>Reno spent</label><input className="inp num" type="number" inputMode="numeric" disabled={!editable('renoSpent')} title={!editable('renoSpent') ? lockTitle : undefined} value={form.renoSpent ?? ''} onChange={set('renoSpent')} /></div>
            <div className="f"><label>Contract price</label><input className="inp num" type="number" inputMode="numeric" disabled={!editable('contractPrice')} title={!editable('contractPrice') ? lockTitle : undefined} value={form.contractPrice ?? ''} onChange={set('contractPrice')} /></div>
            <div className="f"><label>Sale price</label><input className="inp num" type="number" inputMode="numeric" disabled={!editable('salePrice')} title={!editable('salePrice') ? lockTitle : undefined} value={form.salePrice ?? ''} onChange={set('salePrice')} /></div>
            <div className="f"><label>Acquired</label><input className="inp date" type="date" disabled={!editable('acquiredDate')} title={!editable('acquiredDate') ? lockTitle : undefined} value={form.acquiredDate || ''} onChange={set('acquiredDate')} /></div>
            <div className="f"><label>Listed</label><input className="inp date" type="date" disabled={!editable('listedDate')} title={!editable('listedDate') ? lockTitle : undefined} value={form.listedDate || ''} onChange={set('listedDate')} /></div>
            <div className="f"><label>Expected closing (COE)</label><input className="inp date" type="date" disabled={!editable('expectedClosing')} title={!editable('expectedClosing') ? lockTitle : undefined} value={form.expectedClosing || ''} onChange={set('expectedClosing')} /></div>
            <div className="f"><label>Closed</label><input className="inp date" type="date" disabled={!editable('closedDate')} title={!editable('closedDate') ? lockTitle : undefined} value={form.closedDate || ''} onChange={set('closedDate')} /></div>
            <div className="f"><label>Buyer side</label><input className="inp" disabled={!editable('buyer')} title={!editable('buyer') ? lockTitle : undefined} value={form.buyer || ''} onChange={set('buyer')} /></div>
            <div className="f"><label>Deed recorded</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, height: 34 }}>
                <input type="checkbox" style={{ width: 'auto' }} disabled={!editable('deedRecorded')} title={!editable('deedRecorded') ? lockTitle : undefined} checked={!!form.deedRecorded} onChange={set('deedRecorded')} /> <span style={{ fontSize: '12.5px', color: 'var(--dim)' }}>Recorded with the county</span>
              </label>
            </div>
          </div>
          <div className="calc">
            {calcLines.map((r, i) => (
              <div className="calc-row" key={i}><span>{r[0]}</span><span style={cssTextToObj(r[2])}>{r[1]}</span></div>
            ))}
            <div className="calc-row total"><span>{c.isSold ? 'Realized profit' : 'Projected profit'}</span>
              <span className={c.profit >= 0 ? 'pos' : 'neg'}>{money(c.profit)} &middot; {pct(c.roi)} ROI</span></div>
            {c.overBid && <div className="calc-row"><span style={{ color: 'var(--oxblood)' }}>Purchase is above your max bid.</span></div>}
            {c.noRoom && <div className="calc-row"><span style={{ color: 'var(--oxblood)' }}>Opening bid is above your max. This one is a pass.</span></div>}
          </div>
        </div>

        {!isNew && (
          <div className="fieldset">
            <span className="fs-title">Photos</span>
            <input type="file" accept="image/*" multiple hidden ref={photoInputRef}
              onChange={(e) => { if (e.target.files.length) onUploadPhoto(form.id, e.target.files); e.target.value = ''; }} />
            <button type="button" className="btn btn-sm" onClick={() => photoInputRef.current && photoInputRef.current.click()}>&#128247; Add Photos</button>
            <div className="photo-grid">
              {form.photos && form.photos.length
                ? form.photos.map((p, i) => (
                  <div className="photo-thumb" key={p.id || i}>
                    <a href={p.url} target="_blank" rel="noopener noreferrer" title="View full size">
                      <img src={p.url} alt="" />
                    </a>
                    <a href={p.downloadUrl || p.url} className="photo-download" title="Download">&#11015;</a>
                    <button type="button" onClick={() => onRemovePhoto(form.id, i)}>&times;</button>
                  </div>
                ))
                : <div style={{ color: 'var(--dim)', fontSize: 12, marginTop: 8 }}>No photos yet.</div>}
            </div>
          </div>
        )}

        {!isNew && (
          <div className="fieldset">
            <span className="fs-title">Title Report</span>
            <input type="file" accept=".pdf,.doc,.docx,image/*" multiple hidden ref={titleInputRef}
              onChange={(e) => { if (e.target.files.length) onUploadTitleReport(form.id, e.target.files); e.target.value = ''; }} />
            <button type="button" className="btn btn-sm" onClick={() => titleInputRef.current && titleInputRef.current.click()}>&#128196; Upload Title Report</button>
            <div className="file-list">
              {form.titleReports && form.titleReports.length
                ? form.titleReports.map((p, i) => (
                  <div className="file-chip" key={p.id || i}>
                    <a href={p.url} target="_blank" rel="noopener noreferrer">{p.filename || 'Title Report'}</a>
                    <a href={p.downloadUrl || p.url} className="file-download" title="Download">&#11015;</a>
                    <button type="button" title="Remove" onClick={() => onRemoveTitleReport(form.id, i)}>&times;</button>
                  </div>
                ))
                : <div style={{ color: 'var(--dim)', fontSize: 12, marginTop: 8 }}>No title report uploaded yet.</div>}
            </div>
          </div>
        )}

        <div className="fieldset">
          <span className="fs-title">Notes</span>
          <div className="f"><textarea placeholder="Liens, occupancy, title pull, drive-by, contractor bids, redemption period." value={form.notes || ''} onChange={set('notes')}></textarea></div>
        </div>
      </div>
      <div className="drawer-foot">
        <button className="btn btn-primary" onClick={onSave}>Save</button>
        <span style={{ flex: 1 }}></span>
        <button className="btn btn-danger" style={{ display: isNew || !canDelete ? 'none' : '' }} onClick={onDelete}>Delete</button>
      </div>
    </motion.aside>
  );
}

function cssTextToObj(text) {
  if (!text) return undefined;
  const obj = {};
  text.split(';').forEach((decl) => {
    const [k, v] = decl.split(':');
    if (!k || !v) return;
    const camel = k.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    obj[camel] = v.trim();
  });
  return obj;
}
