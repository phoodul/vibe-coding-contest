-- 19차 (2026-05-06) — Maestro 4 과목 일반화: legend_* 테이블에 subject 컬럼 추가
--
-- 배경:
--   Legend Tutor (수학) 인프라를 Physics / Chemistry / Biology / Earth Science Maestro 로
--   일반화. 기존 모든 row 는 default 'math' = Legend = math maestro adapter.
--   향후 Korean (Phase 5+) / English (Phase 5+) 도 동일 컬럼으로 식별.
--
-- 안전 원칙:
--   - DROP / RENAME 없음 (D2 사고 회피)
--   - IF NOT EXISTS — 재실행 안전
--   - default 'math' = 기존 row 자동 채움 (회귀 0)
--   - CHECK 제약 없음 (TS Subject type 으로 검증)

-- 1. 라우팅 결정 (Stage 0/1/2 결과)
alter table public.legend_routing_decisions
  add column if not exists subject text not null default 'math';

-- 2. 튜터 세션 (대화 단위)
alter table public.legend_tutor_sessions
  add column if not exists subject text not null default 'math';

-- 3. Quota 카운터 (5종 quota — 일/월 한도)
alter table public.legend_quota_counters
  add column if not exists subject text not null default 'math';

-- 4. 베타 초대 (30일 만료)
alter table public.legend_beta_invites
  add column if not exists subject text not null default 'math';

-- 5. 풀이 로그 (per-problem report 베이스)
alter table public.legend_solve_logs
  add column if not exists subject text not null default 'math';

-- 6. trigger 누적 로그 (15차 P0-02 observability)
alter table public.legend_trigger_accumulation_log
  add column if not exists subject text not null default 'math';

-- 7. 가족 설정 (선택)
alter table public.legend_family_settings
  add column if not exists subject text not null default 'math';

-- 인덱스 — user_id + subject 조합 빈번 쿼리 (per-user-per-subject quota / log)
create index if not exists legend_quota_counters_user_subject_idx
  on public.legend_quota_counters (user_id, subject);

create index if not exists legend_solve_logs_user_subject_idx
  on public.legend_solve_logs (user_id, subject);

create index if not exists legend_trigger_accumulation_log_subject_created_idx
  on public.legend_trigger_accumulation_log (subject, created_at desc);

-- 검증 쿼리 (적용 후 수동 실행):
-- select 'legend_routing_decisions' as t, count(*) c, count(*) filter (where subject = 'math') math
--   from legend_routing_decisions
-- union all
-- select 'legend_tutor_sessions',     count(*), count(*) filter (where subject = 'math')
--   from legend_tutor_sessions
-- ... (각 테이블 동일);
-- → 모든 row 가 subject='math' 여야 함 (회귀 0 검증)
