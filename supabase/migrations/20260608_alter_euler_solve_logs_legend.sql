-- Phase G-06 — euler_solve_logs 에 Legend 세션 연결(legend_session_id) + 튜터·tier 차원 추가
-- 기존 코드는 NULL 으로 무영향. 신규 풀이부터 채워짐.
-- 베타 사용자 50명 풀이 ~수백 건 보존 (legend_session_id IS NULL 로 구별 가능).
-- architecture-g06-legend.md §3.4 그대로. idempotent (add column if not exists).

alter table public.euler_solve_logs
  add column if not exists legend_session_id uuid references legend_tutor_sessions(id),
  add column if not exists tutor_name text,
  add column if not exists tier smallint check (tier in (0,1,2));

create index if not exists euler_logs_session_idx
  on public.euler_solve_logs(legend_session_id)
  where legend_session_id is not null;

comment on column public.euler_solve_logs.legend_session_id is
  'Legend orchestrator 세션 연결 — null 이면 G-06 이전 풀이 (베타 사용자 기존 데이터 보존)';
comment on column public.euler_solve_logs.tutor_name is
  'Legend 튜터 이름 — null 이면 G-06 이전 풀이 또는 가우스/오일러 토글 풀이';
comment on column public.euler_solve_logs.tier is
  'Legend tier — 0=ramanujan_calc, 1=ramanujan_intuit, 2=legend';
