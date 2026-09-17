'use client';
// Signs an authenticated user out after a period of inactivity, per the brief's "session
// handling and inactivity timeout" requirement. Mounted globally (root layout) so it applies
// everywhere — it's a no-op when there's no session (e.g. every page today, before any route
// is actually gated behind login; that gating is Module 04's job once roles exist to check).
//
// 30 minutes is a reasonable default, not a number from the brief — adjust TIMEOUT_MS if the
// client wants something shorter/longer.

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

const TIMEOUT_MS = 30 * 60 * 1000;
const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

export default function InactivityTimeout() {
  const timerRef = useRef(null);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    function resetTimer() {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        const { data } = await supabase.auth.getSession();
        if (cancelled || !data.session) return;
        await supabase.auth.signOut();
        window.location.href = '/login?timeout=1';
      }, TIMEOUT_MS);
    }

    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      cancelled = true;
      clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, []);

  return null;
}
