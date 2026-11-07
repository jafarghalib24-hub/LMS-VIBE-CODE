import { faviconOf } from '@/lib/embed';

export default function ToolCard({ t, className = '' }: { t: any; className?: string }) {
  return (
    <a href={t.url} target="_blank" rel="noopener noreferrer"
      className={`glass flex items-center gap-3 p-3 transition active:scale-[.98] hover:border-violet/50 sm:p-4 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={faviconOf(t.url)} alt="" width={40} height={40} loading="lazy" className="h-10 w-10 shrink-0 rounded-lg bg-white/10 p-1.5" />
      <span className="min-w-0 flex-1">
        {t.category && <span className="block text-[11px] font-semibold text-violet">{t.category}</span>}
        <span className="block truncate font-semibold">{t.title}</span>
        {t.description && <span className="line-clamp-2 text-xs text-slate-400">{t.description}</span>}
      </span>
      <span className="shrink-0 text-cyan" aria-hidden>↗</span><span className="sr-only">(buka di tab baru)</span>
    </a>
  );
}
