'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: '▦' },
  { href: '/courses', label: 'Courses', icon: '▶' },
  { href: '/admin/students', label: 'Students', icon: '☺', admin: true },
  { href: '/admin/courses', label: 'Kelola Kursus', icon: '✎', admin: true },
  { href: '/prompts', label: 'Prompt Library', icon: '❝' },
  { href: '/demos', label: 'Demos', icon: '◈' },
  { href: '/settings', label: 'Settings', icon: '⚙' },
];
export default function Sidebar({ name, role }: { name: string; role: string }) {
  const path = usePathname(); const router = useRouter();
  const items = nav.filter((n) => !n.admin || role === 'admin');
  async function logout() { await createClient().auth.signOut(); router.replace('/login'); router.refresh(); }
  return (
    <aside className="glass sticky top-3 m-3 flex h-[calc(100vh-1.5rem)] w-16 shrink-0 flex-col p-3 md:w-60">
      <div className="flex items-center gap-2 px-1 pb-4">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-violet to-cyan font-bold">L</span>
        <span className="hidden font-bold md:block">LMS Vibe Coding</span>
      </div>
      <nav className="flex-1 space-y-1" aria-label="Navigasi utama">
        {items.map((n) => {
          const active = path === n.href || path.startsWith(n.href + '/');
          return (
            <Link key={n.href} href={n.href} title={n.label}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${active ? 'bg-violet/20 text-white ring-1 ring-violet/50' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              <span aria-hidden className="w-4 text-center">{n.icon}</span><span className="hidden md:block">{n.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 pt-3">
        <p className="hidden truncate text-sm font-medium md:block">{name}</p>
        <p className="hidden text-xs capitalize text-cyan md:block">{role}</p>
        <button onClick={logout} className="btn-ghost mt-2 w-full">Keluar</button>
      </div>
    </aside>
  );
}
