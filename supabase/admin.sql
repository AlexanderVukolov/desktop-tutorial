-- ============================================================
-- Права администратора задачника NSL
-- Выполнить в Supabase → SQL Editor → New query → Run
-- Администратор: liga.nutriciologi@yandex.ru
-- ============================================================

-- Признак администратора в профиле
alter table public.profiles add column if not exists is_admin boolean default false;

-- Функция проверки (security definer — без рекурсии политик)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false)
$$;

-- Администратор может править профили всех сотрудников
drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin" on public.profiles
  for update to authenticated using (public.is_admin());

-- Выдать права администратора (если аккаунт уже зарегистрирован)
update public.profiles
  set is_admin = true
  where lower(email) = 'liga.nutriciologi@yandex.ru';

-- И автоматически выдавать при будущей регистрации этого email
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, dept, role, is_admin)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data ->> 'dept',
    coalesce(new.raw_user_meta_data ->> 'role', 'Сотрудник'),
    lower(new.email) = 'liga.nutriciologi@yandex.ru'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
