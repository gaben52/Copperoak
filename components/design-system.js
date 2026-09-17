// ============================================================================
// OakFlow — central design system
// ============================================================================
// One source of truth for tokens and shared UI primitives across every route.
// Both app stylesheets (components/pipeline/styles.js and
// components/acquisitions/styles.js) prepend this, then layer only their own
// layout-specific rules on top — no duplicated button/input/table/badge styling.
//
// Light-only by design: there is no dark palette, no [data-theme] block, and no
// prefers-color-scheme handling anywhere in the system.

export const OAKFLOW_TOKENS = `
:root{
  /* ---- Surfaces ---- */
  --of-bg:#f4f5f7;              /* page background */
  --of-surface:#ffffff;         /* cards, panels, table body */
  --of-surface-2:#fafbfc;       /* table headers, subtle fills */
  --of-surface-3:#f0f1f3;       /* hover / pressed / active fills */

  /* ---- Borders ---- */
  --of-border:#e3e5e8;
  --of-border-strong:#d2d6db;

  /* ---- Text ---- */
  --of-text:#14171a;            /* primary, near-black */
  --of-text-2:#4a5058;          /* secondary */
  --of-text-3:#7a828c;          /* tertiary / helper / metadata */
  --of-text-inverse:#ffffff;

  /* ---- Action (restrained, high-contrast rather than colorful) ---- */
  --of-accent:#1c1f23;
  --of-accent-hover:#2f353c;
  --of-accent-text:#ffffff;

  /* ---- Brand mark accent: an oak/bronze tone, used only for the logo,
         focus rings, and the active-nav indicator. Never as a fill. ---- */
  --of-oak:#8a6a3b;
  --of-oak-soft:#f3eee6;
  --of-focus-ring:rgba(138,106,59,.28);

  /* ---- Status: subtle background, strong readable text ---- */
  --of-ok-bg:#eaf4ee;    --of-ok-text:#1a6b40;   --of-ok-border:#cbe4d6;
  --of-warn-bg:#fdf4e6;  --of-warn-text:#8a6212; --of-warn-border:#f0e0c0;
  --of-err-bg:#fcedec;   --of-err-text:#a52a25;  --of-err-border:#f2d2d0;
  --of-info-bg:#eef2fa;  --of-info-text:#2a5599; --of-info-border:#d5dff0;
  --of-alt-bg:#f2effa;   --of-alt-text:#5b4a9c;  --of-alt-border:#ddd6f2;
  --of-neutral-bg:#f1f2f4; --of-neutral-text:#555c65; --of-neutral-border:#e1e3e7;

  /* ---- Radii: small and professional, never pill-shaped cards ---- */
  --of-r-sm:4px;
  --of-r:6px;
  --of-r-lg:8px;
  --of-r-pill:999px;

  /* ---- Shadows: subtle depth only ---- */
  --of-shadow-xs:0 1px 2px rgba(16,24,40,.04);
  --of-shadow-sm:0 1px 3px rgba(16,24,40,.06),0 1px 2px rgba(16,24,40,.03);
  --of-shadow-md:0 4px 12px rgba(16,24,40,.08),0 2px 4px rgba(16,24,40,.04);
  --of-shadow-lg:0 16px 40px rgba(16,24,40,.14),0 4px 10px rgba(16,24,40,.06);

  /* ---- Spacing scale ---- */
  --of-s1:4px; --of-s2:8px; --of-s3:12px; --of-s4:16px;
  --of-s5:20px; --of-s6:24px; --of-s7:32px; --of-s8:40px;

  /* ---- Typography ---- */
  --of-font:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
  --of-font-mono:ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace;

  /* ---- Control sizing (consistent heights everywhere) ---- */
  --of-h:34px;
  --of-h-sm:28px;
  --of-h-lg:38px;

  /* ---- Layout ---- */
  --of-gutter:36px;
}

@media (min-width:1600px){ :root{ --of-gutter:64px; } }
@media (min-width:2200px){ :root{ --of-gutter:96px; } }
@media (max-width:860px){ :root{ --of-gutter:20px; } }
@media (max-width:560px){ :root{ --of-gutter:14px; } }

/* ---------------------------------------------------------------------------
   Compatibility aliases.
   A number of components still set colours through inline styles using the
   variable names from the two pre-OakFlow palettes. Rather than scatter literal
   values back through the JSX, those names are re-pointed at OakFlow tokens here
   so every one of them resolves to the new light system — one source of truth,
   and no way for an old colour to survive somewhere unnoticed.
   --------------------------------------------------------------------------- */
:root{
  /* former Auction Pipeline palette */
  --bg:var(--of-bg);
  --panel:var(--of-surface);
  --panel2:var(--of-surface-2);
  --border:var(--of-border);
  --text:var(--of-text);
  --muted:var(--of-text-3);
  --gold:var(--of-oak);
  --gold-dim:#6f5530;
  --green:var(--of-ok-text);
  --green-bg:var(--of-ok-bg);
  --green-border:var(--of-ok-border);
  --red:var(--of-err-text);
  --blue:var(--of-info-text);
  --yellow:var(--of-warn-text);
  --purple:var(--of-alt-text);

  /* former Property Operations palette */
  --ink:var(--of-bg);
  --slab:var(--of-surface);
  --slab-2:var(--of-surface-2);
  --rule:var(--of-border);
  --paper:var(--of-text);
  --dim:var(--of-text-3);
  --well:var(--of-surface-3);
  --placeholder:var(--of-text-3);
  --brass:var(--of-oak);
  --brass-dim:#6f5530;
  --brass-hi:var(--of-oak);
  --on-brass:var(--of-accent-text);
  --oxblood:var(--of-err-text);
  --jade:var(--of-ok-text);
  --steel:var(--of-info-text);
  --amber:var(--of-warn-text);
  --stone:var(--of-text-3);
  --teal:var(--of-oak);
  --teal-dim:#6f5530;
  --scrim-bg:rgba(20,23,26,.42);
  --jade-soft:var(--of-ok-bg);
  --jade-line:var(--of-ok-border);
  --ox-soft:var(--of-err-bg);
  --ox-line:var(--of-err-border);
  --shadow:var(--of-shadow-sm);
  --shadow-md:var(--of-shadow-md);
  --sans:var(--of-font);
  --cond:var(--of-font);
  /* Metadata that used to be monospace now uses the UI font — tabular figures
     are handled with font-variant-numeric where numbers actually need aligning. */
  --mono:var(--of-font);
}
`;

