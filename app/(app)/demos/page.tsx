'use client';
import { useState } from 'react';
const presets = [{ name: 'Contoh: Halaman statis', url: 'https://example.com' }];
export default function Demos() {
  const [input, setInput] = useState(''); const [url, setUrl] = useState('');
  function load(e: React.FormEvent) { e.preventDefault(); try { const u = new URL(input); if (u.protocol === 'https:') setUrl(u.href); } catch { setUrl(''); } }
  return (
    <div className="space-y-4">
      <header><h1 className="text-2xl font-bold">Demo Sandbox</h1><p className="text-sm text-slate-400">Coba demo aplikasi langsung di sini. Hanya URL https; sebagian situs menolak ditampilkan di iframe.</p></header>
      <form onSubmit={load} className="flex max-w-2xl gap-2"><input className="input" placeholder="https://demo-saya.vercel.app" value={input} onChange={(e) => setInput(e.target.value)} aria-label="URL demo" /><button className="btn">Muat demo</button></form>
      <div className="flex gap-2">{presets.map((p) => <button key={p.url} className="btn-ghost" onClick={() => { setInput(p.url); setUrl(p.url); }}>{p.name}</button>)}</div>
      <div className="glass overflow-hidden">{url
        ? <iframe src={url} title="Demo aplikasi" className="h-[70vh] w-full bg-white" sandbox="allow-scripts allow-forms allow-popups" referrerPolicy="no-referrer" />
        : <div className="grid h-64 place-items-center text-slate-500">Masukkan URL demo untuk mulai.</div>}</div>
    </div>
  );
}
