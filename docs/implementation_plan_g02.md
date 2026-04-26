# Phase G-02 + 중학교 시드 분할 — Implementation Plan (6차 세션)

> 작성: 2026-04-27 (Night mode 자율 진행)
> 원칙: 1 Task = 1 Commit. 영향 격리: euler 모듈 외 무영향.

## 핵심 통찰 (5차 세션 사용자 정립)

1. **Euler Tutor 의 진짜 매력 = 방법 찾기 코칭** (계산 아님)
2. **난이도 = 도구 선택의 비자명성** (계산 복잡도 아님)
3. **킬러 문제 → multi-turn 분해 질문이 정답률 ↑**
4. **chain 시각화는 난이도 5+ 만** (단순 문제엔 억지)
5. **8-Layer 인프라가 schema 에만 존재 — 풀이 흐름에서 명시 사용 X**

## 학술 근거 (G-02)

- **Tree of Thoughts** (Yao 2023): GPT-4 24-game 4% → 74% — 분기 탐색
- **Self-Ask** (Press 2023): 분해 질문 multi-turn — compositional reasoning
- **Chain of Verification** (Dhuliawala 2023): 단계별 자가 검증 — 환각 감소

---

## Task 분할

### G02-A: Manager 8-Layer 출력 확장
- 파일: `src/lib/ai/euler-manager-prompt.ts`
- 변경: `ManagerResult` interface 에 optional 필드 5종 추가
  - `needs_layer_8`: 서술형 → 수학화 필요?
  - `area_layer_5`: 영역 인식 (기존 `area` 의 alias 역할)
  - `layer_6_difficulty`: 도구 호출 비자명성 1~5 (insight gap)
  - `layer_7_direction`: "forward" | "backward" | "both"
  - `computational_load`: SymPy 호출 결정 1~5 (계산 부담)
- 기존 `difficulty` / `area` 유지 (후방 호환). 새 필드는 fallback chain 으로 사용.
- 검증: `tsc --noEmit` + Manager 호출 수동 1건
- 위험: LOW

### G02-B: Recursive Backward Reasoner 모듈
- 파일: `src/lib/euler/recursive-reasoner.ts` (신규), `src/lib/ai/euler-reasoner-prompt.ts` (확장)
- 변경:
  - `buildSubgoalDecomposePrompt({problem, conditions, currentGoal, candidateTools, previousChain})` 신규
  - `recursiveBackwardChain({problem, conditions, goal, maxDepth=5, useGpt})` 신규
  - 각 depth: `retrieveTools(direction="backward", topK=5)` → Sonnet 분해 → 다음 subgoal
  - 종료: subgoal 이 conditions 와 매칭 / dead_end / maxDepth 도달
- 학술 근거 헤더 주석
- 검증: `tsc --noEmit`
- 위험: MEDIUM (LLM 비용 — depth × 1 LLM call + retrieve)

### G02-C: orchestrator route.ts 통합
- 파일: `src/app/api/euler-tutor/route.ts`
- 변경:
  - `layer_6_difficulty` (또는 fallback `difficulty`) ≥ 5 시 recursive chain 호출
  - 기존 BFS / with-tools 분기와 공존: recursive chain 결과를 추가 컨텍스트로 inject
  - chain 시각화용 데이터를 stream `data` 채널에 inject (ai SDK `streamText` 의 `data` 파라미터)
  - systemPrompt 에 chain 노출 (학생용 "선생님 사고 과정" 섹션)
- 검증: 어려운 문제 1건 (수능 30번) → chain 5 depth 도출 확인
- 위험: HIGH (스트리밍 흐름 + 추가 latency 5~10s)

### G02-D: BackwardChain 시각화 + page.tsx 통합
- 파일: `src/components/euler/BackwardChain.tsx` (신규), `src/app/euler-tutor/page.tsx` (확장)
- 변경:
  - 컴포넌트: depth 카드 list + Framer Motion 진입
  - 헤더: "🧭 선생님은 이렇게 생각했어요"
  - page.tsx: `useChat` 의 `data` 에서 chain 추출 → 코칭 메시지 위에 노출
- 검증: 어려운 문제 호출 후 chain 카드 시각 확인
- 위험: LOW (UI 추가, 기존 흐름 무영향)

---

## 중학교 시드 분할

### MID-A: middle.json 분리
- 파일: `data/math-tools-seed/middle1.json`, `middle2.json`, `middle3.json` (신규), `middle.json` (삭제)
- 분류 기준 (한국 2015·2022 개정 교육과정):
  - **중1**: 정수·유리수, 일차방정식, 좌표평면, 정비례·반비례, 기본도형/평면도형/입체도형, 자료의 정리 (도수분포)
  - **중2**: 식의 계산, 일차부등식, 연립일차방정식, 일차함수, 도형의 성질, 합동, 확률
  - **중3**: 제곱근·실수, 다항식의 곱셈/인수분해, 이차방정식, 이차함수, 닮음, 피타고라스, 삼각비, 원의 성질, 대푯값/산포도
- tool_id 그대로 유지 (호환성). area 메타만 변경.
- 검증: 각 파일 dry-run validate 통과
- 위험: LOW

### MID-B: enum + UI + 시드 검증
- 파일:
  - `src/lib/ai/euler-manager-prompt.ts` (area enum)
  - `src/lib/ai/euler-tools-schema.ts` (REASONER_THRESHOLD_BY_AREA, KOREAN_AREA_MAP, EULER_TOOLS_BY_AREA)
  - `src/lib/ai/euler-prompt.ts` (MATH_AREAS UI)
- 변경:
  - area enum: `middle` → `middle1` | `middle2` | `middle3`
  - `middle` 도 한글 매핑에 fallback (기존 호출 보호)
  - MATH_AREAS: 8개 → 10개 카드 (중1/중2/중3 분리, 학년별 핵심 주제 desc)
- 검증: `tsc --noEmit` + `pnpm dlx tsx scripts/seed-math-tools.ts --dry-run`
- 위험: MEDIUM (UI 카드 수 증가 — 그리드 레이아웃 영향)

---

## 적재 (사용자 액션 필요)

DB `math_tools` 테이블에 area 컬럼이 없으므로 (source_meta jsonb 만 존재), 시드 분리는 **JSON 파일 + UI 진입점 분리** 만으로 의미를 가짐. DB 재적재는 선택 사항이며, 도구 자체는 동일하므로 Retriever hit rate 에 영향 없음.

사용자 작업 (선택):
```bash
pnpm dlx dotenv-cli -e .env.local -- pnpm dlx tsx scripts/seed-math-tools.ts --dry-run
```
값 검증 후 필요 시 실 적재.

---

## 토큰 예산

| Task | 예상 토큰 |
|---|---|
| G02-A | 3K |
| G02-B | 8K |
| G02-C | 6K |
| G02-D | 5K |
| MID-A | 4K (시드 JSON) |
| MID-B | 4K |
| **합계** | **30K** |
