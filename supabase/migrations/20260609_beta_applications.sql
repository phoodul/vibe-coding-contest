-- G06-27: 베타 신청·승인 시스템
-- Created: 2026-04-29
--
-- 기존 EULER2026 자동 승인 흐름 → 신청 → 관리자 승인 흐름 전환.
-- feedback_consent 필수 (CHECK), motivation 50자+ 강제 (CHECK).
-- 1 user 1 신청 (unique).
-- 승인 시 본 라우트에서 euler_beta_invites 자동 insert.

create table if not exists public.beta_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  motivation text not null check (length(motivation) >= 50),
  feedback_consent boolean not null check (feedback_consent = true),
  -- 선택 메타
  grade text,                  -- 학년 (middle1~high3 등 자유 텍스트)
  area text,                   -- 주 과목 (calculus / geometry / probability / ...)
  practice_freq text,          -- 풀이 빈도 (daily / weekly / occasional)
  -- 상태
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  applied_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  review_comment text,
  -- 승인 시 발급된 invite 코드
  invite_code text,
  -- 1 user 1 신청 (재신청 시 upsert)
  unique (user_id)
);

create index if not exists beta_apps_status_idx
  on public.beta_applications (status, applied_at desc);

alter table public.beta_applications enable row level security;

-- 본인 신청 read
drop policy if exists "beta_apps_read_own" on public.beta_applications;
create policy "beta_apps_read_own"
  on public.beta_applications for select
  using (auth.uid() = user_id);

-- 본인 신청 insert (upsert 시 update 도 허용)
drop policy if exists "beta_apps_insert_own" on public.beta_applications;
create policy "beta_apps_insert_own"
  on public.beta_applications for insert
  with check (auth.uid() = user_id);

drop policy if exists "beta_apps_update_own_pending" on public.beta_applications;
create policy "beta_apps_update_own_pending"
  on public.beta_applications for update
  using (auth.uid() = user_id and status = 'pending')
  with check (auth.uid() = user_id and status = 'pending');

-- 관리자 권한: profiles.role = 'admin' 기준이 아니라 admin email 화이트리스트 (기존 패턴).
-- 본 마이그레이션 시점엔 RLS 만 정의. admin 판정은 API 라우트 (ADMIN_EMAILS) 에서 SERVICE_ROLE 없이
-- 기존 admin 이메일 가드 + auth.uid() 일치 검증으로 통과. 관리자 본인이 자신 user_id 로 조회/승인 가능.
-- ※ 운영상 관리자는 별도 Supabase service role key 로 직접 접근 X.
-- ※ 본 RLS 는 본인 신청 read/insert 만 보장. 관리자 페이지는 ADMIN_EMAILS 가드 후 일반 anon 키로
--   admin email 의 auth.uid() 컨텍스트로 RPC 또는 raw query 가능 — 단, 다른 사용자 row 는 RLS 막힘.
-- 따라서 관리자 페이지는 SECURITY DEFINER RPC 로 우회.

-- SECURITY DEFINER RPC: 관리자 신청 목록 조회
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
declare
  v_caller uuid := auth.uid();
  v_caller_email text;
begin
  if v_caller is null then
    raise exception 'unauthenticated';
  end if;
  select email into v_caller_email from auth.users where id = v_caller;
  if v_caller_email is null or v_caller_email <> 'phoodul@gmail.com' then
    raise exception 'forbidden';
  end if;

  return query
  select
    ba.id, ba.user_id, ba.motivation, ba.feedback_consent,
    ba.grade, ba.area, ba.practice_freq,
    ba.status, ba.applied_at, ba.reviewed_at, ba.reviewed_by,
    ba.review_comment, ba.invite_code,
    au.email as user_email
  from public.beta_applications ba
  left join auth.users au on au.id = ba.user_id
  where (p_status is null or ba.status = p_status)
  order by ba.applied_at desc
  limit p_limit;
end;
$$;

grant execute on function public.list_beta_applications(text, int) to authenticated;

-- SECURITY DEFINER RPC: 관리자 승인/거부
create or replace function public.review_beta_application(
  p_application_id uuid,
  p_action text,           -- 'approve' | 'reject'
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
  select email into v_caller_email from auth.users where id = v_caller;
  if v_caller_email is null or v_caller_email <> 'phoodul@gmail.com' then
    raise exception 'forbidden';
  end if;

  if p_action not in ('approve', 'reject') then
    raise exception 'invalid_action';
  end if;

  select user_id into v_app_user_id from public.beta_applications where id = p_application_id;
  if v_app_user_id is null then
    raise exception 'not_found';
  end if;

  if p_action = 'approve' then
    -- 50명 cap 검사
    select count(*)::int into v_total from public.euler_beta_invites where status = 'active';
    if v_total >= v_max then
      raise exception 'beta_full';
    end if;

    v_new_status := 'approved';
    v_invite_code := 'BETA-' || substring(p_application_id::text, 1, 8);

    -- euler_beta_invites 자동 발급
    insert into public.euler_beta_invites (user_id, status, invite_code)
    values (v_app_user_id, 'active', v_invite_code)
    on conflict (user_id) do update
      set status = 'active', invite_code = v_invite_code, invited_at = now();
  else
    v_new_status := 'rejected';
    v_invite_code := null;
  end if;

  update public.beta_applications
  set
    status = v_new_status,
    reviewed_at = now(),
    reviewed_by = v_caller,
    review_comment = p_comment,
    invite_code = v_invite_code
  where id = p_application_id;

  return query
  select p_application_id, v_new_status, v_invite_code;
end;
$$;

grant execute on function public.review_beta_application(uuid, text, text) to authenticated;
