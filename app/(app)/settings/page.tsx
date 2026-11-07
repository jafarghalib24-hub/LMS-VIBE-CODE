import { revalidatePath } from 'next/cache';
import { getProfile } from '@/lib/auth';
async function save(fd: FormData) {
  'use server';
  const { sb, user } = await getProfile();
  await sb.from('profiles').update({ full_name: String(fd.get('full_name')), avatar_url: String(fd.get('avatar_url') || '') || null }).eq('id', user.id);
  revalidatePath('/settings');
}
export default async function Settings() {
  const { profile } = await getProfile();
  return (<div className="max-w-lg space-y-4"><h1 className="text-2xl font-bold">Pengaturan</h1>
    <form action={save} className="glass space-y-4 p-5">
      <div><label className="label">Email</label><input className="input" disabled value={profile.email ?? ''} /></div>
      <div><label className="label" htmlFor="fn">Nama lengkap</label><input id="fn" name="full_name" className="input" defaultValue={profile.full_name ?? ''} required /></div>
      <div><label className="label" htmlFor="av">URL foto profil</label><input id="av" name="avatar_url" className="input" defaultValue={profile.avatar_url ?? ''} /></div>
      <button className="btn">Simpan perubahan</button></form></div>);
}
