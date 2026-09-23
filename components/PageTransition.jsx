'use client';
// Page-level fade for every navigation, in two pieces:
//
// NavigationProvider (root layout, persists): owns the "leaving" state. Links that go through
// TransitionLink.jsx (Home's app cards, the sidebar) call navigate(), which runs the router push
// inside a React transition — `leaving` stays true until the next page has actually loaded, so the
// current page fades out immediately on click instead of sitting frozen while the server responds.
// If the navigation never completes, the transition ends and the current page fades straight back.
//
// PageTransition (app/template.js): the fading wrapper around the page itself. Next.js re-mounts a
// template on every navigation (a layout persists), so the arrival fade+rise-in plays both on a
// full page load and on a client-side navigation. The sidebar lives in the root layout, outside
// this wrapper, so it stays put while only the page content fades.
//
// Navigating between apps client-side is safe for their CSS: each app's <style> tag unmounts with
// its page, so two apps' stylesheets still never coexist (Redux is reset per pathname too — see
// providers/ReduxProvider.jsx). Plain <a> links elsewhere are still full page reloads.

import { createContext, useContext, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const NavigationContext = createContext({ navigate: null, leaving: false });

export function useTransitionNavigate() {
  return useContext(NavigationContext).navigate;
}

export function NavigationProvider({ children }) {
  const router = useRouter();
  const [leaving, startTransition] = useTransition();
  const value = useMemo(() => ({
    navigate: (href) => startTransition(() => router.push(href)),
    leaving,
  }), [router, leaving]);
  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export default function PageTransition({ children }) {
  const { leaving } = useContext(NavigationContext);
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: leaving ? 0 : 1, y: 0 }}
      transition={{ duration: leaving ? 0.12 : 0.16, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
