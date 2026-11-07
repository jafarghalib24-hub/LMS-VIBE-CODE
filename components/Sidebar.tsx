'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Item = { href: string; label: string; short?: string; icon: string; tab?: boolean; admin?: boolean };
const nav: Item[] = [
  { href: '/dashboard', label: 'Dashboard', short: 'Beranda', icon: '▦', tab: true },
  { href: '/courses', label: 'Courses', short: 'Kursus', icon: '▶', tab: true },
  { href: '/prompts', label: 'Prompt Library', short: 'Prompt', icon: '❝', tab: true },
  { href: '/tools', label: 'Tools & Link', short: 'Tools', icon: '⚒', tab: true },
  { href: '/demos', label: 'Demos', icon: '◈' },
  { href: '/admin/students', label: 'Students', icon: '☺', admin: true },
  { href: '/admin/courses', label: 'Kelola Kursus', icon: '✎', admin: true },
  { href: '/admin/prompts', label: 'Kelola Prompt', icon: '✦', admin: true },
  { href: '/admin/tools', label: 'Kelola Tools', icon: '⚒', admin: true },
  { href: '/settings', label: 'Settings', icon: '⚙' },
];

export default function Sidebar({ name, role }: { name: string; role: string }) {
  const path = usePathname(); const router = useRouter(); const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  const isAdmin = role === 'admin';
  const items = nav.filter((n) => !n.admin || isAdmin);
  const tabs = items.filter((n) => n.tab);
  const general = items.filter((n) => !n.admin && !n.tab && n.href !== '/settings');
  const adminItems = items.filter((n) => n.admin);
  const settings = items.find((n) => n.href === '/settings')!;
  const on = (h: string) => path === h || path.startsWith(h + '/');
  const initial = (name || '?').trim()[0]?.toUpperCase();
  async function logout() { await createClient().auth.signOut(); router.replace('/login'); router.refresh(); }

  const Logo = (<span className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-violet to-cyan font-bold">L</span><span className="font-bold">LMS Vibe Coding</span></span>);
  const D = (n: Item) => (
    <Link key={n.href} href={n.href} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${on(n.href) ? 'bg-violet/20 text-white ring-1 ring-violet/50' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
      <span aria-hidden className="w-4 text-center">{n.icon}</span>{n.label}</Link>);
  const Tile = (n: Item) => (
    <Link key={n.href} href={n.href} className={`flex flex-col items-center gap-1 rounded-2xl p-3 text-center text-xs active:scale-95 ${on(n.href) ? 'bg-violet/25 text-white' : 'bg-ink/60 text-slate-300'}`}>
      <span aria-hidden className="text-lg">{n.icon}</span>{n.label}</Link>);

  return (
    <>
      {/* Bar atas (HP) */}
      <header className="mx-3 mt-3 flex items-center justify-between md:hidden">
        <Link href="/dashboard">{Logo}</Link>
        <button onClick={() => setOpen(true)} aria-label="Buka menu akun" className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-violet to-cyan text-sm font-bold">{initial}</button>
      </header>

      {/* Sidebar (layar lebar) */}
      <aside className="hidden md:sticky md:top-3 md:m-3 md:block md:h-[calc(100vh-1.5rem)] md:w-60 md:shrink-0 md:self-start">
        <div className="glass flex h-full flex-col p-3">
          <div className="pb-4">{Logo}</div>
          <nav className="flex-1 space-y-1 overflow-y-auto" aria-label="Navigasi utama">
            {[...tabs, ...general].map(D)}
            {isAdmin && <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Admin</p>}
            {adminItems.map(D)}
          </nav>
          <div className="space-y-2 border-t border-white/10 pt-3">
            {D(settings)}
            <p className="truncate px-3 text-sm font-medium">{name}</p><p className="px-3 text-xs capitalize text-cyan">{role}</p>
            <button onClick={logout} className="btn-ghost w-full">Keluar</button>
          </div>
        </div>
      </aside>

      {/* Tab bawah (HP) */}
      <nav aria-label="Navigasi bawah" className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0b1224]/95 backdrop-blur-xl md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <ul className="grid grid-cols-5">
          {tabs.map((n) => (<li key={n.href}><Link href={n.href} aria-current={on(n.href) ? 'page' : undefined} className={`flex flex-col items-center gap-0.5 py-2 text-[11px] ${on(n.href) ? 'text-white' : 'text-slate-400'}`}>
            <span aria-hidden className={`grid h-7 w-12 place-items-center rounded-full text-base transition ${on(n.href) ? 'bg-violet/30 text-violet' : ''}`}>{n.icon}</span>{n.short}</Link></li>))}
          <li><button onClick={() => setOpen(true)} className="flex w-full flex-col items-center gap-0.5 py-2 text-[11px] text-slate-400"><span aria-hidden className="grid h-7 w-12 place-items-center text-base">☰</span>Menu</button></li>
        </ul>
      </nav>

      {/* Menu geser dari bawah (HP) */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-white/10 bg-card p-4" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-violet to-cyan font-bold">{initial}</span>
              <div className="min-w-0"><p className="truncate font-semibold">{name}</p><p className="text-xs capitalize text-cyan">{role}</p></div>
            </div>
            <div className="grid grid-cols-3 gap-2">{[...general, settings].map(Tile)}</div>
            {isAdmin && (<><p className="pb-2 pt-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Admin</p><div className="grid grid-cols-3 gap-2">{adminItems.map(Tile)}</div></>)}
            <button onClick={logout} className="btn-ghost mt-5 w-full py-3">Keluar</button>
          </div>
        </div>
      )}
    </>
  );
}
