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
| A. Legend Tutor 보강 | 4 + 1b = 5 (P0-01~04 + P0-01b) | `beta_reviews` 자발 리뷰 모니터링 + chain miss / R1 KaTeX / persona / **area 하드코딩 fix** |
| B. 영어 문법 trigger PoC | 5 (P0-05~09) | `tools.subject_anchor` 도입 / 6 anchor seed / 5문제 ≥ 70% 검증 |
| C. GTM 자료 + 동영상 + 추가 채널 | 7 (P0-10~13d) | 1-pager / 후기 SEO / 텐볼스토리 콜드 메일 / 수만휘 가이드 / 학부모·유튜브 채널 맵 / 시연 영상 1편 / 자동 양산 스크립트 |
| D. 베타 1 → 5명 | 3 (P0-14~16) | active 1명 사용 상태 점검 + 지인 4명 모집 + 온보딩 체크리스트 |

총 **20 task** / 14일. 상세 의존성·일정·검증 KPI: `docs/implementation_plan_phase0.md` 참조.

## 14차 세션 종료 (2026-05-03)

### 완료된 task
- ✅ Δ29 평가셋 정답 정합성 audit + 10건 정정 (`6b26b68`)
- ✅ 컨테스트 → 학생 AI 교육 SW 방향 전환 (`85d6f15`)
- ✅ Phase 0 PRD 5 문서 작성 (Researcher + Architect, `24241f6`)
- ✅ 영어 회화 6 캐릭터 + lip sync (`ef82f75`)
- ✅ 캐릭터 사실적 미국인 스타일 재구현 (`60608c0`)
- ✅ Phase 0 plan 정정 — 인터뷰→리뷰 / 학부모/동영상/양산 task 3종 추가 (`70c6309`)
- ✅ 베타 4명 = 지인 / 시연 영상 = 폰 노이만 결정 반영 (`079f952`)
- ✅ 시연 영상 5분 단축 + 함께 풀이 + 리포트 양 축 (`54afa80`, `9d4d56e`)
- ✅ pending 0 / active 1 P0-14 점검 task 로 변경 (`6396832`)
- ✅ **P0-01 베타 1명 분석 + D1 critical 결함 발견** (`a8f12d1`)
- ✅ **P0-01b area 하드코딩 critical fix — Manager 자동 분류로 위임** (`c7c92a0`)

### 15차 세션 도메인 작업 완료 (2026-05-03)

**`easyedu.ai` (apex primary) 도입 완료**:
- Cloudflare Registrar 구입 + Vercel auto config (apex CNAME flattening, `*.vercel-dns-017.com`)
- Vercel Domains 패널: `easyedu.ai` Production / `www.easyedu.ai` 308 → apex
- Supabase Auth URL Configuration: Site URL `https://easyedu.ai` + Redirect URLs 갱신
- OAuth 3종(Google·GitHub·Kakao) 검증 완료 — provider 콘솔 변경 불필요(Supabase callback URL 만 사용)
- middleware: `vibe-coding-contest.vercel.app` → `easyedu.ai` 301 redirect 만 처리. www↔apex 정규화는 Vercel 위임 (충돌 회피).
- root `middleware.ts` dead code 삭제

**디버깅 흔적**: 초기 commit (`c61851b`) 에 middleware 의 `www → apex` redirect 가 Vercel auto config 의 `apex → www` redirect 와 충돌하여 ERR_TOO_MANY_REDIRECTS 발생 → `e8c5913` 으로 긴급 제거 후 사용자가 Vercel Domains 패널에서 primary 를 apex 로 뒤집음 → 이번 commit 에서 LEGACY redirect 만 안전하게 재추가.

이전 progress 의 "vercel.ts redirect 인프라 ready" 메모는 잘못된 기억 — 실제로는 `src/middleware.ts` 의 `/euler → /legend` 패턴.

### 다음 세션 (15차) 시작점

**P0-02 부터 B 옵션 자율 진행** — 코드 audit·인프라 강화 (베타 데이터 검증은 후속).

순서:
1. **P0-02** chain miss 추적 인프라 강화 (코드 audit)
2. **P0-03** R1 KaTeX 렌더 안정화 (MathText 컴포넌트 점검)
3. **P0-04** persona 응답 일관성 (system prompt 점검)
4. **P0-05~09** B 카테고리 — 영어 문법 trigger PoC (병렬)
5. **P0-10~13d** C 카테고리 — GTM 자료
6. **P0-14~16** D 카테고리 — 베타 확장

### 다음 세션 사용자 액션 (선택 시점)
- 도메인 후보 결정 + 구입 + DNS 설정
- 지인 4명에게 베타 메시지 송출 (P0-15)
- P0-13c 시연 영상 녹화 (자료 준비 후)
- P0-14 active 베타 1명 사용 모니터링

## 도구 / 인프라 (그대로 유지)

- `scripts/audit-markdown-numbers.ts` · `scripts/identify-true-numbers.ts` · `scripts/fix-eval-answers.ts` — 평가셋 정합성 감사 도구
- `services/euler-sympy/` — Python μSvc (Railway)
- Supabase 마이그레이션 17+ — RLS·가드레일·만료·트리거 누적
- Vercel env 19 row — Anthropic / OpenAI / Gemini / 결제·OAuth 키

## Legacy

컨테스트 기간(7일) 동안 작성된 모든 산출물(Phase A~G, KPI 측정, killer 평가셋 보고서, 베타 launch checklist 등)은 `docs_legacy/` 폴더에 그대로 보존되어 있다. git 히스토리도 유지됨. 향후 의사결정에서 참고 자료로 활용.

## 다음 세션 시작 시

1. 이 문서(`progress.md`)로 14차 결과 + 15차 시작점 확인
2. `docs/qa/beta1-defect-list.md` 의 D2~D6 후속 결함 점검
3. `docs/implementation_plan_phase0.md` P0-02 부터 순차 자율 진행 (B 옵션 합의)
4. 도메인 변경은 사용자 결정 후 별도 task
5. 과거 컨텍스트 필요 시 `docs_legacy/progress.md` (13차 / Δ29) 참조
