# Workflow Progress — Euler Tutor 2.0

## Last Checkpoint
- Time: 2026-04-30 (**9차 세션 종료** — 4일 누적 Night·Day mode 통합)
- Phase: **Phase G-06 ✅ 진정 완결** + G06-33·34·35 (Δ10·Δ11·Δ12) — Legend Tutor production 라이브
- Status: **베타 모집 즉시 시작 가능** (검증된 4 결함 fix + 베타 신청·승인·리뷰 시스템 완비)
- Git: clean, origin/main 동기화 (commit `086f828` 마지막)
- vitest: **374/374 PASS** baseline
- 다음 세션 (10차 G-07) 후보:
  1. 베타 사용자 누적 → 리뷰 통계 분석 → 마케팅 자료
  2. Sonnet baseline + Critic 옵션 검증
  3. /api/euler-tutor callTutor 본격 위임
  4. R2 Weekly/Monthly Report 강화
  5. 한글 손글씨 OCR 정확도 진단 (베타 데이터 기반)
  6. 유료 가격 정책 다변화 (Plan A/B/C 시뮬레이션)
  7. 학습지 통합 PoC (Phase I 진입)
- Step (마지막): **G06-35 ✅ Night mode** — 베타 시뮬레이션 발견 결함 4종 통합 fix.
  - **(35a) Manager 난이도 prompt 강화**: `stage1-manager.ts` system 프롬프트 50+줄 — 6/9/12/14/21/29번 정밀 매핑 + few-shot 10개 + (가)(나)(다) 보수적 분류 가이드.
  - **(35b) 선택 튜터 일관성**: `build-summary` body 에 `selected_tutor` (6 enum 검증). BetaChat selectedTutor state → SolutionSummaryButton → API 전파. 풀이 정리도 채팅 튜터로 강제.
  - **(35c) 모델명 숨김**: portraits.ts `persona_desc` 신규 ("수학의 왕자" 등). TutorBadge default = persona_desc. PerProblemReportCard / TutorChoicePrompt / TutorPickerModal raw 모델명 노출 제거.
  - **(35d) ToT + Trigger 정상화**: callModel agentic system prompt 에 `[STEP_KIND]` / `[TRIGGER]` 마커 강제. step-decomposer 마커 1차 + heuristic 2차 + ANN 3차 매칭. threshold 0.7 → 0.5. tree-builder 빈 트리 fallback (s-fallback 노드).
  - 검증: tsc ✅ + vitest **374/374 PASS** (신규 28 + 회귀 0) + next build ✅
- Session: 12차 Night mode (**G-06 + Δ12 ✅**, 다음 단계: 베타 모집 시작 + git push)

## 이전 Checkpoint (G06-34, 2026-04-30 11차 Night)
- Time: 2026-04-30 (11차 세션 Night mode — **G06-34 ✅ 베타 리뷰 시스템 — 5 항목 자율 후기 + 공개 페이지 (Δ11)**)
- Phase: **Phase G-06 ✅ + G06-33 (Δ10) + G06-34 (Δ11)** → 베타 모집 + 출시 마케팅 자산 확보
- Step: **G06-34 ✅ Night mode** — 기존 G06-23 인터뷰 폐기 → 자율 글 후기 시스템.
  - **(a) DB**: `beta_reviews` 테이블 + RLS 4종 (본인 read/insert/update + 공개 anon read) + `get_beta_review_stats()` RPC (anon, public 만 집계)
  - **(b) API**: POST/GET `/api/legend/beta/review` (인증 + access_tier='beta' 가드, 5 항목 검증, upsert) + GET `/api/legend/reviews` (anon 가능, 통계 + 페이지네이션 10건/page, sort=latest|rating)
  - **(c) UI**: `/legend/beta/review` (Server + redirect 가드 + 본인 기존 리뷰 fetch) + `BetaReviewForm` (5 항목 Framer Motion: 별점·튜터 카드·구매 의향 토글·글자수 카운터·공개 토글) + `/legend/reviews` (공개 페이지) + `ReviewStatsHero` + `ReviewsList`
  - **(d) 진입점**: `BetaChat` 헤더 "📝 후기" 버튼 + 메인 홈 student 카드 "베타 후기" 추가
  - **(e) 회귀**: 기존 327 → **344 PASS** (+17 신규 review 테스트, 회귀 0)
  - 검증: tsc ✅ + vitest 344/344 PASS + next build ✅ (`/legend/beta/review` 3.79kB + `/legend/reviews` 2.36kB + API 2 라우트)
