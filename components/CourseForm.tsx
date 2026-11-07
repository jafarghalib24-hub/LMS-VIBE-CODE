export default function CourseForm({ action, c, submit }: { action: (fd: FormData) => void; c?: any; submit: string }) {
  return (
    <form action={action} className="glass grid gap-4 p-5 md:grid-cols-2">
      {c && <input type="hidden" name="id" value={c.id} />}
      <div className="md:col-span-2"><label className="label" htmlFor="t">Judul</label><input id="t" name="title" className="input" required defaultValue={c?.title} /></div>
      <div className="md:col-span-2"><label className="label" htmlFor="d">Deskripsi</label><textarea id="d" name="description" rows={3} className="input" defaultValue={c?.description} /></div>
      <div><label className="label" htmlFor="th">URL thumbnail</label><input id="th" name="thumbnail_url" className="input" defaultValue={c?.thumbnail_url ?? ''} /></div>
      <div><label className="label" htmlFor="yt">URL video YouTube utama</label><input id="yt" name="intro_youtube_url" className="input" defaultValue={c?.intro_youtube_url ?? ''} /></div>
      <div><label className="label" htmlFor="c">Kategori</label><input id="c" name="category" className="input" defaultValue={c?.category} /></div>
      <div><label className="label" htmlFor="l">Level</label><select id="l" name="level" className="input" defaultValue={c?.level ?? 'Pemula'}><option>Pemula</option><option>Menengah</option><option>Lanjut</option></select></div>
      <div><label className="label" htmlFor="p">Harga (Rp)</label><input id="p" name="price" type="number" min={0} className="input" defaultValue={c?.price ?? 0} /></div>
      <label className="flex items-center gap-2 self-end pb-2 text-sm"><input type="checkbox" name="is_published" defaultChecked={c?.is_published} /> Terbitkan kursus</label>
      <div className="md:col-span-2"><button className="btn">{submit}</button></div>
    </form>
  );
}
