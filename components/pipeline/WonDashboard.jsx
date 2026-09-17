'use client';
// Ported from the Foreclosure Pre-Bid Command Center <script> — getWonByMonth / computeMonthStats
// / computeFundingStats / renderWonDashboard / trusteeSummaryLine.

import { fmtMoney, monthLabel, auctionMonthOf, trusteeSummaryLine, computeActualProfit } from './helpers';

export function getWonByMonth(allRecords, currentMonth) {
  const won = allRecords.filter((r) => r.outcome === 'We Won');
  const matching = currentMonth === 'Unscheduled'
    ? won.filter((r) => auctionMonthOf(r) === 'Unscheduled')
    : won.filter((r) => { const mk = auctionMonthOf(r); return mk === currentMonth || mk === 'Unscheduled'; });
  if (!matching.length) return [];
  return [{ month: currentMonth, rows: matching }];
}

export function computeMonthStats(monthRows) {
  const sum = (key, list) => (list || monthRows).reduce((s, r) => { const v = parseFloat(r[key]); return s + (isNaN(v) ? 0 : v); }, 0);
  const profitable = monthRows.filter((r) => computeActualProfit(r) !== null);
  const profitTotal = profitable.reduce((s, r) => s + computeActualProfit(r), 0);
  const auctionComRows = monthRows.filter((r) => r.paymentMethod === 'Auction.com');
  const cashierRows = monthRows.filter((r) => r.paymentMethod === "Cashier's Check (On-Site)");
  const uncategorizedRows = monthRows.filter((r) => !r.paymentMethod);
  return {
    count: monthRows.length,
    purchaseTotal: sum('winningBid'),
    renoTotal: sum('renoCost'),
    arvTotal: sum('arv'),
    refundTotal: sum('expectedRefund'),
    profitTotal,
    profitCount: profitable.length,
    usedAuctionCom: sum('winningBid', auctionComRows),
    usedCashierChecks: sum('winningBid', cashierRows),
    usedUncategorized: sum('winningBid', uncategorizedRows),
    uncategorizedCount: uncategorizedRows.length,
  };
}

export function computeFundingStats(monthKey, s, fundingByMonth) {
  const fund = fundingByMonth[monthKey] || { id: null, auctionCom: '', cashierChecks: '' };
  const auctionCom = parseFloat(fund.auctionCom);
  const cashierChecks = parseFloat(fund.cashierChecks);
  const auctionComReceived = isNaN(auctionCom) ? 0 : auctionCom;
  const cashierChecksReceived = isNaN(cashierChecks) ? 0 : cashierChecks;
  const totalReceived = auctionComReceived + cashierChecksReceived;
  const totalUsed = s.purchaseTotal;
  const returnFromAuctionCom = auctionComReceived - s.usedAuctionCom;
  const cashierChecksReturnGross = cashierChecksReceived - s.usedCashierChecks;
  const returnFromCashierChecks = cashierChecksReturnGross - s.refundTotal;
  return {
    auctionCom: fund.auctionCom, cashierChecks: fund.cashierChecks,
    totalReceived, totalUsed, returnFromAuctionCom, cashierChecksReturnGross, returnFromCashierChecks,
    amountToReturn: returnFromAuctionCom + returnFromCashierChecks,
  };
}

