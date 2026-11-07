-- =========================================================
-- LMS Vibe Coding — Supabase migration (jalankan di SQL Editor)
-- =========================================================
create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text, full_name text,
  role text not null default 'student' check (role in ('admin','instructor','student')),
  avatar_url text, created_at timestamptz default now()
);
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null, slug text unique not null, description text,
  thumbnail_url text, category text, level text default 'Pemula',
  intro_youtube_url text,                 -- tambahan: video YouTube utama kursus
  price numeric default 0,                -- tambahan: untuk widget pendapatan
  created_by uuid references public.profiles(id), is_published boolean default false,
  created_at timestamptz default now()
);
create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null, order_index int default 0
);
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null, youtube_url text, duration text, content_markdown text, order_index int default 0
);
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  status text default 'active' check (status in ('active','completed','suspended')),
  progress_percent int default 0, created_at timestamptz default now(),
  unique (user_id, course_id)
);
create table public.lesson_progress (       -- tambahan: pelacak "tandai selesai"
  user_id uuid references public.profiles(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete cascade,
  completed_at timestamptz default now(), primary key (user_id, lesson_id)
);
create table public.prompt_library (
  id uuid primary key default gen_random_uuid(),
  title text not null, description text, category text, target_tool text,
  prompt_template text not null,          -- variabel ditulis {{nama_variabel}}
  tags text[] default '{}', copy_count int default 0
);

-- Helper role (security definer agar tidak rekursif di RLS)
create or replace function public.is_admin() returns boolean language sql security definer stable
set search_path = public as $$ select exists (select 1 from profiles where id = auth.uid() and role = 'admin') $$;

-- Auto-buat profil saat user mendaftar (role selalu 'student'; admin diangkat manual)
create or replace function public.handle_new_user() returns trigger language plpgsql security definer
set search_path = public as $$
begin
  insert into profiles (id, email, full_name) values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.increment_copy_count(p_id uuid) returns void language sql security definer
set search_path = public as $$ update prompt_library set copy_count = copy_count + 1 where id = p_id and auth.uid() is not null $$;

-- ================= RLS =================
alter table profiles enable row level security;
alter table courses enable row level security;
alter table modules enable row level security;
alter table lessons enable row level security;
alter table enrollments enable row level security;
alter table lesson_progress enable row level security;
alter table prompt_library enable row level security;

-- profiles: baca/ubah milik sendiri; admin bebas. User TIDAK bisa mengubah role sendiri.
create policy "profiles_select" on profiles for select using (id = auth.uid() or is_admin());
create policy "profiles_update_self" on profiles for update using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from profiles where id = auth.uid()));
create policy "profiles_admin_all" on profiles for all using (is_admin()) with check (is_admin());

-- courses / modules / lessons: terbit -> semua user login; admin & instruktur kelola
create policy "courses_read" on courses for select to authenticated using (is_published or is_admin() or created_by = auth.uid());
create policy "courses_admin" on courses for all using (is_admin()) with check (is_admin());
create policy "modules_read" on modules for select to authenticated using (exists (select 1 from courses c where c.id = course_id and (c.is_published or is_admin())));
create policy "modules_admin" on modules for all using (is_admin()) with check (is_admin());
create policy "lessons_read" on lessons for select to authenticated using (exists (select 1 from modules m join courses c on c.id = m.course_id where m.id = module_id and (c.is_published or is_admin())));
create policy "lessons_admin" on lessons for all using (is_admin()) with check (is_admin());

-- enrollments: milik sendiri; admin semua
create policy "enr_select" on enrollments for select using (user_id = auth.uid() or is_admin());
create policy "enr_insert_self" on enrollments for insert with check (user_id = auth.uid());
create policy "enr_update_self" on enrollments for update using (user_id = auth.uid() or is_admin());
create policy "enr_admin_delete" on enrollments for delete using (is_admin());
create policy "lp_own" on lesson_progress for all using (user_id = auth.uid() or is_admin()) with check (user_id = auth.uid());

-- prompt library: user login membaca; admin mengelola
create policy "prompt_read" on prompt_library for select to authenticated using (true);
create policy "prompt_admin" on prompt_library for all using (is_admin()) with check (is_admin());

-- Storage untuk thumbnail
insert into storage.buckets (id, name, public) values ('thumbnails','thumbnails', true) on conflict do nothing;
create policy "thumb_read" on storage.objects for select using (bucket_id = 'thumbnails');
create policy "thumb_admin_write" on storage.objects for all using (bucket_id = 'thumbnails' and public.is_admin()) with check (bucket_id = 'thumbnails' and public.is_admin());

-- ================= Seed Library Prompt =================
insert into prompt_library (title, description, category, target_tool, prompt_template, tags) values
('Landing Page Toko Online', 'Landing page satu halaman untuk UMKM', 'Build Landing Page', 'Claude / Cursor',
 'Buatkan landing page responsif dengan Next.js + Tailwind untuk bisnis "{{nama_bisnis}}" yang menjual {{produk}}. Target pelanggan: {{target}}. Sertakan hero, keunggulan, testimoni, harga, dan tombol WhatsApp ke {{nomor_wa}}.', '{landing,umkm,nextjs}'),
('Integrasi Payment Gateway', 'Pembayaran Midtrans/Xendit di Next.js', 'Integrate Payment Gateway', 'Claude / Cursor',
 'Integrasikan {{payment_gateway}} ke aplikasi Next.js saya. Buat route handler untuk membuat transaksi, halaman checkout, dan webhook untuk memperbarui status pesanan di tabel Supabase "orders". Jelaskan variabel environment yang dibutuhkan.', '{payment,midtrans,webhook}'),
('Database Setup Supabase', 'Skema tabel + RLS dari deskripsi bisnis', 'Database Setup', 'Claude',
 'Rancang skema PostgreSQL Supabase untuk aplikasi {{jenis_aplikasi}} milik UMKM. Buat tabel, relasi, indeks, dan Row Level Security supaya {{aturan_akses}}. Berikan SQL siap jalankan.', '{supabase,sql,rls}'),
('Pencatatan Keuangan Sederhana', 'Aplikasi catat pemasukan/pengeluaran', 'Build Business App', 'Claude / Lovable',
 'Buat aplikasi pencatatan keuangan untuk {{nama_bisnis}}: input pemasukan & pengeluaran, kategori, ringkasan harian/bulanan, dan grafik laba. Pisahkan uang bisnis dan uang pribadi.', '{keuangan,dashboard}'),
('CRM Pelanggan Mini', 'Data pelanggan + follow-up WhatsApp', 'Build Business App', 'Claude / Lovable',
 'Buat CRM mini untuk {{nama_bisnis}}: tabel pelanggan, status (lead, deal, repeat), catatan, pengingat follow-up, dan tombol kirim WhatsApp dengan template pesan {{template_pesan}}.', '{crm,whatsapp}');
