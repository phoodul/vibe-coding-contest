-- Δ28: 베타 사용자 30일 만료 정책.
-- 사용자 결정: "신청자가 승인을 받은 후 한 달간 무료로 사용".
--
-- 정책:
--   - 승인 시점부터 30일 동안 베타 권한 (5 거장 / 일 5문제 + 거장 일 3회 / R1·R2 등)
--   - 30일 후 자동 trial 강등 (라마누잔 일 3회만)
--   - 정원 50명 cap 은 그대로 (active 만 카운트)
--
-- 마이그레이션 항목:
--   1. euler_beta_invites.expires_at timestamptz 컬럼 추가
--   2. 기존 active 사용자 backfill: 오늘 + 30일 (legacy 보호 — 갑자기 잘림 방지)
--   3. expires_at 인덱스 (active row 만)
--   4. redeem_euler_beta RPC: 신규 redeem 시 expires_at = now() + 30 days
--   5. review_beta_application RPC: 승인 시 동일

alter table public.euler_beta_invites
  add column if not exists expires_at timestamptz;

update public.euler_beta_invites
set expires_at = now() + interval '30 days'
where status = 'active' and expires_at is null;

create index if not exists euler_beta_invites_expires_idx
  on public.euler_beta_invites (expires_at)
  where status = 'active';

-- redeem_euler_beta — EULER2026 코드 사용자
create or replace function public.redeem_euler_beta(p_code text)
returns table (status text, total int)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_user uuid := auth.uid();
  v_total int;
  v_max int := 50;
  v_valid_code text := 'EULER2026';
begin
  if v_user is null then
    raise exception 'unauthenticated';
  end if;

  if p_code is null or p_code <> v_valid_code then
    raise exception 'invalid_code';
  end if;

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

  insert into public.euler_beta_invites (user_id, status, invite_code, expires_at)
  values (v_user, 'active', p_code, now() + interval '30 days')
  on conflict (user_id) do update
    set status = 'active', invited_at = now(), expires_at = now() + interval '30 days';

  return query select 'active'::text, (v_total + 1);
end;
$$;

-- review_beta_application — admin 승인 흐름
create or replace function public.review_beta_application(
  p_application_id uuid,
  p_action text,
  p_comment text default null
)
returns table (
  id uuid,
  status text,
  invite_code text
)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_caller uuid := auth.uid();
  v_caller_email text;
  v_app_user_id uuid;
  v_new_status text;
  v_invite_code text;
  v_total int;
  v_max int := 50;
begin
  if v_caller is null then
    raise exception 'unauthenticated';
  end if;
  select au.email::text into v_caller_email from auth.users au where au.id = v_caller;
  if v_caller_email is null or v_caller_email <> 'phoodul@gmail.com' then
    raise exception 'forbidden';
  end if;

  if p_action not in ('approve', 'reject') then
    raise exception 'invalid_action';
  end if;

  select ba.user_id into v_app_user_id
  from public.beta_applications ba
  where ba.id = p_application_id;
  if v_app_user_id is null then
    raise exception 'not_found';
  end if;

  if p_action = 'approve' then
    select count(*)::int into v_total
    from public.euler_beta_invites ebi
    where ebi.status = 'active';
    if v_total >= v_max then
      raise exception 'beta_full';
    end if;

    v_new_status := 'approved';
    v_invite_code := 'BETA-' || substring(p_application_id::text, 1, 8);

    insert into public.euler_beta_invites (user_id, status, invite_code, expires_at)
    values (v_app_user_id, 'active', v_invite_code, now() + interval '30 days')
    on conflict (user_id) do update
      set status = 'active',
          invite_code = v_invite_code,
          invited_at = now(),
          expires_at = now() + interval '30 days';
  else
    v_new_status := 'rejected';
    v_invite_code := null;
  end if;

  update public.beta_applications ba
  set
    status = v_new_status,
    reviewed_at = now(),
    reviewed_by = v_caller,
    review_comment = p_comment,
    invite_code = v_invite_code
  where ba.id = p_application_id;

  return query
  select
    p_application_id as id,
    v_new_status as status,
    v_invite_code as invite_code;
end;
$$;

grant execute on function public.redeem_euler_beta(text) to authenticated;
grant execute on function public.review_beta_application(uuid, text, text) to authenticated;
