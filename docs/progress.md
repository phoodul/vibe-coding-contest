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

## PRD / Roadmap (v1.1, 2026-05-02 작성)

비전·시장 가설·가격·아키텍처·로드맵을 4개 문서로 정리했고, Phase 0(2주, 즉시) 의 16 task 분해까지 완료. 다음 세션은 이 문서들을 토대로 진행.

| 문서 | 역할 | 줄 |
|---|---|---|
| [`docs/business-vision.md`](business-vision.md) | 시장 가설 / 차별화 무기(Trigger 라이브러리=정답 도달 핵심 코칭) / B2B2C 사업 모델 / 메가스터디 역전 시나리오 | 341 |
| [`docs/pricing-strategy.md`](pricing-strategy.md) | Tier 5/15/30만 / 단과 학원 1과목 자리 framing / 토큰 경제 / 부모 결제 마케팅 | 378 |
| [`docs/roadmap.md`](roadmap.md) | Phase 0~6 (입증 → 전 과목 → 수능 추론 → 결제 → 출판사 PoC → 출시 → 확장) | 532 |
| [`docs/architecture-platform.md`](architecture-platform.md) | 16 도구 → 출판사 콘텐츠 플랫폼 진화 / Trigger 라이브러리 일반화 / 모델 라우팅·결제·법무 | 611 |
| [`docs/research_raw.md`](research_raw.md) | 외부 리서치 (수만휘·콴다·뤼튼·EBS·토큰 가격·출판사 협상·청소년 결제) | 568 |
| [`docs/implementation_plan_phase0.md`](implementation_plan_phase0.md) | Phase 0 (2주) 16 task 분해 + 14일 일정표 + 회고 체크리스트 | 445 |

### 핵심 thesis (4 문서 공통)

> **콴다·EBS·뤼튼은 "문제의 답"을 주고, 우리는 "답에 이르는 길"을 가르친다.**
> Trigger 라이브러리(수학에서 검증된 89.5% KPI)를 전 과목으로 일반화 → 일타강사 직관을 LLM 명제로 언어화. 단과 학원 1과목 월 20~30만원 자리에 들어가는 AI 코치 — 사교육비 시장에서 새 카테고리가 아닌 **자리 대체**.

## Phase 0 — 입증 자산화 + GTM 시작 (2주, 즉시)

| 카테고리 | Task 수 | 핵심 |
|---|---|---|
| A. Legend Tutor 보강 | 4 (P0-01~04) | `beta_reviews` 자발 리뷰 모니터링 + chain miss / R1 KaTeX / persona 일관성 (운영자 인터뷰 X) |
| B. 영어 문법 trigger PoC | 5 (P0-05~09) | `tools.subject_anchor` 도입 / 6 anchor seed / 5문제 ≥ 70% 검증 |
| C. GTM 자료 + 동영상 + 추가 채널 | 7 (P0-10~13d) | 1-pager / 후기 SEO / 텐볼스토리 콜드 메일 / 수만휘 가이드 / 학부모·유튜브 채널 맵 / 시연 영상 1편 / 자동 양산 스크립트 |
| D. 베타 1 → 5명 | 3 (P0-14~16) | pending 1건 승인 + 4명 시드 모집 + 온보딩 체크리스트 |

총 **19 task** / 14일. 상세 의존성·일정·검증 KPI: `docs/implementation_plan_phase0.md` 참조.

## 도구 / 인프라 (그대로 유지)

- `scripts/audit-markdown-numbers.ts` · `scripts/identify-true-numbers.ts` · `scripts/fix-eval-answers.ts` — 평가셋 정합성 감사 도구
- `services/euler-sympy/` — Python μSvc (Railway)
- Supabase 마이그레이션 17+ — RLS·가드레일·만료·트리거 누적
- Vercel env 19 row — Anthropic / OpenAI / Gemini / 결제·OAuth 키

## Legacy

컨테스트 기간(7일) 동안 작성된 모든 산출물(Phase A~G, KPI 측정, killer 평가셋 보고서, 베타 launch checklist 등)은 `docs_legacy/` 폴더에 그대로 보존되어 있다. git 히스토리도 유지됨. 향후 의사결정에서 참고 자료로 활용.

## 다음 세션 시작 시

1. 이 문서(`progress.md`)로 방향성 확인
2. `docs/business-vision.md` + `docs/roadmap.md` 핵심 thesis 복기
3. `docs/implementation_plan_phase0.md` 16 task 중 P0-01 부터 순차 진행
4. 과거 컨텍스트 필요 시 `docs_legacy/progress.md` (13차 / Δ29) 참조
