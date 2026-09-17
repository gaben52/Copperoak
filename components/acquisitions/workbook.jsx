'use client';
// Ported from Acquisitions_Center_LIVE.html — renderWorkbook() and its table builders.

import { STAGE_BY_ID, ACTIVE_STAGES, isOwned } from './constants';
import { calc, money, pct, avg, sum, n } from './helpers';

const WbStatCard = ({ k, v, s, cls }) => (
  <div className="wb-stat"><div className="k">{k}</div><div className={'v ' + (cls || '')}>{v}</div><div className="s">{s || ''}</div></div>
);
const wbAcquiredDate = (d) => d.acquiredDate || d.auctionDate || '';

function monthLabelShort(k) {
  const [y, m] = k.split('-');
  const names = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return (names[+m] || k) + ' ' + y;
}

function WbInventoryTable({ base }) {
  const rows = ACTIVE_STAGES.map((stageId) => {
    const items = base.filter((d) => d.stage === stageId);
    const arvs = items.map((d) => n(d.arv)).filter(Boolean);
    return { stage: STAGE_BY_ID[stageId], count: items.length, capital: sum(items, (d) => calc(d).useBasis), avgArv: arvs.length ? avg(arvs) : 0 };
  }).filter((r) => r.count > 0);
  const soldAll = base.filter((d) => d.stage === 'sold');
  if (soldAll.length) rows.push({ stage: STAGE_BY_ID['sold'], count: soldAll.length, capital: sum(soldAll, (d) => calc(d).basis), avgArv: 0, isSold: true });
  if (!rows.length) return <div className="wb-empty">No properties on file yet.</div>;
  const tC = sum(rows, (r) => r.count), tCap = sum(rows, (r) => r.capital);
  return (
    <table className="wb-table"><thead><tr><th>Status</th><th className="r">Homes</th><th className="r">Capital</th><th className="r">Avg ARV</th></tr></thead>
      <tbody>{rows.map((r) => (
        <tr key={r.stage.id}><td>{r.stage.name}</td><td className="r">{r.count}</td><td className="r">{money(r.capital)}</td>
          <td className="r">{r.isSold ? '—' : (r.avgArv ? money(r.avgArv) : '—')}</td></tr>
      ))}</tbody>
      <tfoot><tr><td>Total</td><td className="r">{tC}</td><td className="r">{money(tCap)}</td><td className="r"></td></tr></tfoot>
    </table>
  );
}

function WbSoldByMonthTable({ sold }) {
  if (!sold.length) return <div className="wb-empty">No closings in this period.</div>;
  const by = {};
  sold.forEach((d) => {
    const m = d.closedDate.slice(0, 7); const c = calc(d);
    by[m] = by[m] || { count: 0, volume: 0, profit: 0, rois: [] };
    by[m].count++; by[m].volume += n(d.salePrice); by[m].profit += c.profit; by[m].rois.push(c.roi);
  });
  const keys = Object.keys(by).sort((a, b) => b.localeCompare(a));
  const t = { c: 0, v: 0, p: 0 };
  keys.forEach((k) => { t.c += by[k].count; t.v += by[k].volume; t.p += by[k].profit; });
  return (
    <table className="wb-table"><thead><tr><th>Month</th><th className="r">Homes</th><th className="r">Volume</th><th className="r">Profit</th><th className="r">Avg ROI</th></tr></thead>
      <tbody>{keys.map((k) => (
        <tr key={k}><td>{monthLabelShort(k)}</td><td className="r">{by[k].count}</td><td className="r">{money(by[k].volume)}</td>
          <td className={'r ' + (by[k].profit >= 0 ? 'pos' : 'neg')}>{money(by[k].profit)}</td>
          <td className={'r ' + (avg(by[k].rois) >= 0 ? 'pos' : 'neg')}>{pct(avg(by[k].rois))}</td></tr>
      ))}</tbody>
      <tfoot><tr><td>{sold.length} homes sold</td><td className="r">{t.c}</td><td className="r">{money(t.v)}</td><td className="r">{money(t.p)}</td><td className="r"></td></tr></tfoot>
    </table>
  );
}

