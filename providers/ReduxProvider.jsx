'use client';
// Client Component boundary for Redux only — it wraps `children` rather than converting the
// route tree into Client Components itself. The store is created per ReduxProvider instance
// (via useRef, not a module-level singleton) because Next.js still server-renders Client
// Components for the initial HTML; a shared singleton would leak state across concurrent
// requests on the server. See lib/redux/store.js.
//
// A fresh store per pathname, too: this provider sits in the root layout, so it survives
// client-side <Link> navigations (Home's app cards). Without this, Pipeline's loaded properties
// and filters would carry over into Partner Portal (same component, same slices) — every page
// used to start from an empty store back when all navigation was a full reload, and still does.

import { useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Provider } from 'react-redux';
import { makeStore } from '@/lib/redux/store';

export default function ReduxProvider({ children }) {
  const pathname = usePathname();
  const storeRef = useRef(null);
  const pathnameRef = useRef(null);
  if (!storeRef.current || pathnameRef.current !== pathname) {
    storeRef.current = makeStore();
    pathnameRef.current = pathname;
  }
  return <Provider store={storeRef.current}>{children}</Provider>;
}
