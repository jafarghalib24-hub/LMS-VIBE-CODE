import Sidebar from '@/components/Sidebar';
import { getProfile } from '@/lib/auth';
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await getProfile();
  return (
    <div className="md:flex">
      <Sidebar name={profile.full_name || profile.email} role={profile.role} />
      <main className="min-w-0 flex-1 p-3 pb-28 sm:p-4 sm:pb-28 md:p-6 md:pb-6">{children}</main>
    </div>
  );
}
