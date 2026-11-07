import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getProfile } from '@/lib/auth';
import { youtubeId } from '@/lib/youtube';
import { toggleComplete } from '../../actions';

export default async function Player({ params, searchParams }: { params: { slug: string }; searchParams: { lesson?: string } }) {
  const { sb, user } = await getProfile();
  const { data: course } = await sb.from('courses').select('*, modules(*, lessons(*))').eq('slug', params.slug).maybeSingle();
  if (!course) notFound();
  const { data: enr } = await sb.from('enrollments').select('progress_percent').eq('user_id', user.id).eq('course_id', course.id).maybeSingle();
  if (!enr) redirect('/courses');
  const modules = [...course.modules].sort((a: any, b: any) => a.order_index - b.order_index).map((m: any) => ({ ...m, lessons: [...m.lessons].sort((a: any, b: any) => a.order_index - b.order_index) }));
  const all = modules.flatMap((m: any) => m.lessons);
  const current = all.find((x: any) => x.id === searchParams.lesson) ?? all[0];
  const { data: done } = await sb.from('lesson_progress').select('lesson_id').eq('user_id', user.id);
  const doneSet = new Set((done ?? []).map((d: any) => d.lesson_id));
  const vid = youtubeId(current?.youtube_url) ?? youtubeId(course.intro_youtube_url);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <section className="space-y-4">
        <Link href="/courses" className="text-sm text-cyan">← Semua kursus</Link>
        <div className="glass overflow-hidden">
          {vid ? <iframe className="aspect-video w-full" src={`https://www.youtube-nocookie.com/embed/${vid}`} title={current?.title ?? course.title}
            allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
            : <div className="grid aspect-video place-items-center text-slate-500">Pelajaran ini belum memiliki video.</div>}
        </div>
        <div className="glass space-y-3 p-5">
          <h1 className="text-xl font-bold">{current?.title ?? course.title}</h1>
          {current && <form action={toggleComplete}>
            <input type="hidden" name="lesson_id" value={current.id} /><input type="hidden" name="course_id" value={course.id} /><input type="hidden" name="slug" value={course.slug} />
            <button className="btn">{doneSet.has(current.id) ? '✓ Selesai — batalkan' : 'Tandai selesai'}</button></form>}
          {current?.content_markdown && <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{current.content_markdown}</div>}
        </div>
      </section>
      <aside className="glass h-fit p-4">
        <p className="text-sm font-semibold">{course.title}</p>
        <div className="my-2 h-2 rounded bg-white/10"><div className="h-2 rounded bg-gradient-to-r from-violet to-cyan" style={{ width: `${enr.progress_percent}%` }} /></div>
        <p className="mb-3 text-xs text-slate-400">{enr.progress_percent}% selesai</p>
        {modules.map((m: any) => (<div key={m.id} className="mb-3"><p className="mb-1 text-xs font-semibold text-violet">{m.title}</p>
          <ul>{m.lessons.map((x: any) => (<li key={x.id}><Link href={`/courses/${course.slug}?lesson=${x.id}`}
            className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${x.id === current?.id ? 'bg-violet/20' : 'hover:bg-white/5'}`}>
            <span className={doneSet.has(x.id) ? 'text-cyan' : 'text-slate-600'}>{doneSet.has(x.id) ? '●' : '○'}</span><span className="flex-1">{x.title}</span><span className="text-xs text-slate-500">{x.duration}</span></Link></li>))}</ul></div>))}
      </aside>
    </div>
  );
}
