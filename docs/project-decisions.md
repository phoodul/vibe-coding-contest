# Project Decisions — easyedu.ai

> 본 파일은 확정된 핵심 결정만 기록합니다. 진행 상태는 `docs/progress.md`,
> 태스크 상태는 `docs/task.md` 를 참조하세요.

## 22차 세션 (2026-05-08~09)

### D22-01. Footer cutoff margin 6pt → 30pt
- **결정**: `scripts/extract-suneung-question-images.ts` 의 footer baseline cutoff
  margin 을 6pt 에서 30pt 로 (글자 height ~12pt + 안전마진).
- **근거**: 6pt 는 글자 baseline 만 잘려 윗부분 ~6pt 가 이미지에 남아 사용자
  "여전히 footer 가 잘리지 않았어" 신고.
- **commit**: `d6ffd54`. **사용자 액션**: `EXTRACT_FORCE=true` + `UPLOAD_FORCE=true` 재실행.

### D22-02. 과목별 입력 가이드
- **결정**: BetaChat placeholder + system prompt INPUT_PARSING_RULES 4 과목별 분리.
- **물리 핵심**: `*` 없이 인접 = 곱셈 (F=ma → m·a). 숫자+알파벳 = 단위 (5m, 2kg).
  알파벳 단독 = 변수 (m=질량, v=속도, E=에너지). 모호 시 학생에게 확인.
- **commit**: `d6ffd54`.

### D22-03. Maestro 풀이 정리 분리
- **결정**: Legend `build-summary` 의 ToT/agentic 구조와 분리. Maestro 는
  `generateObject` + zod 한 번 호출의 가벼운 구조.
- **출력 5 섹션**: persona_takeaway / key_concepts / solution_steps / pitfalls /
  next_practice.
- **모델**: 풀이한 페르소나 모델 그대로 재사용 (학생 입장 일관성).
- **commit**: `966c56c`.

### D22-04. Maestro 리포트 분리
- **결정**: `/maestro/[subject]/report` 신설. `/legend/report` 와 별도 라우트·차트.
- **데이터**: 22차 1차는 localStorage, Phase 5 (commit `1cda757`) 부터 DB 누적
  (`maestro_tutor_sessions` + `maestro_summaries`).
- **차트**: 풀이 수 / 최근 7일 / multimodal 첨부 / 페르소나 분포 / 최근 정리 5건.

### D22-05. Maestro Trigger 라이브러리 분리
- **결정**: `/maestro/[subject]/triggers` 신설. `data/seeds/{subject}-anchors.json`
  정적 시드 로드. Legend 의 `math_tool_triggers` DB 와 완전 분리.
- **commit**: `30e49a3`. 30 도구 × 4 과목 = 120 trigger 도구.

### D22-06. Maestro/Legend 5 phase 분리 ⭐
| Phase | 변경 | commit |
|---|---|---|
| 1 | `lib/types/subject.ts` + `lib/maestro/types.ts` (re-export 호환) | `6754b55` |
| 2 | `/api/maestro/[subject]/tutor` 신설 (285줄 분기 추출) | `85c2412` |
| 3 | SQL — `maestro_tutor_sessions` + `maestro_summaries` (legend_* 와 분리) | `36f91aa` |
| 4 | `MaestroChat` thin wrapper + 4 페이지 import 통일 (점진 분리 1단계) | `9b12504` |
| 5 | DB insert 활성화 + `/api/maestro/[subject]/report` endpoint | `1cda757` |

- **다음 세션**: BetaChat 1500+ 줄 진짜 추출 + LegendChat rename + legend route maestro 분기 cleanup.

### D22-07. 결제 시스템 활성화 패턴
- **결정**: 베타 동안 `NEXT_PUBLIC_PAYMENT_ACTIVE=false` 로 결제 버튼 비활성.
  베타 종료 후 env 만 `true` 로 교체하면 즉시 활성. 코드·약관·UI 모두 production
  배포 완료 상태.
