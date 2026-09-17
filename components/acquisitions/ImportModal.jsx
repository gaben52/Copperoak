'use client';
// Ported from Acquisitions_Center_LIVE.html — the "Import auction list" modal (openImport /
// readFile / loadGrid / buildMapping / buildImportRecords / previewImport / commitImport).

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import { FIELDS, DEFAULT_BID_PCT, DEFAULT_SELL_PCT } from './constants';
import { uid, money, fmtDate, n } from './helpers';

function splitLine(line, delim) {
  const out = []; let cur = ''; let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { if (q && line[i + 1] === '"') { cur += '"'; i++; } else q = !q; }
    else if (ch === delim && !q) { out.push(cur); cur = ''; }
    else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

function parseDateCell(v) {
  if (!v) return '';
  const s = String(v).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (m) { let [, a, b, c] = m; if (c.length === 2) c = '20' + c; return `${c}-${String(a).padStart(2, '0')}-${String(b).padStart(2, '0')}`; }
  const d = new Date(s);
  return isNaN(d) ? '' : d.toISOString().slice(0, 10);
}

function guessCol(field, importHeaders) {
  const hs = importHeaders.map((h) => h.toLowerCase().trim());
  for (const hint of field.hints) { const i = hs.indexOf(hint); if (i >= 0) return i; }
  for (const hint of field.hints) { const i = hs.findIndex((h) => h.includes(hint)); if (i >= 0) return i; }
  return -1;
}

const NUM_FIELDS = ['openingBid', 'unpaid', 'estValue', 'beds', 'baths', 'sqft', 'year'];

export default function ImportModal({ open, deals, onClose, onCommit, toast }) {
  const [importRows, setImportRows] = useState(null);
  const [importHeaders, setImportHeaders] = useState(null);
  const [mapping, setMapping] = useState({});
  const [pasteText, setPasteText] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState('');
  const fileInputRef = useRef(null);

  if (!open) return null;

  function reset() {
    setImportRows(null); setImportHeaders(null); setMapping({}); setPasteText(''); setStatus('');
  }
  function handleClose() { reset(); onClose(); }

  function loadGrid(grid) {
    if (!grid || grid.length < 2) { toast('Need a header row plus at least one data row'); return; }
    let hIdx = 0, best = 0;
    grid.slice(0, 12).forEach((r, i) => {
      const score = r.filter((c) => FIELDS.some((f) => f.hints.some((h) => String(c).toLowerCase().trim() === h || String(c).toLowerCase().includes(h)))).length;
      if (score > best) { best = score; hIdx = i; }
    });
    const headers = grid[hIdx].map((h) => String(h).trim());
    const rows = grid.slice(hIdx + 1).filter((r) => r.some((c) => String(c).trim()));
    const map = {};
    FIELDS.forEach((f) => { const g = guessCol(f, headers); if (g >= 0) map[f.k] = g; });
    setImportHeaders(headers); setImportRows(rows); setMapping(map);
    setStatus(rows.length + ' rows found');
  }

  function readFile(file) {
    const name = file.name.toLowerCase();
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        if (name.endsWith('.csv') || name.endsWith('.tsv')) {
          const txt = e.target.result;
          const delim = name.endsWith('.tsv') ? '\t' : (txt.split('\n')[0].includes('\t') ? '\t' : ',');
          loadGrid(txt.split(/\r?\n/).filter((x) => x.trim()).map((l) => splitLine(l, delim)));
        } else {
          const wb = XLSX.read(e.target.result, { type: 'array', cellDates: true });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const grid = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: '' });
          loadGrid(grid.filter((r) => r.some((c) => String(c).trim())));
        }
      } catch (err) {
        console.error(err);
        toast('Could not read that file');
      }
    };
    if (name.endsWith('.csv') || name.endsWith('.tsv')) reader.readAsText(file); else reader.readAsArrayBuffer(file);
  }

  function buildImportRecords() {
    return (importRows || []).map((r) => {
      const rec = {
        id: uid(), stage: 'research', bidPct: DEFAULT_BID_PCT, sellPct: DEFAULT_SELL_PCT,
        renoBudget: 0, renoSpent: 0, holding: 0, purchasePrice: 0, contractPrice: 0, salePrice: 0, arv: 0,
        source: 'Imported', updated: Date.now(),
      };
      for (const [k, i] of Object.entries(mapping)) {
        if (i === undefined || i < 0) continue;
        let v = r[i] == null ? '' : String(r[i]).trim();
        if (k === 'auctionDate') v = parseDateCell(v);
        else if (NUM_FIELDS.includes(k)) v = n(v);
        rec[k] = v;
      }
      if (rec.stateAb) rec.stateAb = String(rec.stateAb).slice(0, 2).toUpperCase();
      return rec;
    }).filter((r) => r.address);
  }

  const recs = importRows ? buildImportRecords() : [];
  const existing = new Set(deals.map((d) => (d.address || '').toLowerCase().replace(/\s+/g, ' ').trim()));
  const dupes = recs.filter((r) => existing.has(r.address.toLowerCase().replace(/\s+/g, ' ').trim())).length;
  const sample = recs[0];

  function handleParsePaste() {
    const txt = pasteText.trim();
    if (!txt) { toast('Paste some rows first'); return; }
    const delim = txt.split('\n')[0].includes('\t') ? '\t' : ',';
    const lines = txt.split(/\r?\n/).filter((x) => x.trim());
    loadGrid(lines.map((l) => splitLine(l, delim)));
  }

  function handleCommit() {
    const fresh = recs.filter((r) => !existing.has(r.address.toLowerCase().replace(/\s+/g, ' ').trim()));
    if (!fresh.length) { toast('Nothing new to import'); return; }
    onCommit(fresh);
    handleClose();
  }

  return (
    <motion.div className="modal open" id="importModal"
      initial={{ opacity: 0, scale: 0.97, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 8 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}>
      <div className="modal-head">
        <h2>Import auction list</h2>
        <button className="btn btn-sm" onClick={handleClose}>Close</button>
      </div>
      <div className="modal-body" data-lenis-armable>
        <div className={'drop' + (dragOver ? ' over' : '')}
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) readFile(e.dataTransfer.files[0]); }}>
          Drop your .xlsx, .xls or .csv here, or click to choose a file.<br />
          <span style={{ color: 'var(--dim)' }}>Works with an auction.com export or a county foreclosure list.</span>
          <input type="file" accept=".xlsx,.xls,.csv,.tsv" hidden ref={fileInputRef}
            onChange={(e) => { if (e.target.files[0]) readFile(e.target.files[0]); e.target.value = ''; }} />
        </div>
        <div style={{ margin: '16px 0 8px' }} className="lab">Or paste rows, tab or comma separated, with a header row</div>
        <textarea className="paste" placeholder={'Address\tCity\tCounty\tSale Date\tOpening Bid\n123 Main St\tAtlanta\tFulton\t2026-09-01\t142000'}
          value={pasteText} onChange={(e) => setPasteText(e.target.value)}></textarea>
        <div style={{ marginTop: 10 }}><button className="btn btn-sm" onClick={handleParsePaste}>Read pasted rows</button></div>
        {importRows && (
          <div id="mapArea">
            <div className="fs-title" style={{ marginTop: 24 }}>Match your columns</div>
            <div className="map-grid">
              {FIELDS.map((f) => (
                <div className="f" key={f.k}>
                  <label>{f.label}</label>
                  <select className="inp" value={mapping[f.k] ?? -1}
                    onChange={(e) => setMapping((m) => ({ ...m, [f.k]: Number(e.target.value) }))}>
                    <option value={-1}>— skip —</option>
                    {importHeaders.map((h, i) => <option value={i} key={i}>{h || 'column ' + (i + 1)}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, fontFamily: 'var(--mono)', fontSize: '11.5px', color: 'var(--dim)' }}>
              {recs.length} properties with an address · {dupes} already on file will be skipped
              {sample && (
                <><br />First row reads as: <span style={{ color: 'var(--paper)' }}>
                  {sample.address}{sample.city ? ', ' + sample.city : ''}{sample.auctionDate ? ' · sale ' + fmtDate(sample.auctionDate) : ''}{sample.openingBid ? ' · opening ' + money(sample.openingBid) : ''}
                </span></>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="modal-foot">
        <button className="btn btn-primary" disabled={!importRows} onClick={handleCommit}>Import properties</button>
        <span className="lab">{status}</span>
      </div>
    </motion.div>
  );
}
