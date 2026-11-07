'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/auth';

const s = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim();
const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const svc = () => createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });

// Unggah gambar ke Supabase Storage (bucket "thumbnails"), kembalikan URL publik atau null.
async function uploadImage(sb: any, fd: FormData, field: string, folder: string) {
  const f = fd.get(field) as File | null;
  if (!f || typeof f === 'string' || !f.size) return null;
  if (!f.type.startsWith('image/') || f.size > 4 * 1024 * 1024) return null;
  const ext = (f.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '') || 'png';
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await sb.storage.from('thumbnails').upload(path, f, { contentType: f.type });
  if (error) return null;
  return sb.storage.from('thumbnails').getPublicUrl(path).data.publicUrl as string;
}

async function courseFields(sb: any, fd: FormData) {
  const uploaded = await uploadImage(sb, fd, 'thumbnail_file', 'courses');
  return { title: s(fd, 'title'), description: s(fd, 'description'), thumbnail_url: uploaded ?? (s(fd, 'thumbnail_url') || null), category: s(fd, 'category'),
    level: s(fd, 'level'), intro_youtube_url: s(fd, 'intro_youtube_url') || null, price: Number(s(fd, 'price') || 0), is_published: fd.get('is_published') === 'on' };
}
export async function createCourse(fd: FormData) {
  const { sb, user } = await requireAdmin();
  const f = await courseFields(sb, fd);
  const { data } = await sb.from('courses').insert({ ...f, slug: slugify(f.title) + '-' + Math.random().toString(36).slice(2, 6), created_by: user.id }).select('id').single();
  redirect(`/admin/courses/${data!.id}`);
}
export async function updateCourse(fd: FormData) {
  const { sb } = await requireAdmin(); const id = s(fd, 'id');
  await sb.from('courses').update(await courseFields(sb, fd)).eq('id', id); revalidatePath(`/admin/courses/${id}`);
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
    content_markdown: s(fd, 'content_markdown'), doc_url: s(fd, 'doc_url') || null, order_index: Number(s(fd, 'order_index') || 0) }); revalidatePath(`/admin/courses/${s(fd, 'course_id')}`);
}
export async function updateLesson(fd: FormData) {
  const { sb } = await requireAdmin();
  await sb.from('lessons').update({ title: s(fd, 'title'), youtube_url: s(fd, 'youtube_url') || null, doc_url: s(fd, 'doc_url') || null, duration: s(fd, 'duration'),
    content_markdown: s(fd, 'content_markdown'), order_index: Number(s(fd, 'order_index') || 0) }).eq('id', s(fd, 'id')); revalidatePath(`/admin/courses/${s(fd, 'course_id')}`);
}
export async function deleteLesson(fd: FormData) {
  const { sb } = await requireAdmin(); await sb.from('lessons').delete().eq('id', s(fd, 'id')); revalidatePath(`/admin/courses/${s(fd, 'course_id')}`);
}
// ---- Library Prompt ----
export async function savePrompt(fd: FormData) {
  const { sb } = await requireAdmin();
  const uploaded = await uploadImage(sb, fd, 'preview_file', 'prompts');
  const row = {
    title: s(fd, 'title'), description: s(fd, 'description'), category: s(fd, 'category'), target_tool: s(fd, 'target_tool'),
    prompt_template: s(fd, 'prompt_template'),
    tags: s(fd, 'tags').split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
    preview_image_url: uploaded ?? (s(fd, 'preview_image_url') || null), result_url: s(fd, 'result_url') || null,
  };
  const id = s(fd, 'id');
  if (id) await sb.from('prompt_library').update(row).eq('id', id); else await sb.from('prompt_library').insert(row);
  revalidatePath('/admin/prompts'); revalidatePath('/prompts');
}
export async function deletePrompt(fd: FormData) {
  const { sb } = await requireAdmin(); await sb.from('prompt_library').delete().eq('id', s(fd, 'id'));
  revalidatePath('/admin/prompts'); revalidatePath('/prompts');
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

// ---- Tools & Link ----
export async function saveTool(fd: FormData) {
  const { sb } = await requireAdmin();
  let url = s(fd, 'url'); if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  try { const u = new URL(url); if (u.protocol !== 'https:' && u.protocol !== 'http:') return; } catch { return; }
  const row = { title: s(fd, 'title'), url, description: s(fd, 'description'), category: s(fd, 'category'),
    course_id: s(fd, 'course_id') || null, order_index: Number(s(fd, 'order_index') || 0), is_featured: fd.get('is_featured') === 'on' };
  const id = s(fd, 'id');
  if (id) await sb.from('tool_links').update(row).eq('id', id); else await sb.from('tool_links').insert(row);
  revalidatePath('/admin/tools'); revalidatePath('/tools'); revalidatePath('/prompts');
}
export async function deleteTool(fd: FormData) {
  const { sb } = await requireAdmin(); await sb.from('tool_links').delete().eq('id', s(fd, 'id'));
  revalidatePath('/admin/tools'); revalidatePath('/tools'); revalidatePath('/prompts');
}
