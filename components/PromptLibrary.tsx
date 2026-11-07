'use client';
import { useMemo, useState } from 'react';
import { copyPrompt } from '@/app/(app)/actions';

const vars = (t: string) => Array.from(new Set([...t.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1])));

export default function PromptLibrary({ prompts }: { prompts: any[] }) {
  const [q, setQ] = useState(''); const [cat, setCat] = useState('Semua'); const [tag, setTag] = useState('');
  const [values, setValues] = useState<Record<string, Record<string, string>>>({});
  const [toast, setToast] = useState('');
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
      <input className="input max-w-md" placeholder="Cari prompt…" aria-label="Cari prompt" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="flex flex-wrap gap-2">{cats.map((c) => (<button key={c} onClick={() => setCat(c)} className={`chip py-1 ${cat === c ? 'bg-violet text-white' : 'bg-white/10 text-slate-300'}`}>{c}</button>))}</div>
      <div className="flex flex-wrap gap-2">{tags.map((t) => (<button key={t} onClick={() => setTag(tag === t ? '' : t)} className={`chip ${tag === t ? 'bg-cyan text-ink' : 'bg-cyan/10 text-cyan'}`}>#{t}</button>))}</div>
      <div className="grid gap-4 lg:grid-cols-2">
        {list.map((p) => (
          <article key={p.id} className="glass space-y-3 p-5">
            <div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">{p.title}</h2><p className="text-sm text-slate-400">{p.description}</p></div>
              <span className="chip shrink-0 bg-violet/20 text-violet">{p.target_tool}</span></div>
            {vars(p.prompt_template).length > 0 && <div className="grid gap-2 sm:grid-cols-2">{vars(p.prompt_template).map((k) => (
              <div key={k}><label className="label" htmlFor={`${p.id}${k}`}>{k.replace(/_/g, ' ')}</label>
                <input id={`${p.id}${k}`} className="input" value={values[p.id]?.[k] ?? ''} onChange={(e) => setValues({ ...values, [p.id]: { ...values[p.id], [k]: e.target.value } })} /></div>))}</div>}
            <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-ink/70 p-3 text-xs leading-relaxed text-slate-300">{build(p)}</pre>
            <div className="flex items-center justify-between"><span className="text-xs text-slate-500">Disalin {p.copy_count}×</span><button onClick={() => copy(p)} className="btn">Salin prompt</button></div>
          </article>))}
        {!list.length && <p className="text-slate-500">Tidak ada prompt yang cocok. Ubah kata kunci atau filter.</p>}
      </div>
      {toast && <div role="status" className="fixed bottom-6 right-6 rounded-lg bg-cyan px-4 py-2 text-sm font-semibold text-ink shadow-lg">{toast}</div>}
    </div>
  );
}
