-- Phase D-06: euler_family_settings — 부모 잠금 (lock_reveal)
-- Created: 2026-04-26
--
-- 단순 모델: 부모(parent_user_id) 가 자녀(user_id) 의 reveal 차단 토글.
-- 향후 가족 결제 (D-08) 와 연동.

create table if not exists public.euler_family_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  parent_user_id uuid references auth.users(id) on delete set null,
  lock_reveal boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.euler_family_settings enable row level security;

-- 본인 + 부모는 read 가능
drop policy if exists "family_settings_read" on public.euler_family_settings;
create policy "family_settings_read"
  on public.euler_family_settings for select
  using (auth.uid() = user_id or auth.uid() = parent_user_id);

-- 변경은 RPC 만
create or replace function public.set_family_lock_reveal(
  p_child_user_id uuid,
  p_lock boolean
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_parent uuid := auth.uid();
begin
  if v_parent is null then
    raise exception 'unauthenticated';
  end if;
  -- 자기 자신에 대한 토글은 허용 (성인 자율 잠금)
  -- 다른 사용자 잠금은 사전에 row 가 존재하고 parent_user_id 가 본인이어야 함
  if p_child_user_id <> v_parent then
    if not exists (
      select 1 from public.euler_family_settings
      where user_id = p_child_user_id and parent_user_id = v_parent
    ) then
      raise exception 'forbidden_or_not_linked';
    end if;
  end if;

  insert into public.euler_family_settings (user_id, parent_user_id, lock_reveal)
  values (p_child_user_id, case when p_child_user_id = v_parent then null else v_parent end, p_lock)
  on conflict (user_id) do update
    set lock_reveal = p_lock,
        updated_at = now()
    where euler_family_settings.user_id = excluded.user_id;
  return true;
end;
$$;

create or replace function public.link_family(
  p_child_user_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_parent uuid := auth.uid();
begin
  if v_parent is null then
    raise exception 'unauthenticated';
  end if;
  insert into public.euler_family_settings (user_id, parent_user_id, lock_reveal)
  values (p_child_user_id, v_parent, false)
  on conflict (user_id) do update
    set parent_user_id = v_parent, updated_at = now();
  return true;
end;
$$;

grant execute on function public.set_family_lock_reveal(uuid, boolean) to authenticated;
grant execute on function public.link_family(uuid) to authenticated;
