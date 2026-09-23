'use client';
import { useEffect, useState } from 'react';

function formatDate(d) {
  return `${d.toLocaleDateString('en-US', { weekday: 'long' })}, ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${d.getFullYear()}`;
}
function formatClock(d) {
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
}

// Ticks every second using the viewer's own device clock — "according to location" just means
// their machine's local timezone, the same convention every OS clock/browser uses, no geolocation
// permission needed. Starts at null and only renders after mount: the server has no way to know
// the viewer's timezone, so rendering a real value during SSR would disagree with the client on
// the very first paint and trip a hydration mismatch (same reasoning as AuctionPipeline.jsx's own
// `currentMonth === null` guard).
export default function LiveClock() {
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;

  return (
    <>
      <div className="ah-hero-date">{formatDate(now)}</div>
      <div className="ah-hero-clock">{formatClock(now)}</div>
      <div className="ah-hero-cta">Let&rsquo;s make it happen.</div>
    </>
  );
}
