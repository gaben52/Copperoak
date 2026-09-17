import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { homeCSS } from '@/components/home/styles';

export const metadata = {
  title: 'OakFlow',
  description: 'OakFlow — property acquisition and disposition management for Copper Oak Asset Management.',
};

const ARROW = (
  <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 10h12M11 5l5 5-5 5" />
  </svg>
);

const APPS = [
  {
    href: '/pipeline',
    title: 'Auction Pipeline',
    description: "Track properties from lead through auction day, including title status, ARV, bidding, and each sale's outcome.",
    icon: (
      <svg width="19" height="19" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M4 5h12M4 10h12M4 15h8" />
      </svg>
    ),
  },
  {
    href: '/partner-portal',
    title: 'Partner Portal',
    description: 'The read-only view for outside partners, scoped to just the counties they’re assigned to.',
    icon: (
      <svg width="19" height="19" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2.5l6 2.2v4.3c0 4-2.6 6.9-6 8-3.4-1.1-6-4-6-8V4.7l6-2.2Z" />
        <path d="M7.3 10l1.9 1.9L12.7 8" />
      </svg>
    ),
  },
  {
    href: '/acquisitions',
    title: 'Property Operations',
    description: 'Manage everything already won, from renovation through resale, plus portfolio and performance reporting.',
    icon: (
      <svg width="19" height="19" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3.5 8.5 10 3l6.5 5.5" />
        <path d="M5 8v8h10V8" />
        <path d="M8.3 16v-4.5h3.4V16" />
      </svg>
    ),
  },
];

const ADMIN_APP = {
  href: '/admin/users',
  title: 'User Management',
  description: 'Add a user and manage who has access to OakFlow, including roles, invites, and account status.',
  icon: (
    <svg width="19" height="19" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="7" r="3" />
      <path d="M2.5 17c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
      <path d="M15.5 8.5h4M17.5 6.5v4" />
    </svg>
  ),
};

export default async function HomePage() {
  // Server-side session check — this page is a Server Component specifically so it can read the
  // session cookie directly (no client round-trip/flash of the wrong state), unlike the old
  // static "Sign in" link this replaces, which never actually looked at whether anyone was
  // signed in.
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let profile = null;
  if (user) {
    const { data } = await supabase.from('profiles').select('full_name, role').eq('id', user.id).maybeSingle();
    profile = data;
  }
  const isAdmin = profile?.role === 'admin';
  const apps = isAdmin ? [...APPS, ADMIN_APP] : APPS;

  async function logout() {
    'use server';
    const supabase = createClient();
    await supabase.auth.signOut();
    redirect('/');
  }

  return (
    <div className="home-wrap">
      {/* <style> is an HTML raw-text element; React's server renderer HTML-escapes plain string
          children, so dangerouslySetInnerHTML is required to avoid a hydration mismatch for CSS
          containing quotes/`>` — same reasoning as AuctionPipeline.jsx / AcquisitionsApp.jsx. */}
      <style dangerouslySetInnerHTML={{ __html: homeCSS() }} />

      <header className="home-header">
        <div className="home-brand-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M4 14.5c4.5 0 7-2.2 8.4-5.1" />
            <path d="M10 16.5c0-5.2 2.6-8.6 6-10" />
            <path d="M3.5 8.5c3 0 5-1.1 6.2-3" />
          </svg>
        </div>
        <div>
          <h1><span className="brand-a">Oak</span><span className="brand-b">Flow</span></h1>
          <div className="tag">Copper Oak Asset Management</div>
        </div>
        <div className="home-signin" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {user ? (
            <>
              <span style={{ fontSize: 12.5, color: 'var(--of-text-3)' }}>
                {profile?.full_name || user.email}
              </span>
              <form action={logout}>
                <button type="submit" className="of-btn">Log out</button>
              </form>
            </>
          ) : (
            <a className="of-btn" href="/login">Sign in</a>
          )}
        </div>
      </header>

      <div className="home-intro">
        <h2>Choose where you want to go</h2>
        <p>One account, every tool you need. Pick where you want to go below.</p>
      </div>

      <div className="home-grid">
        {apps.map((app) => (
          <a className="of-card home-card" href={app.href} key={app.href}>
            <div className="home-card-icon" aria-hidden="true">{app.icon}</div>
            <h3>{app.title}</h3>
            <p>{app.description}</p>
            <span className="home-card-cta">Open {ARROW}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
