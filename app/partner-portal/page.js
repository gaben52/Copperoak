import { Suspense } from 'react';
import AuctionPipeline from '@/components/pipeline/AuctionPipeline';

export const metadata = {
  title: 'Acquire Hub — Partner Portal',
};

export default function Page() {
  // Same component as /pipeline, so it needs the same Suspense boundary for useSearchParams() —
  // see app/pipeline/page.js.
  return (
    <Suspense fallback={null}>
      <AuctionPipeline variant="partner" hasTitleReports />
    </Suspense>
  );
}
