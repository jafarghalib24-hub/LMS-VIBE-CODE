import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import CourseForm from '@/components/CourseForm';
import { updateCourse, deleteCourse, addModule, deleteModule, addLesson, updateLesson, deleteLesson } from '../../actions';

function LessonForm({ l, courseId, moduleId, action, submit }: any) {
  return (
    <form action={action} className="grid gap-2 md:grid-cols-6">
      {l && <input type="hidden" name="id" value={l.id} />}
      {moduleId && <input type="hidden" name="module_id" value={moduleId} />}<input type="hidden" name="course_id" value={courseId} />
      <input name="title" className="input md:col-span-3" placeholder="Judul pelajaran" required aria-label="Judul pelajaran" defaultValue={l?.title} />
      <input name="youtube_url" className="input md:col-span-3" placeholder="Link video (YouTube atau Google Drive)" aria-label="Link video" defaultValue={l?.youtube_url ?? ''} />
      <input name="doc_url" className="input md:col-span-3" placeholder="Link langkah tertulis (Google Docs, opsional)" aria-label="Link langkah tertulis" defaultValue={l?.doc_url ?? ''} />
      <input name="duration" className="input md:col-span-2" placeholder="Durasi, mis. 12:30" aria-label="Durasi" defaultValue={l?.duration ?? ''} />
      <input name="order_index" type="number" className="input" placeholder="Urutan" aria-label="Urutan" defaultValue={l?.order_index ?? 0} />
      <textarea name="content_markdown" rows={3} className="input md:col-span-6" placeholder="Catatan / materi (teks)" aria-label="Materi" defaultValue={l?.content_markdown ?? ''} />
      <button className="btn md:col-span-6 md:w-fit">{submit}</button>
    </form>
  );
}
export default async function EditCourse({ params }: { params: { id: string } }) {
  const { sb } = await requireAdmin();
  const { data: c } = await sb.from('courses').select('*, modules(*, lessons(*))').eq('id', params.id).maybeSingle();
  if (!c) notFound();
  const mods = [...c.modules].sort((a: any, b: any) => a.order_index - b.order_index);
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold sm:text-2xl">Edit: {c.title}</h1>
      <CourseForm action={updateCourse} c={c} submit="Simpan kursus" />
      <h2 className="text-lg font-semibold">Modul & Pelajaran</h2>
      {mods.map((m: any) => (
        <section key={m.id} className="glass space-y-3 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2"><h3 className="font-semibold text-violet">#{m.order_index} · {m.title}</h3>
            <form action={deleteModule}><input type="hidden" name="id" value={m.id} /><input type="hidden" name="course_id" value={c.id} /><button className="btn-danger">Hapus modul</button></form></div>
          {[...m.lessons].sort((a: any, b: any) => a.order_index - b.order_index).map((l: any) => (
            <details key={l.id} className="rounded-lg bg-ink/50 p-3 text-sm">
              <summary className="cursor-pointer">{l.order_index}. {l.title} <span className="text-slate-500">{l.duration}</span></summary>
              <div className="mt-3 space-y-3 border-t border-white/10 pt-3">
                <LessonForm l={l} courseId={c.id} action={updateLesson} submit="Simpan pelajaran" />
                <form action={deleteLesson}><input type="hidden" name="id" value={l.id} /><input type="hidden" name="course_id" value={c.id} /><button className="btn-danger">Hapus pelajaran</button></form>
              </div></details>))}
          <details className="rounded-lg border border-dashed border-white/15 p-3"><summary className="cursor-pointer text-sm text-cyan">+ Tambah pelajaran ke modul ini</summary>
            <div className="mt-3"><LessonForm courseId={c.id} moduleId={m.id} action={addLesson} submit="Tambah pelajaran" /></div></details>
        </section>))}
      <form action={addModule} className="glass flex flex-wrap gap-2 p-4"><input type="hidden" name="course_id" value={c.id} />
        <input name="title" className="input sm:max-w-sm" placeholder="Judul modul baru" required aria-label="Judul modul" /><input name="order_index" type="number" className="input sm:w-28" placeholder="Urutan" aria-label="Urutan modul" /><button className="btn">Tambah modul</button></form>
      <form action={deleteCourse}><input type="hidden" name="id" value={c.id} /><button className="btn-danger">Hapus kursus ini</button></form>
    </div>
  );
}
