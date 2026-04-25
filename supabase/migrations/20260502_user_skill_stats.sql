-- Phase C-08: user_skill_stats — 도구별 약점 분석 집계
-- Created: 2026-04-26

create table if not exists public.user_skill_stats (
  user_id uuid not null references auth.users(id) on delete cascade,
  tool_id text not null references public.math_tools(id) on delete cascade,
  area text not null,
  attempts integer not null default 0,
  successes integer not null default 0,
  last_used_at timestamptz,
  primary key (user_id, tool_id)
);

create index if not exists user_skill_stats_area_idx
  on public.user_skill_stats(user_id, area);

alter table public.user_skill_stats enable row level security;

drop policy if exists "user_skill_stats_read_own" on public.user_skill_stats;
create policy "user_skill_stats_read_own"
  on public.user_skill_stats for select using (auth.uid() = user_id);

drop policy if exists "user_skill_stats_upsert_own" on public.user_skill_stats;
create policy "user_skill_stats_upsert_own"
  on public.user_skill_stats for all using (auth.uid() = user_id);
