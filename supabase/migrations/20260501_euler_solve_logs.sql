-- Phase C-06: euler_solve_logs — 풀이 이력
-- Created: 2026-04-26
-- 의존: 없음 (auth.users만 의존)

create table if not exists public.euler_solve_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  problem_text text not null,
  problem_image_url text,
  problem_key text,
  area text,
  difficulty smallint check (difficulty between 1 and 6),
  input_mode text check (input_mode in ('text', 'photo', 'handwrite', 'voice')),
  tutor_persona text check (tutor_persona in ('euler', 'gauss')),
  tools_used text[] not null default '{}',
  reasoner_path jsonb,
  step_summary jsonb,
  stuck_layer smallint check (stuck_layer between 1 and 8),
  stuck_reason text,
  critic_passed boolean,
  critic_attempts integer not null default 0,
  final_answer text,
  user_answer text,
  is_correct boolean,
  reveal_used boolean not null default false,
  duration_ms integer,
  created_at timestamptz not null default now()
);

create index if not exists euler_logs_user_idx on public.euler_solve_logs(user_id, created_at desc);
create index if not exists euler_logs_area_idx on public.euler_solve_logs(area);
create index if not exists euler_logs_correct_idx on public.euler_solve_logs(is_correct);

alter table public.euler_solve_logs enable row level security;

drop policy if exists "euler_logs_read_own" on public.euler_solve_logs;
create policy "euler_logs_read_own"
  on public.euler_solve_logs for select
  using (auth.uid() = user_id);

drop policy if exists "euler_logs_insert_own" on public.euler_solve_logs;
create policy "euler_logs_insert_own"
  on public.euler_solve_logs for insert
  with check (auth.uid() = user_id);
