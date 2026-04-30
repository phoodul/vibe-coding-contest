# Euler Tutor 2.0 — 확정 결정 사항

> 작성일: 2026-04-25 ~ 2026-04-26
> 본 문서는 Euler Tutor를 SaaS급으로 업그레이드하는 결정의 기록이다. 다음 세션에서 이 결정을 다시 흔들지 않도록 명문화.

---

## [2026-04-25] 프로젝트 방향 — Euler Tutor 2.0

- **결정**: 기존 EduFlow의 Euler Tutor(현재 단일 LLM 호출 + 530문항 풀이 캐시)를 6계층 다중 에이전트 + 도구 라이브러리 + 필기 인터랙션으로 전면 업그레이드한다. 별도 프로젝트가 아닌 EduFlow 내부 핵심 기능 강화.
- **이유**: 대회는 종료. SaaS 상용화 단계. Euler가 가장 차별화 가능한 기능. Google Lens·콴다와 풀이 정확도로는 경쟁 불가, "코칭/필기/추적/B2B"로 차별화.
- **영향**: `src/app/euler-tutor/*`, `src/app/api/euler-tutor/*`, `src/lib/euler/*`(신규), `supabase/migrations/*`(신규) 범위로 격리. MindPalace/English/Conversation/수업준비 무영향.

## [2026-04-25] 정답률 목표

- **결정**: 수능 95%는 비현실. 영역별 차등 목표 — 1~25번 96% / 26~28번 90% / 킬러 77% / 학교 모의고사 94% / 풀이 만족도 93%.
- **이유**: SOTA(GPT-5.4, Gemini 3.1)도 단일 호출로 수능 킬러 6개 중 1개만 정답. 6계층 풀구현해도 학계 천장 75~85%.
- **영향**: 마케팅 슬로건 "수능 95% 풀이" 금지. "답을 가르치지 않는 코치"로 포지셔닝.

## [2026-04-25] 4-Phase 로드맵

- **결정**: Phase A(MVP, 3~4주: Critic + 필기 모드) → B(3~4주: 도구 RAG) → C(3주: Reasoner BFS + 학습 리포트) → D(2~3주: SymPy + 결제). Phase E는 사용자 풀이 누적 후 RAG 가중치 자가 강화.
- **이유**: Critic + 필기는 Google Lens가 못 따라하는 핵심 격차. 즉시 베타 가치 입증 가능.
- **영향**: `docs/task.md` 58 task. 주 30시간 기준 6~8주 MVP.

## [2026-04-25] 타깃 시장 — 듀얼 펀널

- **결정**: 초·중·고 전체 + 학원 B2B + 부모 B2C 프리미엄. 풀이 정확도가 아닌 코칭/추적/필기로 차별화. 시작 단원은 **고3 미적분**.
- **이유**: Google Lens는 컨닝 도구 카테고리. 학교/학원이 받아들일 수 없음. 우리는 "학원이 안심하고 도입하는 학습 도구". 미적분은 객단가↑, 차별화 강함.
- **영향**: 가격 4-tier (Free / Student 12,000원 / Family 19,000원 / Academy 학생당 5,000~8,000원).

## [2026-04-26] 핵심 기술 결정

- **오케스트레이션**: Next.js 15 + AI SDK v4 `generateText` 다단 호출. LangGraph(Python) 도입 보류. 1인 운영 부담 최소화.
- **모델 분담**: **useGpt 토글이 Reasoner/Coaching만 분기 (Sonnet 4.6=오일러 ↔ GPT-5.1=가우스)**. Manager/Critic/Retriever는 항상 Haiku 4.5 (학생 토글 무관, 비용 절감).
- **CAS**: Phase A~C는 Anthropic tool calling으로 우회. Phase D에서 Railway FastAPI + SymPy ($5~10/월).
- **벡터 DB**: Supabase pgvector. **`(tool × trigger)` 곱집합 인덱싱** + `direction(forward/backward/both)` + `embedding_forward/embedding_backward` 분리.
- **OCR**: 기존 Mathpix → Upstage → Vision fallback 유지. 필기 모드에서 `handwritten: true`.
- **파인튜닝**: 미도입. RAG + few-shot. 사용자 1,000명 + 풀이 10,000건 누적 후 o4-mini RFT 검토.

## [2026-04-26] 입력 모드 — 4가지 공존

- **결정**: 텍스트(기존 유지) + 이미지 사진(기존 유지) + 필기(Phase A 신규) + 음성(추후 검토). 모두 같은 orchestrator 라우트로 흘러감.
- **이유**: 환경별로 자연스러운 입력 다름 — 데스크톱은 텍스트, 폰은 사진, iPad는 필기. 필기는 Google Lens가 못 따라하는 핵심.
- **영향**: orchestrator 요청에 `input_mode` 필드. Phase A에서 `/euler/canvas` PWA 진입점 추가.

## [2026-04-26] 도구 라이브러리 출처 — 4-Tier Hybrid

- **결정**:
  - Tier 1: LLM parametric 자동 보고 (DB 비어있어도 작동)
  - Tier 2: 자동 큐레이션 (빈도 임계값 → 검수 큐)
  - Tier 3: 외부 데이터셋 임포트 (사용자 1,000+ 후 ProofWiki 검토, MVP 단계 보류)
  - Tier 4: 사용자(교사) 정석/교과서 사진 등록 (B2B 핵심)
- **이유**: 사용자 직접 입력만으로는 지속 불가능. "사용할수록 자동 진화"가 SaaS의 본질. 자체 학습 = RAG 가중치 자가 강화 (모델 가중치 학습 아님).
- **영향**: `candidate_tools` 테이블 + Tier 1 자동 보고 라우트 + 검수 어드민 화면 (Phase B).

## [2026-04-26] 시드 데이터 정책

- **결정**: 시드 자동화 파이프라인 우선. 30개는 MVP 검증 최소값. 운영 중 점진 확장 (Phase B ≥30, C ≥100, D ≥300, 1년 후 ≥1,500).
- **이유**: 사용자 직접 입력 부담 최소화. Mathpix → Sonnet 메타데이터 자동 생성 → 사용자 5분 검수 패턴.
- **영향**: `scripts/seed-math-tools.ts` + `scripts/seed-from-image.ts` (B-05).

## [2026-04-26] 코칭 vs 답 공개 정책