- Session: 11차 Night mode (**G06-34 ✅**, 다음 단계: 베타 모집 시작 + 베타 사용자 후기 누적 → 출시 시점 마케팅)

## 이전 Checkpoint (G06-33, 2026-04-29)
- Time: 2026-04-29 (10차 세션 Night mode — **G06-33 ✅ 풀이 정리 진입 + trigger_motivation + LaTeX·typewriter UX (Δ10)**)
- Phase: **Phase G-06 ✅ + G06-33 (Δ10)** → 베타 모집 시작 가능
- Step: **G06-33 ✅ Night mode** — 메인 채팅 (`/legend` BetaChat) UX 결함 4종 통합 fix.
  - **(a) 풀이 정리 진입**: 신규 `/api/legend/build-summary` + `SolutionSummaryButton` + 인라인 `PerProblemReportCard` (마지막 assistant 메시지 직후 자동 노출 가능, 클릭 → routeProblem → callTutor → buildReport → 인라인 R1)
  - **(b) trigger_motivation**: schema 1.2 → 1.3, "💡 떠올린 이유" 차원 신규 (어떤 조건·패턴이 이 도구를 떠올리게 했는가). solution-summarizer 가 primary_trigger 카드 컨텍스트 받아 학생 친화 톤 생성
  - **(c) LaTeX 깜빡임 fix**: rehypeKatex `{ throwOnError:false, errorColor:#888888, strict:'ignore' }` + 홀수 `$` 감지 시 마지막 `$` escape (incomplete inline math 안전)
  - **(d) Typewriter throttle**: 신규 `StreamingMarkdown` 컴포넌트 + useDeferredValue (마지막 assistant + 스트리밍 중일 때만, 종료 시 즉시 동기화)
  - **회귀 fix**: 기존 quota-manager 17건 + access-tier 5건 (Δ9 admin 가드 추가 후 supabase mock auth.getUser 누락) → mock 에 admin 가드 stub 추가
  - 검증: tsc ✅ + vitest **327/327 PASS** (+10 신규 build-summary + 회귀 22건 fix) + next build ✅
- Session: 10차 Night mode (**G-06 + G06-33 ✅**, 다음 단계: **베타 모집 시작 가능** + git push origin main)

## 이전 Checkpoint (G06-30)
- G06-30 ✅ Tier 1 라마누잔 = Gemini 3.1 Pro baseline + Sonnet 429 fallback (Δ8). commit `3048b46`. vitest 252/252.

## 이전 Checkpoint (G06-28)
- G06-28 ✅ R1 풀이 정리 섹션 (Δ7) — schema 1.2 + SolutionSummary 4 필드 + Haiku ~$0.001/문제 + 차원 분리 (정직성 vs 학습 코치). commit `081c5d0`.

