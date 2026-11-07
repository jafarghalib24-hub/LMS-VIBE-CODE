import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

// getClaims memeriksa tanda tangan token secara lokal (tanpa bolak-balik ke server Auth) -> jauh lebih cepat.
// Jika versi Supabase belum punya getClaims, otomatis memakai getUser.
export async function currentUser(sb: any): Promise<{ id: string; email?: string } | null> {
  if (typeof sb.auth.getClaims === 'function') {
    const { data } = await sb.auth.getClaims();
    const c = data?.claims;
    return c?.sub ? { id: c.sub, email: c.email } : null;
  }
  const { data: { user } } = await sb.auth.getUser();
  return user ? { id: user.id, email: user.email } : null;
}

// cache(): layout + halaman + layout admin berbagi SATU pengecekan per permintaan (sebelumnya 3-5 kali).
export const getProfile = cache(async () => {
  const sb = createClient();
  const user = await currentUser(sb);
  if (!user) redirect('/login');
  const { data: profile } = await sb.from('profiles').select('*').eq('id', user.id).single();
  return { sb, user, profile: profile ?? { id: user.id, email: user.email, full_name: user.email, role: 'student' } };
});
export async function requireAdmin() {
  const ctx = await getProfile();
  if (ctx.profile.role !== 'admin') redirect('/dashboard');
  return ctx;
}
