'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { authCSS } from './styles';
import AuthBrand from './AuthBrand';
import { validatePassword, PASSWORD_HINT } from './passwordPolicy';

export default function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [linkInvalid, setLinkInvalid] = useState(false);

  useEffect(() => {
    // The recovery link puts a token in the URL; @supabase/ssr's browser client exchanges it
    // for a real (temporary) session automatically on load. If that hasn't happened by the time
    // this checks, the link was invalid or already used — checked once, not gating the form
    // (an expired-but-plausible-looking session would just fail on submit with a clear error).
    const supabase = createClient();
    const timer = setTimeout(() => {
      supabase.auth.getSession().then(({ data }) => {
        if (!data.session) setLinkInvalid(true);
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const validationError = validatePassword(password);
    if (validationError) { setError(validationError); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setLoading(false);
      setError(updateError.message);
      return;
    }
    // Also clears must_change_password: someone who reaches this via "forgot password" (rather
    // than the forced first-login change) has still just set a real password, and shouldn't get
    // redirected to /change-password on their next visit because of a leftover invite flag.
    await fetch('/api/auth/complete-password-change', { method: 'POST' }).catch(() => {});
    setLoading(false);
    setSuccess(true);
  }

  return (
    <div className="auth-wrap">
      {/* dangerouslySetInnerHTML — see the note in LoginForm.jsx. */}
      <style dangerouslySetInnerHTML={{ __html: authCSS() }} />
      <div className="auth-card">
        <AuthBrand />
        <div className="auth-title">Set a new password</div>
        {success ? (
          <>
            <div className="ah-banner-success">Password updated. You can now sign in.</div>
            <a className="ah-btn-gold auth-submit" href="/login" style={{ textDecoration: 'none' }}>Go to sign in</a>
          </>
        ) : linkInvalid ? (
          <>
            <div className="ah-banner-error">This reset link is invalid or has expired.</div>
            <a className="ah-btn-plain auth-submit" href="/forgot-password" style={{ textDecoration: 'none' }}>Request a new link</a>
          </>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="ah-field">
              <label htmlFor="password">New password</label>
              <input id="password" type="password" autoComplete="new-password" required
                value={password} onChange={(e) => setPassword(e.target.value)} />
              <div className="auth-hint">{PASSWORD_HINT}</div>
            </div>
            <div className="ah-field">
              <label htmlFor="confirm">Confirm password</label>
              <input id="confirm" type="password" autoComplete="new-password" required
                value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>
            {error && <div className="ah-banner-error">{error}</div>}
            <button type="submit" className="ah-btn-gold auth-submit" disabled={loading}>
              {loading ? 'Saving…' : 'Set password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