## G-06 완결 — 핵심 성과
- **브랜드 변경**: Euler Tutor → Legend Tutor (5 거장 튜터)
- **5-튜터 라우팅**: 라마누잔 (Tier 0+1) / 가우스 / 폰 노이만 / 오일러 / 라이프니츠
- **3-Stage Adaptive Router**: similar_problems 매칭 → Manager Haiku → 라마누잔 probe → escalation 권유
- **R1 Per-Problem Report**: 추론 트리 (Δ4 ToT) + LLM struggle (Δ3) + trigger 확장 + stuck 신호
- **5종 quota 통합 (Δ1)**: 베타 5문제/일·레전드 3회/일·R1 1회/일·주간 1회·월간 1회 + 자격 게이트 (10/20)
- **흉상 이미지 5종**: 오일러·가우스 (기존) + 폰 노이만·라마누잔·라이프니츠 (신규, Wikimedia PD)
- **M8 베타 모집 준비 ✅**: TutorChoicePrompt 격 차별화 (G06-26) + 베타 신청·승인 시스템 + 피드백 동의 필수 (G06-27)
- **M9 R1 UX 개선 ✅**: SolutionSummarySection 풀이 정리 (G06-28, Δ7) — schema 1.2 + Haiku ~$0.001/문제 + 차원 분리 (정직성 vs 학습 코치)
- 26 commits / 28 tasks (G06-23 deferred — 베타 모집 후 별도) / **248 vitest PASS** / 회귀 0

## Next Action (10차 세션 G-07)
1. 베타 사용자 모집 및 G06-23 인터뷰 (5명 1주)
2. `/api/euler-tutor` 의 callTutor 위임 본격 이관 (G-06 보류 사항)
3. R2 Weekly/Monthly Report 강화 (현재는 R2 인프라 재활용만)
4. KPI 38문항 풀 측정 (server-side, R1 persist 검증)
5. 38문항 평가셋 풀 채점 (G06-22 의 3문항 한계 보강)

## 8차 세션 핵심 성과 — KPI 85% 게이트 통과 ⭐

| 모델 · 모드 | killer 38문항 | 기하 10문항 | 게이트 |
|---|---|---|---|
| **Gemini 3.1 Pro agentic** | **89.5%** ⭐⭐⭐ | 10% (quota 초과) | ✅ killer |
| **GPT-5.5 agentic** | **86.8%** ⭐⭐ | **100%** ⭐ | ✅ |
| Sonnet 4.6 agentic | 81.6% | 80% | ❌ |
| Opus 4.7 baseline | 78.9% | 90%, 39초 ⚡ | ❌ |
| Opus 4.7 agentic | 81.6% | 90% | ❌ |

영역별 1위:
- 가형(2017~2021): Sonnet 4.6 agentic 100%
- 공통(2022~2026): Gemini 3.1 Pro agentic 90%
- 미적분(2022~2026): Opus 4.7 baseline 100% / GPT-5.5 agentic 100%
- 기하(2022~2026): GPT-5.5 agentic 100% / Opus 4.7 baseline 90%

## G-05c — Gemini 429 진단 (세션 종료 직전)

원인 확정: **Gemini 3.1 Pro Preview 모델은 paid tier Tier 1 도 250 RPD 강제 한도** (Preview 모델 정책).
- 우리 누적 호출 ~350 → 429 RESOURCE_EXHAUSTED
- 보강 (safetySettings BLOCK_NONE + finishReason 로깅 + agentic trace 보강) 효과 측정 불가 (quota 초과로 0/10)
- 진짜 baseline 정답률은 30~40% (응답 잘림 다수, max_tokens 5000 으로도 일부 절단)
- **9차 세션 결정 필요**: GA 모델 전환 / Vertex AI / 24시간 대기 / 다른 모델 라인업

## 운영 상태 — Production 라이브

| 영역 | 상태 | URL/메모 |
|---|---|---|
| Web (Vercel) | ✅ Live | https://vibe-coding-contest.vercel.app |
| DB (Supabase) | ✅ 17 마이그레이션 (G-04 +3) | wrcpehyvxvgvkdzeiehf |
| 시드 (math_tools) | ✅ 244 도구 / 463 trigger / 926 임베딩 | data/math-tools-seed/ |
| 외부 도구 (Phase F) | ✅ SymPy 25 + Z3 + matplotlib | services/euler-sympy/ |
| 4채널 trigger 입력 (G-04) | ✅ 시드/Haiku/직접/자동 mining | /admin/{math-tools,contributors,candidate-triggers} |
| KPI 평가셋 | ✅ 38 killer + 10 geometry + 45 합성 | user_docs/suneung-math/eval/ + data/ |
| Vercel env | ✅ 19 row 등록 | EULER_*, ANTHROPIC_HAIKU, CRON_SECRET |
| 베타 게이트 | ✅ 동작 검증 | 코드 EULER2026, 50명 cap |
| GEMINI_API_KEY | ✅ paid tier (Preview RPD 250 한도 발견) | .env 등록 |

