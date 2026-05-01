-- Δ26 후속: list_beta_applications + review_beta_application 의 OUT 파라미터·컬럼
-- 이름 충돌로 인한 ambiguous "id" / "status" 에러 근본 fix.
--
-- 원인: PL/pgSQL 의 RETURNS TABLE 컬럼 (id, status, invite_code 등) 은 OUT 파라미터로
-- declared 되어 함수 body 내부 SELECT 에서 base table 컬럼과 모호성을 일으킨다.
-- ba.id 처럼 fully qualified 해도 PostgreSQL 일부 버전에서 OUT param 이 우선 매칭되어
-- "column reference is ambiguous" 오류 발생.
--
-- 해결: PL/pgSQL #variable_conflict use_column directive 로 컬럼 우선 모드 강제.
-- 변수와 컬럼 이름이 같을 때 SQL 컬럼이 우선되어 모호성 사라짐.
--
-- 영향: admin 페이지 /admin/beta-applications 에서 신청자 목록 표시 + 승인/거부 RPC
-- 모두 즉시 정상 동작.

create or replace function public.list_beta_applications(
  p_status text default null,
  p_limit int default 100
)
returns table (
  id uuid,
  user_id uuid,
  motivation text,
  feedback_consent boolean,
  grade text,
  area text,
  practice_freq text,
  status text,
  applied_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid,
  review_comment text,
  invite_code text,
  user_email text
)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_caller uuid := auth.uid();
  v_caller_email text;
begin
  if v_caller is null then
    raise exception 'unauthenticated';
  end if;
  select au.email into v_caller_email from auth.users au where au.id = v_caller;
  if v_caller_email is null or v_caller_email <> 'phoodul@gmail.com' then
    raise exception 'forbidden';
  end if;

  return query
  select
    ba.id,
    ba.user_id,
    ba.motivation,
    ba.feedback_consent,
    ba.grade,
    ba.area,
    ba.practice_freq,
    ba.status,
    ba.applied_at,
    ba.reviewed_at,
    ba.reviewed_by,
    ba.review_comment,
    ba.invite_code,
    au.email
  from public.beta_applications ba
  left join auth.users au on au.id = ba.user_id
  where (p_status is null or ba.status = p_status)
  order by ba.applied_at desc
  limit p_limit;
end;
$$;

grant execute on function public.list_beta_applications(text, int) to authenticated;

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
  select au.email into v_caller_email from auth.users au where au.id = v_caller;
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

    insert into public.euler_beta_invites (user_id, status, invite_code)
    values (v_app_user_id, 'active', v_invite_code)
    on conflict (user_id) do update
      set status = 'active', invite_code = v_invite_code, invited_at = now();
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

grant execute on function public.review_beta_application(uuid, text, text) to authenticated;
