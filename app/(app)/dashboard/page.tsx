import { getProfile } from '@/lib/auth';
import { AreaChart, BarChart } from '@/components/Charts';

const rp = (n: number) => 'Rp' + new Intl.NumberFormat('id-ID').format(n);
const integrations = ['Supabase', 'YouTube', 'Midtrans', 'WhatsApp', 'Email', 'Zoom', 'CRM', 'Vercel'];

export default async function Dashboard() {
  const { sb, profile } = await getProfile();
  const [s, c, l, e] = await Promise.all([
    sb.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    sb.from('courses').select('*', { count: 'exact', head: true }),
    sb.from('lessons').select('*', { count: 'exact', head: true }),
    sb.from('enrollments').select('id,status,progress_percent,created_at,profiles(full_name,email),courses(title,price)').order('created_at', { ascending: false }).limit(300),
  ]);
  const enr: any[] = e.data ?? [];
  const months = Array.from({ length: 6 }, (_, i) => { const d = new Date(); d.setMonth(d.getMonth() - (5 - i)); return d; });
  const key = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;
  const labels = months.map((d) => d.toLocaleDateString('id-ID', { month: 'short' }));
  const revenue = months.map((m) => enr.filter((x) => key(new Date(x.created_at)) === key(m)).reduce((a, x) => a + Number(x.courses?.price ?? 0), 0));
  const signups = months.map((m) => enr.filter((x) => key(new Date(x.created_at)) === key(m)).length);
  const total = revenue.reduce((a, b) => a + b, 0);
  const stats = [['Total Siswa', s.count ?? 0], ['Total E-Course', c.count ?? 0], ['Modul/Pelajaran Aktif', l.count ?? 0], ['Pendapatan (6 bln)', rp(total)]];
  const chip: Record<string, string> = { active: 'bg-cyan/15 text-cyan', completed: 'bg-emerald-500/15 text-emerald-300', suspended: 'bg-red-500/15 text-red-300' };

  return (
    <div className="space-y-5">
      <header><h1 className="text-2xl font-bold">Halo, {profile.full_name || 'Pelajar'}</h1><p className="text-sm text-slate-400">Ringkasan belajar dan bisnis kursus Anda.</p></header>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([k, v]) => (<div key={k as string} className="glass p-4"><p className="text-xs text-slate-400">{k}</p><p className="mt-1 text-2xl font-bold">{v}</p></div>))}
      </section>

      <section className="glass p-5">
        <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-semibold">Student Management Tools</h2>
          {profile.role === 'admin' && <a href="/admin/students" className="btn-ghost">Kelola siswa</a>}</div>
        <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-sm">
          <thead className="text-left text-xs text-slate-400"><tr><th className="py-2">Siswa</th><th>Kursus</th><th>Status</th><th className="w-40">Progres</th></tr></thead>
          <tbody>{enr.slice(0, 6).map((x) => (
            <tr key={x.id} className="border-t border-white/5">
              <td className="py-2.5"><p className="font-medium">{x.profiles?.full_name}</p><p className="text-xs text-slate-500">{x.profiles?.email}</p></td>
              <td>{x.courses?.title}</td>
              <td><span className={`chip ${chip[x.status]}`}>{x.status}</span></td>
              <td><div className="h-2 rounded bg-white/10"><div className="h-2 rounded bg-gradient-to-r from-violet to-cyan" style={{ width: `${x.progress_percent}%` }} /></div></td>
            </tr>))}
            {!enr.length && <tr><td colSpan={4} className="py-6 text-center text-slate-500">Belum ada pendaftar. Buka Courses untuk mulai belajar.</td></tr>}
          </tbody></table></div>
      </section>

      <section className="glass p-5">
        <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-semibold">Monetization Options</h2><a href="/admin/courses" className="btn-ghost">Atur harga kursus</a></div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl bg-ink/50 p-4"><p className="mb-2 text-sm text-slate-300">Ringkasan pendapatan</p><AreaChart data={revenue} labels={labels} /></div>
          <div className="rounded-xl bg-ink/50 p-4"><p className="mb-2 text-sm text-slate-300">Pendaftar per bulan</p><BarChart data={signups} labels={labels} /></div>
        </div>
      </section>

      <section className="glass p-5">
        <h2 className="mb-3 text-lg font-semibold">Seamless Integrations</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {integrations.map((n, i) => (<div key={n} className="rounded-xl bg-ink/50 p-4 text-center ring-1 ring-white/5">
            <div className={`mx-auto mb-2 grid h-10 w-10 place-items-center rounded-lg font-bold ${i % 2 ? 'bg-violet/25 text-violet' : 'bg-cyan/20 text-cyan'}`}>{n[0]}</div><p className="text-sm">{n}</p></div>))}
        </div>
      </section>
    </div>
  );
}
