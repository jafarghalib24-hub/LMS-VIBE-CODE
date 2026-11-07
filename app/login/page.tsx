'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const sb = createClient(); const router = useRouter();
  const [mode, setMode] = useState<'masuk' | 'daftar' | 'magic'>('masuk');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [name, setName] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null); const [busy, setBusy] = useState(false);
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null);
    let error;
    if (mode === 'masuk') ({ error } = await sb.auth.signInWithPassword({ email, password }));
    else if (mode === 'daftar') ({ error } = await sb.auth.signUp({ email, password, options: { data: { full_name: name }, emailRedirectTo: `${origin}/auth/callback` } }));
    else ({ error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: `${origin}/auth/callback` } }));
    setBusy(false);
    if (error) return setMsg({ ok: false, text: error.message });
    if (mode === 'masuk') { router.replace('/dashboard'); router.refresh(); }
    else setMsg({ ok: true, text: 'Cek email Anda untuk melanjutkan.' });
  }
  const tabs = [['masuk', 'Masuk'], ['daftar', 'Daftar'], ['magic', 'Magic Link']] as const;
  return (
    <main className="grid min-h-screen place-items-center p-4">
      <div className="glass w-full max-w-md p-8">
        <h1 className="text-2xl font-bold">LMS Vibe Coding</h1>
        <p className="mt-1 text-sm text-slate-400">Belajar membuat aplikasi bisnis sendiri, tanpa ribet.</p>
        <div className="mt-6 grid grid-cols-3 gap-1 rounded-lg bg-ink/70 p-1" role="tablist">
          {tabs.map(([k, l]) => (
            <button key={k} role="tab" aria-selected={mode === k} onClick={() => setMode(k)}
              className={`rounded-md py-1.5 text-sm ${mode === k ? 'bg-violet text-white' : 'text-slate-400 hover:text-white'}`}>{l}</button>
          ))}
        </div>
        <form onSubmit={submit} className="mt-5 space-y-4">
          {mode === 'daftar' && <div><label className="label" htmlFor="n">Nama lengkap</label><input id="n" className="input" required value={name} onChange={(e) => setName(e.target.value)} /></div>}
          <div><label className="label" htmlFor="e">Email</label><input id="e" type="email" className="input" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          {mode !== 'magic' && <div><label className="label" htmlFor="p">Kata sandi</label><input id="p" type="password" minLength={8} className="input" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>}
          <button className="btn w-full" disabled={busy}>{busy ? 'Memproses…' : mode === 'masuk' ? 'Masuk' : mode === 'daftar' ? 'Buat akun' : 'Kirim magic link'}</button>
          {msg && <p role="status" className={`text-sm ${msg.ok ? 'text-cyan' : 'text-red-400'}`}>{msg.text}</p>}
        </form>
      </div>
    </main>
  );
}