- **결정**:
  - 학생이 명시적으로 "포기/답 보기" 클릭 시 답 공개 (b 옵션)
  - 답 공개 후에도 "왜 그렇게 푸나?" 질문 시 사고 과정 설명 강제
  - Family/Academy: 부모/교사가 `lock_reveal=true` 토글 가능
- **이유**: 학생이 끝까지 막히면 좌절. 답 공개를 허용하되 학습 효과는 보존.
- **영향**: orchestrator `reveal_answer` 처리 + Coaching 프롬프트 분기.

## [2026-04-26] 사용량 한도

- **결정**: Free 일일 풀이 시작 한도 (기본 10회, `EULER_FREE_DAILY_LIMIT` env로 조정). 답 공개 자체는 무제한. Student/Family/Academy 일일 한도 없음.
- **이유**: 답 공개 한도(이전 안)는 무의미. 사용량 자체를 제한하는 게 비용 통제·유료 전환에 직접 효과.
- **영향**: `src/lib/euler/usage-quota.ts` (C-12).

## [2026-04-26] 학습 리포트 — layer × 진단 카테고리

- **결정**: 단순 정답률이 아닌 **"어디서·왜 막히는가"** 진단. 7종 stuck_reason 분류:
  - parse_failure (L8) — 자연어→식 실패
  - domain_id_miss (L5) — 영역 인식 실패
  - **tool_recall_miss (L6) — 도구 자체를 떠올리지 못함**
  - **tool_trigger_miss (L6) — 도구는 알지만 trigger 매칭 실패**
  - forward_dead_end (L7) — 순행 dead end
  - backward_dead_end (L7) — 역행 dead end
  - computation_error (L1~4) — 계산 실수
- **이유**: 사용자 핵심 통찰 (`user_docs/math_layers.md`). Recall과 Trigger 차별화 필수 — 처방이 다름. Recall 실패 → 도구 자체 가르침. Trigger 실패 → trigger 패턴 학습.
- **영향**: `euler_solve_logs.step_summary jsonb` + `user_layer_stats` (l6_recall_miss, l6_trigger_miss 별도) + Critic의 stuck 분류 + Coaching 분기 멘트 6종.

## [2026-04-26] 구현 패턴 — BFS list 반환

- **결정**: 순행/역행 모두 "현재 조건 집합으로 알 수 있는 모든 새 사실 list 반환"의 BFS. 단일 사실이 아님. 분기는 sub-task 병렬 `Promise.all`. AI SDK `generateText` 짧은 시퀀스로 LangGraph 없이 구현.
- **이유**: 사용자 정정 (`user_docs/math_layers.md`). 단일 사실만 반환하면 분기 불가능 + 단방향 직선 풀이로 환원.
- **영향**: Reasoner 프롬프트 (C-01, C-02), orchestrator (C-03).

## [2026-04-26] 운영 정책

- **저작권**: AI 자체 표현 강제. 정석/교과서 원문은 trigram Jaccard hash 비교로 일정 임계값 초과 시 reject.
- **만 14세 미만**: 부모 동의 절차 (별도 가입 화면, LEG-02).
- **데이터 보유**: 졸업 후 1년 자동 삭제 (cron, LEG-04).
- **결제**: Toss Payments.
- **MVP 출시**: 클로즈드 베타 50명 (기존 EduFlow 사용자 + 신규 모집).
- **베타 → 유료 전환**: Phase C 종료 시점.

## [2026-04-26] 가용 자원

- **개발자**: 1인 (사용자 본인), **주 30시간** → MVP 6~8주 예상.
- **예산 (MVP까지)**: 약 100~150만원 (대부분 법무 일회성 30~80만원).
- **운영 비용**: 베타 50명 월 8~17만원, 사용자 500명 월 45~90만원, 사용자 3,000명 월 100~330만원.

---

## [2026-04-27] Phase G-04 — Killer 정답률 85% 게이트

- **상용화 게이트**: 수능 killer 문제 (21+29+30) 자동 채점 정답률 ≥ **85%** 도달 시 상용화 가능 판단. < 70% 시 원인 분석 후 G-05 후보 검토.
- **평가셋**: 수능 21+29+30 메인 (≈100문항, 2017~2026 모든 학년도/유형) + 28번 보조. 출처 `user_docs/suneung-math/parsed/all_problems.json` + `src/lib/data/math-problems.ts` 정답 매핑.
- **계산도구·자기검증 호출 정책**: 어려운 단계 한정 (난이도 5+ 임계값 유지). chain step 마다 강제 호출은 금지 — 효율성 자해.
- **Tool 의 본질은 trigger 패턴(when)**: "평균값정리" 같은 정리 이름은 교과서 지식. "닫힌구간 연속+미분가능 → 평균변화율 일치" 같은 발동 조건이 진짜 학습 대상. 모든 학생 노출 카드 / 백엔드 RAG / Manager 출력은 trigger 본문 우선, tool 이름은 부수 정보.
- **풀이법 RAG = 백엔드 한정**: similar_problems 인덱스는 Reasoner system prompt 에만 inject. 학생 화면 노출 0%. 라벨 단위는 trigger (tool 이름 X). 풀이 본문은 미저장.
- **trigger 입력 4채널**: (1) 시드 JSON 초기 / (2) Haiku batch 보강 / (3) developer + admin 토글한 베타 contributor 직접 입력 (출처 추적: developer/정석/해법서/beta_contributor) / (4) 자체 학습 mining (운영 로그 → candidate_triggers → admin 검수).
- **약점 리포트 우선순위**: `l6_trigger_miss` (정리는 알지만 언제 쓸지 모름) 1순위. `l6_recall_miss` (정리 자체를 모름) 는 학교 수업 영역.
- **A/B 측정 4-way**: baseline / chain_only (alternating loop) / chain_rag (+similar_problems) / full (+expected_triggers Manager). 단일 시드 동일 프롬프트.
- **핵심 가설**: "수학적 alternating 사고법(역행↔순행)이 LLM 정답률을 끌어올리면, 같은 사고법을 trigger 패턴으로 학생에게 가르칠 수 있다."

---

## [2026-04-28] Phase G-05 — KPI 85% 게이트 통과 + 모델 격상 결정

