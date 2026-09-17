'use client';
// Ported from Acquisitions_Center_LIVE.html — the shell: masthead, tape, nav, controls,
// results-line, view switch, drawer/import modal orchestration, toast, boot.

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import {
  STAGES, STAGE_BY_ID, VIEWS, PERIODS, PREBID_STAGES, ACTIVE_STAGES, OWNED_STAGES, OPEN_BID_STAGES,
  DEFAULT_BID_PCT, DEFAULT_SELL_PCT, isOwned,
} from './constants';
import { calc, money, moneyShort, pct, sum, avg, n, today, uid } from './helpers';
import { loadDeals, updateDeal, createDeal, createDeals, deleteDeal as deleteDealRecord } from './supabaseApi';
import { canCreateProperty, CAN_DELETE_ROLES } from '@/lib/permissions/fieldGroups';
import { ACQUISITIONS_CSS } from './styles';
import { PrebidView, BidSheetView, PipelineBoard, LedgerView } from './views';
import { ReportsView } from './reports';
import { WorkbookView } from './workbook';
import PropertyDrawer from './PropertyDrawer';
import ImportModal from './ImportModal';
import ConfirmModal from './ConfirmModal';

const BRAND_TEXT = 'OakFlow — Property Operations';

function periodRangeFor(period, repFrom, repTo) {
  const now = new Date(); const y = now.getFullYear();
  const iso = (d) => d.toISOString().slice(0, 10);
  switch (period) {
    case 'ytd': return [y + '-01-01', today()];
    case 'q': { const qs = Math.floor(now.getMonth() / 3) * 3; return [iso(new Date(y, qs, 1)), today()]; }
    case 'l12': { const d = new Date(now); d.setFullYear(y - 1); return [iso(d), today()]; }
    case 'ly': return [(y - 1) + '-01-01', (y - 1) + '-12-31'];
    case 'custom': return [repFrom || '1900-01-01', repTo || today()];
    default: return ['1900-01-01', '2999-12-31'];
  }
}
function inPeriodFor(period, repFrom, repTo) {
  return (d, field) => {
    if (period === 'all') return true;
    const [f, t] = periodRangeFor(period, repFrom, repTo);
    const v = d[field || 'closedDate'];
    return v && v >= f && v <= t;
  };
}

