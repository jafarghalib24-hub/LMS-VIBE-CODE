import { requireAdmin } from '@/lib/auth';
import { createStudent, updateStudent, updateEnrollment, deleteStudent } from '../actions';

export default async function Students() {
  const { sb } = await requireAdmin();
  const { data } = await sb.from('profiles').select('*, enrollments(id,status,progress_percent,courses(title))').order('created_at', { ascending: false });
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Manajemen Siswa</h1>
      <form action={createStudent} className="glass grid gap-3 p-5 md:grid-cols-4">
        <input name="full_name" className="input" placeholder="Nama lengkap" required aria-label="Nama lengkap" />
        <input name="email" type="email" className="input" placeholder="Email" required aria-label="Email" />
        <input name="password" type="password" minLength={8} className="input" placeholder="Kata sandi awal" required aria-label="Kata sandi" />
        <button className="btn">Tambah siswa</button>
      </form>
      <div className="space-y-3">
        {(data ?? []).map((p: any) => (
          <div key={p.id} className="glass space-y-3 p-4">
            <form action={updateStudent} className="flex flex-wrap items-end gap-2">
              <input type="hidden" name="id" value={p.id} />
              <div className="min-w-[200px] flex-1"><label className="label">Nama</label><input name="full_name" className="input" defaultValue={p.full_name ?? ''} /></div>
              <div className="text-sm text-slate-400">{p.email}</div>
              <select name="role" defaultValue={p.role} className="input w-auto" aria-label="Role"><option value="student">student</option><option value="instructor">instructor</option><option value="admin">admin</option></select>
              <button className="btn-ghost">Simpan</button>
            </form>
            <form action={deleteStudent}><input type="hidden" name="id" value={p.id} /><button className="btn-danger">Hapus akun</button></form>
            {p.enrollments?.map((e: any) => (
              <form key={e.id} action={updateEnrollment} className="flex flex-wrap items-center gap-3 rounded-lg bg-ink/50 px-3 py-2 text-sm">
                <input type="hidden" name="id" value={e.id} /><span className="flex-1">{e.courses?.title}</span><span className="text-slate-400">{e.progress_percent}%</span>
                <select name="status" defaultValue={e.status} className="input w-auto py-1" aria-label="Status"><option>active</option><option>completed</option><option>suspended</option></select>
                <button className="btn-ghost">Ubah status</button></form>))}
          </div>))}
      </div>
    </div>
  );
}
