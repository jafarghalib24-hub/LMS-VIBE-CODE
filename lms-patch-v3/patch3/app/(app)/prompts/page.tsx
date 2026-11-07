import { getProfile } from '@/lib/auth';
import PromptLibrary from '@/components/PromptLibrary';
import ToolCard from '@/components/ToolCard';
export default async function Prompts() {
  const { sb } = await getProfile();
  const [{ data }, { data: feat }] = await Promise.all([
    sb.from('prompt_library').select('*').order('copy_count', { ascending: false }),
    sb.from('tool_links').select('*').eq('is_featured', true).order('order_index'),
  ]);
  return (
    <div className="space-y-4">
      <header><h1 className="text-xl font-bold sm:text-2xl">Library Prompt</h1>
        <p className="text-sm text-slate-400">Prompt siap pakai untuk membangun aplikasi UMKM. Isi variabel, lalu salin.</p></header>
      {!!feat?.length && (<section aria-label="Tools unggulan"><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Tools untuk dipakai bersama prompt</p>
        <div className="no-scrollbar -mx-3 flex snap-x gap-3 overflow-x-auto px-3 pb-1 sm:mx-0 sm:px-0">
          {feat.map((t: any) => <ToolCard key={t.id} t={t} className="min-w-[260px] snap-start" />)}</div></section>)}
      <PromptLibrary prompts={data ?? []} />
    </div>
  );
}
