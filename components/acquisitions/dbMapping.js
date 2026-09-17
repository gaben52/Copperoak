// Bridges the app's existing "deal" shape (established by the old recordToDeal() in airtable.js)
// to the Postgres columns in public.properties — the SAME table Auction Pipeline reads/writes,
// just filtered to Auction Outcome = 'We Won' and interpreted through a different lens (owned
// asset management instead of pre-bid tracking). Keeping the deal shape identical here is what
// let every view/report component (PipelineBoard, LedgerView, ReportsView, WorkbookView,
// PropertyDrawer) stay completely untouched.

export function stageFromStatus(status) {
  switch (status) {
    case 'Acquired': return 'acquired';
    case 'Renovating': return 'reno';
    case 'Listed For Sale': return 'listed';
    case 'Under Contract': return 'contract';
    case 'Sold': return 'sold';
    default: return 'acquired';
  }
}
export function statusFromStage(stage) {
  switch (stage) {
    case 'acquired': return 'Acquired';
    case 'reno': return 'Renovating';
    case 'listed': return 'Listed For Sale';
    case 'contract': return 'Under Contract';
    case 'sold': return 'Sold';
    default: return 'Acquired';
  }
}

export const DEAL_DB_FIELD_MAP = {
  address: 'address', city: 'city', stateAb: 'state', zip: 'zip', county: 'county',
  beds: 'beds', baths: 'baths', sqft: 'sq_ft', year: 'year_built',
  auctionDate: 'sale_date', openingBid: 'open_bid', unpaid: 'mortgage_balance', attorney: 'trustee_name',
  arv: 'arv', renoBudget: 'reno_cost', holding: 'holding_costs',
  purchasePrice: 'winning_bid', renoSpent: 'reno_spent',
  contractPrice: 'contract_price', salePrice: 'sale_price',
  acquiredDate: 'acquired_date', listedDate: 'listed_date', closedDate: 'closed_date',
  expectedClosing: 'expected_closing_date', deedRecorded: 'deed_recorded',
  buyer: 'buyer_side', notes: 'notes',
};

export function dbRowToDeal(r) {
  return {
    id: r.id,
    address: r.address || '', city: r.city || '', stateAb: r.state || '', zip: r.zip || '', county: r.county || '',
    beds: r.beds || 0, baths: r.baths || 0, sqft: r.sq_ft || 0, year: r.year_built || 0,
    auctionDate: r.sale_date || '', openingBid: r.open_bid || 0, unpaid: r.mortgage_balance || 0,
    attorney: r.trustee_name || '',
    arv: r.arv || 0, renoBudget: r.reno_cost || 0, holding: r.holding_costs || 0,
    purchasePrice: r.winning_bid || 0, renoSpent: r.reno_spent || 0,
    contractPrice: r.contract_price || 0, salePrice: r.sale_price || 0,
    // Same fallback as the original: if Acquired Date was never explicitly set (e.g. the record
    // came from the Pre-Bid tool, which has no Acquired Date field), fall back to the auction
    // Sale Date — for a foreclosure purchase these are usually the same day anyway.
    acquiredDate: r.acquired_date || r.sale_date || '', listedDate: r.listed_date || '', closedDate: r.closed_date || '',
    expectedClosing: r.expected_closing_date || '',
    deedRecorded: !!r.deed_recorded,
    buyer: r.buyer_side || '', notes: r.notes || '',
    stage: stageFromStatus(r.property_status),
    // Not part of DEAL_DB_FIELD_MAP/dealToDbFields — these go through the dedicated
    // /api/properties/[id]/documents route (see PropertyDrawer.jsx), same as Auction Pipeline,
    // never through the general field-update path. r.photos/r.title_report already arrive here
    // with fresh signed {url, downloadUrl} from /api/properties's signPropertyDocumentsList().
    photos: r.photos || [], titleReports: r.title_report || [],
    updated: Date.now(),
  };
}

// `d` is the full (merged) deal object — matches how saveDeal()/moveDeal() already call this,
// mirroring the old dealToFields()'s all-fields-every-time PATCH semantics, which is harmless
// against a plain row update (unchanged fields just get rewritten to their current value).
export function dealToDbFields(d, opts = {}) {
  const fields = {};
  Object.keys(DEAL_DB_FIELD_MAP).forEach((k) => {
    if (d[k] !== undefined) {
      const v = d[k];
      fields[DEAL_DB_FIELD_MAP[k]] = v === '' ? null : v;
    }
  });
  if (!opts.skipStage) fields.property_status = statusFromStage(d.stage);
  if (opts.isNew) fields.auction_outcome = 'We Won';
  return fields;
}