export function buildWonSummaryText(allRecords, currentMonth, fundingByMonth) {
  const groups = getWonByMonth(allRecords, currentMonth);
  if (!groups.length) return `No properties marked "We Won" for ${monthLabel(currentMonth)}.`;
  const lines = ['WON PROPERTIES — MONTHLY SUMMARY', '='.repeat(34), ''];
  groups.forEach((g) => {
    const s = computeMonthStats(g.rows);
    const fs = computeFundingStats(g.month, s, fundingByMonth);
    lines.push(`${monthLabel(g.month)} — ${s.count} propert${s.count === 1 ? 'y' : 'ies'} won`);
    lines.push(`  Total Purchase Price:     ${fmtMoney(s.purchaseTotal)}`);
    lines.push(`  Total ARV:                ${fmtMoney(s.arvTotal)}`);
    lines.push(`  Total Renovation Budget:  ${fmtMoney(s.renoTotal)}`);
    lines.push(`  Total Estimated Profit:   ${fmtMoney(s.profitTotal)}`);
    lines.push('');
    lines.push(`  EXPECTED REFUNDS`);
    lines.push(`    Total Expected Refund:  ${fmtMoney(s.refundTotal)}`);
    lines.push('');
    lines.push(`  FUNDS RECEIVED THIS MONTH`);
    lines.push(`    Auction.com:            ${fs.auctionCom === '' ? '—' : fmtMoney(fs.auctionCom)}`);
    lines.push(`    Cashier's Checks:       ${fs.cashierChecks === '' ? '—' : fmtMoney(fs.cashierChecks)}`);
    lines.push(`    Total Funds Received:   ${fmtMoney(fs.totalReceived)}`);
    lines.push('');
    lines.push(`  BY PAYMENT METHOD`);
    lines.push(`    Used via Auction.com:                    ${fmtMoney(s.usedAuctionCom)}`);
    lines.push(`    Return from Auction.com:                 ${fmtMoney(fs.returnFromAuctionCom)}`);
    lines.push(`    Used via Cashier's Checks:               ${fmtMoney(s.usedCashierChecks)}`);
    lines.push(`    Cashier's Checks Return (before refunds): ${fmtMoney(fs.cashierChecksReturnGross)}`);
    lines.push(`    Less: Total Expected Refund:             -${fmtMoney(s.refundTotal)}`);
    lines.push(`    Return from Cashier's Checks:             ${fmtMoney(fs.returnFromCashierChecks)}`);
    if (s.uncategorizedCount > 0) {
      lines.push(`    ⚠ ${s.uncategorizedCount} propert${s.uncategorizedCount === 1 ? 'y' : 'ies'} missing Payment Method (${fmtMoney(s.usedUncategorized)} unaccounted for)`);
    }
    lines.push(`    Total Return to Alta Funding & Investment: ${fmtMoney(fs.amountToReturn)}`);
    lines.push('');
    g.rows.forEach((r) => {
      lines.push(`  ${r.address || '(no address)'}${r.city ? ', ' + r.city : ''}${r.state ? ', ' + r.state : ''}${r.county ? ' (' + r.county + ' County)' : ''}`);
      lines.push(`    1. Purchase Price: ${r.winningBid === '' ? '—' : fmtMoney(r.winningBid)}`);
      lines.push(`    2. ARV: ${r.arv === '' ? '—' : fmtMoney(r.arv)}`);
      lines.push(`    3. Renovation Budget: ${r.renoCost === '' ? '—' : fmtMoney(r.renoCost)}`);
      lines.push(`    4. Estimated Profit: ${computeActualProfit(r) === null ? '—' : fmtMoney(computeActualProfit(r))}`);
      lines.push(`    5. Property Status: ${r.propertyStatus || '—'}`);
      lines.push(`    6. Expected Refund Amount: ${r.expectedRefund === '' ? '—' : fmtMoney(r.expectedRefund)}`);
      lines.push(`    7. Trustee Information: ${trusteeSummaryLine(r)}`);
      lines.push(`    8. Payment Method: ${r.paymentMethod || '—'}`);
      lines.push(`    9. Occupancy: ${r.occupancy || '—'}`);
      lines.push('');
    });
  });
  return lines.join('\n');
}

