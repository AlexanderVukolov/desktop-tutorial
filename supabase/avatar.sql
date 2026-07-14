-- ============================================================
-- Фото профиля сотрудника
-- Выполнить в Supabase → SQL Editor → New query → Run
-- ============================================================

alter table public.profiles add column if not exists avatar_url text;
