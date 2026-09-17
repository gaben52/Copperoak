'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { authCSS } from './styles';
import { validatePassword, PASSWORD_HINT } from './passwordPolicy';

export default function ChangePasswordForm() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

    // Clears profiles.must_change_password server-side — see the route for why this can't just
    // be a client-side write (profiles_update RLS is admin-only, on purpose).
    const res = await fetch('/api/auth/complete-password-change', { method: 'POST' });
    setLoading(false);
    if (!res.ok) {
      setError('Password updated, but something went wrong finishing setup. Try refreshing the page.');
      return;
    }
    window.location.href = '/';
  }

  return (
    <div className="auth-wrap">
      {/* dangerouslySetInnerHTML — see the note in LoginForm.jsx. */}
      <style dangerouslySetInnerHTML={{ __html: authCSS() }} />
      <div className="of-card auth-card">
        <div>
          <div className="auth-title">Create a new password</div>
          <p className="auth-sub">You're signing in with a temporary password. Set a new one to continue.</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="auth-field">
            <label htmlFor="password">New password</label>
            <input id="password" type="password" autoComplete="new-password" required
              value={password} onChange={(e) => setPassword(e.target.value)} />
            <div className="auth-hint">{PASSWORD_HINT}</div>
          </div>
          <div className="auth-field">
            <label htmlFor="confirm">Confirm password</label>
            <input id="confirm" type="password" autoComplete="new-password" required
              value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="btn-gold auth-submit" disabled={loading}>
            {loading ? 'Saving…' : 'Change password'}
          </button>
        </form>
      </div>
    </div>
  );
}
