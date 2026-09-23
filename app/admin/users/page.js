import AdminUsersPage from '@/components/admin/AdminUsersPage';
import { getSessionProfile } from '@/lib/auth/session';

export const metadata = {
  title: 'Acquire Hub — User Management',
};

export default async function Page() {
  // Server-fetched once here so AppShell's topbar (name/role/avatar) never needs its own
  // client-side profile round trip — same pattern app/page.js uses.
  const { profile } = await getSessionProfile();
  return <AdminUsersPage user={profile} />;
}