- **상용화 게이트 통과 입증**: 진짜 multi-turn agentic (매 turn 마다 원문제 + 누적 trace 주입) + Gemini 3.1 Pro 또는 GPT-5.5 = 수능 killer 정답률 86~89% 달성. KPI 85% 게이트 통과.
- **G-04 결함 정정**: chain prompt-inject 만으로는 학계 30% 단발 천장 못 깨남. 매 turn 마다 LLM 실제 호출 + 원문제 컨텍스트 동시 주입이 정답.
- **Production 모델 격상 결정**:
  - 메인: **Gemini 3.1 Pro + agentic** (정답률 89.5%, 월 ~$540, parse_err 0) ★ 1순위
  - 대체: GPT-5.5 + agentic (86.8%, 월 ~$1,260)
  - Sonnet 4.5 (현재) → Sonnet 4.6 (코드 변경 1줄, 비용 동일)
- **영역별 듀얼 모델 라우팅**:
  - 미적분 28+30 → **Opus 4.7 baseline** (단발 100%, 빠르고 비용 ↓)
  - 공통 21+22 → Gemini 3.1 Pro agentic (90%)
  - 가형 킬러 → Sonnet 4.6 agentic (100%) 또는 Gemini agentic (88.9%)
- **agentic 라이브 도입 정책**: 난이도 5+ 만 multi-turn (5 step), 단순 문제는 baseline 단발. max_tokens 5000.
- **평가셋**: 수능 21+22+28+30 / 가형 21+28+29+30 / 2017~2026 / 38문항 (parse_err 모수 포함 strict 채점).
- **학계 천장 돌파**: 학계 보고 75~85% (6계층 풀구현) 를 89.5% 로 돌파. 핵심 = 매 turn 마다 원문제 컨텍스트 동시 주입 (사용자 통찰).
- **caching 미적용** (현재) — 향후 prompt caching 활성화 시 운영비 30~50% 추가 절감.

---

## [2026-04-28] G-05b 기하/벡터 6-mode + G-05c Gemini quota 진단

- **기하/벡터(2022~2026 29+30) 영역 1위**: GPT-5.5 agentic 100% (10/10), Opus 4.7 baseline 90% (39초 ⚡).
- **Gemini 3.1 Pro 기하 자체 붕괴 (10%)** — 일부 응답 즉시 빈 값 (108~223ms).
- **원인 확정**: Gemini 3.1 Pro **Preview** 모델은 paid tier Tier 1 도 **250 RPD 강제 한도** (Preview 모델 정책). 우리 누적 350+ 호출 → 429 RESOURCE_EXHAUSTED.
- **코드 보강 (eval-kpi.ts callModel)**:
  - safetySettings BLOCK_NONE × 4 카테고리 (HARASSMENT/HATE/SEXUAL/DANGEROUS)
  - 빈 응답 시 finishReason/promptFeedback/safetyRatings 로깅
  - agentic trace 빈 응답 시 placeholder 명시 (multi-turn 누적 차단 방지)
  - system prompt 에 "원문제 인용 X, 자기 표현" 추가 (RECITATION 트리거 감소)
- **scripts/probe-gemini.ts** 진단 헬퍼 추가 (직접 호출로 finishReason 확인).
- **9차 세션 미결정**: Gemini 라인업 — GA 전환 / Vertex AI / Batch API / Tier 2 격상 중 선택.
- **G-06 plan 후보**: 4-튜터 다변화 (오일러 Sonnet / 라이프니츠 Opus / 가우스 Gemini-or-Sonnet / 페르마 GPT-5.5) + 영역별 라우팅.

---

## [2026-04-28] Phase G-06 — Legend Tutor 라우팅 아키텍처 (9차 세션 진입)

### 1. 브랜드 변경
- **결정**: "Euler Tutor" → **"Legend Tutor"** 로 명칭 변경. 내부에 5명의 수학 전설 튜터 배치.
- **이유**: 단일 튜터 → 거장 4인 + 계산 달인 라마누잔 구조로 확장. "당신만의 수학 거장 4인을 만나보세요" 마케팅 카피.
- **영향**: UI 카피 / 도메인 라우트 (`/euler` → `/legend`) / DB enum 전반.

### 2. 5-튜터 매핑 (Tier 기반)

| Tier | 난이도 | 튜터 | 모델 + 모드 | 주 영역 |
|---|---|---|---|---|
| 0 | 1~2 (단순계산) | **라마누잔** (계산 모드) | Haiku + SymPy 도구 | 모든 영역 |
| 1 | 3~4 (중등) | **라마누잔** (직관 모드) | Opus 4.7 baseline 단독 | 모든 영역 |
| 2 | 5+ (고난도) | **가우스** | Gemini 3.1 Pro agentic | 공통·미적분 (KPI 90/100%) |
| 2 | 5+ (고난도) | **폰 노이만** | GPT-5.5 agentic | 기하·미적분 (KPI 100%) |
| 2 | 5+ (고난도) | **오일러** | Opus 4.7 agentic | 종합·약점 보강 |
| 2 | 5+ (고난도) | **라이프니츠** | Sonnet 4.6 agentic | 가형 (KPI 100%) |

- **이유 (라마누잔=계산달인)**: 단순+중등 둘 다 라마누잔이 mode 분기로 처리 → 학생 인지 부하 ↓.
- **이유 (Tier 1 단독 Opus)**: G-05b 검증 — Opus baseline 미적분 100%/기하 90%/39초로 가장 안정. Gemini 250 RPD 한도를 Tier 2 가우스 전용으로 보존.

### 3. 3-Stage Adaptive Router (분류 ≠ 라우팅)

```
Stage 0: similar_problems pgvector 매칭 (≥ 0.85 → 사전 라벨)
  ↓ 매칭 실패
Stage 1: Manager Haiku → difficulty + confidence
  ↓ confidence ≥ 0.7 → 즉시 라우팅
Stage 2: 라마누잔 baseline probe + 자가평가 → escalation 권유
```

- **이유**: LLM 사전 난이도 예측은 부정확(overconfidence bias). Adaptive escalation 안전망이 핵심. "분류기 100%"가 아닌 "Adaptive Computation"(Graves 2016) 패러다임.

### 4. Stage 2 Probe — escalation 권유 정책

