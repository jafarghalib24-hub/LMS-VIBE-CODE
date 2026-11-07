import Link from 'next/link';
import { getProfile } from '@/lib/auth';
import { AreaChart, BarChart } from '@/components/Charts';
import { youtubeId, youtubeThumb } from '@/lib/youtube';

const rp = (n: number) => 'Rp' + new Intl.NumberFormat('id-ID').format(n);
const integrations = ['Supabase', 'YouTube', 'Midtrans', 'WhatsApp', 'Email', 'Zoom', 'CRM', 'Vercel'];
const chip: Record<string, string> = { active: 'bg-cyan/15 text-cyan', completed: 'bg-emerald-500/15 text-emerald-300', suspended: 'bg-red-500/15 text-red-300' };
const thumbOf = (c: any) => c?.thumbnail_url || youtubeThumb(youtubeId(c?.intro_youtube_url));
const Bar = ({ v }: { v: number }) => (<div className="h-2 rounded bg-white/10"><div className="h-2 rounded bg-gradient-to-r from-violet to-cyan" style={{ width: `${v}%` }} /></div>);

export default async function Dashboard() {
  const { sb, user, profile } = await getProfile();
  const isAdmin = profile.role === 'admin';
  const mineQ = sb.from('enrollments').select('id,status,progress_percent,courses(title,slug,thumbnail_url,intro_youtube_url)').eq('user_id', user.id).order('created_at', { ascending: false });
  const adminQ = isAdmin ? Promise.all([
    sb.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    sb.from('courses').select('*', { count: 'exact', head: true }),
    sb.from('lessons').select('*', { count: 'exact', head: true }),
    sb.from('enrollments').select('id,status,progress_percent,created_at,profiles(full_name,email),courses(title,price)').order('created_at', { ascending: false }).limit(300),
  ]) : null;
  const [{ data: mine }, adminRes] = await Promise.all([mineQ, adminQ]);
  const my: any[] = mine ?? [];
  const cont = my.find((m) => m.status !== 'completed') ?? my[0];
  const first = (profile.full_name || 'Pelajar').split(' ')[0];

  let admin: any = null;
  if (adminRes) {
    const [s, c, l, e] = adminRes;
    const enr: any[] = e.data ?? [];
    const months = Array.from({ length: 6 }, (_, i) => { const d = new Date(); d.setMonth(d.getMonth() - (5 - i)); return d; });
    const key = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;
    admin = {
      enr, labels: months.map((d) => d.toLocaleDateString('id-ID', { month: 'short' })),
      revenue: months.map((m) => enr.filter((x) => key(new Date(x.created_at)) === key(m)).reduce((a, x) => a + Number(x.courses?.price ?? 0), 0)),
      signups: months.map((m) => enr.filter((x) => key(new Date(x.created_at)) === key(m)).length),
      stats: [['Total Siswa', s.count ?? 0], ['E-Course', c.count ?? 0], ['Pelajaran', l.count ?? 0]],
    };
    admin.stats.push(['Pendapatan (6 bln)', rp(admin.revenue.reduce((a: number, b: number) => a + b, 0))]);
  }

  return (
    <div className="space-y-5">
      <header><h1 className="text-xl font-bold sm:text-2xl">Halo, {first} 👋</h1><p className="text-sm text-slate-400">{isAdmin ? 'Ringkasan belajar dan bisnis kursus Anda.' : 'Lanjutkan belajar membuat aplikasi bisnis Anda.'}</p></header>

      {cont ? (
        <Link href={`/courses/${cont.courses?.slug}`} className="glass flex gap-3 overflow-hidden p-3 transition active:scale-[.99] sm:p-4">
          <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-violet/40 to-cyan/30 sm:w-48">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {thumbOf(cont.courses) && <img src={thumbOf(cont.courses)!} alt="" className="h-full w-full object-cover" />}
            <span className="absolute inset-0 grid place-items-center bg-black/25"><span className="grid h-9 w-9 place-items-center rounded-full bg-violet">▶</span></span></div>
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-cyan">Lanjutkan belajar</p>
            <p className="line-clamp-2 font-semibold leading-snug">{cont.courses?.title}</p>
            <div className="flex items-center gap-2"><div className="flex-1"><Bar v={cont.progress_percent} /></div><span className="text-xs text-slate-400">{cont.progress_percent}%</span></div>
          </div>
        </Link>
      ) : (
        <Link href="/courses" className="glass flex items-center justify-between p-4"><div><p className="font-semibold">Mulai belajar</p><p className="text-sm text-slate-400">Pilih kursus pertama Anda</p></div><span className="btn">Lihat kursus</span></Link>
      )}

      {my.length > 1 && (
        <section className="space-y-2"><h2 className="font-semibold">Kursus saya</h2>
          <div className="grid gap-2 sm:grid-cols-2">{my.map((m) => (
            <Link key={m.id} href={`/courses/${m.courses?.slug}`} className="glass flex items-center gap-3 p-3 active:scale-[.99]">
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{m.courses?.title}</p><div className="mt-2"><Bar v={m.progress_percent} /></div></div>
              <span className="text-xs text-slate-400">{m.progress_percent}%</span></Link>))}</div></section>
      )}

      {admin && (<>
        <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {admin.stats.map(([k, v]: any) => (<div key={k} className="glass p-3 sm:p-4"><p className="text-xs text-slate-400">{k}</p><p className="mt-1 text-xl font-bold sm:text-2xl">{v}</p></div>))}
        </section>

        <section className="glass p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-2"><h2 className="text-base font-semibold sm:text-lg">Student Management Tools</h2><Link href="/admin/students" className="btn-ghost">Kelola siswa</Link></div>
          <ul className="space-y-2 md:hidden">{admin.enr.slice(0, 6).map((x: any) => (
            <li key={x.id} className="rounded-xl bg-ink/50 p-3">
              <div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate font-medium">{x.profiles?.full_name}</p><p className="truncate text-xs text-slate-500">{x.courses?.title}</p></div><span className={`chip shrink-0 ${chip[x.status]}`}>{x.status}</span></div>
              <div className="mt-2 flex items-center gap-2"><div className="flex-1"><Bar v={x.progress_percent} /></div><span className="text-xs text-slate-400">{x.progress_percent}%</span></div></li>))}
            {!admin.enr.length && <li className="py-4 text-center text-sm text-slate-500">Belum ada pendaftar.</li>}</ul>
          <div className="hidden overflow-x-auto md:block"><table className="w-full text-sm">
            <thead className="text-left text-xs text-slate-400"><tr><th className="py-2">Siswa</th><th>Kursus</th><th>Status</th><th className="w-40">Progres</th></tr></thead>
            <tbody>{admin.enr.slice(0, 6).map((x: any) => (<tr key={x.id} className="border-t border-white/5">
              <td className="py-2.5"><p className="font-medium">{x.profiles?.full_name}</p><p className="text-xs text-slate-500">{x.profiles?.email}</p></td><td>{x.courses?.title}</td>
              <td><span className={`chip ${chip[x.status]}`}>{x.status}</span></td><td><Bar v={x.progress_percent} /></td></tr>))}
              {!admin.enr.length && <tr><td colSpan={4} className="py-6 text-center text-slate-500">Belum ada pendaftar.</td></tr>}</tbody></table></div>
        </section>

        <section className="glass p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-2"><h2 className="text-base font-semibold sm:text-lg">Monetization Options</h2><Link href="/admin/courses" className="btn-ghost">Atur harga</Link></div>
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-xl bg-ink/50 p-3 sm:p-4"><p className="mb-2 text-sm text-slate-300">Ringkasan pendapatan</p><AreaChart data={admin.revenue} labels={admin.labels} /></div>
            <div className="rounded-xl bg-ink/50 p-3 sm:p-4"><p className="mb-2 text-sm text-slate-300">Pendaftar per bulan</p><BarChart data={admin.signups} labels={admin.labels} /></div>
          </div>
        </section>
      </>)}

      <section className="glass p-4 sm:p-5">
        <h2 className="mb-3 text-base font-semibold sm:text-lg">Seamless Integrations</h2>
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {integrations.map((n, i) => (<div key={n} className="rounded-xl bg-ink/50 p-2 text-center ring-1 ring-white/5 sm:p-4">
            <div className={`mx-auto mb-1.5 grid h-9 w-9 place-items-center rounded-lg font-bold sm:h-10 sm:w-10 ${i % 2 ? 'bg-violet/25 text-violet' : 'bg-cyan/20 text-cyan'}`}>{n[0]}</div><p className="truncate text-[11px] sm:text-sm">{n}</p></div>))}
        </div>
      </section>
    </div>
  );
}
