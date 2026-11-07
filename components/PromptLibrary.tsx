'use client';
import { useMemo, useState } from 'react';
import { copyPrompt } from '@/app/(app)/actions';

const vars = (t: string) => Array.from(new Set([...t.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1])));

export default function PromptLibrary({ prompts }: { prompts: any[] }) {
  const [q, setQ] = useState(''); const [cat, setCat] = useState('Semua'); const [tag, setTag] = useState('');
  const [values, setValues] = useState<Record<string, Record<string, string>>>({});
  const [toast, setToast] = useState(''); const [zoom, setZoom] = useState<string | null>(null);
  const cats = ['Semua', ...Array.from(new Set(prompts.map((p) => p.category).filter(Boolean)))];
  const tags = Array.from(new Set(prompts.flatMap((p) => p.tags ?? [])));
  const list = useMemo(() => prompts.filter((p) =>
    (cat === 'Semua' || p.category === cat) && (!tag || p.tags?.includes(tag)) &&
    (p.title + p.description + p.prompt_template).toLowerCase().includes(q.toLowerCase())), [prompts, q, cat, tag]);
  const build = (p: any) => p.prompt_template.replace(/\{\{(\w+)\}\}/g, (_: string, k: string) => values[p.id]?.[k] || `{{${k}}}`);

  async function copy(p: any) {
    await navigator.clipboard.writeText(build(p));
    copyPrompt(p.id);
    setToast(`Prompt “${p.title}” disalin`); setTimeout(() => setToast(''), 2200);
  }
  return (
    <div className="space-y-4">
      <input className="input sm:max-w-md" placeholder="Cari prompt…" aria-label="Cari prompt" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">{cats.map((c) => (<button key={c} onClick={() => setCat(c)} className={`chip shrink-0 py-1.5 ${cat === c ? 'bg-violet text-white' : 'bg-white/10 text-slate-300'}`}>{c}</button>))}</div>
      <div className="flex flex-wrap gap-2">{tags.map((t) => (<button key={t} onClick={() => setTag(tag === t ? '' : t)} className={`chip py-1 ${tag === t ? 'bg-cyan text-ink' : 'bg-cyan/10 text-cyan'}`}>#{t}</button>))}</div>
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {list.map((p) => (
          <article key={p.id} className="glass flex flex-col overflow-hidden">
            {p.preview_image_url
              ? <button onClick={() => setZoom(p.preview_image_url)} aria-label={`Perbesar hasil: ${p.title}`} className="group relative aspect-video w-full bg-ink">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.preview_image_url} alt={`Hasil prompt ${p.title}`} loading="lazy" className="h-full w-full object-cover" />
                  <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-[11px] opacity-0 transition group-hover:opacity-100">Perbesar</span></button>
              : <div className="grid aspect-video place-items-center bg-gradient-to-br from-violet/25 to-cyan/15 text-xs text-slate-400">Belum ada gambar hasil</div>}
            <div className="flex flex-1 flex-col space-y-3 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">{p.title}</h2><p className="text-sm text-slate-400">{p.description}</p></div>
                {p.target_tool && <span className="chip shrink-0 bg-violet/20 text-violet">{p.target_tool}</span>}</div>
              {vars(p.prompt_template).length > 0 && <div className="grid gap-2 sm:grid-cols-2">{vars(p.prompt_template).map((k) => (
                <div key={k}><label className="label" htmlFor={`${p.id}${k}`}>{k.replace(/_/g, ' ')}</label>
                  <input id={`${p.id}${k}`} className="input" value={values[p.id]?.[k] ?? ''} onChange={(e) => setValues({ ...values, [p.id]: { ...values[p.id], [k]: e.target.value } })} /></div>))}</div>}
              <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-ink/70 p-3 text-xs leading-relaxed text-slate-300">{build(p)}</pre>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-2"><span className="text-xs text-slate-500">Disalin {p.copy_count}×</span>
                <div className="flex gap-2">{p.result_url && <a href={p.result_url} target="_blank" rel="noopener noreferrer" className="btn-ghost">Lihat demo</a>}<button onClick={() => copy(p)} className="btn">Salin prompt</button></div></div>
            </div>
          </article>))}
        {!list.length && <p className="text-slate-500">Tidak ada prompt yang cocok. Ubah kata kunci atau filter.</p>}
      </div>
      {zoom && <div role="dialog" aria-modal="true" onClick={() => setZoom(null)} className="fixed inset-0 z-50 grid cursor-zoom-out place-items-center bg-black/85 p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={zoom} alt="Hasil prompt diperbesar" className="max-h-[90vh] max-w-full rounded-lg" /></div>}
      {toast && <div role="status" className="fixed bottom-6 left-4 right-4 z-50 rounded-lg bg-cyan px-4 py-2 text-center text-sm font-semibold text-ink shadow-lg sm:left-auto sm:right-6">{toast}</div>}
    </div>
  );
}
