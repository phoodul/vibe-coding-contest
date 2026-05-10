# 결제 활성화 Runbook (2026-05-10 작성)

> **목적**: 베타 종료 → 결제 시스템 활성화까지 단계별 체크리스트.
> **선결 조건**: 사업자 등록 ✅ + 토스페이먼츠 가맹점 (test mode) ✅
> **참고 commit**: 22차 (`febdb7c` `99fd491`) + 23차 (`377cc7c` `4365a2e` `1d5ddb2`
> `f35da91`) + 24차 (`0b7ae71` legacy 차단)

본 runbook 은 **test mode 검증 → live 활성화 → 장애 시 즉시 비활성화**의 3 단계로
구성. 각 단계는 사용자가 직접 수행 (Claude 가 직접 실행 불가).

---

## 0. 선결 조건 체크 (실행 전 1회)

### 0.1 SQL 마이그레이션 (Supabase Dashboard SQL Editor)
```sql
-- 1. supabase/migrations/20260509_payment_system.sql 전체 실행
-- 2. 검증
SELECT tablename FROM pg_tables WHERE schemaname='public'
  AND tablename IN ('subscriptions','payments','refunds','usage_counters','payment_webhooks_log');
-- 5 row 반환 = OK
```

### 0.2 토스 가맹점 dashboard 확인사항
- [ ] **test mode keys 발급**: `NEXT_PUBLIC_TOSS_CLIENT_KEY` (test_ck_...) +
      `TOSS_SECRET_KEY` (test_sk_...)
- [ ] **webhook URL 등록**: `https://easyedu.ai/api/payment/webhook`
- [ ] **webhook signature 알고리즘 확인**: HMAC-SHA256 + base64 가 표준이지만
      토스 dashboard 의 정확한 헤더 명 (`Toss-Signature` vs `TossPayments-Signature`)
      과 알고리즘이 가맹점별 설정으로 차이 가능 → `lib/payment/toss.ts:185` 확인
- [ ] **successUrl / failUrl** 화이트리스트:
      - `https://easyedu.ai/billing/success`
      - `https://easyedu.ai/billing/fail`
- [ ] **정기결제 권한 활성** (가맹점 가입 시 별도 신청 필요할 수 있음)

### 0.3 사업자 정보 (env)
- [ ] 상호 / 대표자 / 사업자등록번호 / 통신판매업신고번호 / 주소 / CS 전화·이메일
      모두 확보
- [ ] `lib/legal/meta.ts` 의 `NEXT_PUBLIC_BUSINESS_*` 매핑 확인 (placeholder 인지)

---

## 1. Test Mode 검증 (live 전환 전 필수)

### 1.1 vercel env 추가 (preview 환경)

```sh
# ⚠️ 실제 값을 채팅에 붙여넣지 말 것. vercel CLI 또는 dashboard 에서 직접 입력.
# env 변수명은 src/lib/legal/meta.ts + src/app/api/payment/checkout/route.ts 의
# 실제 사용처와 정확히 일치해야 함.

# 토스 결제
vercel env add TOSS_SECRET_KEY preview              # test_sk_...
vercel env add TOSS_WEBHOOK_SECRET preview          # 토스 dashboard 발급
vercel env add NEXT_PUBLIC_TOSS_CLIENT_KEY preview  # test_ck_...
vercel env add NEXT_PUBLIC_PAYMENT_ACTIVE preview   # true
vercel env add CRON_SECRET preview                  # openssl rand -hex 32
vercel env add NEXT_PUBLIC_APP_URL preview          # https://<preview-url>.vercel.app (또는 production = easyedu.ai)

# 사업자 정보 (lib/legal/meta.ts:24-40 매핑)
vercel env add NEXT_PUBLIC_BUSINESS_NAME preview              # 상호
vercel env add NEXT_PUBLIC_BUSINESS_REP preview               # 대표자명
vercel env add NEXT_PUBLIC_BUSINESS_REG_NO preview            # 사업자등록번호
vercel env add NEXT_PUBLIC_BUSINESS_ECOMMERCE_NO preview      # 통신판매업 신고번호
vercel env add NEXT_PUBLIC_BUSINESS_ADDRESS preview           # 사업장 주소
vercel env add NEXT_PUBLIC_BUSINESS_PHONE preview             # CS 전화
vercel env add NEXT_PUBLIC_BUSINESS_EMAIL preview             # CS 이메일
vercel env add NEXT_PUBLIC_PRIVACY_OFFICER preview            # 개인정보 보호책임자명
vercel env add NEXT_PUBLIC_PRIVACY_OFFICER_EMAIL preview      # 개인정보 보호책임자 이메일
```

