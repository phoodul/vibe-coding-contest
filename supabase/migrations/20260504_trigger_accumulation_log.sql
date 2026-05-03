-- Phase 0 P0-02 (2026-05-04): Trigger 자동 누적 observability
--
-- 배경: src/lib/legend/trigger-accumulator.ts 의 accumulateTrigger 함수는
-- 모든 단계가 silent (console.warn) 으로 처리됨. production 환경에서 베타
-- 5명 확장 시 누적이 정상 동작하는지 추적 불가능.
--
-- 해결: 매 호출마다 outcome / matched_id / problem_hash / similarity / 에러를
-- 별도 테이블에 적재하여 admin 대시보드에서 시각화 + 디버깅 가능.
--
-- silent 정책 유지: 적재 실패해도 학생 응답 영향 없음 (best-effort).

create table if not exists public.legend_trigger_accumulation_log (
  id uuid primary key default gen_random_uuid(),
  outcome text not null check (outcome in (
    'matched_existing_trigger',
    'bumped_candidate',
    'promoted_candidate',
    'new_candidate_trigger',
    'new_candidate_tool',
    'skipped',
    'failed'
  )),
  matched_id uuid,                          -- existing trigger_id / candidate_trigger_id / candidate_tool_id
  cue_a text,                                -- 원본 cue (검색·디버깅용, 240자 cap)
  tool_b text,                               -- 원본 tool 이름 (60자 cap)
  similarity real,                           -- cosine 매칭 점수 (있을 때만)
  user_id uuid references auth.users(id) on delete set null,
  problem_hash text,                         -- session.problem_hash 추적
  detail text,                               -- 에러 또는 부가 정보
  created_at timestamptz not null default now()
);

create index if not exists trigger_accum_log_created_idx
  on public.legend_trigger_accumulation_log (created_at desc);

create index if not exists trigger_accum_log_outcome_idx
  on public.legend_trigger_accumulation_log (outcome, created_at desc);

create index if not exists trigger_accum_log_user_idx
  on public.legend_trigger_accumulation_log (user_id, created_at desc)
  where user_id is not null;

-- RLS: service role 만 insert (server-side accumulator), admin 만 read.
alter table public.legend_trigger_accumulation_log enable row level security;

-- 인증된 사용자(베타·관리자) read 허용 — admin UI 에서 시각화 위함.
-- 민감 정보 없음 (cue/tool 짧은 cap, user_id 는 set null on cascade).
drop policy if exists "trigger_accum_log_read_authenticated" on public.legend_trigger_accumulation_log;
create policy "trigger_accum_log_read_authenticated"
  on public.legend_trigger_accumulation_log
  for select to authenticated using (true);

-- 통계 RPC: 최근 N일의 outcome 분포 + 누적 추이.
create or replace function public.get_trigger_accumulation_stats(days_back int default 7)
returns json language sql stable as $$
  with bounded as (
    select *
    from public.legend_trigger_accumulation_log
    where created_at >= now() - (days_back || ' days')::interval
  )
  select json_build_object(
    'total', (select count(*) from bounded),
    'days_back', days_back,
    'outcome_distribution', coalesce(
      (select json_object_agg(outcome, cnt)
        from (
          select outcome, count(*) as cnt
          from bounded
          group by outcome
        ) t),
      '{}'::json
    ),
    'daily_total', coalesce(
      (select json_agg(json_build_object('day', day, 'count', cnt) order by day)
        from (
          select date_trunc('day', created_at) as day, count(*) as cnt
          from bounded
          group by date_trunc('day', created_at)
        ) d),
      '[]'::json
    ),
    'unique_users', (select count(distinct user_id) from bounded where user_id is not null)
  );
$$;

grant execute on function public.get_trigger_accumulation_stats(int) to authenticated;
