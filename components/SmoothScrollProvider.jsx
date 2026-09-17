'use client';
// Inertial page-scroll for the whole app. CSS `scroll-behavior:smooth` only affects
// anchor/programmatic jumps — it does nothing for ordinary wheel/trackpad scrolling, which is
// what "smooth scrolling" usually means. Lenis hijacks the scroll and eases it every frame.

import { useEffect } from 'react';
import Lenis from 'lenis';

// Elements that get their own native scroll ONLY once the cursor has been genuinely, physically
// moved onto them — never merely because page-scroll shifted them underneath a stationary
// cursor. Mark a scrollable region with this attribute to opt in.
const ARMABLE_SELECTOR = '[data-lenis-armable]';

export default function SmoothScrollProvider() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
      // No allowNestedScroll here — that hands off to a nested scrollable element based on
      // whatever the wheel event's target happens to be, and a `wheel` event's target is
      // resolved by live hit-testing at the cursor's CURRENT screen position on every tick. If
      // you scroll with a physically stationary cursor, the page content moves underneath it —
      // so once a scrollable region (e.g. the property table) ends up under that still cursor,
      // the very next tick "sees" it as the target and hands off scroll to it, even though you
      // never moved your cursor there on purpose. That's the exact bug reported: scrolling the
      // page also scrolls the table. Instead, elements marked data-lenis-armable below only
      // become real data-lenis-prevent targets via a genuine mousemove landing inside them —
      // content shifting under a still pointer never fires mousemove, so this can't false-arm.
    });

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    let armedEl = null;
    let ticking = false;
    function updateArming(clientX, clientY) {
      const candidates = document.querySelectorAll(ARMABLE_SELECTOR);
      let next = null;
      for (const el of candidates) {
        const r = el.getBoundingClientRect();
        if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) {
          next = el;
          break;
        }
      }
      if (next !== armedEl) {
        if (armedEl) armedEl.removeAttribute('data-lenis-prevent');
        if (next) next.setAttribute('data-lenis-prevent', '');
        armedEl = next;
      }
    }
    function onMouseMove(e) {
      if (ticking) return;
      ticking = true;
      const { clientX, clientY } = e;
      requestAnimationFrame(() => {
        updateArming(clientX, clientY);
        ticking = false;
      });
    }
    // Real pointer movement only — never fires from content moving under a still cursor.
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      if (t) updateArming(t.clientX, t.clientY);
    }, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      lenis.destroy();
    };
  }, []);

  return null;
}
