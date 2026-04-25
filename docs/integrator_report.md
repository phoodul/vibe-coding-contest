# Euler Tutor 2.0 — 통합 실현 가능성 보고서

> 작성일: 2026-04-25
> 입력 자료: `user_docs/math_solver.md`, `user_docs/LLM_math_solver.md`, `docs/research_raw.md`
> 코드베이스 분석: `src/lib/ai/euler-prompt.ts`, `src/app/api/euler-tutor/route.ts`, `src/app/api/euler-tutor/parse-image/route.ts`, `src/lib/solution-cache.ts`

---

## 0. TL;DR — 사용자 핵심 질문에 대한 직설적 답변

### Q1. "현재 AI 기술로 수능 고난도 문제 95% 이상 가능?"

**A. 솔직히, 95%는 어렵습니다. 현실적 천장은 80~88% 수준입니다.**

근거:
- 2026-04 기준 SOTA인 GPT-5.4도 단일 호출로 AIME 100%(도구 허용)이지만, **2026학년도 수능 미적분/기하 킬러 6문항 중 1문항만 정답**.
- 이유: AIME = 계산 위주 / 수능 킬러 = "도형 해석 + 함수 케이스 분류 + 다단계 역추적"의 결합. 단일 LLM 호출은 후자에 구조적으로 약함.
- 사용자 6계층 가설을 풀로 구현(Manager + Reasoner + Retriever + Executor + Critic) + RAG + SymPy + ToT까지 합쳐도 학계·산업 보고 사례 천장은 **수능 고난도 75~85%**.
- "95%"는 1차 보고서가 인용한 콴다(QANDA) 같은 거대 자본 + 수년 누적 데이터 + 다수 엔지니어가 있어야 도달 가능한 수치이고, 그것도 **킬러문항이 아닌 전체 평균** 기준일 가능성이 큽니다.

대신, **현실적 목표 재정의**를 권장합니다:
- **수능 1~25번 (중·하)**: 95% 이상 (단일 LLM + 검산만으로 충분)
- **수능 26~28번 (상)**: 85~92% (RAG + ToT + SymPy 검산)
- **수능 29~30번 (킬러)**: 65~80% (풀 6계층 아키텍처)
- **자체 출제 학교 시험 / 모의고사**: 90~95%
- **풀이 설명 품질** (학생이 "이해됐다"고 느끼는 비율): **이게 진짜 차별화 영역. 90% 이상 가능.**

### Q2. "사용자가 생각한 layer × tool 아키텍처가 맞는 방향인가?"

**A. 매우 정확합니다. 학계와 산업 모두 동일 방향으로 수렴했습니다.**

- 사용자 가설 = 신경기호(Neuro-symbolic) + 계층적 다중 에이전트 (Hierarchical Multi-Agent) 아키텍처
- 콴다(QANDA, Mathpresso)도 2025년 동일 구조로 전면 개편
- 오픈소스 Polymath, Intern-S1-MO 등 SOTA 시스템도 같은 패턴
- **단, 사용자가 강조한 "도구 = 단순 수식이 아니라 '왜 평균값정리를 쓰는가' 같은 메타-전략"** 관점이 결정적. 이것이 ChatGPT Study Mode와의 차별화 핵심이며, 학계 용어로는 **Skill Tagging + Trigger Condition Metadata**에 해당.

### Q3. "내가 직접 학습을 시킬 수 있을까?"

**A. 지금은 비추천. 1~2년 후 시점에 선택지가 됩니다.**

- Anthropic Claude (Sonnet 4.5/4.6/Opus 4.x): **파인튜닝 미지원** (직접 API). AWS Bedrock 경유 Claude 3 Haiku만 가능 — 성능 너무 낮아 의미 없음.
- OpenAI o4-mini RFT: 가능. **단, $5,000/작업 비용 + 채점 함수 + 수천 샘플 필요**. 1인 운영 단계엔 과함.
- 오픈소스 (Qwen3-Math, DeepSeek-Math): GPU 서버 필요 ($50~500/월) + 데이터 큐레이션 전문성.
- **진짜 답**: 지금은 **RAG + few-shot + 도구 라이브러리**가 ROI 압도적. 파인튜닝과 똑같은 효과를 데이터 추가만으로 얻을 수 있고, 즉시 반영 가능합니다. 사용자 수 수천 명 + 수만 건 풀이 데이터가 쌓인 후 o4-mini RFT를 검토.

### Q4. "현재 Next.js 단일 스택에 통합 가능한가?"

**A. 네. 단, SymPy(심볼릭 연산)는 별도 마이크로서비스가 현실적입니다.**