## Next Action (9차 세션)

1. Gemini 모델 결정 — GA 전환 (gemini-3-pro 등) vs Vertex AI vs 다른 라인업
2. G-06 4-튜터 다변화 (오일러/라이프니츠/가우스/페르마) + 영역별 라우팅 라이브 배포
3. 학생 선호도 측정 인프라 (별점 + tutor_choice 추적)
4. agentic streaming UI (체감 속도 ↑)
5. 베타 사용자 모집 + 운영 모니터링

## 운영 상태 — Production 라이브

| 영역 | 상태 | URL/메모 |
|---|---|---|
| Web (Vercel) | ✅ Live | https://vibe-coding-contest.vercel.app |
| DB (Supabase) | ✅ 14 마이그레이션 적용 | wrcpehyvxvgvkdzeiehf |
| 시드 (math_tools) | ✅ **244 도구 / 463 trigger / 926 임베딩** (avg 1.90) | data/math-tools-seed/ + math-tools-seed.json |
| 운영 도구 추가 | ✅ 웹 UI + API | /admin/math-tools |
| 외부 도구 (Phase F) | ✅ SymPy 25 + Z3 + matplotlib | services/euler-sympy/ |
| Wolfram Alpha | ⏸ 코드 완료 / WOLFRAM_APP_ID 발급 대기 | $5/월 plan |
| KPI 평가셋 | ✅ 45문항 8영역 + cross_check_query | data/kpi-eval-problems.json |
| μSvc (Railway) | ✅ Live | https://vibe-coding-contest-production.up.railway.app |
| Vercel env | ✅ 19 row 등록 (Production + Preview) | EULER_*, ANTHROPIC_HAIKU, CRON_SECRET 포함 |
| 베타 게이트 | ✅ 동작 검증 | 코드 `EULER2026`, 50명 cap |

## Completed
- [x] Phase 1: Research — `docs/research_raw.md`
- [x] Phase 2: Integration — `docs/integrator_report.md`
- [x] Phase 2: Planning — `docs/architecture.md`, `docs/task.md`, `docs/implementation_plan_euler.md`
- [x] Phase 2: 결정 사항 명문화 — `docs/project-decisions.md`
- [x] **Approval Gate 1**: 통합 보고서 승인 완료
- [x] **Approval Gate 2**: task.md 승인 완료

### Phase A (15/15) ✅ — Critic + 필기 + 베타 게이트
### Phase B (16/16) ✅ — pgvector + Manager + Retriever + 검수 어드민
### Phase C (13/13) ✅ — Reasoner BFS + 약점 리포트 + Free 한도
### Phase D (10/10) ✅ — SymPy μSvc + Family/Academy + Toss

### 법무·운영 (3/4)
- ✅ LEG-01: 이용약관 + 개인정보처리방침 초안
- ⏸ LEG-02: 변호사 자문 (외부, 30~80만원 — 베타 검증 후 진행)
- ✅ LEG-03: 만 14세 미만 부모 동의
- ✅ LEG-04: 졸업 + 1년 PII 익명화 cron + profiles 컬럼 보강

### 3차 세션 추가 작업 (2026-04-26)

**B (KPI 평가)**: `5c559bb`
- 합성 10문항 + standalone eval 스크립트 + 검증 문서

**D (Refactor)**: `ad33aef`
- tryParseJson 5곳 중복 단일화 + difficulty-classifier 죽은 코드 삭제
- layer-stats-updater last_failure_at 버그 수정 + parse-image 인증 가드

**A (배포 자동화)**:
- `e545986` Supabase 마이그레이션 14종 적용 + LEG-04 cron 정정 + 배포 런북