- **결정**: 자동 escalate ✗ → **사용자 권유** ○. "선생님이 못 푸는데 학생을 어떻게 가르쳐" 원칙.
- **escalation 신호 (둘 다)**: ① SymPy 검증 실패 ② "막힘" 토큰 출현
- **빈도**: 라마누잔이 아예 못 풀면 **매번** 권유. 학생 정직성·메타인지 학습 효과.
- **UX**: 3가지 선택지 — [레전드 호출] / [더 시도] / [힌트만].

### 5. 튜터 선택권 (Second Opinion 패턴) ⭐ 결정적 차별화

- **결정**: 매 문제마다 학생 자율. 라우팅이 추천하되, 학생이 다른 튜터도 자유롭게 호출.
- **사용 예**: 같은 문제 → 오일러 풀이 → 가우스 풀이 → 폰 노이만 풀이 비교 가능. 호출 횟수만큼 quota 소진.
- **이유**: ChatGPT/Khanmigo/Photomath 누구도 못 하는 구조. "거장 4인의 강의를 골라 듣는 학습 경험".
- **영향**: 라우팅은 "추천", 학생은 "결정자". usage_events.tutor_name + tier 컬럼 추가.

### 6. Quota 정책 (베타 단계)

- **베타 (현재)**: 라마누잔 무제한 / 레전드 일 5회.
- **향후 (대중화 시)**: 월 10/20/50/100/무제한 문제 다변화.
- **Free**: 라마누잔 일 10회 / 레전드 일 1회.
- **이유**: Gemini 250 RPD 한도를 사용자 quota로 자연 분배. 가격 정책은 트래픽 데이터 누적 후 결정.

### 7. 미결정 (G-06 architecture.md 작성 중 결정)

- **Gemini 라인업**: Vertex AI 마이그 vs GA `gemini-3-pro` 전환 → Stage 3 가우스 안정화 선결조건.
- **DB 마이그레이션**: 기존 `euler_*` 테이블 명칭을 `legend_*` 로 rename할지, 또는 `tutor_name` 컬럼만 추가할지.
- **라우트 마이그레이션**: `/euler/*` → `/legend/*` redirect 정책.

---

## [2026-04-28] 제품 정체성 — 풀이가 아닌 Trigger 학습 리포트 ⭐

- **결정**: 본 앱의 차별화 본질은 LLM 풀이 자체가 아니라 **학생의 trigger 학습 과정을 추적·분석·코칭하는 리포트 시스템**이다.
- **이유**: GPT-5/Gemini 4가 풀이를 더 잘하면 풀이 자체는 commodity. "이 학생이 어느 trigger를 못 떠올렸는가"는 우리 자체 데이터 없이는 누구도 만들 수 없는 moat. 일타강사가 못 하는 이유는 1:N 스케일 한계 (N=학생 수). 우리는 N=∞.
- **영향**: 마케팅·UX·DB·KPI 전 영역에서 가치 축 이동 — "풀이 정확도" → "trigger 학습 정확도". 메모리 [Tool vs Trigger] 와 정확히 매핑.

## [2026-04-28] G-06 재정의 — Legend Router + Per-Problem Report 통합

- **결정**: G-06 범위를 "5-튜터 라우팅"에서 "**라우팅 + Per-Problem Report v1**" 통합으로 확장.
- **이유**: 라우팅 결과를 trigger 단위로 분해 저장하지 않으면 리포트 데이터가 빈약. 분리 진행 시 G-07에서 raw 로그 메타데이터를 다시 손대야 함.
- **영향**: G-06 task 수 12~16 → 18~22로 증가. 산출물에 `PerProblemReportCard` 컴포넌트 + `solve_step_decomposition` DB 추가. trigger 단위 step 매핑이 핵심.

## [2026-04-28] 두 리포트 구조 명문화

### R1. Per-Problem Report (G-06)
- 풀이 직후 즉시 노출되는 카드
- 단계 분해 (n-step approach) + "어느 단계가 가장 어려운지" 마킹
- 핵심 trigger 카드 (왜 이 도구를 호출했는가)
- 같은 trigger를 가진 다른 도구·예제 노출 → 사고 확장
- 학생 막힘 지점 마킹 (handwriting/chat 멈춤 시간)

### R2. Weekly/Monthly Report (G-07, 기존 인프라 강화)
- "당신이 자주 놓치는 trigger TOP 5"
- 약점 영역 + 개선 영역 분리
- 학습 방법 권유 (도구별 학습 자료 매핑)
- 추천 문제 (Phase H에서 활성화)

## [2026-04-28] Phase H — 추천 문제 시스템 (장기)

- **결정**: `similar_problems` pgvector 인프라(G-04)를 활용해 학생 약점 trigger와 매칭되는 문제를 자동 추천.
- **진입 게이트**: 베타 사용자 100명+ 데이터 누적 + 평균 풀이 30문제 이상.
- **이유**: 추천이 의미 있으려면 학생별 weakness 누적 데이터 필요. 50명 시점부터 데이터 검증 시작.

## [2026-04-28] Phase I — 학습지 통합 플랫폼 (꿈, 비즈 검증 후)

- **결정**: 출판사·학습지(메가스터디·시대인재·일등급·EBS 등)와 계약, 그 문제집을 Legend Tutor 안에서 **개념 설명 + 문제 풀이 + 즉시 피드백**으로 학습 진행.
- **진입 게이트**: MAU 1,000+ + 학습지 1곳 contract.
- **이유**: "모르는 문제 풀어주기" → "체계적 학습 동반자"로 가치 확장. 학습지 출판사는 자체 LLM 인프라 부재 — 우리가 차별화된 LLM 동반 학습 제공.
- **영향**: 비즈 모델 변경 B2C → B2B2C. Phase I 진입 시 별도 PRD 작성.

---

## [2026-04-28] G-06 Architecture 검토 후 변경 4종 (Δ1~Δ4)

### Δ1. Quota 정책 5종 통합 카운터 (사용자 #3, #4)

- **결정**: 단일 `legend_quota_counters` 테이블에 5종 quota 통합 관리.