export const OAKFLOW_BASE = `
*{box-sizing:border-box;}

body{
  margin:0;
  background:var(--of-bg);
  color:var(--of-text);
  font-family:var(--of-font);
  font-size:13.5px;
  line-height:1.5;
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
}

/* ---- Typographic hierarchy ---- */
.of-page-title{
  font-size:20px;font-weight:650;letter-spacing:-.01em;color:var(--of-text);margin:0;
}
.of-page-sub{
  font-size:13px;color:var(--of-text-3);margin:3px 0 0;font-weight:400;
}
.of-section-title{
  font-size:12px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
  color:var(--of-text-3);margin:0;
}
.of-label{
  font-size:11.5px;font-weight:550;color:var(--of-text-2);letter-spacing:.01em;
}
.of-meta{ font-size:12px;color:var(--of-text-3); }
.of-num{ font-variant-numeric:tabular-nums; }

/* ============================ Buttons ============================ */
/* One system: same height, padding, radius and focus treatment everywhere. */
button,
.of-btn{
  font-family:inherit;
  font-size:13px;
  font-weight:530;
  line-height:1;
  height:var(--of-h);
  padding:0 13px;
  border-radius:var(--of-r);
  border:1px solid var(--of-border-strong);
  background:var(--of-surface);
  color:var(--of-text);
  cursor:pointer;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:7px;
  white-space:nowrap;
  transition:background .13s ease,border-color .13s ease,color .13s ease,box-shadow .13s ease;
  box-shadow:var(--of-shadow-xs);
  /* .of-btn is used on <a> tags as often as <button>s (e.g. header nav links styled as
     buttons) — without this, every such link shows the browser's default underline. */
  text-decoration:none;
}
button:hover,.of-btn:hover{
  background:var(--of-surface-3);
  border-color:var(--of-border-strong);
}
button:active,.of-btn:active{ background:var(--of-surface-3); box-shadow:none; }
button:focus-visible,.of-btn:focus-visible,
a:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{
  outline:none;
  box-shadow:0 0 0 3px var(--of-focus-ring);
  border-color:var(--of-oak);
}
button:disabled,.of-btn:disabled{
  opacity:.5;cursor:not-allowed;background:var(--of-surface-2);box-shadow:none;
}

/* Primary — high contrast, restrained */
.of-btn-primary,.btn-primary,.btn-gold{
  background:var(--of-accent);
  border-color:var(--of-accent);
  color:var(--of-accent-text);
  box-shadow:var(--of-shadow-xs);
}
.of-btn-primary:hover,.btn-primary:hover,.btn-gold:hover{
  background:var(--of-accent-hover);
  border-color:var(--of-accent-hover);
  color:var(--of-accent-text);
}

/* Secondary emphasis — neutral, not a second bright color */
.of-btn-secondary,.btn-green{
  background:var(--of-surface);
  border-color:var(--of-border-strong);
  color:var(--of-text);
}
.of-btn-secondary:hover,.btn-green:hover{ background:var(--of-surface-3); }

.of-btn-ghost,.btn-ghost{ background:transparent;border-color:transparent;box-shadow:none; }
.of-btn-ghost:hover,.btn-ghost:hover{ background:var(--of-surface-3);border-color:transparent; }

.of-btn-danger,.btn-danger{ color:var(--of-err-text);border-color:var(--of-err-border); }
.of-btn-danger:hover,.btn-danger:hover{ background:var(--of-err-bg);border-color:var(--of-err-border); }

.of-btn-sm{ height:var(--of-h-sm);padding:0 10px;font-size:12px; }

/* ============================ Form controls ============================ */
input,select,textarea{
  font-family:inherit;
  font-size:13px;
  color:var(--of-text);
  background:var(--of-surface);
  border:1px solid var(--of-border-strong);
  border-radius:var(--of-r);
  height:var(--of-h);
  padding:0 10px;
  transition:border-color .13s ease,box-shadow .13s ease,background .13s ease;
}
textarea{ height:auto;padding:8px 10px;line-height:1.5;resize:vertical; }
input::placeholder,textarea::placeholder{ color:var(--of-text-3); }
input:hover,select:hover,textarea:hover{ border-color:var(--of-border-strong); }
input:focus,select:focus,textarea:focus{
  outline:none;border-color:var(--of-oak);box-shadow:0 0 0 3px var(--of-focus-ring);
}
input:disabled,select:disabled,textarea:disabled{
  background:var(--of-surface-2);color:var(--of-text-3);cursor:not-allowed;
}
select{ cursor:pointer;padding-right:8px; }
input[type=checkbox]{ height:auto;width:auto;accent-color:var(--of-accent);cursor:pointer; }
input[type=file]{ display:none; }
label{ font-size:12px;color:var(--of-text-2); }

/* ============================ Cards / panels ============================ */
.of-card{
  background:var(--of-surface);
  border:1px solid var(--of-border);
  border-radius:var(--of-r-lg);
  box-shadow:var(--of-shadow-xs);
}
.of-card-pad{ padding:var(--of-s5); }

/* ============================ Badges ============================ */
/* Subtle fill, strong text, neutral hairline — colour only where it means something. */
.of-badge{
  display:inline-flex;align-items:center;gap:5px;
  height:22px;padding:0 9px;
  border-radius:var(--of-r-pill);
  font-size:11.5px;font-weight:550;line-height:1;
  border:1px solid rgba(20,23,26,.07);
  background:var(--of-neutral-bg);color:var(--of-neutral-text);
  white-space:nowrap;
}
.of-badge-ok{ background:var(--of-ok-bg);color:var(--of-ok-text);border-color:var(--of-ok-border); }
.of-badge-warn{ background:var(--of-warn-bg);color:var(--of-warn-text);border-color:var(--of-warn-border); }
.of-badge-err{ background:var(--of-err-bg);color:var(--of-err-text);border-color:var(--of-err-border); }
.of-badge-info{ background:var(--of-info-bg);color:var(--of-info-text);border-color:var(--of-info-border); }
.of-badge-alt{ background:var(--of-alt-bg);color:var(--of-alt-text);border-color:var(--of-alt-border); }

/* Select rendered as a badge (status dropdowns in table cells) */
.status-pill{
  appearance:none;-webkit-appearance:none;
  height:26px;padding:0 8px;
  border-radius:var(--of-r-pill);
  border:1px solid rgba(20,23,26,.08);
  font-size:11.5px;font-weight:550;
  box-shadow:none;
  cursor:pointer;
  min-width:0;
}
.status-pill:hover{ filter:brightness(.97); }

/* ============================ Tables ============================ */
.of-table,
table{ border-collapse:separate;border-spacing:0;width:100%;font-size:13px; }
thead th{
  background:var(--of-surface-2);
  color:var(--of-text-2);
  font-size:11px;
  font-weight:600;
  letter-spacing:.05em;
  text-transform:uppercase;
  text-align:left;
  padding:9px 12px;
  white-space:nowrap;
  border-bottom:1px solid var(--of-border);
  position:sticky;top:0;z-index:3;
}
tbody td{
  padding:9px 12px;
  border-bottom:1px solid var(--of-border);
  color:var(--of-text);
  vertical-align:middle;
}
tbody tr:hover td{ background:var(--of-surface-2); }
tbody tr:last-child td{ border-bottom:none; }

/* ============================ Overlays / modals ============================ */
.of-scrim,.modal-overlay{
  position:fixed;inset:0;
  background:rgba(20,23,26,.42);
  backdrop-filter:blur(2px);
  display:none;align-items:center;justify-content:center;
  z-index:50;padding:24px;
}
.modal-overlay.open{ display:flex; }
.of-modal,.modal{
  background:var(--of-surface);
  border:1px solid var(--of-border);
  border-radius:var(--of-r-lg);
  box-shadow:var(--of-shadow-lg);
  width:640px;max-width:100%;max-height:86vh;overflow:auto;
  padding:var(--of-s6);
}
.modal h2{
  margin:0 0 6px;font-size:16px;font-weight:600;letter-spacing:-.01em;color:var(--of-text);
}
.modal p{ color:var(--of-text-2);font-size:13px;line-height:1.55;margin:0 0 12px; }
.modal-actions{
  display:flex;justify-content:flex-end;gap:8px;
  margin-top:var(--of-s5);padding-top:var(--of-s4);
  border-top:1px solid var(--of-border);
}

/* ============================ Toast ============================ */
.toast{
  position:fixed;bottom:24px;right:24px;
  background:var(--of-accent);color:var(--of-accent-text);
  border-radius:var(--of-r);
  padding:11px 16px;font-size:13px;font-weight:450;
  max-width:340px;box-shadow:var(--of-shadow-lg);
  z-index:200;
}

/* ============================ Empty / loading states ============================ */
.of-empty,.empty{
  text-align:center;color:var(--of-text-3);
  padding:56px 24px;font-size:13px;
}

/* ============================ Scrollbars ============================ */
*{ scrollbar-width:thin;scrollbar-color:#c9ccd1 transparent; }
*::-webkit-scrollbar{ width:10px;height:10px; }
*::-webkit-scrollbar-track{ background:transparent; }
*::-webkit-scrollbar-thumb{
  background:#c9ccd1;border-radius:var(--of-r-pill);
  border:2px solid var(--of-surface);
}
*::-webkit-scrollbar-thumb:hover{ background:#adb2b9; }

@media (prefers-reduced-motion:reduce){
  *{ transition:none!important;animation:none!important; }
}
`;

export const OAKFLOW_CSS = OAKFLOW_TOKENS + OAKFLOW_BASE;
