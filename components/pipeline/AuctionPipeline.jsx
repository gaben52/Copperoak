'use client';
// Ported from the Foreclosure Pre-Bid Command Center <script> (index.html /
// Foreclosure_PreBid_Command_Center_LIVE.html / Partner_Portal.html — the three originals are
// ~95% identical, confirmed by diffing them byte-for-byte; see the migration notes for the exact
// deltas). One shared component, parameterized by:
//   - variant: 'full' | 'partner'        (full mode reads/writes via Supabase; partner mode is
//                                          read-only, scoped server-side to that partner's
//                                          assigned counties — see loadAllDataPartner below)
//   - hasTitleReports: boolean            (the second full build predates the Title Report feature)
//
// Styling is OakFlow's shared light design system — there is no theme parameter.
//
// State is split between Redux (properties/filters/toolbar UI shared across this component and
// its modal children) and local useState (the partner's display name, plus fundingByMonth, which
// only WonDashboard reads and gains nothing from centralizing).
//
// Neither mode has a client-side secret of any kind: both talk to the same /api/properties (plus
// /api/monthly-funding for full mode) — Module 04 scopes a partner's results server-side rather
// than routing them through a separate endpoint — using the Supabase service-role key server-side
// (see lib/supabase/admin.js). There is no more Airtable token, no
// partner access code, and no localStorage/sessionStorage token of any kind — a partner
// authenticates through /login exactly like every other role (Module 03) and is routed here
// based on their profiles.role, gated server-side in lib/supabase/middleware.js.

import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { US_STATES, STATUSES } from './constants';
import {
  isUpcoming, isAtRisk, isComplete, effectiveProfitMarginOf, computeProfit,
  monthKeyOf, monthLabel, shiftMonthKey, auctionMonthOf, firstTuesday, fmtMoney,
} from './helpers';
import {
  fetchAllRecords, fetchFundingRecords, fetchPartnerRecords, fetchMyProfile, createProperty, createProperties,
  updatePropertyDb, updatePropertiesBulk, deleteProperties, upsertFunding,
} from './supabaseApi';
import { rowToDbFields, DB_FIELD_MAP } from './dbMapping';
import { createClient } from '@/lib/supabase/client';
import { allowedFieldsForProfile, canCreateProperty } from '@/lib/permissions/fieldGroups';
import { pipelineCSS } from './styles';
import { RowsTable } from './RowsTable';
import DetailModal from './DetailModal';
import { BulkPasteModal, BulkDateModal } from './BulkModals';
import ImportPreviewModal from './ImportPreviewModal';
import AddPropertyModal from './AddPropertyModal';
import ConfirmModal from './ConfirmModal';
import WonDashboard, { buildWonSummaryText } from './WonDashboard';
import { printList, printSelected, printWonDashboard } from './print';
import { handleFileImport, buildBulkPasteFieldsList, exportCSV, exportTitleRequests } from './importExport';
import {
  setProperties, addProperty, addProperties, updateProperty, updateProperties, removeProperty,
  removeProperties, selectProperty, clearProperties, setPropertiesLoaded,
  selectProperties, selectPropertiesLoaded, selectSelectedPropertyId,
} from '@/lib/redux/slices/propertiesSlice';
import {
  setSearch, setStateFilter, setStatusFilter, setUpcomingOnly, setAttentionOnly,
  setSelectedTab, setAuctionMonth, setSort as setSortFilter,
  selectSearch, selectStateFilter, selectStatusFilter, selectUpcomingOnly, selectAttentionOnly,
  selectSelectedTab, selectAuctionMonth, selectSortKey, selectSortDir,
} from '@/lib/redux/slices/filtersSlice';
import {
  showToast as showToastAction, hideToast, openBulkPasteModal, closeBulkPasteModal,
  openBulkDateModal, closeBulkDateModal,
  toggleArvBlackout as toggleArvBlackoutAction, toggleRowSelected, setRowsSelected,
  removeSelectedRowIds, clearSelectedRowIds,
  selectToast, selectModals, selectArvBlackout, selectSelectedRowIds,
} from '@/lib/redux/slices/uiSlice';

function applyMonthFilter(allRecords, currentMonth) {
  if (currentMonth === 'Unscheduled') return allRecords.filter((r) => auctionMonthOf(r) === 'Unscheduled');
  return allRecords.filter((r) => { const mk = auctionMonthOf(r); return mk === currentMonth || mk === 'Unscheduled'; });
}
function getAvailableMonths(allRecords, currentMonth) {
  const set = new Set();
  const today = new Date();
  for (let i = -3; i <= 12; i++) set.add(monthKeyOf(new Date(today.getFullYear(), today.getMonth() + i, 1)));
  allRecords.map(auctionMonthOf).filter((m) => /^\d{4}-\d{2}$/.test(m)).forEach((m) => set.add(m));
  if (currentMonth !== 'Unscheduled') set.add(currentMonth);
  const months = Array.from(set).sort();
  const hasUnscheduled = allRecords.some((r) => auctionMonthOf(r) === 'Unscheduled') || currentMonth === 'Unscheduled';
  return hasUnscheduled ? ['Unscheduled', ...months] : months;
}
function getCountyPages(rows) {
  const map = {};
  rows.filter((r) => r.clearTitle !== 'Do NOT Bid' && r.outcome !== '3rd Party').forEach((r) => {
    const key = `${r.state || '—'}||${r.county || 'Unknown County'}`;
    if (!map[key]) map[key] = { key, state: r.state || '—', county: r.county || 'Unknown County', count: 0 };
    map[key].count++;
  });
  return Object.values(map).sort((a, b) => (a.state + a.county).localeCompare(b.state + b.county));
}

