// Ported from the Foreclosure Pre-Bid Command Center <script> — CSV/Excel import
// (handleFileImport/importParsed/findKey/parseDateFromFilename/fallbackImportDate) and CSV
// export (exportCSV/exportTitleRequests).

import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { LOCATION_OPTIONS, CLEAR_TITLE_OPTIONS, OUTCOME_OPTIONS } from './constants';
import { fmtMoney, monthKeyOf, firstTuesday, effectiveProfitMarginOf, computeProfit, normalizeDate } from './helpers';
import { rowToDbFields } from './dbMapping';

const MONTH_NAMES = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

export function parseDateFromFilename(filename) {
  const base = filename.replace(/\.[^.]+$/, '');
  const m = base.match(/^([A-Za-z]+)[_\-\s]+(\d{1,2})[_\-\s]+(\d{4})/);
  if (!m) return '';
  const monthIdx = MONTH_NAMES.indexOf(m[1].toLowerCase());
  if (monthIdx === -1) return '';
  const day = parseInt(m[2], 10), year = parseInt(m[3], 10);
  if (day < 1 || day > 31) return '';
  const dt = new Date(year, monthIdx, day);
  if (isNaN(dt)) return '';
  return dt.toISOString().slice(0, 10);
}
export function fallbackImportDate(filename, currentMonth) {
  const fromName = filename ? parseDateFromFilename(filename) : '';
  if (fromName) return fromName;
  return firstTuesday(currentMonth === 'Unscheduled' ? monthKeyOf(new Date()) : currentMonth).toISOString().slice(0, 10);
}

function findKey(obj, candidates) {
  const keys = Object.keys(obj);
  for (const c of candidates) {
    const match = keys.find((k) => k.toLowerCase().replace(/[^a-z]/g, '') === c);
    if (match) return obj[match];
  }
  return '';
}

export function buildImportFieldsList(data) {
  const fieldsList = [];
  data.forEach((d) => {
    if (!d || Object.keys(d).length === 0) return;
    const overrides = {
      state: String(findKey(d, ['state', 'st']) || '').toUpperCase().slice(0, 2),
      county: findKey(d, ['county']) || '',
      address: findKey(d, ['address', 'streetaddress', 'street']) || '',
      city: findKey(d, ['city']) || '',
      zip: String(findKey(d, ['zip', 'zipcode', 'postalcode']) || ''),
    };
    const mb = findKey(d, ['mortgagebalance', 'debt', 'balance', 'estdebt']);
    overrides.mortgageBalance = mb ? parseFloat(String(mb).replace(/[^0-9.\-]/g, '')) : '';
    const ob = findKey(d, ['openbid', 'openingbid', 'startingbid']);
    overrides.openBid = ob ? parseFloat(String(ob).replace(/[^0-9.\-]/g, '')) : '';
    const arv = findKey(d, ['arv']);
    overrides.arv = arv ? parseFloat(String(arv).replace(/[^0-9.\-]/g, '')) : '';
    const arv2 = findKey(d, ['2ndarv', 'arv2', 'secondarv']);
    overrides.arv2 = arv2 ? parseFloat(String(arv2).replace(/[^0-9.\-]/g, '')) : '';
    const mx = findKey(d, ['maxbid']);
    overrides.maxBid = mx ? parseFloat(String(mx).replace(/[^0-9.\-]/g, '')) : '';
    const rc = findKey(d, ['renocost', 'renovationcost', 'rehabcost']);
    overrides.renoCost = rc ? parseFloat(String(rc).replace(/[^0-9.\-]/g, '')) : '';
    const locationVal = findKey(d, ['location']);
    if (locationVal && LOCATION_OPTIONS.includes(String(locationVal))) overrides.location = String(locationVal);
    const ctVal = findKey(d, ['cleartitle', 'title']);
    if (ctVal && CLEAR_TITLE_OPTIONS.includes(String(ctVal))) overrides.clearTitle = String(ctVal);
    const outcomeVal = findKey(d, ['outcome', 'auctionoutcome', 'result']);
    if (outcomeVal && OUTCOME_OPTIONS.includes(String(outcomeVal))) overrides.outcome = String(outcomeVal);
    overrides.trusteeName = findKey(d, ['trustee', 'trusteename', 'trusteeservicer', 'substitutetrustee']) || '';
    overrides.trusteePhone = findKey(d, ['trusteephone', 'trusteephonenumber', 'trusteetel', 'phone']) || '';
    overrides.trusteeEmail = findKey(d, ['trusteeemail', 'email']) || '';
    overrides.saleDate = ''; // filled in by the caller with normalizeDate() + fallbackDate
    const rawDate = findKey(d, ['saledate', 'auctiondate', 'date']);
    overrides._rawDate = rawDate;
    if (overrides.address || overrides.county) fieldsList.push(overrides);
  });
  return fieldsList;
}