**5개 운영 버그 수정 (베타 시작 직전 발견)**:
- `0d0e48f` SW 외부 origin 가로채기 → fetch 실패 (외부 origin 패스)
- `9a06d9d` SymPy worker thread signal ValueError (graceful skip)
- `b702b29` `/auth/login` 404 → `/login` 정정 (5 파일)
- `2db955b` + `8994eb2` `redeem_euler_beta` SQL ambiguous 참조 (status 컬럼)

**Phase E 통합 UX 개선** (사용자 피드백 기반):
- `7a1b822` 채팅+필기 한 세션 통합 + 🆕 새 문제 + 📊 리포트 진입점
- `ae5fee6` + `2da4ebb` 주 1회 리포트 + 자격 게이트 (7일+10문제)
- `37c7db0` Vision LLM (Claude Sonnet 4.6) + 인라인 패널 + OCR 미리보기·수정
- `4503583` OCR 결과 KaTeX 렌더링 (raw 편집 details 분리)
- `7afdf15` 필기/이미지 펼침 시 마지막 메시지 자동 스크롤

총 3차 세션 14 commits, production 운영 인프라 + UX 개선 모두 완료.

### 4차 세션 추가 작업 (2026-04-26)

**시드 영역 확장**: `1909c54`
- `data/math-tools-seed/` 디렉터리 (8 영역 분리 관리)
- middle 35 / common 34 / math1 29 / math2 30 / probability 30 / geometry 25 / calculus_extra 29 + 기존 32 = **244 도구**
- 262 trigger / 524 임베딩 적재 (≈ \$0.001)
- Manager area enum 8단계 + UI MATH_AREAS 8개 카드

**운영 도구 추가 UI**: `859cdca`
- POST/GET `/api/admin/math-tools` (insert + 임베딩 + 롤백)
- `/admin/math-tools` 헤더 + AddToolForm (동적 trigger N개)
- 운영 중 1건씩 점진 추가 채널 완성

→ 3중 확장 채널 (LLM 시드 / 운영자 UI / Reasoner 자동보고) 완성.

## Next Action (사용자 직접 단계)

1. **베타 사용자 풀이 검증** — 본인 + 지인으로 시나리오 재현
2. **베타 50명 모집** — 코드 `EULER2026` 공유
3. **법무 자문 (LEG-02)** — 변호사 1회 30~80만원 (베타 검증 후)
4. **KPI Full 측정** — `pnpm dlx dotenv-cli -e .env -- pnpm dlx tsx scripts/eval-kpi.ts --full`
5. **풀이 누적 7일+10문제 후 리포트 검증** — 주 1회 자동 갱신

## 7차 세션 완료 (2026-04-27 Night, 자율)

### Phase G-03 — chain miss 추적 + Trigger 보강 + KPI A/B 측정

| 커밋 | 내용 |
|---|---|
| e27a1b5 | G03-A: euler_solve_logs 에 chain_termination/depth/used_tools 컬럼 (마이그레이션 + logger + orchestrator + weakness aggregator + report page ChainTerminationChart) |
| 0377124 | G03-B: scripts/augment-triggers.ts (Haiku 자동 trigger 생성) → 9 영역 +201 trigger / 244 도구 / 463 trigger / avg 1.07 → 1.90 |
| 9fd6d8d | G03-C: scripts/eval-kpi.ts --chain 플래그 + 45 문항 A/B 측정 (baseline vs chain) + docs/qa/kpi-chain-ab-report.md |

### KPI A/B 측정 핵심 결과

| 지표 | Baseline | Chain ON | Δ |
|---|---|---|---|
| **난이도 ≥5 정답률** | 9/19 = **47.4%** | 9/19 = **47.4%** | **0pp** |
| 전체 정답률 | 66.7% | 68.9% | +2.2pp (난이도 3 1건 우연) |
| Retriever top-3 | 68.9% | 68.9% | 0pp |
| Retriever top-5 | 77.8% | 75.6% | -2.2pp (오차) |
| Chain 19/45 실행 | — | 19/19 reached, avg depth 2.21 | 100% 종료 성공 |

