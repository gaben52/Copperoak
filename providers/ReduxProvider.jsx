'use client';
// Client Component boundary for Redux only — it wraps `children` rather than converting the
// route tree into Client Components itself. The store is created per ReduxProvider instance
// (via useRef, not a module-level singleton) because Next.js still server-renders Client
// Components for the initial HTML; a shared singleton would leak state across concurrent
// requests on the server. See lib/redux/store.js.

import { useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/lib/redux/store';

export default function ReduxProvider({ children }) {
  const storeRef = useRef(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }
  return <Provider store={storeRef.current}>{children}</Provider>;
}
