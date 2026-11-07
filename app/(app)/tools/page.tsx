import { getProfile } from '@/lib/auth';
import ToolsLibrary from '@/components/ToolsLibrary';
export default async function Tools() {
  const { sb } = await getProfile();
  const { data } = await sb.from('tool_links').select('*, courses(title)').order('is_featured', { ascending: false }).order('order_index').order('title');
  return (<div className="space-y-4"><header><h1 className="text-xl font-bold sm:text-2xl">Tools & Link</h1>
    <p className="text-sm text-slate-400">Kumpulan tools pendukung belajar. Ketuk untuk membukanya di tab baru.</p></header>
    <ToolsLibrary tools={data ?? []} /></div>);
}
