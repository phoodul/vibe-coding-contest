-- Phase G-04 G04-9: 자체 학습 trigger mining 큐
-- 운영 중 풀이 로그(euler_solve_logs) 에서 발동된 trigger 패턴을 자동 발굴.
-- occurrence_count 임계값 (기본 5) 도달 시 admin 검수 큐로 승격.
-- 승인 시 source='auto_mined' 로 math_tool_triggers 에 머지.

create table if not exists candidate_triggers (
  id uuid primary key default gen_random_uuid(),
  tool_id text not null references math_tools(id) on delete cascade,
  direction text not null check (direction in ('forward','backward','both')),
  condition_pattern text,
  goal_pattern text,
  why text not null,
  embedding vector(1536),
  source_log_ids uuid[] not null default '{}'::uuid[],
  occurrence_count int not null default 1,
  similarity_to_existing real, -- 가장 유사한 기존 trigger 와의 cosine
  status text not null default 'mining'
    check (status in ('mining','pending_review','approved','rejected')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists candidate_triggers_status_idx
  on candidate_triggers (status, occurrence_count desc);

create index if not exists candidate_triggers_tool_idx
  on candidate_triggers (tool_id);

create index if not exists candidate_triggers_embedding_idx
  on candidate_triggers using ivfflat (embedding vector_cosine_ops) with (lists = 50)
  where embedding is not null;

-- updated_at 자동
create or replace function set_candidate_triggers_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists trg_candidate_triggers_updated_at on candidate_triggers;
create trigger trg_candidate_triggers_updated_at
  before update on candidate_triggers
  for each row execute function set_candidate_triggers_updated_at();

-- RLS — service role 만 쓰기, 인증 사용자 read
alter table candidate_triggers enable row level security;

drop policy if exists "candidate_triggers_read_authenticated" on candidate_triggers;
create policy "candidate_triggers_read_authenticated" on candidate_triggers
  for select to authenticated using (true);
