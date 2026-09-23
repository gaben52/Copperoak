// The shared Acquire Hub app shell: dark sidebar + light topbar/content area, plus a small set of
// reusable content primitives (cards, buttons, badges, tables, form fields, banners) built on the
// same --ah-* tokens, so every re-skinned page (Home, Admin, Pipeline, Property Operations, …)
// draws from one definition instead of each hand-rolling its own card/button/badge look again.
// Every page still injects this via its own <style> tag (full-page-reload navigation, see
// CLAUDE.md), so there's no risk of this colliding with a page that hasn't been re-skinned yet.
const SHELL_TOKENS = `
:root{
  --ah-bg:#f3f4f7;
  --ah-sidebar-bg:#12151c;
  --ah-sidebar-bg-2:#1b202b;
  --ah-sidebar-border:rgba(255,255,255,.07);
  --ah-sidebar-text:#9aa1b0;
  --ah-sidebar-text-active:#ffffff;
  --ah-gold:#d7ae5c;
  --ah-gold-soft:rgba(215,174,92,.16);
  --ah-gold-text:#8a6a22;
  --ah-card-bg:#ffffff;
  --ah-border:#e7e9ee;
  --ah-text:#14171c;
  --ah-text-2:#565c66;
  --ah-text-3:#8a909c;
  --ah-ok:#1f9d55;
  --ah-ok-bg:#eafaf0;
  --ah-ok-border:#cdeedd;
  --ah-err:#c0392b;
  --ah-err-bg:#fdecea;
  --ah-err-border:#f6d0cb;
  --ah-r:14px;
  --ah-r-sm:9px;
  --ah-shadow:0 1px 2px rgba(16,20,26,.04),0 10px 26px -16px rgba(16,20,26,.14);
}
*{ box-sizing:border-box; }
html,body{ background:var(--ah-bg);margin:0; }
body{ font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; }
`;

