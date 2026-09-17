// Ported verbatim (logic unchanged) from Acquisitions_Center_LIVE.html <script> — helpers section.
// esc() is dropped: JSX escapes text content automatically, so it's not needed once we're no
// longer building innerHTML strings by hand.

import { DEFAULT_SELL_PCT, DEFAULT_BID_PCT, OWNED_STAGES } from './constants';

export const n = (v) => {
  const x = parseFloat(String(v).replace(/[$,]/g, ''));
  return isFinite(x) ? x : 0;
};
export const uid = () => 'p' + Math.random().toString(36).slice(2, 9);
export const money = (v) => (v < 0 ? '-' : '') + '$' + Math.abs(Math.round(v)).toLocaleString('en-US');
export const compact = (v) => {
  const a = Math.abs(v);
  if (a >= 1e6) return (v / 1e6).toFixed(a >= 1e7 ? 1 : 2).replace(/\.0+$/, '') + 'M';
  if (a >= 1e3) return Math.round(v / 1e3) + 'K';
  return String(Math.round(v));
};
export const moneyShort = (v) => (v < 0 ? '-' : '') + '$' + compact(Math.abs(v));
export const pct = (v) => (v >= 0 ? '' : '-') + Math.abs(Math.round(v * 100)) + '%';
export const fmtDate = (d) =>
  d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : '—';
export const fmtDateLong = (d) =>
  d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }) : '—';
export const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);
export const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
export const sum = (a, f) => a.reduce((s, x) => s + f(x), 0);
export const today = () => new Date().toISOString().slice(0, 10);

export function calc(d) {
  const arv = n(d.arv) || n(d.estValue);
  const sellPct = (n(d.sellPct) || DEFAULT_SELL_PCT) / 100;
  const rule = n(d.bidPct) || DEFAULT_BID_PCT;
  const isSold = d.stage === 'sold' && n(d.salePrice) > 0;
  const owned = OWNED_STAGES.includes(d.stage);
  // Holding/carrying cost: only counted if typed in manually (blank = $0). No auto-default —
  // selling cost already covers a percentage-of-ARV cost in the profit math.
  const holding = n(d.holding);
  const autoMax = Math.max(0, arv * (rule / 100) - n(d.renoBudget) - holding);
  const maxBid = n(d.maxBidOverride) || autoMax;
  const basis = n(d.purchasePrice) + n(d.renoSpent) + holding;
  const budgetBasis = n(d.purchasePrice) + Math.max(n(d.renoBudget), n(d.renoSpent)) + holding;
  const preBasis = maxBid + n(d.renoBudget) + holding;
  const useBasis = isSold ? basis : owned ? budgetBasis : preBasis;
  const exit = isSold ? n(d.salePrice) : n(d.contractPrice) || arv;
  const sellCosts = exit * sellPct;
  const profit = exit - useBasis - sellCosts;
  const margin = exit ? profit / exit : 0;
  const roi = useBasis ? profit / useBasis : 0;
  const held = d.acquiredDate && d.closedDate ? daysBetween(d.acquiredDate, d.closedDate) : null;
  const dom = d.listedDate && d.closedDate ? daysBetween(d.listedDate, d.closedDate) : null;
  const renoVar = n(d.renoBudget) ? n(d.renoSpent) - n(d.renoBudget) : 0;
  const room = maxBid - n(d.openingBid);
  return {
    arv, autoMax, maxBid, basis, budgetBasis, preBasis, useBasis, exit, sellCosts, profit, margin, roi, holding,
    held, dom, renoVar, room, isSold, owned,
    overBid: n(d.purchasePrice) > 0 && n(d.purchasePrice) > maxBid,
    noRoom: n(d.openingBid) > 0 && maxBid > 0 && maxBid < n(d.openingBid),
  };
}

export const nextDate = (d) => d.closedDate || d.expectedClosing || d.listedDate || d.acquiredDate || d.auctionDate || '';
export const zillowUrl = (d) =>
  'https://www.zillow.com/homes/' +
  encodeURIComponent([d.address, d.city, d.stateAb, d.zip].filter(Boolean).join(' ')).replace(/%20/g, '-') +
  '_rb/';

export function monthLabel(k) {
  const [y, m] = k.split('-');
  const names = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return (names[+m] || k) + ' ' + y;
}
