import AcquisitionsApp from '@/components/acquisitions/AcquisitionsApp';
import { SidebarFrame } from '@/components/shell/AppShell';
import { getSessionProfile } from '@/lib/auth/session';

export const metadata = {
  title: 'Acquire Hub — Property Operations',
};

export default async function Page() {
  const { profile } = await getSessionProfile();
  // Admin gets the same sidebar as Home/User Management — see SidebarFrame for why only admin.
  return profile?.role === 'admin'
    ? <SidebarFrame><AcquisitionsApp /></SidebarFrame>
    : <AcquisitionsApp />;
}