const SHELL_LAYOUT = `
.ah-shell{
  min-height:100vh;display:flex;align-items:stretch;
  font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
  color:var(--ah-text);
}
/* Logout's fade-out is driven by Framer Motion directly in AppShell.jsx (animate/transition on
   the root motion.div), not a CSS class — full page reloads are used throughout this app (see
   PageTransition.jsx), so this fade-out is the only "leaving" animation possible; /login's own
   PageTransition fade-in (also Framer Motion) covers the arrival half. */

/* ---------------------------------- Sidebar ---------------------------------- */
/* Collapsed to a 72px icon-only rail by default (position:fixed, out of the flex flow — .ah-main
   carries a matching fixed margin-left below); hovering it grows it to the full 258px labeled
   sidebar. Because .ah-main's margin never changes, the expanded sidebar floats over content as
   an overlay (hence the shadow) instead of reflowing the page on every hover. */
.ah-sidebar{
  width:72px;flex:none;background:var(--ah-sidebar-bg);
  display:flex;flex-direction:column;padding:20px 10px 18px;
  position:fixed;top:0;left:0;height:100vh;z-index:90;
  transition:width .18s ease,padding .18s ease,box-shadow .18s ease;
}
.ah-sidebar.expanded{
  width:258px;padding:20px 16px 18px;
  box-shadow:12px 0 36px -10px rgba(6,9,13,.45);
}
.ah-sidebar-brand{ display:flex;align-items:center;gap:13px;padding:4px 6px 26px;text-decoration:none; }
.ah-logo-mark{ flex:none;line-height:0; }
.ah-sidebar-brand-text{ display:none;min-width:0; }
.ah-sidebar.expanded .ah-sidebar-brand-text{ display:block; }
.ah-wordmark{ font-size:17px;font-weight:750;letter-spacing:.01em;color:#fff;line-height:1.2;white-space:nowrap; }
.ah-wordmark .ah-wordmark-b{ color:var(--ah-gold); }
.ah-wordmark-tag{ font-size:9.5px;font-weight:600;letter-spacing:.1em;color:var(--ah-sidebar-text);margin-top:4px;text-transform:uppercase;white-space:nowrap; }
.ah-wordmark-tag .ah-dot{ color:var(--ah-gold);margin:0 5px; }

/* Not flex:1 — the nav sits at its own natural height below the brand block instead of being
   stretched to fill the sidebar, so a short nav list doesn't leave one large dead gap sitting
   directly above the promo card. Any leftover space just falls below the promo card instead,
   which reads as normal panel padding rather than a layout gap. */
.ah-nav{ display:flex;flex-direction:column;gap:2px; }
.ah-nav-item{
  display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:var(--ah-r-sm);
  font-size:13px;font-weight:550;color:var(--ah-sidebar-text);text-decoration:none;position:relative;
  transition:background .12s ease,color .12s ease;border:none;background:none;cursor:pointer;
  font-family:inherit;text-align:left;width:100%;overflow:hidden;
}
a.ah-nav-item:hover{ background:var(--ah-sidebar-bg-2);color:#fff; }
.ah-nav-item.active{ background:var(--ah-sidebar-bg-2);color:#fff; }
.ah-nav-item.active::before{ content:'';position:absolute;left:0;top:8px;bottom:8px;width:3px;border-radius:0 2px 2px 0;background:var(--ah-gold); }
.ah-nav-icon{ flex:none;width:18px;height:18px;display:flex;align-items:center;justify-content:center; }
.ah-nav-label{ white-space:nowrap;display:none; }
.ah-sidebar.expanded .ah-nav-label{ display:inline; }

.ah-sidebar-promo{ display:none; margin-top:14px;border-radius:var(--ah-r);overflow:hidden;
  background:linear-gradient(155deg,#232a38 0%,#151920 55%,#0c0e13 100%);
  border:1px solid var(--ah-sidebar-border);
}
.ah-sidebar.expanded .ah-sidebar-promo{ display:block; }
.ah-promo-inner{ padding:18px 16px 16px; }
.ah-promo-title{ font-size:15px;font-weight:700;line-height:1.28;color:#fff;letter-spacing:-.01em; }
.ah-promo-divider{ width:26px;height:2px;background:var(--ah-gold);margin:12px 0 10px;border-radius:2px; }
.ah-promo-brand{ font-size:10px;font-weight:650;letter-spacing:.14em;color:var(--ah-sidebar-text); }

/* ---------------------------------- Main / topbar ---------------------------------- */
/* margin-left matches the sidebar's own COLLAPSED width, not its (hover-driven) current width —
   see the sidebar comment above for why that's what keeps expansion from reflowing this. */
.ah-main{ flex:1;min-width:0;display:flex;flex-direction:column;margin-left:72px; }
.ah-topbar{
  display:flex;align-items:center;gap:16px;padding:16px 28px;
  background:var(--ah-card-bg);border-bottom:1px solid var(--ah-border);
}
.ah-search-wrap{ position:relative;flex:1;max-width:460px; }
.ah-search{
  display:flex;align-items:center;gap:9px;
  background:var(--ah-bg);border:1px solid var(--ah-border);border-radius:999px;
  padding:9px 14px;color:var(--ah-text-3);
}
.ah-search svg{ flex:none; }
.ah-search input{ flex:1;border:none;background:none;outline:none;font-size:13px;color:var(--ah-text);font-family:inherit; }
.ah-search input::placeholder{ color:var(--ah-text-3); }

.ah-search-results{
  position:absolute;top:calc(100% + 6px);left:0;right:0;
  background:var(--ah-card-bg);border:1px solid var(--ah-border);border-radius:var(--ah-r);
  box-shadow:var(--ah-shadow);padding:6px;z-index:60;max-height:360px;overflow-y:auto;
}
.ah-search-empty{ padding:14px 12px;font-size:12.5px;color:var(--ah-text-3);text-align:center; }
.ah-search-result{
  display:flex;align-items:flex-start;gap:9px;padding:8px 10px;border-radius:var(--ah-r-sm);
  text-decoration:none;color:inherit;
}
.ah-search-result:hover{ background:var(--ah-bg); }
.ah-search-result-icon{ flex:none;color:var(--ah-gold-text);margin-top:2px; }
.ah-search-result-text{ display:flex;flex-direction:column;gap:1px;min-width:0; }
.ah-search-result-title{ font-size:13px;font-weight:600;color:var(--ah-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
.ah-search-result-sub{ font-size:11.5px;color:var(--ah-text-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }

.ah-topbar-right{ margin-left:auto;display:flex;align-items:center;gap:14px; }
.ah-user-wrap{ position:relative; }
.ah-user{ display:flex;align-items:center;gap:9px;background:none;border:none;cursor:pointer;padding:4px 6px;border-radius:var(--ah-r-sm);font-family:inherit; }
.ah-user:hover{ background:var(--ah-bg); }
.ah-avatar{
  width:32px;height:32px;border-radius:999px;flex:none;background:var(--ah-sidebar-bg);color:var(--ah-gold);
  display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;letter-spacing:.01em;
}
.ah-user-meta{ display:flex;flex-direction:column;align-items:flex-start;line-height:1.3; }
.ah-user-name{ font-size:12.5px;font-weight:650;color:var(--ah-text); }
.ah-user-role{ font-size:11px;color:var(--ah-text-3); }
.ah-user svg{ color:var(--ah-text-3); }

.ah-user-menu{
  position:absolute;top:calc(100% + 6px);right:0;min-width:140px;
  background:var(--ah-card-bg);border:1px solid var(--ah-border);border-radius:var(--ah-r-sm);
  box-shadow:var(--ah-shadow);padding:6px;z-index:60;
}
.ah-user-menu-item{
  display:flex;flex-direction:column;gap:2px;width:100%;padding:8px 10px;border-radius:6px;
  border:none;background:none;font-size:13px;font-weight:550;color:var(--ah-text);cursor:pointer;
  text-align:left;font-family:inherit;text-decoration:none;
}
.ah-user-menu-item:hover{ background:var(--ah-bg); }
.ah-user-menu-item-label{ line-height:1.3; }
.ah-user-menu-item-sub{ font-size:11px;font-weight:500;color:var(--ah-text-3); }
.ah-user-menu-item-danger{ color:var(--ah-err); }
.ah-user-menu-item-danger:hover{ background:var(--ah-err-bg); }
.ah-user-menu-divider{ height:1px;background:var(--ah-border);margin:5px 4px; }

.ah-content{ padding:20px 28px 30px;flex:1; }
.ah-page-head{ margin-bottom:20px; }
.ah-page-head h1{ font-size:22px;font-weight:700;letter-spacing:-.015em;margin:0 0 4px;color:var(--ah-text); }
.ah-page-head p{ font-size:13px;color:var(--ah-text-3);margin:0; }

/* ---------------------------------- Shared content primitives ---------------------------------- */
.ah-card{ background:var(--ah-card-bg);border:1px solid var(--ah-border);border-radius:var(--ah-r);box-shadow:var(--ah-shadow); }
.ah-card-pad{ padding:20px 22px; }
.ah-card h2{ font-size:15px;font-weight:650;margin:0 0 4px;color:var(--ah-text); }
.ah-card-sub{ font-size:12.5px;color:var(--ah-text-3);margin:0 0 16px;line-height:1.5; }

.ah-field{ display:flex;flex-direction:column;gap:5px;margin-bottom:14px; }
.ah-field label{ font-size:12px;font-weight:550;color:var(--ah-text-2); }
.ah-field input,.ah-field select,.ah-field textarea{
  width:100%;padding:9px 11px;border:1px solid var(--ah-border);border-radius:var(--ah-r-sm);
  font-size:13px;font-family:inherit;color:var(--ah-text);background:#fff;outline:none;
  transition:border-color .12s ease,box-shadow .12s ease;
}
.ah-field input:focus,.ah-field select:focus,.ah-field textarea:focus{ border-color:var(--ah-gold);box-shadow:0 0 0 3px var(--ah-gold-soft); }

.ah-btn-gold{
  background:linear-gradient(135deg,#e3bd6e,#c99a3f);color:#241a06;border:none;border-radius:999px;
  font-size:13px;font-weight:650;padding:10px 16px;cursor:pointer;font-family:inherit;
  display:inline-flex;align-items:center;justify-content:center;gap:6px;
}
.ah-btn-gold:hover:not(:disabled){ filter:brightness(1.05); }
.ah-btn-gold:disabled{ opacity:.6;cursor:default; }
.ah-btn-plain{
  background:#fff;border:1px solid var(--ah-border);border-radius:999px;color:var(--ah-text);
  font-size:12.5px;font-weight:600;padding:8px 14px;cursor:pointer;text-decoration:none;
  display:inline-flex;align-items:center;gap:6px;font-family:inherit;
}
.ah-btn-plain:hover{ background:var(--ah-bg); }

.ah-badge{
  display:inline-flex;align-items:center;padding:3px 9px;border-radius:999px;font-size:11px;font-weight:650;
  background:var(--ah-bg);border:1px solid var(--ah-border);color:var(--ah-text-2);white-space:nowrap;
}
.ah-badge-ok{ background:var(--ah-ok-bg);border-color:var(--ah-ok-border);color:var(--ah-ok); }
.ah-badge-err{ background:var(--ah-err-bg);border-color:var(--ah-err-border);color:var(--ah-err); }
.ah-badge-warn{ background:var(--ah-gold-soft);border-color:#e9d19c;color:var(--ah-gold-text); }
.ah-badge-toggle{ border:1px solid rgba(20,23,26,.08);cursor:pointer;font-family:inherit; }
.ah-badge-toggle:hover:not(:disabled){ filter:brightness(0.97); }
.ah-badge-toggle:disabled{ cursor:default;opacity:.65; }

.ah-btn-ghost{
  background:none;border:none;color:var(--ah-gold-text);font-size:12px;font-weight:600;
  cursor:pointer;padding:4px 8px;border-radius:6px;font-family:inherit;text-decoration:none;
  display:inline-flex;align-items:center;
}
.ah-btn-ghost:hover{ background:var(--ah-gold-soft); }

.ah-grid-2{ display:grid;grid-template-columns:360px 1fr;gap:20px;align-items:start; }
@media (max-width:860px){ .ah-grid-2{ grid-template-columns:1fr; } }

.ah-mark{ background:var(--ah-gold-soft);color:var(--ah-gold-text);border-radius:3px;padding:0 1px;font-weight:650; }

.ah-banner-error{ font-size:12.5px;color:var(--ah-err);background:var(--ah-err-bg);border:1px solid var(--ah-err-border);border-radius:var(--ah-r-sm);padding:9px 11px;margin-bottom:12px; }
.ah-banner-success{ font-size:12.5px;color:var(--ah-ok);background:var(--ah-ok-bg);border:1px solid var(--ah-ok-border);border-radius:var(--ah-r-sm);padding:9px 11px;margin-bottom:12px; }
.ah-banner-warn{ font-size:12.5px;color:var(--ah-gold-text);background:var(--ah-gold-soft);border:1px solid #e9d19c;border-radius:var(--ah-r-sm);padding:9px 11px;margin-bottom:12px; }

.ah-table{ width:100%;border-collapse:collapse;font-size:13px; }
.ah-table th{ text-align:left;padding:9px 10px;font-size:10.5px;font-weight:650;color:var(--ah-text-3);text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid var(--ah-border);white-space:nowrap; }
.ah-table td{ padding:10px;border-bottom:1px solid var(--ah-border);color:var(--ah-text-2);white-space:nowrap; }
.ah-table tbody tr:hover td{ background:var(--ah-bg); }
.ah-row-best-match td{ background:var(--ah-gold-soft); }
.ah-row-best-match:hover td{ background:var(--ah-gold-soft); }
.ah-table-empty{ padding:32px 0;text-align:center;color:var(--ah-text-3);font-size:13px; }

@media (max-width:960px){
  /* Below this width the sidebar becomes a static horizontal top bar instead of a hover-expand
     rail (hover has no equivalent on touch) — always fully labeled, never collapsed. */
  .ah-shell{ flex-direction:column; }
  .ah-sidebar,.ah-sidebar.expanded{ position:static;height:auto;width:100%;flex-direction:row;align-items:center;gap:14px;padding:14px 16px;box-shadow:none; }
  .ah-sidebar-brand{ padding:0; }
  .ah-sidebar-brand-text{ display:block; }
  .ah-nav{ flex-direction:row;overflow-x:auto;flex:1; }
  .ah-nav-item.active::before{ display:none; }
  .ah-nav-label{ display:inline; }
  .ah-sidebar-promo,.ah-sidebar.expanded .ah-sidebar-promo{ display:none; }
  .ah-main{ margin-left:0; }
}
@media (max-width:560px){
  .ah-content{ padding:18px 16px 28px; }
  .ah-topbar{ padding:14px 16px; }
}
`;

export function shellCSS() {
  return SHELL_TOKENS + SHELL_LAYOUT;
}
