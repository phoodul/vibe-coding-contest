-- Phase G-03: euler_solve_logs 에 Recursive Chain 종료 사유 추적 컬럼 추가
-- Created: 2026-04-27 Night
-- 목적: chain miss 패턴 (dead_end / cycle / max_depth) 누적 → weakness 진단 + 학습 리포트 시각화

alter table public.euler_solve_logs
  add column if not exists chain_termination text
    check (chain_termination in ('reached_conditions', 'max_depth', 'dead_end', 'cycle')),
  add column if not exists chain_depth smallint check (chain_depth between 0 and 8),
  add column if not exists chain_used_tools text[] not null default '{}';

create index if not exists euler_logs_chain_idx
  on public.euler_solve_logs(chain_termination)
  where chain_termination is not null;

comment on column public.euler_solve_logs.chain_termination is
  'Recursive Backward Chain termination reason — null 이면 chain 미실행 (난이도 < 5)';
comment on column public.euler_solve_logs.chain_depth is
  'chain 실제 도달 깊이 (0=실행 X, 1~5=정상, max_depth=cap 도달)';