**결론**: chain 알고리즘은 robust 하나 Sonnet 단발이 이미 강해 정답률 영향 미미.
하지만 chain 시각화의 학생 코칭 가치는 별개 — Phase G-03 누적 데이터로 향후 측정 가능.

향후 개선 후보 (Phase G-04):
- chain min_depth 강제 (depth=1 reached 막기) → ToT 효과 살리기
- chain inject 강화 (참고 → 의무)
- SymPy tool 호출을 chain step 마다 강제 (계산 오류 차단)
- 실제 수능 28~30번 평가셋 확보

## 6차 세션 완료 (2026-04-27 Night, 자율)

### Phase G-02 — Recursive Backward Reasoner + 8-Layer + chain 시각화

| 커밋 | 내용 |
|---|---|
| a6e3d2d | G02-A: Manager 8-Layer 출력 (needs_layer_8/area_layer_5/layer_6_difficulty/layer_7_direction/computational_load) + effectiveDifficulty/shouldRunRecursiveChain |
| b0d682b | G02-B: recursive-reasoner.ts 모듈 + buildSubgoalDecomposePrompt + chainToCoachingText (Self-Ask/ToT/CoVe 학술 근거) |
| 8bc6bf7 | G02-C: orchestrator route.ts 통합 — chainContext systemPrompt inject + StreamData payload (시각화용) |
| d008659 | G02-D: BackwardChain 컴포넌트 + page.tsx 첫 user 메시지 직후 노출 ("선생님은 이렇게 생각했어요") |

### 중학교 시드 학년별 분리

| 커밋 | 내용 |
|---|---|
| 09782c6 | MID-A: middle.json (35) → middle1.json (8) + middle2.json (8) + middle3.json (19) — 한국 2015 개정 교육과정 |
| 2e79ae4 | MID-B: Manager area enum + EULER_TOOLS_BY_AREA + REASONER_THRESHOLD_BY_AREA + KOREAN_AREA_MAP + MATH_AREAS UI 8→10 카드 |

### 핵심 가치
- **방법 찾기 코칭의 본질화**: 난이도 5+ 문제는 chain 카드로 "왜 이렇게 생각했는지" 가시화
- **8-Layer 분리**: insight gap (layer_6) vs computational load 분리 → 정확한 분기
- **중학교 학년별 진입점**: 학습자가 자기 학년 도구 셋만 보도록 격리 (Retriever 결과는 동일하나 UX 분리)

### 사용자 검증 대기
- 어려운 문제 (수능 30번류) 1건 → chain 5 depth 도출 + 시각화 카드 노출 확인
- chain 데이터가 streamData 로 도착하는지 useChat 클라이언트 검증
- middle1/2/3 카드 진입 후 Manager 가 정확히 학년 area 반환하는지

## 5차 세션 완료 (2026-04-26 ~ 27)

### Phase F (외부 도구 통합) — 단일 커밋 + 후속 패치
| 커밋 | 내용 |
|---|---|
| 8787d0b | Phase F 8 task: SymPy 25 + Wolfram + Z3 + matplotlib + cross-check + KPI 45 |
| 72297b1 | Wolfram endpoint Full Results → LLM API 전환 |
| 15cc36d | LLM API 결과 섹션 추출 강화 (17 헤더 인식) |
| bc86d51 | F-09 cross-check 를 orchestrator 통합 + wolfram-query-builder |
| a60453d | Manager area 한글 응답 정규화 + 진단 로그 |
| 8e2436d | Reasoner 임계값 공격적 하향 (학생 신뢰 우선) |
| 4deb4c5 | 429 admin bypass + BFS skip when tools + maxSteps 5→3 |
| 877a735 | 임계값 균형 재조정 (단순 = LLM 단독, calculus 만 3+) |

