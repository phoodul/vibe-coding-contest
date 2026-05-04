-- D2 (16차 세션, 2026-05-04): euler_* 테이블 → legend_* rename + 데이터 폐기
--
-- 사용자 결정 (drop, A 옵션): 60명 추정 → 실제 2명 / 27 풀이 거의 본인+지인.
-- 깔끔히 새로 시작. 기존 schema 정의 (인덱스·RLS·trigger·FK) 는 ALTER RENAME 으로 보존,
-- 데이터만 TRUNCATE.

-- 1) 테이블 이름 변경 (모든 의존 객체는 PostgreSQL 이 자동 따라감)
alter table if exists public.euler_beta_invites rename to legend_beta_invites;
alter table if exists public.euler_solve_logs   rename to legend_solve_logs;

-- 2) 데이터 폐기 (FK 의존성 처리)
truncate public.legend_beta_invites, public.legend_solve_logs cascade;

-- 3) 함수 이름 변경 + 본문 갱신 (CREATE OR REPLACE 는 본문만 교체, RENAME 은 이름만 바꿈)
do $$
begin
  if exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'redeem_euler_beta'
  ) then
    execute 'alter function public.redeem_euler_beta(text) rename to redeem_legend_beta';
  end if;
end$$;

create or replace function public.redeem_legend_beta(p_code text)
returns table(status text, total integer)
language plpgsql
security definer
set search_path = public
as $function$
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
    select 1 from public.legend_beta_invites lbi
    where lbi.user_id = v_user and lbi.status = 'active'
  ) then
    return query select 'active'::text, (select count(*)::int from public.legend_beta_invites);
    return;
  end if;

  select count(*)::int into v_total
  from public.legend_beta_invites lbi
  where lbi.status = 'active';
  if v_total >= v_max then
    raise exception 'beta_full';
  end if;

  insert into public.legend_beta_invites (user_id, status, invite_code, expires_at)
  values (v_user, 'active', p_code, now() + interval '30 days')
  on conflict (user_id) do update
    set status = 'active', invited_at = now(), expires_at = now() + interval '30 days';

  return query select 'active'::text, (v_total + 1);
end;
$function$;

-- 4) review_beta_application 본문 갱신 (euler_beta_invites → legend_beta_invites)
create or replace function public.review_beta_application(
  p_application_id uuid,
  p_action text,
  p_comment text default null
)
returns table(id uuid, status text, invite_code text)
language plpgsql
security definer
set search_path = public
as $function$
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
    from public.legend_beta_invites lbi
    where lbi.status = 'active';
    if v_total >= v_max then
      raise exception 'beta_full';
    end if;

    v_new_status := 'approved';
    v_invite_code := 'BETA-' || substring(p_application_id::text, 1, 8);

    insert into public.legend_beta_invites (user_id, status, invite_code, expires_at)
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
$function$;