export function handleFileImport(file, currentMonth, onDone) {
  const name = file.name.toLowerCase();
  const fallbackDate = fallbackImportDate(file.name, currentMonth);
  if (name.endsWith('.csv')) {
    Papa.parse(file, { header: true, skipEmptyLines: true, complete: (res) => onDone(applyDates(buildImportFieldsList(res.data), fallbackDate), fallbackDate) });
  } else {
    const reader = new FileReader();
    reader.onload = (e) => {
      const wb = XLSX.read(e.target.result, { type: 'array', cellDates: true });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);
      onDone(applyDates(buildImportFieldsList(data), fallbackDate), fallbackDate);
    };
    reader.readAsArrayBuffer(file);
  }
}
function applyDates(list, fallbackDate) {
  return list.map((o) => {
    const { _rawDate, ...rest } = o;
    rest.saleDate = normalizeDate(_rawDate) || fallbackDate || '';
    return rest;
  });
}

export function buildBulkPasteFieldsList(text, currentMonth) {
  const lines = text.trim().split('\n').map((l) => l.trim()).filter(Boolean);
  return lines.map((line) => {
    const delim = line.includes('\t') ? '\t' : ',';
    const parts = line.split(delim).map((p) => p.trim());
    const [state, county, address, city, zip, saleDate, mortgageBalance, openBid, trusteeName, trusteePhone, trusteeEmail] = parts;
    return rowToDbFields({
      state: (state || '').toUpperCase().slice(0, 2), county: county || '', address: address || '', city: city || '', zip: zip || '',
      saleDate: normalizeDate(saleDate) || fallbackImportDate('', currentMonth),
      mortgageBalance: mortgageBalance ? parseFloat(mortgageBalance.replace(/[^0-9.\-]/g, '')) : '',
      openBid: openBid ? parseFloat(openBid.replace(/[^0-9.\-]/g, '')) : '',
      trusteeName: trusteeName || '', trusteePhone: trusteePhone || '', trusteeEmail: trusteeEmail || '',
    });
  });
}

export function exportCSV(rows) {
  const headers = ['Location', 'State', 'County', 'Address', 'City', 'Zip', 'Sale Date', 'Clear Title', 'Mortgage Balance', 'Open Bid', 'ARV', '2nd ARV', 'Max Bid', 'Reno Cost', 'Profit', 'Winning Bid', 'Profit %', 'Auction Outcome', 'Trustee Name', 'Trustee Phone', 'Trustee Email', 'Notes', 'Drive Report Notes', 'Status'];
  const lines = [headers.join(',')];
  rows.forEach((r) => {
    const profitMargin = effectiveProfitMarginOf(r);
    const netProfit = computeProfit(r);
    const vals = [r.location, r.state, r.county, r.address, r.city, r.zip, r.saleDate, r.clearTitle, r.mortgageBalance, r.openBid, r.arv, r.arv2, r.maxBid, r.renoCost, netProfit === null ? '' : netProfit, r.winningBid, profitMargin === null ? '' : (profitMargin * 100).toFixed(1) + '%', r.outcome, r.trusteeName, r.trusteePhone, r.trusteeEmail, r.notes, r.driveNotes, r.status];
    lines.push(vals.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','));
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `prebid-export-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
}

export function exportTitleRequests(allRecords) {
  const list = allRecords.filter((r) => r.clearTitle === 'Request Title');
  if (!list.length) { alert('No properties are currently marked "Request Title".'); return; }
  const headers = ['Full Address', 'County', 'Notice of Sale Position'];
  const lines = [headers.join(',')];
  list.forEach((r) => {
    const addr = [r.address, r.city, r.state, r.zip].filter(Boolean).join(', ');
    const vals = [addr, r.county, ''];
    lines.push(vals.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','));
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `title-examiner-request-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
}