export default function WonDashboard({ allRecords, currentMonth, fundingByMonth, onUpdateFunding, onCopySummary, onPrint, readOnly }) {
  const groups = getWonByMonth(allRecords, currentMonth);
  if (!groups.length) {
    return (
      <div className="won-dash">
        <div className="won-dash-head"><div className="won-dash-title">&#127942; Won Properties &mdash; {monthLabel(currentMonth)} Analytics</div></div>
        <div className="won-dash-empty">No properties marked &quot;We Won&quot; for {monthLabel(currentMonth)}. Switch months above to see a different month&apos;s analytics, or mark a property&apos;s Auction Outcome to have it show up here.</div>
      </div>
    );
  }
  return (
    <div className="won-dash">
      <div className="won-dash-head">
        <div className="won-dash-title">&#127942; Won Properties &mdash; {monthLabel(currentMonth)} Analytics</div>
        <div className="won-dash-actions">
          <button className="btn-green" onClick={onCopySummary}>&#128203; Copy Summary</button>
          <button onClick={onPrint}>&#128424; Print / PDF</button>
        </div>
      </div>
      <div className="won-month-grid">
        {groups.map((g) => {
          const s = computeMonthStats(g.rows);
          const fs = computeFundingStats(g.month, s, fundingByMonth);
          const fund = fundingByMonth[g.month] || { auctionCom: '', cashierChecks: '' };
          return (
            <div className="won-month-card" key={g.month}>
              <div className="wmc-title">{monthLabel(g.month)}</div>
              <div className="wmc-count">{s.count} propert{s.count === 1 ? 'y' : 'ies'} won</div>
              <div className="wmc-row"><span>Total Purchase Price</span><b>{fmtMoney(s.purchaseTotal)}</b></div>
              <div className="wmc-row"><span>Total ARV</span><b>{fmtMoney(s.arvTotal)}</b></div>
              <div className="wmc-row"><span>Total Renovation Budget</span><b>{fmtMoney(s.renoTotal)}</b></div>
              <div className="wmc-row profit-row"><span>Total Estimated Profit</span><b style={{ color: s.profitTotal < 0 ? 'var(--red)' : 'var(--green)' }}>{fmtMoney(s.profitTotal)}</b></div>
              {s.profitCount < s.count && <div className="wmc-count">({s.profitCount}/{s.count} have ARV+Winning Bid)</div>}

              <div className="wmc-fund-head">EXPECTED REFUNDS</div>
              <div className="wmc-row"><span>Total Expected Refund</span><b>{fmtMoney(s.refundTotal)}</b></div>

              <div className="wmc-fund-head">FUNDS RECEIVED THIS MONTH</div>
              <div className="wmc-fund-row">
                <label>Auction.com $</label>
                <input className="wmc-fund-input" disabled={readOnly}
                  key={'ac-' + g.month + '-' + fund.auctionCom}
                  defaultValue={fund.auctionCom === '' ? '' : fmtMoney(fund.auctionCom)}
                  onFocus={(e) => { e.target.value = fund.auctionCom === '' ? '' : String(fund.auctionCom); }}
                  onBlur={(e) => onUpdateFunding(g.month, 'auctionCom', e.target.value)} />
              </div>
              <div className="wmc-fund-row">
                <label>Cashier&apos;s Checks $</label>
                <input className="wmc-fund-input" disabled={readOnly}
                  key={'cc-' + g.month + '-' + fund.cashierChecks}
                  defaultValue={fund.cashierChecks === '' ? '' : fmtMoney(fund.cashierChecks)}
                  onFocus={(e) => { e.target.value = fund.cashierChecks === '' ? '' : String(fund.cashierChecks); }}
                  onBlur={(e) => onUpdateFunding(g.month, 'cashierChecks', e.target.value)} />
              </div>
              <div className="wmc-row"><span>Total Funds Received</span><b>{fmtMoney(fs.totalReceived)}</b></div>

              <div className="wmc-fund-head">BY PAYMENT METHOD</div>
              <div className="wmc-row"><span>Used via Auction.com</span><b>{fmtMoney(s.usedAuctionCom)}</b></div>
              <div className="wmc-row"><span>Return from Auction.com</span><b style={{ color: fs.returnFromAuctionCom < 0 ? 'var(--red)' : 'var(--green)' }}>{fmtMoney(fs.returnFromAuctionCom)}</b></div>
              <div className="wmc-row"><span>Used via Cashier&apos;s Checks</span><b>{fmtMoney(s.usedCashierChecks)}</b></div>
              <div className="wmc-row"><span>Cashier&apos;s Checks Return (before refunds)</span><b>{fmtMoney(fs.cashierChecksReturnGross)}</b></div>
              <div className="wmc-row"><span>Less: Total Expected Refund</span><b>&minus;{fmtMoney(s.refundTotal)}</b></div>
              <div className="wmc-row"><span>Return from Cashier&apos;s Checks</span><b style={{ color: fs.returnFromCashierChecks < 0 ? 'var(--red)' : 'var(--green)' }}>{fmtMoney(fs.returnFromCashierChecks)}</b></div>
              {s.uncategorizedCount > 0 && <div className="wmc-count" style={{ color: 'var(--yellow)' }}>&#9888; {s.uncategorizedCount} propert{s.uncategorizedCount === 1 ? 'y' : 'ies'} missing Payment Method — category totals below are incomplete</div>}
              <div className="wmc-row profit-row"><span>Total Return to Alta Funding &amp; Investment</span><b style={{ color: fs.amountToReturn < 0 ? 'var(--red)' : 'var(--green)' }}>{fmtMoney(fs.amountToReturn)}</b></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
