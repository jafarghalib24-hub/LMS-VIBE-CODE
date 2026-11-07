import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getProfile } from '@/lib/auth';
import { youtubeId, youtubeThumb } from '@/lib/youtube';
import { docEmbedUrl } from '@/lib/embed';
import VideoPlayer from '@/components/VideoPlayer';
import ToolCard from '@/components/ToolCard';
import { toggleComplete } from '../../actions';

export default async function Player({ params, searchParams }: { params: { slug: string }; searchParams: { lesson?: string; tab?: string } }) {
  const { sb, user } = await getProfile();
  const { data: course } = await sb.from('courses').select('*, modules(*, lessons(*))').eq('slug', params.slug).maybeSingle();
  if (!course) notFound();
  const { data: enr } = await sb.from('enrollments').select('progress_percent').eq('user_id', user.id).eq('course_id', course.id).maybeSingle();
  if (!enr) redirect('/courses');
  const modules = [...course.modules].sort((a: any, b: any) => a.order_index - b.order_index).map((m: any) => ({ ...m, lessons: [...m.lessons].sort((a: any, b: any) => a.order_index - b.order_index) }));
  const all = modules.flatMap((m: any) => m.lessons);
  const current = all.find((x: any) => x.id === searchParams.lesson) ?? all[0];
  const next = current ? all[all.findIndex((x: any) => x.id === current.id) + 1] : null;
  const [{ data: done }, { data: tools }] = await Promise.all([
    sb.from('lesson_progress').select('lesson_id').eq('user_id', user.id),
    sb.from('tool_links').select('*').eq('course_id', course.id).order('order_index'),
  ]);
  const doneSet = new Set((done ?? []).map((d: any) => d.lesson_id));
  const docUrl = docEmbedUrl(current?.doc_url);
  const tabs: string[][] = [['materi', 'Materi']];
  if (current?.doc_url) tabs.push(['langkah', 'Langkah Tertulis']);
  if (tools?.length) tabs.push(['tools', 'Tools']);
  const tab = tabs.some((t) => t[0] === searchParams.tab) ? searchParams.tab : 'materi';
  const href = (t: string) => `/courses/${course.slug}?lesson=${current?.id ?? ''}&tab=${t}`;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px] lg:gap-x-5">
      {/* Video menempel di atas saat scroll (HP) */}
      <div className="sticky top-0 z-30 -mx-3 bg-black sm:-mx-4 md:-mx-6 lg:static lg:col-start-1 lg:row-start-1 lg:mx-0 lg:overflow-hidden lg:rounded-2xl lg:border lg:border-white/10">
        <VideoPlayer key={current?.id ?? 'intro'} url={current?.youtube_url ?? course.intro_youtube_url} title={current?.title ?? course.title} />
      </div>

      <div className="min-w-0 space-y-4 lg:col-start-1 lg:row-start-2">
        <Link href="/courses" className="text-sm text-cyan">← Semua kursus</Link>
        <h1 className="text-lg font-bold leading-snug sm:text-xl">{current?.title ?? course.title}</h1>
        <div className="flex flex-wrap gap-2">
          {current && <form action={toggleComplete} className="flex-1 sm:flex-none">
            <input type="hidden" name="lesson_id" value={current.id} /><input type="hidden" name="course_id" value={course.id} /><input type="hidden" name="slug" value={course.slug} />
            <button className="btn w-full">{doneSet.has(current.id) ? '✓ Selesai — batalkan' : 'Tandai selesai'}</button></form>}
          {next && <Link href={`/courses/${course.slug}?lesson=${next.id}`} className="btn-ghost flex-1 py-2.5 sm:flex-none">Berikutnya →</Link>}
        </div>

        {tabs.length > 1 && (
          <div className="flex gap-1 rounded-xl bg-ink/70 p-1" role="tablist">
            {tabs.map(([k, l]) => (<Link key={k} href={href(k)} scroll={false} role="tab" aria-selected={tab === k}
              className={`flex-1 rounded-lg py-2 text-center text-sm ${tab === k ? 'bg-violet text-white' : 'text-slate-400'}`}>{l}</Link>))}
          </div>)}

        {tab === 'materi' && (<div className="glass p-4 sm:p-5">
          {current?.content_markdown ? <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{current.content_markdown}</div>
            : <p className="text-sm text-slate-500">Belum ada catatan untuk pelajaran ini.</p>}</div>)}

        {tab === 'langkah' && (<div className="glass overflow-hidden">
          {docUrl ? <iframe src={docUrl} title={`Langkah tertulis: ${current?.title}`} className="h-[75vh] w-full bg-white" sandbox="allow-scripts allow-same-origin" />
            : <div className="p-5"><a href={current.doc_url} target="_blank" rel="noopener noreferrer" className="btn">Buka langkah tertulis ↗</a></div>}</div>)}

        {tab === 'tools' && (<div className="grid gap-3 sm:grid-cols-2">{(tools ?? []).map((t: any) => <ToolCard key={t.id} t={t} />)}</div>)}
      </div>

      <aside className="glass h-fit p-3 sm:p-4 lg:col-start-2 lg:row-span-2 lg:row-start-1">
        <p className="text-sm font-semibold">{course.title}</p>
        <div className="my-2 h-2 rounded bg-white/10"><div className="h-2 rounded bg-gradient-to-r from-violet to-cyan" style={{ width: `${enr.progress_percent}%` }} /></div>
        <p className="mb-3 text-xs text-slate-400">{enr.progress_percent}% selesai</p>
        {modules.map((m: any) => (
          <div key={m.id} className="mb-3"><p className="mb-1 text-xs font-semibold text-violet">{m.title}</p>
            <ul className="space-y-1">{m.lessons.map((x: any) => {
              const t = youtubeThumb(youtubeId(x.youtube_url)); const active = x.id === current?.id;
              return (<li key={x.id}><Link href={`/courses/${course.slug}?lesson=${x.id}`} className={`flex gap-3 rounded-lg p-1.5 ${active ? 'bg-violet/20 ring-1 ring-violet/40' : 'hover:bg-white/5'}`}>
                <div className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-md bg-ink sm:w-28">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {t ? <img src={t} alt="" loading="lazy" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-slate-600">▶</div>}
                  {doneSet.has(x.id) && <span className="absolute inset-0 grid place-items-center bg-black/55 text-lg text-cyan">✓</span>}
                  {x.duration && <span className="absolute bottom-0.5 right-0.5 rounded bg-black/75 px-1 text-[10px]">{x.duration}</span>}
                </div>
                <span className="text-sm leading-snug">{x.title}</span></Link></li>);
            })}</ul></div>))}
      </aside>
    </div>
  );
}