- **commit**: `febdb7c` (DB + 약관) + `99fd491` (SDK + API + UI + quota).

### D22-08. 가격 책정 (확정)
- **Basic** ₩29,000 / 월 / 50회
- **Standard** ₩49,000 / 월 / 100회 ⭐ **메인 anchor**
- **Premium** ₩99,000 / 월 / 무제한 + 부모 리포트
- **Top-up 100회** ₩14,900 (단발)
- 모든 가격 VAT 10% 포함 (Phase 1 `pricing-strategy.md` 가격 유지).
- **1회 정의**: 1 problem (한 세션의 모든 turn 포함). 라마누잔(Haiku) +
  부속 도구 (마인드맵·헤밍웨이·독서로그·단어장 등) 무제한.

### D22-09. 환불 정책 (확정)
- **결제 ≤ 7일 + 미사용** → 전액 환불 (자동 토스 cancel API)
- **결제 ≤ 7일 + 일부 사용** → 사용분 일할 차감 후 환불
  - 단가: Standard ₩490/회, Basic ₩580/회. Premium 은 7일 이내 무조건 전액.
- **결제 > 7일** → 다음 결제일까지 사용 가능, 다음 결제 차단 (정기결제 해지)
- **7일 초과 + 회사 측 사유**: admin 검토 (`refunds.status='pending'`)
- 카드 환불 입금: 토스 처리 후 카드사 3~5 영업일.

### D22-10. 약관 4종 + 사업자 정보 환경변수
- `/terms` 이용약관 (12조 + 부칙)
- `/privacy` 개인정보처리방침 (수집 · 위탁 8업체 · 보유 5년 · 정보주체 권리)
- `/refund` 환불 정책
- `/business-info` 사업자 정보 — `lib/legal/meta.ts` BUSINESS_INFO 가
  `NEXT_PUBLIC_BUSINESS_*` env 미설정 시 placeholder. 부산 임대 이전 + 통신판매업
  신고 + 토스 가맹점 가입 후 vercel env 추가 = 자동 갱신.

## 21차 세션 (2026-05-07~08) — 요약 (상세는 `docs/progress.md`)

5 root causes 사슬 해결 — useChat marker / Gemini model ID / GEMINI key /
Anthropic alias / **Vercel Hobby Blob bandwidth** (진짜 결정타). Pro plan upgrade
($20/월) 로 즉시 access 복구. Maestro 가 첫 진짜 Gemini provider 사용 코드
(Legend gauss 는 라벨만, 실제는 OpenAI).

## 19차 세션 (2026-05-06~07) — 요약

Maestro 4 과목 신설 — Earth Science / Biology / Physics / Chemistry. 16 페르소나
(4 모델 1:1 매핑 — Sonnet/Gemini/Opus/GPT). 1598 수능 PNG + Vercel Blob 업로드.
120 trigger 도구 시드 (4 × 30).

---

## 23차 세션 (2026-05-10) — 결제 활성화 정비 + Chat rename

### D23-01. Legend tutor 100회 quota check 통합
- **결정**: `/api/legend/tutor` 첫 user turn 에 `checkAndIncrementQuota('legend_problem')`
  호출. `NEXT_PUBLIC_PAYMENT_ACTIVE=true` 일 때만 작동, 베타 동안 무중단.
- **paid 사용자 처리**: free 일일 한도 skip (월 100회 quota 가 상위 게이트).
- **maestro 분기**: 이미 새 라우트 `/api/maestro/[subject]/tutor` 가 `maestro_problem`
  카운트 → legend route 는 legend_problem 만 책임.
- **commit**: `377cc7c`.