| Quota Kind | 베타 한도 | 자격 게이트 | 트리거 |
|---|---|---|---|
| `problem_total_daily` | 5문제/일 | — | 문제 입력 시 +1 |
| `legend_call_daily` | 3회/일 | — | Tier 2 호출 시 +1 (튜터 변경 재호출 동일 소진) |
| `report_per_problem_daily` | 1회/일 | — | R1 생성 시 +1 |
| `weekly_report` | 1회/주 (사용자 요청) | 누적 풀이 ≥ **10문제** | R2-week 생성 시 +1 |
| `monthly_report` | 1회/월 (사용자 요청) | 누적 풀이 ≥ **20문제** | R2-month 생성 시 +1 |

- **이유**: Second Opinion 별도 개념 폐기. "튜터 바꿔서 재호출 = 또 한 번의 레전드 호출". 유료화 시 quota 한도만 plan별 차등.
- **자격 게이트 명시**: 주간 리포트는 누적 10문제 이상, 월간 리포트는 누적 20문제 이상 풀이 후에만 요청 가능. 빈약한 데이터 리포트 방지.
- **유료화 시 예시**: Plan A (월 9,900원) — 월 50문제·레전드 30회·주간 4회·월간 1회. Plan B (월 19,900원) — 무제한.

### Δ2. Gemini 3.1 Pro Preview 유지 (사용자 #2)

- **결정**: GA `gemini-3-pro` 다운그레이드 ✗. **3.1 Pro Preview 그대로 유지**.
- **이유**: KPI 89.5% 달성한 모델은 3.1 Pro Preview. 베타 50명 일 3회 × 가우스 비중 0.3 ≈ 일 45회로 250 RPD 한도 내 충분. 모델 격차 사용자에게 그대로 전달.
- **fallback**: 250 RPD 초과 시 가우스 → 폰 노이만 자동 전환 + UI "가우스가 잠시 휴식 중, 폰 노이만이 응답합니다" 1줄 노출. Vertex AI 마이그레이션은 사용자 100명+ 시점 재검토.

### Δ3. R1 LLM Struggle 차원 추가 (사용자 #7)

- **결정**: PerProblemReport에 학생 stuck과 별도로 **LLM struggle 신호** 추적·노출.
- **추적 신호**: agentic turn 수, tool retry 횟수, reasoning 길이(chars), step 소요 ms, LLM 자체 self-reflection 텍스트.
- **DB**: `solve_step_decomposition`에 5 컬럼 추가 (`llm_turns_at_step`, `llm_tool_retries`, `llm_reasoning_chars`, `llm_step_ms`, `llm_resolution_text`).
- **UI**: R1 카드 신규 섹션 "AI도 어려웠던 순간" — "3단계가 가장 까다로웠어요. 해결법은…".
- **이유**: AI 정직성 + 학생 동질감 → 학습 동기 ↑. 일타강사가 못 하는 메타 차원.

### Δ4. Reasoning Tree (Tree of Thought) 시각화 (사용자 추가)

- **결정**: PerProblemReport에 **추론 트리 시각화** 추가. R1의 결정적 차별화.
- **학술 매핑**: ToT (Yao et al. 2023, "Tree of Thoughts: Deliberate Problem Solving with LLMs") 의 정확한 시각화.
- **데이터 모델**: `ReasoningTree { nodes, edges, root_id, conditions }`. 노드 종류: `goal`/`subgoal`/`condition`/`derived_fact`/`answer`. 다중 부모 허용.
- **변환 소스**: 기존 `recursive-reasoner.ts` (G-02) + `alternatingChain` (G-04) trace → tree (이미 backend에서 생성 중, 시각화만 신규).
- **DB**: `solve_reasoning_trees` 신규 테이블 (session_id 1:1, tree_jsonb).
- **기술**: **React Flow (xyflow) + dagre.js** auto-layout. Vibe·인터랙션·Vercel 친화. 번들 +60KB 수용.
- **UI**: R1 카드의 "추론 트리 펼쳐보기" 섹션 → 인라인 expand 또는 풀스크린 모달. 노드 클릭 → 해당 step의 trigger·tool·struggle 상세.
- **하이라이트**: pivotal step / 학생 stuck 가장 큰 노드 / LLM struggle 가장 큰 노드 = 색상·배지로 강조.
- **이유**: ChatGPT/Khanmigo/Photomath 누구도 못 보여주는 시각화. **R1의 moat 시각화**.

### Redirect 정책 확정 (사용자 #5 권고 수용)

- **결정**: `/euler/*` → `/legend/*` **302 임시 redirect** 1주 안정화 후 **301 영구 전환**.
- **이유**: 베타 단계 SEO 영향 미미. 1주 운영 모니터링 + 베타 사용자 피드백 후 영구 이전.

---

## [2026-04-29] M8 추가 — 베타 모집 준비 (G06-26 + G06-27)

### Δ5. 격 차별화 UI 카피 (방안 A 카운트다운)

- **결정**: 풀이 시작 직전 `TutorChoicePrompt` 카드 노출 — **3초 카운트다운** 후 default 라마누잔 진행.
- **격 차별화 시각**:
  - 라마누잔 = "기본 / 단순·중등 / 일 5문제 한도"
  - 레전드 4명 = "거장 / 고난도 전문 / 일 3회"
- **이유**: ChatGPT/Khanmigo 못하는 명시적 거장 선택 UX. 학생 메타인지 ("이 문제 어려워?") + 레전드 가치 인식.
- **반영**: `src/components/legend/TutorChoicePrompt.tsx` + `/legend/page.tsx` 통합. portraits.ts 에 `tier_label` 추가.

### Δ6. 베타 신청·승인제 + 피드백 동의 필수

- **결정**: 기존 `EULER2026` 자동 승인 폐지 → **신청 → 관리자 승인** 흐름.
- **신청 폼 필수 항목**:
  - 동기 (자유 텍스트, 100자+)
  - **피드백 동의 (필수 체크박스)** — 미동의자 신청 불가
  - 학년·과목·풀이 빈도 (선택)
- **관리자 페이지**: `/admin/beta-applications` — 신청 목록 + 1-click 승인/거부 + 코멘트
- **이유**: 베타 데이터 품질 보장 (피드백 의지 있는 사람만) + 50명 cap 통제 + 스팸 방지.
- **반영**: `beta_applications` 신규 테이블 + 신청 폼 + 관리자 페이지 + API 3종.

### 라마누잔 한도 정책 재확인