- Vercel Python Functions에 SymPy 패키징 → cold start 1~3초 + 250MB 번들 한계 위험
- Pyodide(WASM) → 모바일 저사양에서 UX 불안정
- **권장**: Railway FastAPI 마이크로서비스 ($5~20/월) — 이미 Mathpix/Upstage 외부 API 호출 패턴이 코드에 있어 DX 일관성 유지
- **0단계 대안**: SymPy 마이크로서비스 도입 전, OpenAI Code Interpreter / Anthropic tool calling으로 우회 가능 (Phase 1에서 적용)

---

## 1. 현재 Euler 튜터 진단

### 1.1 구현 현황

| 영역 | 현재 상태 | 부족함 |
|---|---|---|
| **OCR** | Mathpix → Upstage → Vision fallback (3-tier) | OK. 그대로 유지 |
| **풀이 DB** | 530문항 수능 캐시 (Tavily 웹 검색 + Supabase) | 정답+풀이만 있고 "어떤 도구 써야 하는지"는 없음 |
| **모델** | Sonnet 4.5(오일러) / GPT-5.1(가우스) — 단일 호출 | 6계층 아키텍처 전무. 검증 루프 없음 |
| **프롬프트** | 코칭 흐름 6단계 (현재 상태 파악 → 정리)는 매우 잘 설계됨 | 단, "전략 호출"이 모델 가중치 의존. 환각 가능 |
| **계산** | 모델이 직접 LaTeX/텍스트로 계산 | SymPy 등 심볼릭 검산 없음 → 환각 가능 |
| **검증** | 없음 | Critic Agent 없음. 모델이 자기 답을 의심 못 함 |
| **케이스 분류** | 프롬프트 지시만 | ToT/MCTS 분기 탐색 없음. 단일 경로 풀이 |

### 1.2 사용자가 보고한 결함 (메모리 기록)

> "방법 면에서도 이미 정답을 올바르게 도출했는데도 다시 검증을 하자고 묻는 등 부족"

→ 이는 프롬프트의 "신뢰도 원칙: 확신하지 못하는 문제는 솔직히 말합니다"가 모든 문제에 일률 적용되는 문제. **확신도(confidence) 분기가 없기 때문.** 정답을 도출했어도 모델이 "혹시 모르니..."라고 기본값으로 의심함. → 6계층 아키텍처에서는 **Critic Agent가 검증 → 통과 시 명시적으로 "확정"** 신호를 보내야 해결됨.

> "수학 문제를 제대로 풀지 못하기도"

→ 단일 호출이 다단계 추론에 약하기 때문. ToT + 도구 호출로 정확도 상승 여지.

---

## 2. 사용자 6계층 가설의 정합성 평가

| 사용자 Layer | 학계/산업 매핑 | 구현 기술 | 현재 코드 | 우선순위 |
|---|---|---|---|---|
| **L1**: 변수 할당·구조화 | Auto-formalization / Semantic Parsing | LLM JSON 출력 | ❌ | ★★★ |
| **L2**: 순행/역행 양방향 | Bidirectional Reasoning | Forward + Backward 프롬프트 분리 | ❌ (프롬프트 지시만) | ★★★ |
| **L3**: 경우의 수 탐색 | Tree of Thoughts / MCTS | LangGraph 분기 노드 | ❌ | ★★ |
| **L4-5**: 스킬·정리 호출 | RAG + Knowledge Graph | 벡터 DB + Trigger Condition 메타 | △ (530문항만) | ★★★ |
| **L6**: 사칙연산·심볼릭 | Program of Thoughts (SymPy) | Tool Use + 외부 API | ❌ | ★★★ |
| **횡단**: 검증 | LLM-as-a-Judge / Self-Reflection | Critic Agent | ❌ | ★★★ |

**판단**: 사용자 가설은 매우 잘 짜여있습니다. 다만 **Layer 4와 5의 경계**는 실무적으로 통합하는 것이 효율적(둘 다 RAG로 호출). **Layer 2는 별도 에이전트로 분리하는 것이 핵심** — 이것이 현재 코드의 가장 큰 누락분입니다.

---

## 3. 권장 아키텍처 (현재 Next.js 15 코드베이스 호환)

