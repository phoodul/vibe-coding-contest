# 23차 세션 — 결제 활성화 정비 + Chat 진짜 추출

> **작성**: 2026-05-10
> **베이스 commit**: `7145d1e` (22차 종료)
> **트랙**: (a) 결제 활성화 직전 정비 + (b) BetaChat → MaestroChat 진짜 추출 + LegendChat rename
> **원칙**: task 1개 = 1 commit. typecheck pass 의무. 회귀 0 (Legend `/legend` smoke OK).

---

## 0. 현재 상태 검증 (이미 완료된 것)

### ✅ 22차 종료 시점 결제 코드 실재
| 영역 | 파일 | 상태 |
|---|---|---|
| 토스 helper | `lib/payment/toss.ts` | ✅ confirm·issueBillingKey·chargeBilling·cancelPayment·verifyWebhookSignature |
| 6 결제 API | `app/api/payment/{checkout,confirm,billing-key,refund,webhook}/route.ts` | ✅ |
| 3 billing API | `app/api/billing/{status,cancel,toss/confirm}/route.ts` | ✅ |
| `/pricing` + PricingClient | `app/pricing/page.tsx` + `components/payment/PricingClient.tsx` | ✅ paymentActive flag |
| `/billing` 구독 관리 | `app/billing/page.tsx` (391 줄) | ✅ |
| `/billing/success` confirm 호출 | `app/billing/success/page.tsx` | ✅ |
| Maestro tutor route quota check | `app/api/maestro/[subject]/tutor/route.ts:89-113` | ✅ 통합됨 |

### ❌ 22차에 빠진 것 (= 23차 작업)
1. **Legend tutor route quota check 미통합** — grep `checkAndIncrementQuota` in `app/api/legend/tutor/route.ts` = 0 match
2. **토스 결제 위젯 client SDK 호출 미연결** — `PricingClient.handleSubscribe` 가 `redirect_url` 만 따라가는데 `checkout` 응답은 `redirect_url=null` (widget 모드 의도). client widget 띄우는 코드 부재.
3. **`/admin/billing` 환불 검토 페이지 없음**
4. **정기결제 cron 없음** — `chargeBilling` 호출자 0
5. **BetaChat 의 maestro 분기 진짜 추출 미완** — 22차 Phase 4 = thin wrapper (49줄, BetaChat 재사용)

---

## 1. 트랙 A — 결제 활성화 직전 정비 (5 task)

### A1. Legend tutor route quota check 통합 ⭐ 시작점

**파일**: `src/app/api/legend/tutor/route.ts`

**작업**:
- Maestro tutor route line 89~113 와 동일 패턴 (lib/payment/quota:checkAndIncrementQuota)
- 첫 user turn (`isFirstAssistantTurnEarly`) + `process.env.NEXT_PUBLIC_PAYMENT_ACTIVE === 'true'` 일 때만 호출
- Maestro 분기 (`isMaestro`) 는 이미 maestro 라우트로 옮겼으므로 본 라우트는 legend_problem 카운터만 증가
- quota 초과 시 stream 으로 안내 메시지 (Maestro 와 동일 reading: maestroErrorResponse 패턴)

**DoD**:
- typecheck pass
- legend smoke (1 turn) 회귀 0
- `NEXT_PUBLIC_PAYMENT_ACTIVE !== 'true'` 일 때 quota check skip 확인 (베타 동안 무중단)

**commit**: `feat(payment): legend tutor route 에 100회 quota check 통합`

---

### A2. PricingClient 토스 결제 위젯 client SDK 연결

**파일**: `src/components/payment/PricingClient.tsx` (수정) + 신규 `src/lib/payment/toss-client.ts`

**작업**:
- `@tosspayments/payment-sdk` (또는 widget-sdk) 동적 import
- `handleSubscribe` 흐름 재작성:
  1. `/api/payment/checkout` POST → `{order_id, customer_key, amount_krw, plan_label, success_url, fail_url, is_recurring}` 받음
  2. `is_recurring=true` (Basic/Standard/Premium) → `requestBillingAuth()` → 빌링키 발급용 카드 등록 페이지
  3. `is_recurring=false` (topup_100) → `requestPayment()` → 즉시 결제
  4. 토스 SDK 가 redirect 처리 → `/billing/success` 또는 `/billing/fail`
- `NEXT_PUBLIC_TOSS_CLIENT_KEY` env 미설정 시 graceful fallback (alert + console)
- 베타 동안 paymentActive=false → 기존 disabled 상태 유지

**DoD**:
- typecheck pass
- production 페이지 정적 빌드 OK
- 베타 동안 button click → 노옵 (paymentActive=false 가드)
- env 활성화 후 실 결제 흐름은 가맹점 가입 후 사용자가 직접 검증 (코드만 준비)