> 본 단계에서는 **production 에는 추가하지 말 것**. preview deploy URL 에서
> 단계 1.2 ~ 1.6 검증 완료 후 production 으로 promote.

### 1.2 Preview Deploy 트리거

```sh
# 변경 없이 가장 최근 commit 으로 preview 배포
vercel deploy
# 또는 GitHub PR 만들면 자동 preview 빌드
```

### 1.3 결제 흐름 1회 완주 (단발 — Top-up)

토스 test 환경에서 결제 흐름 가장 단순한 단발 결제부터 검증.

1. preview URL 의 `/pricing` 진입 → 결제 버튼 활성 확인 (NEXT_PUBLIC_PAYMENT_ACTIVE=true)
2. 단계: Top-up 100회 ₩14,900 카드 = `4111-1111-1111-1111` (토스 test 카드)
3. ❗ 문제: `/pricing` 화면에는 Top-up 카드 노출이 없음 (현재 3 tier 만 노출)
   → 단발 검증은 **Standard ₩49,000 정기결제 첫 결제** 로 대신.

### 1.4 정기결제 첫 결제 (Standard ₩49,000)

1. `/pricing` → "Standard" → "결제하고 시작하기"
2. 토스 위젯이 카드 등록창 → test 카드 입력 (4111-1111-1111-1111, 만료 12/30, CVC 123)
3. `/billing/success?_flow=billing&order_id=...&authKey=...&customerKey=...` 도달
4. 화면: "결제가 완료되었습니다 ✅" 노출 + 영수증 링크
5. **Supabase Dashboard SQL Editor 검증**:

```sql
-- 빌링키 발급 + 첫 결제 확인
SELECT id, plan_code, status, price_krw, monthly_quota,
       toss_billing_key IS NOT NULL AS has_billing_key,
       current_period_start, current_period_end
FROM subscriptions
WHERE user_id = (SELECT id FROM auth.users WHERE email='phoodul@gmail.com')
ORDER BY created_at DESC LIMIT 1;
-- → status='active', has_billing_key=true, monthly_quota=100

SELECT id, plan_code, status, amount_krw, paid_at, toss_payment_key IS NOT NULL AS paid
FROM payments
WHERE user_id = (SELECT id FROM auth.users WHERE email='phoodul@gmail.com')
ORDER BY created_at DESC LIMIT 1;
-- → status='paid', amount_krw=49000, paid=true
```

### 1.5 quota check 작동 확인

1. /legend 진입 → 1 problem 풀이 (첫 user turn) → DB:
```sql
SELECT counter_type, used_count, quota_limit, period_start, period_end
FROM usage_counters
WHERE user_id = (SELECT id FROM auth.users WHERE email='phoodul@gmail.com');
-- → counter_type='legend_problem', used_count=1, quota_limit=100
```

2. /earth-science (또는 다른 maestro) 1 problem → maestro_problem 별도 row +1 확인.

### 1.6 환불 흐름 (7일 이내)

1. `/billing` 페이지에서 "환불 신청" — 또는 `/api/payment/refund` 직접 호출
2. payment_id, reason='unused_within_7d', 7일 이내 = 자동 처리
3. 응답: `{ ok: true, auto: true, refund_amount_krw: 49000 }` (사용 0회 = 전액)
4. **DB 검증**:
```sql
SELECT status, amount_refunded_krw, used_quota_at_request, completed_at
FROM refunds WHERE user_id = ... ORDER BY created_at DESC LIMIT 1;
-- → status='completed', amount_refunded_krw=49000

SELECT status, refundable_amount_krw FROM payments WHERE id=...;
-- → status='canceled', refundable_amount_krw=0

SELECT status, cancel_at_period_end FROM subscriptions WHERE id=...;
-- → status='canceled', cancel_at_period_end=true
```

### 1.7 정기결제 cron 검증 (수동 트리거)

```sh
# preview URL 에서 직접 cron 호출
curl -H "Authorization: Bearer ${CRON_SECRET}" \
  https://<preview-url>/api/cron/billing-recurring
# → { ok: true, processed: 0, succeeded: 0, failed: 0, ... }
# (24시간 안에 만료될 active 구독이 없는 게 정상 — 1회 결제 직후이므로 30일 후 결제)
```

수동 검증 위해 임시로 `current_period_end` 를 1일 후로 update 후 호출:
```sql
UPDATE subscriptions SET current_period_end = now() + interval '12 hours'
WHERE user_id = ... AND status='active';
```
다시 cron 호출 → `{ succeeded: 1 }` + 새 payment row + 30일 갱신 확인.

### 1.8 webhook 수신 검증

