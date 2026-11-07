import Link from 'next/link';
import { getProfile } from '@/lib/auth';
import { enroll } from '../actions';

export default async function Courses() {
  const { sb, user } = await getProfile();
  const [{ data: courses }, { data: mine }] = await Promise.all([
    sb.from('courses').select('*').eq('is_published', true).order('created_at', { ascending: false }),
    sb.from('enrollments').select('course_id,progress_percent').eq('user_id', user.id),
  ]);
  const map = new Map((mine ?? []).map((m: any) => [m.course_id, m.progress_percent]));
  return (
    <div className="space-y-5">
      <header><h1 className="text-2xl font-bold">Katalog Kursus</h1><p className="text-sm text-slate-400">Pilih kursus, lalu bangun aplikasi bisnis Anda sendiri.</p></header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {(courses ?? []).map((c: any) => (
          <article key={c.id} className="glass overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-violet/40 to-cyan/30">{c.thumbnail_url && /* eslint-disable-next-line @next/next/no-img-element */ <img src={c.thumbnail_url} alt="" className="h-full w-full object-cover" />}</div>
            <div className="space-y-2 p-4">
              <div className="flex gap-2"><span className="chip bg-violet/20 text-violet">{c.category || 'Umum'}</span><span className="chip bg-white/10">{c.level}</span></div>
              <h2 className="font-semibold">{c.title}</h2>
              <p className="line-clamp-2 text-sm text-slate-400">{c.description}</p>
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-semibold text-cyan">{Number(c.price) ? 'Rp' + new Intl.NumberFormat('id-ID').format(c.price) : 'Gratis'}</span>
                {map.has(c.id) ? <Link href={`/courses/${c.slug}`} className="btn">Lanjut belajar ({map.get(c.id)}%)</Link>
                  : <form action={enroll}><input type="hidden" name="course_id" value={c.id} /><button className="btn">Daftar kursus</button></form>}
              </div>
            </div>
          </article>))}
        {!courses?.length && <p className="text-slate-500">Belum ada kursus terbit. Admin dapat menambahkannya di Kelola Kursus.</p>}
      </div>
    </div>
  );
}