### D23-02. PricingClient 토스 V2 SDK 결제 위젯 연결
- **결정**: `@tosspayments/tosspayments-sdk` 동적 import. recurring/single 분기.
  - recurring (Basic/Standard/Premium) → `payment.requestBillingAuth(CARD)` → 카드 등록 →
    `/billing/success?_flow=billing&authKey=...` → `/api/payment/billing-key` (빌링키 발급
    + 첫 결제 즉시 charge + subscriptions/payments insert)
  - single (topup_100) → `payment.requestPayment(CARD)` → `/billing/success?paymentKey=...`
    → `/api/payment/confirm`
- **legacy `/legend/billing` 폐기**: V1 SDK 12K/19K/5K 가격은 22차 표준 (₩29/49/99K) 으로
  대체. `/legend/billing` 페이지 자체는 한동안 dead route 로 유지.
- **commit**: `4365a2e`.

### D23-03. /admin/billing 환불 검토 페이지
- **결정**: 7일 초과 환불 신청은 `refunds.status='pending'` 으로 적재 → admin 이 본
  페이지에서 승인/반려 처리. service role 클라이언트로 cross-cutting 조회 (RLS bypass).
- **API**: `GET /api/admin/billing/refunds?tab=pending|all` (통계+목록) +
  `POST /api/admin/billing/refund-action {refund_id, action, admin_note}`.
- **이메일 조회**: `supabase.auth.admin.listUsers` + `getUserById` 로 user_id → email 매핑.
- **commit**: `1d5ddb2`.

### D23-04. 정기결제 자동 청구 cron
- **결정**: `/api/cron/billing-recurring` (GET, Vercel Cron) 매일 KST 09시(UTC 0시).
  24시간 안에 만료될 active+!cancel_at_period_end 구독 일괄 처리.
- **흐름**: pending payments insert → `chargeBilling` → 성공 시 paid + period 갱신
  / 실패 시 `subscription.status='past_due'` (다음 cron 자동 재시도).
- **인증**: `Authorization: Bearer ${CRON_SECRET}`. `NEXT_PUBLIC_PAYMENT_ACTIVE != true`
  면 skip (베타 동안 무중단).
- **vercel.json**: schedule `"0 0 * * *"` 추가. **사용자 액션**: 베타 종료 후 Vercel
  Cron dashboard 에서 등록 확인.
- **commit**: `f35da91`.

### D23-05. /api/billing/cancel 검증 skip
- **검증**: `cancel_at_period_end=true` 만 설정 → A4 cron 의 `eq(.., false)` 필터로
  자동 skip. 추가 fix 불필요.
- **별도 commit 없음** (A5 = 검증만).

### D23-06. BetaChat → LegendChat rename
- **결정**: 컴포넌트 도메인 정리. 22차 Phase 4 thin wrapper 의 다음 단계.
- **rename 만**: 내부 maestro 분기 코드는 그대로 유지 (회귀 0).
- **호출자 2곳 갱신**: `MaestroChat` (thin wrapper) + `/legend/page.tsx`.
- **진짜 분리(B1a/B1b)는 다음 세션 사용자 manual smoke 후 진행**. LegendChat 1072 줄
  안에서 maestro-specific 영역을 MaestroChat 으로 진짜 추출.
- **commit**: `24bd744`.

---

## 미확정 / 사용자 액션 대기

### 사업자 등록 + PG 가입
- 부산 임대 이전 → 사업자 등록 → 통신판매업 신고 → 토스페이먼츠 가맹점 가입.
- 결정일 2026-05-03 (메모리 `project_payment_infra`). 진행 상태 미확인.

### SQL 마이그레이션 적용 (사용자 액션)
1. `supabase/migrations/20260509_maestro_dedicated_tables.sql` (Phase 3)
2. `supabase/migrations/20260509_payment_system.sql` (결제 시스템)
3. (이전) `supabase/migrations/20260506_maestro_subject_columns.sql` 적용 여부 미확인 — A5

### maestro trial 분기 결정
- 현재: 인증 필수 redirect.
- 충돌: dashboard "로그인 없이 체험 가능" 안내.
- 옵션: (A) 의도된 설계 → 문구 수정 / (B) 비로그인 1~2회 trial 추가.
