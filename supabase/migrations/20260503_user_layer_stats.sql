-- Phase C-08: user_layer_stats — 사용자 8-Layer 별 막힘 패턴 집계
-- Created: 2026-04-26

create table if not exists public.user_layer_stats (
  user_id uuid not null references auth.users(id) on delete cascade,
  layer smallint not null check (layer between 1 and 8),
  area text not null,
  attempts integer not null default 0,
  successes integer not null default 0,
  stuck_count integer not null default 0,
  failure_count integer not null default 0,
  -- L6 세부 (사용자 정정: recall vs trigger 차별화)
  l6_recall_miss integer not null default 0,
  l6_trigger_miss integer not null default 0,
  l5_domain_miss integer not null default 0,
  last_failure_at timestamptz,
  failure_examples jsonb default '[]'::jsonb,
  primary key (user_id, layer, area)
);

create index if not exists user_layer_stats_user_idx on public.user_layer_stats(user_id);

alter table public.user_layer_stats enable row level security;

drop policy if exists "user_layer_stats_read_own" on public.user_layer_stats;
create policy "user_layer_stats_read_own"
  on public.user_layer_stats for select using (auth.uid() = user_id);

drop policy if exists "user_layer_stats_upsert_own" on public.user_layer_stats;
create policy "user_layer_stats_upsert_own"
  on public.user_layer_stats for all using (auth.uid() = user_id);
