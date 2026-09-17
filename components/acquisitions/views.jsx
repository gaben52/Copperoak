'use client';
// Ported from Acquisitions_Center_LIVE.html — renderPrebid / renderBidSheet / renderBoard /
// renderLedger, converted from innerHTML template strings into JSX.

import { useState } from 'react';
import {
  STAGE_BY_ID, BOARD_STAGES, PREBID_STAGES, OPEN_BID_STAGES, LCOLS,
} from './constants';
import { calc, money, moneyShort, pct, fmtDate, fmtDateLong, sum, n, today, nextDate } from './helpers';

const SC = (s) => s.color;

/* ================= pre-bid ================= */
export function PrebidView({ rows, onOpenDrawer, onFieldChange, onToggleReady }) {
  const list = rows.filter((d) => PREBID_STAGES.includes(d.stage));
  const open = list.filter((d) => OPEN_BID_STAGES.includes(d.stage));
  const ready = list.filter((d) => d.stage === 'bidready');
  const lost = list.filter((d) => d.stage === 'outbid');
  const exposure = sum(ready, (d) => calc(d).maxBid);
  const projected = sum(ready, (d) => calc(d).profit);
  const dates = [...new Set(open.map((d) => d.auctionDate).filter(Boolean))].sort();
  const strip = [
    { k: 'Still bidding', v: String(open.length) },
    { k: 'Bid ready', v: String(ready.length) },
    { k: 'Max bid exposure', v: moneyShort(exposure) },
    { k: 'Projected profit if all won', v: moneyShort(projected) },
    { k: 'Lost at auction', v: String(lost.length) },
    { k: 'Next sale date', v: dates.length ? fmtDate(dates.find((x) => x >= today()) || dates[dates.length - 1]) : '—' },
  ];

  return (
    <>
      <div id="prebidStrip" className="substrip">
        {strip.map((c) => (
          <div className="cell" key={c.k}><div className="k">{c.k}</div><div className="v">{c.v}</div></div>
        ))}
      </div>
      <div id="prebidBody">
        {!list.length ? (
          <div className="view-empty">Nothing in pre-bid.<br />Import an auction list, or add a property by hand.</div>
        ) : (
          <div className="tw"><table><thead><tr>
            <th>Property</th><th>Sale date</th><th className="r">Opening bid</th><th className="r">Est. value</th>
            <th className="r">ARV</th><th className="r">Reno</th><th className="r">Carry</th><th className="r">Max bid</th>
            <th className="r">Room</th><th className="r">Profit</th><th className="r">ROI</th><th>Ready</th>
          </tr></thead><tbody>
            {list.map((d) => {
              const c = calc(d);
              const isReady = d.stage === 'bidready';
              const isLost = d.stage === 'outbid';
              return (
                <tr key={d.id} style={isLost ? { opacity: 0.55 } : undefined}>
                  <td className="addr-cell" onClick={() => onOpenDrawer(d.id)}>
                    {d.address || 'Untitled'}<br />
                    <span className="muted" style={{ fontFamily: 'var(--mono)', fontSize: '10.5px' }}>
                      {[d.city, d.stateAb].filter(Boolean).join(', ')}{d.case ? ' · ' + d.case : ''}
                    </span>
                  </td>
                  <td>{fmtDate(d.auctionDate)}</td>
                  <td className="r">{n(d.openingBid) ? money(n(d.openingBid)) : '—'}</td>
                  <td className="r muted">{n(d.estValue) ? money(n(d.estValue)) : '—'}</td>
                  <td className="r"><input className="cell-inp" defaultValue={n(d.arv) || ''} placeholder="ARV" inputMode="numeric"
                    onBlur={(e) => onFieldChange(d.id, 'arv', e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }} /></td>
                  <td className="r"><input className="cell-inp" defaultValue={n(d.renoBudget) || ''} placeholder="reno" inputMode="numeric"
                    onBlur={(e) => onFieldChange(d.id, 'renoBudget', e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }} /></td>
                  <td className="r"><input className="cell-inp" defaultValue={n(d.holding) || ''} placeholder="carry" inputMode="numeric"
                    onBlur={(e) => onFieldChange(d.id, 'holding', e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }} /></td>
                  <td className="r" style={{ color: c.noRoom ? 'var(--oxblood)' : 'var(--brass)' }}>
                    {c.maxBid ? money(c.maxBid) : '—'}{n(d.maxBidOverride) ? <span className="muted"> set</span> : null}
                  </td>
                  <td className={'r ' + (c.room >= 0 ? 'pos' : 'neg')}>{n(d.openingBid) && c.maxBid ? money(c.room) : '—'}</td>
                  <td className={'r ' + (c.profit >= 0 ? 'pos' : 'neg')}>{c.arv ? money(c.profit) : '—'}</td>
                  <td className={'r ' + (c.roi >= 0 ? 'pos' : 'neg')}>{c.arv ? pct(c.roi) : '—'}</td>
                  <td>
                    {isLost ? (
                      <span className="pill" style={{ color: 'var(--dim)', borderColor: 'var(--rule)' }}>
                        Lost{n(d.winningBid) ? ' at ' + moneyShort(n(d.winningBid)) : ''}
                      </span>
                    ) : (
                      <button className="btn btn-xs" style={isReady ? { borderColor: 'var(--brass)', color: 'var(--brass)' } : undefined}
                        onClick={() => onToggleReady(d.id)}>{isReady ? 'Bid ready' : 'Mark ready'}</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot><tr><td colSpan={7}>{open.length} still bidding · {ready.length} bid ready · {lost.length} lost</td>
            <td className="r">{money(exposure)}</td><td></td><td className="r">{money(projected)}</td><td colSpan={2}></td></tr></tfoot>
          </table></div>
        )}
      </div>
    </>
  );
}

/* ================= bid sheet ================= */
export function BidSheetView({ deals, bidDate, onBidDateChange, onOpenDrawer, onWon, onLost, onUndo, onPrintBid }) {
  const all = deals.filter((d) => d.auctionDate);
  const dates = [...new Set(all.map((d) => d.auctionDate))].sort();
  const effectiveDate = dates.includes(bidDate) ? bidDate : (dates.find((x) => x >= today()) || dates[dates.length - 1] || '');

  if (!dates.length) {
    return (
      <>
        <div className="period-bar">
          <span className="lab">Sale date</span>
          <select className="inp" id="bidDate"></select>
          <span className="sep"></span>
          <span className="lab" id="bidSummary"></span>
          <span style={{ flex: 1 }}></span>
          <button className="btn btn-sm" id="printBid" onClick={onPrintBid}>Print bid sheet</button>
        </div>
        <div id="bidBody"><div className="view-empty">No sale dates yet.<br />Import a list or set a sale date on a property.</div></div>
      </>
    );
  }

  const rows = deals.filter((d) => d.auctionDate === effectiveDate)
    .sort((a, b) => (a.stage === 'bidready' ? 0 : 1) - (b.stage === 'bidready' ? 0 : 1) || calc(b).profit - calc(a).profit);
  const readyRows = rows.filter((d) => d.stage === 'bidready');
  const exposure = sum(readyRows, (d) => calc(d).maxBid);

  return (
    <>
      <div className="period-bar">
        <span className="lab">Sale date</span>
        <select className="inp" id="bidDate" value={effectiveDate} onChange={(e) => onBidDateChange(e.target.value)}>
          {dates.map((d) => <option value={d} key={d}>{fmtDateLong(d)}</option>)}
        </select>
        <span className="sep"></span>
        <span className="lab" id="bidSummary">{rows.length} on the docket · {readyRows.length} bid ready · {money(exposure)} max exposure</span>
        <span style={{ flex: 1 }}></span>
        <button className="btn btn-sm" id="printBid" onClick={onPrintBid}>Print bid sheet</button>
      </div>
      <div id="bidBody">
        {!rows.length ? <div className="view-empty">Nothing scheduled for this date.</div> : rows.map((d) => {
          const c = calc(d);
          const settled = ['acquired', 'reno', 'contract', 'sold', 'outbid'].includes(d.stage);
          let outcome = null;
          if (d.stage === 'outbid') {
            outcome = <div className="bid-outcome neg">Outbid{n(d.winningBid) ? ' at ' + money(n(d.winningBid)) + ' · ' + money(n(d.winningBid) - c.maxBid) + ' over your max' : ''}</div>;
          } else if (settled) {
            outcome = <div className="bid-outcome pos">Won at {money(n(d.purchasePrice))}{c.maxBid ? ' · ' + money(c.maxBid - n(d.purchasePrice)) + ' under max' : ''}</div>;
          }
          return (
            <div className={'bid-row ' + (settled ? 'done' : '')} key={d.id}>
              <div className="bid-main">
                <div className="addr" style={{ cursor: 'pointer' }} onClick={() => onOpenDrawer(d.id)}>{d.address || 'Untitled'}</div>
                <div className="sub">{[d.city, d.stateAb, d.zip].filter(Boolean).join(' ')}{d.case ? ' · ' + d.case : ''}{d.attorney ? ' · ' + d.attorney : ''}</div>
                <div className="bid-figs">
                  <div className="bid-fig"><div className="k">Max bid</div><div className="v big">{c.maxBid ? money(c.maxBid) : 'not set'}</div></div>
                  <div className="bid-fig"><div className="k">Opening bid</div><div className="v">{n(d.openingBid) ? money(n(d.openingBid)) : '—'}</div></div>
                  <div className="bid-fig"><div className="k">ARV</div><div className="v">{c.arv ? money(c.arv) : '—'}</div></div>
                  <div className="bid-fig"><div className="k">Reno</div><div className="v">{money(n(d.renoBudget))}</div></div>
                  <div className="bid-fig"><div className="k">Profit at max</div><div className={'v ' + (c.profit >= 0 ? 'pos' : 'neg')}>{c.arv ? money(c.profit) : '—'}</div></div>
                  <div className="bid-fig"><div className="k">Beds / baths / sqft</div><div className="v">{d.beds || '—'} / {d.baths || '—'} / {d.sqft ? Number(d.sqft).toLocaleString() : '—'}</div></div>
                </div>
                <div className="walkaway">Walk away above <b>{c.maxBid ? money(c.maxBid) : '—'}</b>{d.notes ? ' · ' + d.notes : ''}</div>
              </div>
              <div className="bid-act">
                {outcome || <BidActForm dealId={d.id} onWon={onWon} onLost={onLost} onOpenDrawer={onOpenDrawer} />}
                {settled && <button className="btn btn-xs" style={{ alignSelf: 'flex-start' }} onClick={() => onUndo(d.id)}>Undo outcome</button>}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function BidActForm({ dealId, onWon, onLost, onOpenDrawer }) {
  let amtRef;
  return (
    <>
      <input className="inp" type="number" inputMode="numeric" placeholder="final bid amount" ref={(el) => (amtRef = el)} />
      <div className="row">
        <button className="btn btn-sm btn-win" style={{ flex: 1 }} onClick={() => onWon(dealId, amtRef ? amtRef.value : '')}>Won</button>
        <button className="btn btn-sm btn-lose" style={{ flex: 1 }} onClick={() => onLost(dealId, amtRef ? amtRef.value : '')}>Outbid</button>
      </div>
      <button className="btn btn-xs" style={{ alignSelf: 'flex-start' }} onClick={() => onOpenDrawer(dealId)}>Open file</button>
    </>
  );
}

/* ================= board ================= */
function MarginBar({ d }) {
  const c = calc(d);
  if (!c.arv) return <div className="margin"><div className="margin-legend"><span>Add an ARV to see the margin</span></div></div>;
  const base = c.owned ? n(d.purchasePrice) : c.maxBid;
  const pp = Math.min(100, (base / c.arv) * 100);
  const reno = Math.min(Math.max(0, 100 - pp), ((c.owned ? n(d.renoSpent) : n(d.renoBudget)) / c.arv) * 100);
  const tick = Math.min(99.5, (c.maxBid / c.arv) * 100);
  return (
    <div className="margin">
      <div className="margin-track">
        <div className={'margin-fill ' + (c.overBid ? 'hot' : '')} style={{ width: pp + '%' }}></div>
        <div className="margin-fill reno" style={{ left: pp + '%', width: reno + '%' }}></div>
        {c.maxBid > 0 && <div className="margin-tick" style={{ left: tick + '%' }} title={`Max bid ${money(c.maxBid)}`}></div>}
      </div>
      <div className="margin-legend">
        <span>Basis {moneyShort(c.useBasis)} / {c.isSold ? 'Sold' : 'ARV'} {moneyShort(c.isSold ? n(d.salePrice) : c.arv)}</span>
        <span><b className={c.profit >= 0 ? '' : 'neg'}>{moneyShort(c.profit)}</b> · {pct(c.roi)} ROI</span>
      </div>
    </div>
  );
}

function DealCard({ d, onOpenDrawer, onAdvance }) {
  const c = calc(d);
  const st = STAGE_BY_ID[d.stage];
  const nd = nextDate(d);
  const tags = [];
  tags.push(d.deedRecorded
    ? <span className="tag good" key="deed">&#10003; Deed Recorded</span>
    : <span className="tag warn" key="deed">Deed Not Recorded</span>);
  if (c.overBid) tags.push(<span className="tag warn" key="over">Paid over max</span>);
  if (c.noRoom && PREBID_STAGES.includes(d.stage)) tags.push(<span className="tag warn" key="noroom">Opening bid too high</span>);
  if (d.stage === 'reno' && n(d.renoBudget) > 0 && n(d.renoSpent) > n(d.renoBudget)) tags.push(<span className="tag warn" key="overbudget">Over budget</span>);
  if (c.isSold && c.roi >= 0.25) tags.push(<span className="tag good" key="roi">{pct(c.roi)} ROI</span>);
  if (d.county) tags.push(<span className="tag" key="county">{d.county}</span>);
  if (nd) tags.push(<span className="tag" key="nd">{fmtDate(nd)}</span>);

  return (
    <article className="card" draggable data-id={d.id}
      style={{ borderLeftColor: c.overBid ? 'var(--oxblood)' : SC(st) }}
      onDragStart={(e) => { e.dataTransfer.setData('text/plain', d.id); e.dataTransfer.effectAllowed = 'move'; e.currentTarget.classList.add('dragging'); }}
      onDragEnd={(e) => e.currentTarget.classList.remove('dragging')}
      onClick={(e) => { if (!e.target.closest('.js-advance')) onOpenDrawer(d.id); }}>
      <div className="addr">{d.address || 'Untitled'}</div>
      <div className="loc">{[d.city, d.stateAb].filter(Boolean).join(', ')}{d.case ? ' · ' + d.case : ''}</div>
      <div className="figs">
        <div><span className="lab2">{c.owned ? 'Purchase' : 'Max bid'}</span>{moneyShort(c.owned ? n(d.purchasePrice) : c.maxBid)}</div>
        <div><span className="lab2">{c.isSold ? 'Sold' : (n(d.contractPrice) ? 'Contract' : 'ARV')}</span>{moneyShort(c.exit)}</div>
        <div><span className="lab2">Reno</span>{moneyShort(n(d.renoSpent) || n(d.renoBudget))}</div>
      </div>
      <MarginBar d={d} />
      <div className="card-foot">{tags}<span className="spacer"></span>
        <button className="icon-btn js-advance" title="Move to next stage" onClick={(e) => { e.stopPropagation(); onAdvance(d.id); }}>&rsaquo;</button></div>
    </article>
  );
}

export function PipelineBoard({ rows, onOpenDrawer, onAdvance, onMoveDeal }) {
  const [dragOverStage, setDragOverStage] = useState(null);
  return (
    <>
      {BOARD_STAGES.map((s) => {
        const items = rows.filter((d) => d.stage === s.id);
        const value = PREBID_STAGES.includes(s.id) ? sum(items, (d) => calc(d).maxBid)
          : s.id === 'sold' ? sum(items, (d) => n(d.salePrice)) : sum(items, (d) => calc(d).basis);
        const label = PREBID_STAGES.includes(s.id) ? 'max bid' : s.id === 'sold' ? 'volume' : 'basis';
        const share = rows.length ? (items.length / rows.length) * 100 : 0;
        return (
          <div className={'col' + (dragOverStage === s.id ? ' dragover' : '')} data-stage={s.id} key={s.id}
            onDragOver={(e) => { e.preventDefault(); setDragOverStage(s.id); }}
            onDragLeave={() => setDragOverStage((cur) => (cur === s.id ? null : cur))}
            onDrop={(e) => { e.preventDefault(); setDragOverStage(null); onMoveDeal(e.dataTransfer.getData('text/plain'), s.id); }}>
            <div className="col-head">
              <div className="name"><span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: SC(s) }}></span>{s.name}</div>
              <div className="bar"><i style={{ width: share + '%', background: SC(s) }}></i></div>
              <div className="meta"><span>{items.length} {items.length === 1 ? 'home' : 'homes'}</span><span>{moneyShort(value)} {label}</span></div>
            </div>
            <div className="col-body">
              {items.length ? items.map((d) => <DealCard d={d} onOpenDrawer={onOpenDrawer} onAdvance={onAdvance} key={d.id} />)
                : <div className="empty-col">Nothing here.<br />Drag a home in.</div>}
            </div>
          </div>
        );
      })}
    </>
  );
}

/* ================= ledger ================= */
export function LedgerView({ rows, sort, onSort, onOpenDrawer }) {
  return (
    <table>
      <thead><tr>
        {LCOLS.map((c) => (
          <th key={c.k} className={(c.r ? 'r ' : '') + 'sortable'} onClick={() => onSort(c.k)}>{c.t}</th>
        ))}
      </tr></thead>
      <tbody>
        {rows.length ? rows.map((d) => {
          const c = calc(d);
          const s = STAGE_BY_ID[d.stage];
          return (
            <tr key={d.id} onClick={() => onOpenDrawer(d.id)}>
              <td className="addr-cell">{d.address || 'Untitled'}<br /><span className="muted" style={{ fontFamily: 'var(--mono)', fontSize: '10.5px' }}>{[d.city, d.stateAb].filter(Boolean).join(', ')}</span></td>
              <td><span className="pill" style={{ color: SC(s), borderColor: SC(s) + '66' }}>{s.short}</span></td>
              <td>{fmtDate(d.auctionDate)}</td>
              <td className="r muted">{n(d.openingBid) ? money(n(d.openingBid)) : '—'}</td>
              <td className="r">{c.maxBid ? money(c.maxBid) : '—'}</td>
              <td className="r" style={c.overBid ? { color: 'var(--oxblood)' } : undefined}>{n(d.purchasePrice) ? money(n(d.purchasePrice)) : '—'}</td>
              <td className="r">{money(n(d.renoSpent) || n(d.renoBudget))}</td>
              <td className="r">{money(c.useBasis)}</td>
              <td className="r">{money(c.exit)}</td>
              <td className={'r ' + (c.profit >= 0 ? 'pos' : 'neg')}>{money(c.profit)}</td>
              <td className={'r ' + (c.margin >= 0 ? 'pos' : 'neg')}>{pct(c.margin)}</td>
              <td className={'r ' + (c.roi >= 0 ? 'pos' : 'neg')}>{pct(c.roi)}</td>
            </tr>
          );
        }) : <tr><td colSpan={12} style={{ padding: 34, textAlign: 'center', color: 'var(--dim)' }}>No properties match these filters.</td></tr>}
      </tbody>
      <tfoot>
        {rows.length ? (() => {
          const tB = sum(rows, (d) => calc(d).useBasis), tE = sum(rows, (d) => calc(d).exit), tP = sum(rows, (d) => calc(d).profit);
          return (
            <tr><td colSpan={7}>{rows.length} properties in view</td>
              <td className="r">{money(tB)}</td><td className="r">{money(tE)}</td><td className="r">{money(tP)}</td>
              <td className="r">{pct(tE ? tP / tE : 0)}</td><td className="r">{pct(tB ? tP / tB : 0)}</td></tr>
          );
        })() : null}
      </tfoot>
    </table>
  );
}

export { SC };
