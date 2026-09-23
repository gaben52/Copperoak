import { Suspense } from 'react';
import AuctionPipeline from '@/components/pipeline/AuctionPipeline';
import { SidebarFrame } from '@/components/shell/AppShell';
import { getSessionProfile } from '@/lib/auth/session';

export const metadata = {
  title: 'Acquire Hub — Partner Portal',
};

export default async function Page() {
  const { profile } = await getSessionProfile();
  // Same component as /pipeline, so it needs the same Suspense boundary for useSearchParams() —
  // see app/pipeline/page.js.
  const app = (
    <Suspense fallback={null}>
      <AuctionPipeline variant="partner" hasTitleReports />
    </Suspense>
  );
  // Admin gets the same sidebar as Home/User Management — see SidebarFrame for why only admin.
  return profile?.role === 'admin' ? <SidebarFrame>{app}</SidebarFrame> : app;
}
