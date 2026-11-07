'use client';
import { useMemo, useState } from 'react';
import ToolCard from './ToolCard';

export default function ToolsLibrary({ tools }: { tools: any[] }) {
  const [q, setQ] = useState(''); const [cat, setCat] = useState('Semua');
  const cats = ['Semua', ...Array.from(new Set(tools.map((t) => t.category).filter(Boolean)))];
  const list = useMemo(() => tools.filter((t) => (cat === 'Semua' || t.category === cat) &&
    (t.title + (t.description ?? '') + (t.courses?.title ?? '')).toLowerCase().includes(q.toLowerCase())), [tools, q, cat]);
  return (
    <div className="space-y-4">
      <input className="input sm:max-w-md" type="search" placeholder="Cari tools…" aria-label="Cari tools" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="no-scrollbar -mx-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:px-0">
        {cats.map((c) => (<button key={c} onClick={() => setCat(c)} className={`chip shrink-0 py-2 ${cat === c ? 'bg-violet text-white' : 'bg-white/10 text-slate-300'}`}>{c}</button>))}
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {list.map((t) => (<div key={t.id} className="space-y-1">
          <ToolCard t={t} />
          {t.courses?.title && <p className="px-2 text-[11px] text-slate-500">Untuk kursus: {t.courses.title}</p>}
        </div>))}
        {!list.length && <p className="text-slate-500">Belum ada tools yang cocok.</p>}
      </div>
    </div>
  );
}
