# Work Log

> 세션별 주요 변경 이력. 상세 진행 상태는 `docs/progress.md`, 결정 사항은
> `docs/project-decisions.md` 참조.

## 23차 세션 (2026-05-10) — Night mode

**테마**: 결제 활성화 직전 정비 (트랙 A) + Chat rename (트랙 B)

### 누적 6 commits
| 시각 | commit | 영역 | 변경 |
|---|---|---|---|
| 5/10 | `377cc7c` | payment | A1 — legend tutor route 100회 quota 통합 + 23차 plan 추가 |
| 5/10 | `4365a2e` | payment | A2 — PricingClient 토스 V2 SDK + /billing/success 분기 + billing-key 첫 charge |
| 5/10 | `1d5ddb2` | admin | A3 — /admin/billing 환불 검토 + 결제 통계 (3 신규 파일 + nav) |
| 5/10 | `f35da91` | payment | A4 — 정기결제 cron (매일 KST 09시) + vercel.json crons |
| 5/10 | `24bd744` | refactor | B2 — BetaChat → LegendChat git mv + 호출자 2곳 갱신 |

### 변경 통계
- 신규 파일: 5 (admin/billing/page + 2 admin API + cron route + plan_23.md)
- rename: 1 (BetaChat → LegendChat, 99% 유사도)
- 수정 파일: 7 (legend route + PricingClient + billing/success + billing-key route + admin layout + MaestroChat + legend page)

### A5 검증 (commit 없음)
- `/api/billing/cancel` = `cancel_at_period_end=true` 만 set → A4 cron 의
  `eq(.., false)` 필터로 자동 skip. 추가 fix 불필요.

### Pending (다음 세션 사용자 manual smoke 후)
- B1a — LegendChat 안 maestro 분기 코드를 MaestroChat 으로 진짜 이동
- B1b — LegendChat 에서 maestro 분기 코드 삭제 + Legend 1 turn 검증

### 사용자 액션 대기 (베타 종료 후)
1. 사업자 등록 + 토스 가맹점 가입 → vercel env 추가
   - `TOSS_SECRET_KEY` / `TOSS_WEBHOOK_SECRET` / `NEXT_PUBLIC_TOSS_CLIENT_KEY`
   - `NEXT_PUBLIC_PAYMENT_ACTIVE=true`
   - `CRON_SECRET` (cron 호출 가드)
2. Vercel Cron dashboard 에서 `/api/cron/billing-recurring` 등록 확인
3. 토스 dashboard 에서 webhook URL 등록: `https://easyedu.ai/api/payment/webhook`

---

## 22차 세션 (2026-05-08~09)

**테마**: Maestro production 검증 → Maestro/Legend 5 phase 분리 → 결제 시스템 도입

### 누적 12 commits
| 시각 | commit | 영역 | 변경 |
|---|---|---|---|
| 5/8 | `d2a55e0` | chore | 19차 untracked JSON user_docs 이동 (1.8MB repo bloat 회피) |
| 5/8 | `c36f645` | docs | 22차 세션 시작 + `docs/qa/maestro-22-checklist.md` 검증 체크리스트 |
| 5/8 | `d6ffd54` | maestro fix | footer cutoff 6→30pt + 과목별 INPUT_PARSING_RULES + placeholder |
| 5/8 | `966c56c` | maestro feat | 풀이 정리 (`/api/maestro/build-summary`) + 활동 리포트 1차 |
| 5/9 | `30e49a3` | maestro feat | `/maestro/[subject]/triggers` 시드 JSON 분리 |
| 5/9 | `6754b55` | refactor | Phase 1 — Subject + maestro 페르소나 타입 분리 |
| 5/9 | `36f91aa` | sql | Phase 3 — `maestro_tutor_sessions` + `maestro_summaries` |
| 5/9 | `85c2412` | refactor | Phase 2 — `/api/maestro/[subject]/tutor` 신설 |
| 5/9 | `1cda757` | feat | Phase 5 — DB 누적 활성화 + 리포트 차트 실 데이터 |
| 5/9 | `9b12504` | refactor | Phase 4 — `MaestroChat` wrapper + 4 페이지 import |
| 5/9 | `febdb7c` | payment | 결제 DB 5 테이블 + 약관 4종 페이지 |
| 5/9 | `99fd491` | payment | 토스 SDK + 6 API + `/pricing` + `/billing` + 100회 quota |

### 변경 통계
- 신규 파일: 30+
- 신규 SQL 마이그레이션: 2 (maestro_dedicated · payment_system)
- 신규 약관 페이지: 4 (terms · privacy · refund · business-info)
- 신규 API endpoints: 9 (maestro 3 + payment 6)
- 신규 lib 모듈: 5 (legal/meta · payment/plans · payment/toss · payment/quota · maestro/seed-loader · maestro/types)

### 사용자 액션 대기
1. SQL 마이그레이션 2건 Supabase Dashboard 적용
2. Footer 재추출 + 재업로드 (1598 PNG)
3. 시각 검증 16 페르소나
4. 사업자 등록 + 토스 가맹점 가입 → vercel env 추가 → 결제 활성화

---

## 21차 세션 (2026-05-07~08)
**테마**: Maestro multimodal 디버깅 5 root causes 해결
- 누적 19 fix commits (`407a6cb` ~ `0db1844`)
- 진짜 결정타 = Vercel Hobby Blob bandwidth → Pro upgrade
- Maestro 가 첫 진짜 Gemini provider 사용 코드 발견

## 19차 세션 (2026-05-06~07)
**테마**: Maestro 4 과목 신설
- 4 maestro 페이지 + 16 페르소나 (4 모델 매핑)
- 1598 수능 PNG + Vercel Blob 업로드
- 120 trigger 도구 시드

이전 세션 이력은 `docs/progress.md` 참조.
