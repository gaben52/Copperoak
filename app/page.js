import { redirect } from 'next/navigation';
import TransitionLink from '@/components/TransitionLink';
import { createClient } from '@/lib/supabase/server';
import AppShell from '@/components/shell/AppShell';
import { homeCSS } from '@/components/home/styles';
import { dbRowToRow } from '@/components/pipeline/dbMapping';
import { computeProfit, fmtMoney } from '@/components/pipeline/helpers';
import LiveClock from '@/components/home/LiveClock';

export const metadata = {
  title: 'Acquire Hub',
  description: 'Acquire Hub — property acquisition and disposition management for Copper Oak Asset Management.',
};

// App-launcher card icons — separate from AppShell's thinner sidebar-nav icon set; these match
// the reference mock's own iconography for this section (gavel/people/house/person).
const CARD_ICON = {
  gavel: (
    <svg width="19" height="19" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9.3" y="2.3" width="3.2" height="7.2" rx="1" transform="rotate(45 10.9 5.9)" />
      <path d="M7.6 7.6l3.1 3.1M4.4 15.4l3-3M3 17l2.3-2.3" />
    </svg>
  ),
  people: (
    <svg width="19" height="19" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.2" cy="7" r="2.4" />
      <circle cx="13.2" cy="8.3" r="2" />
      <path d="M2.8 16c0-2.6 2-4.4 4.6-4.4 1.7 0 3.1.8 3.9 2" />
      <path d="M11 13.4c.6-.5 1.4-.8 2.2-.8 2.1 0 3.8 1.5 3.8 3.6" />
    </svg>
  ),
  house: (
    <svg width="19" height="19" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2.6 17.5 9v7.4a1 1 0 0 1-1 1h-3.2v-5.6H6.7v5.6H3.5a1 1 0 0 1-1-1V9Z" />
    </svg>
  ),
  person: (
    <svg width="19" height="19" viewBox="0 0 20 20" fill="currentColor">
      <circle cx="10" cy="6.4" r="3.4" />
      <path d="M3 17c0-3.6 3.1-6.2 7-6.2s7 2.6 7 6.2v.4H3Z" />
    </svg>
  ),
};
const CARD_ARROW = (
  <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 10h12M11 5l5 5-5 5" />
  </svg>
);
// Reused for the two stat tiles wired to real counts below.
const STAT_ICON_PIPELINE = (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M4 5h12M4 10h12M4 15h8" /></svg>
);
const STAT_ICON_OPERATIONS = (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.5 8.5 10 3l6.5 5.5" /><path d="M5 8v8h10V8" /><path d="M8.3 16v-4.5h3.4V16" />
  </svg>
);
const STAT_ICON_REPORTS = (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 16.5V9M9.5 16.5V4.5M15 16.5v-7" /><path d="M3 16.5h14" /></svg>
);
const STAT_ICON_PARTNER = (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2.5l6 2.2v4.3c0 4-2.6 6.9-6 8-3.4-1.1-6-4-6-8V4.7l6-2.2Z" /><path d="M7.3 10l1.9 1.9L12.7 8" />
  </svg>
);

const APP_CARDS = [
  {
    key: 'pipeline', href: '/pipeline', theme: 'theme-teal', icon: CARD_ICON.gavel,
    title: 'Auction Pipeline', cta: 'Open Pipeline',
    desc: "Track properties from lead through auction day, including title status, ARV, bidding, and each sale's outcome.",
  },
  {
    key: 'partner', href: '/partner-portal', theme: 'theme-blue', icon: CARD_ICON.people,
    title: 'Partner Portal', cta: 'Open Portal',
    desc: "The read-only view for outside partners, scoped to just the counties they're assigned to.",
  },
  {
    key: 'operations', href: '/acquisitions', theme: 'theme-gold', icon: CARD_ICON.house,
    title: 'Property Operations', cta: 'Open Operations',
    desc: 'Manage everything already won, from renovation through resale, plus portfolio and performance reporting.',
  },
  {
    key: 'users', href: '/admin/users', theme: 'theme-dark', icon: CARD_ICON.person,
    title: 'User Management', cta: 'Open Users',
    desc: 'Add a user and manage who has access to Acquire Hub, including roles, invites, and account status.',
  },
];

const QUICK_ACTIONS = [
  { label: '+ Add New Property', href: '/pipeline', variant: 'primary' },
  { label: 'Upload Auction List', href: '/pipeline', variant: '' },
  { label: 'View Reports', href: '/acquisitions', variant: 'gold' },
  { label: 'Invite User', href: '/admin/users', variant: '' },
];

