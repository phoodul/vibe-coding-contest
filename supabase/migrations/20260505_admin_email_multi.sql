-- Admin email 다중화 — Google(@gmail.com) / Kakao(@daum.net) 어느 provider 로 로그인하든
-- 동일 admin 권한 부여. 5 RPC 의 hardcode 'phoodul@gmail.com' 을 화이트리스트 helper 호출로 교체.
--
-- Why: Supabase Auth 는 OAuth provider 별로 별도 user 생성. 본인 Google 계정은
--      phoodul@gmail.com, Kakao 계정은 phoodul@daum.net 이라 이메일 일치 자동 link 가
--      작동 안 해 Kakao 로그인 시 admin 가드 거부 (Legend 베타 입장도 trial 강등).
-- Approach: TS 14곳 isAdminEmail() 외부화 + 본 마이그레이션은 SQL 측 화이트리스트 통일.
--
-- 적용 대상 RPC:
--   1. is_admin()                       (existing helper, JWT email)
--   2. approve_candidate_tool           (candidate_review_rpc)
--   3. reject_candidate_tool            (candidate_review_rpc)
--   4. list_beta_applications           (G06-27)
--   5. review_beta_application          (G06-27, beta approve/reject)

-- ──────────────────────────────────────────────────────────────────────
-- 1. 화이트리스트 helper (text 인자)
-- ──────────────────────────────────────────────────────────────────────
create or replace function public.is_admin_email(p_email text)
returns boolean
language sql
immutable
as $$
  select p_email is not null
    and lower(p_email) in ('phoodul@gmail.com', 'phoodul@daum.net');
$$;

grant execute on function public.is_admin_email(text) to authenticated, anon;

-- ──────────────────────────────────────────────────────────────────────
-- 2. is_admin() — JWT email 을 helper 로 위임
-- ──────────────────────────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select public.is_admin_email(auth.jwt() ->> 'email');
$$;

-- ──────────────────────────────────────────────────────────────────────
-- 3. approve_candidate_tool — admin 검사 helper 호출
-- ──────────────────────────────────────────────────────────────────────
create or replace function public.approve_candidate_tool(
  p_id uuid,
  p_tool_id text,
  p_layer smallint default null,
  p_formula_latex text default null
)
returns text
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_email text := auth.jwt() ->> 'email';
  v_candidate record;
begin
  if not public.is_admin_email(v_email) then
    raise exception 'forbidden';
  end if;

  select * into v_candidate from public.candidate_tools where id = p_id and status = 'pending';
  if not found then
    raise exception 'candidate_not_found';
  end if;

  insert into public.math_tools (
    id, name, knowledge_layer, formula_latex, source, source_meta
  ) values (
    p_tool_id,
    v_candidate.proposed_name,
    coalesce(p_layer, v_candidate.proposed_layer, 6),
    coalesce(p_formula_latex, v_candidate.proposed_formula_latex, ''),
    'curated',
    jsonb_build_object('tier', 2, 'candidate_id', p_id)
  )
  on conflict (id) do nothing;

  update public.candidate_tools
  set status = 'merged',
      merged_into_tool_id = p_tool_id,
      reviewed_by = auth.uid(),
      reviewed_at = now()
  where id = p_id;

  return p_tool_id;
end;
$function$;

-- ──────────────────────────────────────────────────────────────────────
-- 4. reject_candidate_tool
-- ──────────────────────────────────────────────────────────────────────
create or replace function public.reject_candidate_tool(p_id uuid)
returns boolean
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_email text := auth.jwt() ->> 'email';
begin
  if not public.is_admin_email(v_email) then
    raise exception 'forbidden';
  end if;

  update public.candidate_tools
  set status = 'rejected',
      reviewed_by = auth.uid(),
      reviewed_at = now()
  where id = p_id and status = 'pending';

  return found;
end;
$function$;

-- ──────────────────────────────────────────────────────────────────────
-- 5. list_beta_applications
-- ──────────────────────────────────────────────────────────────────────
create or replace function public.list_beta_applications(
  p_status text default null,
  p_limit integer default 100
)
returns table(
  id uuid,
  user_id uuid,
  motivation text,
  feedback_consent boolean,
  grade text,
  area text,
  practice_freq text,
  status text,
  applied_at timestamp with time zone,
  reviewed_at timestamp with time zone,
  reviewed_by uuid,
  review_comment text,
  invite_code text,
  user_email text
)
language plpgsql
security definer
set search_path to 'public'
as $function$
#variable_conflict use_column
declare
  v_caller uuid := auth.uid();
  v_caller_email text;
begin
  if v_caller is null then
    raise exception 'unauthenticated';
  end if;
  select au.email::text into v_caller_email from auth.users au where au.id = v_caller;
  if not public.is_admin_email(v_caller_email) then
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
$function$;

-- ──────────────────────────────────────────────────────────────────────
-- 6. review_beta_application
-- ──────────────────────────────────────────────────────────────────────
create or replace function public.review_beta_application(
  p_application_id uuid,
  p_action text,
  p_comment text default null
)
returns table(id uuid, status text, invite_code text)
language plpgsql
security definer
set search_path to 'public'
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
  if not public.is_admin_email(v_caller_email) then
    raise exception 'forbidden';
  end if;
  if p_action not in ('approve', 'reject') then
    raise exception 'invalid_action';
  end if;

  select ba.user_id into v_app_user_id from public.beta_applications ba where ba.id = p_application_id;
  if v_app_user_id is null then
    raise exception 'not_found';
  end if;

  if p_action = 'approve' then
    select count(*)::int into v_total from public.legend_beta_invites lbi where lbi.status = 'active';
    if v_total >= v_max then
      raise exception 'beta_full';
    end if;

    v_new_status := 'approved';
    v_invite_code := 'BETA-' || substring(p_application_id::text, 1, 8);

    insert into public.legend_beta_invites (user_id, status, invite_code, expires_at)
    values (v_app_user_id, 'active', v_invite_code, now() + interval '30 days')
    on conflict (user_id) do update
      set status = 'active', invite_code = v_invite_code, invited_at = now(), expires_at = now() + interval '30 days';
  else
    v_new_status := 'rejected';
    v_invite_code := null;
  end if;

  update public.beta_applications ba
  set status = v_new_status, reviewed_at = now(), reviewed_by = v_caller, review_comment = p_comment, invite_code = v_invite_code
  where ba.id = p_application_id;

  return query select p_application_id as id, v_new_status as status, v_invite_code as invite_code;
end;
$function$;
