-- 22차 (2026-05-09) — Maestro 전용 테이블 (Maestro/Legend 완전 분리)
--
-- 사용자 결정: "Maestro 와 Legend 를 분리해. Maestro 에서도 각 과목별로 모두 분리해."
-- 이전 A5 SQL (20260506_maestro_subject_columns.sql) 은 legend_* 에 subject 컬럼 추가 방식.
-- 본 마이그레이션은 별도 maestro_* 테이블 신설로 명확한 분리.
--
-- 안전 원칙:
--   - DROP / RENAME 없음
--   - IF NOT EXISTS — 재실행 안전
--   - 기존 legend_* 테이블 무수정 (회귀 0)
--
-- 적용 방법 (사용자):
--   1. Supabase Dashboard → SQL Editor 에서 본 파일 내용 실행
--   2. 또는 supabase CLI: `supabase db push` (로컬 link 후)

-- ────────────────────────────────────────────────────────────────────────────
-- 1. maestro_tutor_sessions — 풀이 단위 누적
-- ────────────────────────────────────────────────────────────────────────────
-- 한 학생이 한 페르소나와 한 문제를 풀이한 단위. Legend 의 legend_tutor_sessions
-- 와 schema 유사하나 maestro 4 과목 (subject 컬럼 명시) + 페르소나 16 인물.
create table if not exists public.maestro_tutor_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,                      -- 'physics' | 'chemistry' | 'biology' | 'earth-science'
  tutor text not null,                        -- 16 maestro 페르소나 (wegener / pasteur / ...)
  problem_text text,                          -- 학생이 입력한 첫 user 메시지 (수능 메타 포함)
  exam_year int,                              -- 수능 기출 연도 (메타 파싱 결과, optional)
  exam_variant text,                          -- 'I' | 'II' (optional)
  exam_number int,                            -- 1~20 (optional)
  message_count int not null default 0,       -- 누적 turn 수 (user + assistant)
  has_image boolean not null default false,   -- multimodal 사용 여부
  first_response_at timestamptz,              -- 첫 assistant 응답 시각
  last_message_at timestamptz,                -- 마지막 메시지 시각
  created_at timestamptz not null default now()
);

-- 학생별 최근 활동 조회 (리포트 페이지)
create index if not exists idx_maestro_sessions_user_subject_created
  on public.maestro_tutor_sessions (user_id, subject, created_at desc);

-- 페르소나 분포 (리포트 차트)
create index if not exists idx_maestro_sessions_user_tutor
  on public.maestro_tutor_sessions (user_id, tutor);

-- ────────────────────────────────────────────────────────────────────────────
-- 2. maestro_summaries — 풀이 정리 결과 누적
-- ────────────────────────────────────────────────────────────────────────────
-- /api/maestro/build-summary 응답 누적. 학생이 "📝 풀이 정리 보기" 누른 순간만
-- 기록. 모든 풀이가 정리되지는 않음 — 학생 selective.
create table if not exists public.maestro_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid references public.maestro_tutor_sessions(id) on delete set null,
  subject text not null,
  tutor text not null,
  problem_text text not null,                 -- 정리 시점 첫 user 메시지 snapshot
  summary jsonb not null,                     -- key_concepts / solution_steps / pitfalls / next_practice / persona_takeaway
  created_at timestamptz not null default now()
);

create index if not exists idx_maestro_summaries_user_subject_created
  on public.maestro_summaries (user_id, subject, created_at desc);

-- ────────────────────────────────────────────────────────────────────────────
-- 3. RLS — 본인 데이터만 read/write 가능
-- ────────────────────────────────────────────────────────────────────────────
alter table public.maestro_tutor_sessions enable row level security;
alter table public.maestro_summaries enable row level security;

drop policy if exists "maestro_sessions_owner_select" on public.maestro_tutor_sessions;
create policy "maestro_sessions_owner_select"
  on public.maestro_tutor_sessions
  for select
  using (auth.uid() = user_id);

drop policy if exists "maestro_sessions_owner_insert" on public.maestro_tutor_sessions;
create policy "maestro_sessions_owner_insert"
  on public.maestro_tutor_sessions
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "maestro_sessions_owner_update" on public.maestro_tutor_sessions;
create policy "maestro_sessions_owner_update"
  on public.maestro_tutor_sessions
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "maestro_summaries_owner_select" on public.maestro_summaries;
create policy "maestro_summaries_owner_select"
  on public.maestro_summaries
  for select
  using (auth.uid() = user_id);

drop policy if exists "maestro_summaries_owner_insert" on public.maestro_summaries;
create policy "maestro_summaries_owner_insert"
  on public.maestro_summaries
  for insert
  with check (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 4. admin 통계용 view (RLS 우회 안 함 — admin 만 service_role 키로 read)
-- ────────────────────────────────────────────────────────────────────────────
-- 향후 /admin 대시보드에서 maestro 사용량 요약 시 사용. 본 commit 에서는 스키마만.
create or replace view public.maestro_subject_summary as
select
  subject,
  count(*) as total_sessions,
  count(distinct user_id) as distinct_users,
  count(distinct tutor) as distinct_tutors,
  sum(case when has_image then 1 else 0 end) as multimodal_sessions,
  max(created_at) as last_session_at
from public.maestro_tutor_sessions
group by subject;

comment on table public.maestro_tutor_sessions is
  '22차 — Maestro 풀이 단위. legend_tutor_sessions 와 분리.';
comment on table public.maestro_summaries is
  '22차 — Maestro 풀이 정리 (build-summary) 결과 누적.';
