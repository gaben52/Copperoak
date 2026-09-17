'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { authCSS } from './styles';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    // Always show the same success state regardless of whether the email exists — an error here
    // would let someone probe which emails have accounts.
    if (resetError) { console.error(resetError); }
    setSent(true);
  }

  return (
    <div className="auth-wrap">
      <style dangerouslySetInnerHTML={{ __html: authCSS() }} />
      <div className="of-card auth-card">
        <div className="auth-title">Reset your password</div>
        {sent ? (
          <>
            <div className="auth-success">If an account exists for that email, a reset link is on its way.</div>
            <a className="of-btn auth-submit" href="/login" style={{ textDecoration: 'none', textAlign: 'center' }}>Back to sign in</a>
          </>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p className="auth-sub">Enter the email on your account and we'll send a reset link.</p>
            <div className="auth-field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" autoComplete="email" required
                value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            {error && <div className="auth-error">{error}</div>}
            <button type="submit" className="btn-gold auth-submit" disabled={loading}>
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
            <div className="auth-links">
              <a href="/login">Back to sign in</a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
