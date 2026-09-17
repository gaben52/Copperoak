'use client';
// Cross-app navigation is a full page reload (see the note in AuctionPipeline.jsx/
// AcquisitionsApp.jsx on why — plain <style> tags per app, kept safe only because there's no
// client-side router mounting two apps' CSS at once). That means there's no true crossfade
// available between pages — the browser tears down the old document before the new one exists.
// What IS available, and applied uniformly on every page load regardless of navigation
// direction (a link click, browser back/forward, or a typed URL): a brief fade+rise-in for
// whatever page just arrived, so every transition — "to" a page or "fro" back to one — lands
// softly instead of popping in instantly.

import { motion } from 'framer-motion';

export default function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
