// OakFlow — Property Operations (Acquisitions Center) styles.
// Layout-specific rules only; tokens and shared primitives come from
// components/design-system.js. This module was previously a dark theme with a
// light/dark toggle — both are gone. Light-only, one shared palette.

import { OAKFLOW_CSS } from '../design-system';

const ACQUISITIONS_LAYOUT = `
/* Top padding matches the gutter used on Home/Pipeline/Admin, so the page starts with the same
   breathing room from the viewport edge everywhere — left/right/bottom stay 0 here since every
   section below (.masthead, .tape, .nav, .controls, etc.) already pads itself horizontally with
   the same var(--of-gutter); adding it at the body level too would double it up. */
body{ padding:var(--of-gutter) 0 56px; }

/* ============================ Masthead ============================ */
.masthead{
  display:flex;align-items:flex-start;justify-content:space-between;
  gap:var(--of-s5);flex-wrap:wrap;
  padding:0 var(--of-gutter) var(--of-s4);
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
.brand-tag{
  display:block;height:auto;border:none;background:none;padding:0;border-radius:0;
  font-size:11.5px;font-weight:500;color:var(--of-text-3);
  letter-spacing:.04em;margin-top:1px;white-space:normal;
}
.mast-actions{ display:flex;gap:7px;flex-wrap:wrap;align-items:center; }

/* Anchor styled as a button (the back-link to the pipeline) */
a.btn{ text-decoration:none; }
.btn{
  font-family:inherit;font-size:13px;font-weight:530;line-height:1;
  height:var(--of-h);padding:0 13px;
  border-radius:var(--of-r);border:1px solid var(--of-border-strong);
  background:var(--of-surface);color:var(--of-text);
  cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:7px;
  white-space:nowrap;box-shadow:var(--of-shadow-xs);
  transition:background .13s ease,border-color .13s ease,color .13s ease;
}
.btn:hover{ background:var(--of-surface-3); }
.btn-primary{ background:var(--of-accent);border-color:var(--of-accent);color:var(--of-accent-text); }
.btn-primary:hover{ background:var(--of-accent-hover);border-color:var(--of-accent-hover); }
.btn-danger{ color:var(--of-err-text);border-color:var(--of-err-border); }
.btn-danger:hover{ background:var(--of-err-bg); }
.btn-win{ color:var(--of-ok-text);border-color:var(--of-ok-border); }
.btn-win:hover{ background:var(--of-ok-bg); }
.btn-lose{ color:var(--of-err-text);border-color:var(--of-err-border); }
.btn-lose:hover{ background:var(--of-err-bg); }
.btn-sm{ height:var(--of-h-sm);padding:0 10px;font-size:12px; }
.btn-xs{ height:24px;padding:0 9px;font-size:11.5px; }

/* ============================ KPI strip ============================ */
.tape{
  display:grid;grid-template-columns:repeat(7,1fr);gap:10px;
  padding:var(--of-s4) var(--of-gutter);
  background:var(--of-bg);
  border-bottom:1px solid var(--of-border);
}
.tape-cell{
  background:var(--of-surface);
  border:1px solid var(--of-border);
  border-radius:var(--of-r-lg);
  box-shadow:var(--of-shadow-xs);
  padding:12px 14px;position:relative;min-width:0;
}
/* Category accent kept as a hairline rather than a colour block */
.tape-cell.lead::before{
  content:'';position:absolute;left:0;top:10px;bottom:10px;width:2px;border-radius:2px;
}
.tape-cell.lead.reno::before{ background:var(--of-oak); }
.tape-cell.lead.active::before{ background:var(--of-info-text); }
.tape-cell.lead.sold::before{ background:var(--of-ok-text); }
.tape-cell .k{
  font-size:10.5px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;
  color:var(--of-text-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.tape-cell .v{
  font-size:20px;font-weight:620;letter-spacing:-.02em;margin-top:5px;
  font-variant-numeric:tabular-nums;color:var(--of-text);line-height:1.15;
}
.tape-cell .v small{ font-size:12px;color:var(--of-text-3);margin-left:6px;font-weight:450; }
.tape-cell .s{ font-size:11.5px;color:var(--of-text-3);margin-top:4px; }
/* Value emphasis: only profit/loss carries colour */
.v.jade{ color:var(--of-ok-text); }
.v.ox{ color:var(--of-err-text); }
.v.brass,.v.steel,.v.amber{ color:var(--of-text); }

/* ============================ View tabs ============================ */
.nav{
  display:flex;gap:6px;overflow-x:auto;
  padding:var(--of-s3) var(--of-gutter);
  background:var(--of-surface);
  border-bottom:1px solid var(--of-border);
}
.nav button{
  height:32px;padding:0 14px;flex:none;
  background:transparent;border:1px solid transparent;box-shadow:none;
  border-radius:var(--of-r);
  color:var(--of-text-2);font-size:13px;font-weight:530;white-space:nowrap;
}
.nav button:hover{ background:var(--of-surface-3);border-color:transparent; }
.nav button[aria-selected="true"]{
  background:var(--of-accent);border-color:var(--of-accent);color:var(--of-accent-text);font-weight:550;
}
.nav .count{
  font-size:12px;margin-left:7px;opacity:.7;font-variant-numeric:tabular-nums;font-weight:500;
}

/* ============================ Controls / filters ============================ */
.controls{
  padding:var(--of-s3) var(--of-gutter);
  background:var(--of-surface);
  border-bottom:1px solid var(--of-border);
  display:flex;flex-direction:column;gap:9px;
}
.ctl-row{ display:flex;gap:9px;align-items:center;flex-wrap:wrap; }
.search{
  flex:1 1 300px;min-width:220px;
  display:flex;align-items:center;gap:8px;
  background:var(--of-surface);
  border:1px solid var(--of-border-strong);
  border-radius:var(--of-r);
  height:var(--of-h);padding:0 11px;
}
.search:focus-within{ border-color:var(--of-oak);box-shadow:0 0 0 3px var(--of-focus-ring); }
.search input{
  flex:1;background:none;border:none;outline:none;box-shadow:none;height:auto;padding:0;font-size:13px;
}
.search input:focus{ box-shadow:none; }
.search svg{ flex:none;stroke:var(--of-text-3); }
.field{ display:flex;align-items:center;gap:6px; }
.field label,.lab{
  font-size:11px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:var(--of-text-3);
  white-space:nowrap;
}
.inp{ font-size:13px; }
.inp:disabled{ opacity:.55;cursor:not-allowed;background:var(--of-surface-2); }
.inp.num{ width:104px;text-align:right;font-variant-numeric:tabular-nums; }
.inp.date{ width:150px; }
.sep{ width:1px;height:20px;background:var(--of-border);flex:none; }

/* ============================ Photos / title report (drawer) ============================ */
/* Same pattern as Auction Pipeline's DetailModal (components/pipeline/styles.js) — ported here
   since Property Operations previously had no document UI at all despite the API already
   supporting upload/view/remove for every role that lands on this page. */
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

.chips{ display:flex;gap:6px;flex-wrap:wrap; }
.chip{
  height:var(--of-h-sm);padding:0 11px;
  border:1px solid var(--of-border-strong);background:var(--of-surface);
  border-radius:var(--of-r-pill);
  color:var(--of-text-2);font-size:12px;font-weight:500;
  display:inline-flex;align-items:center;gap:6px;
  cursor:pointer;box-shadow:none;
}
.chip:hover{ background:var(--of-surface-3); }
.chip[aria-pressed="true"]{
  background:var(--of-accent);border-color:var(--of-accent);color:var(--of-accent-text);
}
.chip .dot{ width:6px;height:6px;border-radius:50%;flex:none; }

.results-line{
  padding:9px var(--of-gutter);
  font-size:12px;color:var(--of-text-3);
  background:var(--of-surface-2);
  border-bottom:1px solid var(--of-border);
  display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;
}

.note{
  padding:10px var(--of-gutter);
  background:var(--of-warn-bg);
  border-bottom:1px solid var(--of-warn-border);
  color:var(--of-warn-text);font-size:12.5px;
  display:flex;align-items:center;gap:10px;flex-wrap:wrap;
}
.note b{ font-weight:600; }

/* ============================ Sub-strip ============================ */
.substrip{
  display:flex;flex-wrap:wrap;
  background:var(--of-surface);
  border-bottom:1px solid var(--of-border);
}
.substrip .cell{
  padding:12px 18px;flex:1;min-width:150px;
  border-right:1px solid var(--of-border);
}
.substrip .cell:last-child{ border-right:none; }
.substrip .k{
  font-size:10.5px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:var(--of-text-3);
}
.substrip .v{
  font-size:16px;font-weight:600;margin-top:4px;font-variant-numeric:tabular-nums;color:var(--of-text);
}

/* ============================ Tables ============================ */
.tw{
  overflow:auto;background:var(--of-surface);
  border-top:1px solid var(--of-border);
  border-bottom:1px solid var(--of-border);
  contain:paint;
}
.tw table{ min-width:1040px; }
th.sortable{ cursor:pointer;user-select:none; }
th.sortable:hover{ color:var(--of-text);background:var(--of-surface-3); }
th.r,td.r{ text-align:right; }
tbody td{ font-size:12.5px;white-space:nowrap;font-variant-numeric:tabular-nums; }
tbody td.addr-cell{
  font-weight:530;white-space:normal;min-width:210px;cursor:pointer;
  font-variant-numeric:normal;
}
tbody td.addr-cell:hover{ color:var(--of-oak); }
tfoot td{
  padding:11px 12px;border-top:1px solid var(--of-border-strong);
  font-size:12.5px;font-weight:600;font-variant-numeric:tabular-nums;
  color:var(--of-text);background:var(--of-surface-2);white-space:nowrap;
}
.pill{
  display:inline-flex;align-items:center;height:21px;padding:0 9px;
  border-radius:var(--of-r-pill);border:1px solid;
  font-size:11px;font-weight:550;white-space:nowrap;
  background:var(--of-surface-2);
}
.pos{ color:var(--of-ok-text); }
.neg{ color:var(--of-err-text); }
.muted{ color:var(--of-text-3); }

.cell-inp{
  width:100px;height:28px;text-align:right;
  font-size:12.5px;font-variant-numeric:tabular-nums;
  background:var(--of-surface);border:1px solid var(--of-border);border-radius:var(--of-r-sm);
  padding:0 8px;
}
.cell-inp:hover{ border-color:var(--of-border-strong); }
.cell-inp::placeholder{ color:var(--of-text-3); }

/* ============================ Kanban board ============================ */
.board{
  display:grid;grid-template-columns:repeat(5,minmax(230px,1fr));
  gap:12px;padding:var(--of-s4) var(--of-gutter);
  overflow-x:auto;align-items:start;
}
.col{
  background:var(--of-surface-2);
  border:1px solid var(--of-border);
  border-radius:var(--of-r-lg);
  min-height:360px;display:flex;flex-direction:column;
}
.col.dragover{ border-color:var(--of-oak);background:var(--of-oak-soft); }
.col-head{
  padding:12px 13px 10px;border-bottom:1px solid var(--of-border);
  position:sticky;top:0;background:var(--of-surface-2);z-index:2;
  border-radius:var(--of-r-lg) var(--of-r-lg) 0 0;
}
.col-head .name{
  font-size:12px;font-weight:600;letter-spacing:.02em;color:var(--of-text);
  display:flex;align-items:center;gap:7px;
}
.col-head .bar{
  height:3px;margin-top:9px;background:var(--of-border);border-radius:2px;
  position:relative;overflow:hidden;
}
.col-head .bar i{ position:absolute;inset:0 auto 0 0;display:block;border-radius:2px; }
.col-head .meta{
  font-size:11px;color:var(--of-text-3);margin-top:8px;
  display:flex;justify-content:space-between;gap:8px;font-variant-numeric:tabular-nums;
}
.col-body{ padding:10px;display:flex;flex-direction:column;gap:9px;flex:1; }

.card{
  background:var(--of-surface);
  border:1px solid var(--of-border);
  border-left:3px solid var(--of-border-strong);
  border-radius:var(--of-r);
  box-shadow:var(--of-shadow-xs);
  padding:11px 12px;cursor:grab;
  transition:box-shadow .13s ease,border-color .13s ease;
}
.card:hover{ box-shadow:var(--of-shadow-sm); }
.card.dragging{ opacity:.45; }
.card .addr{ font-weight:600;font-size:13px;line-height:1.35;color:var(--of-text); }
.card .loc{ font-size:11.5px;color:var(--of-text-3);margin-top:2px; }
.card .figs{
  display:flex;justify-content:space-between;gap:8px;margin-top:10px;
  font-size:12px;font-weight:550;font-variant-numeric:tabular-nums;color:var(--of-text);
}
.card .figs .lab2{
  display:block;font-size:9.5px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
  color:var(--of-text-3);margin-bottom:2px;
}

.margin{ margin-top:11px; }
.margin-track{
  position:relative;height:6px;border-radius:3px;
  background:var(--of-surface-3);border:1px solid var(--of-border);overflow:visible;
}
.margin-fill{ position:absolute;top:0;bottom:0;left:0;background:var(--of-text-2);border-radius:3px 0 0 3px; }
.margin-fill.reno{ background:repeating-linear-gradient(135deg,var(--of-oak) 0 3px,#a98c5f 3px 6px); }
.margin-fill.hot{ background:var(--of-err-text); }
.margin-tick{ position:absolute;top:-3px;bottom:-3px;width:2px;background:var(--of-text);border-radius:1px; }
.margin-legend{
  display:flex;justify-content:space-between;gap:8px;margin-top:7px;
  font-size:11px;color:var(--of-text-3);font-variant-numeric:tabular-nums;
}
.margin-legend b{ font-weight:600;color:var(--of-ok-text); }
.margin-legend b.neg{ color:var(--of-err-text); }

.card-foot{
  display:flex;align-items:center;gap:6px;flex-wrap:wrap;
  margin-top:11px;padding-top:9px;border-top:1px solid var(--of-border);
}
.tag{
  display:inline-flex;align-items:center;height:20px;padding:0 8px;
  border-radius:var(--of-r-sm);border:1px solid var(--of-border);
  background:var(--of-surface-2);color:var(--of-text-3);
  font-size:10.5px;font-weight:500;white-space:nowrap;
}
.tag.warn{ color:var(--of-err-text);border-color:var(--of-err-border);background:var(--of-err-bg); }
.tag.good{ color:var(--of-ok-text);border-color:var(--of-ok-border);background:var(--of-ok-bg); }
.card-foot .spacer{ flex:1; }
.icon-btn{
  width:26px;height:24px;padding:0;flex:none;
  background:var(--of-surface);border:1px solid var(--of-border);border-radius:var(--of-r-sm);
  color:var(--of-text-3);font-size:13px;line-height:1;box-shadow:none;
}
.icon-btn:hover{ background:var(--of-surface-3);color:var(--of-text);border-color:var(--of-border-strong); }
.empty-col{
  border:1px dashed var(--of-border-strong);border-radius:var(--of-r);
  padding:18px 12px;text-align:center;color:var(--of-text-3);font-size:12px;line-height:1.6;
}

/* ============================ Bid sheet ============================ */
.bidsheet{ padding:0 0 40px; }
.bid-row{
  border-bottom:1px solid var(--of-border);
  padding:var(--of-s5) var(--of-gutter);
  display:grid;grid-template-columns:1fr auto;gap:var(--of-s5);align-items:start;
  background:var(--of-surface);
}
.bid-row.done{ opacity:.6; }
.bid-main .addr{ font-size:17px;font-weight:600;letter-spacing:-.01em;color:var(--of-text); }
.bid-main .sub{ font-size:12.5px;color:var(--of-text-3);margin-top:3px; }
.bid-figs{ display:flex;gap:26px;margin-top:14px;flex-wrap:wrap; }
.bid-fig .k{
  font-size:10.5px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--of-text-3);
}
.bid-fig .v{ font-size:16px;font-weight:600;margin-top:3px;font-variant-numeric:tabular-nums;color:var(--of-text); }
.bid-fig .v.big{ font-size:24px;font-weight:650;letter-spacing:-.02em; }
.bid-act{ display:flex;flex-direction:column;gap:8px;min-width:220px; }
.bid-act .row{ display:flex;gap:7px; }
.bid-act input{ width:100%; }
.bid-outcome{ font-size:12.5px;font-weight:550;padding:8px 0; }
.walkaway{
  border-left:2px solid var(--of-err-border);padding-left:12px;margin-top:14px;
  font-size:12px;color:var(--of-text-3);
}
.walkaway b{ color:var(--of-err-text);font-weight:600; }

/* ============================ Reports ============================ */
.rep-section{
  border-bottom:1px solid var(--of-border);
  padding:var(--of-s6) var(--of-gutter);
  background:var(--of-surface);
}
.rep-head{
  display:flex;justify-content:space-between;align-items:baseline;gap:14px;flex-wrap:wrap;
  margin-bottom:var(--of-s4);
}
.rep-head h3{
  margin:0;font-size:14px;font-weight:600;letter-spacing:-.005em;color:var(--of-text);
}
.rep-head p{ margin:0;color:var(--of-text-3);font-size:12.5px; }
.period-bar{
  display:flex;gap:10px;align-items:center;flex-wrap:wrap;
  padding:var(--of-s3) var(--of-gutter);
  background:var(--of-surface-2);
  border-bottom:1px solid var(--of-border);
}
.stat-grid{
  display:grid;grid-template-columns:repeat(auto-fit,minmax(168px,1fr));gap:10px;
}
.stat{
  background:var(--of-surface);
  border:1px solid var(--of-border);
  border-radius:var(--of-r-lg);
  box-shadow:var(--of-shadow-xs);
  padding:13px 15px;min-width:0;
}
.stat .k{
  font-size:10.5px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:var(--of-text-3);
}
.stat .v{
  font-size:19px;font-weight:620;letter-spacing:-.02em;margin-top:5px;
  font-variant-numeric:tabular-nums;color:var(--of-text);
}
.stat .s{ font-size:11.5px;color:var(--of-text-3);margin-top:3px; }

.chart{
  display:flex;align-items:flex-end;gap:3px;height:180px;
  border-bottom:1px solid var(--of-border);padding-top:24px;
}
.bar-wrap{ flex:1;min-width:20px;display:flex;flex-direction:column;justify-content:flex-end;height:100%;position:relative; }
.bar{ background:var(--of-ok-text);width:100%;min-height:2px;border-radius:3px 3px 0 0;opacity:.85; }
.bar.neg{ background:var(--of-err-text); }
.bar-wrap:hover .bar{ opacity:1; }
.bar-val{
  font-size:9.5px;text-align:center;color:var(--of-text-3);margin-bottom:4px;white-space:nowrap;
  font-variant-numeric:tabular-nums;
}
.bar-count{
  position:absolute;top:4px;left:50%;transform:translateX(-50%);
  font-size:9.5px;color:var(--of-text-3);font-weight:600;
}
.chart-axis{ display:flex;gap:3px;margin-top:7px; }
.chart-axis div{ flex:1;min-width:20px;text-align:center;font-size:9.5px;color:var(--of-text-3); }
.chart-legend{ font-size:11.5px;color:var(--of-text-3);margin-top:10px; }

.split{ display:grid;grid-template-columns:1fr 1fr;gap:var(--of-s6); }
.mini{
  border:1px solid var(--of-border);border-radius:var(--of-r);overflow:hidden;
}
.mini thead th{ position:static;background:var(--of-surface-2); }
.bar-inline{
  height:4px;background:var(--of-surface-3);border-radius:2px;overflow:hidden;margin-top:5px;min-width:70px;
}
.bar-inline i{ display:block;height:100%; }
.rep-empty,.view-empty{
  padding:44px 24px;text-align:center;color:var(--of-text-3);font-size:13px;line-height:1.7;
}

/* ============================ Financial workbook ============================ */
#v_workbook{ background:var(--of-surface); }
#workbookBody{ padding:var(--of-s6) var(--of-gutter);color:var(--of-text); }
.wb-empty{ padding:44px 24px;text-align:center;color:var(--of-text-3);font-size:13px;line-height:1.7; }
.wb-section{ margin-bottom:var(--of-s6); }
.wb-head{ margin-bottom:var(--of-s3); }
.wb-head h3{
  margin:0;font-size:14px;font-weight:600;color:var(--of-text);
  border-bottom:1px solid var(--of-border);padding-bottom:9px;
}
.wb-head p{ margin:5px 0 0;color:var(--of-text-3);font-size:12.5px; }
.wb-stat-grid{ display:grid;grid-template-columns:repeat(auto-fit,minmax(172px,1fr));gap:10px; }
.wb-stat{
  background:var(--of-surface);border:1px solid var(--of-border);
  border-radius:var(--of-r-lg);box-shadow:var(--of-shadow-xs);padding:13px 15px;
}
.wb-stat .k{
  font-size:10.5px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:var(--of-text-3);
}
.wb-stat .v{
  font-size:19px;font-weight:620;letter-spacing:-.02em;margin-top:5px;
  font-variant-numeric:tabular-nums;color:var(--of-text);
}
.wb-stat .v.pos{ color:var(--of-ok-text); }
.wb-stat .v.neg{ color:var(--of-err-text); }
.wb-stat .s{ font-size:11.5px;color:var(--of-text-3);margin-top:3px; }
.wb-table{
  width:100%;border-collapse:separate;border-spacing:0;
  border:1px solid var(--of-border);border-radius:var(--of-r);overflow:hidden;
  background:var(--of-surface);
}
.wb-table th{
  background:var(--of-surface-2);color:var(--of-text-2);
  font-size:10.5px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
  padding:9px 11px;text-align:left;position:static;
}
.wb-table th.r,.wb-table td.r{ text-align:right; }
.wb-table td{
  padding:8px 11px;border-bottom:1px solid var(--of-border);
  color:var(--of-text);font-size:12.5px;font-variant-numeric:tabular-nums;
}
.wb-table tbody tr:last-child td{ border-bottom:none; }
.wb-table tfoot td{
  border-top:1px solid var(--of-border-strong);font-weight:600;background:var(--of-surface-2);
}
.wb-table .pos{ color:var(--of-ok-text); }
.wb-table .neg{ color:var(--of-err-text); }
.wb-note{ font-size:11.5px;color:var(--of-text-3);margin-top:9px; }

/* ============================ Drawer ============================ */
.scrim{
  position:fixed;inset:0;background:rgba(20,23,26,.42);backdrop-filter:blur(2px);
  z-index:40;
}
.drawer{
  position:fixed;top:0;right:0;bottom:0;width:min(520px,100%);
  background:var(--of-surface);
  border-left:1px solid var(--of-border);
  box-shadow:var(--of-shadow-lg);
  z-index:50;display:flex;flex-direction:column;
}
.drawer-head{
  padding:var(--of-s4) var(--of-s5);
  border-bottom:1px solid var(--of-border);
  display:flex;justify-content:space-between;align-items:center;gap:10px;
}
.drawer-head h2{
  margin:0;font-size:15px;font-weight:600;letter-spacing:-.01em;color:var(--of-text);
}
.drawer-body{ padding:var(--of-s5);overflow-y:auto;flex:1; }
.drawer-foot{
  padding:var(--of-s3) var(--of-s5);
  border-top:1px solid var(--of-border);
  background:var(--of-surface-2);
  display:flex;gap:9px;align-items:center;flex-wrap:wrap;
}
.fieldset{ margin-bottom:var(--of-s6); }
.fs-title{
  display:block;width:100%;
  font-size:11px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;
  color:var(--of-text-3);
  padding-bottom:8px;margin-bottom:var(--of-s3);
  border-bottom:1px solid var(--of-border);
}
.grid2{ display:grid;grid-template-columns:1fr 1fr;gap:11px; }
.grid2 .full{ grid-column:1/-1; }
.f label{
  display:block;font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;
  color:var(--of-text-3);margin-bottom:5px;
}
.f .inp,.f textarea{ width:100%; }
.f .inp.num,.f .inp.date{ width:100%;text-align:left; }
.f textarea{ min-height:72px;font-size:13px; }

.calc{
  background:var(--of-surface-2);
  border:1px solid var(--of-border);
  border-radius:var(--of-r);
  padding:13px 14px;margin-top:var(--of-s3);
}
.calc-row{
  display:flex;justify-content:space-between;gap:12px;padding:5px 0;
  font-size:12.5px;font-variant-numeric:tabular-nums;
}
.calc-row span:first-child{ color:var(--of-text-3); }
.calc-row.total{
  border-top:1px solid var(--of-border);margin-top:7px;padding-top:9px;
  font-size:13.5px;font-weight:600;
}
.linkout{
  display:inline-flex;gap:6px;align-items:center;
  color:var(--of-text);text-decoration:none;font-size:12.5px;font-weight:530;
  border:1px solid var(--of-border-strong);border-radius:var(--of-r);
  height:var(--of-h-sm);padding:0 11px;margin-bottom:var(--of-s3);
}
.linkout:hover{ background:var(--of-surface-3);color:var(--of-oak); }

/* ============================ Import modal ============================ */
.modal{
  position:fixed;inset:24px;max-width:840px;margin:auto;
  background:var(--of-surface);border:1px solid var(--of-border);
  border-radius:var(--of-r-lg);box-shadow:var(--of-shadow-lg);
  z-index:55;display:none;flex-direction:column;padding:0;max-height:none;
}
.modal.open{ display:flex; }
.modal-head{
  padding:var(--of-s4) var(--of-s5);border-bottom:1px solid var(--of-border);
  display:flex;justify-content:space-between;align-items:center;
}
.modal-head h2{ margin:0;font-size:15px;font-weight:600;letter-spacing:-.01em; }
.modal-body{ padding:var(--of-s5);overflow:auto;flex:1; }
.modal-foot{
  padding:var(--of-s3) var(--of-s5);border-top:1px solid var(--of-border);
  background:var(--of-surface-2);
  display:flex;gap:9px;align-items:center;
}
.drop{
  border:1px dashed var(--of-border-strong);border-radius:var(--of-r);
  padding:32px 20px;text-align:center;color:var(--of-text-3);
  font-size:13px;line-height:1.7;cursor:pointer;background:var(--of-surface-2);
}
.drop:hover,.drop.over{ border-color:var(--of-oak);background:var(--of-oak-soft);color:var(--of-text-2); }
.map-grid{ display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:11px;margin-top:6px; }
textarea.paste{
  width:100%;min-height:130px;font-family:var(--of-font-mono);font-size:12px;
}

/* ============================ Toast ============================ */
.toast{
  left:50%;right:auto;bottom:24px;transform:translateX(-50%);
  font-weight:500;letter-spacing:0;text-transform:none;
}

/* ============================ Print ============================ */
.print-letterhead{ display:none; }
@media print{
  @page{ margin:0.55in; }
  *{ box-shadow:none!important;text-shadow:none!important; }
  body{ background:#fff;color:#14171a;padding:0;font-size:11.5px;line-height:1.4; }
  .masthead,.controls,.results-line,.nav,.tape,.period-bar,.note,.drawer,.scrim,.toast,.modal,
  .bid-act,.substrip,.board,.card,.mast-actions{ display:none!important; }
  main>section{ display:none!important; }
  main>section:not([hidden]){ display:block!important; }

  .print-letterhead{
    display:block!important;margin-bottom:18px;padding-bottom:12px;border-bottom:2px solid #14171a;
  }
  .pl-row{ display:flex;justify-content:space-between;align-items:baseline;gap:16px; }
  .pl-brand{ font-size:18px;font-weight:650;letter-spacing:-.01em;color:#14171a; }
  .pl-title{
    font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#5c6166;
  }
  .pl-meta{
    display:flex;justify-content:space-between;margin-top:6px;font-size:10px;color:#5c6166;
  }

  #reportBody,#workbookBody{ background:#fff;padding:0; }
  .rep-section{
    background:#fff;border:1px solid #d7dee5;border-radius:0;
    padding:16px 0;margin-bottom:14px;page-break-inside:avoid;
  }
  .rep-section .split{ padding:0 16px; }
  .rep-head{ padding:0 16px;margin-bottom:12px; }
  .rep-head h3{ color:#14171a;border-bottom:1px solid #14171a;padding-bottom:8px; }
  .rep-head p{ color:#5c6166; }

  .stat-grid,.wb-stat-grid{ margin:0 16px;width:calc(100% - 32px); }
  .stat,.wb-stat{ background:#fff;border:1px solid #d7dee5;box-shadow:none; }
  .stat .k,.wb-stat .k{ color:#5c6166; }
  .stat .v,.wb-stat .v{ color:#14171a; }
  .stat .s,.wb-stat .s{ color:#8a919a; }
  .pos{ color:#1a6b40!important; }
  .neg{ color:#a52a25!important; }

  #reportBody table,.wb-table{ width:100%;border-collapse:collapse;background:#fff; }
  #reportBody .mini,#reportBody .tw,.wb-table{
    border:1px solid #d7dee5;margin:0 16px;width:calc(100% - 32px);
  }
  #reportBody thead{ display:table-header-group; }
  #reportBody thead th,.wb-table th{
    background:#f2f3f4!important;color:#14171a!important;position:static;
    border-bottom:1px solid #d7dee5;font-size:9px;letter-spacing:.08em;padding:7px 10px;
  }
  #reportBody tbody td,.wb-table td{ padding:6px 10px;border-bottom:1px solid #e6ebef;color:#14171a; }
  #reportBody tbody tr:nth-child(even) td,.wb-table tbody tr:nth-child(even) td{ background:#fafbfc; }
  #reportBody tbody tr{ page-break-inside:avoid; }
  #reportBody tfoot td,.wb-table tfoot td{
    border-top:1px solid #14171a;border-bottom:none;padding:8px 10px;
    font-weight:700;color:#14171a;background:#fff;
  }
  #reportBody .addr-cell,#reportBody .muted{ color:#14171a!important; }
  #reportBody .rep-empty{ padding:0 16px;color:#8a919a; }

  .chart{ margin:0 16px;width:calc(100% - 32px); }
  .bar{ background:#14171a!important; }
  .bar.neg{ background:#a52a25!important; }
  .bar-val,.chart-axis,.chart-legend{ color:#5c6166!important; }
  .wb-section{ page-break-inside:avoid; }
}

/* ============================ Responsive ============================ */
@media (max-width:1100px){
  .tape{ grid-template-columns:repeat(4,1fr); }
}
@media (max-width:900px){
  .tape{ grid-template-columns:repeat(3,1fr); }
  .grid2,.split{ grid-template-columns:1fr; }
  .bid-row{ grid-template-columns:1fr; }
  .board{ grid-template-columns:repeat(5,minmax(210px,1fr)); }
  .bid-act{ min-width:0;width:100%; }
  .modal{ inset:14px; }
}
@media (max-width:560px){
  .tape{ grid-template-columns:repeat(2,1fr); }
  .masthead{ gap:12px; }
  .mast-actions .btn{ height:var(--of-h-sm);padding:0 10px;font-size:12px; }
  .ctl-row{ gap:8px; }
  .search{ flex-basis:100%; }
  .field{ flex-wrap:wrap;row-gap:6px; }
  .results-line{ flex-direction:column;align-items:flex-start;gap:4px; }
  .stat-grid,.wb-stat-grid{ grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); }
  .board{ grid-template-columns:repeat(5,minmax(230px,1fr)); }
  .bid-figs{ gap:16px; }
  .drawer{ width:100%; }
  .modal{ inset:0;border-radius:0;max-width:none; }
  .rep-head,.period-bar{ flex-direction:column;align-items:flex-start;gap:8px; }
  .period-bar .sep{ display:none; }
  .map-grid{ grid-template-columns:1fr; }
  .toast{ left:14px;right:14px;transform:none;max-width:none; }
}
@media (max-width:420px){
  .tape{ grid-template-columns:1fr 1fr; }
  .brand h1{ font-size:17px; }
  .nav button{ height:var(--of-h-sm);font-size:12.5px; }
}
@media (hover:none) and (pointer:coarse){
  .nav button,.btn,.chip{ min-height:38px; }
}
`;

export const ACQUISITIONS_CSS = OAKFLOW_CSS + ACQUISITIONS_LAYOUT;