```
[학생 사진/텍스트 입력]
        ↓
[OCR 파이프라인]  ← 현재 그대로 유지 (Mathpix → Upstage → Vision)
        ↓
[Manager Agent / Layer 1]  ← Sonnet 4.6, JSON 모드
   ‧ 문제 텍스트를 구조화 (변수, 조건, 목표)
   ‧ 문제 분류 (대수/미적분/기하/...) + 난이도 추정
        ↓
[Retriever Agent / Layer 4-5]  ← Supabase pgvector + Trigger Metadata
   ‧ 분류 + 조건 키워드로 도구 검색
   ‧ "평균값정리, 치환적분, 3차함수 케이스 분류" 등 메타-전략 호출
   ‧ 교과서 텍스트 + 모범 풀이 예제 함께 반환
        ↓
[Reasoner Agent / Layer 2-3]  ← Sonnet 4.6 (확장 사고 모드)
   ‧ Forward: 조건 → 알 수 있는 것
   ‧ Backward: 목표 → 필요한 것
   ‧ 분기점 발생 시 ToT 가지 생성
   ‧ 각 가지를 짧은 prompt로 평가 → 폐기/유지
        ↓
[Executor / Layer 6]  ← Tool Calling (단계적 도입)
   ‧ Phase 1: Code Interpreter / Anthropic tool calling으로 우회
   ‧ Phase 2+: Railway FastAPI + SymPy 마이크로서비스
        ↓
[Critic Agent]  ← Haiku 4.5 (저렴한 모델로 충분)
   ‧ 풀이 검증: Reasoner 결과를 거꾸로 대입해 확인
   ‧ 통과 → "확정" 신호 (오일러가 더 이상 의심 안 함)
   ‧ 실패 → Reasoner에 백트래킹 신호
        ↓
[Coaching Layer]  ← 현재 EULER_SYSTEM_PROMPT 6단계 흐름 유지
   ‧ 위에서 검증된 풀이를 기반으로 학생과 대화
   ‧ "왜 이 전략을 택하는가"를 메타-전략 메타데이터로 설명
        ↓
[학생 화면]  ← KaTeX 렌더링 (현재 그대로)
```

### 3.1 핵심 설계 결정

| 결정 | 선택 | 이유 |
|---|---|---|
| **오케스트레이션** | Vercel AI SDK의 generateText 다단 호출 + Next.js Route Handlers | LangGraph는 강력하지만 Python. Next.js 단일 스택 유지 우선. AI SDK v4의 multi-step + tool calling으로 충분 |
| **메인 모델** | Sonnet 4.6 (Reasoner/Manager) + Haiku 4.5 (Critic/분류) | 비용 최적. Critic은 단순 검증이라 Haiku로 충분 |
| **CAS** | Phase 1: Anthropic tool calling + Code Interpreter / Phase 2+: Railway FastAPI + SymPy | 점진적 도입 |
| **벡터 DB** | Supabase pgvector | 이미 Supabase 사용 중. 별도 인프라 불필요 |
| **임베딩** | OpenAI text-embedding-3-small | 한국어 OK, 1M토큰 $0.02 |
| **파인튜닝** | 미도입 | RAG + few-shot이 현 단계 ROI 우수 |

### 3.2 도구 라이브러리 스키마 (사용자 강조 영역)

사용자가 핵심으로 강조한 "도구 = 메타-전략" 부분의 DB 스키마:

```typescript
type MathTool = {
  id: string;                    // "MVT_basic"
  name: string;                  // "평균값 정리 (기본)"
  layer: 4 | 5;                  // L4=고수준 정리, L5=세부 스킬
  formula_latex: string;         // "f'(c) = (f(b) - f(a)) / (b - a)"
  trigger_conditions: string[];  // ["미분가능 함수", "두 점에서의 함숫값 차이", "..."]
  why_use_it: string;            // ★ "왜 이 정리를 쓰는가"
  prerequisites: string[];       // ["미분 가능성 확인", "연속성"]
  related_tools: string[];       // ["롤의 정리", "코시 평균값 정리"]
  example_problems: {            // few-shot용
    problem_latex: string;
    solution_steps: { step: string; tool_used: string; rationale: string }[];
  }[];
  source: { textbook: string; page: number };
  embedding: number[];           // pgvector
  embedding_meta: number[];      // ★ "why_use_it" 별도 임베딩 (Multi-representation)
};
```

이 스키마의 핵심은 **`why_use_it`을 별도 임베딩으로 인덱싱**하는 것 (1차 보고서의 "Multi-representation Indexing" 적용). 학생 문제 텍스트는 자연어이므로 수식과 직접 매칭이 어렵습니다. "평균값정리를 언제 쓰는가"의 자연어 설명을 매개로 검색하는 것이 정확도가 훨씬 높습니다.

---

## 4. 단계별 마일스톤 (4단계 / 약 8~12주)

