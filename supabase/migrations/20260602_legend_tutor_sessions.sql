-- Phase G-06 — Legend Tutor 세션 (1 problem ↔ N tutor calls)
-- 라우팅 후 호출된 튜터별 세션. problem_hash 그룹핑으로 second_opinion / retry 추적.
-- trace_jsonb 에 agentic 5step turn + tool_use raw 저장 (R1 step-decomposer 입력).
-- architecture-g06-legend.md §3.3 그대로.

create table if not exists legend_tutor_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  routing_decision_id uuid references legend_routing_decisions(id),
  problem_hash text not null,                    -- 같은 문제 multi-tutor 호출 그룹핑
  tutor_name text not null check (tutor_name in
    ('ramanujan_calc','ramanujan_intuit','gauss','von_neumann','euler','leibniz')),
  tier smallint not null check (tier in (0,1,2)),
  call_kind text not null default 'primary'
    check (call_kind in ('primary','second_opinion','retry')),
  model_id text not null,                        -- 'claude-opus-4-7-20260201' 등
  mode text not null check (mode in ('baseline','agentic_5step','calc_haiku')),
  trace_jsonb jsonb,                             -- agentic turns + tool calls (raw)
  final_answer text,
  is_correct boolean,
  duration_ms integer,
  created_at timestamptz not null default now()
);

create index if not exists legend_sessions_problem_idx
  on legend_tutor_sessions(problem_hash, user_id);
create index if not exists legend_sessions_user_idx
  on legend_tutor_sessions(user_id, created_at desc);

alter table legend_tutor_sessions enable row level security;

drop policy if exists "legend_sessions_read_own" on legend_tutor_sessions;
create policy "legend_sessions_read_own" on legend_tutor_sessions
  for select using (auth.uid() = user_id);

drop policy if exists "legend_sessions_insert_own" on legend_tutor_sessions;
create policy "legend_sessions_insert_own" on legend_tutor_sessions
  for insert with check (auth.uid() = user_id);