- **베타**: 일 5문제 (라마누잔 + 레전드 합산), 레전드 3회/일 — Δ1 그대로
- **유료화**: 가격별 다변화 (월 10/20/50/100문제) — G-07+ 검토
- **무제한 정책 폐지**: 어떤 플랜도 무제한 X (Opus 4.7 baseline 비용 부담 — 1문제 ~$0.45)
- **Tier 1 모델 재검토 후보 (G-07)**: Opus 4.7 → Sonnet 4.6 baseline (5배 절감) — 유료 가격 정책과 함께 결정

---

## [2026-04-29] Δ7. R1 풀이 정리 섹션 (SolutionSummarySection)

- **결정**: R1 카드에 "📝 풀이 정리" 신규 섹션 — 4~6 문장 코칭 톤 풀이 정리.
- **차원 분리**:
  - LLMStruggleSection (Δ3) = "AI도 어려웠다" **정직성** 차원 (학생 동질감)
  - SolutionSummarySection (Δ7) = "이렇게 정리해두면" **학습 코치** 차원 (학습 효과)
- **구조 (4 필드 합산 4~6 문장)**:
  - `core_insight` — 1문장 핵심 통찰
  - `step_flow_narrative` — 2~3문장 단계 흐름 ("1단계에서 X, 2단계에서 Y로...")
  - `hardest_resolution` — 1문장 가장 어려운 부분 통찰
  - `generalization` — 1문장 비슷한 문제 적용 일반 원칙
- **비용**: Haiku 4.5 1회 추가 호출, max_tokens 500, ~$0.001/문제 (무시 가능)
- **schema**: `PerProblemReport` schema_version 1.1 → **1.2**, `solution_summary` 필드 추가
- **DB**: 스키마 변경 X (`per_problem_reports.report_jsonb` 안의 신규 필드)
- **반영**: `src/lib/legend/report/solution-summarizer.ts` (신규) + `report-builder.ts` 단계 추가 + `src/components/legend/SolutionSummarySection.tsx` (신규) + `PerProblemReportCard.tsx` 통합 (steps 직후 + trigger 직전 위치)
- **위치 결정**: trigger 직전 — 학생이 풀이 정리 → 같은 발동 조건 도구 추천 흐름이 자연스러움

---

## [2026-04-29] Δ8. Tier 1 라마누잔 모델 변경 — Gemini baseline + Sonnet fallback (G06-30)

- **결정**: Tier 1 라마누잔 (직관 모드) 모델 = Opus 4.7 → **Gemini 3.1 Pro baseline**
- **fallback**: 250 RPD 한도 도달 시 자동 Sonnet 4.6 baseline 으로 swap (라마누잔 페르소나 유지). 동적 model swap — tutor 자체는 ramanujan_intuit 그대로.
- **이유**: 비용 17배 절감 ($0.45 → $0.026/문제). 베타 50명 월 $3,375 → $195 (월 $3,180 절감).
- **Gemini quota 충돌**: 라마누잔 (~250 RPD) + 가우스 (~45 RPD) = ~295 RPD 일 한도 250 초과. 라마누잔이 먼저 Sonnet swap 으로 quota 양보, 가우스 (Tier 2) 는 Gemini 보존 (정답률 89.5% 1위).
- **Sonnet baseline 정답률 검증**: 우리 측정 ~92% (재정정 후), 신뢰성 보강은 Critic 옵션 G-07 검토.
- **장기**: 사용자 100명+ 시점에 Vertex AI 마이그레이션 검토 (Preview → GA + RPD 한도 완화).
- **반영**:
  - `src/lib/legend/tutor-orchestrator.ts` TUTOR_CONFIG.ramanujan_intuit = google + gemini-3-1-pro
  - `src/lib/legend/tutor-fallback.ts` getRamanujanIntuitSwap() + buildFallbackMessage 분기 + FALLBACK_MATRIX.ramanujan_intuit = [] (model swap 으로 처리)
  - `callTutorWithFallback` catch 블록 — 라마누잔 intuit + 1단계 시 swap 분기, DB mode='baseline_sonnet_fallback'
  - env: `LEGEND_RAMANUJAN_MODEL` / `LEGEND_RAMANUJAN_FALLBACK_MODEL` 추가
  - 단위 테스트 회귀 0 + Δ8 시나리오 신규

---

## [2026-04-29] Δ9. Production 권한 게이트 — Trial / Beta Access Tier (G06-32)

- **결정**: 모든 Legend 기능 production 배포. **베타 승인자만** 5튜터 + R1 + R2 + Δ1 5종 quota 모든 기능 사용. **비-베타 (체험판)** = 라마누잔 일 3회 (Gemini baseline + Sonnet fallback). **신청 대기자** = 체험과 동일.
- **이유**: 베타 모집 + 신청·승인 인증 = 기능 unlock 게이트. 마케팅·전환에 직접 효과. Tier 1 라마누잔 비용 ($0.026/문제) 이라 체험 무료 운영 부담 적음.
- **판정 기준** (`src/lib/legend/access-tier.ts`):
  1. `beta_applications.status='approved'` → 'beta'
  2. `euler_beta_invites.redeemed_by` 매칭 → 'beta' (기존 EULER2026 코드 사용자 호환)
  3. 위 모두 미해당 → 'trial'
- **신규 quota**: `trial_ramanujan_daily` (default 3, env `LEGEND_TRIAL_RAMANUJAN_DAILY`). `legend_quota_counters_quota_kind_check` enum 확장 (마이그레이션 `20260610_trial_ramanujan_quota.sql`).
- **API 가드**:
  - `/api/legend/solve` + `/retry-with-tutor` — trial Tier 2 호출 거부 (402 `beta_only`) / 라마누잔만 `trial_ramanujan_daily` 소진
  - `/api/legend/report/weekly` + `/monthly` — trial 즉시 거부 (402 `beta_only`)
  - 모든 거부 응답 `apply_url: '/legend/beta/apply'` 포함
- **메인 채팅 분기** (`/legend/page.tsx`):
  - re-export 폐지 → Server Component access-tier 분기
  - `TrialChat`: 라마누잔만 + 5 거장 카드 잠금 + 베타 신청 CTA
  - `BetaChat`: 5 튜터 카드 자유 선택 + 격 차별화