### Phase 1 — Critic Agent + 검산 도입 (1~2주)

**목표**: "정답 확신 못 하는" 결함 즉시 해결, 정확도 +5%

- [ ] Critic Agent 라우트 (`/api/euler-tutor/critic`) — Haiku 4.5
- [ ] Reasoner 결과를 받아 "역대입 검산" 수행
- [ ] 검산 통과 시 `verified: true` 플래그 → 코칭 프롬프트가 의심하지 않음
- [ ] 검산 실패 시 한 번 더 Sonnet에 백트래킹 프롬프트로 재시도

**KPI**: "정답 도출했는데 의심하는" 케이스 0%

### Phase 2 — Manager Agent + 도구 라이브러리 (3~4주)

**목표**: RAG 기반 도구 호출, 정확도 +10~15%

- [ ] Supabase pgvector 활성화
- [ ] `math_tools` 테이블 + 스키마 (위 3.2)
- [ ] **수1, 수2, 미적분 교과서 핵심 정리 100~150개**를 사용자가 직접 입력 (Mathpix 사진 → 자동 파싱 도구 제공)
- [ ] `why_use_it` 별도 임베딩
- [ ] Manager 라우트 — 문제 텍스트를 JSON으로 구조화 + 도구 검색 트리거
- [ ] 코칭 프롬프트에 `retrieved_tools`를 컨텍스트로 주입

**KPI**: 도구 호출 hit rate 70%+ / 코칭 응답에 "왜"가 포함되는 비율 90%+

### Phase 3 — Reasoner Agent + ToT (3주)

**목표**: 케이스 분류 문제 해결, 정확도 +10%

- [ ] Reasoner 라우트 — extended thinking 모드 활용
- [ ] Forward/Backward 프롬프트 분리
- [ ] 분기점 감지 → 최대 3가지 가설 생성 → 각각 짧은 평가
- [ ] AI SDK의 multi-step generateText로 구현 (LangGraph 없이)

**KPI**: 수능 28~30번 정답률 50% → 70%

### Phase 4 — SymPy 마이크로서비스 + Tool Calling (2~3주)

**목표**: 계산 환각 제거, 정확도 +5%

- [ ] Railway에 FastAPI + SymPy 마이크로서비스 배포 ($5~10/월)
- [ ] Anthropic tool calling으로 `solve_equation`, `differentiate`, `integrate`, `simplify` 등 노출
- [ ] Reasoner가 필요 시 자동 호출
- [ ] 결과를 학생에게 표시할 때 LaTeX로 렌더링

**KPI**: 단순 계산 실수로 인한 오답 0%

### 누적 정답률 목표

| 영역 | 현재 추정 | Phase 1 후 | Phase 2 후 | Phase 3 후 | Phase 4 후 |
|---|---|---|---|---|---|
| 수능 1~25번 | 80% | 85% | 92% | 95% | **96%** |
| 수능 26~28번 | 60% | 65% | 78% | 87% | **90%** |
| 수능 29~30번 | 30% | 35% | 50% | 70% | **77%** |
| 학교 모의고사 평균 | 75% | 80% | 87% | 92% | **94%** |
| 풀이 설명 만족도 | 70% | 80% | 90% | 92% | **93%** |

(추정치. Phase 2 완료 시점에서 실측 후 보정 필요.)

---

## 5. 비용 추정 (월 단위, 학생 100명 기준)

| 항목 | 비용 | 비고 |
|---|---|---|
| Mathpix OCR | $2~5 | 학생당 월 10문항 촬영 |
| Anthropic API (Sonnet 4.6 Reasoner + Haiku 4.5 Critic + Manager) | $150~250 | 학생당 월 50회 풀이 가정 |
| OpenAI 임베딩 (text-embedding-3-small) | $1~3 | 도구 라이브러리 갱신 시 |
| Supabase Pro (pgvector + 풀이 캐시) | $25 | 이미 사용 중일 가능성 |
| Vercel Pro | $20 | |
| Railway FastAPI + SymPy (Phase 4 이후) | $5~10 | |
| **총합** | **$203~313 / 월** | 학생 100명 기준 |

월 12,000원 구독 모델 기준 손익분기:
- 학생당 월 비용 약 $2~3 → **손익분기 약 $20~30/학생 = 약 25~40명 유료 구독**

---

## 6. 차별화 전략 (콴다·ChatGPT Study Mode 대비)

