-- ============================================================
-- Время дедлайна задачи (в дополнение к дате)
-- Выполнить в Supabase → SQL Editor → New query → Run
-- ============================================================

alter table public.tasks add column if not exists due_time text;
