import { Suspense } from 'react';
import AuctionPipeline from '@/components/pipeline/AuctionPipeline';

export const metadata = {
  title: 'Acquire Hub — Auction Pipeline',
};

export default function Page() {
  // AuctionPipeline reads ?open= via useSearchParams() (the Home page search's deep link),
  // which Next.js requires a Suspense boundary around — same reasoning as
  // app/admin/assignments/page.js. The fallback is never really visible: this route already
  // requires auth, so there's no static-generation path that would show it.
  return (
    <Suspense fallback={null}>
      <AuctionPipeline variant="full" hasTitleReports />
    </Suspense>
  );
}
