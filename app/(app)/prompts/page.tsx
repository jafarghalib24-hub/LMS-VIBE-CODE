import { getProfile } from '@/lib/auth';
import PromptLibrary from '@/components/PromptLibrary';
export default async function Prompts() {
  const { sb } = await getProfile();
  const { data } = await sb.from('prompt_library').select('*').order('copy_count', { ascending: false });
  return (<div className="space-y-5"><header><h1 className="text-2xl font-bold">Library Prompt</h1>
    <p className="text-sm text-slate-400">Prompt siap pakai untuk membangun aplikasi UMKM. Isi variabel, lalu salin.</p></header>
    <PromptLibrary prompts={data ?? []} /></div>);
}
