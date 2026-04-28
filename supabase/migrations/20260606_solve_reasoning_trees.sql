-- Phase G-06 — Legend Tutor R1 추론 트리 (Δ4 ToT 시각화)
-- recursive-reasoner / alternatingChain trace 를 다중 부모 DAG 로 변환 저장.
-- session 1:1 (session_id unique) — depth_max / node_count / branching_factor 메트릭 동봉.
-- tree_jsonb: ReasoningTree { nodes, edges, root_id, conditions, schema_version } (src/lib/legend/types.ts source of truth).
-- architecture-g06-legend.md §3.3 그대로.

create table if not exists solve_reasoning_trees (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references legend_tutor_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  tree_jsonb jsonb not null,                     -- ReasoningTree { nodes, edges, root_id, conditions }
  depth_max smallint not null,                   -- 트리 최대 깊이
  node_count smallint not null,
  branching_factor real,                         -- 평균 자식 수
  generated_at timestamptz not null default now()
);

create index if not exists reasoning_trees_user_idx
  on solve_reasoning_trees(user_id, generated_at desc);

alter table solve_reasoning_trees enable row level security;

drop policy if exists "trees_read_own" on solve_reasoning_trees;
create policy "trees_read_own" on solve_reasoning_trees
  for select using (auth.uid() = user_id);

drop policy if exists "trees_upsert_own" on solve_reasoning_trees;
create policy "trees_upsert_own" on solve_reasoning_trees
  for all using (auth.uid() = user_id);
