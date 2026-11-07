import { requireAdmin } from '@/lib/auth';
import { saveTool, deleteTool } from '../actions';

function ToolForm({ t, courses, submit }: { t?: any; courses: any[]; submit: string }) {
  return (
    <form action={saveTool} className="grid gap-3 md:grid-cols-2">
      {t && <input type="hidden" name="id" value={t.id} />}
      <div><label className="label">Nama tool</label><input name="title" className="input" required defaultValue={t?.title} placeholder="Gemini Gem: Vibe Coding UMKM" /></div>
      <div><label className="label">Link (URL)</label><input name="url" className="input" required defaultValue={t?.url} placeholder="https://gemini.google.com/gem/..." /></div>
      <div className="md:col-span-2"><label className="label">Keterangan singkat</label><input name="description" className="input" defaultValue={t?.description} /></div>
      <div><label className="label">Kategori</label><input name="category" className="input" defaultValue={t?.category} placeholder="AI Assistant / Desain / Deploy" /></div>
      <div><label className="label">Untuk kursus (opsional)</label>
        <select name="course_id" className="input" defaultValue={t?.course_id ?? ''}><option value="">Semua kursus (umum)</option>{courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select></div>
      <div><label className="label">Urutan</label><input name="order_index" type="number" className="input" defaultValue={t?.order_index ?? 0} /></div>
      <label className="flex items-center gap-2 self-end pb-2 text-sm"><input type="checkbox" name="is_featured" defaultChecked={t?.is_featured} /> Tampilkan di halaman Library Prompt</label>
      <div className="md:col-span-2"><button className="btn w-full sm:w-auto">{submit}</button></div>
    </form>
  );
}
export default async function AdminTools() {
  const { sb } = await requireAdmin();
  const [{ data }, { data: courses }] = await Promise.all([
    sb.from('tool_links').select('*').order('order_index').order('title'),
    sb.from('courses').select('id,title').order('title'),
  ]);
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold sm:text-2xl">Kelola Tools & Link</h1>
      <section className="glass p-4 sm:p-5"><h2 className="mb-3 font-semibold">Tambah tool / link baru</h2><ToolForm courses={courses ?? []} submit="Tambah tool" /></section>
      <div className="space-y-3">
        {(data ?? []).map((t: any) => (
          <details key={t.id} className="glass p-4">
            <summary className="flex cursor-pointer items-center gap-3"><span className="flex-1 truncate font-medium">{t.title}</span>
              {t.is_featured && <span className="chip bg-cyan/15 text-cyan">unggulan</span>}<span className="chip bg-violet/20 text-violet">{t.category || 'umum'}</span></summary>
            <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
              <ToolForm t={t} courses={courses ?? []} submit="Simpan perubahan" />
              <form action={deleteTool}><input type="hidden" name="id" value={t.id} /><button className="btn-danger">Hapus</button></form>
            </div>
          </details>))}
      </div>
    </div>
  );
}
