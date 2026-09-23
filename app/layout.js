import SmoothScrollProvider from '@/components/SmoothScrollProvider';
import InactivityTimeout from '@/components/auth/InactivityTimeout';
import { NavigationProvider } from '@/components/PageTransition';
import { AppSidebar } from '@/components/shell/AppShell';
import ReduxProvider from '@/providers/ReduxProvider';
import { getSessionProfile } from '@/lib/auth/session';

export const metadata = {
  title: {
    default: 'OakFlow',
    template: '%s',
  },
  description: 'OakFlow — property acquisition and disposition management for Copper Oak Asset Management.',
};

export default async function RootLayout({ children }) {
  // Only runs on a full page load — client-side navigations don't re-render the root layout — and
  // every login/logout is a full page load, so this is always the current user.
  const { profile } = await getSessionProfile();
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;450;500;550;600;650;700&display=swap"
          rel="stylesheet"
        />
        {/* Light-only product: pin the UA colour scheme so form controls, scrollbars and
            built-in widgets never render in a dark variant on a dark-mode OS. */}
        <meta name="color-scheme" content="light" />
        <style dangerouslySetInnerHTML={{ __html: 'html{color-scheme:light;scroll-behavior:smooth;background:#f4f5f7}@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}' }} />
      </head>
      {/* No inline style here: an inline `padding:0` outranks the stylesheets and was
          cancelling the page gutter that the Auction Pipeline sets on <body>. Margin and
          padding are owned by the design system + each app's stylesheet. */}
      <body>
        <ReduxProvider>
          <NavigationProvider>
            <SmoothScrollProvider />
            <InactivityTimeout />
            {/* Here rather than in each page, so it stays still across page changes — see AppSidebar. */}
            <AppSidebar enabled={profile?.role === 'admin'} />
            {/* Page fade lives in app/template.js, which re-mounts per navigation (this layout doesn't). */}
            {children}
          </NavigationProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
