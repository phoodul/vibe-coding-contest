-- Δ27 fix: list_beta_applications 의 "structure of query does not match function
-- result type" 오류 해결.
--
-- 원인: RETURNS TABLE 의 user_email 컬럼은 text 인데, auth.users.email 의 실제 타입은
-- character varying (varchar). PostgreSQL strict 매칭에서 불일치 → 0 row 반환.
--
-- 해결: select au.email::text 로 명시 cast. v_caller_email 조회 시에도 동일.

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
  select au.email::text into v_caller_email from auth.users au where au.id = v_caller;
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
    au.email::text
  from public.beta_applications ba
  left join auth.users au on au.id = ba.user_id
  where (p_status is null or ba.status = p_status)
  order by ba.applied_at desc
  limit p_limit;
end;
$$;

grant execute on function public.list_beta_applications(text, int) to authenticated;
