import { Suspense } from 'react';
import AdminAssignmentsPage from '@/components/admin/AdminAssignmentsPage';

export const metadata = {
  title: 'OakFlow — Assignments',
};

export default function Page() {
  // AdminAssignmentsPage reads ?userId= via useSearchParams(), which Next.js requires a
  // Suspense boundary around (otherwise the whole route opts out of static generation with a
  // build-time warning). The fallback is never actually visible in practice — this route is
  // always reached by a client-side navigation from the Users table, not a fresh page load.
  return (
    <Suspense fallback={null}>
      <AdminAssignmentsPage />
    </Suspense>
  );
}
