import { OAKFLOW_CSS } from '@/components/design-system';

const ADMIN_LAYOUT = `
.admin-wrap{
  min-height:100vh;
  padding:var(--of-gutter);
}
.admin-header{
  display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;
  padding-bottom:var(--of-s4);margin-bottom:var(--of-s6);
  border-bottom:1px solid var(--of-border);
}

/* Same brand block (icon + "OakFlow" wordmark + small tag line) used on every other page's
   header — admin screens previously had a plain text title instead, which is what made them
   look unbranded/misaligned next to the rest of the app. */
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
.brand h1{ margin:0;font-size:19px;font-weight:650;letter-spacing:-.015em;color:var(--of-text); }
.brand h1 .brand-a{ color:var(--of-text); }
.brand h1 .brand-b{ color:var(--of-text-3);font-weight:500; }
.brand .tag{
  font-size:11.5px;font-weight:500;color:var(--of-text-3);
  letter-spacing:.04em;margin-top:1px;
}
.header-actions{ display:flex;gap:8px;flex-wrap:wrap;align-items:center; }

.admin-grid{
  display:grid;
  grid-template-columns:340px 1fr;
  gap:var(--of-s6);
  align-items:start;
}
@media (max-width:860px){
  .admin-grid{ grid-template-columns:1fr; }
}

.admin-card{ padding:var(--of-s5); }
.admin-card h2{ font-size:14px;font-weight:600;margin:0 0 4px;color:var(--of-text); }
.admin-card .admin-card-sub{ font-size:12px;color:var(--of-text-3);margin:0 0 16px; }

.admin-field{ display:flex;flex-direction:column;gap:5px;margin-bottom:14px; }
.admin-field label{ font-size:12px;font-weight:550;color:var(--of-text-2); }

.admin-permissions-block{
  padding:12px 14px;margin-bottom:16px;
  background:var(--of-surface-2);border:1px solid var(--of-border);border-radius:var(--of-r);
}
.admin-permissions-block > label{ font-size:12px;font-weight:550;color:var(--of-text-2); }
.permission-checkboxes{ display:flex;flex-direction:column;gap:8px;margin-bottom:12px; }
.permission-checkbox{
  display:flex;align-items:center;gap:8px;
  font-size:13px;font-weight:500;color:var(--of-text);cursor:pointer;
}
.permission-checkbox input{ width:15px;height:15px;flex:none;cursor:pointer; }

.admin-error{
  font-size:12.5px;color:var(--of-err-text);background:var(--of-err-bg);
  border:1px solid var(--of-err-border);border-radius:var(--of-r);
  padding:9px 11px;margin-bottom:12px;
}
.admin-success{
  font-size:12.5px;color:var(--of-ok-text);background:var(--of-ok-bg);
  border:1px solid var(--of-ok-border);border-radius:var(--of-r);
  padding:9px 11px;margin-bottom:12px;
}
.admin-warn{
  font-size:12.5px;color:var(--of-warn-text);background:var(--of-warn-bg);
  border:1px solid var(--of-warn-border);border-radius:var(--of-r);
  padding:9px 11px;margin-bottom:12px;
}

.admin-users-table th,.admin-users-table td{ white-space:nowrap; }
.admin-empty{ padding:32px 0;text-align:center;color:var(--of-text-3);font-size:13px; }

.user-filters-row{ display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end;margin-bottom:16px; }
.user-search-field{ flex:1 1 240px;min-width:200px;margin-bottom:0; }
.user-role-filter{ flex:0 0 160px;margin-bottom:0; }
.user-search-hit{
  background:var(--of-oak-soft);color:var(--of-oak);
  border-radius:3px;padding:0 1px;font-weight:650;
}
/* The single top-ranked row for the current search — a light tint so it visibly leads the
   list, on top of the reordering that already puts it first. Targets td directly: the shared
   tbody tr:hover td background rule in design-system.js paints over a plain tr background
   on hover, since it's the same specificity but declared later. */
.user-row-best-match td{ background:var(--of-oak-soft); }
.user-row-best-match:hover td{ background:var(--of-oak-soft); }

/* Status column doubles as the activate/deactivate control — a real <button>, styled to match
   .of-badge exactly rather than the generic button reset (which sets a taller height, visible
   border and padding meant for regular buttons, not a pill-shaped in-table toggle). */
.of-badge-toggle{
  height:22px;padding:0 9px;font-size:11.5px;font-weight:550;border:1px solid rgba(20,23,26,.07);
  box-shadow:none;
}
.of-badge-toggle:hover:not(:disabled){ filter:brightness(0.96); }
.of-badge-toggle:disabled{ cursor:default;opacity:.65; }
`;

export function adminCSS() {
  return OAKFLOW_CSS + ADMIN_LAYOUT;
}
