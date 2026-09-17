'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { authCSS } from './styles';

const BRAND = (
  <div className="auth-brand">
    <div className="auth-brand-icon" aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M4 14.5c4.5 0 7-2.2 8.4-5.1" />
        <path d="M10 16.5c0-5.2 2.6-8.6 6-10" />
        <path d="M3.5 8.5c3 0 5-1.1 6.2-3" />
      </svg>
    </div>
    <h1><span className="brand-a">Oak</span><span className="brand-b">Flow</span></h1>
  </div>
);

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [session, setSession] = useState(null);
  const [timedOut, setTimedOut] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [next, setNext] = useState('/');

  useEffect(() => {
    const supabase = createClient();
    let params;
    try {
      params = new URLSearchParams(window.location.search);
    } catch (e) { params = new URLSearchParams(); }
    const isDisabled = params.get('disabled') === '1';
    setDisabled(isDisabled);

    if (isDisabled) {
      // Middleware only sent us here because is_active=false already blocks this account from
      // every page and API route — but their Supabase session token itself may still be
      // technically valid, which would otherwise show the misleading "Already signed in" state
      // right next to a "your account was disabled" message. Clear it so the message is the only
      // thing shown, and so re-entering different credentials below works cleanly.
      supabase.auth.signOut().finally(() => setCheckingSession(false));
    } else {
      supabase.auth.getSession().then(({ data }) => {
        setSession(data.session);
        setCheckingSession(false);
      });
    }

    setTimedOut(params.get('timeout') === '1');
    // Only accept a same-origin relative path — anything else (a bare "//host" or an
    // absolute "https://..." value) is a classic open-redirect vector, so it's rejected in
    // favor of the safe default.
    const nextParam = params.get('next');
    if (nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//')) {
      setNext(nextParam);
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError(signInError.message === 'Invalid login credentials' ? 'Incorrect email or password.' : signInError.message);
      return;
    }
    window.location.href = next;
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setSession(null);
  }

  return (
    <div className="auth-wrap">
      {/* dangerouslySetInnerHTML: <style> is a raw-text HTML element; a plain string child gets
          HTML-escaped by the server renderer but not the client — see the same note in
          AuctionPipeline.jsx / AcquisitionsApp.jsx. This CSS has quoted font-family + `>`. */}
      <style dangerouslySetInnerHTML={{ __html: authCSS() }} />

      <div className="of-card auth-card">
        {BRAND}

        {checkingSession ? null : session ? (
          <>
            <div className="auth-title">Already signed in</div>
            <div className="auth-session-row">
              <span>{session.user.email}</span>
              <button className="of-btn" onClick={handleLogout}>Log out</button>
            </div>
            <a className="of-btn of-btn-primary auth-submit" href={next} style={{ textDecoration: 'none', textAlign: 'center' }}>Continue to OakFlow</a>
          </>
        ) : (
          <>
            <div>
              <div className="auth-title">Sign in</div>
              <p className="auth-sub">Use the credentials from your invite email.</p>
            </div>
            {disabled && <div className="auth-error">Your account has been disabled by an administrator. Contact them if you believe this is a mistake.</div>}
            {timedOut && <div className="auth-error">You were signed out after a period of inactivity.</div>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="auth-field">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" autoComplete="email" required
                  value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="auth-field">
                <label htmlFor="password">Password</label>
                <input id="password" type="password" autoComplete="current-password" required
                  value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              {error && <div className="auth-error">{error}</div>}
              <button type="submit" className="btn-gold auth-submit" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
            <div className="auth-links">
              <a href="/forgot-password">Forgot password?</a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
