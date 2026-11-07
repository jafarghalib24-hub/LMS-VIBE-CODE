-- Jalankan sekali di Supabase SQL Editor
alter table public.prompt_library add column if not exists preview_image_url text;
alter table public.prompt_library add column if not exists result_url text;
