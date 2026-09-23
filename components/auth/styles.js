import { shellCSS } from '@/components/shell/styles';

// Every auth screen (Login, Forgot/Reset/Change Password) shares this — a branded card floating
// over the same hero photo Home uses, on the theory that the very first and very last things a
// user sees (signing in, resetting a password) should look like the same product as everything
// behind the login wall, not a leftover unstyled screen. Reuses shellCSS()'s --ah-* tokens and
// .ah-field/.ah-btn-gold/.ah-banner-*/.ah-mark primitives directly rather than redefining them.
const AUTH_LAYOUT = `
.auth-wrap{
  min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;
  background:
    linear-gradient(165deg,rgba(9,12,16,.82) 12%,rgba(10,16,20,.62) 55%,rgba(9,12,16,.5) 100%),
    url('/assets/login-background.jpg');
  background-size:cover;background-position:center;
}
.auth-card{
  width:400px;max-width:100%;
  background:var(--ah-card-bg);border:1px solid var(--ah-border);border-radius:var(--ah-r);
  box-shadow:0 30px 60px -24px rgba(6,9,13,.5);
  padding:34px 32px 30px;
  display:flex;flex-direction:column;gap:15px;
}
.auth-brand{ display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px;margin-bottom:2px; }
.auth-wordmark{ font-size:18px;font-weight:750;letter-spacing:.01em;color:var(--ah-text); }
.auth-wordmark .auth-wordmark-b{ color:var(--ah-gold-text); }
.auth-wordmark-tag{ font-size:9.5px;font-weight:650;letter-spacing:.12em;color:var(--ah-text-3);text-transform:uppercase; }
.auth-wordmark-tag .ah-dot{ color:var(--ah-gold-text);margin:0 5px; }

.auth-title{ font-size:19px;font-weight:700;letter-spacing:-.01em;margin:0 0 2px;color:var(--ah-text);text-align:center; }
.auth-sub{ font-size:13px;color:var(--ah-text-3);margin:0 0 2px;text-align:center;line-height:1.5; }
.auth-hint{ font-size:11.5px;color:var(--ah-text-3);margin-top:-2px; }

.auth-submit{ width:100%;margin-top:2px;justify-content:center; }
.auth-links{ display:flex;justify-content:center;font-size:12.5px;margin-top:2px; }
.auth-links a{ color:var(--ah-gold-text);text-decoration:none;font-weight:600; }
.auth-links a:hover{ text-decoration:underline; }

.auth-session-row{
  display:flex;align-items:center;justify-content:space-between;
  gap:10px;font-size:13px;color:var(--ah-text-2);
}

@media (max-width:480px){ .auth-card{ padding:28px 22px 26px; } }
`;

export function authCSS() {
  return shellCSS() + AUTH_LAYOUT;
}
