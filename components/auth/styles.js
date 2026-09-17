import { OAKFLOW_CSS } from '@/components/design-system';

const AUTH_LAYOUT = `
.auth-wrap{
  min-height:100vh;
  display:flex;align-items:center;justify-content:center;
  padding:var(--of-gutter);
}
.auth-card{
  width:380px;max-width:100%;
  padding:var(--of-s7) var(--of-s6);
  display:flex;flex-direction:column;gap:var(--of-s4);
}
.auth-brand{
  display:flex;align-items:center;gap:10px;margin-bottom:var(--of-s2);
}
.auth-brand-icon{
  width:32px;height:32px;flex:none;
  border-radius:var(--of-r);
  background:var(--of-oak-soft);
  border:1px solid #e6dccb;
  color:var(--of-oak);
  display:flex;align-items:center;justify-content:center;
}
.auth-brand h1{
  font-size:17px;font-weight:650;letter-spacing:-.01em;margin:0;color:var(--of-text);
}
.auth-brand .brand-a{ color:var(--of-text); }
.auth-brand .brand-b{ color:var(--of-text-3);font-weight:500; }

.auth-title{ font-size:19px;font-weight:650;letter-spacing:-.01em;margin:0 0 2px;color:var(--of-text); }
.auth-sub{ font-size:13px;color:var(--of-text-3);margin:0 0 var(--of-s2); }

.auth-field{ display:flex;flex-direction:column;gap:5px; }
.auth-field label{ font-size:12px;font-weight:550;color:var(--of-text-2); }

.auth-error{
  font-size:12.5px;color:var(--of-err-text);background:var(--of-err-bg);
  border:1px solid var(--of-err-border);border-radius:var(--of-r);
  padding:9px 11px;
}
.auth-success{
  font-size:12.5px;color:var(--of-ok-text);background:var(--of-ok-bg);
  border:1px solid var(--of-ok-border);border-radius:var(--of-r);
  padding:9px 11px;
}
.auth-hint{ font-size:11.5px;color:var(--of-text-3);margin-top:-2px; }

.auth-submit{ width:100%;margin-top:var(--of-s2); }
.auth-links{
  display:flex;justify-content:space-between;font-size:12.5px;margin-top:var(--of-s2);
}
.auth-links a{ color:var(--of-oak);text-decoration:none;font-weight:550; }
.auth-links a:hover{ text-decoration:underline; }

.auth-session-row{
  display:flex;align-items:center;justify-content:space-between;
  gap:10px;font-size:13px;color:var(--of-text-2);
}
`;

export function authCSS() {
  return OAKFLOW_CSS + AUTH_LAYOUT;
}
