-- Phase G-06 — Legend Tutor 라우팅 결정 로그
-- 3-Stage Adaptive Router 의 stage 0/1/2 결과 + 라우팅된 튜터·tier 기록.
-- problem_hash 단위로 같은 문제 multi-call 추적, user 별 시계열 조회.
-- architecture-g06-legend.md §3.3 그대로.

create table if not exists legend_routing_decisions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  problem_hash text not null,                    -- problem_text sha256 (중복 라우팅 캐시 키)
  stage_reached smallint not null check (stage_reached in (0,1,2)),
  stage0_similar_id uuid references similar_problems(id),
  stage0_similarity real,
  stage1_difficulty smallint check (stage1_difficulty between 1 and 6),
  stage1_confidence real check (stage1_confidence between 0 and 1),
  stage1_area text,
  stage2_probe_solved boolean,
  stage2_signals text[] not null default '{}',  -- ['sympy_fail','stuck_token']
  routed_tier smallint not null check (routed_tier in (0,1,2)),
  routed_tutor text not null check (routed_tutor in
    ('ramanujan_calc','ramanujan_intuit','gauss','von_neumann','euler','leibniz')),
  user_chose_escalation boolean,                -- null=미권유, true/false=권유 후 응답
  duration_ms integer,
  created_at timestamptz not null default now()
);

create index if not exists legend_routing_user_idx
  on legend_routing_decisions(user_id, created_at desc);
create index if not exists legend_routing_hash_idx
  on legend_routing_decisions(problem_hash);

alter table legend_routing_decisions enable row level security;

drop policy if exists "legend_routing_read_own" on legend_routing_decisions;
create policy "legend_routing_read_own" on legend_routing_decisions
  for select using (auth.uid() = user_id);

drop policy if exists "legend_routing_insert_own" on legend_routing_decisions;
create policy "legend_routing_insert_own" on legend_routing_decisions
  for insert with check (auth.uid() = user_id);
