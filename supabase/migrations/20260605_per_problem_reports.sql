-- Phase G-06 — Legend Tutor R1 (Per-Problem Report) 캐시 테이블
-- session 당 1회 생성 후 재사용 (session_id unique).
-- report_jsonb: PerProblemReport schema (architecture §5).
-- 학생 인터랙션: expanded_steps / expanded_triggers 누적 (lazy update).
-- expansion_trigger_ids: 같은 trigger 다른 도구 추천 캐시.
-- architecture-g06-legend.md §3.3 그대로.

create table if not exists per_problem_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null references legend_tutor_sessions(id) on delete cascade,
  problem_hash text not null,
  report_jsonb jsonb not null,                   -- PerProblemReport (섹션 5 schema)
  expansion_trigger_ids uuid[] not null default '{}', -- 같은 trigger 다른 도구 추천
  -- 캐시 정책: report 는 한 session 당 1회 생성 후 재사용
  generated_at timestamptz not null default now(),
  -- 학생 인터랙션 (리포트 진입 후 어떤 카드를 펼쳤는지)
  expanded_steps smallint[] not null default '{}',
  expanded_triggers uuid[] not null default '{}'
);

create unique index if not exists per_problem_reports_session_uniq
  on per_problem_reports(session_id);
create index if not exists per_problem_reports_user_idx
  on per_problem_reports(user_id, generated_at desc);

alter table per_problem_reports enable row level security;

drop policy if exists "reports_read_own" on per_problem_reports;
create policy "reports_read_own" on per_problem_reports
  for select using (auth.uid() = user_id);

drop policy if exists "reports_upsert_own" on per_problem_reports;
create policy "reports_upsert_own" on per_problem_reports
  for all using (auth.uid() = user_id);