**commit**: `feat(payment): PricingClient 토스 결제 위젯 client SDK 연동`

---

### A3. `/admin/billing` 환불 검토 페이지

**파일**: 신규 `src/app/admin/billing/page.tsx` + 신규 `src/app/api/admin/billing/refunds/route.ts` + 신규 `src/app/api/admin/billing/refund-action/route.ts`

**작업**:
- admin 가드: 기존 `lib/auth/isAdminEmail` 단일 소스 (메모리 `feedback_admin_guard_pattern.md`)
- `/admin/billing` UI:
  - **상단 통계**: 이번 달 결제 건수 / 매출 / 환불 건수 / 환불 금액 / pending 환불 건수
  - **Pending 환불 목록**: 7일 초과 사용자 신청건. 각 row 에 [승인 → cancelPayment 호출 + refunds.status=completed] / [반려 → refunds.status=rejected + admin_note] 버튼
  - **최근 결제 이력**: 최근 50건 (status·plan·금액·user email·paid_at·receipt_url)
- API 2개:
  - GET `/api/admin/billing/refunds?status=pending|all` — pending 목록 + 통계
  - POST `/api/admin/billing/refund-action` body `{refund_id, action: 'approve'|'reject', admin_note?}`
- approve: 토스 cancelPayment + payments.status update + subscriptions.status=canceled (전액 시) — `/api/payment/refund` 의 자동 흐름과 동일 로직 재사용 (helper 함수 추출 가능)
- reject: refunds.status='rejected' + admin_note 만 update

**DoD**:
- typecheck pass
- admin 비계정 접근 → 403/redirect 회귀 0
- pending 환불 미존재 시 빈 상태 메시지

**commit**: `feat(admin): /admin/billing — 환불 pending 검토 + 결제 통계`

---

### A4. 정기결제 cron — 매일 자정 + Vercel Cron

**파일**: 신규 `src/app/api/cron/billing-recurring/route.ts` + `vercel.json` 수정

**작업**:
- GET `/api/cron/billing-recurring` (Vercel Cron 권장 GET)
- 인증: `Authorization: Bearer ${CRON_SECRET}` (Vercel Cron 표준 — `process.env.CRON_SECRET` 비교)
- 처리:
  1. `subscriptions` 에서 `status='active'` AND `cancel_at_period_end=false` AND `current_period_end < now() + 1day` 인 row 조회 (24시간 buffer)
  2. 각 row 에 대해:
     - `toss_billing_key` 미존재 → skip + 에러 로그
     - `chargeBilling({billingKey, customerKey, amount: price_krw, orderId: generateOrderId('sub'), orderName: plan.label_ko})` 호출
     - 성공: `payments` 새 row insert (status='paid') + `subscriptions.current_period_start/end` 갱신 (월 +1) + `usage_counters` 새 period row reset
     - 실패: `payments` row insert (status='failed') + `subscriptions.status='past_due'` (graceful)
  3. 처리 결과 JSON: `{processed: N, succeeded: N, failed: N, errors: [...]}`
- `vercel.json` `crons`: `[{ "path": "/api/cron/billing-recurring", "schedule": "0 0 * * *" }]` (UTC 자정 = KST 09시 — 한국 새벽 충돌 방지)

**DoD**:
- typecheck pass
- CRON_SECRET 미설정 시 401 (보안 가드)
- 활성 subscription 0 일 때 `{processed: 0}` 정상 반환 (베타 동안 항상 0)
- production 배포 후 Vercel Cron dashboard 에 등록 확인 (사용자 액션)

**commit**: `feat(payment): 정기결제 cron — 매일 KST 09시 자동 청구`

---

### A5. `legend/tutor/route.ts` 의 cancel-at-period-end 흐름 보강

**파일**: `src/app/api/billing/cancel/route.ts` (이미 존재 — 검증/보강만)

**작업**:
- 기존 `/api/billing/cancel` 코드 검증
- 누락 시: `subscriptions.cancel_at_period_end=true` + `subscriptions.canceled_at` set + `subscriptions.status='active'` 유지 (다음 결제일까지 사용 가능, 결제 cron 이 cancel_at_period_end=true row skip)
- 단순 sanity check + 주석 보강

**DoD**: typecheck pass, /billing 페이지 cancel 버튼 동작 확인

**commit**: A4 와 합치거나 단독 — A4 PR 검토 후 결정. 기본은 단독 작은 fix commit 또는 생략.

> **A5 는 기존 코드 OK 일 가능성 큼. 검증만 후 차이 발견 시 commit, 없으면 skip.**

---

## 2. 트랙 B — Chat 진짜 추출 + LegendChat rename (3 task)

### B1. BetaChat 의 maestro 분기 → MaestroChat 진짜 이동

