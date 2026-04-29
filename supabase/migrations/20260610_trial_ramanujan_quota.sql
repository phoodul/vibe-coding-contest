-- Phase G-06 G06-32 (Δ9) — Trial Ramanujan Quota 추가
--
-- 비-베타 (체험판) 사용자에게 라마누잔 일 3회 호출을 허용하기 위해
-- legend_quota_counters CHECK constraint 에 'trial_ramanujan_daily' 추가.
--
-- 기존 5종 quota_kind 그대로 유지 + 신규 1종 추가 (총 6종).
-- DROP+ADD 패턴으로 안전하게 enum 확장. 기존 row 무파괴.
--
-- 베이스 문서: docs/project-decisions.md Δ9

alter table public.legend_quota_counters
  drop constraint if exists legend_quota_counters_quota_kind_check;

alter table public.legend_quota_counters
  add constraint legend_quota_counters_quota_kind_check
  check (quota_kind in (
    'problem_total_daily',       -- 베타: 하루 총 문제 입력 수
    'legend_call_daily',         -- 베타: 하루 Tier 2 호출 수
    'report_per_problem_daily',  -- 베타: 하루 R1 생성 수
    'weekly_report',             -- 베타: 주간 R2 (자격 게이트 ≥ 10)
    'monthly_report',            -- 베타: 월간 R2 (자격 게이트 ≥ 20)
    'trial_ramanujan_daily'      -- ⭐ 신규 (Δ9): 비-베타 라마누잔 일 3회
  ));
