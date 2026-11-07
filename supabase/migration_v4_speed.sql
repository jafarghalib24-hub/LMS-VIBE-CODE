-- Opsional tapi disarankan: indeks agar pencarian data tetap cepat saat data bertambah. Aman diulang.
create index if not exists enrollments_user_idx on public.enrollments (user_id);
create index if not exists enrollments_course_idx on public.enrollments (course_id);
create index if not exists modules_course_idx on public.modules (course_id, order_index);
create index if not exists lessons_module_idx on public.lessons (module_id, order_index);
create index if not exists lesson_progress_user_idx on public.lesson_progress (user_id);
create index if not exists tool_links_course_idx on public.tool_links (course_id);
create index if not exists prompt_library_copy_idx on public.prompt_library (copy_count desc);
