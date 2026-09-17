'use client';
// Ported from the Foreclosure Pre-Bid Command Center <script> — openDetailModal / refreshZillowLink
// / refreshAuctionComLink / handlePhotoUpload / removePhoto / renderDetailPhotos and the Title
// Report equivalents (hasTitleReports gates those — the Dark app never shipped that feature).

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { TextCell, TextAreaCell } from './cells';

function zillowHref(r) {
  const parts = [r.address, r.city, r.state, r.zip].filter(Boolean);
  if (!parts.length) return null;
  const slug = parts.join(' ').replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, '-');
  return `https://www.zillow.com/homes/${slug}_rb/`;
}
function auctionComHref(r) {
  if (r.location !== 'Auction.com') return null;
  const parts = [r.address, r.city, r.state].filter(Boolean);
  if (!parts.length) return null;
  const query = encodeURIComponent(parts.join(', '));
  return `https://www.auction.com/residential/${query}_qs/active_lt/resi_sort_v2_st/y_nbs`;
}

// `editable(fieldKey)` reflects the caller's actual effective permissions (role defaults +
// individual overrides — see lib/permissions/fieldGroups.js's allowedFieldsForProfile() and
// AuctionPipeline.jsx's isFieldEditable()), not a blanket role check. UX only — the server
// independently re-validates every field on save. `canRemoveDocuments` is separate from the four
// field-group permissions entirely (the matrix grants every role "upload and view," Partner
// included, but not "remove" — see app/api/properties/[id]/documents/route.js's CAN_REMOVE_ROLES).
export default function DetailModal({
  row, hasTitleReports, editable, canRemoveDocuments, onClose, onUpdateField,
  onUploadPhoto, onRemovePhoto, onUploadTitleReport, onRemoveTitleReport,
}) {
  const photoInputRef = useRef(null);
  const titleInputRef = useRef(null);
  if (!row) return null;

  const title = row.address ? `${row.address}${row.city ? ', ' + row.city : ''}${row.state ? ', ' + row.state : ''}` : 'Property Details';
  const zHref = zillowHref(row);
  const aHref = auctionComHref(row);

  return (
    <motion.div className="modal-overlay open"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
      <motion.div className="modal detail-modal" data-lenis-armable
        initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h2>{title}</h2>
          <button type="button" className="detail-close-x" onClick={onClose}>&times;</button>
        </div>
        <div className="detail-grid">
          <div className="detail-field"><label>Address</label><TextCell value={row.address} disabled={!editable('address')} onCommit={(v) => onUpdateField(row.id, 'address', v)} /></div>
          <div className="detail-field"><label>City</label><TextCell value={row.city} disabled={!editable('city')} onCommit={(v) => onUpdateField(row.id, 'city', v)} /></div>
          <div className="detail-field"><label>State</label><TextCell value={row.state} disabled={!editable('state')} onCommit={(v) => onUpdateField(row.id, 'state', v.toUpperCase().slice(0, 2))} /></div>
          <div className="detail-field"><label>Zip</label><TextCell value={row.zip} disabled={!editable('zip')} onCommit={(v) => onUpdateField(row.id, 'zip', v)} /></div>
        </div>
        <div className="detail-grid" style={{ gridTemplateColumns: '1.3fr 1fr 1.3fr' }}>
          <div className="detail-field"><label>Trustee Name</label><TextCell value={row.trusteeName} placeholder="e.g. ABC Trustee Services" disabled={!editable('trusteeName')} onCommit={(v) => onUpdateField(row.id, 'trusteeName', v)} /></div>
          <div className="detail-field"><label>Trustee Phone</label><TextCell value={row.trusteePhone} placeholder="(555) 555-5555" disabled={!editable('trusteePhone')} onCommit={(v) => onUpdateField(row.id, 'trusteePhone', v)} /></div>
          <div className="detail-field"><label>Trustee Email</label><TextCell value={row.trusteeEmail} placeholder="name@example.com" disabled={!editable('trusteeEmail')} onCommit={(v) => onUpdateField(row.id, 'trusteeEmail', v)} /></div>
        </div>
        <div className="detail-grid">
          <div className="detail-field"><label>Mortgage Balance</label><TextCell value={row.mortgageBalance} disabled={!editable('mortgageBalance')} onCommit={(v) => onUpdateField(row.id, 'mortgageBalance', v)} /></div>
          <div className="detail-field"><label>Open Bid</label><TextCell value={row.openBid} disabled={!editable('openBid')} onCommit={(v) => onUpdateField(row.id, 'openBid', v)} /></div>
          <div className="detail-field"><label>ARV</label><TextCell value={row.arv} disabled={!editable('arv')} onCommit={(v) => onUpdateField(row.id, 'arv', v)} /></div>
          <div className="detail-field"><label>Max Bid</label><TextCell value={row.maxBid} disabled={!editable('maxBid')} onCommit={(v) => onUpdateField(row.id, 'maxBid', v)} /></div>
        </div>
        <div className="detail-field" style={{ marginBottom: 14 }}>
          <label>Zillow</label>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
            {zHref ? <a href={zHref} target="_blank" rel="noopener noreferrer">View on Zillow &rarr;</a>
              : <a href="#" aria-disabled="true">Enter an address to search Zillow</a>}
            {aHref && <a href={aHref} target="_blank" rel="noopener noreferrer">View on Auction.com &rarr;</a>}
          </div>
        </div>
        <div className="detail-field" style={{ marginBottom: 14 }}>
          <label>Notes</label>
          <TextAreaCell value={row.notes} disabled={!editable('notes')} onCommit={(v) => onUpdateField(row.id, 'notes', v)} />
        </div>
        <div className="detail-field" style={{ marginBottom: 14 }}>
          <label>Drive Report Notes (title / inspection report links + notes)</label>
          <TextAreaCell value={row.driveNotes} placeholder="Paste Google Drive links to title/inspection reports and notes here..." disabled={!editable('driveNotes')} onCommit={(v) => onUpdateField(row.id, 'driveNotes', v)} />
        </div>
        <div className="detail-field">
          <label>Photos</label><br />
          <input type="file" accept="image/*" multiple hidden ref={photoInputRef}
            onChange={(e) => { if (e.target.files.length) onUploadPhoto(row.id, e.target.files); e.target.value = ''; }} />
          {/* Upload stays available regardless of the four field-group permissions — the matrix
              grants every role, Partner included, "upload and view documents" unconditionally.
              Removing a document is the one thing still gated, via canRemoveDocuments. */}
          <button type="button" onClick={() => photoInputRef.current && photoInputRef.current.click()}>&#128247; Add Photos</button>
          <div className="photo-grid">
            {row.photos && row.photos.length
              ? row.photos.map((p, i) => (
                <div className="photo-thumb" key={p.id || i}>
                  <a href={p.url} target="_blank" rel="noopener noreferrer" title="View full size">
                    <img src={p.url} alt="" />
                  </a>
                  <a href={p.downloadUrl || p.url} className="photo-download" title="Download">&#11015;</a>
                  {canRemoveDocuments && <button type="button" onClick={() => onRemovePhoto(row.id, i)}>&times;</button>}
                </div>
              ))
              : <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 8 }}>No photos yet.</div>}
          </div>
        </div>
        {hasTitleReports && (
          <div className="detail-field">
            <label>Title Report</label><br />
            <input type="file" accept=".pdf,.doc,.docx,image/*" multiple hidden ref={titleInputRef}
              onChange={(e) => { if (e.target.files.length) onUploadTitleReport(row.id, e.target.files); e.target.value = ''; }} />
            <button type="button" onClick={() => titleInputRef.current && titleInputRef.current.click()}>&#128196; Upload Title Report</button>
            <div className="file-list">
              {row.titleReports && row.titleReports.length
                ? row.titleReports.map((p, i) => (
                  <div className="file-chip" key={p.id || i}>
                    <a href={p.url} target="_blank" rel="noopener noreferrer">{p.filename || 'Title Report'}</a>
                    <a href={p.downloadUrl || p.url} className="file-download" title="Download">&#11015;</a>
                    {canRemoveDocuments && <button type="button" title="Remove" onClick={() => onRemoveTitleReport(row.id, i)}>&times;</button>}
                  </div>
                ))
                : <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 8 }}>No title report uploaded yet.</div>}
            </div>
          </div>
        )}
        <div className="modal-actions">
          <button className="btn-gold" onClick={onClose}>Close</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
