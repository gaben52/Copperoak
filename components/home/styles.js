// Home-page-only additions on top of the shared shell (sidebar/topbar/content wrapper + the
// .ah-card/.ah-btn-*/.ah-badge/.ah-table primitives now live in components/shell/styles.js and
// are injected once by <AppShell> itself — this file only needs to add what's specific to Home,
// not repeat the shell).
const HOME_EXTRA = `
/* ---------------------------------- Hero ---------------------------------- */
.ah-hero{
  border-radius:var(--ah-r);overflow:hidden;position:relative;
  padding:26px 30px;margin-bottom:18px;min-height:150px;
  display:flex;align-items:flex-start;justify-content:space-between;gap:20px;
  /* A light, even darkening (not the old heavy directional gradient) plus per-element text-shadow
     below — together these keep the text readable over any part of the photo without hiding it. */
  background:linear-gradient(rgba(6,9,13,.34),rgba(6,9,13,.34)),url('/assets/hero-banner.jpg');
  background-size:cover;background-position:center 38%;
  color:#fff;
}
.ah-hero-eyebrow{ font-size:13.5px;font-weight:600;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.85),0 2px 10px rgba(0,0,0,.6); }
.ah-hero h1{ margin:2px 0 10px;font-size:38px;font-weight:750;letter-spacing:-.02em;text-shadow:0 2px 5px rgba(0,0,0,.85),0 4px 16px rgba(0,0,0,.6); }
.ah-hero-tagline{ margin:0 0 14px;font-size:14px;font-weight:500;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.85),0 2px 10px rgba(0,0,0,.6); }
.ah-hero-pillars{ font-size:10.5px;font-weight:650;letter-spacing:.16em;color:var(--ah-gold);text-transform:uppercase;text-shadow:0 1px 3px rgba(0,0,0,.85),0 2px 10px rgba(0,0,0,.6); }
.ah-hero-pillars i{ font-style:normal;color:rgba(255,255,255,.5);margin:0 8px; }
.ah-hero-side{ text-align:right;flex:none; }
.ah-hero-date{ font-size:12.5px;font-weight:650;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.85),0 2px 10px rgba(0,0,0,.6); }
.ah-hero-clock{
  font-family:ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace;
  font-size:20px;font-weight:600;color:var(--ah-gold);letter-spacing:.01em;
  font-variant-numeric:tabular-nums;margin-top:2px;
  text-shadow:0 1px 3px rgba(0,0,0,.85),0 2px 10px rgba(0,0,0,.6);
}
.ah-hero-cta{ font-size:11.5px;font-weight:500;color:#fff;margin-top:3px;text-shadow:0 1px 3px rgba(0,0,0,.85),0 2px 10px rgba(0,0,0,.6); }

/* ---------------------------------- App launcher cards ---------------------------------- */
.ah-apps{ display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:18px; }
.ah-app-card{
  position:relative;border-radius:var(--ah-r);padding:18px 18px 16px;min-height:205px;
  display:flex;flex-direction:column;overflow:hidden;text-decoration:none;color:#fff;
  transition:transform .15s ease,box-shadow .15s ease;
}
.ah-app-card:hover{ transform:translateY(-2px);box-shadow:0 16px 34px -16px rgba(10,14,20,.5); }
.ah-app-card.theme-teal{ background:linear-gradient(160deg,#1f6169 0%,#123a40 58%,#0b2226 100%); }
.ah-app-card.theme-blue{ background:linear-gradient(160deg,#2c5f8f 0%,#173d5e 58%,#0d2338 100%); }
.ah-app-card.theme-gold{ background:linear-gradient(160deg,#dba847 0%,#bb832b 58%,#8a5f1d 100%); }
.ah-app-card.theme-dark{ background:linear-gradient(160deg,#282e39 0%,#191d25 58%,#101318 100%); }
.ah-app-icon{
  width:38px;height:38px;border-radius:9px;flex:none;
  background:rgba(255,255,255,.16);display:flex;align-items:center;justify-content:center;margin-bottom:16px;
}
.ah-app-arrow{ position:absolute;top:19px;right:19px;opacity:.8; }
.ah-app-card h3{ font-size:16.5px;font-weight:700;margin:0 0 7px;letter-spacing:-.01em; }
.ah-app-card p{ font-size:12px;line-height:1.55;color:rgba(255,255,255,.8);margin:0;flex:1; }
.ah-app-cta{
  margin-top:14px;align-self:flex-start;display:inline-flex;align-items:center;gap:6px;
  font-size:11.5px;font-weight:650;padding:8px 14px;border-radius:999px;background:rgba(255,255,255,.16);color:#fff;
}

/* ---------------------------------- Stat tiles ---------------------------------- */
.ah-stats{ display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:18px; }
.ah-stat{
  background:var(--ah-card-bg);border:1px solid var(--ah-border);border-radius:var(--ah-r);
  padding:14px 16px;display:flex;align-items:center;gap:13px;box-shadow:var(--ah-shadow);
}
.ah-stat-icon{ width:40px;height:40px;border-radius:var(--ah-r-sm);flex:none;display:flex;align-items:center;justify-content:center; }
.ah-stat-value{ font-size:22px;font-weight:750;letter-spacing:-.01em;color:var(--ah-text);line-height:1.15; }
.ah-stat-label{ font-size:11.5px;color:var(--ah-text-3);margin-top:2px; }

/* ---------------------------------- Bottom: activity + quick actions ---------------------------------- */
.ah-bottom{ display:grid;grid-template-columns:1.6fr 1fr;gap:16px; }
.ah-card-head{ display:flex;align-items:center;justify-content:space-between;margin-bottom:8px; }
.ah-card-head h2{ font-size:14.5px;font-weight:650;margin:0;color:var(--ah-text); }
.ah-card-head a{ font-size:12px;font-weight:600;color:var(--ah-gold);text-decoration:none; }
.ah-placeholder-note{
  font-size:10.5px;font-weight:600;color:var(--ah-text-3);background:var(--ah-bg);
  border:1px solid var(--ah-border);border-radius:5px;padding:2px 7px;
}
.ah-activity-list{ list-style:none;margin:6px 0 0;padding:0; }
.ah-activity-list li{ display:flex;align-items:center;gap:11px;padding:11px 0;border-bottom:1px solid var(--ah-border); }
.ah-activity-list li:last-child{ border-bottom:none;padding-bottom:2px; }
.ah-activity-dot{ width:7px;height:7px;border-radius:999px;flex:none; }
.ah-activity-text{ font-size:12.5px;color:var(--ah-text-2);flex:1; }
.ah-activity-time{ font-size:11.5px;color:var(--ah-text-3);flex:none; }

.ah-quick-grid{ display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:6px; }
.ah-quick-btn{
  display:flex;align-items:center;justify-content:center;text-align:center;
  border-radius:var(--ah-r-sm);padding:16px 10px;font-size:12.5px;font-weight:600;
  text-decoration:none;border:1px solid var(--ah-border);color:var(--ah-text);
  background:var(--ah-bg);transition:transform .12s ease,box-shadow .12s ease;
}
.ah-quick-btn:hover{ transform:translateY(-1px);box-shadow:var(--ah-shadow); }
.ah-quick-btn.primary{ background:var(--ah-sidebar-bg);border-color:var(--ah-sidebar-bg);color:#fff; }
.ah-quick-btn.gold{ background:var(--ah-gold-soft);border-color:transparent;color:var(--ah-gold-text); }

.ah-footer{
  text-align:center;margin-top:28px;font-size:10.5px;font-weight:650;letter-spacing:.14em;
  color:var(--ah-text-3);text-transform:uppercase;
}
.ah-footer .ah-dot{ color:var(--ah-gold);margin:0 8px; }

@media (max-width:960px){
  .ah-apps{ grid-template-columns:repeat(2,1fr); }
  .ah-stats{ grid-template-columns:repeat(2,1fr); }
  .ah-bottom{ grid-template-columns:1fr; }
  .ah-hero{ flex-direction:column; }
  .ah-hero-side{ text-align:left; }
}
@media (max-width:560px){
  .ah-hero h1{ font-size:29px; }
  .ah-apps{ grid-template-columns:1fr; }
  .ah-stats{ grid-template-columns:1fr; }
  .ah-quick-grid{ grid-template-columns:1fr; }
}
`;

export function homeCSS() {
  return HOME_EXTRA;
}
