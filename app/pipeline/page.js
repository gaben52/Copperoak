import { Suspense } from 'react';
import AuctionPipeline from '@/components/pipeline/AuctionPipeline';
import { SidebarFrame } from '@/components/shell/AppShell';
import { getSessionProfile } from '@/lib/auth/session';

export const metadata = {
  title: 'Acquire Hub — Auction Pipeline',
};

export default async function Page() {
  const { profile } = await getSessionProfile();
  // AuctionPipeline reads ?open= via useSearchParams() (the Home page search's deep link),
  // which Next.js requires a Suspense boundary around — same reasoning as
  // app/admin/assignments/page.js. The fallback is never really visible: this route already
  // requires auth, so there's no static-generation path that would show it.
  const app = (
    <Suspense fallback={null}>
      <AuctionPipeline variant="full" hasTitleReports />
    </Suspense>
  );
  // Admin gets the same sidebar as Home/User Management — see SidebarFrame for why only admin.
  return profile?.role === 'admin' ? <SidebarFrame>{app}</SidebarFrame> : app;
}
