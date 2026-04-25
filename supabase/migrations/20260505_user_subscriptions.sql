-- Phase D-08: user_subscriptions — 구독 상태
-- Created: 2026-04-26

create table if not exists public.user_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null check (plan in ('free', 'student', 'family', 'academy')),
  status text not null check (status in ('active', 'canceled', 'past_due', 'trialing')) default 'active',
  amount integer not null,                 -- 원 단위
  toss_billing_key text,                   -- 정기결제 키 (있으면 자동 갱신)
  toss_customer_key text,                  -- Toss customer 식별자
  current_period_end timestamptz,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_subs_status_idx on public.user_subscriptions(status);

alter table public.user_subscriptions enable row level security;

drop policy if exists "user_subs_read_own" on public.user_subscriptions;
create policy "user_subs_read_own"
  on public.user_subscriptions for select
  using (auth.uid() = user_id);

-- 변경은 service_role / RPC 만. 일반 user 는 insert/update 불가.
-- 결제 완료 후 server route 가 service_role 클라이언트로 적재.
