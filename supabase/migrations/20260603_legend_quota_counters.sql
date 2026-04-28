-- Phase G-06 — Legend 5종 quota 통합 카운터 (Δ1)
-- 단일 테이블에 problem_total_daily / legend_call_daily / report_per_problem_daily
-- / weekly_report / monthly_report 5종 통합. 베타·유료 한도는 환경변수/plan lookup 으로 외부화.
-- period_start: KST 자정 기준 일/주(월요일)/월(1일) 시작일.
-- 동시성: increment_legend_quota RPC 가 atomic UPSERT 로 race 차단.
-- 자격 게이트: weekly ≥ 10 / monthly ≥ 20 누적 풀이 (get_lifetime_problem_count).
-- architecture-g06-legend.md §3.3 그대로.

create table if not exists legend_quota_counters (
  user_id uuid not null references auth.users(id) on delete cascade,
  quota_kind text not null check (quota_kind in (
    'problem_total_daily',      -- 하루 총 문제 입력 수
    'legend_call_daily',        -- 하루 Tier 2 호출 수 (튜터 변경 재호출 동일 소진)
    'report_per_problem_daily', -- 하루 R1 생성 수
    'weekly_report',            -- 주간 R2 (생성 시 +1, 자격 게이트: 누적 풀이 ≥ 10)
    'monthly_report'            -- 월간 R2 (생성 시 +1, 자격 게이트: 누적 풀이 ≥ 20)
  )),
  period_start date not null,   -- KST 자정 기준 일/주(월요일)/월(1일) 시작일
  count integer not null default 0,
  primary key (user_id, quota_kind, period_start)
);

create index if not exists legend_quota_period_idx
  on legend_quota_counters(period_start desc);

alter table legend_quota_counters enable row level security;

drop policy if exists "legend_quota_read_own" on legend_quota_counters;
create policy "legend_quota_read_own" on legend_quota_counters
  for select using (auth.uid() = user_id);

drop policy if exists "legend_quota_upsert_own" on legend_quota_counters;
create policy "legend_quota_upsert_own" on legend_quota_counters
  for all using (auth.uid() = user_id);

-- 동시성 안전: atomic UPSERT increment
create or replace function increment_legend_quota(
  p_user_id uuid, p_quota_kind text, p_period_start date
) returns integer language plpgsql as $$
declare
  new_count integer;
begin
  insert into legend_quota_counters(user_id, quota_kind, period_start, count)
    values (p_user_id, p_quota_kind, p_period_start, 1)
    on conflict (user_id, quota_kind, period_start)
    do update set count = legend_quota_counters.count + 1
    returning count into new_count;
  return new_count;
end;
$$;

-- 자격 게이트: 누적 풀이 수 조회 (legend_tutor_sessions distinct problem_hash)
-- weekly_report 자격: get_lifetime_problem_count >= 10
-- monthly_report 자격: get_lifetime_problem_count >= 20
create or replace function get_lifetime_problem_count(p_user_id uuid)
returns integer language sql stable as $$
  select count(distinct problem_hash)::integer
  from legend_tutor_sessions
  where user_id = p_user_id;
$$;
