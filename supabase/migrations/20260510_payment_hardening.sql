-- 24차 (2026-05-10) — 결제 시스템 점검 후속 보강
--
-- 발견 (24차 점검): subscriptions 의 active 1개 unique constraint 부재.
-- 사용자가 매우 빠르게 두 번 결제 시 두 개 active row 동시 생성 가능.
-- /api/payment/billing-key + /api/payment/confirm 모두 maybeSingle 후 update or
-- insert 패턴 — race 시 두 insert 모두 통과.
--
-- 처리: partial unique index. status='active' 인 row 만 user_id 별 1개 강제.
-- 'canceled' / 'past_due' / 'paused' / 'pending' 은 여러 개 허용 (이력).
--
-- 안전성: production 에 현재 active 결제 0 건 (베타 동안). 적용 즉시 충돌 없음.

create unique index if not exists uq_one_active_subscription
  on public.subscriptions (user_id)
  where status = 'active';

comment on index public.uq_one_active_subscription is
  '24차 — user 1명당 active 구독 1개 강제 (race condition 방지).';