function WbCountyTable({ sold }) {
  if (!sold.length) return <div className="wb-empty">No closings in this period.</div>;
  const by = {};
  sold.forEach((d) => {
    const k = d.county || 'Unassigned'; const c = calc(d);
    by[k] = by[k] || { count: 0, volume: 0, profit: 0, rois: [] };
    by[k].count++; by[k].volume += n(d.salePrice); by[k].profit += c.profit; by[k].rois.push(c.roi);
  });
  const rows = Object.entries(by).sort((a, b) => b[1].profit - a[1].profit);
  const t = { c: 0, v: 0, p: 0 };
  rows.forEach(([, v]) => { t.c += v.count; t.v += v.volume; t.p += v.profit; });
  return (
    <table className="wb-table"><thead><tr><th>County</th><th className="r">Sold</th><th className="r">Volume</th><th className="r">Profit</th><th className="r">Avg ROI</th></tr></thead>
      <tbody>{rows.map(([k, v]) => (
        <tr key={k}><td>{k}</td><td className="r">{v.count}</td><td className="r">{money(v.volume)}</td>
          <td className={'r ' + (v.profit >= 0 ? 'pos' : 'neg')}>{money(v.profit)}</td>
          <td className={'r ' + (avg(v.rois) >= 0 ? 'pos' : 'neg')}>{pct(avg(v.rois))}</td></tr>
      ))}</tbody>
      <tfoot><tr><td>Total</td><td className="r">{t.c}</td><td className="r">{money(t.v)}</td><td className="r">{money(t.p)}</td><td className="r"></td></tr></tfoot>
    </table>
  );
}

export function WorkbookView({ base, wbPeriod, pf, pt, onOpenDrawer, wbInPeriod }) {
  if (!base.length) return <div id="workbookBody"><div className="wb-empty">Nothing to report on yet.</div></div>;

  const cohort = base.filter((d) => {
    if (!isOwned(d)) return false;
    const dt = wbAcquiredDate(d);
    if (!dt) return false;
    return wbPeriod === 'all' || (dt >= pf && dt <= pt);
  });
  const soldCohort = cohort.filter((d) => d.stage === 'sold');
  const openCohort = cohort.filter((d) => d.stage !== 'sold');
  const totalInvestment = sum(cohort, (d) => calc(d).useBasis);
  const realizedProfit = sum(soldCohort, (d) => calc(d).profit);
  const projectedProfit = sum(openCohort, (d) => calc(d).profit);
  const totalProfit = realizedProfit + projectedProfit;
  const profitRatio = totalInvestment ? totalProfit / totalInvestment : 0;
  const heldDays = soldCohort.map((d) => calc(d).held).filter((x) => x !== null);
  const currentInventory = base.filter((d) => ACTIVE_STAGES.includes(d.stage));
  const soldByClose = base.filter((d) => d.stage === 'sold' && d.closedDate && wbInPeriod(d, 'closedDate'));

  return (
    <div id="workbookBody" onClick={(e) => {
      const tr = e.target.closest && e.target.closest('tr[data-id]');
      if (tr) onOpenDrawer(tr.dataset.id);
    }}>
      <div className="wb-section">
        <div className="wb-head"><h3>Portfolio Snapshot</h3><p>{cohort.length} home{cohort.length === 1 ? '' : 's'} acquired in period &middot; {currentInventory.length} currently in inventory (as of today)</p></div>
        <div className="wb-stat-grid">
          <WbStatCard k="Homes Purchased" v={String(cohort.length)} s="this period" />
          <WbStatCard k="Homes Sold" v={String(soldCohort.length)} s="of that cohort" />
          <WbStatCard k="Current Inventory" v={String(currentInventory.length)} s="active right now" />
          <WbStatCard k="Total Investment" v={money(totalInvestment)} s="purchase + reno + carry" />
          <WbStatCard k="Realized Profit" v={money(realizedProfit)} s={soldCohort.length + ' sold'} cls={realizedProfit >= 0 ? 'pos' : 'neg'} />
          <WbStatCard k="Projected Profit" v={money(projectedProfit)} s={openCohort.length + ' still open'} cls={projectedProfit >= 0 ? 'pos' : 'neg'} />
          <WbStatCard k="Total Profit" v={money(totalProfit)} s="realized + projected" cls={totalProfit >= 0 ? 'pos' : 'neg'} />
          <WbStatCard k="Profit / Investment" v={pct(profitRatio)} s="total profit ÷ investment" cls={profitRatio >= 0 ? 'pos' : 'neg'} />
          <WbStatCard k="Avg Days Held" v={heldDays.length ? Math.round(avg(heldDays)) + 'd' : '—'} s="acquired to closed, sold homes" />
        </div>
        <div className="wb-note">Projected profit values open inventory at contract price if under contract, else ARV, less remaining sell costs &mdash; not a guarantee.</div>
      </div>

      <div className="wb-section"><div className="wb-head"><h3>Inventory by Status</h3><p>everything currently owned, as of today</p></div><WbInventoryTable base={base} /></div>
      <div className="wb-section"><div className="wb-head"><h3>Sold Performance by Month</h3><p>closings in the selected period</p></div><WbSoldByMonthTable sold={soldByClose} /></div>
      <div className="wb-section"><div className="wb-head"><h3>Performance by County</h3><p>where the money is made &middot; selected period</p></div><WbCountyTable sold={soldByClose} /></div>
    </div>
  );
}
