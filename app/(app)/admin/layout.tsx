import { requireAdmin } from '@/lib/auth';
// Lapisan kedua setelah middleware: cek role admin langsung di server.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <>{children}</>;
}