1. 토스 dashboard test 환경에서 webhook 발사 (가맹점에 따라 "test webhook" 버튼)
2. `/api/payment/webhook` 도달 → DB 검증:
```sql
SELECT event_id, event_type, signature_valid, status, created_at
FROM payment_webhooks_log ORDER BY created_at DESC LIMIT 5;
-- → signature_valid=true, status='processed'
```
- ⚠️ `signature_valid=false` 가 나오면 `lib/payment/toss.ts:185 verifyWebhookSignature`
  의 알고리즘·헤더 명을 토스 dashboard 명세와 비교. HMAC algorithm (sha256) 맞고
  헤더 명만 다르면 라인 31 의 `req.headers.get('toss-signature')` 후보 추가.

### 1.9 admin/billing 모니터링

`/admin/billing` 진입 → 통계 카드 (이번 달 결제 1 / 매출 49,000 / 환불 1 / 환불 금액
49,000 / pending 0) 확인. 최근 결제 50건 + Pending 환불 0건 표시.

---

## 2. Live 활성화 (test mode 검증 100% 통과 후)

### 2.1 vercel env (production 환경)

```sh
# test_ → live_ 로 토스 keys 교체
vercel env add TOSS_SECRET_KEY production              # live_sk_...
vercel env add TOSS_WEBHOOK_SECRET production          # live webhook secret
vercel env add NEXT_PUBLIC_TOSS_CLIENT_KEY production  # live_ck_...
vercel env add NEXT_PUBLIC_PAYMENT_ACTIVE production   # true
vercel env add CRON_SECRET production                  # 새 32 byte
vercel env add NEXT_PUBLIC_APP_URL production          # https://easyedu.ai
# 사업자 정보 9개 (1.1 와 동일 변수명)
vercel env add NEXT_PUBLIC_BUSINESS_NAME production
vercel env add NEXT_PUBLIC_BUSINESS_REP production
vercel env add NEXT_PUBLIC_BUSINESS_REG_NO production
vercel env add NEXT_PUBLIC_BUSINESS_ECOMMERCE_NO production
vercel env add NEXT_PUBLIC_BUSINESS_ADDRESS production
vercel env add NEXT_PUBLIC_BUSINESS_PHONE production
vercel env add NEXT_PUBLIC_BUSINESS_EMAIL production
vercel env add NEXT_PUBLIC_PRIVACY_OFFICER production
vercel env add NEXT_PUBLIC_PRIVACY_OFFICER_EMAIL production
```

### 2.2 Vercel Cron Jobs 등록 확인

- Dashboard → Project → Settings → Cron Jobs
- `/api/cron/billing-recurring` 의 schedule = `0 0 * * *` (UTC = KST 09시) 활성 확인
- `/api/cron/anonymize-graduated` = `0 18 * * *`
- `/api/cron/mine-triggers` = `30 18 * * *`

### 2.3 토스 dashboard live 설정

- [ ] webhook URL: `https://easyedu.ai/api/payment/webhook` (production)
- [ ] live mode webhook secret 발급 → `TOSS_WEBHOOK_SECRET` 갱신
- [ ] successUrl / failUrl 화이트리스트 production 도메인으로
- [ ] 정기결제 권한 live mode 도 활성

### 2.4 Production deploy + 즉시 1 결제 검증

1. main 브랜치에 commit push → production 자동 배포
2. 본인 계정으로 `/pricing` → Standard ₩49,000 결제 (실 결제)
3. 1.5, 1.6, 1.7 의 DB 쿼리로 모든 흐름 정상 확인
4. 본인 환불 처리 (`/billing` → 환불 신청) 로 즉시 회수

### 2.5 첫 1주 모니터링 항목

매일 1회 `/admin/billing` 확인:
- [ ] **Pending 환불** → 7일 초과 신청건 수동 검토 (영업일 3일 이내 처리 약속)
- [ ] **payment_webhooks_log signature_valid=false** 빈도 — 0 이 정상
- [ ] **subscriptions.status='past_due'** 1주 이상 머무는 건 — cron 재시도 실패. 사용자
      카드 변경 안내 메시지 + 별도 결제 링크 제공 필요 (현재 미구현, 추후 개선)
- [ ] **payments.status='failed' 사유** 분석 — `failure_message` 필드

---

## 3. 장애 시 즉시 비활성화

### 3.1 핵심 스위치
```sh
vercel env rm NEXT_PUBLIC_PAYMENT_ACTIVE production
# 또는
vercel env add NEXT_PUBLIC_PAYMENT_ACTIVE production # false
```
재배포 (vercel deploy) 또는 Vercel dashboard 의 "Redeploy" → 30초 안에 모든 결제
경로 차단 (PricingClient 버튼 disabled / cron skip / quota check skip).

