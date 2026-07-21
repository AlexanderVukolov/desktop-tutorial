-- ============================================================
-- Закрытие доступа сотруднику («увольнение»)
-- Выполнить в Supabase → SQL Editor → New query → Run
-- (требует admin.sql — функцию public.is_admin())
-- ============================================================

alter table public.profiles add column if not exists is_active boolean default true;

-- Активен ли текущий пользователь
create or replace function public.is_active()
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce((select is_active from public.profiles where id = auth.uid()), true)
$$;

-- Заблокированный сотрудник теряет доступ к задачам на уровне базы
drop policy if exists "tasks_select" on public.tasks;
create policy "tasks_select" on public.tasks
  for select to authenticated using (public.is_active());

drop policy if exists "tasks_insert" on public.tasks;
create policy "tasks_insert" on public.tasks
  for insert to authenticated with check (auth.uid() = created_by and public.is_active());

drop policy if exists "tasks_update" on public.tasks;
create policy "tasks_update" on public.tasks
  for update to authenticated using (public.is_active());

drop policy if exists "tasks_delete" on public.tasks;
create policy "tasks_delete" on public.tasks
  for delete to authenticated using (public.is_active());

drop policy if exists "notif_insert" on public.notifications;
create policy "notif_insert" on public.notifications
  for insert to authenticated with check (public.is_active());
