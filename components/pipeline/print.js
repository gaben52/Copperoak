// Print-window builders — printList / printSelected /
// openPrintWindow / printWonDashboard. These open a brand-new browser window and write a
// standalone HTML document into it via document.write, exactly like the source — that's not
// something React renders, so it stays plain string-building here (esc() is needed again since
// these strings never pass through JSX's automatic escaping).

import { fmtMoney, monthLabel, trusteeSummaryLine, computeActualProfit } from './helpers';
import { getWonByMonth, computeMonthStats, computeFundingStats } from './WonDashboard';

function esc(s) {
  if (s === undefined || s === null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function printRowsHTML(items) {
  return items.map((r, i) => `<tr>
      <td>${i + 1}</td>
      <td>${esc(r.county)}</td>
      <td>${esc(r.address)}</td>
      <td>${esc(r.clearTitle || 'Unknown')}</td>
      <td>${r.mortgageBalance === '' ? '' : fmtMoney(r.mortgageBalance)}</td>
      <td>${r.openBid === '' ? '' : fmtMoney(r.openBid)}</td>
      <td>${r.arv === '' ? '' : fmtMoney(r.arv)}</td>
      <td>${r.arv2 === '' ? '' : fmtMoney(r.arv2)}</td>
      <td><b>${r.maxBid === '' ? '' : fmtMoney(r.maxBid)}</b></td>
      <td>${esc(r.notes)}</td>
    </tr>`).join('');
}

export function openPrintWindow(list, grouped, title) {
  const headerRow = `<tr>
    <th>#</th><th>County</th><th>Address</th><th>Clear Title</th><th>Mortgage Balance</th>
    <th>Opening Bid</th><th>ARV</th><th>2nd ARV</th><th>Max Bid</th><th>Notes</th>
  </tr>`;
  let bodyHTML = '';
  if (grouped) {
    const groups = {}; const order = [];
    list.forEach((r) => {
      const key = (r.state || '—') + ' · ' + (r.county || 'Unknown County');
      if (!groups[key]) { groups[key] = []; order.push(key); }
      groups[key].push(r);
    });
    order.forEach((key) => {
      bodyHTML += `<tr class="grp"><td colspan="10">${esc(key)} &nbsp;(${groups[key].length})</td></tr>`;
      bodyHTML += printRowsHTML(groups[key]);
    });
  } else {
    bodyHTML = printRowsHTML(list);
  }
  const win = window.open('', '_blank');
  if (!win) { alert('Please allow pop-ups to print the auction list.'); return; }
  win.document.write(`<!DOCTYPE html><html><head><title>${esc(title)} - ${new Date().toLocaleDateString()}</title>
    <style>
      body{font-family:Arial, Helvetica, sans-serif; padding:20px; color:#111;}
      h1{margin:0 0 4px;font-size:20px;}
      .sub{color:#555;font-size:12px;margin-bottom:16px;}
      table{border-collapse:collapse;width:100%;font-size:11px;}
      th,td{border:1px solid #999;padding:5px 6px;text-align:left;vertical-align:top;}
      th{background:#f2f3f4;color:#14171a;font-weight:600;}
      tr.grp td{background:#eceef0;font-weight:600;font-size:12px;}
      @media print{
        @page{ size: landscape; margin: 12mm; }
        button{ display:none; }
      }
      .print-bar{margin-bottom:14px;}
      .print-bar button{font-size:13px;padding:8px 14px;cursor:pointer;}
    </style></head>
    <body>
      <div class="print-bar"><button onclick="window.print()">Print</button></div>
      <h1>${esc(title)}</h1>
      <div class="sub">Generated ${new Date().toLocaleString()} &middot; ${list.length} propert${list.length === 1 ? 'y' : 'ies'}</div>
      <table><thead>${headerRow}</thead><tbody>${bodyHTML}</tbody></table>
    </body></html>`);
  win.document.close();
  const doPrint = () => { try { win.focus(); win.print(); } catch (e) { /* ignore */ } };
  win.onload = doPrint;
  setTimeout(doPrint, 400);
}

export function printList(filteredRows, currentCountyPage) {
  if (!filteredRows.length) { alert('No properties match the current filters to print.'); return; }
  const grouped = currentCountyPage === 'ALL';
  openPrintWindow(filteredRows, grouped, 'Acquire Hub — Auction List');
}

export function printSelected(rows, selectedIds) {
  const list = rows.filter((r) => selectedIds.has(r.id));
  if (!list.length) { alert('No properties selected to print.'); return; }
  openPrintWindow(list, false, 'Selected Properties');
}

export function printWonDashboard(allRecords, currentMonth, fundingByMonth) {
  const groups = getWonByMonth(allRecords, currentMonth);
  const w = window.open('', '_blank');
  const rowsHTML = groups.map((g) => {
    const s = computeMonthStats(g.rows);
    const fs = computeFundingStats(g.month, s, fundingByMonth);
    const propRows = g.rows.map((r) => `
      <tr>
        <td>${esc(`${r.address || '(no address)'}${r.city ? ', ' + r.city : ''}${r.state ? ', ' + r.state : ''}${r.county ? ' (' + r.county + ' County)' : ''}`)}</td>
        <td style="text-align:right;">${r.winningBid === '' ? '—' : fmtMoney(r.winningBid)}</td>
        <td style="text-align:right;">${r.arv === '' ? '—' : fmtMoney(r.arv)}</td>
        <td style="text-align:right;">${r.renoCost === '' ? '—' : fmtMoney(r.renoCost)}</td>
        <td style="text-align:right;">${computeActualProfit(r) === null ? '—' : fmtMoney(computeActualProfit(r))}</td>
        <td>${esc(r.propertyStatus || '—')}</td>
        <td style="text-align:right;">${r.expectedRefund === '' ? '—' : fmtMoney(r.expectedRefund)}</td>
        <td>${esc(trusteeSummaryLine(r))}</td>
        <td>${esc(r.paymentMethod || '—')}</td>
        <td>${esc(r.occupancy || '—')}</td>
      </tr>`).join('');
    const uncatRow = s.uncategorizedCount > 0
      ? `<tr><td colspan="4" style="color:#8a6212;">&#9888; ${s.uncategorizedCount} propert${s.uncategorizedCount === 1 ? 'y' : 'ies'} missing Payment Method</td><td colspan="4">${fmtMoney(s.usedUncategorized)} unaccounted for</td></tr>`
      : '';
    return `
      <h2>${esc(monthLabel(g.month))} — ${s.count} propert${s.count === 1 ? 'y' : 'ies'} won</h2>
      <table class="ptbl">
        <tr><td><b>Total Purchase Price</b></td><td>${fmtMoney(s.purchaseTotal)}</td><td><b>Total ARV</b></td><td>${fmtMoney(s.arvTotal)}</td></tr>
        <tr><td><b>Total Renovation Budget</b></td><td>${fmtMoney(s.renoTotal)}</td><td><b>Total Estimated Profit</b></td><td>${fmtMoney(s.profitTotal)}</td></tr>
      </table>
      <table class="ptbl">
        <tr><td colspan="4"><b>Expected Refunds</b></td></tr>
        <tr><td>Total Expected Refund</td><td colspan="3">${fmtMoney(s.refundTotal)}</td></tr>
      </table>
      <table class="ptbl">
        <tr><td colspan="4"><b>Funds Received This Month</b></td></tr>
        <tr><td>Auction.com</td><td>${fs.auctionCom === '' ? '—' : fmtMoney(fs.auctionCom)}</td><td>Cashier's Checks</td><td>${fs.cashierChecks === '' ? '—' : fmtMoney(fs.cashierChecks)}</td></tr>
        <tr><td>Total Funds Received</td><td colspan="3">${fmtMoney(fs.totalReceived)}</td></tr>
      </table>
      <table class="ptbl">
        <tr><td colspan="4"><b>By Payment Method</b></td></tr>
        <tr><td>Used via Auction.com</td><td>${fmtMoney(s.usedAuctionCom)}</td><td class="hl">Return from Auction.com</td><td class="hl">${fmtMoney(fs.returnFromAuctionCom)}</td></tr>
        <tr><td>Used via Cashier's Checks</td><td>${fmtMoney(s.usedCashierChecks)}</td><td>Cashier's Checks Return (before refunds)</td><td>${fmtMoney(fs.cashierChecksReturnGross)}</td></tr>
        <tr><td>Less: Total Expected Refund</td><td>&minus;${fmtMoney(s.refundTotal)}</td><td class="hl">Return from Cashier's Checks</td><td class="hl">${fmtMoney(fs.returnFromCashierChecks)}</td></tr>
        ${uncatRow}
        <tr><td class="hl"><b>Total Return to Alta Funding &amp; Investment</b></td><td class="hl" colspan="3"><b>${fmtMoney(fs.amountToReturn)}</b></td></tr>
      </table>
      <table class="dtbl">
        <thead><tr><th>Full Property Address, City, State &amp; County</th><th>1. Purchase Price</th><th>2. ARV</th><th>3. Reno Budget</th><th>4. Est. Profit</th><th>5. Property Status</th><th>6. Expected Refund</th><th>7. Trustee Info</th><th>8. Payment Method</th><th>9. Occupancy</th></tr></thead>
        <tbody>${propRows}</tbody>
      </table>`;
  }).join('<hr>');
  w.document.write(`
    <html><head><title>Acquire Hub — Acquired Properties: ${esc(monthLabel(currentMonth))}</title>
    <style>
      @page{size:landscape;}
      *{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
      body{font-family:Arial,Helvetica,sans-serif;padding:24px;color:#111;}
      h1{margin-bottom:4px;}
      h2{margin-top:24px;margin-bottom:8px;color:#14171a;font-size:15px;}
      table.ptbl{border-collapse:collapse;margin-bottom:12px;font-size:13px;}
      table.ptbl td{padding:4px 10px;}
      table.ptbl td.hl{background:#f3eee6;font-weight:600;border:1px solid #c9a978;padding:5px 10px;}
      table.dtbl{border-collapse:collapse;width:100%;font-size:11px;margin-bottom:10px;}
      table.dtbl th, table.dtbl td{border:1px solid #ccc;padding:5px 7px;text-align:left;}
      hr{margin:20px 0;border:none;border-top:2px solid #ccc;}
    </style></head><body>
    <h1>Acquire Hub · Acquired Properties — ${esc(monthLabel(currentMonth))}</h1>
    <div style="color:#666;font-size:12px;margin-bottom:10px;">Generated ${new Date().toLocaleString()}</div>
    ${groups.length ? rowsHTML : `<p>No properties marked "We Won" for ${esc(monthLabel(currentMonth))}.</p>`}
    </body></html>
  `);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 300);
}
