-- Phase G-06 — Legend Tutor R1 step 분해 + LLM struggle (Δ3)
-- chain step → trigger 1:1/1:N 매핑 + 학생 막힘 신호 + LLM 자체 struggle 신호 기록.
-- 학생 user_stuck_ms / user_revisit_count 2 컬럼 + LLM struggle 5 컬럼 (Δ3).
-- step_kind 8 종 (parse / domain_id / forward / backward / tool_call / computation / verify / answer).
-- pivotal step 마킹: 가장 어려운 단계.
-- architecture-g06-legend.md §3.3 그대로.

create table if not exists solve_step_decomposition (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references legend_tutor_sessions(id) on delete cascade,
  euler_log_id uuid references euler_solve_logs(id),  -- 기존 로그와 연결
  step_index smallint not null,                  -- 0-based
  step_kind text not null check (step_kind in
    ('parse','domain_id','forward','backward','tool_call','computation','verify','answer')),
  step_summary text not null,                    -- 학생 친화 1줄 요약
  trigger_id uuid references math_tool_triggers(id),
  tool_id text references math_tools(id),
  difficulty smallint check (difficulty between 1 and 6),
  is_pivotal boolean not null default false,     -- "가장 어려운 단계" 마킹
  time_ms integer,                               -- 이 step 소요 시간
  -- 학생 막힘 추적
  user_stuck_ms integer,                         -- 학생 입력 정지 시간
  user_revisit_count smallint not null default 0,-- 학생이 이 step 재조회 횟수
  -- LLM struggle 추적 (Δ3)
  llm_turns_at_step smallint,                    -- 이 step 도달까지 agentic turn 수
  llm_tool_retries smallint not null default 0,  -- 이 step에서 tool 재호출 횟수
  llm_reasoning_chars integer,                   -- 이 step의 reasoning 길이
  llm_step_ms integer,                           -- 이 step 처리에 LLM이 소요한 ms
  llm_resolution_text text,                      -- "어떻게 해결했나" 1~2문장 (Haiku 요약)
  created_at timestamptz not null default now()
);

create index if not exists step_decomp_session_idx
  on solve_step_decomposition(session_id, step_index);
create index if not exists step_decomp_trigger_idx
  on solve_step_decomposition(trigger_id);

alter table solve_step_decomposition enable row level security;

drop policy if exists "step_decomp_read_own" on solve_step_decomposition;
create policy "step_decomp_read_own" on solve_step_decomposition
  for select using (
    exists(select 1 from legend_tutor_sessions s where s.id = session_id and s.user_id = auth.uid())
  );

drop policy if exists "step_decomp_insert_own" on solve_step_decomposition;
create policy "step_decomp_insert_own" on solve_step_decomposition
  for insert with check (
    exists(select 1 from legend_tutor_sessions s where s.id = session_id and s.user_id = auth.uid())
  );