- **모델 격상 (G-05 적용)**: `/api/euler-tutor` Sonnet 4.5 → 4.6 (`ANTHROPIC_SONNET_MODEL_ID`), GPT-5.1 → GPT-5.5 (`OPENAI_MODEL_ID`).
- **메인 홈 진입**: `/` 학생 도구 카드에 "🏛️ Legend Tutor" 추가.
- **회귀 안전**: 기존 베타 사용자 60명 (`euler_beta_invites.redeemed_by`) 모두 자동 'beta' 판정 → 회귀 0. 252+ vitest → 317 PASS (+6 access-tier + +3 trial quota + +3 trial 시나리오).

---

## [2026-04-29] Δ10. R1 풀이 정리 진입 + trigger_motivation + LaTeX·typewriter UX (G06-33, Night mode)

- **배경**: 베타 모집 직전. 메인 채팅 (`/legend` BetaChat) 발견된 UX 결함 4가지 통합 fix.
- **사용자 핵심 요구**: "고난도 문제 풀이 후 풀이 정리 + ToT + 그 생각 떠올린 이유" 자동 노출 + 채팅 UI 매끄러움.

### 4 sub-task

1. **G06-33a — 풀이 정리 진입 버튼 + 인라인 R1 카드**
   - 신규 라우트 `POST /api/legend/build-summary` (베타 전용 + legend_call + report_per_problem 둘 다 소진 + Tier 0/1 라우팅 시 가우스 강제 — 정리 품질 ↑)
   - 신규 컴포넌트 `SolutionSummaryButton` (마지막 assistant 메시지 직후, hover lift + Framer Motion fadeUp)
   - `BetaChat` 통합 — 클릭 → `PerProblemReportCard` 인라인 노출 (ToT 트리 + AI 어려운 순간 + 떠올린 이유)

2. **G06-33b — SolutionSummary `trigger_motivation` 5번째 필드**
   - schema 1.2 → 1.3 (jsonb 안의 신규 필드, DB 스키마 무변경, backward-compat 유지)
   - "그 생각을 떠올려야 하는 이유": 어떤 조건·패턴이 이 도구·접근법을 떠올리게 했는가
   - solution-summarizer 시스템 프롬프트 강화 (4 → 5 필드, 4~6 → 5~7 문장)
   - report-builder 가 primary_trigger 카드 정보 (tool_name + pattern_short + why_text) 를 summarizer 에 전달 — trigger 발동 동기 정확도 ↑
   - `SolutionSummarySection` 에 "💡 떠올린 이유" 신규 섹션 (blue accent border)

3. **G06-33c — LaTeX 스트리밍 깜빡임 fix**
   - `rehypeKatex` 옵션 `{ throwOnError:false, errorColor:'#888888', strict:'ignore' }`
   - 홀수 `$` 감지 시 마지막 `$` 임시 escape (incomplete inline math → 다음 chunk 도착 시 자동 정상 LaTeX 복귀)
   - BetaChat / TrialChat 둘 다 적용

4. **G06-33d — Typewriter throttle (chunk 부드럽게)**
   - 신규 `StreamingMarkdown` 컴포넌트 분리 — `useDeferredValue` 로 한 프레임 지연 (React idle 시간 활용)
   - 마지막 assistant 메시지 + 스트리밍 중일 때만 적용 (종료 시 즉시 동기화)
   - safeStreamMarkdown + KaTeX 옵션 통합

### 결과

- types.ts `SolutionSummary` schema 1.3 → `trigger_motivation: string | undefined` (옵셔널 — 기존 1.2 캐시 호환)
- 단위 테스트 +10 (build-summary route 9 + report-builder trigger_motivation 1)
- 회귀 fix: 기존 quota-manager 17건 + access-tier 5건 (Δ9 admin 가드 추가 후 supabase mock 의 `auth.getUser` 누락) — supabase mock 에 admin 가드용 `auth.getUser` 추가
- vitest 317 → **327 PASS** (회귀 0)
- TypeScript / Next.js build 무에러
- 영향 격리: `src/components/legend/`, `src/app/api/legend/build-summary/`, `src/lib/legend/types.ts` + report-builder/solution-summarizer 4 파일
- DB 스키마 무변경 (jsonb 안 신규 필드, 마이그레이션 X)
- 의존성 추가 X (기존 framer-motion + react + rehype-katex 활용)

---

## [2026-04-30] Δ11. 베타 리뷰 시스템 (인터뷰 → 자율 글 후기, G06-34, Night mode)

### 결정

- **결정**: 기존 G06-23 인터뷰 (5명 1주 사용 후 인터뷰) 폐기 → 베타 사용자 자율 리뷰 글 작성 시스템.
- **5 항목**: 장점 (30자+) / 단점 (20자+) / 구매 의향 (Y/N) / 추천 튜터 (5 enum 중 1) / 별점 (1~5).
- **옵션**: 자유 코멘트 / 공개·비공개 토글 (default 공개).
- **마케팅 활용**: 출시 시점 `/legend/reviews` 공개 페이지에서 통계 (평균 별점·구매 의향·튜터 분포) + 리뷰 카드 인용.
- **권한**: 베타 사용자만 작성 (`access_tier === 'beta'`). trial 거부 → 402 + `/legend/beta` redirect.
- **RLS**: 본인 read/insert/update + 공개 리뷰 (is_public=true) 누구나 read (anon 포함).
- **수정 가능**: `unique (user_id)` + upsert — 베타 사용자는 언제든 후기 갱신 가능.

### 산출물

- DB: `supabase/migrations/20260611_beta_reviews.sql` — `beta_reviews` 테이블 + `get_beta_review_stats()` RPC + RLS 4종.
- API: `POST/GET /api/legend/beta/review` (인증·beta 가드·5 항목 검증·upsert), `GET /api/legend/reviews` (anon 가능, 통계+페이지네이션 10건/page, sort=latest|rating).
- UI: `src/app/legend/beta/review/page.tsx` (server component + redirect 가드), `BetaReviewForm` (5 항목 + Framer Motion 별점·튜터 카드·구매 의향 토글), `src/app/legend/reviews/page.tsx` (공개), `ReviewStatsHero` + `ReviewsList` 컴포넌트.
- 진입점: `BetaChat` 헤더에 `📝 후기` 버튼 추가, 메인 홈 student 카드에 "베타 후기" 카드 추가.
- 타입: `src/lib/legend/types.ts` — `BetaReview`, `BetaReviewStats`, `RecommendedTutor` 추가.

### 결과

