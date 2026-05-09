-- 22차 (2026-05-09) — 결제 시스템 DB 스키마
--
-- 사용자 결정 (2026-05-03 메모리 + 2026-05-09 본 세션):
--   - PG = 토스페이먼츠 단독 (Phase 1)
--   - 가격: Basic ₩29,000 / Standard ₩49,000 / Premium ₩99,000 (VAT 포함)
--   - Standard 100회/월 = legend/maestro 한정 (1 problem 단위)
--   - 라마누잔(Haiku) + 부가 기능 (마인드맵·풀이정리·헤밍웨이) 무제한
--   - 환불: 전자상거래법 — 결제 ≤7일 + 미사용 = 전액 환불 / 사용분 일할 차감
--   - 베타 종료 후 라이브 활성화 (지금은 schema·UI·코드 다 준비, env 만 교체)
--
-- 안전 원칙:
--   - DROP / RENAME 없음
--   - IF NOT EXISTS — 재실행 안전
--   - RLS — 본인 데이터만 read/write (admin 은 service_role)

-- ────────────────────────────────────────────────────────────────────────────
-- 1. subscriptions — 구독 상태 (active / canceled / past_due / paused)
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_code text not null,                    -- 'basic' | 'standard' | 'premium' | 'topup_100'
  status text not null,                       -- 'active' | 'canceled' | 'past_due' | 'paused' | 'pending'
  price_krw int not null,                     -- 결제 금액 (VAT 포함, 원)
  monthly_quota int,                          -- 100 (standard) | NULL (premium 무제한)
  -- 토스페이먼츠 정기결제 식별
  toss_billing_key text,                      -- 카드 빌링키 (정기결제 등록 토큰)
  toss_customer_key text not null,            -- 우리 시스템의 고객 식별자 (user_id 기반)
  -- 결제 주기
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz not null,    -- 다음 결제 예정일
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  -- 메타
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_subscriptions_user_status
  on public.subscriptions (user_id, status);
create index if not exists idx_subscriptions_period_end
  on public.subscriptions (current_period_end) where status = 'active';

-- ────────────────────────────────────────────────────────────────────────────
-- 2. payments — 결제 이력 (성공·실패 모두)
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  plan_code text not null,
  -- 토스페이먼츠 식별
  toss_payment_key text unique,               -- 결제 고유 키 (환불·조회용)
  toss_order_id text not null,                -- 우리 시스템 주문번호
  toss_method text,                           -- 'CARD' | 'TOSSPAY' | 'KAKAOPAY' | ...
  -- 금액
  amount_krw int not null,
  vat_krw int not null default 0,             -- VAT 10%
  -- 상태
  status text not null,                       -- 'pending' | 'paid' | 'failed' | 'canceled' | 'partial_canceled'
  failure_code text,
  failure_message text,
  paid_at timestamptz,
  -- 영수증·세금계산서
  receipt_url text,
  -- 환불 가능 잔액 (partial refund 추적)
  refundable_amount_krw int,
  -- raw 응답 보관 (디버깅·법무 감사용)
  raw_response jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_payments_user_created
  on public.payments (user_id, created_at desc);
create index if not exists idx_payments_subscription
  on public.payments (subscription_id, created_at desc);