**파일**: `src/components/maestro/MaestroChat.tsx` (49 → ~600 줄로 확장) + `src/components/legend/BetaChat.tsx` (1072 → ~700 줄로 축소)

**작업** (가장 위험 = 회귀 가능성 가장 큼 — 소심하게):
1. BetaChat 안에서 `subject !== 'math'` 분기를 식별 — 다음 영역:
   - useChat api = `/api/maestro/${subject}/tutor` (이미 분기됨)
   - 페르소나 4 카드 modal (TutorPickerModal) — Maestro 페르소나 union (`MAESTRO_*_TUTORS`)
   - ScienceExamPanel (수능 기출 multimodal 첨부)
   - INPUT_PARSING_RULES placeholder
   - MaestroSolutionSummaryButton + MaestroSummaryCard
   - Trigger 링크 = `/maestro/${subject}/triggers`
   - 리포트 링크 = `/maestro/${subject}/report`
2. 위 분기 코드를 MaestroChat 안으로 복제 + math 전용 코드 (Legend) 제거
3. BetaChat 안에서는 `subject === 'math'` 가정 + maestro 분기 코드 삭제
4. 4 maestro 페이지 (earth-science / biology / physics / chemistry) 는 이미 MaestroChat import → import 무변경
5. BetaChat 사용처 = `/legend` page (수학) — 단일 호출자

**점진 안전장치**:
- 한 commit 에 다 하지 말고 **두 sub-step 으로 분할**:
  - **B1a**: MaestroChat 에 maestro 코드 복제 (BetaChat 도 그대로 — 일시적 중복) + 4 페이지가 새 MaestroChat 사용 + manual smoke (모든 4 과목)
  - **B1b**: BetaChat 에서 maestro 분기 코드 삭제 + Legend smoke

**DoD**:
- typecheck pass (양 sub-step)
- 4 maestro 과목 + Legend 모두 production smoke 1 turn OK (사용자 manual)
- BetaChat 줄 수 1072 → ~700 줄 감소

**commit**:
- B1a: `refactor(maestro): MaestroChat 에 maestro 분기 코드 복제 (점진 분리 step 1)`
- B1b: `refactor(maestro): BetaChat 에서 maestro 분기 코드 제거 (점진 분리 step 2)`

---

### B2. BetaChat → LegendChat rename

**파일**:
- `src/components/legend/BetaChat.tsx` → `src/components/legend/LegendChat.tsx` (git mv)
- `src/app/legend/page.tsx` (import 변경)
- 타 호출자 grep — BetaChat 호출자 = MaestroChat (B1 후 0) + legend page 만

**작업**:
- 파일 rename (git mv 권장)
- 컴포넌트명 `BetaChat` → `LegendChat`
- export name 도 변경
- 모든 import 경로 업데이트

**DoD**:
- typecheck pass
- /legend 페이지 smoke 회귀 0
- grep 'BetaChat' 결과 0 match

**commit**: `refactor(legend): BetaChat → LegendChat rename`

> **B2 는 B1 완료 후. B1 미완 상태에서 rename 하면 MaestroChat 이 LegendChat 을 import 하는 모순 발생.**

---

## 3. 의존 관계 + 일정

```
A1 ────────────┐
A2 ────────────┤
A3 ────────────┼──── 모두 독립 (병렬 가능)
A4 ────────────┤
A5 ────────────┘ (A4 와 같이 검토)

B1a ──── B1b ──── B2  (직렬, 한 단계씩 manual smoke)
```

**예상 commit 수**: 7~9개 (A1·A2·A3·A4·B1a·B1b·B2 + 옵션 A5 + 세션 종료 docs)

**예상 시간**: 트랙 A 1~2 세션 + 트랙 B 1 세션 = **2~3 세션** (자율 진행 권한 있음).

---

## 4. 회귀 회피 원칙

- 매 task 완료 후:
  1. `pnpm typecheck` (또는 `npx tsc --noEmit`) 통과 의무
  2. 영향 범위 manual smoke (Legend 1 turn / Maestro 4 과목 중 1개)
  3. commit + production push (자동 배포)
- B1a → B1b 사이는 **사용자 4 과목 + Legend manual smoke** 후 진행
- env 가 없는 상태에서 결제 코드 수정 (A1·A2·A4) 은 모두 `paymentActive=false` 가드로 베타 무중단 보장

---

## 5. 사용자 승인 후 결정

- Plan 승인 시 → A1 부터 즉시 착수 (자율 진행 권한)
- A1·A2·A3·A4 = 단순 추가 = 회귀 위험 ↓ → 자율 진행
- A5 = 검증 후 trivial fix or skip
- B1a → B1b → B2 = **각 사이 manual smoke 요청** (회귀 위험 ↑)
