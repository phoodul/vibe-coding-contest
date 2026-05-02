# Phase D — 회귀 + 출시 준비 체크리스트

> 작성: 2026-04-26 (D-10)
> 목적: Phase D 산출물(D-01 ~ D-09)의 통합 동작 + 정식 출시 가능 여부
> 합격 기준:
>   1) 단순 계산 환각 0% (SymPy μSvc tool calling)
>   2) 결제 → 가족 잠금 → 교사 대시보드 end-to-end 통과
>   3) 회귀 0건

---

## 0. 사전 준비

- [ ] Railway μSvc 배포 (services/euler-sympy/README.md)
- [ ] 마이그레이션 2종 적용
  - `20260504_euler_family_settings.sql`
  - `20260505_user_subscriptions.sql`
- [ ] env:
  - `EULER_SYMPY_URL`, `EULER_SYMPY_INTERNAL_TOKEN`
  - `NEXT_PUBLIC_TOSS_CLIENT_KEY`, `TOSS_SECRET_KEY` (테스트 키 OK)
- [ ] `pnpm build` 성공 (✓)
- [ ] `npx tsc --noEmit` 0 errors (✓)

---

## 1. SymPy μSvc (D-01 ~ D-03)

- [ ] curl `${EULER_SYMPY_URL}/health` → `{"ok":true}`
- [ ] 6 endpoint 모두 200
  - differentiate / integrate / solve_equation / simplify / factor / series_expand
- [ ] X-Internal-Token 검증 (틀린 토큰 → 401)
- [ ] 30초 타임아웃 동작 (heavy series_expand 케이스)
- [ ] cold start < 5초 / warm < 200ms

---

## 2. Next 프록시 (D-03)

- [ ] `/api/euler-tutor/sympy` 인증 가드
- [ ] op 화이트리스트 검증 (잘못된 op → 400)
- [ ] 정상 응답 `{latex, result}`
- [ ] 백엔드 다운 시 502 (sympy_unreachable)

---

## 3. Tool calling (D-04 ~ D-05)

- [ ] EULER_TOOLS schema 6종 Anthropic API 호환
- [ ] runReasonerWithTools → 미적분 28번 풀이 시 tool 호출 5회 이상
- [ ] tool 결과 latex 그대로 사용 (변형 없음)
- [ ] **단순 계산 환각 0% 검증**:

| 문제 | tool 호출 횟수 | 정답 | 환각 |
|---|---|---|---|
| ∫_0^1 (x^2+1) dx | | __ | 0 |
| f(x)=x^3-3x 의 극값 | | __ | 0 |
| (x^2-4)/(x-2) 의 lim x→2 | | __ | 0 |

- [ ] EULER_SYMPY_URL 미설정 시 graceful 폴백 (BFS only)
- [ ] useGpt=true (가우스) 시 tool calling 스킵

---

## 4. Family 잠금 (D-06)

- [ ] /euler/family 진입 — 로그인 가드
- [ ] link_family RPC: 자녀 user_id 입력 → 연결 성공
- [ ] set_family_lock_reveal RPC: 부모만 자녀 잠금 가능
- [ ] 잠금 활성 시 orchestrator system 에 lockNote 주입
- [ ] 학생이 "답 보기" 요청해도 정답 직접 공개 안 함 (UX 검증)
- [ ] forbidden_or_not_linked 명시 에러

---

## 5. Academy 대시보드 (D-07)

- [ ] /admin/academy 진입 — ADMIN_EMAILS 가드
- [ ] 4 summary card 정상 노출
- [ ] 학생별 list — L6 recall vs trigger 분리 색
- [ ] 5 학생 더미 데이터 → 정상 표시
- [ ] 익명화 (user_id 8자만)

---

## 6. Toss Payments (D-08)

- [ ] /euler/billing 3 플랜 카드 표시
- [ ] Toss SDK 로드 정상
- [ ] 미설정 키 시 사용자 친화적 알림
- [ ] requestPayment("카드") → Toss 결제창 정상
- [ ] **테스트 카드** 결제 → successUrl `/api/billing/toss/confirm`
- [ ] confirm 라우트:
  - amount 위변조 검증 (Plan 별 금액 hardcode 비교)
  - Toss confirm API 응답 검증
  - user_subscriptions upsert 성공
  - period_end = +30일
- [ ] 실패 시 reason query string 으로 redirect
- [ ] **결제 보안**: paymentKey/orderId/amount 변조 시 모두 차단

---

## 7. Free 한도 강화 (D-09)

- [ ] 구독 active 사용자: 한도 우회 (limit=-1)
- [ ] 구독 만료 시 자동 free 한도 적용
- [ ] 한도 도달 시 429 응답
- [ ] UpsellModal 표시 (used/limit 정확)
- [ ] "12,000원으로 무제한" → /euler/billing 이동
- [ ] "내일 다시" close 정상

---

## 8. End-to-End 시나리오

- [ ] 신규 가입 → 베타 코드 입력 → 채팅 시작
- [ ] 미적분 28번 풀이 (한도 1) → 정답
- [ ] 풀이 11번 시도 (한도 도달) → UpsellModal
- [ ] /euler/billing → Student 12,000원 결제 (테스트 키)
- [ ] /euler-tutor 복귀 → 무제한 풀이 가능
- [ ] /euler/family → 자녀 연결 → 잠금 토글
- [ ] /admin/academy → 반 종합 약점 확인
- [ ] /euler/report → 본인 약점 + 추천 멘트

---

## 9. 빌드·타입체크

- [x] `npx tsc --noEmit` 0 errors
- [x] `pnpm build` 성공

---

## 10. 출시 전 점검

- [ ] 법무 검토 (LEG-02) 통과
- [ ] 만 14세 미만 부모 동의 (LEG-03) 활성
- [ ] 졸업 후 1년 자동 삭제 cron (LEG-04) 등록
- [ ] Vercel 환경변수 모두 production 으로 등록
- [ ] Toss 정식 키 (테스트 → 실 키 교체)
- [ ] Sentry/Logflare 모니터링 등록 (선택)
- [ ] 약관/개인정보처리방침 페이지 라이브 노출
- [ ] 베타 50명 → 일반 사용자 모집 게이트 해제

---

## 합격 선언

- [ ] 위 항목 95% 이상 통과
- [ ] 단순 계산 환각 0% 도달
- [ ] 결제 성공률 99%+
- [ ] **Phase D 종료, 정식 출시 가능**

---

## 다음 단계 (Phase E)

- 사용자 풀이 누적 → RAG 가중치 자가 강화
- 정기결제(빌링키) 도입
- Multi-tenant academy namespace
- 음성 입력 (Conversation 인프라 재활용)
