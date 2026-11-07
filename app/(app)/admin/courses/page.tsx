import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import CourseForm from '@/components/CourseForm';
import { createCourse } from '../actions';

export default async function AdminCourses() {
  const { sb } = await requireAdmin();
  const { data } = await sb.from('courses').select('*').order('created_at', { ascending: false });
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Kelola Kursus</h1>
      <CourseForm action={createCourse} submit="Buat kursus" />
      <div className="glass divide-y divide-white/5">
        {(data ?? []).map((c: any) => (<Link key={c.id} href={`/admin/courses/${c.id}`} className="flex items-center justify-between p-4 hover:bg-white/5">
          <span>{c.title}</span><span className={`chip ${c.is_published ? 'bg-cyan/15 text-cyan' : 'bg-white/10 text-slate-400'}`}>{c.is_published ? 'Terbit' : 'Draf'}</span></Link>))}
      </div>
    </div>
  );
}