function filtered(deals, f, opts = {}) {
  const q = f.q.trim().toLowerCase();
  const rows = deals.filter((d) => {
    if (q) {
      const hay = [d.address, d.city, d.county, d.stateAb, d.case, d.notes, d.source, d.buyer, d.owner, d.bank, d.attorney].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (f.stages.size && !f.stages.has(d.stage)) return false;
    if (f.county !== 'all' && (d.county || '') !== f.county) return false;
    const pv = n(d[f.priceField]);
    if (f.min !== '' && pv < n(f.min)) return false;
    if (f.max !== '' && (pv === 0 || pv > n(f.max))) return false;
    if (!opts.skipDates) {
      const dv = d[f.dateField] || '';
      if (f.from && (!dv || dv < f.from)) return false;
      if (f.to && (!dv || dv > f.to)) return false;
    }
    return true;
  });
  return rows.sort((a, b) => sorter(a, b, f.sort));
}
function sorter(a, b, sortKey) {
  const ca = calc(a), cb = calc(b);
  switch (sortKey) {
    case 'spread': return cb.profit - ca.profit;
    case 'margin': return cb.margin - ca.margin;
    case 'roi': return cb.roi - ca.roi;
    case 'price': return n(b.purchasePrice) - n(a.purchasePrice);
    case 'address': return (a.address || '').localeCompare(b.address || '');
    case 'updated': return (b.updated || 0) - (a.updated || 0);
    default: return (a.auctionDate || '9999').localeCompare(b.auctionDate || '9999') || (a.address || '').localeCompare(b.address || '');
  }
}

const initialFilters = {
  view: 'pipeline', q: '', stages: new Set(), county: 'all',
  priceField: 'openingBid', min: '', max: '',
  dateField: 'auctionDate', from: '', to: '', sort: 'saledate',
  period: 'ytd', repFrom: '', repTo: '', bidDate: '',
  wbPeriod: 'ytd', wbFrom: '', wbTo: '',
};

export default function AcquisitionsApp() {
  const [deals, setDeals] = useState([]);
  // Starts null (not a permissive default) deliberately: this page is shared by admin/
  // disposition/title, and assuming permissive defaults would flash a "+ Property" button at a
  // disposition/title user for the instant before their real permissions load. null reads as "not
  // yet confirmed", so canCreate below stays false until we actually know. Holds the full profile
  // shape my-assignments returns (role + the four individual permission flags) — individual
  // permissions, not just role, decide what this user can actually do (see fieldGroups.js).
  const [myProfile, setMyProfile] = useState(null);
  const [sampleNoteHidden, setSampleNoteHidden] = useState(true);
  const [filters, setFilters] = useState(initialFilters);
  const [drawer, setDrawer] = useState({ open: false, editingId: null, form: null });
  const [importOpen, setImportOpen] = useState(false);
  const [confirmState, setConfirmState] = useState(null);
  const [toast, setToastState] = useState({ msg: '', show: false });
  // Rendered into the print letterhead. Left null on the server and filled in after mount —
  // computing new Date() directly during render produced a different string at server-render
  // time vs. client-hydration time (different wall-clock moment), which is a real React
  // hydration mismatch, not just a cosmetic one.
  const [printGeneratedAt, setPrintGeneratedAt] = useState(null);
  const toastTimer = useRef(null);
  const searchRef = useRef(null);

  // Same real Supabase sign-out every other role uses (Module 03) — this page had no sign-out
  // affordance at all before, unlike Auction Pipeline/Partner Portal, which both already had one.
  async function handleLogout() {
    try { await createClient().auth.signOut(); } catch (e) { /* ignore */ }
    window.location.href = '/';
  }

  function showToast(msg) {
    setToastState({ msg, show: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastState((s) => ({ ...s, show: false })), 1900);
  }

  async function load() {
    try {
      const d = await loadDeals();
      setDeals(d);
      setSampleNoteHidden(true);
    } catch (e) {
      console.error(e);
      setSampleNoteHidden(false);
      showToast('Could not load properties — check your connection and try again.');
    }
  }

  // ---- boot ----
  useEffect(() => {
    load();
    setPrintGeneratedAt(new Date());
    fetch('/api/my-assignments').then((r) => r.json()).then((d) => setMyProfile(d)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // canCreate now reflects this user's individual perm_create_property flag, not just role —
  // an admin could grant create rights to a specific Disposition/Title user without changing
  // their role. The API independently re-enforces this regardless of what the UI shows; this just
  // keeps someone without the permission from being offered an action the server will 403 anyway.
  // canDelete stays role-only (delete was never part of the individual-permissions feature).
  const canCreate = canCreateProperty(myProfile);
  const canDelete = !!myProfile && CAN_DELETE_ROLES.includes(myProfile.role);

  useEffect(() => {
    function onKeydown(e) {
      if (e.key === 'Escape') { closeDrawer(); setImportOpen(false); }
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        if (searchRef.current) searchRef.current.focus();
      }
    }
    document.addEventListener('keydown', onKeydown);
    return () => document.removeEventListener('keydown', onKeydown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mirrors the original's refreshCounties(): if the selected county filter no longer exists
  // in the loaded deals, fall back to "all".
  useEffect(() => {
    const list = [...new Set(deals.map((d) => d.county).filter(Boolean))];
    if (filters.county !== 'all' && !list.includes(filters.county)) {
      setFilters((f) => ({ ...f, county: 'all' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deals]);

  // ---- drawer ----
  function openDrawer(id) {
    const d = id ? deals.find((x) => x.id === id) : { stage: 'acquired', stateAb: 'GA' };
    setDrawer({ open: true, editingId: id || null, form: { ...d } });
  }
  function closeDrawer() { setDrawer({ open: false, editingId: null, form: null }); }
  function updateDrawerField(k, v) { setDrawer((s) => ({ ...s, form: { ...s.form, [k]: v } })); }

  // ---- documents (photos / title report) ----
  // Same Storage-then-record pattern as Auction Pipeline's AuctionPipeline.jsx — direct
  // browser-to-Storage upload under the caller's own session (Storage RLS enforces "only if you
  // can access this property"), then /api/properties/[id]/documents records the resulting path
  // and hands back a fresh signed URL. Kept as local setDeals state here, not Redux — Property
  // Operations deliberately doesn't share Pipeline's store (see dbMapping.js's dbRowToDeal()).
  const DOCUMENTS_BUCKET = 'property-documents';

  async function uploadDocument(propertyId, file, kind /* 'photo' | 'titleReport' */) {
    const docId = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const folder = kind === 'photo' ? 'photos' : 'title-reports';
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${propertyId}/${folder}/${docId}-${safeName}`;

    const { error: uploadError } = await createClient().storage
      .from(DOCUMENTS_BUCKET)
      .upload(path, file, { contentType: file.type || undefined });
    if (uploadError) throw uploadError;

    const res = await fetch(`/api/properties/${propertyId}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: kind, id: docId, path, filename: file.name }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Could not save the uploaded document.');
    return kind === 'photo' ? data.photos : data.title_report;
  }

  // Updates both the deals list (so the change survives closing the drawer) and the drawer's own
  // form (so it's reflected immediately without waiting for a reload).
  function applyDocumentChange(propertyId, changes) {
    setDeals((prev) => prev.map((x) => (x.id === propertyId ? { ...x, ...changes } : x)));
    setDrawer((s) => (s.editingId === propertyId ? { ...s, form: { ...s.form, ...changes } } : s));
  }

  async function handlePhotoUpload(propertyId, fileList) {
    const files = Array.from(fileList);
    try {
      let photos;
      for (const file of files) photos = await uploadDocument(propertyId, file, 'photo');
      applyDocumentChange(propertyId, { photos });
      showToast(`Uploaded ${files.length} photo${files.length === 1 ? '' : 's'}.`);
    } catch (e) {
      showToast(e.message || 'Could not upload photo(s) — check your connection and try again.');
    }
  }
  async function handleTitleReportUpload(propertyId, fileList) {
    const files = Array.from(fileList);
    try {
      let titleReports;
      for (const file of files) titleReports = await uploadDocument(propertyId, file, 'titleReport');
      applyDocumentChange(propertyId, { titleReports });
      showToast(`Uploaded ${files.length} file${files.length === 1 ? '' : 's'}.`);
    } catch (e) {
      showToast(e.message || 'Could not upload the title report — check your connection and try again.');
    }
  }
  async function removeDocument(propertyId, documentId, kind, stateField) {
    try {
      const res = await fetch(`/api/properties/${propertyId}/documents`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: kind, documentId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not remove that document.');
      applyDocumentChange(propertyId, { [stateField]: kind === 'photo' ? data.photos : data.title_report });
    } catch (e) {
      showToast(e.message || 'Could not remove that document — check your connection and try again.');
    }
  }
  function removePhoto(propertyId, index) {
    const doc = deals.find((x) => x.id === propertyId)?.photos?.[index];
    if (doc) removeDocument(propertyId, doc.id, 'photo', 'photos');
  }
  function removeTitleReport(propertyId, index) {
    const doc = deals.find((x) => x.id === propertyId)?.titleReports?.[index];
    if (doc) removeDocument(propertyId, doc.id, 'titleReport', 'titleReports');
  }

  async function saveDeal() {
    const d = { ...drawer.form };
    if (!d.address) { showToast('Add a street address first'); return; }
    if (isOwned(d) && !d.acquiredDate) d.acquiredDate = d.auctionDate || today();
    if (d.stage === 'sold' && !d.closedDate) d.closedDate = today();
    try {
      if (drawer.editingId) {
        const merged = { ...d, id: drawer.editingId, updated: Date.now() };
        await updateDeal(drawer.editingId, merged);
        setDeals((prev) => prev.map((x) => (x.id === drawer.editingId ? merged : x)));
        showToast('Saved');
      } else {
        const newDeal = await createDeal(d);
        setDeals((prev) => [newDeal, ...prev]);
        showToast('Property added');
      }
      closeDrawer();
    } catch (e) {
      showToast('Could not save — check your connection and try again.');
    }
  }
  function deleteDeal() {
    if (!drawer.editingId) return;
    const id = drawer.editingId;
    const d = deals.find((x) => x.id === id);
    setConfirmState({
      title: 'Delete property?',
      message: (d?.address || 'This property') + ' will be removed entirely. This cannot be undone.',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        setConfirmState(null);
        try {
          await deleteDealRecord(id);
          setDeals((prev) => prev.filter((x) => x.id !== id));
          closeDrawer();
          showToast('Deleted');
        } catch (e) {
          showToast('Could not delete — check your connection and try again.');
        }
      },
    });
  }

  // ---- prebid quick-edit / ready toggle ----
  // NOTE: matches the original exactly — these quick edits update the in-memory list only
  // (never persisted to the backend), so a hard refresh discards them.
  function prebidFieldChange(id, field, value) {
    setDeals((prev) => prev.map((d) => {
      if (d.id !== id) return d;
      const updated = { ...d, [field]: n(value), updated: Date.now() };
      if (!n(updated.arv) && updated.stage === 'bidready') updated.stage = 'research';
      return updated;
    }));
  }
  function toggleReady(id) {
    const d = deals.find((x) => x.id === id);
    if (!d) return;
    if (d.stage !== 'bidready' && !n(d.arv)) { showToast('Add an ARV before marking it bid ready'); return; }
    setDeals((prev) => prev.map((x) => (x.id === id ? { ...x, stage: x.stage === 'bidready' ? 'research' : 'bidready', updated: Date.now() } : x)));
  }

  // ---- bid sheet outcomes ----
  function bidWon(id, amtStr) {
    const d = deals.find((x) => x.id === id);
    if (!d) return;
    const amt = n(amtStr) || calc(d).maxBid;
    if (!amt) { showToast('Enter the final bid amount'); return; }
    setDeals((prev) => prev.map((x) => (x.id === id ? { ...x, purchasePrice: amt, stage: 'acquired', acquiredDate: x.auctionDate || today(), updated: Date.now() } : x)));
    showToast('Won ' + d.address + ' at ' + money(amt));
  }
  function bidLost(id, amtStr) {
    const d = deals.find((x) => x.id === id);
    if (!d) return;
    setDeals((prev) => prev.map((x) => (x.id === id ? { ...x, winningBid: n(amtStr), stage: 'outbid', updated: Date.now() } : x)));
    showToast('Marked outbid: ' + d.address);
  }
  function bidUndo(id) {
    setDeals((prev) => prev.map((x) => (x.id === id ? { ...x, stage: 'bidready', purchasePrice: 0, winningBid: 0, acquiredDate: '', updated: Date.now() } : x)));
    showToast('Outcome cleared');
  }

  // ---- board ----
  async function moveDeal(id, stage) {
    const d = deals.find((x) => x.id === id);
    if (!d || d.stage === stage) return;
    const updated = { ...d, stage, updated: Date.now() };
    if (stage === 'acquired') {
      if (!updated.acquiredDate) updated.acquiredDate = updated.auctionDate || today();
      if (!n(updated.purchasePrice)) updated.purchasePrice = calc(updated).maxBid;
    }
    if (stage === 'listed' && !updated.listedDate) updated.listedDate = today();
    if (stage === 'sold') {
      if (!updated.closedDate) updated.closedDate = today();
      if (!n(updated.salePrice)) updated.salePrice = n(updated.contractPrice) || n(updated.arv);
      if (!n(updated.renoSpent)) updated.renoSpent = n(updated.renoBudget);
    }
    setDeals((prev) => prev.map((x) => (x.id === id ? updated : x)));
    showToast(d.address + ' → ' + STAGE_BY_ID[stage].name);
    try {
      await updateDeal(d.id, updated);
    } catch (e) {
      showToast('Could not save that move — check your connection and try again.');
    }
  }

  // ---- ledger sort ----
  function ledgerSort(col) {
    const map = { price: 'price', spread: 'spread', margin: 'margin', roi: 'roi', address: 'address', saledate: 'saledate' };
    if (map[col]) setFilters((f) => ({ ...f, sort: map[col] }));
  }

  // ---- import ----
  // fresh comes from ImportModal with client-generated placeholder ids (uid()) — those are never
  // written anywhere, only real Supabase-assigned ids from createDeals() go into state, so a
  // later edit/move on one of these rows targets a row that actually exists in the database.
  async function commitImport(fresh) {
    try {
      const created = await createDeals(fresh);
      setDeals((prev) => created.concat(prev));
      setFilters((f) => ({ ...f, view: 'prebid' }));
      showToast('Imported ' + created.length + ' properties');
    } catch (e) {
      showToast('Import failed — check your connection and try again.');
    }
  }

  // ---- export / print / refresh ----
  function exportCSV() {
    const rows = ['reports', 'workbook'].includes(filters.view) ? filtered(deals, filters, { skipDates: true }) : filtered(deals, filters);
    const head = ['Address', 'City', 'State', 'Zip', 'County', 'Stage', 'Sale date', 'Opening bid', 'Mortgage balance',
      'ARV', 'Reno budget', 'Holding', 'Purchase price', 'Reno spent',
      'All-in basis', 'Contract price', 'Sale price', 'Profit', 'Margin %', 'ROI %', 'Days held', 'Days on market',
      'Acquired', 'Listed', 'Expected Closing (COE)', 'Closed', 'Beds', 'Baths', 'Sqft', 'Year', 'Trustee', 'Buyer side', 'Notes'];
    const body = rows.map((d) => {
      const c = calc(d);
      return [d.address, d.city, d.stateAb, d.zip, d.county, STAGE_BY_ID[d.stage].name, d.auctionDate, n(d.openingBid), n(d.unpaid),
        n(d.arv), n(d.renoBudget), Math.round(c.holding),
        n(d.purchasePrice), n(d.renoSpent), Math.round(c.useBasis), n(d.contractPrice), n(d.salePrice),
        Math.round(c.profit), Math.round(c.margin * 100), Math.round(c.roi * 100),
        c.held ?? '', c.dom ?? '', d.acquiredDate, d.listedDate, d.expectedClosing, d.closedDate, d.beds, d.baths, d.sqft, d.year,
        d.attorney, d.buyer, d.notes];
    });
    const csv = [head, ...body].map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = 'acquisitions-center-' + today() + '.csv'; a.click(); URL.revokeObjectURL(url);
    showToast('Exported ' + rows.length + ' properties');
  }
  function doPrint() {
    if (!['reports', 'workbook'].includes(filters.view)) {
      setFilters((f) => ({ ...f, view: 'reports' }));
    }
    setPrintGeneratedAt(new Date());
    setTimeout(() => window.print(), 150);
  }
  async function refresh() {
    showToast('Reloading…');
    await load();
  }
  function resetFilters() {
    setFilters((f) => ({
      ...f, q: '', stages: new Set(), county: 'all', priceField: 'openingBid', min: '', max: '',
      dateField: 'auctionDate', from: '', to: '', sort: 'saledate',
    }));
    showToast('Filters reset');
  }

  // ================= derived (recomputed every render, mirrors the original's render()) =================
  const rows = filtered(deals, filters);
  const tapeRows = filtered(deals, filters, { skipDates: true });
  const owned = rows.filter(isOwned);
  const prebidRows = rows.filter((d) => PREBID_STAGES.includes(d.stage));
  const totalOwned = deals.filter(isOwned).length;
  const totalPrebid = deals.filter((d) => PREBID_STAGES.includes(d.stage)).length;
  const inPeriod = inPeriodFor(filters.period, filters.repFrom, filters.repTo);
  const wbInPeriod = inPeriodFor(filters.wbPeriod, filters.wbFrom, filters.wbTo);
  const [pf, pt] = periodRangeFor(filters.period, filters.repFrom, filters.repTo);
  const periodText = filters.period === 'all' ? 'Everything on record' : `${fmtShort(pf)} – ${fmtShort(pt)}`;
  const [wbPf, wbPt] = periodRangeFor(filters.wbPeriod, filters.wbFrom, filters.wbTo);
  const wbPeriodText = filters.wbPeriod === 'all' ? 'Everything on record' : `${fmtShort(wbPf)} – ${fmtShort(wbPt)}`;
  const countyList = [...new Set(deals.map((d) => d.county).filter(Boolean))].sort();
  const effectiveCounty = countyList.includes(filters.county) ? filters.county : 'all';

  // tape
  const reno = tapeRows.filter((d) => d.stage === 'reno');
  const active = tapeRows.filter((d) => ACTIVE_STAGES.includes(d.stage));
  const soldAll = tapeRows.filter((d) => d.stage === 'sold');
  const yStart = new Date().getFullYear() + '-01-01';
  const soldYtd = soldAll.filter((d) => d.closedDate && d.closedDate >= yStart);
  const renoIn = sum(reno, (d) => calc(d).basis);
  const renoLeft = sum(reno, (d) => Math.max(0, n(d.renoBudget) - n(d.renoSpent)));
  const deployed = sum(active, (d) => calc(d).basis);
  const returned = sum(soldAll, (d) => n(d.salePrice));
  const pipeProfit = sum(active, (d) => calc(d).profit);
  const allProfit = sum(soldAll, (d) => calc(d).profit);
  const ytdProfit = sum(soldYtd, (d) => calc(d).profit);
  const ytdVol = sum(soldYtd, (d) => n(d.salePrice));
  const avgRoi = avg(soldAll.map((d) => calc(d).roi));
  const avgProfit = soldAll.length ? allProfit / soldAll.length : 0;
  const tapeCells = [
    { k: 'In reno', v: String(reno.length), sub: moneyShort(renoIn) + ' in · ' + moneyShort(renoLeft) + ' left to spend', cls: 'amber', lead: 'lead reno' },
    { k: 'Active homes', v: String(active.length), sub: moneyShort(deployed) + ' deployed · ' + moneyShort(pipeProfit) + ' projected', cls: 'steel', lead: 'lead active' },
    { k: 'Sold', v: soldAll.length, small: soldYtd.length + ' YTD', sub: moneyShort(ytdVol) + ' YTD volume', cls: 'jade', lead: 'lead sold' },
    { k: 'Avg ROI', v: pct(avgRoi), sub: 'per closed home · all time', cls: avgRoi >= 0 ? 'jade' : 'ox', title: 'ROI = Return on Investment — profit as a percentage of total cash invested (purchase + reno + carry)' },
    { k: 'Realized profit', v: moneyShort(allProfit), sub: moneyShort(ytdProfit) + ' YTD · ' + moneyShort(avgProfit) + ' avg/home', cls: allProfit >= 0 ? 'jade' : 'ox' },
    { k: 'Capital deployed', v: moneyShort(deployed), sub: 'purchase + reno + carry · owned, not sold', cls: 'brass' },
    { k: 'Capital returned', v: moneyShort(returned), sub: 'gross sale proceeds · sold homes', cls: 'jade' },
  ];

  // nav counts
  const navCounts = {
    pipeline: deals.filter((d) => ACTIVE_STAGES.includes(d.stage)).length,
    ledger: deals.filter(isOwned).length, reports: '', workbook: '',
  };

  // stage chips
  const chipScope = filters.view === 'prebid' ? PREBID_STAGES : OWNED_STAGES;
  const chipCounts = Object.fromEntries(STAGES.map((s) => [s.id, deals.filter((d) => d.stage === s.id).length]));
  const shownChips = STAGES.filter((s) => chipScope.includes(s.id));
  const activeStages = [...filters.stages].filter((s) => chipScope.includes(s));

  function toggleStageChip(id) {
    setFilters((f) => {
      const s = new Set(f.stages);
      if (id === '__all') s.clear();
      else if (s.has(id)) s.delete(id); else s.add(id);
      return { ...f, stages: s };
    });
  }

  const controlsHidden = ['bid', 'reports', 'workbook'].includes(filters.view);
  const resultsHidden = ['bid', 'workbook'].includes(filters.view);

  return (
    <div>
      {/* dangerouslySetInnerHTML, not a raw string child: <style> is an HTML "raw text"
          element (browsers never decode entities inside it), but React's server renderer
          HTML-escapes plain string children like any other text node. `<style>{css}</style>`
          therefore renders quotes/`>` as `&#x27;`/`&gt;` on the server while the client's DOM
          has the literal characters — a guaranteed hydration mismatch for any CSS containing
          a quoted font-family or an attribute/child-combinator selector (this one has both).
          dangerouslySetInnerHTML skips escaping identically on both sides. */}
      <style dangerouslySetInnerHTML={{ __html: ACQUISITIONS_CSS }} />

      <header className="masthead">
        <a className="brand" href="/" title="Back to the OakFlow home screen">
          <div className="brand-icon" aria-hidden="true">
            <svg width="19" height="19" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M4 14.5c4.5 0 7-2.2 8.4-5.1" />
              <path d="M10 16.5c0-5.2 2.6-8.6 6-10" />
              <path d="M3.5 8.5c3 0 5-1.1 6.2-3" />
            </svg>
          </div>
          <div>
            <h1><span className="brand-a">Oak</span><span className="brand-b">Flow</span></h1>
            <div className="brand-tag">Property Operations</div>
          </div>
        </a>
        <div className="mast-actions">
          <button className="btn" title="Reload the latest data" onClick={refresh}>Refresh</button>
          <button className="btn" onClick={doPrint}>Print</button>
          <button className="btn" onClick={exportCSV}>Export CSV</button>
          {canCreate && <button className="btn btn-primary" onClick={() => openDrawer(null)}>+ Property</button>}
          <button className="btn" onClick={handleLogout}>&#128274; Log Out</button>
        </div>
      </header>

      <div className="print-letterhead" id="printLetterhead">
        <div className="pl-row">
          <div className="pl-brand">{BRAND_TEXT}</div>
          <div className="pl-title">Portfolio &amp; Performance Report</div>
        </div>
        <div className="pl-meta">
          <span>Reporting period: {filters.view === 'workbook' ? wbPeriodText : periodText}</span>
          <span>{printGeneratedAt ? `Generated ${printGeneratedAt.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}` : ''}</span>
        </div>
      </div>

      {/* Conditional rendering, not the `hidden` attribute: .note has its own `display:flex`,
          which ties with the browser's default `[hidden]{display:none}` on CSS specificity —
          author style wins on a tie, so `hidden` was never actually hiding this element
          regardless of sampleNoteHidden's real value. */}
      {!sampleNoteHidden && (
        <div className="note" id="sampleNote">
          <span><b>Could not load properties.</b> Showing the last data loaded in this browser. Click Refresh to try again.</span>
        </div>
      )}

      <section className="tape" id="tape">
        {tapeCells.map((c) => (
          <div className={'tape-cell ' + (c.lead || '')} key={c.k} title={c.title}>
            <div className="k">{c.k}</div>
            <div className={'v ' + c.cls}>{c.v}{c.small ? <small>{c.small}</small> : null}</div>
            <div className="s">{c.sub}</div>
          </div>
        ))}
      </section>

      <nav className="nav" id="nav" role="tablist">
        {VIEWS.map((v) => (
          <button key={v.id} role="tab" aria-selected={filters.view === v.id}
            onClick={() => { setFilters((f) => ({ ...f, view: v.id })); window.scrollTo({ top: 0 }); }}>
            {v.name}{navCounts[v.id] !== '' ? <span className="count">{navCounts[v.id]}</span> : null}
          </button>
        ))}
      </nav>

      <section className="controls" id="controls" hidden={controlsHidden}>
        <div className="ctl-row">
          <div className="search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M16.5 16.5 21 21" /></svg>
            <input ref={searchRef} type="search" placeholder="Search address, city, county, case no., owner, bank, attorney, notes…" autoComplete="off"
              value={filters.q} onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))} />
          </div>
          <div className="field">
            <label>Sort</label>
            <select className="inp" value={filters.sort} onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}>
              <option value="saledate">Sale date</option>
              <option value="updated">Recently changed</option>
              <option value="spread">Profit, high to low</option>
              <option value="roi">ROI, high to low</option>
              <option value="margin">Margin %, high to low</option>
              <option value="price">Purchase, high to low</option>
              <option value="address">Address A–Z</option>
            </select>
          </div>
        </div>
        <div className="ctl-row">
          <div className="chips">
            {shownChips.map((s) => (
              <button key={s.id} className="chip" aria-pressed={activeStages.includes(s.id)} onClick={() => toggleStageChip(s.id)}>
                <span className="dot" style={{ background: s.color }}></span>{s.name} {chipCounts[s.id]}
              </button>
            ))}
            <button className="chip" aria-pressed={activeStages.length === 0} onClick={() => toggleStageChip('__all')}>All stages</button>
          </div>
        </div>
        <div className="ctl-row">
          <div className="field">
            <label>County</label>
            <select className="inp" value={effectiveCounty} onChange={(e) => setFilters((f) => ({ ...f, county: e.target.value }))}>
              <option value="all">All</option>
              {countyList.map((c) => <option value={c} key={c}>{c}</option>)}
            </select>
          </div>
          <div className="sep"></div>
          <div className="field">
            <label>Price</label>
            <select className="inp" value={filters.priceField} onChange={(e) => setFilters((f) => ({ ...f, priceField: e.target.value }))}>
              <option value="openingBid">Opening bid</option>
              <option value="purchasePrice">Purchase</option>
              <option value="arv">ARV</option>
              <option value="salePrice">Sale</option>
            </select>
            <input className="inp num" type="number" placeholder="min" inputMode="numeric" value={filters.min} onChange={(e) => setFilters((f) => ({ ...f, min: e.target.value }))} />
            <input className="inp num" type="number" placeholder="max" inputMode="numeric" value={filters.max} onChange={(e) => setFilters((f) => ({ ...f, max: e.target.value }))} />
          </div>
          <div className="sep"></div>
          <div className="field">
            <label>Dates</label>
            <select className="inp" value={filters.dateField} onChange={(e) => setFilters((f) => ({ ...f, dateField: e.target.value }))}>
              <option value="auctionDate">Sale date</option>
              <option value="acquiredDate">Acquired</option>
              <option value="listedDate">Listed</option>
              <option value="closedDate">Closed</option>
            </select>
            <input className="inp date" type="date" value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} />
            <input className="inp date" type="date" value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} />
          </div>
          <button className="btn btn-sm" onClick={resetFilters}>Reset filters</button>
        </div>
      </section>

      <div className="results-line" id="resultsLine" hidden={resultsHidden}>
        {filters.view === 'reports' ? (
          <><span>Portfolio reports cover the {totalOwned} homes you won. Auction performance covers everything you bid on.</span><span>Profit is net of reno, carry and selling costs</span></>
        ) : filters.view === 'prebid' ? (
          <><span>Showing {prebidRows.length} of {totalPrebid} pre-bid properties · {money(sum(prebidRows.filter((d) => d.stage === 'bidready'), (d) => calc(d).maxBid))} of max bid exposure</span>
            <span>Only homes you win move into the portfolio</span></>
        ) : (
          <><span>Showing {owned.length} of {totalOwned} homes you won · {money(sum(owned, (d) => calc(d).useBasis))} of basis in view</span>
            <span>Bar spans ARV · fill is your basis · tick is max bid</span></>
        )}
      </div>

      <main>
      <AnimatePresence mode="wait">
      <motion.div key={filters.view}
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}>
        {filters.view === 'prebid' && (
          <section id="v_prebid">
            <PrebidView rows={rows} onOpenDrawer={openDrawer} onFieldChange={prebidFieldChange} onToggleReady={toggleReady} />
          </section>
        )}
        {filters.view === 'bid' && (
          <section id="v_bid" className="bidsheet">
            <BidSheetView deals={deals} bidDate={filters.bidDate} onBidDateChange={(v) => setFilters((f) => ({ ...f, bidDate: v }))}
              onOpenDrawer={openDrawer} onWon={bidWon} onLost={bidLost} onUndo={bidUndo} onPrintBid={() => setTimeout(() => window.print(), 150)} />
          </section>
        )}
        {filters.view === 'pipeline' && (
          <section id="v_pipeline" className="board">
            <PipelineBoard rows={owned} onOpenDrawer={openDrawer} onAdvance={(id) => {
              const d = deals.find((x) => x.id === id);
              const stagesOrder = STAGES.filter((s) => OWNED_STAGES.includes(s.id));
              const i = stagesOrder.findIndex((s) => s.id === d.stage);
              if (i >= 0 && i < stagesOrder.length - 1) moveDeal(id, stagesOrder[i + 1].id); else showToast('Already sold');
            }} onMoveDeal={moveDeal} />
          </section>
        )}
        {filters.view === 'ledger' && (
          <section id="v_ledger" className="tw">
            <LedgerView rows={owned} sort={filters.sort} onSort={ledgerSort} onOpenDrawer={openDrawer} />
          </section>
        )}
        {filters.view === 'reports' && (
          <section id="v_reports">
            <div className="period-bar">
              <span className="lab">Reporting period</span>
              <div className="chips">
                {PERIODS.map((p) => (
                  <button key={p.id} className="chip" aria-pressed={filters.period === p.id} onClick={() => setFilters((f) => ({ ...f, period: p.id }))}>{p.name}</button>
                ))}
              </div>
              {filters.period === 'custom' && (
                <div className="field">
                  <input className="inp date" type="date" value={filters.repFrom} onChange={(e) => setFilters((f) => ({ ...f, repFrom: e.target.value }))} />
                  <input className="inp date" type="date" value={filters.repTo} onChange={(e) => setFilters((f) => ({ ...f, repTo: e.target.value }))} />
                </div>
              )}
              <span style={{ flex: 1 }}></span>
              <span className="lab">{periodText}</span>
            </div>
            <ReportsView base={filtered(deals, filters, { skipDates: true })} period={filters.period} periodText={periodText} onOpenDrawer={openDrawer} inPeriod={inPeriod} />
          </section>
        )}
        {filters.view === 'workbook' && (
          <section id="v_workbook">
            <div className="period-bar">
              <span className="lab">Reporting period</span>
              <div className="chips">
                {PERIODS.map((p) => (
                  <button key={p.id} className="chip" aria-pressed={filters.wbPeriod === p.id} onClick={() => setFilters((f) => ({ ...f, wbPeriod: p.id }))}>{p.name}</button>
                ))}
              </div>
              {filters.wbPeriod === 'custom' && (
                <div className="field">
                  <input className="inp date" type="date" value={filters.wbFrom} onChange={(e) => setFilters((f) => ({ ...f, wbFrom: e.target.value }))} />
                  <input className="inp date" type="date" value={filters.wbTo} onChange={(e) => setFilters((f) => ({ ...f, wbTo: e.target.value }))} />
                </div>
              )}
              <span style={{ flex: 1 }}></span>
              <span className="lab">{wbPeriodText}</span>
            </div>
            <WorkbookView base={filtered(deals, filters, { skipDates: true })} wbPeriod={filters.wbPeriod} pf={wbPf} pt={wbPt} onOpenDrawer={openDrawer} wbInPeriod={wbInPeriod} />
          </section>
        )}
      </motion.div>
      </AnimatePresence>
      </main>

      <AnimatePresence>
        {(drawer.open || importOpen) && (
          <motion.div className="scrim open" key="scrim"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            onClick={() => { closeDrawer(); setImportOpen(false); }} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {drawer.open && (
          <PropertyDrawer key="drawer" open={drawer.open} form={drawer.form} isNew={!drawer.editingId} profile={myProfile} canDelete={canDelete}
            onChange={updateDrawerField} onSave={saveDeal} onDelete={deleteDeal} onClose={closeDrawer}
            onUploadPhoto={handlePhotoUpload} onRemovePhoto={removePhoto}
            onUploadTitleReport={handleTitleReportUpload} onRemoveTitleReport={removeTitleReport} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {importOpen && (
          <ImportModal key="import" open={importOpen} deals={deals} onClose={() => setImportOpen(false)} onCommit={commitImport} toast={showToast} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmState && (
          <ConfirmModal key="confirm" title={confirmState.title} message={confirmState.message}
            confirmLabel={confirmState.confirmLabel} onCancel={() => setConfirmState(null)} onConfirm={confirmState.onConfirm} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast.show && (
          <motion.div className="toast show" id="toast" key="toast"
            initial={{ opacity: 0, y: 20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 20, x: '-50%' }}
            transition={{ duration: 0.22, ease: 'easeOut' }}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function fmtShort(d) {
  return d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : '—';
}
