import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import CourseForm from '@/components/CourseForm';
import { updateCourse, deleteCourse, addModule, deleteModule, addLesson, deleteLesson } from '../../actions';

export default async function EditCourse({ params }: { params: { id: string } }) {
  const { sb } = await requireAdmin();
  const { data: c } = await sb.from('courses').select('*, modules(*, lessons(*))').eq('id', params.id).maybeSingle();
  if (!c) notFound();
  const mods = [...c.modules].sort((a: any, b: any) => a.order_index - b.order_index);
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Edit: {c.title}</h1>
      <CourseForm action={updateCourse} c={c} submit="Simpan kursus" />
      <h2 className="text-lg font-semibold">Modul & Pelajaran</h2>
      {mods.map((m: any) => (
        <section key={m.id} className="glass space-y-3 p-5">
          <div className="flex items-center justify-between"><h3 className="font-semibold text-violet">#{m.order_index} · {m.title}</h3>
            <form action={deleteModule}><input type="hidden" name="id" value={m.id} /><input type="hidden" name="course_id" value={c.id} /><button className="btn-danger">Hapus modul</button></form></div>
          {[...m.lessons].sort((a: any, b: any) => a.order_index - b.order_index).map((l: any) => (
            <div key={l.id} className="flex items-center justify-between rounded-lg bg-ink/50 px-3 py-2 text-sm"><span>{l.order_index}. {l.title} <span className="text-slate-500">{l.duration}</span></span>
              <form action={deleteLesson}><input type="hidden" name="id" value={l.id} /><input type="hidden" name="course_id" value={c.id} /><button className="btn-danger">Hapus</button></form></div>))}
          <form action={addLesson} className="grid gap-2 md:grid-cols-6">
            <input type="hidden" name="module_id" value={m.id} /><input type="hidden" name="course_id" value={c.id} />
            <input name="title" className="input md:col-span-2" placeholder="Judul pelajaran" required aria-label="Judul pelajaran" />
            <input name="youtube_url" className="input md:col-span-2" placeholder="URL YouTube" aria-label="URL YouTube" />
            <input name="duration" className="input" placeholder="12:30" aria-label="Durasi" />
            <input name="order_index" type="number" className="input" placeholder="Urutan" aria-label="Urutan" />
            <textarea name="content_markdown" rows={2} className="input md:col-span-5" placeholder="Catatan / materi (teks)" aria-label="Materi" />
            <button className="btn">Tambah</button></form>
        </section>))}
      <form action={addModule} className="glass flex flex-wrap gap-2 p-4"><input type="hidden" name="course_id" value={c.id} />
        <input name="title" className="input max-w-sm" placeholder="Judul modul baru" required aria-label="Judul modul" /><input name="order_index" type="number" className="input w-28" placeholder="Urutan" aria-label="Urutan modul" /><button className="btn">Tambah modul</button></form>
      <form action={deleteCourse}><input type="hidden" name="id" value={c.id} /><button className="btn-danger">Hapus kursus ini</button></form>
    </div>
  );
}
