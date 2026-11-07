export default function CourseForm({ action, c, submit }: { action: (fd: FormData) => void; c?: any; submit: string }) {
  return (
    <form action={action} className="glass grid gap-4 p-4 sm:p-5 md:grid-cols-2">
      {c && <input type="hidden" name="id" value={c.id} />}
      <div className="md:col-span-2"><label className="label" htmlFor="t">Judul</label><input id="t" name="title" className="input" required defaultValue={c?.title} /></div>
      <div className="md:col-span-2"><label className="label" htmlFor="d">Deskripsi</label><textarea id="d" name="description" rows={3} className="input" defaultValue={c?.description} /></div>
      <div className="md:col-span-2">
        <label className="label" htmlFor="tf">Thumbnail kursus (unggah gambar, maks 4 MB)</label>
        {c?.thumbnail_url && /* eslint-disable-next-line @next/next/no-img-element */ <img src={c.thumbnail_url} alt="" className="mb-2 aspect-video w-48 rounded-lg object-cover" />}
        <input id="tf" name="thumbnail_file" type="file" accept="image/*" className="input" />
        <p className="mt-1 text-xs text-slate-500">Kosongkan jika ingin memakai thumbnail otomatis dari video YouTube.</p>
      </div>
      <div><label className="label" htmlFor="th">atau URL thumbnail</label><input id="th" name="thumbnail_url" className="input" defaultValue={c?.thumbnail_url ?? ''} /></div>
      <div><label className="label" htmlFor="yt">URL video YouTube utama</label><input id="yt" name="intro_youtube_url" className="input" defaultValue={c?.intro_youtube_url ?? ''} /></div>
      <div><label className="label" htmlFor="c">Kategori</label><input id="c" name="category" className="input" defaultValue={c?.category} /></div>
      <div><label className="label" htmlFor="l">Level</label><select id="l" name="level" className="input" defaultValue={c?.level ?? 'Pemula'}><option>Pemula</option><option>Menengah</option><option>Lanjut</option></select></div>
      <div><label className="label" htmlFor="p">Harga (Rp)</label><input id="p" name="price" type="number" min={0} className="input" defaultValue={c?.price ?? 0} /></div>
      <label className="flex items-center gap-2 self-end pb-2 text-sm"><input type="checkbox" name="is_published" defaultChecked={c?.is_published} /> Terbitkan kursus</label>
      <div className="md:col-span-2"><button className="btn w-full sm:w-auto">{submit}</button></div>
    </form>
  );
}
