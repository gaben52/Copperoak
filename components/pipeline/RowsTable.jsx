'use client';
// Ported from the Foreclosure Pre-Bid Command Center <script> — renderTableHeader() / rowHTML() /
// countyOptionsHTML() / handleCountySelect(), converted to JSX.

import { LOCATION_OPTIONS, CLEAR_TITLE_OPTIONS, OUTCOME_OPTIONS, PROPERTY_STATUS_OPTIONS, PAYMENT_METHOD_OPTIONS, OCCUPANCY_OPTIONS, STATUSES } from './constants';
import { locationColor, locationTextColor, clearTitleColor, clearTitleTextColor, outcomeColor, outcomeTextColor, statusColor, statusTextColor, effectiveProfitMarginOf, computeProfit, isUpcoming, isAtRisk } from './helpers';
import { TextCell, MoneyCell, DateCell } from './cells';
import { StateSelect, CountySelect } from '@/components/shared/LocationFields';

// `editable(fieldKey)` decides per-field whether an input is enabled — reflects the caller's
// actual effective permissions (role defaults + individual overrides, see
// lib/permissions/fieldGroups.js's allowedFieldsForProfile()), not a blanket role check. This is
// UX only: the server independently re-validates every field on save regardless of what this
// function returns. `canSelect` gates the row-selection checkboxes — selecting rows itself is
// harmless (it only feeds the toolbar's Print/Change Date/Delete Selected buttons, each of which
// independently checks its own permission before doing anything), so this is just "is there any
// selection-dependent action this user could take at all," not tied to one specific permission.
// `canDelete` gates the per-row delete button specifically (delete stays admin-only, matching
// CAN_DELETE_ROLES — not part of the four individually-grantable field-group permissions).
export function RowsTable({ rows, onWon, selectedIds, allVisibleIds, onToggleSelect, onToggleSelectAll, sortKey, onSort, onUpdateField, onHandleCountySelect, onOpenDetail, onDeleteRow, editable, canSelect, canDelete, emptyMessage }) {
  const colCount = onWon ? 27 : 22;
  return (
    <table>
      <thead>
        <tr>
          <th className="location-col" onClick={() => onSort('location')}>Location</th>
          <th className="col-num">
            <input type="checkbox" style={{ width: 'auto' }} disabled={!canSelect}
              checked={allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedIds.has(id))}
              onChange={(e) => onToggleSelectAll(e.target.checked)} />
          </th>
          <th className="col-num">#</th>
          <th className="col-state" onClick={() => onSort('state')}>State</th>
          <th onClick={() => onSort('county')}>County</th>
          <th onClick={() => onSort('address')}>Address</th>
          <th className="col-city" onClick={() => onSort('city')}>City</th>
          <th onClick={() => onSort('zip')}>Zip</th>
          <th onClick={() => onSort('saleDate')}>Sale Date</th>
          <th onClick={() => onSort('clearTitle')}>Clear Title</th>
          <th className="input-col" onClick={() => onSort('mortgageBalance')}>Mortgage Bal.</th>
          <th className="input-col wide-num" onClick={() => onSort('openBid')}>Open Bid</th>
          <th className="input-col wide-num arv-col" onClick={() => onSort('arv')}>ARV</th>
          <th className="input-col wide-num" onClick={() => onSort('arv2')}>2nd ARV</th>
          <th className="maxbid-col wide-num" onClick={() => onSort('maxBid')}>Max Bid</th>
          <th className="input-col wide-num" onClick={() => onSort('renoCost')}>Reno Cost</th>
          <th className="input-col wide-num" onClick={() => onSort('netProfit')}>Profit</th>
          {onWon && <th className="input-col wide-num" onClick={() => onSort('winningBid')}>Winning Bid</th>}
          <th className="profit-pct-col" onClick={() => onSort('profitMargin')}>Profit %</th>
          <th onClick={() => onSort('outcome')}>Auction Outcome</th>
          {onWon && <>
            <th onClick={() => onSort('propertyStatus')}>Property Status</th>
            <th className="input-col wide-num" onClick={() => onSort('expectedRefund')}>Expected Refund</th>
            <th onClick={() => onSort('paymentMethod')}>Payment Method</th>
            <th onClick={() => onSort('occupancy')}>Occupancy</th>
          </>}
          <th>Notes</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {!rows.length ? (
          <tr><td colSpan={colCount} className="empty">{emptyMessage || 'No properties yet. Click "+ Add Property" or "Bulk Paste" to get started.'}</td></tr>
        ) : rows.map((r, i) => (
          <Row key={r.id} r={r} num={i + 1} onWon={onWon} selected={selectedIds.has(r.id)}
            onToggleSelect={onToggleSelect} onUpdateField={onUpdateField} onHandleCountySelect={onHandleCountySelect}
            onOpenDetail={onOpenDetail} onDeleteRow={onDeleteRow} editable={editable} canSelect={canSelect} canDelete={canDelete} />
        ))}
      </tbody>
    </table>
  );
}

