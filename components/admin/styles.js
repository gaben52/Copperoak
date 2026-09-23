// Admin-page-only additions on top of the shared shell (sidebar/topbar/content wrapper + the
// .ah-card/.ah-field/.ah-btn-*/.ah-badge/.ah-table/.ah-grid-2 primitives all live in
// components/shell/styles.js and are injected once by <AppShell>) — this file only needs what's
// specific to User Management / Assignments: the permissions block and the search/filter row.
const ADMIN_EXTRA = `
.admin-permissions-block{
  padding:12px 14px;margin-bottom:16px;
  background:var(--ah-bg);border:1px solid var(--ah-border);border-radius:var(--ah-r);
}
.admin-permissions-block > label{ font-size:12px;font-weight:550;color:var(--ah-text-2); }
.permission-checkboxes{ display:flex;flex-direction:column;gap:8px;margin-bottom:12px; }
/* Selector qualified with .permission-checkboxes for the same reason as the input rule below —
   the shared shell's ".ah-field label{...}" (components/shell/styles.js) targets any <label>
   nested in an .ah-field, which a bare ".permission-checkbox" (single class) ties or loses to on
   specificity, since that rule also has a type selector. */
.permission-checkboxes .permission-checkbox{
  display:flex;align-items:center;gap:8px;
  font-size:13px;font-weight:500;color:var(--ah-text);cursor:pointer;
}
/* Qualified with the .permission-checkboxes ancestor (not just ".permission-checkbox input") so
   this reliably outranks the shared shell's ".ah-field input{width:100%;...}" rule
   (components/shell/styles.js) on specificity alone — AdminUsersPage.jsx nests this block inside
   an .ah-field, so without the extra qualifier the two rules tie on specificity and whichever
   <style> tag happens to be later in the DOM wins, which silently stretched every checkbox to
   100% width and broke the whole row's layout. */
.permission-checkboxes .permission-checkbox input{ width:15px;height:15px;flex:none;cursor:pointer;accent-color:var(--ah-gold); }

.user-filters-row{ display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end;margin-bottom:16px; }
.user-search-field{ flex:1 1 240px;min-width:200px;margin-bottom:0; }
.user-role-filter{ flex:0 0 160px;margin-bottom:0; }

/* Status column doubles as the activate/deactivate control — a real <button>, styled to match
   .ah-badge exactly rather than the generic button reset. */
.ah-badge-toggle{ height:22px;padding:0 9px;font-size:11.5px;font-weight:550; }
`;

export function adminCSS() {
  return ADMIN_EXTRA;
}
