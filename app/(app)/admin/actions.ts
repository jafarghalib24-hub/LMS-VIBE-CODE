'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/auth';

const s = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim();
const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const svc = () => createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });

function courseFields(fd: FormData) {
  return { title: s(fd, 'title'), description: s(fd, 'description'), thumbnail_url: s(fd, 'thumbnail_url') || null, category: s(fd, 'category'),
    level: s(fd, 'level'), intro_youtube_url: s(fd, 'intro_youtube_url') || null, price: Number(s(fd, 'price') || 0), is_published: fd.get('is_published') === 'on' };
}
export async function createCourse(fd: FormData) {
  const { sb, user } = await requireAdmin();
  const f = courseFields(fd);
  const { data } = await sb.from('courses').insert({ ...f, slug: slugify(f.title) + '-' + Math.random().toString(36).slice(2, 6), created_by: user.id }).select('id').single();
  redirect(`/admin/courses/${data!.id}`);
}
export async function updateCourse(fd: FormData) {
  const { sb } = await requireAdmin(); const id = s(fd, 'id');
  await sb.from('courses').update(courseFields(fd)).eq('id', id); revalidatePath(`/admin/courses/${id}`);
}
export async function deleteCourse(fd: FormData) {
  const { sb } = await requireAdmin(); await sb.from('courses').delete().eq('id', s(fd, 'id')); redirect('/admin/courses');
}
export async function addModule(fd: FormData) {
  const { sb } = await requireAdmin(); const cid = s(fd, 'course_id');
  await sb.from('modules').insert({ course_id: cid, title: s(fd, 'title'), order_index: Number(s(fd, 'order_index') || 0) }); revalidatePath(`/admin/courses/${cid}`);
}
export async function deleteModule(fd: FormData) {
  const { sb } = await requireAdmin(); await sb.from('modules').delete().eq('id', s(fd, 'id')); revalidatePath(`/admin/courses/${s(fd, 'course_id')}`);
}
export async function addLesson(fd: FormData) {
  const { sb } = await requireAdmin();
  await sb.from('lessons').insert({ module_id: s(fd, 'module_id'), title: s(fd, 'title'), youtube_url: s(fd, 'youtube_url') || null, duration: s(fd, 'duration'),
    content_markdown: s(fd, 'content_markdown'), order_index: Number(s(fd, 'order_index') || 0) }); revalidatePath(`/admin/courses/${s(fd, 'course_id')}`);
}
export async function deleteLesson(fd: FormData) {
  const { sb } = await requireAdmin(); await sb.from('lessons').delete().eq('id', s(fd, 'id')); revalidatePath(`/admin/courses/${s(fd, 'course_id')}`);
}
// ---- Siswa ----
export async function createStudent(fd: FormData) {
  await requireAdmin();
  await svc().auth.admin.createUser({ email: s(fd, 'email'), password: s(fd, 'password'), email_confirm: true, user_metadata: { full_name: s(fd, 'full_name') } });
  revalidatePath('/admin/students');
}
export async function updateStudent(fd: FormData) {
  const { sb } = await requireAdmin();
  await sb.from('profiles').update({ full_name: s(fd, 'full_name'), role: s(fd, 'role') }).eq('id', s(fd, 'id')); revalidatePath('/admin/students');
}
export async function updateEnrollment(fd: FormData) {
  const { sb } = await requireAdmin();
  await sb.from('enrollments').update({ status: s(fd, 'status') }).eq('id', s(fd, 'id')); revalidatePath('/admin/students');
}
export async function deleteStudent(fd: FormData) {
  const { user } = await requireAdmin(); const id = s(fd, 'id'); if (id === user.id) return;
  await svc().auth.admin.deleteUser(id); revalidatePath('/admin/students');
}