### Phase G-01 (방법 찾기 코칭 본질 회복)
| 커밋 | 내용 |
|---|---|
| 4f790d0 | 💡 문제 해결 전략 버튼 + EULER_SYSTEM_PROMPT 4단계 가이드 |

### 사용자 작업 (배포·키)
- ✅ Wolfram App ID 발급 + Railway env 등록 + 재배포 검증
- ✅ Vercel env `EULER_CROSSCHECK_ENABLED=true` 등록
- ✅ Manager 정상 동작 확인 (area="math2", reasoner=Y, with-tools 호출)

### 운영 검증
- 단순 정적분 (difficulty 2): LLM 단독 — 빠름
- 어려운 문제 (difficulty 5+): SymPy 검증 + Wolfram cross-check (호출 임계값 5+)
- 모든 영역 area enum 정규화 동작

## 다음 세션 (6차) 첫 Task — Phase G-02 ⭐

**핵심 통찰 (사용자 정립)**:
- "Euler Tutor 의 진짜 매력 = 방법 찾기 코칭, 계산 X"
- "난이도 = 도구 선택의 비자명성 (Layer 6 + Layer 7), 계산 복잡도 X"
- "킬러 문제는 LLM 도 못 푼다 — multi-turn 분해 질문이 정답률 ↑"
- "chain 시각화는 난이도 5+ 만 (단순엔 억지)"

### G-02 구현 (예상 단일 세션)

1. **Recursive Backward Reasoner**
   - `recursiveBackwardChain({problem, conditions, goal, maxDepth=5})`
   - 각 depth: Layer 6 retrieve → Sonnet 분해 질문 → 다음 subgoal
   - 종료: subgoal 이 conditions 와 매칭

2. **Manager 8-Layer 명시화**
   - 출력: `needs_layer_8` / `area_layer_5` / `layer_6_difficulty` / `layer_7_direction` / `computational_load`
   - difficulty 단일 값 → 두 차원 분리 (insight gap + computational load)

3. **chain 시각화 (난이도 5+ 만)**
   - "선생님은 이렇게 생각했어요" 형식
   - 학생 막힘 시 chain 의 다음 노드 1개만 질문으로 노출

4. **학술 근거 적용**
   - ToT (Yao 2023, GPT-4 24-game 4%→74%)
   - Self-Ask (Press 2023)
   - CoVe (Dhuliawala 2023)

### 기타 후보 (Phase G 외)
- 영역별 trigger 보강 (현재 평균 1.1 → 1.5+)
- 베타 사용자 풀이 모니터링 (candidate_tools 채우기)
- 기출문제 DB 영역 확장 (현재 calculus 위주)
- Tier 2 (Phase H): GeoGebra · Lean 4 · Desmos · Manim

## 핵심 산출물 요약

- **마이그레이션 14종 적용** (Supabase MCP 자동)
- **시드 32 도구 / 39 trigger / 78 임베딩** 적재
- **신규 페이지 10종** (/euler/{canvas,beta,report,family,billing}, /admin/{math-tools,academy}, /signup/parental-consent, /legal/{terms,privacy})
- **API 라우트 13종** (인증 가드 일관)
- **lib/euler 14 모듈**
- **컴포넌트**: HandwriteCanvas / InlineHandwritePanel / ThoughtStream / UpsellModal
- **Python μSvc** (services/euler-sympy/, Railway 배포)
- **법무 페이지 3종**
- **KPI 평가 자동화** (10문항 + 4 KPI)
- **배포 런북** (docs/deployment-runbook.md)

## 주요 결정·정책

- **Vision LLM (Claude Sonnet 4.6)** for handwriting OCR (Mathpix 한글 약점 보완)
- **Mathpix** for printed photos/screenshots (인쇄체 강점 유지)
- **주 1회 리포트** (windowDays=7, 첫 풀이 +7일 + 10문제 자격 게이트)
- **베타 50명 cap** + EULER2026 코드
- **LEG-02 자문** — 베타 후 결제 활성화 전 진행
