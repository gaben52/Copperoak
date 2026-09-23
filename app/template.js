import PageTransition from '@/components/PageTransition';

// A template (unlike a layout) re-mounts on every navigation — which is what lets PageTransition's
// fade-in replay on client-side navigations, not just full page loads.
export default function Template({ children }) {
  return <PageTransition>{children}</PageTransition>;
}
