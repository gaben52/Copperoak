// Shared by every auth screen (Login, Forgot/Reset/Change Password) so the brand header is
// identical across the whole flow — a user tabbing between them shouldn't see the logo appear
// and disappear. Not the sidebar's AH_LOGO_MARK (components/shell/AppShell.jsx): this needs to be
// usable before any session exists, so it stays a small standalone component instead.
export default function AuthBrand() {
  return (
    <div className="auth-brand">
      <img src="/assets/acquire-hub-logo.png" alt="Acquire Hub" width="46" height="46" />
      <div className="auth-wordmark">ACQUIRE <span className="auth-wordmark-b">HUB</span></div>
      <div className="auth-wordmark-tag">FIND<span className="ah-dot">&middot;</span>ACQUIRE<span className="ah-dot">&middot;</span>SCALE</div>
    </div>
  );
}
