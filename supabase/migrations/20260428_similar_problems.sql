-- Phase G-04 — similar_problems 인덱스
-- 백엔드 RAG 한정. 학생 화면 노출 0%. 풀이 본문은 저장하지 않음 (저작권/차별화).
-- 라벨 단위는 trigger 패턴 (Tool 의 본질은 trigger when, 정리 이름이 아님).

create extension if not exists vector;

create table if not exists similar_problems (
  id uuid primary key default gen_random_uuid(),
  year int not null,
  type text not null check (type in ('가형','나형','공통','미적분','기하','확률과통계')),
  number int not null check (number between 21 and 30),
  problem_latex text not null,
  problem_embedding vector(1536) not null,
  answer text not null,
  -- trigger_labels: [{direction:'forward'|'backward'|'both', condition_pattern?, goal_pattern?, why, tool_hint?}]
  trigger_labels jsonb not null default '[]'::jsonb,
  source text not null default 'haiku_auto'
    check (source in ('haiku_auto','developer','정석','해법서','beta_contributor','auto_mined')),
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(year, type, number)
);

create index if not exists similar_problems_embedding_idx
  on similar_problems using ivfflat (problem_embedding vector_cosine_ops) with (lists = 100);

create index if not exists similar_problems_year_type_idx
  on similar_problems (year, type, number);

-- Cosine top-k RPC
create or replace function match_similar_problems(
  query_embedding vector(1536),
  match_count int default 3
)
returns table (
  id uuid,
  year int,
  type text,
  number int,
  problem_latex text,
  answer text,
  trigger_labels jsonb,
  similarity real
)
language sql stable as $$
  select id, year, type, number, problem_latex, answer, trigger_labels,
    (1 - (problem_embedding <=> query_embedding))::real as similarity
  from similar_problems
  order by problem_embedding <=> query_embedding
  limit match_count;
$$;

-- RLS: 인증 사용자 read-only. write 는 service role 만 (RLS bypass).
alter table similar_problems enable row level security;

drop policy if exists "similar_problems_read_authenticated" on similar_problems;
create policy "similar_problems_read_authenticated" on similar_problems
  for select to authenticated using (true);

-- updated_at 자동 갱신 trigger
create or replace function set_similar_problems_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_similar_problems_updated_at on similar_problems;
create trigger trg_similar_problems_updated_at
  before update on similar_problems
  for each row execute function set_similar_problems_updated_at();
