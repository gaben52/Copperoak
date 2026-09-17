import AuctionPipeline from '@/components/pipeline/AuctionPipeline';

export const metadata = {
  title: 'OakFlow — Auction Pipeline',
};

export default function Page() {
  return <AuctionPipeline variant="full" hasTitleReports />;
}
