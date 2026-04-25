-- Phase B-03: candidate_tools — Tier 1 자동 보고 + Tier 2 검수 큐
-- Created: 2026-04-26

create table if not exists public.candidate_tools (
  id uuid primary key default gen_random_uuid(),
  proposed_name text not null,
  proposed_formula_latex text,
  proposed_layer smallint check (proposed_layer between 1 and 6),
  proposed_why text,
  proposed_trigger text,
  occurrence_count integer not null default 1,
  source_problem_keys text[] not null default '{}',
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'merged')),
  merged_into_tool_id text references public.math_tools(id),
  reported_by uuid references auth.users(id),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists candidate_tools_status_idx on public.candidate_tools(status);
create index if not exists candidate_tools_count_idx
  on public.candidate_tools(occurrence_count desc);

alter table public.candidate_tools enable row level security;

drop policy if exists "candidate_tools_read_own_or_admin" on public.candidate_tools;
create policy "candidate_tools_read_own_or_admin"
  on public.candidate_tools for select
  using (auth.uid() = reported_by or auth.jwt() ->> 'role' = 'admin');

drop policy if exists "candidate_tools_insert_self" on public.candidate_tools;
create policy "candidate_tools_insert_self"
  on public.candidate_tools for insert
  with check (auth.uid() = reported_by);

drop policy if exists "candidate_tools_admin_update" on public.candidate_tools;
create policy "candidate_tools_admin_update"
  on public.candidate_tools for update
  using (auth.jwt() ->> 'role' = 'admin');