### 콴다(QANDA) 대비
- 콴다는 "문제 → 풀이"의 단방향 검색 + 다중 에이전트로 **풀이를 정확히 보여주는 것**이 강점
- 우리는 **"왜 이 전략을 택하는가"의 메타-전략을 학생이 스스로 깨닫게 하는 것**이 강점 → 사용자가 강조한 "수학의 바이브코딩" 철학
- 이 차이는 **L4-5 도구 메타데이터의 `why_use_it` 필드**에서 결정됨

### ChatGPT Study Mode 대비
- ChatGPT는 일반 모델 + Study Mode 프롬프트
- 우리는 **6계층 + 한국 교과서 RAG + 수능 풀이 DB + Critic 검증**
- 한국 학생 페인포인트(수능 킬러문항, 모의고사 문제 분류)에 특화

### 핵심 메시지 (마케팅 카피로 직결)
> "오일러 튜터는 답을 알려주지 않습니다. **왜 그 답이 나오는지**, 학생이 스스로 깨닫게 합니다."

---

## 7. 위험 요소 (Risks)

| 위험 | 가능성 | 대응 |
|---|---|---|
| 도구 라이브러리 입력 부담 (사용자 1인) | 높음 | Mathpix로 교과서 사진 → 자동 파싱 + Sonnet으로 메타데이터 자동 생성. 사용자는 검수만 |
| Multi-agent 호출로 응답 지연 (5~15초) | 중 | 스트리밍 + "사고 과정" UI로 체감 지연 완화. 1차 보고서도 동일 권장 |
| Mathpix OCR이 한국 학생 폰 사진에서 정답률 저조 | 중 | 다단 fallback 이미 구현. 사용자 피드백 수집 후 보강 |
| 학생이 Critic 검증 결과만 보고 사고 안 함 | 중 | 코칭 프롬프트에서 검증 결과를 학생에게 "직접 노출하지 않고" 자신감 신호로만 사용 |
| 비용 초과 (Sonnet 4.6 호출 다수) | 중 | Phase 1부터 prompt caching + Haiku로 분담 (Critic) |
| 콴다·매스프레소 등 거대 자본과의 경쟁 | 높음 | 한국 학교 단위 B2B 마케팅 (교사가 도입) + "메타-전략" 차별화 |

---

## 8. 다음 단계 결정 요청

이 보고서를 바탕으로 사용자가 결정할 것:

### 결정 항목 1. 정답률 목표
- (a) **현실 목표**: 수능 킬러 70~80% / 1~28번 90%+ / 풀이 만족도 90%+ → 약 8~12주
- (b) **공격적 목표**: 수능 킬러 85~90% → 24~36주, 추가 인력 또는 외주 필요
- → **권장: (a)**

### 결정 항목 2. Phase 진행 순서
- (a) **권장**: Phase 1 → 2 → 3 → 4 (위 순서)
- (b) Phase 4 우선 (SymPy부터) — 기술적 PoC 우선
- → **권장: (a)** — Phase 1만 1주에 완료 가능, 즉시 사용자 피드백 가능

### 결정 항목 3. 도구 라이브러리 입력 책임
- (a) 사용자(=교사) 본인이 사진 찍어 입력
- (b) AI 자동 파싱 + 사용자 검수
- (c) 외주 데이터 입력
- → **권장: (b)** — Mathpix → Sonnet 메타데이터 생성 → 사용자는 5분 검수

### 결정 항목 4. 파인튜닝 도입 시점
- (a) 지금 도입 (o4-mini RFT 5,000$)
- (b) 사용자 1,000명 + 풀이 데이터 10,000건 누적 후 검토
- (c) 영구 미도입 (RAG로 충분)
- → **권장: (b)**

### 결정 항목 5. 별도 SaaS 서비스로 분리 vs 현 EduFlow 내 강화
- (a) `euler.ai` 같은 별도 도메인 + 단독 가격
- (b) 현 EduFlow의 핵심 기능으로 강화 + 전체 구독에 포함
- → **권장: (b)** — 사용자 획득 채널이 이미 EduFlow에 있음

---

## 9. 승인 요청 (Approval Gate 1)

다음 중 하나를 결정해주세요:

**A. 본 보고서 그대로 승인** → 즉시 `docs/architecture.md` + `docs/task.md` + `docs/implementation_plan.md` 작성 시작 (planner 에이전트 호출)

**B. 일부 항목 수정** → 어느 항목을 어떻게 수정할지 알려주세요

**C. 추가 리서치 필요** → 어떤 영역에 대한 리서치인지 알려주세요 (예: "콴다의 실제 정답률 데이터 더 찾아줘", "한국 교과서 저작권 이슈 확인해줘")

**D. 방향 자체 재검토** → 6계층 외 다른 접근법을 탐색