function Row({ r, num, onWon, selected, onToggleSelect, onUpdateField, onHandleCountySelect, onOpenDetail, onDeleteRow, editable, canSelect, canDelete }) {
  const profitMargin = effectiveProfitMarginOf(r);
  const netProfit = computeProfit(r);
  const netProfitStyle = netProfit !== null && netProfit < 0 ? { color: 'var(--red)' } : undefined;
  const urgentCls = isUpcoming(r) ? 'urgent' : '';
  const dnbCls = r.status === 'DNB' ? 'dnb-row' : '';
  const atRiskCls = isAtRisk(r) ? 'at-risk-row' : '';
  const locationVal = r.location || '';
  const clearTitleVal = r.clearTitle || 'Unknown';
  const outcomeVal = r.outcome || 'Unknown';

  return (
    <tr className={[dnbCls, atRiskCls].filter(Boolean).join(' ')}>
      <td className="location-col">
        <select className="status-pill" style={{ background: locationColor(locationVal), color: locationTextColor(locationVal) }}
          disabled={!editable('location')} value={locationVal} onChange={(e) => onUpdateField(r.id, 'location', e.target.value)}>
          <option value="">-</option>
          {LOCATION_OPTIONS.map((l) => <option value={l} key={l}>{l}</option>)}
        </select>
      </td>
      <td className="col-num"><input type="checkbox" checked={selected} style={{ width: 'auto' }} disabled={!canSelect} onChange={(e) => onToggleSelect(r.id, e.target.checked)} /></td>
      <td className="col-num">{num}</td>
      <td>
        <StateSelect style={{ minWidth: 56 }} disabled={!editable('state')} value={r.state} onChange={(v) => onUpdateField(r.id, 'state', v)} />
      </td>
      <td><CountySelect style={{ minWidth: 134 }} state={r.state} county={r.county} disabled={!editable('county')} onChange={(v) => onHandleCountySelect(r.id, v)} /></td>
      <td>
        {atRiskCls ? <span className="attn-flag" title="Needs attention: sale date within 72 hours with missing ARV, Max Bid, or unresolved title">&#9888;</span> : null}
        <button type="button" className="address-link" onClick={() => onOpenDetail(r.id)}>{r.address ? r.address : '+ Add address / details'}</button>
      </td>
      <td className="col-city"><TextCell value={r.city} placeholder="City" disabled={!editable('city')} onCommit={(v) => onUpdateField(r.id, 'city', v)} /></td>
      <td><TextCell value={r.zip} placeholder="Zip" style={{ width: 70 }} disabled={!editable('zip')} onCommit={(v) => onUpdateField(r.id, 'zip', v)} /></td>
      <td className={urgentCls}><DateCell value={r.saleDate} disabled={!editable('saleDate')} onCommit={(v) => onUpdateField(r.id, 'saleDate', v)} /></td>
      <td>
        <select className="status-pill" title={clearTitleVal === 'Do NOT Bid' ? 'Do NOT Bid (archives this property)' : ''}
          style={{ background: clearTitleColor(clearTitleVal), color: clearTitleTextColor(clearTitleVal) }}
          disabled={!editable('clearTitle')} value={clearTitleVal} onChange={(e) => onUpdateField(r.id, 'clearTitle', e.target.value)}>
          {CLEAR_TITLE_OPTIONS.map((o) => <option value={o} key={o}>{o}</option>)}
        </select>
      </td>
      <td className="input-cell"><MoneyCell value={r.mortgageBalance} disabled={!editable('mortgageBalance')} onCommit={(v) => onUpdateField(r.id, 'mortgageBalance', v)} /></td>
      <td className="input-cell wide-num"><MoneyCell value={r.openBid} disabled={!editable('openBid')} onCommit={(v) => onUpdateField(r.id, 'openBid', v)} /></td>
      <td className="input-cell wide-num arv-col"><MoneyCell value={r.arv} disabled={!editable('arv')} onCommit={(v) => onUpdateField(r.id, 'arv', v)} /></td>
      <td className="input-cell wide-num"><MoneyCell value={r.arv2} disabled={!editable('arv2')} onCommit={(v) => onUpdateField(r.id, 'arv2', v)} /></td>
      <td className="maxbid-col wide-num"><MoneyCell value={r.maxBid} disabled={!editable('maxBid')} onCommit={(v) => onUpdateField(r.id, 'maxBid', v)} /></td>
      <td className="input-cell wide-num"><MoneyCell value={r.renoCost} disabled={!editable('renoCost')} onCommit={(v) => onUpdateField(r.id, 'renoCost', v)} /></td>
      <td className="input-cell wide-num"><input readOnly value={netProfit === null ? '' : (netProfit < 0 ? '-$' + Math.abs(Math.round(netProfit)).toLocaleString() : '$' + Math.round(netProfit).toLocaleString())} style={netProfitStyle} tabIndex={-1} /></td>
      {onWon && <td className="input-cell wide-num"><MoneyCell value={r.winningBid} disabled={!editable('winningBid')} onCommit={(v) => onUpdateField(r.id, 'winningBid', v)} /></td>}
      <td className="profit-pct-col">
        {profitMargin === null ? <span style={{ color: 'var(--muted)' }}>&mdash;</span>
          : <span className={profitMargin >= 0 ? 'profit-pos' : 'profit-neg'}>{(profitMargin * 100).toFixed(1)}%</span>}
      </td>
      <td>
        <select className="status-pill" style={{ background: outcomeColor(outcomeVal), color: outcomeTextColor(outcomeVal) }}
          disabled={!editable('outcome')} value={outcomeVal} onChange={(e) => onUpdateField(r.id, 'outcome', e.target.value)}>
          {OUTCOME_OPTIONS.map((o) => <option value={o} key={o}>{o}</option>)}
        </select>
      </td>
      {onWon && <>
        <td>
          <select disabled={!editable('propertyStatus')} value={r.propertyStatus || ''} onChange={(e) => onUpdateField(r.id, 'propertyStatus', e.target.value)}>
            <option value="">-</option>
            {PROPERTY_STATUS_OPTIONS.map((o) => <option value={o} key={o}>{o}</option>)}
          </select>
        </td>
        <td className="input-cell wide-num"><MoneyCell value={r.expectedRefund} disabled={!editable('expectedRefund')} onCommit={(v) => onUpdateField(r.id, 'expectedRefund', v)} /></td>
        <td>
          <select disabled={!editable('paymentMethod')} value={r.paymentMethod || ''} onChange={(e) => onUpdateField(r.id, 'paymentMethod', e.target.value)}>
            <option value="">-</option>
            {PAYMENT_METHOD_OPTIONS.map((o) => <option value={o} key={o}>{o}</option>)}
          </select>
        </td>
        <td>
          <select disabled={!editable('occupancy')} value={r.occupancy || ''} onChange={(e) => onUpdateField(r.id, 'occupancy', e.target.value)}>
            <option value="">-</option>
            {OCCUPANCY_OPTIONS.map((o) => <option value={o} key={o}>{o}</option>)}
          </select>
        </td>
      </>}
      <td className="col-notes"><TextCell value={r.notes} placeholder="Notes..." disabled={!editable('notes')} onCommit={(v) => onUpdateField(r.id, 'notes', v)} /></td>
      <td>
        <select className="status-pill" style={{ background: statusColor(r.status), color: statusTextColor(r.status) }}
          disabled={!editable('status')} value={r.status} onChange={(e) => onUpdateField(r.id, 'status', e.target.value)}>
          {STATUSES.map((s) => <option value={s} key={s}>{s === 'DNB' ? 'DNB — Do Not Bid' : s}</option>)}
        </select>
      </td>
      <td>{canDelete && <button className="del-btn" onClick={() => onDeleteRow(r.id)}>&times;</button>}</td>
    </tr>
  );
}