export default function AuctionPipeline({ variant, hasTitleReports }) {
  const isPartner = variant === 'partner';
  const dispatch = useDispatch();

  const allRecords = useSelector(selectProperties);
  const dataLoaded = useSelector(selectPropertiesLoaded);
  const currentDetailId = useSelector(selectSelectedPropertyId);

  const sortKey = useSelector(selectSortKey);
  const sortDir = useSelector(selectSortDir);
  const currentCountyPage = useSelector(selectSelectedTab);
  const currentMonth = useSelector(selectAuctionMonth);
  const searchQuery = useSelector(selectSearch);
  const stateFilterVal = useSelector(selectStateFilter);
  const statusFilterVal = useSelector(selectStatusFilter);
  const upcomingOnly = useSelector(selectUpcomingOnly);
  const attentionOnly = useSelector(selectAttentionOnly);

  const arvBlackout = useSelector(selectArvBlackout);
  const toast = useSelector(selectToast);
  const modals = useSelector(selectModals);
  const bulkOpen = modals.bulkPaste;
  const bulkDateOpen = modals.bulkDate;
  const selectedRowIds = useSelector(selectSelectedRowIds);
  // RowsTable expects Set semantics (`.has()`); Redux keeps the serializable array, this is the
  // only place that bridges the two.
  const selectedIds = useMemo(() => new Set(selectedRowIds), [selectedRowIds]);

  const [fundingByMonth, setFundingByMonth] = useState({});
  // Staged parse results awaiting user confirmation before anything is written to Supabase —
  // shared by Bulk Paste and CSV/Excel Import, both of which produce the same DB-column-keyed
  // field objects (see dbMapping.js's rowToDbFields). null when no preview is open.
  const [importPreview, setImportPreview] = useState(null);
  const [addPropertyOpen, setAddPropertyOpen] = useState(false);
  const [confirmState, setConfirmState] = useState(null);
  const [partnerName, setPartnerName] = useState('');
  const [partnerCounties, setPartnerCounties] = useState([]);
  // Starts null deliberately, same reasoning as AcquisitionsApp.jsx: assuming permissive defaults
  // before the real permissions load would briefly show editable fields to someone who shouldn't
  // have them. Holds the full shape /api/my-assignments returns (role + the four individual
  // permission flags) — this is what actually decides field editability now, for every
  // role/variant, not a hardcoded isPartner check.
  const [myProfile, setMyProfile] = useState(null);
  const toastTimer = useRef(null);
  const fileInputRef = useRef(null);

  function showToast(msg) {
    dispatch(showToastAction(msg));
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => dispatch(hideToast()), 3200);
  }

  async function loadAllDataFull() {
    try {
      dispatch(setProperties(await fetchAllRecords()));
    } catch (e) {
      dispatch(setPropertiesLoaded(false));
      showToast('Could not load properties — check your connection and try again.');
    }
    try {
      setFundingByMonth(await fetchFundingRecords());
    } catch (e) {
      console.error('Could not load Monthly Funding data', e);
    }
  }
  // Partner mode: authenticated via Supabase Auth like every other role (middleware already
  // guarantees only an authorized, active Partner reaches this page) — no code to collect or
  // validate here. /api/properties does the actual county-scoping server-side (Module 04).
  async function loadAllDataPartner() {
    try {
      const data = await fetchPartnerRecords();
      setPartnerName(data.partnerName || '');
      setPartnerCounties(data.counties || []);
      dispatch(setProperties(data.records || []));
    } catch (e) {
      dispatch(setPropertiesLoaded(false));
      showToast(e.message || 'Could not load properties — check your connection and try again.');
    }
  }

  // ---- boot ----
  useEffect(() => {
    dispatch(setAuctionMonth(monthKeyOf(new Date())));
    if (!isPartner) {
      loadAllDataFull();
    } else {
      loadAllDataPartner();
    }
    fetchMyProfile().then(setMyProfile).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reflects this specific user's actual effective permissions (role defaults + individual
  // overrides an admin may have granted or removed) — not a hardcoded isPartner/role check. Used
  // for every editable field on this page, in both full and partner mode alike. null (unrestricted)
  // only for admin; everyone else gets a real Set, including Partner once individually granted a
  // field-group permission — see lib/permissions/fieldGroups.js's allowedFieldsForProfile() for
  // exactly why common/status fields still aren't included for Partner even then.
  const allowedFields = allowedFieldsForProfile(myProfile);
  const isFieldEditable = (rowField) => allowedFields === null || (!!allowedFields && allowedFields.has(DB_FIELD_MAP[rowField]));
  const canCreate = canCreateProperty(myProfile);
  // Delete was never part of the individual-permissions feature — stays admin-only, matching
  // CAN_DELETE_ROLES in lib/permissions/fieldGroups.js.
  const canDelete = myProfile?.role === 'admin';
  // Row selection feeds two different toolbar actions (Delete Selected, Change Date) with two
  // different permission requirements — selecting itself is harmless (it also drives the
  // permission-free Print Selected), so this is just "is at least one of those actions available
  // at all," not one specific permission. Each button below still checks its own.
  const canSelect = canDelete || isFieldEditable('saleDate');
  // Document removal is its own matrix row ("upload and view: A" for everyone including Partner,
  // but removal is admin/acquisition/disposition/title only) — independent of the four field-group
  // permissions, matching app/api/properties/[id]/documents/route.js's CAN_REMOVE_ROLES exactly.
  const canRemoveDocuments = !!myProfile?.role && myProfile.role !== 'partner';

  // ---- derived ----
  const monthRows = currentMonth ? applyMonthFilter(allRecords, currentMonth) : [];
  const activeRows = monthRows.filter((r) => r.clearTitle !== 'Do NOT Bid' && r.outcome !== '3rd Party');
  const countyPages = getCountyPages(monthRows);
  const validPage = ['ALL', 'ARCHIVED', 'WON', 'LOST'].includes(currentCountyPage) || countyPages.some((p) => p.key === currentCountyPage);
  const effectivePage = validPage ? currentCountyPage : 'ALL';

  const filteredRows = (() => {
    const q = searchQuery.toLowerCase();
    const list = monthRows.filter((r) => {
      const isArchived = r.clearTitle === 'Do NOT Bid';
      const isLost = r.outcome === '3rd Party';
      if (effectivePage === 'ARCHIVED') { if (!isArchived) return false; }
      else if (effectivePage === 'WON') { if (r.outcome !== 'We Won') return false; }
      else if (effectivePage === 'LOST') { if (!isLost) return false; }
      else if (effectivePage === 'ALL') { if (isArchived || isLost) return false; }
      else {
        if (isArchived || isLost) return false;
        const key = `${r.state || '—'}||${r.county || 'Unknown County'}`;
        if (key !== effectivePage) return false;
      }
      if (stateFilterVal && r.state !== stateFilterVal) return false;
      if (statusFilterVal && r.status !== statusFilterVal) return false;
      if (upcomingOnly && !isUpcoming(r)) return false;
      if (attentionOnly && !isAtRisk(r)) return false;
      if (q) {
        const hay = [r.address, r.city, r.county, r.state, r.zip].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    return list.sort((a, b) => {
      let av, bv;
      if (sortKey === 'profitMargin') { av = effectiveProfitMarginOf(a); bv = effectiveProfitMarginOf(b); av = av === null ? -Infinity : av; bv = bv === null ? -Infinity : bv; }
      else if (sortKey === 'netProfit') { av = computeProfit(a); bv = computeProfit(b); av = av === null ? -Infinity : av; bv = bv === null ? -Infinity : bv; }
      else { av = a[sortKey]; bv = b[sortKey]; }
      if (av === '' || av === undefined || av === null) av = sortKey === 'saleDate' ? '9999' : (typeof bv === 'number' ? -Infinity : '');
      if (bv === '' || bv === undefined || bv === null) bv = sortKey === 'saleDate' ? '9999' : (typeof av === 'number' ? -Infinity : '');
      if (av < bv) return -1 * sortDir;
      if (av > bv) return 1 * sortDir;
      return 0;
    });
  })();

  const onWon = effectivePage === 'WON';
  const usedStates = [...new Set(monthRows.map((r) => r.state).filter(Boolean))].sort();

  function setSort(key) {
    dispatch(setSortFilter(key));
  }

  // ---- selection ----
  function toggleSelect(id, checked) {
    dispatch(toggleRowSelected({ id, checked }));
  }
  function toggleSelectAll(checked) {
    const ids = filteredRows.map((r) => r.id);
    dispatch(setRowsSelected({ ids, checked }));
  }

  // ---- month nav ----
  function changeMonth(delta) {
    dispatch(setAuctionMonth(shiftMonthKey(currentMonth, delta)));
    dispatch(setSelectedTab('ALL'));
    dispatch(clearSelectedRowIds());
  }
  function jumpToMonth(key) {
    dispatch(setAuctionMonth(key));
    dispatch(setSelectedTab('ALL'));
    dispatch(clearSelectedRowIds());
  }

  function toggleArvBlackout() { dispatch(toggleArvBlackoutAction()); }

  function openDetail(id) { dispatch(selectProperty(id)); }

  // ---- CRUD (full mode, via Supabase) ----
  // address is required — public.properties has `address text not null`, so creating a fully
  // blank stub row (the old behavior) always failed that constraint. The modal collects it (plus
  // whatever else the user already knows) up front instead.
  async function addRow(overrides) {
    const fields = { status: 'New', clearTitle: 'Unknown', outcome: 'Unknown', ...overrides };
    const isSpecificCounty = !['ALL', 'WON', 'ARCHIVED'].includes(effectivePage);
    if (isSpecificCounty) {
      const [state, county] = effectivePage.split('||');
      if (state && state !== '—' && !fields.state) fields.state = state;
      if (county && county !== 'Unknown County' && !fields.county) fields.county = county;
    }
    try {
      const newRow = await createProperty(fields);
      dispatch(addProperty(newRow));
      if (['WON', 'ARCHIVED', 'LOST'].includes(effectivePage)) dispatch(setSelectedTab('ALL'));
      setAddPropertyOpen(false);
      showToast('Property added — click its address to fill in details.');
    } catch (e) {
      showToast(e.message || 'Could not add the property — check your connection and try again.');
    }
  }
  function deleteRow(id) {
    const row = allRecords.find((r) => r.id === id);
    setConfirmState({
      title: 'Remove property?',
      message: (row?.address || 'This property') + ' will be permanently removed. This cannot be undone.',
      confirmLabel: 'Remove',
      onConfirm: async () => {
        setConfirmState(null);
        try {
          await deleteProperties([id]);
          dispatch(removeProperty(id));
          dispatch(removeSelectedRowIds([id]));
        } catch (e) {
          showToast('Could not remove the property — check your connection and try again.');
        }
      },
    });
  }
  function deleteSelected() {
    const count = selectedIds.size;
    if (!count) return;
    const ids = Array.from(selectedIds);
    setConfirmState({
      title: 'Remove selected properties?',
      message: `${count} selected propert${count === 1 ? 'y' : 'ies'} will be permanently removed. This cannot be undone.`,
      confirmLabel: 'Remove',
      onConfirm: async () => {
        setConfirmState(null);
        try {
          await deleteProperties(ids);
          dispatch(removeProperties(ids));
          dispatch(clearSelectedRowIds());
        } catch (e) {
          showToast('Could not remove the selected properties — check your connection and try again.');
        }
      },
    });
  }

  async function updateField(id, field, rawValue) {
    const row = allRecords.find((r) => r.id === id);
    if (!row) return;
    let value = rawValue;
    if (['mortgageBalance', 'openBid', 'arv', 'arv2', 'maxBid', 'renoCost', 'winningBid', 'expectedRefund'].includes(field)) {
      value = String(value).replace(/[^0-9.\-]/g, '');
      value = value === '' ? '' : parseFloat(value);
    }
    const updated = { ...row, [field]: value };
    let statusChanged = false;
    if (['clearTitle', 'arv', 'mortgageBalance', 'maxBid'].includes(field)) {
      const bidReady = updated.clearTitle === 'Clear (1st Lien)' && updated.arv !== '' && updated.mortgageBalance !== '' && updated.maxBid !== '';
      if (bidReady && (updated.status === 'New' || updated.status === 'Researching')) { updated.status = 'Bid Ready'; statusChanged = true; }
    }
    dispatch(updateProperty({ id, changes: updated }));
    if (isPartner) { showToast('This is a read-only view for partners.'); return; }

    const changes = { [field]: updated[field] };
    if (statusChanged) changes.status = updated.status;
    try {
      await updatePropertyDb(id, changes);
      if (field === 'saleDate') {
        const mk = auctionMonthOf(updated);
        if (/^\d{4}-\d{2}$/.test(mk) && mk !== currentMonth) showToast(`Moved to ${monthLabel(mk)} board (matches Sale Date)`);
      }
    } catch (e) {
      showToast(e.message || 'Could not save that change — check your connection and try again.');
    }
  }
  function handleCountySelect(id, value) { updateField(id, 'county', value); }

  // Parses and stages a preview rather than writing straight to Supabase — the user reviews
  // which rows are valid (have an address or county) and which will be skipped before anything
  // is inserted. Mirrors the CSV/Excel import path below so both sources share one confirm step.
  function submitBulk(text) {
    if (!text.trim()) { dispatch(closeBulkPasteModal()); return; }
    const fieldsList = buildBulkPasteFieldsList(text, currentMonth).map((f) => ({ ...f, _valid: !!(f.address || f.county) }));
    dispatch(closeBulkPasteModal());
    if (!fieldsList.length) { showToast('Nothing to import — paste at least one row.'); return; }
    setImportPreview({ label: 'Bulk Paste', rows: fieldsList });
  }

  async function confirmImportPreview(validRows) {
    const skipped = importPreview.rows.length - validRows.length;
    setImportPreview(null);
    if (!validRows.length) return;
    const dbRows = validRows.map(({ _valid, ...rest }) => rest);
    try {
      const newRows = await createProperties(dbRows);
      dispatch(addProperties(newRows));
      const hereCount = newRows.filter((r) => auctionMonthOf(r) === currentMonth).length;
      const elsewhereCount = newRows.length - hereCount;
      showToast(`Added ${newRows.length} propert${newRows.length === 1 ? 'y' : 'ies'}${elsewhereCount ? ` (${hereCount} in this month, ${elsewhereCount} filed under their own Sale Date month)` : ''}${skipped ? ` — skipped ${skipped} invalid row${skipped === 1 ? '' : 's'}.` : '.'}`);
    } catch (e) {
      showToast('Import failed — check your connection and try again.');
    }
  }
  function cancelImportPreview() { setImportPreview(null); }

  async function applyBulkSaleDate(dateValue) {
    if (!dateValue) { alert('Pick a date first.'); return; }
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    try {
      await updatePropertiesBulk(ids, { saleDate: dateValue });
      dispatch(updateProperties({ ids, changes: { saleDate: dateValue } }));
      dispatch(closeBulkDateModal());
      const targetMonthKey = dateValue.slice(0, 7);
      const moved = /^\d{4}-\d{2}$/.test(targetMonthKey) && targetMonthKey !== currentMonth;
      showToast(moved ? `${ids.length} moved to ${monthLabel(targetMonthKey)}.` : `Sale Date updated for ${ids.length} propert${ids.length === 1 ? 'y' : 'ies'}.`);
    } catch (e) { /* ignore, matches source */ }
  }

  function onFileImportChosen(file) {
    handleFileImport(file, currentMonth, (fieldsListRaw) => {
      const fieldsList = fieldsListRaw.map((o) => ({ ...rowToDbFields(o), _valid: !!(o.address || o.county) }));
      if (!fieldsList.length) { alert('No rows found in that file.'); return; }
      setImportPreview({ label: 'CSV/Excel Import', rows: fieldsList });
    });
  }

  function refreshData() {
    showToast('Refreshing...');
    if (!isPartner) loadAllDataFull();
    else loadAllDataPartner();
  }

  // ---- funding (full mode, via Supabase) ----
  async function updateFunding(monthKey, field, valueStr) {
    let value = valueStr.replace(/[^0-9.\-]/g, '');
    value = value === '' ? '' : parseFloat(value);
    try {
      await upsertFunding(monthKey, field, value);
      setFundingByMonth((prev) => ({ ...prev, [monthKey]: { ...prev[monthKey], [field]: value } }));
    } catch (e) {
      showToast('Could not save funding amount — check your connection.');
    }
  }

  // ---- photos / title reports (Module 04, Stage 7) ----
  // The browser uploads directly to the property-documents Storage bucket using its own session
  // (Storage RLS — 20260910000500_property_documents_storage.sql — is what actually enforces
  // "only if you can access this property," not this code); this just records the resulting path
  // via /api/properties/[id]/documents, which also hands back a signed URL ready to display.
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

  async function handlePhotoUpload(rowId, fileList) {
    const files = Array.from(fileList);
    try {
      let photos;
      for (const file of files) photos = await uploadDocument(rowId, file, 'photo');
      dispatch(updateProperty({ id: rowId, changes: { photos } }));
      showToast(`Uploaded ${files.length} photo${files.length === 1 ? '' : 's'}.`);
    } catch (e) {
      showToast(e.message || 'Could not upload photo(s) — check your connection and try again.');
    }
  }
  async function handleTitleReportUpload(rowId, fileList) {
    const files = Array.from(fileList);
    try {
      let titleReports;
      for (const file of files) titleReports = await uploadDocument(rowId, file, 'titleReport');
      dispatch(updateProperty({ id: rowId, changes: { titleReports } }));
      showToast(`Uploaded ${files.length} file${files.length === 1 ? '' : 's'}.`);
    } catch (e) {
      showToast(e.message || 'Could not upload the title report — check your connection and try again.');
    }
  }
  async function removeDocument(rowId, documentId, kind, stateField) {
    try {
      const res = await fetch(`/api/properties/${rowId}/documents`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: kind, documentId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not remove that document.');
      dispatch(updateProperty({ id: rowId, changes: { [stateField]: kind === 'photo' ? data.photos : data.title_report } }));
    } catch (e) {
      showToast(e.message || 'Could not remove that document — check your connection and try again.');
    }
  }
  function removePhoto(rowId, index) {
    const doc = allRecords.find((r) => r.id === rowId)?.photos?.[index];
    if (doc) removeDocument(rowId, doc.id, 'photo', 'photos');
  }
  function removeTitleReport(rowId, index) {
    const doc = allRecords.find((r) => r.id === rowId)?.titleReports?.[index];
    if (doc) removeDocument(rowId, doc.id, 'titleReport', 'titleReports');
  }

  // ---- sign-out ----
  // A real Supabase sign-out (Module 03) — used by every role that lands here, not just Partner.
  async function handleLogout() {
    try { await createClient().auth.signOut(); } catch (e) { /* ignore */ }
    window.location.href = '/';
  }

  // ---- stats ----
  const withMath = activeRows.filter((r) => effectiveProfitMarginOf(r) !== null && !isNaN(effectiveProfitMarginOf(r)));
  const avgProfitPct = withMath.length ? (withMath.reduce((s, r) => s + effectiveProfitMarginOf(r), 0) / withMath.length) * 100 : 0;
  const arvVals = activeRows.map((r) => parseFloat(r.arv)).filter((v) => !isNaN(v));
  const avgARV = arvVals.length ? arvVals.reduce((a, b) => a + b, 0) / arvVals.length : 0;
  const completeCount = activeRows.filter(isComplete).length;
  const pctComplete = activeRows.length ? Math.round((completeCount / activeRows.length) * 100) : 0;
  const upcomingCount = activeRows.filter(isUpcoming).length;
  const atRiskCount = activeRows.filter(isAtRisk).length;
  const isCountyView = !['ALL', 'WON', 'ARCHIVED', 'LOST'].includes(effectivePage);
  let countyStat = null;
  if (isCountyView) {
    const countyRows = activeRows.filter((r) => `${r.state || '—'}||${r.county || 'Unknown County'}` === effectivePage);
    const countyComplete = countyRows.filter(isComplete).length;
    const countyPct = countyRows.length ? Math.round((countyComplete / countyRows.length) * 100) : 0;
    const [stAbbr, ctyName] = effectivePage.split('||');
    countyStat = { name: `${stAbbr} · ${ctyName}`, pct: countyPct, complete: countyComplete, total: countyRows.length };
  }

  // Full mode has no gate anymore — Supabase access happens entirely server-side.
  // Access itself is already enforced server-side (middleware + /api/properties's Module 04
  // scoping) before this page ever renders — the only thing left to distinguish here is *why* a
  // partner sees no rows (no assignment yet, vs. genuinely zero properties in an assigned area).
  const emptyMessage = !dataLoaded
    ? (isPartner ? 'Loading...' : 'Loading properties...')
    : isPartner && !partnerCounties.length
    ? 'Your account has no counties assigned yet — contact your administrator.'
    : isPartner
    ? 'No properties in your assigned counties for this view.'
    : 'No properties yet. Click "+ Add Property" or "Bulk Paste" to get started.';

  if (currentMonth === null) return null; // avoids a hydration mismatch on the very first tick

  return (
    <div>
      {/* dangerouslySetInnerHTML — see the matching note in AcquisitionsApp.jsx. <style> is a
          raw-text HTML element; a plain string child gets HTML-escaped by the server renderer
          but not by the client, which is a guaranteed hydration mismatch for CSS containing
          quotes or `>`. This CSS has both (quoted font-family, `main>section`). */}
      <style dangerouslySetInnerHTML={{ __html: pipelineCSS() }} />

      <div className="header">
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
            <div className="tag">{isPartner ? <>Partner Portal &middot; {partnerName || '—'}</> : 'Auction Pipeline'}</div>
          </div>
        </a>
        <div className="header-actions">
          {canCreate && <>
            <button className="btn-gold" onClick={() => setAddPropertyOpen(true)}>+ Add Property</button>
            <button onClick={() => dispatch(openBulkPasteModal())}>Bulk Paste</button>
            <button onClick={() => fileInputRef.current && fileInputRef.current.click()}>&#8593; Import CSV/Excel</button>
          </>}
          <button onClick={() => exportCSV(filteredRows)}>&#8595; Export CSV</button>
          {!isPartner && <button onClick={() => exportTitleRequests(allRecords)} title="Export a CSV of just the address/trustee fields a title company needs to run a report">Title Examiner Export</button>}
          <button className="btn-green" onClick={() => printList(filteredRows, effectivePage)}>&#128424; Print Auction List</button>
          <button id="blackoutBtn" className={arvBlackout ? 'active' : ''} onClick={toggleArvBlackout} title="Hide the ARV column on screen — useful when screen-sharing without showing valuations">{arvBlackout ? 'Reveal ARV' : 'Blackout ARV'}</button>
          <button onClick={refreshData}>&#128260; Refresh</button>
          {canCreate && (
            <input type="file" ref={fileInputRef} accept=".csv,.xlsx,.xls" hidden
              onChange={(e) => { if (e.target.files[0]) onFileImportChosen(e.target.files[0]); e.target.value = ''; }} />
          )}
          <button onClick={handleLogout}>&#128274; Log Out</button>
        </div>
      </div>

      <div className="month-bar">
        <button onClick={() => changeMonth(-1)}>&#9664;</button>
        <div className="month-label">
          <b>{monthLabel(currentMonth)}</b>
          {currentMonth === 'Unscheduled' && <span style={{ color: 'var(--muted)', fontSize: 14, fontWeight: 600 }}> Fill in a Sale Date on each property to file it under its auction month.</span>}
        </div>
        <button onClick={() => changeMonth(1)}>&#9654;</button>
        <select value={currentMonth} onChange={(e) => jumpToMonth(e.target.value)}>
          {getAvailableMonths(allRecords, currentMonth).map((k) => <option value={k} key={k}>{monthLabel(k)}</option>)}
        </select>
      </div>

      <div className="stats">
        <div className="stat red" style={{ cursor: 'pointer' }} onClick={() => dispatch(setAttentionOnly(true))} title="Sale date within 72 hours with missing ARV, Max Bid, or unresolved title"><div className="label">NEEDS ATTENTION</div><div className="value">{atRiskCount}</div></div>
        <div className="stat"><div className="label">TOTAL PROPERTIES</div><div className="value">{activeRows.length}</div></div>
        <div className="stat green" title="Average projected profit margin across this month's active properties"><div className="label">AVG PROFIT %</div><div className="value">{avgProfitPct.toFixed(1)}%</div></div>
        <div className="stat gold" title="ARV = After Repair Value — average estimated resale value across this month's active properties"><div className="label">AVERAGE ARV</div><div className="value">{fmtMoney(Math.round(avgARV)) || '$0'}</div></div>
        <div className="stat" title="Share of properties with Open Bid, ARV, and Max Bid all filled in"><div className="label">% COMPLETE</div><div className="value">{pctComplete}%<span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}> ({completeCount}/{activeRows.length})</span></div></div>
        <div className="stat"><div className="label">SALES NEXT 7 DAYS</div><div className="value" style={{ color: 'var(--yellow)' }}>{upcomingCount}</div></div>
        <div className="stat"><div className="label">LAST UPDATED</div><div className="value" style={{ fontSize: 15 }}>{new Date().toLocaleDateString()}</div></div>
        {countyStat && <div className="stat gold"><div className="label">{countyStat.name} COMPLETE</div><div className="value">{countyStat.pct}%<span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}> ({countyStat.complete}/{countyStat.total})</span></div></div>}
      </div>

      <div className="toolbar">
        <div className="filters">
          <input type="text" placeholder="Search address, city, county..." value={searchQuery} onChange={(e) => dispatch(setSearch(e.target.value))} />
          <select value={stateFilterVal} onChange={(e) => dispatch(setStateFilter(e.target.value))}>
            <option value="">All States</option>
            {usedStates.map((s) => <option value={s} key={s}>{s}</option>)}
          </select>
          <select value={statusFilterVal} onChange={(e) => dispatch(setStatusFilter(e.target.value))}>
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)' }}>
            <input type="checkbox" checked={upcomingOnly} onChange={(e) => dispatch(setUpcomingOnly(e.target.checked))} style={{ width: 'auto' }} /> Next 7 days only
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--red)' }}>
            <input type="checkbox" checked={attentionOnly} disabled={isPartner} onChange={(e) => dispatch(setAttentionOnly(e.target.checked))} style={{ width: 'auto' }} /> Needs attention only
          </label>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {selectedIds.size > 0 && (
            <>
              <button className="btn-green" onClick={() => printSelected(filteredRows, selectedIds)}>&#128424; Print Selected ({selectedIds.size})</button>
              {isFieldEditable('saleDate') && <button onClick={() => dispatch(openBulkDateModal())}>&#128197; Change Date ({selectedIds.size})</button>}
              {canDelete && <button className="btn-danger" onClick={deleteSelected}>&#128465; Delete Selected ({selectedIds.size})</button>}
            </>
          )}
          <div className="legend"><span className="swatch"></span> Green = fields you fill in &nbsp;|&nbsp; <b style={{ color: 'var(--red)' }}>DNB</b> = Do Not Bid</div>
        </div>
      </div>

      <div className="pager-bar">
        <button onClick={() => {
          const order = ['ALL', 'WON', ...countyPages.map((p) => p.key), 'LOST', 'ARCHIVED'];
          let idx = order.indexOf(effectivePage); if (idx === -1) idx = 0;
          dispatch(setSelectedTab(order[Math.max(0, idx - 1)]));
        }}>&#9664;</button>
        <div className="page-tabs">
          <button type="button" className={'page-tab' + (effectivePage === 'ALL' ? ' active' : '')} onClick={() => dispatch(setSelectedTab('ALL'))}>All Counties ({activeRows.length})</button>
          <button type="button" className={'page-tab won-tab' + (effectivePage === 'WON' ? ' active' : '')} onClick={() => dispatch(setSelectedTab('WON'))}>Winning Bids ({monthRows.filter((r) => r.outcome === 'We Won').length})</button>
          {countyPages.map((p) => (
            <button type="button" key={p.key} className={'page-tab' + (effectivePage === p.key ? ' active' : '')} onClick={() => dispatch(setSelectedTab(p.key))}>{p.state} &middot; {p.county} ({p.count})</button>
          ))}
          <button type="button" className={'page-tab lost-tab' + (effectivePage === 'LOST' ? ' active' : '')} onClick={() => dispatch(setSelectedTab('LOST'))}>&#128683; Lost Homes ({monthRows.filter((r) => r.outcome === '3rd Party').length})</button>
          <button type="button" className={'page-tab archived-tab' + (effectivePage === 'ARCHIVED' ? ' active' : '')} onClick={() => dispatch(setSelectedTab('ARCHIVED'))}>&#128465; Archived / DNB ({monthRows.filter((r) => r.clearTitle === 'Do NOT Bid').length})</button>
        </div>
        <button onClick={() => {
          const order = ['ALL', 'WON', ...countyPages.map((p) => p.key), 'LOST', 'ARCHIVED'];
          let idx = order.indexOf(effectivePage); if (idx === -1) idx = 0;
          dispatch(setSelectedTab(order[Math.min(order.length - 1, idx + 1)]));
        }}>&#9654;</button>
      </div>

      <div id="wonDashboard">
        {effectivePage === 'WON' && (
          /* Monthly Funding is a separate table (public.monthly_funding) with its own admin/
             acquisition-only backend restriction (/api/monthly-funding) — outside fieldGroups.js
             and the four individually-grantable permissions entirely, so this stays tied to
             isPartner rather than isFieldEditable(). */
          <WonDashboard allRecords={allRecords} currentMonth={currentMonth} fundingByMonth={fundingByMonth}
            onUpdateFunding={updateFunding} readOnly={isPartner}
            onCopySummary={async () => {
              const text = buildWonSummaryText(allRecords, currentMonth, fundingByMonth);
              try { await navigator.clipboard.writeText(text); showToast('Summary copied — paste it into your email.'); }
              catch (e) { showToast('Could not copy automatically — select and copy the summary manually.'); }
            }}
            onPrint={() => printWonDashboard(allRecords, currentMonth, fundingByMonth)} />
        )}
      </div>

      <div className={'table-wrap' + (arvBlackout ? ' arv-blackout' : '')} data-lenis-armable>
        <AnimatePresence mode="wait">
          <motion.div key={effectivePage + '|' + currentMonth}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            {!dataLoaded || !filteredRows.length ? (
              <table><tbody><tr><td className="empty">{emptyMessage}</td></tr></tbody></table>
            ) : (
              <RowsTable rows={filteredRows} onWon={onWon} selectedIds={selectedIds} allVisibleIds={filteredRows.map((r) => r.id)}
                onToggleSelect={toggleSelect} onToggleSelectAll={toggleSelectAll} sortKey={sortKey} onSort={setSort}
                onUpdateField={updateField} onHandleCountySelect={handleCountySelect} onOpenDetail={openDetail}
                onDeleteRow={deleteRow} editable={isFieldEditable} canSelect={canSelect} canDelete={canDelete} emptyMessage={emptyMessage} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="footer">
        <div className="panel-box">
          <h3>Formula Guide</h3>
          <div className="formula-columns">
            {[
              [
                ['ARV', 'After Repair Value. The estimated resale value once the property is renovated. This is the base value used by most formulas below.'],
                ['Variance', 'ARV minus Max Bid. A quick pre bid screen before repair and closing costs.'],
                ['Profit', 'ARV multiplied by 0.89, minus Max Bid, minus Reno Cost. The 0.89 factor accounts for typical selling costs.'],
                ['Profit %', 'Profit divided by ARV.'],
                ['Open Bid', 'The starting courthouse bid from foreclosurebidlist.com.'],
                ['Max Bid', 'The maximum amount you are willing to bid on sale day.'],
                ['% Complete', 'The percentage of properties with Open Bid, ARV, and Max Bid completed.'],
                ['Bid Ready', 'Automatically set when Clear Title is Clear and Mortgage Balance, ARV, and Max Bid are all completed.'],
                ['Location', 'The auction location or property rating. Options include Courthouse, Auction.com, Unrated, Low, Medium, High, and DNB.'],
              ],
              [
                ['Do Not Bid', 'Setting Clear Title to Do Not Bid automatically archives the property and moves it to the Archived tab.'],
                ['Auction Outcome', 'The result of the auction. Unknown is the default. Won moves the property to Won Properties. 3rd Party moves it to Lost Homes and removes it from the active county lists.'],
                ['Clear 1st Lien', 'The title is confirmed clear and the foreclosing loan is in first lien position. Senior liens are wiped out and the property is automatically promoted to Bid Ready.'],
                ['Clear 2nd Lien', 'The title is confirmed clear but the foreclosing loan is in second lien position. A senior mortgage may survive the sale. The property is flagged for review and must be moved to Bid Ready manually.'],
                ['Trustee Info', 'The name, phone number, and email of the foreclosing trustee. This information appears in the property detail panel and can be populated through CSV, Excel, or Bulk Paste imports.'],
                ['Needs Attention', 'The sale date is within 72 hours and ARV, Max Bid, or Clear Title is still unresolved. The property is flagged with an attention indicator and included in the Needs Attention count.'],
              ],
            ].map((col, i) => (
              <div className="formula-table" key={i}>
                {col.map(([term, meaning]) => (
                  <div className="formula-row" key={term}>
                    <div className="formula-term">{term}</div>
                    <div className="formula-meaning">{meaning}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {canCreate && bulkOpen && (
          <BulkPasteModal key="bulk" onClose={() => dispatch(closeBulkPasteModal())} onSubmit={submitBulk} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {canCreate && addPropertyOpen && (
          <AddPropertyModal key="addProperty"
            defaultState={!['ALL', 'WON', 'ARCHIVED'].includes(effectivePage) ? effectivePage.split('||')[0] : ''}
            defaultCounty={!['ALL', 'WON', 'ARCHIVED'].includes(effectivePage) ? effectivePage.split('||')[1] : ''}
            onClose={() => setAddPropertyOpen(false)} onSubmit={addRow} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {canCreate && importPreview && (
          <ImportPreviewModal key="importPreview" sourceLabel={importPreview.label} rows={importPreview.rows}
            onCancel={cancelImportPreview} onConfirm={confirmImportPreview} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {canDelete && confirmState && (
          <ConfirmModal key="confirmDelete" title={confirmState.title} message={confirmState.message}
            confirmLabel={confirmState.confirmLabel} onCancel={() => setConfirmState(null)} onConfirm={confirmState.onConfirm} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {currentDetailId && (
          <DetailModal key="detail"
            row={allRecords.find((r) => r.id === currentDetailId) || null}
            hasTitleReports={hasTitleReports} editable={isFieldEditable} canRemoveDocuments={canRemoveDocuments}
            onClose={() => dispatch(selectProperty(null))}
            onUpdateField={updateField}
            onUploadPhoto={handlePhotoUpload} onRemovePhoto={removePhoto}
            onUploadTitleReport={handleTitleReportUpload} onRemoveTitleReport={removeTitleReport}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isFieldEditable('saleDate') && bulkDateOpen && (
          <BulkDateModal key="bulkdate" count={selectedIds.size} onClose={() => dispatch(closeBulkDateModal())} onApply={applyBulkSaleDate} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast.show && (
          <motion.div className="toast show" key="toast"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
