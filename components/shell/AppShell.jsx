'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import TransitionLink from '@/components/TransitionLink';
import { shellCSS, framedShellCSS, sidebarCSS } from './styles';

// Same icon set as the old Home page's sidebar (app/page.js) — duplicated here rather than
// imported, since app/page.js is a Server Component and this file is a Client Component ('use
// client' below, needed for the search/logout state); Next.js doesn't allow a Client Component
// to import from a Server Component module.
const ICON = {
  home: (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 9.5 10 4l6.5 5.5V16a1 1 0 0 1-1 1h-3v-5H7.5v5h-3a1 1 0 0 1-1-1V9.5Z" />
    </svg>
  ),
  pipeline: (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M4 5h12M4 10h12M4 15h8" />
    </svg>
  ),
  partner: (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2.5l6 2.2v4.3c0 4-2.6 6.9-6 8-3.4-1.1-6-4-6-8V4.7l6-2.2Z" />
      <path d="M7.3 10l1.9 1.9L12.7 8" />
    </svg>
  ),
  operations: (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 8.5 10 3l6.5 5.5" />
      <path d="M5 8v8h10V8" />
      <path d="M8.3 16v-4.5h3.4V16" />
    </svg>
  ),
  users: (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="7" r="3" />
      <path d="M2.5 17c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
      <path d="M15.5 8.5h4M17.5 6.5v4" />
    </svg>
  ),
  search: (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="9" cy="9" r="5.5" />
      <path d="M17 17l-3.8-3.8" />
    </svg>
  ),
  chevron: (
    <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5.5 8l4.5 4.5L14.5 8" />
    </svg>
  ),
  pin: (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2.5l6 2.2v4.3c0 4-2.6 6.9-6 8-3.4-1.1-6-4-6-8V4.7l6-2.2Z" />
    </svg>
  ),
};

const AH_LOGO_MARK = <img src="/assets/acquire-hub-logo.png" alt="Acquire Hub" width="44" height="44" />;

// `short`: the label on the phone bottom tab bar (see SHELL_SIDEBAR in styles.js), where the full
// labels don't fit five across.
const NAV_ITEMS = [
  { key: 'home', label: 'Home', short: 'Home', href: '/', icon: ICON.home },
  { key: 'pipeline', label: 'Auction Pipeline', short: 'Pipeline', href: '/pipeline', icon: ICON.pipeline },
  { key: 'partner', label: 'Partner Portal', short: 'Partners', href: '/partner-portal', icon: ICON.partner },
  { key: 'operations', label: 'Property Operations', short: 'Operations', href: '/acquisitions', icon: ICON.operations },
  { key: 'users', label: 'User Management', short: 'Users', href: '/admin/users', icon: ICON.users },
];

function initialsOf(name, email) {
  const source = (name || '').trim();
  if (source) {
    const parts = source.split(/\s+/).filter(Boolean);
    return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || source[0].toUpperCase();
  }
  return (email || '?')[0].toUpperCase();
}

// Word-by-word relevance: each typed word is scored independently against the given fields (an
// exact match outweighs a prefix match, which outweighs a plain substring match), then summed,
// with a bonus for hitting every typed word — so "37 ross" ranks "37 Ross Street" above a property
// that only happens to contain "ross" somewhere in a different field. Same pattern as
// AdminUsersPage.jsx's user search, kept as its own copy here since the field sets/weights differ
// enough that sharing one generic function would just reintroduce per-field special-casing.
function scoreProperty(p, words) {
  const fields = [p.address, p.city, p.county, p.state, p.zip];
  let total = 0;
  let hitAll = true;
  for (const w of words) {
    let best = 0;
    for (const raw of fields) {
      const v = (raw || '').toString().toLowerCase();
      if (!v) continue;
      if (v === w) best = Math.max(best, 10);
      else if (v.startsWith(w)) best = Math.max(best, 7);
      else if (v.includes(w)) best = Math.max(best, 4);
    }
    if (best === 0) hitAll = false;
    total += best;
  }
  if (hitAll) total += 3;
  return total;
}

function highlight(text, words) {
  const str = text == null ? '' : String(text);
  if (!words.length || !str) return str;
  const escaped = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const re = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = str.split(re);
  if (parts.length === 1) return str;
  return parts.map((part, i) =>
    words.includes(part.toLowerCase())
      ? <mark className="ah-mark" key={i}>{part}</mark>
      : <span key={i}>{part}</span>
  );
}

