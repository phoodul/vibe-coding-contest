-- Phase B-02: math_tool_triggers — 도구 × 트리거 곱집합 + 양방향 임베딩 인덱스
-- Created: 2026-04-26
--
-- 의존: 20260426_math_tools.sql

create table if not exists public.math_tool_triggers (
  id uuid primary key default gen_random_uuid(),
  tool_id text not null references public.math_tools(id) on delete cascade,
  direction text not null check (direction in ('forward', 'backward', 'both')),
  trigger_condition text not null,
  derived_fact text,
  goal_pattern text,
  required_premises text[] not null default '{}',
  why_text text not null,
  embedding_forward vector(1536),
  embedding_backward vector(1536),
  created_at timestamptz not null default now()
);

create index if not exists math_tool_triggers_tool_idx
  on public.math_tool_triggers(tool_id);
create index if not exists math_tool_triggers_direction_idx
  on public.math_tool_triggers(direction);

-- ivfflat 인덱스: lists=100 은 ~1만 row 까지 적정. 데이터 ≥ 50K 이후 lists 재조정 검토.
-- 인덱스 생성은 비어있는 테이블에서도 동작. 실데이터 적재 후 ANALYZE 권장.
create index if not exists math_tool_triggers_fwd_ann
  on public.math_tool_triggers
  using ivfflat (embedding_forward vector_cosine_ops) with (lists = 100);

create index if not exists math_tool_triggers_bwd_ann
  on public.math_tool_triggers
  using ivfflat (embedding_backward vector_cosine_ops) with (lists = 100);

alter table public.math_tool_triggers enable row level security;

drop policy if exists "math_tool_triggers_read" on public.math_tool_triggers;
create policy "math_tool_triggers_read"
  on public.math_tool_triggers for select
  using (auth.role() = 'authenticated');

drop policy if exists "math_tool_triggers_admin_write" on public.math_tool_triggers;
create policy "math_tool_triggers_admin_write"
  on public.math_tool_triggers for all
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');
