import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function getProfile() {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await sb.from('profiles').select('*').eq('id', user.id).single();
  return { sb, user, profile: profile ?? { id: user.id, email: user.email, full_name: user.email, role: 'student' } };
}
export async function requireAdmin() {
  const ctx = await getProfile();
  if (ctx.profile.role !== 'admin') redirect('/dashboard');
  return ctx;
}
