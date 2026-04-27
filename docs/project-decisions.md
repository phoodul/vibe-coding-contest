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

## 미정 항목 (다음 세션에서 결정)

- 음성 입력(Conversation의 STT 인프라 재활용) Phase A~D 후 도입 여부
- Tier 3 외부 데이터셋(ProofWiki) 임포트 시점
- 학원 사전 인터뷰 — Phase A 진행 중 1곳 시도
- Multi-tenant 학원 namespace (Phase D+)
