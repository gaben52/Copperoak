// Helper functions for the Auction Pipeline / Partner Portal.
// esc() is dropped: JSX escapes text content automatically.

// ---- Status colours ----------------------------------------------------
// OakFlow badge system: subtle background + strong readable text, drawn from the
// design-system tokens so there's one source of truth. These read as CSS vars in
// inline styles, which resolve normally at render.
const BADGE = {
  ok:      { bg: 'var(--of-ok-bg)',      text: 'var(--of-ok-text)' },
  warn:    { bg: 'var(--of-warn-bg)',    text: 'var(--of-warn-text)' },
  err:     { bg: 'var(--of-err-bg)',     text: 'var(--of-err-text)' },
  info:    { bg: 'var(--of-info-bg)',    text: 'var(--of-info-text)' },
  alt:     { bg: 'var(--of-alt-bg)',     text: 'var(--of-alt-text)' },
  neutral: { bg: 'var(--of-neutral-bg)', text: 'var(--of-neutral-text)' },
};

const LOCATION_VARIANT = {
  Courthouse: 'info', 'Auction.com': 'warn', High: 'ok', Medium: 'alt', Low: 'warn', DNB: 'err', Unrated: 'neutral',
};
const CLEAR_TITLE_VARIANT = {
  'Clear (1st Lien)': 'ok', 'Clear (2nd Lien)': 'warn', 'Not Found': 'warn',
  'Request Title': 'alt', 'Do NOT Bid': 'err', Unknown: 'neutral',
};
const OUTCOME_VARIANT = {
  Cancelled: 'neutral', '3rd Party': 'info', 'We Won': 'ok',
  'Reverted Back': 'alt', Unknown: 'neutral',
};
const STATUS_VARIANT = {
  New: 'info', Researching: 'warn', 'Bid Ready': 'alt', 'Bid Submitted': 'warn',
  Won: 'ok', Lost: 'neutral', DNB: 'err', Postponed: 'neutral', Cancelled: 'neutral',
};

const variantOf = (map, v) => BADGE[map[v] || 'neutral'];

export function locationColor(v) { return variantOf(LOCATION_VARIANT, v).bg; }
export function locationTextColor(v) { return variantOf(LOCATION_VARIANT, v).text; }
export function clearTitleColor(v) { return variantOf(CLEAR_TITLE_VARIANT, v).bg; }
export function clearTitleTextColor(v) { return variantOf(CLEAR_TITLE_VARIANT, v).text; }
export function outcomeColor(v) { return variantOf(OUTCOME_VARIANT, v).bg; }
export function outcomeTextColor(v) { return variantOf(OUTCOME_VARIANT, v).text; }
export function statusColor(status) { return variantOf(STATUS_VARIANT, status).bg; }
export function statusTextColor(status) { return variantOf(STATUS_VARIANT, status).text; }

export function fmtMoney(v) {
  if (v === '' || v === null || v === undefined || isNaN(v)) return '';
  return '$' + Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export function profitOf(row) {
  const arv = parseFloat(row.arv);
  const max = parseFloat(row.maxBid);
  if (isNaN(arv) || isNaN(max)) return null;
  return arv - max;
}
export function computeProfit(row) {
  // Profit = (ARV * 0.89) - Purchase Price (Max Bid) - Renovation Cost
  const arv = parseFloat(row.arv);
  const max = parseFloat(row.maxBid);
  if (isNaN(arv) || isNaN(max)) return null;
  const reno = parseFloat(row.renoCost);
  return arv * 0.89 - max - (isNaN(reno) ? 0 : reno);
}
export function profitMarginOf(row) {
  const arv = parseFloat(row.arv);
  if (isNaN(arv) || arv === 0) return null;
  const profit = computeProfit(row);
  if (profit === null) return null;
  return profit / arv;
}
export function computeActualProfit(row) {
  // Actual Profit (post-auction) = (ARV * 0.89) - Winning Bid - Renovation Cost
  const arv = parseFloat(row.arv);
  const wb = parseFloat(row.winningBid);
  if (isNaN(arv) || isNaN(wb)) return null;
  const reno = parseFloat(row.renoCost);
  return arv * 0.89 - wb - (isNaN(reno) ? 0 : reno);
}
export function actualProfitMarginOf(row) {
  const arv = parseFloat(row.arv);
  if (isNaN(arv) || arv === 0) return null;
  const profit = computeActualProfit(row);
  if (profit === null) return null;
  return profit / arv;
}
export function effectiveProfitMarginOf(row) {
  if (row.winningBid !== '' && row.winningBid != null) {
    const actual = actualProfitMarginOf(row);
    if (actual !== null) return actual;
  }
  return profitMarginOf(row);
}

export function isComplete(row) {
  return row.openBid !== '' && row.arv !== '' && row.maxBid !== '';
}
export function isUpcoming(row) {
  if (!row.saleDate) return false;
  const d = new Date(row.saleDate);
  const now = new Date();
  const diff = (d - now) / (1000 * 60 * 60 * 24);
  return diff >= -1 && diff <= 7;
}
export function isAtRisk(row) {
  if (row.clearTitle === 'Do NOT Bid') return false;
  if (row.outcome && row.outcome !== 'Unknown') return false;
  if (!row.saleDate) return false;
  const d = new Date(row.saleDate);
  const now = new Date();
  const hoursAway = (d - now) / (1000 * 60 * 60);
  if (hoursAway < -24 || hoursAway > 72) return false;
  const missingArv = row.arv === '' || row.arv == null;
  const missingMaxBid = row.maxBid === '' || row.maxBid == null;
  const titleUnresolved = ['Unknown', 'Request Title', 'Not Found'].includes(row.clearTitle || 'Unknown');
  return missingArv || missingMaxBid || titleUnresolved;
}

// ---- Monthly boards (GA auctions run first-Tuesday-of-month) ----
export function monthKeyOf(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}
export function monthLabel(key) {
  if (key === 'Unscheduled') return 'Unscheduled (no Sale Date)';
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}
export function firstTuesday(key) {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y, m - 1, 1);
  const offset = (2 - d.getDay() + 7) % 7;
  d.setDate(1 + offset);
  return d;
}
export function shiftMonthKey(key, delta) {
  if (key === 'Unscheduled') key = monthKeyOf(new Date());
  const [y, m] = key.split('-').map(Number);
  return monthKeyOf(new Date(y, m - 1 + delta, 1));
}
export function auctionMonthOf(row) {
  return row.saleDate ? row.saleDate.slice(0, 7) : 'Unscheduled';
}

export function fullAddressLine(r) {
  const parts = [];
  parts.push(r.address || '(no address)');
  if (r.city) parts.push(r.city);
  if (r.state) parts.push(r.state);
  let line = parts.join(', ');
  if (r.county) line += ` (${r.county} County)`;
  return line;
}
export function trusteeSummaryLine(r) {
  const parts = [];
  if (r.trusteeName) parts.push(r.trusteeName);
  if (r.trusteePhone) parts.push(r.trusteePhone);
  if (r.trusteeEmail) parts.push(r.trusteeEmail);
  return parts.length ? parts.join(' | ') : '—';
}

export function normalizeDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  if (isNaN(dt)) return '';
  return dt.toISOString().slice(0, 10);
}