create unique index if not exists idx_payments_order_id
  on public.payments (toss_order_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 3. refunds — 환불 신청·처리 이력
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.refunds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  payment_id uuid not null references public.payments(id) on delete restrict,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  -- 신청 정보
  reason text not null,                       -- 'unused_within_7d' | 'partial_use' | 'service_error' | 'user_request' | 'admin_initiated'
  reason_text text,                           -- 사용자 자유 입력 (50~500자)
  amount_requested_krw int not null,
  amount_refunded_krw int,                    -- 실제 환불액 (사용분 차감 후)
  used_quota_at_request int,                  -- 신청 시점 사용 횟수 (일할 차감 계산용)
  -- 상태
  status text not null,                       -- 'pending' | 'approved' | 'completed' | 'rejected'
  rejection_reason text,
  -- 토스페이먼츠
  toss_cancel_key text,                       -- 환불 트랜잭션 식별
  -- 처리
  reviewed_by uuid references auth.users(id), -- admin user_id
  reviewed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_refunds_user_created
  on public.refunds (user_id, created_at desc);
create index if not exists idx_refunds_status
  on public.refunds (status, created_at desc);

-- ────────────────────────────────────────────────────────────────────────────
-- 4. usage_counters — 월간 100회 한도 추적
-- ────────────────────────────────────────────────────────────────────────────
-- 월별 row 1개 (user_id + period_start). legend / maestro 의 1 problem 단위 incr.
-- 라마누잔 (Haiku) + 부가 기능은 미카운트 — separately tracked in usage_events 등.
create table if not exists public.usage_counters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  -- 월간 단위 (current_period_start ~ current_period_end)
  period_start timestamptz not null,
  period_end timestamptz not null,
  -- 분류
  counter_type text not null,                 -- 'legend_problem' | 'maestro_problem' | 'topup'
  used_count int not null default 0,
  quota_limit int,                            -- 100 (Standard) | NULL (premium 무제한)
  last_used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 한 user_id × period × counter_type 당 row 1개 (upsert key)
create unique index if not exists uq_usage_counters
  on public.usage_counters (user_id, period_start, counter_type);
create index if not exists idx_usage_counters_user_period
  on public.usage_counters (user_id, period_end desc);

-- ────────────────────────────────────────────────────────────────────────────
-- 5. payment_webhooks_log — 토스페이먼츠 webhook 이벤트 감사
-- ────────────────────────────────────────────────────────────────────────────
-- 결제 분쟁·중복 처리 방지용. 동일 event_id 재수신 시 idempotent 처리.
create table if not exists public.payment_webhooks_log (
  id uuid primary key default gen_random_uuid(),
  event_id text unique not null,              -- 토스 webhook eventId
  event_type text not null,                   -- 'PAYMENT_STATUS_CHANGED' | 'BILLING_KEY_DELETED' | ...
  payment_key text,
  order_id text,
  status text,                                -- 'received' | 'processed' | 'duplicate' | 'invalid_signature'
  signature_valid boolean,
  raw_payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_webhooks_event_type
  on public.payment_webhooks_log (event_type, created_at desc);

-- ────────────────────────────────────────────────────────────────────────────
-- 6. RLS — 본인 데이터만 read. write 는 service_role (server-only) 만.
-- ────────────────────────────────────────────────────────────────────────────
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.refunds enable row level security;
alter table public.usage_counters enable row level security;
alter table public.payment_webhooks_log enable row level security;

-- subscriptions
drop policy if exists "subscriptions_owner_select" on public.subscriptions;
create policy "subscriptions_owner_select"
  on public.subscriptions for select using (auth.uid() = user_id);

-- payments
drop policy if exists "payments_owner_select" on public.payments;
create policy "payments_owner_select"
  on public.payments for select using (auth.uid() = user_id);

-- refunds — 본인 신청·조회 가능
drop policy if exists "refunds_owner_select" on public.refunds;
create policy "refunds_owner_select"
  on public.refunds for select using (auth.uid() = user_id);

drop policy if exists "refunds_owner_insert" on public.refunds;
create policy "refunds_owner_insert"
  on public.refunds for insert with check (auth.uid() = user_id);

-- usage_counters
drop policy if exists "usage_counters_owner_select" on public.usage_counters;
create policy "usage_counters_owner_select"
  on public.usage_counters for select using (auth.uid() = user_id);

-- payment_webhooks_log — 일반 사용자 read 차단 (admin 만 service_role 사용)
-- (RLS enabled + policy 없음 = 모든 일반 select 차단)

-- ────────────────────────────────────────────────────────────────────────────
-- 7. updated_at 자동 갱신 트리거 (subscriptions / usage_counters)
-- ────────────────────────────────────────────────────────────────────────────
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_subscriptions_updated_at on public.subscriptions;
create trigger trg_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

drop trigger if exists trg_usage_counters_updated_at on public.usage_counters;
create trigger trg_usage_counters_updated_at
  before update on public.usage_counters
  for each row execute function public.set_updated_at();

-- ────────────────────────────────────────────────────────────────────────────
-- 8. 코멘트
-- ────────────────────────────────────────────────────────────────────────────
comment on table public.subscriptions is
  '22차 — 사용자 구독 (토스페이먼츠 정기결제 빌링키 보관).';
comment on table public.payments is
  '22차 — 결제 이력 (성공·실패 모두). 환불·세금계산서 감사 기록.';
comment on table public.refunds is
  '22차 — 환불 신청·처리. 전자상거래법 7일 미사용 전액 + 사용분 일할 차감.';
comment on table public.usage_counters is
  '22차 — 월간 100회 한도 추적 (legend/maestro 1 problem 단위).';
comment on table public.payment_webhooks_log is
  '22차 — 토스페이먼츠 webhook 감사 (idempotency · signature 검증).';
