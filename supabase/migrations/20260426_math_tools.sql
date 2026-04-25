-- Phase B-01: pgvector 활성화 + math_tools 도구 마스터 테이블
-- Created: 2026-04-26
--
-- 적용: Supabase 대시보드 SQL editor 또는 `supabase db push`
-- 주의: admin RLS 정책은 JWT custom claim 'role'='admin' 을 가정.
--   운영 시 Supabase Auth Hooks 또는 service_role 로 라벨링 필요.

create extension if not exists vector;

create table if not exists public.math_tools (
  id text primary key,                       -- 'MVT_basic', 'CHAIN_RULE_basic'
  name text not null,                        -- '평균값 정리 (기본)'
  knowledge_layer smallint not null check (knowledge_layer between 1 and 6),
  formula_latex text not null,
  prerequisites text[] not null default '{}',
  source text not null,                      -- 'parametric' | 'curated' | 'external' | 'user'
  source_meta jsonb not null default '{}'::jsonb,
  tool_weight real not null default 1.0,
  hit_count integer not null default 0,
  success_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists math_tools_layer_idx on public.math_tools(knowledge_layer);
create index if not exists math_tools_source_idx on public.math_tools(source);

alter table public.math_tools enable row level security;

drop policy if exists "math_tools_read" on public.math_tools;
create policy "math_tools_read"
  on public.math_tools for select
  using (auth.role() = 'authenticated');

drop policy if exists "math_tools_admin_write" on public.math_tools;
create policy "math_tools_admin_write"
  on public.math_tools for all
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

-- 자동 updated_at 트리거 (idempotent)
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists math_tools_updated_at on public.math_tools;
create trigger math_tools_updated_at
  before update on public.math_tools
  for each row execute function public.set_updated_at();