### 3.2 진행 중 구독 처리
- 기존 active subscriptions 는 그대로 유지 (사용자 데이터 보존).
- cron 이 비활성이므로 다음 사이클 미결제 = `current_period_end` 후 자동
  `period_expired` (quota.ts:81). 사용자 안내: "결제 시스템 일시 점검 중. 다음
  결제일 자동 갱신이 일시 중단됩니다."

### 3.3 환불 일괄 처리 (선택)
- `/admin/billing` 에서 pending 환불 일괄 승인 (admin 권한)
- 또는 Supabase RPC 로 active 구독 사용자 전체에게 일할 환불 (별도 SQL 작성 필요)

---

## 4. 알려진 결함 (운영 중 모니터링)

본 항목은 24차 점검에서 발견된 결함. **활성화에 blocking 은 아니지만 주의 모니터링.**

### 4.1 Webhook signature 알고리즘 확인 미완 (`lib/payment/toss.ts:182-184`)
- 코멘트: "토스의 정확한 시그니처 헤더 이름·알고리즘은 가맹점 가입 후 dashboard 설정 확인."
- 0.2 단계의 토스 dashboard webhook secret 발급 후 1.8 단계에서 검증.
- `signature_valid=false` 가 모든 webhook 에서 나면 → 즉시 알고리즘·헤더 수정.

### 4.2 quota.ts race condition (`lib/payment/quota.ts:51-52`)
- select-update 패턴, 동시 요청 시 1~2회 drift 가능.
- 대응: 사용자가 의도적으로 동시 요청하기 어려움 → 영향 미미. 발생 시 admin 이
  `usage_counters.used_count` 수동 보정.
- 향후 개선: PG RPC `SELECT ... FOR UPDATE` 또는 atomic increment.

### 4.3 subscriptions active 1개 unique constraint 부재
- 사용자가 매우 빠르게 두 번 결제 시 두 개 active 가능.
- 대응: `/admin/billing` 에서 확인 시 사용자 1명에 active 2건 발견 → 수동 환불.
- 향후 개선: `CREATE UNIQUE INDEX uq_one_active_per_user ON subscriptions (user_id) WHERE status='active';`

### 4.4 refund 일할 차감 100회 사용 시 0원
- `/api/payment/refund:106-107` 의 일할 차감으로 100회 다 쓰면 환불 0원.
- 정책상 의도이지만 사용자에게 명확히 안내 필요. `/refund` 약관 페이지에 추가 권장.

### 4.5 past_due 사용자에게 결제 재시도 UI 부재
- cron 이 자동 재시도 (다음 cron 까지 24시간) 하지만 사용자가 카드 갱신 후 즉시
  결제할 UI 가 없음.
- 향후 개선: `/billing` 페이지에서 past_due 시 "다시 결제하기" 버튼 +
  `/api/payment/billing-key` 재호출.

---

## 5. 검증 완료 체크리스트

- [ ] **0**: SQL 마이그레이션 적용 + 테이블 5개 생성 확인
- [ ] **0**: 토스 dashboard test mode keys + webhook URL 등록
- [ ] **1.1**: vercel env preview 환경에 7개 추가
- [ ] **1.2**: preview deploy 빌드 성공
- [ ] **1.4**: Standard 49,000 첫 결제 → subscriptions/payments DB 정상
- [ ] **1.5**: legend 1 turn → usage_counters 정상 +1
- [ ] **1.6**: 환불 신청 → 자동 49,000 환불 + DB cascade 정상
- [ ] **1.7**: cron 수동 트리거 → succeeded:1 + 30일 갱신
- [ ] **1.8**: webhook signature_valid=true + status='processed'
- [ ] **1.9**: /admin/billing 통계·환불·결제 정상 표시
- [ ] **2.1**: vercel env production 환경 갱신 (live keys)
- [ ] **2.2**: Vercel Cron Jobs 3개 활성 확인
- [ ] **2.3**: 토스 dashboard live mode webhook + URL 정합
- [ ] **2.4**: 본인 계정 production 1 결제 + 환불 회수 검증
- [ ] **2.5**: 첫 1주 매일 admin/billing 모니터링

---

## 부록: 환불 정책 요약 (사용자 약관 = `/refund`)

| 시점 | 사용량 | 환불 |
|---|---|---|
| ≤ 7일 | 0회 | 전액 (자동) |
| ≤ 7일 | 1~99회 | 사용분 일할 차감 후 환불 (자동) |
| ≤ 7일 | 100회 (한도 소진) | 환불 0원 (자동) |
| > 7일 | 무관 | admin 검토 (영업일 3일) |
| Premium | ≤ 7일 | 사용 무관 전액 (자동) |

> 일할 차감 단위: `payment.amount_krw / monthly_quota` (Standard 의 경우 49,000 / 100 = ₩490).