// `active`: one of NAV_ITEMS' keys.
function Sidebar({ active }) {
  // Collapsed to an icon-only rail by default; hovering it (mouse moves to the left edge of the
  // screen, where the rail lives) expands it to the full labeled sidebar as a floating overlay —
  // .ah-main's own margin-left stays pinned to the collapsed width (see styles.js) so expanding
  // never reflows the page content, it just floats the wider sidebar on top of it.
  const [expanded, setExpanded] = useState(false);

  return (
    <aside className={`ah-sidebar${expanded ? ' expanded' : ''}`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}>
      <TransitionLink className="ah-sidebar-brand" href="/">
        <div className="ah-logo-mark">{AH_LOGO_MARK}</div>
        <div className="ah-sidebar-brand-text">
          <div className="ah-wordmark">ACQUIRE <span className="ah-wordmark-b">HUB</span></div>
          <div className="ah-wordmark-tag">FIND<span className="ah-dot">&middot;</span>ACQUIRE<span className="ah-dot">&middot;</span>SCALE</div>
        </div>
      </TransitionLink>

      <nav className="ah-nav">
        {NAV_ITEMS.map((item) => (
          <TransitionLink className={`ah-nav-item${active === item.key ? ' active' : ''}`} href={item.href} key={item.key} title={item.label}>
            <span className="ah-nav-icon">{item.icon}</span>
            <span className="ah-nav-label">{item.label}</span>
            <span className="ah-nav-short">{item.short}</span>
          </TransitionLink>
        ))}
      </nav>

      <div className="ah-sidebar-promo">
        <div className="ah-promo-inner">
          <div className="ah-promo-title">Turn opportunity into equity.</div>
          <div className="ah-promo-divider" />
          <div className="ah-promo-brand">ACQUIRE HUB</div>
        </div>
      </div>
    </aside>
  );
}

// Which nav item a path belongs to — null means no sidebar on that path at all (the auth screens:
// /login, /change-password, /forgot-password, /reset-password).
function navKeyFor(pathname) {
  if (pathname.startsWith('/admin')) return 'users';
  return NAV_ITEMS.find((item) => item.href === pathname)?.key || null;
}

// The one sidebar instance, rendered from the root layout — outside app/template.js's per-page
// fade — so it stays mounted and still while pages change beside it. `enabled`: the signed-in user
// is an admin, resolved server-side in the layout (every login/logout is a full page load, so it's
// always current). Every other role can reach just one app page, so a nav rail would only offer
// links middleware bounces them off. The pages it appears on reserve its width themselves
// (.ah-main's margin, via AppShell / SidebarFrame).
export function AppSidebar({ enabled }) {
  const pathname = usePathname();
  const active = navKeyFor(pathname);
  if (!enabled || !active) return null;
  return (
    <>
      {/* dangerouslySetInnerHTML: same hydration reason as AppShell below. */}
      <style dangerouslySetInnerHTML={{ __html: sidebarCSS() }} />
      <Sidebar active={active} />
    </>
  );
}

// The space beside the sidebar, with no topbar — for admin on the three full-screen apps
// (Pipeline, Partner Portal, Property Operations), which each already carry their own header with
// its actions and Log Out. Mounted from those routes' page.js for role 'admin' only, matching
// AppSidebar's own admin-only rule.
export function SidebarFrame({ children }) {
  return (
    <div className="ah-shell ah-shell-framed">
      {/* Before the app's own <style> (inside children), so the app's body rules win over the
          shell's — see SHELL_FRAME in styles.js. dangerouslySetInnerHTML: same hydration reason
          as AppShell below. */}
      <style dangerouslySetInnerHTML={{ __html: framedShellCSS() }} />
      <div className="ah-main">{children}</div>
    </div>
  );
}

