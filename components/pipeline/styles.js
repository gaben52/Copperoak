// OakFlow — Auction Pipeline / Partner Portal styles.
// Layout-specific rules only; all tokens and shared primitives (buttons, inputs,
// tables, badges, modals, toasts) come from components/design-system.js.
// Light-only: there is no theme parameter and no dark palette here.

import { OAKFLOW_CSS } from '../design-system';

const PIPELINE_LAYOUT = `
body{ padding:var(--of-gutter) var(--of-gutter) 48px; }

/* ============================ Page header ============================ */
.header{
  display:flex;justify-content:space-between;align-items:flex-start;
  flex-wrap:wrap;gap:var(--of-s4);
  margin-bottom:var(--of-s5);
  padding-bottom:var(--of-s4);
  border-bottom:1px solid var(--of-border);
}
.brand,.brand:hover,.brand:visited,.brand *{ text-decoration:none!important; }
.brand{ display:flex;align-items:center;gap:12px;min-width:0;color:inherit; }
.brand-icon{
  width:36px;height:36px;flex:none;
  border-radius:var(--of-r);
  background:var(--of-oak-soft);
  border:1px solid #e6dccb;
  color:var(--of-oak);
  display:flex;align-items:center;justify-content:center;
  font-size:17px;line-height:1;
}
.brand h1{
  margin:0;font-size:19px;font-weight:650;letter-spacing:-.015em;color:var(--of-text);
}
.brand h1 .brand-a{ color:var(--of-text); }
.brand h1 .brand-b{ color:var(--of-text-3);font-weight:500; }
.brand .tag{
  font-size:11.5px;font-weight:500;color:var(--of-text-3);
  letter-spacing:.04em;margin-top:1px;
}
.header-actions{ display:flex;gap:7px;flex-wrap:wrap;align-items:center; }

/* ============================ Month bar ============================ */
.month-bar{
  display:flex;align-items:center;gap:10px;flex-wrap:wrap;
  background:var(--of-surface);
  border:1px solid var(--of-border);
  border-radius:var(--of-r-lg);
  box-shadow:var(--of-shadow-xs);
  padding:10px 14px;
  margin-bottom:var(--of-s4);
}
.month-bar > button{ width:var(--of-h);padding:0;font-size:11px;color:var(--of-text-2); }
.month-label{
  font-size:16px;font-weight:600;letter-spacing:-.01em;color:var(--of-text);
  min-width:150px;
}
.month-label b{ font-weight:600; }
.month-bar select{ min-width:170px; }

/* ============================ Stat cards ============================ */
.stats{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(160px,1fr));
  gap:10px;
  margin-bottom:var(--of-s4);
}
.stat{
  background:var(--of-surface);
  border:1px solid var(--of-border);
  border-radius:var(--of-r-lg);
  box-shadow:var(--of-shadow-xs);
  padding:13px 15px;
  min-width:0;
}
.stat .label{
  font-size:10.5px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;
  color:var(--of-text-3);margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.stat .value{
  font-size:21px;font-weight:620;letter-spacing:-.02em;color:var(--of-text);
  font-variant-numeric:tabular-nums;line-height:1.15;
}
/* Colour only where it carries meaning */
.stat.green .value{ color:var(--of-ok-text); }
.stat.gold .value{ color:var(--of-text); }
.stat.red{ border-color:var(--of-err-border);background:linear-gradient(0deg,var(--of-err-bg),var(--of-err-bg)); }
.stat.red .value{ color:var(--of-err-text); }

/* ============================ Toolbar / filters ============================ */
.toolbar{
  display:flex;justify-content:space-between;align-items:center;
  flex-wrap:wrap;gap:10px;
  background:var(--of-surface);
  border:1px solid var(--of-border);
  border-radius:var(--of-r-lg);
  box-shadow:var(--of-shadow-xs);
  padding:11px 14px;
  margin-bottom:var(--of-s4);
}
.filters{ display:flex;gap:8px;flex-wrap:wrap;align-items:center; }
.filters input[type=text]{ width:230px; }
.filters label{
  display:flex;align-items:center;gap:6px;
  font-size:12.5px;color:var(--of-text-2);white-space:nowrap;
}
.legend{
  display:flex;align-items:center;gap:7px;
  font-size:12px;color:var(--of-text-3);
}
.legend .swatch{
  width:11px;height:11px;border-radius:3px;
  background:var(--of-ok-bg);border:1px solid var(--of-ok-border);
  display:inline-block;flex:none;
}

/* ============================ County tabs ============================ */
.pager-bar{ display:flex;align-items:center;gap:8px;margin-bottom:var(--of-s4); }
.pager-bar > button{ width:var(--of-h);padding:0;flex:none;font-size:11px;color:var(--of-text-2); }
.page-tabs{
  display:flex;gap:6px;flex-wrap:nowrap;overflow-x:auto;flex:1;
  padding:3px;
  background:var(--of-surface);
  border:1px solid var(--of-border);
  border-radius:var(--of-r-lg);
  box-shadow:var(--of-shadow-xs);
}
.page-tab{
  height:30px;padding:0 12px;flex-shrink:0;
  background:transparent;border:1px solid transparent;box-shadow:none;
  border-radius:var(--of-r);
  color:var(--of-text-2);font-size:12.5px;font-weight:500;
  white-space:nowrap;
}
.page-tab:hover{ background:var(--of-surface-3);border-color:transparent; }
/* Active state reads clearly without a bright fill */
.page-tab.active{
  background:var(--of-accent);border-color:var(--of-accent);
  color:var(--of-accent-text);font-weight:550;
}
.page-tab.won-tab{ color:var(--of-ok-text); }
.page-tab.won-tab.active{ background:var(--of-ok-text);border-color:var(--of-ok-text);color:#fff; }
.page-tab.lost-tab{ color:var(--of-warn-text); }
.page-tab.lost-tab.active{ background:var(--of-warn-text);border-color:var(--of-warn-text);color:#fff; }
.page-tab.archived-tab{ color:var(--of-err-text); }
.page-tab.archived-tab.active{ background:var(--of-err-text);border-color:var(--of-err-text);color:#fff; }

/* ============================ Won dashboard ============================ */
.won-dash{
  background:var(--of-surface);
  border:1px solid var(--of-border);
  border-radius:var(--of-r-lg);
  box-shadow:var(--of-shadow-xs);
  padding:var(--of-s5);
  margin-bottom:var(--of-s4);
}
.won-dash-head{
  display:flex;align-items:center;justify-content:space-between;
  flex-wrap:wrap;gap:10px;
  margin-bottom:var(--of-s4);padding-bottom:var(--of-s3);
  border-bottom:1px solid var(--of-border);
}
.won-dash-title{
  font-size:13px;font-weight:600;letter-spacing:-.005em;color:var(--of-text);
}
.won-dash-actions{ display:flex;gap:7px;flex-wrap:wrap; }
.won-month-grid{ display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px; }
.won-month-card{
  background:var(--of-surface-2);
  border:1px solid var(--of-border);
  border-radius:var(--of-r);
  padding:14px 16px;
}
.won-month-card .wmc-title{ font-size:13.5px;font-weight:600;color:var(--of-text);margin-bottom:2px; }
.won-month-card .wmc-count{ font-size:11.5px;color:var(--of-text-3);margin-bottom:10px; }
.won-month-card .wmc-row{
  display:flex;justify-content:space-between;gap:10px;
  font-size:12.5px;padding:3px 0;color:var(--of-text-2);
}
.won-month-card .wmc-row b{ color:var(--of-text);font-weight:550;font-variant-numeric:tabular-nums; }
.won-month-card .wmc-row.profit-row{
  border-top:1px solid var(--of-border);margin-top:7px;padding-top:9px;
}
.won-month-card .wmc-row.profit-row b{ font-size:14.5px;font-weight:620; }
.won-month-card .wmc-fund-head{
  font-size:10px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;
  color:var(--of-text-3);
  margin-top:12px;margin-bottom:7px;padding-top:9px;
  border-top:1px solid var(--of-border);
}
.won-month-card .wmc-fund-row{
  display:flex;justify-content:space-between;align-items:center;gap:8px;
  font-size:12.5px;padding:3px 0;color:var(--of-text-2);
}
.wmc-fund-input{
  width:118px;height:var(--of-h-sm);text-align:right;
  font-size:12.5px;font-weight:550;font-variant-numeric:tabular-nums;
}
.won-dash-empty{ color:var(--of-text-3);font-size:13px;padding:8px 0; }

/* ============================ Table ============================ */
.table-wrap{
  background:var(--of-surface);
  border:1px solid var(--of-border);
  border-radius:var(--of-r-lg);
  box-shadow:var(--of-shadow-xs);
  overflow:auto;
  max-height:72vh;
  margin-bottom:var(--of-s4);
  /* Isolates the table's repaint work — without this, repositioning the sticky
     header against the page on every animated-scroll frame drops frames. */
  contain:paint;
  will-change:scroll-position;
}
table{ min-width:1500px; }
th{ cursor:pointer;user-select:none; }
th:hover{ color:var(--of-text);background:var(--of-surface-3); }
td{ white-space:nowrap; }

/* Inline editable cells: kept a subtle green so the "green = fields you fill in"
   legend stays accurate, but at a fraction of the original saturation. */
td.input-cell input{
  background:var(--of-ok-bg);
  border-color:var(--of-ok-border);
  color:var(--of-ok-text);
  font-weight:550;
  text-align:right;
  font-variant-numeric:tabular-nums;
}
td.input-cell input:focus{ background:#e2f0e8; }
td.input-cell input[readonly]{ cursor:default;background:var(--of-surface-2);color:var(--of-text-2);border-color:var(--of-border); }

/* Max Bid — the decision field, flagged with the oak accent rather than gold */
th.maxbid-col{ background:var(--of-oak-soft);color:#6f5530; }
td.maxbid-col input{
  background:var(--of-oak-soft);
  border-color:#e6dccb;
  color:#6f5530;
  font-weight:600;
  text-align:right;
  font-variant-numeric:tabular-nums;
}
td.maxbid-col input:focus{ background:#eee5d8; }

/* Table cell controls sit flush until hovered */
td input,td select,td textarea{
  height:30px;background:transparent;border-color:transparent;
  width:100%;box-shadow:none;font-size:12.5px;
}
td textarea{ height:30px;padding:6px 8px; }
td input:hover,td select:hover,td textarea:hover{ border-color:var(--of-border-strong);background:var(--of-surface); }
td input:focus,td select:focus,td textarea:focus{ background:var(--of-surface);border-color:var(--of-oak); }
td .status-pill{ height:24px; }

/* Column sizing */
.col-num{ width:38px;color:var(--of-text-3);text-align:center;font-variant-numeric:tabular-nums; }
.location-col{ width:96px;min-width:96px;max-width:96px; }
.location-col select{ font-size:11px;padding:0 4px; }
.col-state,th.col-state{ min-width:64px; }
th.col-city{ min-width:130px; }
td.col-city input{ min-width:120px; }
th.wide-num{ min-width:118px; }
td.wide-num input{ min-width:110px; }
.col-notes textarea{ resize:none;min-width:170px; }
th.profit-pct-col{ width:70px;min-width:70px;max-width:70px; }
td.profit-pct-col{ width:70px;max-width:70px;text-align:right;font-variant-numeric:tabular-nums; }

.profit-pos{ color:var(--of-ok-text);font-weight:600; }
.profit-neg{ color:var(--of-err-text);font-weight:600; }

/* Row states */
.urgent{ color:var(--of-warn-text);font-weight:550; }
tr.at-risk-row td{ background:var(--of-err-bg); }
tr.at-risk-row:hover td{ background:#f9e2e0; }
.attn-flag{ color:var(--of-err-text);margin-right:5px; }
tr.dnb-row td{ opacity:.55; }
tr.dnb-row td.input-cell input,tr.dnb-row td.col-num{ opacity:1; }
.group-header td{
  background:var(--of-surface-2);color:var(--of-text-2);
  font-weight:600;font-size:11px;letter-spacing:.06em;text-transform:uppercase;
  padding:9px 12px;border-top:1px solid var(--of-border);white-space:normal;
}
.group-count{ color:var(--of-text-3);font-weight:400;text-transform:none;letter-spacing:0;margin-left:8px; }

.address-link{
  background:transparent;border:none;box-shadow:none;
  color:var(--of-text);font-weight:530;font-size:13px;
  text-decoration:underline;text-decoration-color:var(--of-border-strong);
  text-underline-offset:2px;
  height:auto;padding:4px 2px;
  text-align:left;white-space:normal;word-break:break-word;min-width:180px;
  justify-content:flex-start;
}
.address-link:hover{ background:transparent;color:var(--of-oak);text-decoration-color:var(--of-oak); }

.del-btn{
  background:transparent;border:none;box-shadow:none;
  color:var(--of-text-3);font-size:15px;
  width:28px;height:28px;padding:0;
}
.del-btn:hover{ background:var(--of-err-bg);color:var(--of-err-text); }

/* ARV blackout — unchanged behaviour, restyled */
.table-wrap.arv-blackout td.arv-col{ position:relative; }
.table-wrap.arv-blackout td.arv-col input{
  color:transparent!important;text-shadow:none!important;
  background:var(--of-text)!important;border-color:var(--of-text)!important;
  caret-color:transparent;user-select:none;pointer-events:none;
}
#blackoutBtn.active{ background:var(--of-accent);border-color:var(--of-accent);color:var(--of-accent-text); }

/* ============================ Detail modal ============================ */
.detail-modal{ width:780px; }
.detail-grid{ display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:var(--of-s4); }
.detail-field label{
  display:block;font-size:11px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;
  color:var(--of-text-3);margin-bottom:5px;
}
.detail-field input,.detail-field textarea{ width:100%; }

/* County autocomplete dropdown (components/shared/LocationFields.jsx's CountyAutocomplete) */
.county-autocomplete-list{
  position:absolute;top:calc(100% + 4px);left:0;right:0;z-index:5;
  margin:0;padding:4px;list-style:none;
  background:var(--of-surface);border:1px solid var(--of-border);border-radius:var(--of-r);
  box-shadow:var(--of-shadow-lg);
  max-height:220px;overflow-y:auto;
}
.county-autocomplete-list li{
  padding:7px 9px;border-radius:calc(var(--of-r) - 2px);font-size:13px;color:var(--of-text);
  cursor:pointer;
}
.county-autocomplete-list li:hover{ background:var(--of-oak-soft);color:var(--of-oak); }
.detail-close-x{
  background:transparent;border:none;box-shadow:none;
  color:var(--of-text-3);font-size:20px;width:30px;height:30px;padding:0;
}
.detail-close-x:hover{ background:var(--of-surface-3);color:var(--of-text); }

.photo-grid{ display:flex;flex-wrap:wrap;gap:10px;margin-top:10px; }
.photo-thumb{
  position:relative;width:88px;height:88px;
  border-radius:var(--of-r);overflow:hidden;
  border:1px solid var(--of-border);
}
.photo-thumb img{ width:100%;height:100%;object-fit:cover;display:block; }
.photo-thumb button{
  position:absolute;top:3px;right:3px;
  width:20px;height:20px;padding:0;
  background:rgba(20,23,26,.6);color:#fff;border:none;border-radius:var(--of-r-pill);
  font-size:12px;box-shadow:none;
}
.photo-thumb button:hover{ background:rgba(20,23,26,.82); }
.photo-download{
  position:absolute;bottom:3px;right:3px;
  width:20px;height:20px;padding:0;
  background:rgba(20,23,26,.6);color:#fff;border-radius:var(--of-r-pill);
  font-size:12px;line-height:20px;text-align:center;text-decoration:none;
}
.photo-download:hover{ background:rgba(20,23,26,.82);color:#fff; }

.file-list{ display:flex;flex-direction:column;gap:6px;margin-top:10px; }
.file-chip{
  display:flex;align-items:center;gap:8px;
  background:var(--of-surface-2);
  border:1px solid var(--of-border);
  border-radius:var(--of-r);
  padding:7px 10px;
}
.file-chip a{
  color:var(--of-text);font-size:12.5px;flex:1;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  text-decoration:underline;text-decoration-color:var(--of-border-strong);text-underline-offset:2px;
}
.file-chip a:hover{ color:var(--of-oak); }
.file-chip .file-download{
  flex:none;text-decoration:none;
  width:24px;height:24px;line-height:24px;text-align:center;
  color:var(--of-text-3);border-radius:var(--of-r);
}
.file-chip .file-download:hover{ background:var(--of-surface);color:var(--of-oak); }
.file-chip button{
  background:transparent;border:none;box-shadow:none;
  color:var(--of-text-3);width:24px;height:24px;padding:0;font-size:14px;
}
.file-chip button:hover{ background:var(--of-err-bg);color:var(--of-err-text); }

#detailZillowLink{ color:var(--of-text);font-weight:530;font-size:13px;text-decoration:underline;text-underline-offset:2px; }
#detailZillowLink:hover{ color:var(--of-oak); }
#detailZillowLink[aria-disabled="true"]{ color:var(--of-text-3);text-decoration:none;pointer-events:none; }
#detailAuctionComLink{ color:var(--of-info-text);font-weight:530;font-size:13px;text-decoration:underline;text-underline-offset:2px; }

.modal textarea{ width:100%;height:180px;font-family:var(--of-font-mono);font-size:12px; }

/* ============================ Footer reference panel ============================ */
.footer{ display:grid;grid-template-columns:1fr;gap:12px; }
.panel-box{
  background:var(--of-surface);
  border:1px solid var(--of-border);
  border-radius:var(--of-r-lg);
  box-shadow:var(--of-shadow-xs);
  padding:var(--of-s5);
  font-size:12.5px;
}
.panel-box h3{
  margin:0 0 12px;font-size:11px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;
  color:var(--of-text-3);
}
/* Two term/meaning tables side by side — halves the section's height by using the panel's full
   width instead of stacking all 15 rows in one tall column. Each .formula-table is independently
   a term (left) / meaning (right) grid; .formula-row uses display:contents so its two children
   become direct items of that grid — that's what lets a plain two-column grid still read as
   aligned term/meaning rows instead of a left-to-right, top-to-bottom masonry flow. */
.formula-columns{ display:grid;grid-template-columns:1fr 1fr;column-gap:36px; }
.formula-table{ display:grid;grid-template-columns:minmax(120px,168px) 1fr;column-gap:20px;align-content:start; }
.formula-row{ display:contents; }
.formula-term{
  padding:7px 0;color:var(--of-oak);font-weight:650;font-size:12px;
  letter-spacing:.01em;border-bottom:1px solid var(--of-border);
}
.formula-meaning{
  padding:7px 0;color:var(--of-text-2);font-size:12px;line-height:1.48;
  border-bottom:1px solid var(--of-border);
}
.formula-table .formula-row:last-child .formula-term,
.formula-table .formula-row:last-child .formula-meaning{ border-bottom:none; }

/* ============================ Responsive ============================ */
@media (max-width:1100px){ .stats{ grid-template-columns:repeat(3,1fr); } }
@media (max-width:900px){ .formula-columns{ grid-template-columns:1fr; } }
@media (max-width:700px){
  .formula-table{ grid-template-columns:1fr; }
  .formula-term{ padding-bottom:2px;border-bottom:none; }
  .formula-meaning{ padding-top:0; }
}
@media (max-width:860px){
  .header{ gap:12px; }
  .month-label{ font-size:15px;min-width:0; }
  .filters input[type=text]{ width:100%;flex:1 1 100%; }
  .detail-grid{ grid-template-columns:1fr 1fr; }
  .detail-modal{ width:100%; }
}
@media (max-width:560px){
  .brand-icon{ width:32px;height:32px;font-size:15px; }
  .brand h1{ font-size:17px; }
  .header-actions{ gap:6px; }
  .header-actions button{ height:var(--of-h-sm);padding:0 10px;font-size:12px; }
  .stats{ grid-template-columns:repeat(2,1fr); }
  .toolbar{ flex-direction:column;align-items:stretch; }
  .filters{ flex-direction:column;align-items:stretch; }
  .filters select,.filters input{ width:100%; }
  .detail-grid{ grid-template-columns:1fr; }
  .won-month-grid{ grid-template-columns:1fr; }
  .modal-overlay{ padding:0; }
  .modal{ border-radius:0;max-height:100vh;height:100%;padding:var(--of-s5); }
  .month-bar select{ width:100%; }
  .toast{ left:14px;right:14px;bottom:14px;max-width:none; }
}
@media (hover:none) and (pointer:coarse){
  .header-actions button,.page-tab,.address-link{ min-height:38px; }
}
`;

export function pipelineCSS() {
  return OAKFLOW_CSS + PIPELINE_LAYOUT;
}
