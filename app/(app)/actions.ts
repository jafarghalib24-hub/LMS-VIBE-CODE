'use server';
import { revalidatePath } from 'next/cache';
import { getProfile } from '@/lib/auth';

export async function enroll(formData: FormData) {
  const { sb, user } = await getProfile();
  await sb.from('enrollments').upsert({ user_id: user.id, course_id: String(formData.get('course_id')) }, { onConflict: 'user_id,course_id', ignoreDuplicates: true });
  revalidatePath('/courses');
}
export async function toggleComplete(formData: FormData) {
  const { sb, user } = await getProfile();
  const lessonId = String(formData.get('lesson_id')), courseId = String(formData.get('course_id')), slug = String(formData.get('slug'));
  const { data: ex } = await sb.from('lesson_progress').select('lesson_id').eq('user_id', user.id).eq('lesson_id', lessonId).maybeSingle();
  if (ex) await sb.from('lesson_progress').delete().eq('user_id', user.id).eq('lesson_id', lessonId);
  else await sb.from('lesson_progress').insert({ user_id: user.id, lesson_id: lessonId });
  // hitung ulang progres
  const { data: ls } = await sb.from('lessons').select('id, modules!inner(course_id)').eq('modules.course_id', courseId);
  const ids = (ls ?? []).map((x: any) => x.id);
  const { count } = await sb.from('lesson_progress').select('*', { count: 'exact', head: true }).eq('user_id', user.id).in('lesson_id', ids);
  const pct = ids.length ? Math.round(((count ?? 0) / ids.length) * 100) : 0;
  await sb.from('enrollments').upsert({ user_id: user.id, course_id: courseId, progress_percent: pct, status: pct === 100 ? 'completed' : 'active' }, { onConflict: 'user_id,course_id' });
  revalidatePath(`/courses/${slug}`);
}
export async function copyPrompt(id: string) {
  const { sb } = await getProfile();
  await sb.rpc('increment_copy_count', { p_id: id });
}
