-- Jalankan SEKALI di Supabase SQL Editor (aman diulang)
alter table public.prompt_library add column if not exists preview_image_url text;
alter table public.prompt_library add column if not exists result_url text;
alter table public.lessons add column if not exists doc_url text;

create table if not exists public.tool_links (
  id uuid primary key default gen_random_uuid(),
  title text not null, url text not null, description text, category text,
  course_id uuid references public.courses(id) on delete cascade,
  is_featured boolean default false, order_index int default 0,
  created_at timestamptz default now()
);
alter table public.tool_links enable row level security;
drop policy if exists "tools_read" on public.tool_links;
drop policy if exists "tools_admin" on public.tool_links;
create policy "tools_read" on public.tool_links for select to authenticated using (true);
create policy "tools_admin" on public.tool_links for all using (public.is_admin()) with check (public.is_admin());

insert into public.tool_links (title, url, description, category, is_featured)
select * from (values
 ('Gemini', 'https://gemini.google.com', 'Asisten AI Google untuk menulis kode dan prompt', 'AI Assistant', true),
 ('Claude', 'https://claude.ai', 'Asisten AI untuk membangun aplikasi dan menulis kode', 'AI Assistant', true),
 ('ChatGPT', 'https://chatgpt.com', 'Asisten AI untuk ide, teks, dan kode', 'AI Assistant', false),
 ('Google AI Studio', 'https://aistudio.google.com', 'Coba model Gemini dan bangun prototipe cepat', 'AI Builder', false),
 ('Supabase', 'https://supabase.com', 'Database dan login untuk aplikasi Anda', 'Backend', false),
 ('Vercel', 'https://vercel.com', 'Tempat memasang aplikasi agar bisa dibuka online', 'Deploy', false),
 ('Canva', 'https://www.canva.com', 'Desain gambar thumbnail dan materi visual', 'Desain', false)
) as v(title, url, description, category, is_featured)
where not exists (select 1 from public.tool_links);