// Topbar + content area beside the sidebar (AppSidebar, root layout). `user`: {full_name, email,
// role} — every caller already has this from its own server-side session fetch (see app/page.js
// and the admin route page.js wrappers), so this component never re-fetches it itself. `children`
// is the page's own content, rendered inside .ah-content — for a Server Component caller, that
// content stays server-rendered even though it's passed through this Client Component as
// `children` (a plain React element, not re-executed here).
export default function AppShell({ user, children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const userMenuRef = useRef(null);

  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [properties, setProperties] = useState([]);
  const [propertiesLoaded, setPropertiesLoaded] = useState(false);
  const searchRef = useRef(null);

  // This route is admin-only (AppShell is only mounted on '/', '/admin/users', '/admin/assignments
  // — see lib/supabase/middleware.js's ROUTE_ALLOWED_ROLES), so /api/properties returns every
  // property, unfiltered, same as any other admin call to it. Fetched once on mount and searched
  // client-side — ~100-some rows, no pagination needed.
  useEffect(() => {
    fetch('/api/properties')
      .then((r) => r.json())
      .then((data) => setProperties(data.records || []))
      .catch(() => {})
      .finally(() => setPropertiesLoaded(true));
  }, []);

  useEffect(() => {
    function onClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setMenuOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') { setMenuOpen(false); setSearchOpen(false); }
    }
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const results = useMemo(() => {
    if (!words.length) return [];
    return properties
      .map((p) => ({ p, score: scoreProperty(p, words) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((x) => x.p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties, query]);

  async function handleLogout() {
    setMenuOpen(false);
    setLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } finally {
      // Fades the whole shell out (Framer Motion, on the root motion.div above) before the hard
      // navigation — a full page reload on purpose, so no signed-in client state survives logout;
      // /login's own PageTransition fade-in covers the arrival.
      setTimeout(() => { window.location.href = '/login'; }, 220);
    }
  }

  const fullName = user?.full_name || user?.email || '';
  const roleLabel = user?.role ? user.role[0].toUpperCase() + user.role.slice(1) : '';

  return (
    // Framer Motion drives the logout fade directly (animate/transition) instead of a CSS class
    // toggle — the arrival half of this same "screen opening/closing" motion is PageTransition.jsx
    // (also Framer Motion, wrapping every page via app/template.js), so login's fade-in and
    // this fade-out-before-redirect are both the same animation library end to end.
    <motion.div className="ah-shell"
      animate={{ opacity: loggingOut ? 0 : 1 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      style={{ pointerEvents: loggingOut ? 'none' : 'auto' }}>
      {/* <style> is an HTML raw-text element; React's server renderer HTML-escapes plain string
          children, so dangerouslySetInnerHTML is required to avoid a hydration mismatch for CSS
          containing quotes/`>` — same reasoning as AuctionPipeline.jsx / AcquisitionsApp.jsx. */}
      <style dangerouslySetInnerHTML={{ __html: shellCSS() }} />

      <div className="ah-main">
        <header className="ah-topbar">
          <div className="ah-search-wrap" ref={searchRef}>
            <label className="ah-search">
              {ICON.search}
              <input
                type="text"
                placeholder="Search properties, counties, addresses, or anything..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
                onFocus={() => { if (query.trim()) setSearchOpen(true); }}
              />
            </label>
            {searchOpen && words.length > 0 && (
              <div className="ah-search-results">
                {!propertiesLoaded ? (
                  <div className="ah-search-empty">Loading properties&hellip;</div>
                ) : results.length === 0 ? (
                  <div className="ah-search-empty">No properties match &ldquo;{query.trim()}&rdquo;.</div>
                ) : (
                  results.map((p) => (
                    <a className="ah-search-result" href={`/pipeline?open=${p.id}`} key={p.id}>
                      <span className="ah-search-result-icon">{ICON.pin}</span>
                      <span className="ah-search-result-text">
                        <span className="ah-search-result-title">{highlight(p.address || '(no address)', words)}</span>
                        <span className="ah-search-result-sub">
                          {highlight([p.city, p.county, p.state, p.zip].filter(Boolean).join(', '), words)}
                        </span>
                      </span>
                    </a>
                  ))
                )}
              </div>
            )}
          </div>
          <div className="ah-topbar-right">
            <div className="ah-user-wrap" ref={userMenuRef}>
              <button type="button" className="ah-user" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}>
                <span className="ah-avatar">{initialsOf(user?.full_name, user?.email)}</span>
                <span className="ah-user-meta">
                  <span className="ah-user-name">{fullName}</span>
                  <span className="ah-user-role">{roleLabel}</span>
                </span>
                {ICON.chevron}
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div className="ah-user-menu" key="user-menu"
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.16, ease: 'easeOut' }}
                    style={{ transformOrigin: 'top right' }}>
                    <a className="ah-user-menu-item" href="mailto:gabe@verticalstackaq.com" onClick={() => setMenuOpen(false)}>
                      <span className="ah-user-menu-item-label">Support</span>
                      <span className="ah-user-menu-item-sub">gabe@verticalstackaq.com</span>
                    </a>
                    <div className="ah-user-menu-divider" />
                    <button type="button" className="ah-user-menu-item ah-user-menu-item-danger" onClick={handleLogout}>Log out</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <div className="ah-content">
          {children}
        </div>
      </div>
    </motion.div>
  );
}