- 단위 테스트 +17 (POST 9 + GET 3 + 공개 list 4 + has_next 1)
- 신규 vitest 17/17 PASS, 기존 회귀 327 → **344 PASS** (회귀 0)
- TypeScript / Next.js build 무에러
- 영향 격리: 신규 파일 8개 (mig 1 + API 2 + page 2 + 컴포넌트 3) + 기존 수정 3 (BetaChat 헤더 / page.tsx 카드 / types.ts 타입)
- DB: 신규 테이블 + 신규 RPC, 기존 테이블 무수정
- 의존성 추가 X (기존 react + framer-motion + Next.js Image 활용)

---

## [2026-04-30] Δ12. 베타 검증 결함 4종 통합 fix (G06-35, Night mode)

### 배경

베타 사용자 관점에서 시뮬레이션한 결과 4종 결함 발견 — 모두 베타 모집 시작 전 차단 필수:

1. **결함 1 (35a)**: 어려운 (가)(나)(다) 문제도 Stage 1 Manager Haiku 가 난이도 1~2 로 분류 → Tier 0/1 라우팅 → 풀이 부정확.
2. **결함 2 (35b)**: 채팅에서 폰 노이만으로 풀이했는데 "📝 풀이 정리 보기" 클릭 시 가우스로 R1 생성 → 모델·페르소나 불일치.
3. **결함 3 (35c)**: TutorBadge / R1 카드에서 raw 모델명 ("Gemini 3.1 Pro" 등) 학생 노출 → 마케팅 부정적 + 베타테스트 정체성 훼손.
4. **결함 4 (35d)**: ToT 트리 "추출하지 못했다" 표시 + Trigger 카드 빈약 → 핵심 차별화 (R1 풀이 정리) 가치 손실.

### 결정 (4 sub-fix 통합 commit)

**35a — Manager 난이도 prompt 강화** (`src/lib/legend/stage1-manager.ts`):
- 시스템 프롬프트에 한국 수능 난이도 기준 정밀 매핑 (1: 6번, 2: 9번, 3: 12번, 4: 14번, 5: 21·28번, 6: 29·30번).
- few-shot 예시 10개 (이차함수 / 정규분포 / 벡터 / 함수의 개수 / 격자점 등 영역별).
- 보수적 분류 가이드: (가)(나)(다) 조건 2+ 시 최소 4 부터 / "정수 ~의 개수" 형태는 5~6 / 200자+ 자동 +1.

**35b — build-summary 같은 튜터 강제** (`src/app/api/legend/build-summary/route.ts` + `SolutionSummaryButton.tsx` + `BetaChat.tsx`):
- request body 에 `selected_tutor` (optional string) 추가. 6 enum 검증.
- routeProblem 결정과 무관하게 사용자 선택 튜터로 callTutor 강제. 잘못된 값은 무시 → routing fallback.
- BetaChat 의 `selectedTutor` state 를 SolutionSummaryButton 통해 build-summary 에 전파.

**35c — 모델명 숨김** (`src/lib/legend/portraits.ts` + `TutorBadge.tsx` + `PerProblemReportCard.tsx` + `TutorChoicePrompt.tsx` + `TutorPickerModal.tsx`):
- `TutorPortrait.persona_desc` 신규 — "수학의 왕자" / "기하·해석의 거장" 등 인물 캐릭터 묘사.
- TutorBadge default subtitle = `persona_desc` (admin/dev 페이지에서만 `model` prop 으로 raw 모델명 노출).
- PerProblemReportCard 가 `model_short` 강제 전달 제거.
- `model_short` 는 DB / billing / admin 페이지 한정 — 학생 노출 금지.

**35d — ToT + Trigger 추출 정상화** (`call-model.ts` + `step-decomposer.ts` + `trigger-expander.ts` + `tree-builder.ts`):
- agentic_5step system prompt 에 `[STEP_KIND: ...]` / `[TRIGGER: ...]` 마커 강제 (매 turn 응답 시작 2줄).
- step-decomposer 가 마커 정규식으로 1차 추출 (정확) → 매칭 실패 시 한국어 heuristic 2차 fallback.
- trigger 매칭 우선순위: 마커 hint → matchTriggerByToolName (한글 정규식) → matchTriggerByText (ANN).
- ANN cosine threshold: step-decomposer 0.7 → 0.5, trigger-expander 0.7 → 0.5 (회수율 우선).
- tree-builder 빈 트리 fallback: step 0개 + 조건 0개 시 `s-fallback` 노드 1개 강제 추가 ("추출하지 못했다" 표시 차단).

### 산출물

- 코어: `stage1-manager.ts` (system 프롬프트 50줄 강화) / `build-summary/route.ts` (selected_tutor 검증·우선순위) / `portraits.ts` (persona_desc + getTutorPersonaDesc) / `TutorBadge.tsx` (default = persona_desc) / `call-model.ts` (agentic system prompt 마커 강제) / `step-decomposer.ts` (extractStepKindMarker / extractTriggerMarker + 매칭 우선순위) / `trigger-expander.ts` (threshold 0.5) / `tree-builder.ts` (fallback 노드).
- UI: `SolutionSummaryButton.tsx` (selectedTutor prop) / `BetaChat.tsx` (selectedTutor 전달) / `PerProblemReportCard.tsx` / `TutorChoicePrompt.tsx` / `TutorPickerModal.tsx` (model_short → persona_desc 교체).
- 신규 단위 테스트 4 파일: `step-decomposer-marker.test.ts` (15) / `tree-builder-fallback.test.ts` (4) / `portraits-persona.test.ts` (5) + 기존 stage1-manager.test.ts +4 / build-summary route.test.ts +2.

### 결과

- TypeScript / Next.js build 무에러
- vitest **374/374 PASS** (신규 +28 / 기존 회귀 0)
- DB 스키마 무변경
- 영향 격리: `src/lib/legend/` + `src/components/legend/` + `src/app/api/legend/build-summary/` + docs

---

## 미정 항목 (다음 세션에서 결정)

- 음성 입력(Conversation의 STT 인프라 재활용) Phase A~D 후 도입 여부
- Tier 3 외부 데이터셋(ProofWiki) 임포트 시점
- 학원 사전 인터뷰 — Phase A 진행 중 1곳 시도
- Multi-tenant 학원 namespace (Phase D+)