// There's no activity-log table in the schema (no per-field change history), so "Recent Activity"
// is derived from properties.updated_at — the most recently touched real rows, described by their
// current real status/outcome. It can't name what specifically changed (that data doesn't exist),
// so the wording stays factual ("<status> — <address>") rather than inventing an event type.
function timeAgo(iso) {
  if (!iso) return '';
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? '' : 's'} ago`;
}
const DEAD_STATUSES = new Set(['Lost', 'DNB', 'Cancelled']);
function activityColor(row) {
  if (row.auction_outcome === 'We Won') return '#1f9d55';
  if (DEAD_STATUSES.has(row.status)) return '#8a909c';
  if (row.status === 'Bid Ready' || row.status === 'Bid Submitted') return '#d7ae5c';
  return '#2f7fe0';
}
function activityLabel(row) {
  if (row.auction_outcome === 'We Won') return row.property_status || 'Won';
  return row.status || 'Updated';
}

export default async function HomePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, role')
    .eq('id', user.id)
    .maybeSingle();

  // Single real fetch (this route is admin-only per middleware, so RLS lets this see every
  // property) — every stat tile and the activity list below are derived from these same rows,
  // nothing on this page is fabricated.
  const { data: propRows } = await supabase
    .from('properties')
    .select('id, arv, max_bid, reno_cost, winning_bid, state, address, city, status, property_status, auction_outcome, updated_at');
  const rows = propRows || [];

  const totalCount = rows.length;
  const wonCount = rows.filter((r) => r.auction_outcome === 'We Won').length;
  const activeMarkets = new Set(rows.map((r) => r.state).filter(Boolean)).size;

  // Projected Profit = sum of computeProfit() (ARV*0.89 - Max Bid - Reno Cost) across every
  // property with enough data to project — the same formula the Formula Guide/Pipeline stats use,
  // just totalled. Deliberately not scoped to "still active" deals (no reliable single field marks
  // a deal as dead vs. just early-stage), matching "Properties in Pipeline" being an unfiltered
  // total too.
  let projectedProfitSum = 0;
  let projectedProfitCount = 0;
  for (const r of rows) {
    const p = computeProfit(dbRowToRow(r));
    if (p !== null) { projectedProfitSum += p; projectedProfitCount += 1; }
  }
  const projectedProfitValue = projectedProfitCount ? fmtMoney(projectedProfitSum) : '—';

  const recentActivity = [...rows]
    .filter((r) => r.updated_at)
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 5)
    .map((r) => ({
      color: activityColor(r),
      text: `${activityLabel(r)} — ${[r.address, r.city, r.state].filter(Boolean).join(', ') || 'no address on file'}`,
      time: timeAgo(r.updated_at),
    }));

  const firstName = (profile?.full_name || '').trim().split(/\s+/)[0] || 'there';

  const STATS = [
    { label: 'Properties in Pipeline', value: totalCount || '—', color: '#0f7a8c', bg: '#e8f5f7', icon: STAT_ICON_PIPELINE },
    { label: 'Properties Acquired', value: wonCount || '—', color: '#4d5fd1', bg: '#eef0fd', icon: STAT_ICON_OPERATIONS },
    { label: 'Projected Profit', value: projectedProfitValue, color: '#1f9d55', bg: '#e9faf0', icon: STAT_ICON_REPORTS, small: projectedProfitValue.length > 7 },
    { label: 'Active Markets', value: activeMarkets || '—', color: '#2f7fe0', bg: '#eaf3fe', icon: STAT_ICON_PARTNER },
  ];

  return (
    <>
      {/* <style> is an HTML raw-text element; React's server renderer HTML-escapes plain string
          children, so dangerouslySetInnerHTML is required to avoid a hydration mismatch for CSS
          containing quotes/`>` — same reasoning as AuctionPipeline.jsx / AcquisitionsApp.jsx. */}
      <style dangerouslySetInnerHTML={{ __html: homeCSS() }} />
      <AppShell user={profile}>
        <section className="ah-hero">
          <div className="ah-hero-content">
            <div className="ah-hero-eyebrow">Welcome back,</div>
            <h1>{firstName}</h1>
            <p className="ah-hero-tagline">Acquire smarter. Move faster. Build bigger.</p>
            <div className="ah-hero-pillars">PEOPLE<i>&middot;</i>PROCESS<i>&middot;</i>PROPERTIES<i>&middot;</i>FREEDOM</div>
          </div>
          <div className="ah-hero-side">
            <LiveClock />
          </div>
        </section>

        {/* TransitionLink, not <a>: client-side navigation with a fade out/in instead of a full
            page reload — see components/PageTransition.jsx. */}
        <section className="ah-apps">
          {APP_CARDS.map((c) => (
            <TransitionLink className={`ah-app-card ${c.theme}`} href={c.href} key={c.key}>
              <span className="ah-app-arrow">{CARD_ARROW}</span>
              <span className="ah-app-icon">{c.icon}</span>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
              <span className="ah-app-cta">{c.cta} {CARD_ARROW}</span>
            </TransitionLink>
          ))}
        </section>

        <section className="ah-stats">
          {STATS.map((s) => (
            <div className="ah-stat" key={s.label}>
              <div className="ah-stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              <div>
                <div className="ah-stat-value" style={s.small ? { fontSize: 15 } : undefined}>{s.value}</div>
                <div className="ah-stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </section>

        <section className="ah-bottom">
          <div className="ah-card ah-card-pad">
            <div className="ah-card-head">
              <h2>Recent Activity</h2>
              <a href="/pipeline">View all &rarr;</a>
            </div>
            {recentActivity.length === 0 ? (
              <div className="ah-table-empty">No recent activity.</div>
            ) : (
              <ul className="ah-activity-list">
                {recentActivity.map((a, i) => (
                  <li key={i}>
                    <span className="ah-activity-dot" style={{ background: a.color }} />
                    <span className="ah-activity-text">{a.text}</span>
                    <span className="ah-activity-time">{a.time}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="ah-card ah-card-pad">
            <div className="ah-card-head"><h2>Quick Actions</h2></div>
            <div className="ah-quick-grid">
              {QUICK_ACTIONS.map((a) => (
                <a className={`ah-quick-btn${a.variant ? ` ${a.variant}` : ''}`} href={a.href} key={a.label}>
                  {a.label}
                </a>
              ))}
            </div>
          </div>
        </section>

        <footer className="ah-footer">
          ACQUIRE HUB<span className="ah-dot">&middot;</span>FIND<span className="ah-dot">&middot;</span>ACQUIRE<span className="ah-dot">&middot;</span>SCALE
        </footer>
      </AppShell>
    </>
  );
}
