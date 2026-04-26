-- Euler Tutor 2.0 — closed beta invite gate
-- Created: 2026-04-25 (A-14)
--
-- Test plan: see docs/qa/phase-a-checklist.md
-- Apply via: Supabase dashboard SQL editor OR `supabase db push`

create table if not exists public.euler_beta_invites (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null check (status in ('active', 'revoked')) default 'active',
  invite_code text not null,
  invited_at timestamptz not null default now()
);

alter table public.euler_beta_invites enable row level security;

-- 본인 invite row 만 조회 가능. insert/update/delete 는 RPC redeem_euler_beta 로만.
drop policy if exists "euler_beta_invites_select_self" on public.euler_beta_invites;
create policy "euler_beta_invites_select_self"
  on public.euler_beta_invites for select
  using (auth.uid() = user_id);

-- SECURITY DEFINER RPC: 코드 검증 + 50명 캡 + 본인 row 생성
create or replace function public.redeem_euler_beta(p_code text)
returns table (status text, total int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_total int;
  v_max int := 50;
  v_valid_code text := 'EULER2026'; -- 운영 시 변경. 코드 회전은 별도 마이그레이션
begin
  if v_user is null then
    raise exception 'unauthenticated';
  end if;

  if p_code is null or p_code <> v_valid_code then
    raise exception 'invalid_code';
  end if;

  -- 이미 redeem 한 사용자 (alias 로 fully-qualify — returns table(status,...) 와의 ambiguous 회피)
  if exists (
    select 1 from public.euler_beta_invites ebi
    where ebi.user_id = v_user and ebi.status = 'active'
  ) then
    return query select 'active'::text, (select count(*)::int from public.euler_beta_invites);
    return;
  end if;

  select count(*)::int into v_total
  from public.euler_beta_invites ebi
  where ebi.status = 'active';
  if v_total >= v_max then
    raise exception 'beta_full';
  end if;

  insert into public.euler_beta_invites (user_id, status, invite_code)
  values (v_user, 'active', p_code)
  on conflict (user_id) do update set status = 'active', invited_at = now();

  return query select 'active'::text, (v_total + 1);
end;
$$;

grant execute on function public.redeem_euler_beta(text) to authenticated;
