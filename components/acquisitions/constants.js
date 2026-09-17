// Config/constants for Property Operations.
//
// Stage colours are a deliberate categorical encoding (they identify a stage at a
// glance on the board, in pills and on card borders), so they earn their colour —
// but they're desaturated to read cleanly as text and hairlines on OakFlow's light
// surfaces, and drawn from the same hues as the design-system status tokens.
export const STAGES = [
  { id: 'research', name: 'Researching',    short: 'Research',  color: '#6b7280' },
  { id: 'bidready', name: 'Bid ready',      short: 'Bid ready', color: '#8a6212' },
  { id: 'acquired', name: 'Acquired',       short: 'Acquired',  color: '#2a5599' },
  { id: 'reno',     name: 'Under reno',     short: 'Reno',      color: '#8a6a3b' },
  { id: 'listed',   name: 'Active Listing', short: 'Listed',    color: '#5b4a9c' },
  { id: 'contract', name: 'Under contract', short: 'Contract',  color: '#1f6470' },
  { id: 'sold',     name: 'Sold',           short: 'Sold',      color: '#1a6b40' },
  { id: 'outbid',   name: 'Outbid / passed',short: 'Outbid',    color: '#8b929b' },
];

export const STAGE_BY_ID = Object.fromEntries(STAGES.map((s) => [s.id, s]));
export const OPEN_BID_STAGES = ['research', 'bidready'];
export const PREBID_STAGES = ['research', 'bidready', 'outbid'];
export const ACTIVE_STAGES = ['acquired', 'reno', 'listed', 'contract'];
export const OWNED_STAGES = ['acquired', 'reno', 'listed', 'contract', 'sold'];
export const BOARD_STAGES = STAGES.filter((s) => OWNED_STAGES.includes(s.id));
export const isOwned = (d) => OWNED_STAGES.includes(d.stage);
export const KEY = 'auction-command-center:v1';
export const DEFAULT_SELL_PCT = 8;
export const DEFAULT_BID_PCT = 70;
export const DEFAULT_HOLD_PCT = 8;

export const VIEWS = [
  { id: 'pipeline', name: 'Portfolio' },
  { id: 'ledger', name: 'Ledger' },
  { id: 'reports', name: 'Reports' },
  { id: 'workbook', name: 'Financial Workbook' },
];

export const PERIODS = [
  { id: 'ytd', name: 'Year to date' },
  { id: 'q', name: 'This quarter' },
  { id: 'l12', name: 'Last 12 months' },
  { id: 'ly', name: 'Last year' },
  { id: 'all', name: 'All time' },
  { id: 'custom', name: 'Custom' },
];

export const LCOLS = [
  { k: 'address', t: 'Property' },
  { k: 'stage', t: 'Stage' },
  { k: 'saledate', t: 'Sale date' },
  { k: 'openingBid', t: 'Opening', r: 1 },
  { k: 'maxBid', t: 'Max bid', r: 1 },
  { k: 'price', t: 'Purchase', r: 1 },
  { k: 'reno', t: 'Reno', r: 1 },
  { k: 'basis', t: 'All-in', r: 1 },
  { k: 'exit', t: 'Exit', r: 1 },
  { k: 'spread', t: 'Profit', r: 1 },
  { k: 'margin', t: 'Margin', r: 1 },
  { k: 'roi', t: 'ROI', r: 1 },
];

// Drawer form field -> deal key map (mirrors the F/NUMK maps in the original)
export const NUMK = [
  'beds', 'baths', 'sqft', 'year', 'openingBid', 'unpaid', 'arv',
  'renoBudget', 'holding', 'purchasePrice', 'renoSpent', 'contractPrice', 'salePrice',
];

export const FIELDS = [
  { k: 'address', label: 'Street address', hints: ['address', 'property address', 'street', 'situs', 'addr', 'property'] },
  { k: 'city', label: 'City', hints: ['city', 'municipality'] },
  { k: 'stateAb', label: 'State', hints: ['state', 'st'] },
  { k: 'zip', label: 'Zip', hints: ['zip', 'postal', 'zipcode'] },
  { k: 'county', label: 'County', hints: ['county', 'parish'] },
  { k: 'auctionDate', label: 'Sale date', hints: ['sale date', 'auction date', 'sale', 'auction day', 'date of sale', 'saledate'] },
  { k: 'openingBid', label: 'Opening bid', hints: ['opening bid', 'starting bid', 'minimum bid', 'opening', 'open bid'] },
  { k: 'unpaid', label: 'Unpaid balance', hints: ['unpaid', 'mortgage balance', 'loan balance', 'deed balance', 'amount owed', 'balance', 'judgment'] },
  { k: 'estValue', label: 'Estimated value', hints: ['estimated value', 'est value', 'market value', 'avm', 'assessed', 'value', 'zestimate'] },
  { k: 'case', label: 'File ID / APN', hints: ['file', 'case', 'apn', 'parcel', 'loan number', 'file id', 'tax id'] },
  { k: 'owner', label: 'Owner', hints: ['owner', 'borrower', 'defendant', 'grantor', 'mortgagor'] },
  { k: 'bank', label: 'Bank', hints: ['bank', 'lender', 'plaintiff', 'beneficiary', 'servicer'] },
  { k: 'attorney', label: 'Attorney / trustee', hints: ['attorney', 'trustee', 'law firm', 'firm'] },
  { k: 'beds', label: 'Beds', hints: ['beds', 'bed', 'bedrooms', 'br'] },
  { k: 'baths', label: 'Baths', hints: ['baths', 'bath', 'bathrooms', 'ba'] },
  { k: 'sqft', label: 'Sq ft', hints: ['sqft', 'sq ft', 'square feet', 'living area', 'bldg sqft', 'size'] },
  { k: 'year', label: 'Year built', hints: ['year built', 'yr built', 'year', 'built'] },
  { k: 'auctionStatus', label: 'Auction status', hints: ['status', 'auction status', 'sale status'] },
  { k: 'notes', label: 'Notes', hints: ['notes', 'comments', 'remarks', 'description'] },
];
