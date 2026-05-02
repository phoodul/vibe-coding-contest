# Project Progress — 중고등학생 AI 활용 교육 SW

## Mission

**중고등학생을 위한 거대한 AI 학습 앱**을 만든다. 핵심은 두 가지:

1. **이미 만든 16개 도구를 정교하게 가다듬기** — 학생 12개(영어 회화 / 수학 튜터 / 마인드맵 / 독서 로그 / 단어장 / 학습지 / …) + 교사 4개(수업 준비 / Analytics / …). 각 도구의 학습 효과 · UX · 안정성을 프로덕션 수준으로 끌어올려 "쓸만한 데모"가 아닌 "수많은 학생들이 매일 쓰는 도구"로 만든다.
2. **유료(SaaS) 출시** — 학생 안전(가드레일) · 학습 효과(코칭 품질) · 부모/교사 신뢰(투명한 리포트)를 모든 결정의 우선 기준으로, Next.js 15 + Supabase + Vercel + Anthropic Claude / OpenAI / Gemini 라우팅 위에서 실서비스 수준 운영을 지향한다.

목표는 단순한 "AI를 쓰는 앱"이 아니다. **수많은 학생들이 진짜 배움을 위해 매일 사용하는 큰 AI app** — 신뢰할 수 있고, 효과가 측정되고, 안전하게 운영되는 도구.

## 운영 상태 — Production 라이브

| 영역 | 상태 | 메모 |
|---|---|---|
| Web (Vercel) | ✅ Live | https://vibe-coding-contest.vercel.app (도메인 추후 정정) |
| DB (Supabase) | ✅ 운영 | RLS · 가드레일 · 30일 만료 정책 |
| 인증 | ✅ Google / GitHub / Kakao OAuth | |
| 결제 | ⏸ 보류 (추후 Toss / Stripe 결정) | 베타 검증 후 진입 |
| 분석 | ✅ Vercel Analytics + Supabase usage_events 이중 추적 | |
| 가드레일 | ✅ 9 카테고리 + 위기 상담 ("혼자가 아닙니다") | |
| 베타 게이트 | ✅ 50명 cap + 30일 만료 정책 | |

## 핵심 학습 도구 (학생 12 + 교사 4)

학생용 — 영어 회화 / 수학 튜터 (Legend Tutor 5 페르소나) / 마인드맵 / 독서 로그 / 단어장 / 학습지 등.
교사용 — 수업 준비 / Analytics 등.

상세 구조와 베타 운영 결정 사항은 `docs_legacy/` 의 G-06 산출물(`implementation_plan_g06.md`, `architecture-g06-legend.md`, `task-g06.md` 등) 참조.

## 다음 마일스톤 (유료 출시 로드맵 초안)

### A. 16개 도구 품질 끌어올리기 (코어)
1. **각 도구별 사용성 audit** — 16개 도구를 순회하며 학생/교사가 실제로 막히는 지점을 발견(베타 후기·세션 녹화·Analytics).
2. **개별 정교화 작업** — 도구별로 학습 효과·UX·안정성·접근성 개선 spec 작성 → 우선순위로 처리.
3. **공통 컴포넌트 다듬기** — 가드레일·에러 바운더리·스켈레톤·접근성(WCAG AA)·모바일 최적화를 16개 도구 공통 표준으로 정착.

### B. SaaS 출시 준비
4. **베타 사용자 모집 확장** — 현재 신청 1건 pending, 채널 다양화(커뮤니티·학원·SNS).
5. **유료 가격 정책 시뮬레이션** — Plan A(월 9,900) / B(월 14,900) / C(가족·학원 라이선스) 비교.
6. **결제 통합** — Toss Payments 우선(한국 시장) → 나중에 Stripe 확장.
7. **마케팅 자산** — 베타 사용자 후기 통계 기반 랜딩 페이지·데모 영상.

### C. 운영·신뢰
8. **운영 모니터링** — Sentry · 로그 대시보드 · 가드레일 위반 통계 UI.
9. **부모/교사 신뢰 채널** — 사용 통계 리포트 · 만료/업그레이드 알림 메일.
10. **법무 자문 (LEG-02)** — 변호사 1회 검토 후 결제 활성화.

## 도구 / 인프라 (그대로 유지)

- `scripts/audit-markdown-numbers.ts` · `scripts/identify-true-numbers.ts` · `scripts/fix-eval-answers.ts` — 평가셋 정합성 감사 도구
- `services/euler-sympy/` — Python μSvc (Railway)
- Supabase 마이그레이션 17+ — RLS·가드레일·만료·트리거 누적
- Vercel env 19 row — Anthropic / OpenAI / Gemini / 결제·OAuth 키

## Legacy

컨테스트 기간(7일) 동안 작성된 모든 산출물(Phase A~G, KPI 측정, killer 평가셋 보고서, 베타 launch checklist 등)은 `docs_legacy/` 폴더에 그대로 보존되어 있다. git 히스토리도 유지됨. 향후 의사결정에서 참고 자료로 활용.

## 다음 세션 시작 시

1. 이 문서를 먼저 읽고 현재 방향성 확인
2. `docs_legacy/progress.md` 의 마지막 체크포인트 (13차 / Δ29) 참조
3. 베타 신청 처리 → 마일스톤 1번부터 진행
