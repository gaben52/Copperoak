'use client';
// Ported from Acquisitions_Center_LIVE.html — renderReports() and its many table/chart builders.

import { STAGE_BY_ID, BOARD_STAGES, ACTIVE_STAGES, OWNED_STAGES, isOwned } from './constants';
import { calc, money, moneyShort, pct, fmtDate, sum, avg, n, daysBetween } from './helpers';
import { SC } from './views';

const StatCard = ({ k, v, s, cls }) => (
  <div className="stat"><div className="k">{k}</div><div className={'v ' + (cls || '')}>{v}</div><div className="s">{s || ''}</div></div>
);

function monthLabelShort(k) {
  const [y, m] = k.split('-');
  const names = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return (names[+m] || k) + ' ' + y;
}

function MonthlyChart({ sold }) {
  if (!sold.length) return <div className="rep-empty">No closings in this period.</div>;
  const by = {};
  sold.forEach((d) => {
    const m = (d.closedDate || '').slice(0, 7);
    if (!m) return;
    by[m] = by[m] || { profit: 0, count: 0, volume: 0 };
    by[m].profit += calc(d).profit; by[m].count++; by[m].volume += n(d.salePrice);
  });
  const keys = Object.keys(by).sort();
  if (!keys.length) return <div className="rep-empty">Closed homes need a closing date to chart.</div>;
  const all = []; let cur = keys[0]; const last = keys[keys.length - 1];
  while (cur <= last && all.length < 36) {
    all.push(cur);
    let [y, m] = cur.split('-').map(Number); m++; if (m > 12) { m = 1; y++; }
    cur = y + '-' + String(m).padStart(2, '0');
  }
  const vals = all.map((k) => (by[k] ? by[k].profit : 0));
  const maxV = Math.max(...vals.map(Math.abs), 1);
  return (
    <>
      <div className="chart">
        {all.map((k) => {
          const b = by[k]; const v = b ? b.profit : 0; const ht = Math.abs(v) / maxV * 100;
          return (
            <div className="bar-wrap" title={k + (b ? ' · ' + b.count + ' closed · ' + money(v) : ' · no closings')} key={k}>
              {b ? <div className="bar-val">{moneyShort(v)}</div> : null}
              <div className={'bar ' + (v < 0 ? 'neg' : '')} style={{ height: (b ? Math.max(ht, 3) : 0) + '%' }}>
                {b && ht > 14 ? <span className="bar-count">{b.count}</span> : null}
              </div>
            </div>
          );
        })}
      </div>
      <div className="chart-axis">
        {all.map((k) => {
          const [y, m] = k.split('-');
          return <div key={k}>{['', 'J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][+m]}<br /><span style={{ opacity: 0.5 }}>{m === '01' ? y.slice(2) : ''}</span></div>;
        })}
      </div>
      <div className="chart-legend">{sold.length} closings · {money(sum(Object.values(by), (x) => x.volume))} of volume · best month {moneyShort(Math.max(...vals))}</div>
    </>
  );
}

function CapitalOutTable({ base }) {
  const rows = base.filter((d) => isOwned(d) && (d.acquiredDate || d.auctionDate));
  if (!rows.length) return <div className="rep-empty">No acquisitions on record yet.</div>;
  const by = {};
  rows.forEach((d) => {
    const m = (d.acquiredDate || d.auctionDate).slice(0, 7);
    by[m] = by[m] || { count: 0, amount: 0 };
    by[m].count++; by[m].amount += calc(d).basis;
  });
  const keys = Object.keys(by).sort((a, b) => b.localeCompare(a));
  const total = sum(Object.values(by), (x) => x.amount);
  return (
    <table className="mini"><thead><tr><th>Month</th><th className="r">Homes</th><th className="r">Capital Out</th></tr></thead>
      <tbody>{keys.map((k) => <tr key={k}><td>{monthLabelShort(k)}</td><td className="r">{by[k].count}</td><td className="r">{money(by[k].amount)}</td></tr>)}</tbody>
      <tfoot><tr><td>{rows.length} acquisitions</td><td className="r"></td><td className="r">{money(total)}</td></tr></tfoot>
    </table>
  );
}

function CapitalReturnedTable({ base }) {
  const rows = base.filter((d) => d.stage === 'sold' && d.closedDate);
  if (!rows.length) return <div className="rep-empty">No sales closed yet.</div>;
  const by = {};
  rows.forEach((d) => {
    const m = d.closedDate.slice(0, 7);
    by[m] = by[m] || { count: 0, amount: 0 };
    by[m].count++; by[m].amount += n(d.salePrice);
  });
  const keys = Object.keys(by).sort((a, b) => b.localeCompare(a));
  const total = sum(Object.values(by), (x) => x.amount);
  return (
    <table className="mini"><thead><tr><th>Month</th><th className="r">Homes</th><th className="r">Capital Returned</th></tr></thead>
      <tbody>{keys.map((k) => <tr key={k}><td>{monthLabelShort(k)}</td><td className="r">{by[k].count}</td><td className="r">{money(by[k].amount)}</td></tr>)}</tbody>
      <tfoot><tr><td>{rows.length} homes sold</td><td className="r"></td><td className="r">{money(total)}</td></tr></tfoot>
    </table>
  );
}

function CountyTable({ sold }) {
  if (!sold.length) return <div className="rep-empty">No closings in this period.</div>;
  const by = {};
  sold.forEach((d) => {
    const k = d.county || 'Unassigned'; const c = calc(d);
    by[k] = by[k] || { count: 0, volume: 0, profit: 0, rois: [], days: [] };
    by[k].count++; by[k].volume += n(d.salePrice); by[k].profit += c.profit; by[k].rois.push(c.roi);
    if (c.held !== null) by[k].days.push(c.held);
  });
  const rows = Object.entries(by).sort((a, b) => b[1].profit - a[1].profit);
  const mx = Math.max(...rows.map((r) => Math.abs(r[1].profit)), 1);
  return (
    <table className="mini"><thead><tr><th>County</th><th className="r">Sold</th><th className="r">Volume</th><th className="r">Profit</th><th className="r">Avg ROI</th><th className="r">Avg days</th></tr></thead>
      <tbody>{rows.map(([k, v]) => (
        <tr key={k}>
          <td style={{ whiteSpace: 'normal' }}>{k}<div className="bar-inline"><i style={{ width: (Math.abs(v.profit) / mx * 100) + '%', background: v.profit >= 0 ? 'var(--jade)' : 'var(--oxblood)' }}></i></div></td>
          <td className="r">{v.count}</td><td className="r">{money(v.volume)}</td>
          <td className={'r ' + (v.profit >= 0 ? 'pos' : 'neg')}>{money(v.profit)}</td>
          <td className={'r ' + (avg(v.rois) >= 0 ? 'pos' : 'neg')}>{pct(avg(v.rois))}</td>
          <td className="r">{v.days.length ? Math.round(avg(v.days)) + 'd' : '—'}</td>
        </tr>
      ))}</tbody>
    </table>
  );
}

function RenoTable({ base }) {
  const rows = base.filter((d) => n(d.renoSpent) > 0 && n(d.renoBudget) > 0);
  if (!rows.length) return <div className="rep-empty">No homes with both a budget and actual spend yet.</div>;
  const tB = sum(rows, (d) => n(d.renoBudget)), tS = sum(rows, (d) => n(d.renoSpent)), over = rows.filter((d) => n(d.renoSpent) > n(d.renoBudget)).length;
  const sorted = [...rows].sort((a, b) => calc(b).renoVar - calc(a).renoVar);
  return (
    <table className="mini"><thead><tr><th>Property</th><th className="r">Budget</th><th className="r">Actual</th><th className="r">Variance</th></tr></thead>
      <tbody>{sorted.map((d) => {
        const v = calc(d).renoVar;
        return (
          <tr key={d.id}><td className="addr-cell">{d.address}</td>
            <td className="r">{money(n(d.renoBudget))}</td><td className="r">{money(n(d.renoSpent))}</td>
            <td className={'r ' + (v <= 0 ? 'pos' : 'neg')}>{v > 0 ? '+' : ''}{money(v)}</td></tr>
        );
      })}</tbody>
      <tfoot><tr><td>{rows.length} homes · {over} over budget</td><td className="r">{money(tB)}</td><td className="r">{money(tS)}</td>
        <td className="r">{tS > tB ? '+' : ''}{money(tS - tB)} ({pct(tB ? tS / tB - 1 : 0)})</td></tr></tfoot>
    </table>
  );
}

function SoldTable({ sold, onOpenDrawer }) {
  if (!sold.length) return <div className="rep-empty">No closings in this period.</div>;
  const rows = [...sold].sort((a, b) => calc(b).profit - calc(a).profit);
  const t = { v: 0, b: 0, p: 0 };
  rows.forEach((d) => { const c = calc(d); t.v += n(d.salePrice); t.b += c.basis; t.p += c.profit; });
  return (
    <div className="tw" style={{ border: '1px solid var(--rule)' }}><table style={{ minWidth: 940 }}><thead><tr>
      <th>Property</th><th>Closed</th><th className="r">Purchase</th><th className="r">Reno</th><th className="r">All-in</th>
      <th className="r">Sold</th><th className="r">Profit</th><th className="r">ROI</th><th className="r">Days held</th><th>Buyer side</th></tr></thead>
      <tbody>{rows.map((d) => {
        const c = calc(d);
        return (
          <tr key={d.id} onClick={() => onOpenDrawer(d.id)} style={{ cursor: 'pointer' }}>
            <td className="addr-cell">{d.address}<br /><span className="muted" style={{ fontFamily: 'var(--mono)', fontSize: '10.5px' }}>{[d.city, d.stateAb].filter(Boolean).join(', ')}</span></td>
            <td>{fmtDate(d.closedDate)}</td><td className="r">{money(n(d.purchasePrice))}</td><td className="r">{money(n(d.renoSpent))}</td>
            <td className="r">{money(c.basis)}</td><td className="r">{money(n(d.salePrice))}</td>
            <td className={'r ' + (c.profit >= 0 ? 'pos' : 'neg')}>{money(c.profit)}</td><td className={'r ' + (c.roi >= 0 ? 'pos' : 'neg')}>{pct(c.roi)}</td>
            <td className="r">{c.held !== null ? c.held + 'd' : '—'}</td><td style={{ whiteSpace: 'normal', color: 'var(--dim)' }}>{d.buyer || '—'}</td>
          </tr>
        );
      })}</tbody>
      <tfoot><tr><td colSpan={4}>{rows.length} homes closed</td><td className="r">{money(t.b)}</td><td className="r">{money(t.v)}</td>
        <td className="r">{money(t.p)}</td><td className="r">{pct(t.b ? t.p / t.b : 0)}</td><td colSpan={2}></td></tr></tfoot>
    </table></div>
  );
}

function LostTable({ lost, onOpenDrawer }) {
  if (!lost.length) return <div className="rep-empty">No properties marked outbid in this period.</div>;
  const withBid = lost.filter((d) => n(d.winningBid));
  const rows = [...lost].sort((a, b) => (b.auctionDate || '').localeCompare(a.auctionDate || ''));
  return (
    <table className="mini"><thead><tr><th>Property</th><th>Sale date</th><th className="r">Your max</th><th className="r">Winning bid</th><th className="r">Beat you by</th></tr></thead>
      <tbody>{rows.map((d) => {
        const c = calc(d); const gap = n(d.winningBid) ? n(d.winningBid) - c.maxBid : null;
        return (
          <tr key={d.id} onClick={() => onOpenDrawer(d.id)} style={{ cursor: 'pointer' }}>
            <td className="addr-cell">{d.address}</td><td>{fmtDate(d.auctionDate)}</td>
            <td className="r">{c.maxBid ? money(c.maxBid) : '—'}</td><td className="r">{n(d.winningBid) ? money(n(d.winningBid)) : '—'}</td>
            <td className="r neg">{gap === null ? '—' : money(gap)}</td>
          </tr>
        );
      })}</tbody>
      <tfoot><tr><td colSpan={4}>{lost.length} lost · {withBid.length} with a recorded winning bid</td>
        <td className="r">{withBid.length ? money(avg(withBid.map((d) => n(d.winningBid) - calc(d).maxBid))) + ' avg' : '—'}</td></tr></tfoot>
    </table>
  );
}

function UpcomingClosingsTable({ base, onOpenDrawer }) {
  const rows = base.filter((d) => d.stage === 'contract' && d.expectedClosing).sort((a, b) => a.expectedClosing.localeCompare(b.expectedClosing));
  if (!rows.length) return <div className="rep-empty">No expected closing dates set on properties under contract yet.</div>;
  return (
    <table className="mini"><thead><tr><th>Property</th><th>Expected closing (COE)</th><th className="r">Days out</th><th className="r">Contract price</th></tr></thead>
      <tbody>{rows.map((d) => {
        const days = daysBetween(new Date().toISOString().slice(0, 10), d.expectedClosing);
        const overdue = days < 0;
        return (
          <tr key={d.id} onClick={() => onOpenDrawer(d.id)} style={{ cursor: 'pointer' }}>
            <td className="addr-cell">{d.address}<br /><span className="muted" style={{ fontFamily: 'var(--mono)', fontSize: '10.5px' }}>{[d.city, d.stateAb].filter(Boolean).join(', ')}</span></td>
            <td>{fmtDate(d.expectedClosing)}</td>
            <td className={'r ' + (overdue ? 'neg' : '')}>{overdue ? 'Overdue ' + Math.abs(days) + 'd' : days + 'd'}</td>
            <td className="r">{n(d.contractPrice) ? money(n(d.contractPrice)) : '—'}</td>
          </tr>
        );
      })}</tbody>
    </table>
  );
}

function PipelineTable({ pipeline }) {
  if (!pipeline.length) return <div className="rep-empty">Nothing open.</div>;
  const rows = BOARD_STAGES.filter((s) => s.id !== 'sold').map((s) => {
    const items = pipeline.filter((d) => d.stage === s.id);
    return { s, count: items.length, basis: sum(items, (d) => calc(d).useBasis), profit: sum(items, (d) => calc(d).profit), exit: sum(items, (d) => calc(d).exit) };
  });
  const tB = sum(rows, (r) => r.basis), tP = sum(rows, (r) => r.profit), tE = sum(rows, (r) => r.exit);
  return (
    <table className="mini"><thead><tr><th>Stage</th><th className="r">Homes</th><th className="r">Capital at risk</th><th className="r">Expected exit</th><th className="r">Projected profit</th><th className="r">Projected ROI</th></tr></thead>
      <tbody>{rows.map((r) => (
        <tr key={r.s.id}><td><span className="pill" style={{ color: SC(r.s), borderColor: SC(r.s) + '66' }}>{r.s.name}</span></td>
          <td className="r">{r.count}</td><td className="r">{money(r.basis)}</td><td className="r">{money(r.exit)}</td>
          <td className={'r ' + (r.profit >= 0 ? 'pos' : 'neg')}>{money(r.profit)}</td>
          <td className={'r ' + (r.profit >= 0 ? 'pos' : 'neg')}>{r.basis ? pct(r.profit / r.basis) : '—'}</td></tr>
      ))}</tbody>
      <tfoot><tr><td>Open pipeline</td><td className="r">{pipeline.length}</td><td className="r">{money(tB)}</td>
        <td className="r">{money(tE)}</td><td className="r">{money(tP)}</td><td className="r">{tB ? pct(tP / tB) : '—'}</td></tr></tfoot>
    </table>
  );
}

export function ReportsView({ base, period, periodText, onOpenDrawer, inPeriod }) {
  const sold = base.filter((d) => d.stage === 'sold' && inPeriod(d, 'closedDate'));
  const pipeline = base.filter((d) => ACTIVE_STAGES.includes(d.stage));
  const bidded = base.filter((d) => ['outbid'].includes(d.stage) || (OWNED_STAGES.includes(d.stage) && n(d.purchasePrice) > 0));
  const biddedPeriod = bidded.filter((d) => period === 'all' || inPeriod(d, 'auctionDate'));

  if (!base.length) return <div id="reportBody"><div className="rep-empty">Nothing to report on yet.</div></div>;

  const volume = sum(sold, (d) => n(d.salePrice)), basisT = sum(sold, (d) => calc(d).basis), profit = sum(sold, (d) => calc(d).profit);
  const avgRoi = avg(sold.map((d) => calc(d).roi)), roiW = basisT ? profit / basisT : 0, avgMargin = avg(sold.map((d) => calc(d).margin));
  const held = sold.map((d) => calc(d).held).filter((x) => x !== null);
  const dom = sold.map((d) => calc(d).dom).filter((x) => x !== null);
  const arvHit = sold.filter((d) => n(d.arv)).map((d) => n(d.salePrice) / n(d.arv));
  const winners = sold.filter((d) => calc(d).profit > 0).length;

  const won = biddedPeriod.filter((d) => OWNED_STAGES.includes(d.stage));
  const lost = biddedPeriod.filter((d) => d.stage === 'outbid');
  const winRate = biddedPeriod.length ? won.length / biddedPeriod.length : 0;
  const outbidBy = lost.filter((d) => n(d.winningBid) && calc(d).maxBid).map((d) => n(d.winningBid) - calc(d).maxBid);
  const underMax = won.filter((d) => calc(d).maxBid).map((d) => calc(d).maxBid - n(d.purchasePrice));
  const brokeRule = won.filter((d) => calc(d).overBid).length;
  const saleDates = [...new Set(biddedPeriod.map((d) => d.auctionDate).filter(Boolean))].length;
  const discount = won.filter((d) => calc(d).arv).map((d) => 1 - n(d.purchasePrice) / calc(d).arv);

  return (
    <div id="reportBody">
      <div className="rep-section">
        <div className="rep-head"><h3>Sold performance</h3><p>{sold.length} closed in period</p></div>
        <div className="stat-grid">
          <StatCard k="Homes sold" v={String(sold.length)} s={winners + ' profitable · ' + (sold.length - winners) + ' at a loss'} />
          <StatCard k="Sale volume" v={money(volume)} s={sold.length ? money(volume / sold.length) + ' avg price' : '—'} />
          <StatCard k="Capital returned" v={money(basisT)} s="all-in basis recovered" />
          <StatCard k="Net profit" v={money(profit)} s={sold.length ? money(profit / sold.length) + ' avg per home' : '—'} cls={profit >= 0 ? 'pos' : 'neg'} />
          <StatCard k="Avg ROI" v={pct(avgRoi)} s={pct(roiW) + ' capital-weighted'} cls={avgRoi >= 0 ? 'pos' : 'neg'} />
          <StatCard k="Avg margin" v={pct(avgMargin)} s="profit ÷ sale price" cls={avgMargin >= 0 ? 'pos' : 'neg'} />
          <StatCard k="Avg days held" v={held.length ? Math.round(avg(held)) + 'd' : '—'} s={dom.length ? Math.round(avg(dom)) + 'd listed to close' : '—'} />
          <StatCard k="ARV accuracy" v={arvHit.length ? pct(avg(arvHit) - 1) : '—'} s="sale price vs. your ARV" />
        </div>
      </div>

      <div className="rep-section">
        <div className="rep-head"><h3>Auction performance</h3><p>how the bidding itself is going</p></div>
        <div className="stat-grid">
          <StatCard k="Sale dates worked" v={String(saleDates)} s="auctions you bid at" />
          <StatCard k="Bids placed" v={String(biddedPeriod.length)} s={won.length + ' won · ' + lost.length + ' outbid'} />
          <StatCard k="Win rate" v={pct(winRate)} s="of properties you bid on" cls={winRate >= 0.25 ? 'pos' : ''} />
          <StatCard k="Avg outbid by" v={outbidBy.length ? money(avg(outbidBy)) : '—'} s="how far past your max it went" />
          <StatCard k="Avg room left" v={underMax.length ? money(avg(underMax)) : '—'} s="under your max on wins" cls="pos" />
          <StatCard k="Bought below ARV" v={discount.length ? pct(avg(discount)) : '—'} s="purchase vs. ARV" />
          <StatCard k="Rule breaks" v={String(brokeRule)} s="times you paid over your max" cls={brokeRule ? 'neg' : 'pos'} />
          <StatCard k="Underwritten" v={String(base.filter((d) => n(d.arv)).length)} s={'of ' + base.length + ' properties on file'} />
        </div>
      </div>

      <div className="rep-section"><div className="rep-head"><h3>Upcoming closings</h3><p>everything under contract with an expected COE date, soonest first</p></div><UpcomingClosingsTable base={base} onOpenDrawer={onOpenDrawer} /></div>
      <div className="rep-section"><div className="rep-head"><h3>Profit by month closed</h3><p>bar height is net profit · number inside is homes closed</p></div><MonthlyChart sold={sold} /></div>
      <div className="rep-section"><div className="split">
        <div><div className="rep-head"><h3>Capital out by month</h3><p>spent acquiring, by month acquired</p></div><CapitalOutTable base={base} /></div>
        <div><div className="rep-head"><h3>Capital returned by month</h3><p>gross sale proceeds, by month closed</p></div><CapitalReturnedTable base={base} /></div>
      </div></div>
      <div className="rep-section"><div className="split">
        <div><div className="rep-head"><h3>By county</h3><p>where the money is made</p></div><CountyTable sold={sold} /></div>
        <div><div className="rep-head"><h3>Reno budget accuracy</h3><p>budget vs. actual</p></div><RenoTable base={base.filter(isOwned)} /></div>
      </div></div>
      <div className="rep-section"><div className="rep-head"><h3>Closed homes</h3><p>ranked by net profit</p></div><SoldTable sold={sold} onOpenDrawer={onOpenDrawer} /></div>
      <div className="rep-section"><div className="rep-head"><h3>Homes we lost</h3><p>what it took to beat us</p></div><LostTable lost={lost} onOpenDrawer={onOpenDrawer} /></div>
      <div className="rep-section"><div className="rep-head"><h3>Pipeline forecast</h3><p>everything still open</p></div><PipelineTable pipeline={pipeline} /></div>
    </div>
  );
}
