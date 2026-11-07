# LMS Vibe Coding

Next.js 14 (App Router) + TypeScript + Tailwind + Supabase. Siap deploy ke Vercel.

## Setup
1. `npm install`
2. Buat proyek Supabase, jalankan `supabase/migration.sql` di SQL Editor.
3. Salin `.env.example` ke `.env.local`, isi URL, anon key, dan service role key.
4. Supabase > Auth > URL Configuration: tambahkan `http://localhost:3000/auth/callback` (dan URL Vercel Anda).
5. `npm run dev`, daftar akun, lalu jadikan admin lewat SQL:
   `update profiles set role = 'admin' where email = 'email-anda@contoh.com';`
6. Deploy: push ke GitHub, impor di Vercel, isi 4 environment variable yang sama.
