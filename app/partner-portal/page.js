import AuctionPipeline from '@/components/pipeline/AuctionPipeline';

export const metadata = {
  title: 'OakFlow — Partner Portal',
};

export default function Page() {
  return <AuctionPipeline variant="partner" hasTitleReports />;
}
