-- Phase G-06 — usage_events 에 Legend 차원(tutor_name, tier) 추가
-- 비-Legend 이벤트는 NULL 유지 (기존 analytics 코드 무파괴).
-- architecture-g06-legend.md §3.4 그대로. idempotent (add column if not exists).

alter table public.usage_events
  add column if not exists tutor_name text,
  add column if not exists tier smallint check (tier in (0,1,2));

comment on column public.usage_events.tutor_name is
  'Legend 튜터 이름 — null 이면 비-Legend 이벤트 (ramanujan_calc/ramanujan_intuit/gauss/von_neumann/euler/leibniz)';
comment on column public.usage_events.tier is
  'Legend tier — null 이면 비-Legend 이벤트 (0=ramanujan_calc, 1=ramanujan_intuit, 2=legend)';
