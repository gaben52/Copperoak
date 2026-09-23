'use client';
// A next/link <Link> whose click fades the current page out before the next one fades in — see
// PageTransition.jsx. Still a real <Link> (prefetching, a real href), so middle-click, Ctrl/Cmd-
// click and "open in new tab" keep working exactly like a normal link.

import Link from 'next/link';
import { useTransitionNavigate } from './PageTransition';

export default function TransitionLink({ href, onClick, ...props }) {
  const navigate = useTransitionNavigate();

  function handleClick(e) {
    if (onClick) onClick(e);
    if (!navigate || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    // Stops <Link>'s own navigation (it checks defaultPrevented after calling onClick) — the
    // transition-wrapped push in navigate() replaces it.
    e.preventDefault();
    navigate(href);
  }

  return <Link href={href} onClick={handleClick} {...props} />;
}
