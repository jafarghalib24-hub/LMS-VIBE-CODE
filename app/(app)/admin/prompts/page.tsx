import { requireAdmin } from '@/lib/auth';
import { savePrompt, deletePrompt } from '../actions';

function PromptForm({ p, submit }: { p?: any; submit: string }) {
  return (
    <form action={savePrompt} className="grid gap-3 md:grid-cols-2">
      {p && <input type="hidden" name="id" value={p.id} />}
      <div className="md:col-span-2"><label className="label">Judul</label><input name="title" className="input" required defaultValue={p?.title} /></div>
      <div><label className="label">Kategori</label><input name="category" className="input" placeholder="Build Landing Page" defaultValue={p?.category} /></div>
      <div><label className="label">Tool tujuan</label><input name="target_tool" className="input" placeholder="Claude / Cursor / Lovable" defaultValue={p?.target_tool} /></div>
      <div className="md:col-span-2"><label className="label">Deskripsi singkat</label><input name="description" className="input" defaultValue={p?.description} /></div>
      <div className="md:col-span-2"><label className="label">Isi prompt (variabel ditulis {'{{nama_variabel}}'})</label>
        <textarea name="prompt_template" rows={5} className="input" required defaultValue={p?.prompt_template} /></div>
      <div><label className="label">Tag (pisahkan dengan koma)</label><input name="tags" className="input" placeholder="landing, umkm" defaultValue={(p?.tags ?? []).join(', ')} /></div>
      <div><label className="label">Link demo hasil (opsional)</label><input name="result_url" className="input" defaultValue={p?.result_url ?? ''} /></div>
      <div className="md:col-span-2"><label className="label">Gambar hasil prompt (screenshot hasil, maks 4 MB)</label>
        {p?.preview_image_url && /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.preview_image_url} alt="" className="mb-2 aspect-video w-48 rounded-lg object-cover" />}
        <input name="preview_file" type="file" accept="image/*" className="input" /></div>
      <div className="md:col-span-2"><label className="label">atau URL gambar</label><input name="preview_image_url" className="input" defaultValue={p?.preview_image_url ?? ''} /></div>
      <div className="md:col-span-2"><button className="btn w-full sm:w-auto">{submit}</button></div>
    </form>
  );
}
export default async function AdminPrompts() {
  const { sb } = await requireAdmin();
  const { data } = await sb.from('prompt_library').select('*').order('title');
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold sm:text-2xl">Kelola Library Prompt</h1>
      <section className="glass p-4 sm:p-5"><h2 className="mb-3 font-semibold">Tambah prompt baru</h2><PromptForm submit="Tambah prompt" /></section>
      <div className="space-y-3">
        {(data ?? []).map((p: any) => (
          <details key={p.id} className="glass p-4">
            <summary className="flex cursor-pointer items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {p.preview_image_url ? <img src={p.preview_image_url} alt="" className="aspect-video w-20 rounded object-cover" /> : <span className="grid aspect-video w-20 place-items-center rounded bg-ink text-xs text-slate-500">no img</span>}
              <span className="flex-1 font-medium">{p.title}</span><span className="chip bg-violet/20 text-violet">{p.category}</span>
            </summary>
            <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
              <PromptForm p={p} submit="Simpan perubahan" />
              <form action={deletePrompt}><input type="hidden" name="id" value={p.id} /><button className="btn-danger">Hapus prompt</button></form>
            </div>
          </details>))}
      </div>
    </div>
  );
}
