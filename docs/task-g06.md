# Phase G-06 — Legend Tutor 라우터 + Per-Problem Report (R1)

> 작성일: 2026-04-28 (9차 세션 진입 직전)
> 베이스 문서: `docs/architecture-g06-legend.md` (10 섹션 + 4 부록), `docs/project-decisions.md` (2026-04-28 G-06 결정 + Δ1~Δ4)
> 원칙: **1 Task = 1 Commit**. 모든 Task 는 검증 명령어를 가진다. 선행 의존성 명시.
> Commit 형식: `type: 한글 제목` (CLAUDE.md Language 규칙). type ∈ {feat, fix, refactor, test, chore, docs}.
> 영향 격리: 신규 코드는 `src/app/legend/*`, `src/app/api/legend/*`, `src/lib/legend/*`, `src/components/legend/*`, `supabase/migrations/2026_06_*` 한정. 기존 `src/app/euler/*`, `src/app/api/euler-tutor/*`, `src/lib/euler/*` 무수정 (import 만 허용).
> ⭐ 마킹: Δ3 (LLM struggle) 또는 Δ4 (ToT tree) 관련.

---

## 진행 상태 표

| Milestone | 일수 | 진행 | 완료 개수 |
|---|---|---|---|
| M1 — DB 마이그레이션 + 호환 검증 | 4일 | ✅ | 3/3 |
| M2 — 라우팅 모듈 (Stage 0~2) + /api/legend/route | 6일 | ✅ | 4/4 |
| M3 — 5-튜터 orchestrator + 5종 quota + fallback | 6일 | ✅ | 4/4 |
| M4 — Per-Problem Report 백엔드 (Δ3 + Δ4) | 8일 | ✅ | 5/5 |
| M5 — UI + ToT 시각화 + /euler→/legend redirect | 8일 | ✅ | 5/5 |
| M6 — KPI 측정 + 베타 검증 | 4일 | ⏸ 1/2 | G06-23 인터뷰 폐기 → G06-34 리뷰 시스템 으로 대체 |
| M7 — 내부 위임 + 301 영구 redirect + 배포 | 4일 | ✅ | 2/2 |
| M8 — 베타 모집 준비 (격 차별화 + 신청·승인) | 2일 | ✅ | 2/2 |
| M9 — R1 UX 개선 (풀이 정리 Δ7) | 1일 | ✅ | 1/1 |
| M10 — Tier 1 = Gemini baseline + Sonnet fallback | 0.5일 | ✅ | 1/1 |
| M11 — Trial/Beta Access Tier + Legend 메인 채팅 (Δ9) | 1일 | ✅ | 1/1 |
| M12 — 풀이 정리 진입 + trigger_motivation + UX (Δ10, Night mode) | 0.5일 | ✅ | 1/1 |
| M13 — 베타 리뷰 시스템 (Δ11, Night mode) | 0.5일 | ✅ | 1/1 |
| **합계** | **45.5일** | — | **32/32 (G06-23 → G06-34 대체)** |

진입 게이트: 각 마일스톤은 직전 마일스톤의 모든 Task 완료 후 진입. M1 → M2 → M3 → M4 → M5 → M6 → M7. M5 일부 Task (UI 컴포넌트) 는 M4 백엔드 Task 와 일부 병렬 가능 (T3 마킹).

---

## M1. DB 마이그레이션 (4일, 3 task)

### G06-01: 라우팅·세션·quota 마이그레이션 3종 ✅ (commit `c83d650`)
- **선행**: 없음
- **변경 파일**:
  - `supabase/migrations/20260601_legend_routing_decisions.sql` (신규)
  - `supabase/migrations/20260602_legend_tutor_sessions.sql` (신규)
  - `supabase/migrations/20260603_legend_quota_counters.sql` (신규, RPC 2종 포함)
- **변경 내용**: architecture.md §3.3 의 SQL 그대로. RLS 정책 + 인덱스 + RPC `increment_legend_quota` + RPC `get_lifetime_problem_count`. 모두 idempotent (`if not exists` / `or replace`).
- **검증**: `pnpm dlx tsx scripts/test-legend-migrations.ts` (신규 작성, G06-03 에서 정의). idempotency 2회 적용 + RLS 우회 차단 + RPC atomic 동시 호출.
- **위험**: LOW (구조 변경만, 기존 테이블 무영향)
- **예상 토큰**: 4K
- **commit**: `feat(g06): legend 라우팅·세션·quota 마이그레이션 3종 추가`

### G06-02: R1 캐시·step 분해·reasoning tree 마이그레이션 3종 ⭐ ✅ (commit `2ceebfb`)
- **선행**: G06-01
- **변경 파일**:
  - `supabase/migrations/20260604_solve_step_decomposition.sql` (신규, Δ3 LLM struggle 5 컬럼 포함)
  - `supabase/migrations/20260605_per_problem_reports.sql` (신규)
  - `supabase/migrations/20260606_solve_reasoning_trees.sql` (신규, Δ4)
- **변경 내용**: architecture.md §3.3 의 `solve_step_decomposition` (LLM struggle 5컬럼 포함) + `per_problem_reports` (session_id unique) + `solve_reasoning_trees` (session 1:1, tree_jsonb).
- **검증**: 같은 검증 스크립트 (G06-03) 가 6 마이그레이션 모두 cover.
- **위험**: LOW
- **예상 토큰**: 4K
- **commit**: `feat(g06): R1 캐시·step 분해·reasoning tree 마이그레이션 3종 추가 (Δ3+Δ4)`

### G06-03: 기존 테이블 ALTER + 마이그레이션 검증 스크립트 ✅ (commit `e0fd359`)
- **선행**: G06-02
- **변경 파일**:
  - `supabase/migrations/20260607_alter_usage_events_legend.sql` (신규, `add column if not exists tutor_name`, `tier`)
  - `supabase/migrations/20260608_alter_euler_solve_logs_legend.sql` (신규, `legend_session_id`, `tutor_name`, `tier` + 부분 인덱스)
  - `scripts/test-legend-migrations.ts` (신규)
- **변경 내용**:
  - architecture.md §3.4 의 ALTER 2종 (모두 `if not exists`)
  - 검증 스크립트: 8 마이그레이션 idempotency / RLS 우회 차단 / `increment_legend_quota` 동시 10 호출 → 정확히 10 count / `get_lifetime_problem_count` 0 row 반환 / 베타 사용자 1명 기존 풀이 50건 select 무파괴
- **검증**: `pnpm dlx tsx scripts/test-legend-migrations.ts` 종료코드 0
- **위험**: MEDIUM (기존 `euler_solve_logs` ALTER — `pg_dump` 백업 후 적용)
- **예상 토큰**: 6K
- **commit**: `feat(g06): usage_events·euler_solve_logs ALTER + 마이그레이션 검증 스크립트`

---

## M2. 라우팅 모듈 + /api/legend/route (6일, 4 task)

### G06-04: 공통 타입 + 모듈 stub ✅ (commit `02702bd`)
- **선행**: G06-03
- **변경 파일**:
  - `src/lib/legend/types.ts` (신규)
  - `src/lib/legend/index.ts` (신규, named re-export)
  - `src/lib/legend/legend-router.ts` (stub)
  - `src/lib/legend/stage0-similar.ts` (stub)
  - `src/lib/legend/stage1-manager.ts` (stub)
  - `src/lib/legend/stage2-probe.ts` (stub)
  - `src/lib/legend/escalation-detector.ts` (stub)
- **변경 내용**: architecture.md §4.1 의 모든 타입 (`TutorName`, `Tier`, `ProblemArea`, `RouteInput`, `RouteDecision`, `EscalationPrompt`, `TriggerLabel`, `TutorCallInput`, `TutorCallResult`, `QuotaKind`, `QuotaStatus`) + 각 모듈 함수 시그니처만 export (`throw new Error('not_implemented')`).
- **검증**: `pnpm tsc --noEmit`
- **위험**: LOW
- **예상 토큰**: 4K
- **commit**: `feat(g06): legend 공통 타입 + 라우터 모듈 stub`

### G06-05: Stage 0 (similar_problems) + Stage 1 (Manager Haiku) ✅ (commit `5807275`)
- **선행**: G06-04
- **변경 파일**:
  - `src/lib/legend/stage0-similar.ts` (구현)
  - `src/lib/legend/stage1-manager.ts` (구현)
  - `src/lib/legend/__tests__/stage0-similar.test.ts` (신규)
  - `src/lib/legend/__tests__/stage1-manager.test.ts` (신규)
- **변경 내용**:
  - Stage 0: `matchSimilarProblem(embedding, threshold=0.85)` — 기존 `src/lib/euler/similar-problems.ts` 의 `match_similar_problems` RPC import. threshold 미달 시 null 반환.
  - Stage 1: `classifyDifficulty(problem, area_hint?)` — 기존 `src/lib/euler/manager` 의 difficulty-classifier 패턴 차용. Haiku 4.5 JSON 모드. `{difficulty, confidence, area}`.
  - 모킹 LLM 단위 테스트 (vitest).
- **검증**: `pnpm dlx vitest run src/lib/legend/__tests__/stage0-similar.test.ts src/lib/legend/__tests__/stage1-manager.test.ts`
- **위험**: LOW (기존 RPC + Haiku 패턴 재활용)
- **예상 토큰**: 6K
- **commit**: `feat(g06): Stage 0 similar 매칭 + Stage 1 Manager 분류 구현`

### G06-06: Stage 2 (Ramanujan probe) + escalation-detector + legend-router 통합 ✅ (commit `bcc933b`)
- **선행**: G06-05
- **변경 파일**:
  - `src/lib/legend/stage2-probe.ts` (구현)
  - `src/lib/legend/escalation-detector.ts` (구현)
  - `src/lib/legend/legend-router.ts` (Stage 0→1→2 흐름 통합 + DB insert)
  - `src/lib/legend/__tests__/legend-router.test.ts` (신규)
- **변경 내용**:
  - Stage 2: `runRamanujanProbe(problem)` — Opus 4.7 baseline 1회 호출. SymPy 검증 import (`src/lib/euler/sympy-client.ts`). self-eval 프롬프트로 "막힘" 토큰 강제 출력.
  - escalation-detector: `sympy_fail` AND `stuck_token` 둘 다 시 `EscalationPrompt` 반환 (자동 escalate ✗).
  - legend-router: `routeProblem(input)` — Stage 0 → Stage 1 (confidence ≥ 0.7 시 즉시) → Stage 2 흐름. `legend_routing_decisions` insert 후 RouteDecision 반환.
  - 단위 테스트: 3 시나리오 (Stage 0 hit / confidence high → Stage 1 only / Stage 2 escalation 신호).
- **검증**: `pnpm dlx vitest run src/lib/legend/__tests__/legend-router.test.ts`
- **위험**: MEDIUM (probe 응답 시간 ≤ 8s 보장 필요)
- **예상 토큰**: 8K
- **commit**: `feat(g06): Stage 2 probe + escalation-detector + legend-router 통합`

### G06-07: /api/legend/route SSE 라우트 ✅ (commit `e0a2371`)
- **선행**: G06-06
- **변경 파일**:
  - `src/app/api/legend/route/route.ts` (신규, POST 핸들러)
  - `src/lib/legend/sse.ts` (신규, SSE 헬퍼)
  - `src/app/api/legend/route/__tests__/route.test.ts` (신규)
- **변경 내용**: architecture.md §7.2 의 SSE 메시지 형식. `stage_progress` (stage 0/1/2) → `route_decided` 순. 인증 가드 (createClient server) + rate limit (in-memory 5 req/sec/user, production 은 Vercel KV TODO). quota check 는 G06-10 quota-manager 완료 후 G06-11 에서 통합 (TODO 주석).
- **검증**: `pnpm dlx vitest run src/app/api/legend/route/__tests__/` 4 시나리오 (401 / 400 / 정상 SSE / 429 rate limit) 통과 + `pnpm tsc --noEmit` 무에러
- **위험**: MEDIUM (SSE 스트림 + 인증 + quota 동시 처리)
- **예상 토큰**: 7K
- **commit**: `feat(g06): /api/legend/route SSE 라우팅 진입점`

---

## M3. 5-튜터 orchestrator + quota (6일, 4 task)

### G06-08: callModel 추출 + tutor-orchestrator 코어 ✅ (commit `929111d`)
- **선행**: G06-07
- **변경 파일**:
  - `src/lib/legend/call-model.ts` (신규, `scripts/eval-kpi.ts` 의 callModel 패턴 추출)
  - `src/lib/legend/tutor-orchestrator.ts` (구현)
  - `src/lib/legend/__tests__/tutor-orchestrator.test.ts` (신규)
- **변경 내용**:
  - `call-model.ts`: 5 분기 (Anthropic Sonnet 4.6 / Opus 4.7 / Haiku 4.5 / OpenAI GPT-5.5 / Google Gemini 3.1 Pro). max_tokens 5000. agentic_5step 모드 (매 turn 마다 원문제 + 누적 trace 주입, G-05 통찰).
  - `tutor-orchestrator.ts`: `TUTOR_CONFIG` 매핑 (architecture.md §4.3) + `callTutor(input)` → 적절한 callModel 호출 + `legend_tutor_sessions` insert + trace 저장. 기존 `src/lib/euler/recursive-reasoner.ts` import (agentic 코어).
  - 단위 테스트: 6 튜터 모킹 호출 시 정확한 모델·모드 매핑.
- **검증**: `pnpm dlx vitest run src/lib/legend/__tests__/tutor-orchestrator.test.ts`
- **위험**: HIGH (멀티 모델 + agentic 5step + 비용 폭증 가능)
- **예상 토큰**: 12K
- **commit**: `feat(g06): tutor-orchestrator 6 튜터 + callModel 추출`

### G06-09: fallback 매트릭스 (Gemini 429 자동 전환 포함) ✅ (commit `b0ca04e`)
- **선행**: G06-08
- **변경 파일**:
  - `src/lib/legend/tutor-fallback.ts` (신규)
  - `src/lib/legend/tutor-orchestrator.ts` (try/catch 통합)
  - `src/lib/legend/__tests__/tutor-fallback.test.ts` (신규)
- **변경 내용**: architecture.md §9.5 의 fallback 매트릭스. 가우스 → 폰 노이만 → 라이프니츠 / 폰 노이만 → 가우스 → 오일러 / ... 1단계까지 자동, 2단계는 EscalationPrompt 로 학생 권유. Gemini 429 (`RESOURCE_EXHAUSTED`) 감지 시 폰 노이만 자동 전환 + UI 메시지 ("가우스가 잠시 휴식 중") 1줄 stream payload 삽입.
- **검증**: 모킹 — Gemini 429 throw → `callTutor({tutor:'gauss'})` 가 GPT-5.5 호출 + fallback 메시지 stream payload 포함.
- **위험**: HIGH (실제 429 재현이 어려움 — fixture 로 시뮬레이션 + 통합 검증은 M6 에서)
- **예상 토큰**: 6K
- **commit**: `feat(g06): tutor fallback 매트릭스 + Gemini 429 자동 전환`

### G06-10: quota-manager (5종 통합) ⭐ Δ1 ✅ (commit `9a8877f`)
- **선행**: G06-08 (tutor-orchestrator 가 quota 호출)
- **변경 파일**:
  - `src/lib/legend/quota-manager.ts` (구현)
  - `src/lib/legend/__tests__/quota-manager.test.ts` (신규)
  - `.env.example` (LEGEND_BETA_* 5 키 + LEGEND_*_PROBLEM_GATE 2 키 추가)
- **변경 내용**: architecture.md §4.2 의 `checkQuota` + `consumeQuota`. 5 quota_kind 분기:
  - `problem_total_daily` (한도 5 / KST 자정 reset)
  - `legend_call_daily` (한도 3 / KST 자정 reset)
  - `report_per_problem_daily` (한도 1 / KST 자정 reset)
  - `weekly_report` (한도 1 / 월요일 reset / 자격 게이트 = `get_lifetime_problem_count >= 10`)
  - `monthly_report` (한도 1 / 1일 reset / 자격 게이트 = `get_lifetime_problem_count >= 20`)
  - `blocked_reason: 'limit_exceeded' | 'eligibility_gate'` 분리 응답.
  - `increment_legend_quota` RPC 호출 (atomic).
- **검증**: `pnpm dlx vitest run src/lib/legend/__tests__/quota-manager.test.ts` (5 quota × 한도 도달 + 게이트 시나리오 10 케이스)
- **위험**: MEDIUM (KST 자정/월요일/1일 boundary 계산)
- **예상 토큰**: 8K
- **commit**: `feat(g06): quota-manager 5종 통합 + 자격 게이트 (Δ1)`

### G06-11: /api/legend/solve + /escalate + /retry-with-tutor + /quota ✅ (commit `da5e449`)
- **선행**: G06-10
- **변경 파일**:
  - `src/app/api/legend/solve/route.ts` (신규, POST + SSE)
  - `src/app/api/legend/escalate/route.ts` (신규, POST)
  - `src/app/api/legend/retry-with-tutor/route.ts` (신규, POST)
  - `src/app/api/legend/quota/route.ts` (신규, GET)
- **변경 내용**: architecture.md §7 의 4 라우트.
  - `/solve`: routing_decision_id 받아 `callTutor` SSE stream (`tutor_turn`, `tool_call`, `final` 메시지)
  - `/escalate`: 학생 응답 (escalate / retry / hint_only) 처리 → 적절 튜터 호출
  - `/retry-with-tutor`: 같은 problem_hash 다른 튜터. `consumeQuota` (problem_total + legend_call 둘 다)
  - `/quota`: 5 QuotaStatus[] 반환 (UI 헤더용)
  - 모든 라우트: 인증 가드 + RLS user_id 일치 검증
- **검증**: `pnpm dev` 후 4 curl 시나리오 — `/solve` SSE final 도달 / `/escalate` 200 응답 / `/retry-with-tutor` quota +1 / `/quota` 5종 반환
- **위험**: HIGH (SSE + 비동기 trace 저장 + quota 동시성)
- **예상 토큰**: 10K
- **commit**: `feat(g06): /api/legend solve·escalate·retry·quota 4 라우트`

---

## M4. Per-Problem Report 백엔드 (8일, 5 task)

### G06-12: step-decomposer + 모델별 trace normalizer ✅ (commit `8ccd4de`)
- **선행**: G06-11
- **변경 파일**:
  - `src/lib/legend/report/step-decomposer.ts` (신규)
  - `src/lib/legend/report/trace-normalizer.ts` (신규, 3 provider 분기)
  - `src/lib/legend/report/__tests__/trace-normalizer.test.ts` (신규, fixture 6종)
  - `src/lib/legend/report/__tests__/step-decomposer.test.ts` (신규)
  - `src/lib/legend/report/fixtures/` (신규 디렉터리, anthropic-baseline.json / anthropic-agentic.json / openai-agentic.json / google-agentic.json / chain-depth1.json / chain-depth5.json)
- **변경 내용**:
  - trace-normalizer: provider 별 (Anthropic tool_use blocks / OpenAI function_call / Gemini parts) → 통합 step list 추출. turn boundary + tool_use + reasoning chars + step ms 추출.
  - step-decomposer: `decomposeChainSteps(trace, session_id)` — chain step → step_kind 분류 (parse / domain_id / forward / backward / tool_call / computation / verify / answer) + trigger_id 매칭 (1차: used_tool_id 직접 / 2차: step.summary embed → ANN ≥ 0.7 / 3차: Haiku fallback).
  - solve_step_decomposition insert.
  - 기존 `src/lib/euler/retriever.ts` + `src/lib/euler/embed.ts` import.
- **검증**: `pnpm dlx vitest run src/lib/legend/report/__tests__/`
- **위험**: HIGH (모델별 trace 포맷 다양 — fixture 정확성이 키)
- **예상 토큰**: 14K
- **commit**: `feat(g06): step-decomposer + 3 provider trace normalizer`

### G06-13: llm-struggle-extractor ⭐ Δ3 ✅ (commit `8a5724d`)
- **선행**: G06-12
- **변경 파일**:
  - `src/lib/legend/report/llm-struggle-extractor.ts` (신규)
  - `src/lib/legend/report/__tests__/llm-struggle-extractor.test.ts` (신규)
- **변경 내용**: architecture.md §5.2 알고리즘.
  1. trace-normalizer 결과 사용 → step → trace turn range 매핑
  2. 각 step 별 `turns_at_step` / `tool_retries` / `reasoning_chars` / `step_ms` 집계
  3. step_ms 가장 큰 step (hardest) 에 한해 Haiku 4.5 로 "어떻게 해결했는가" 1~2문장 요약 ($0.0002, max_tokens 200)
  4. solve_step_decomposition.llm_* 5 컬럼 update
- **검증**: fixture 6종 → struggle 추출 → hardest step idx 일치 + resolution_text 채워짐
- **위험**: MEDIUM (Haiku 비용 + 응답 시간 추가 ~1s, 비동기 처리 권장)
- **예상 토큰**: 8K
- **commit**: `feat(g06): llm-struggle-extractor + Haiku resolution 요약 (Δ3)`

### G06-14: tree-builder ⭐ Δ4 ✅ (commit `d0d9844`)
- **선행**: G06-12
- **변경 파일**:
  - `src/lib/legend/report/tree-builder.ts` (신규)
  - `src/lib/legend/report/__tests__/tree-builder.test.ts` (신규, fixture 4종 트리 구조 검증)
- **변경 내용**: architecture.md §5.2 + §3.3 `solve_reasoning_trees`.
  - 알고리즘 (의사코드):
    ```
    function buildReasoningTree({session_id, problem_text, steps, trace}):
      conditions = parseConditions(problem_text)         # "조건 1·2·3..." 추출
      nodes = []; edges = []
      for each step in steps:
        node = mkNode({
          id: `s${step.index}`,
          label: step.kind === 'answer' ? '답' : `s${step.index}`,
          kind: mapStepToTreeKind(step.kind),
          step_index: step.index,
          trigger_id: step.trigger_id,
          depth: -1                                      # 후처리에서 채움
        })
        nodes.push(node)
        if step.kind === 'forward':
          edges.push({from: node.id, to: 'answer', kind: 'derived_from'})
        if step.kind === 'backward':
          edges.push({from: node.id, to: previousSubgoal(step), kind: 'requires'})
      addConditionNodes(nodes, edges, conditions)
      detectMultiParents(nodes, edges)                   # 같은 derived_fact 다중 참조
      computeDepth(nodes, edges, root_id='answer')
      attachHighlights(nodes, steps)                     # pivotal / stuck / struggle 색상
      if nodes.length >= LEGEND_TREE_COLLAPSE_NODE_THRESHOLD:
        tree.collapse_hint = true
      insert solve_reasoning_trees (session_id, tree_jsonb={nodes, edges, root_id, conditions, depth_max, node_count})
      return tree
    ```
  - 다중 부모 감지: 같은 `step.summary` hash 또는 같은 trigger_id 보유 노드 → edge 다중 연결
  - 미매칭 step (parse / answer) 은 root 직접 자식 fallback
- **검증**: fixture 4 트리 (single-path / multi-parent / depth 6+ / collapse) 모두 정확한 nodes/edges 수 + depth_max 검증
- **위험**: HIGH (그래프 알고리즘 + 시각화 데이터 구조 정확성)
- **예상 토큰**: 14K
- **commit**: `feat(g06): tree-builder ToT 추론 트리 DAG 구축 (Δ4)`

### G06-15: trigger-expander + stuck-tracker ✅ (commit `57f03e8`)
- **선행**: G06-12
- **변경 파일**:
  - `src/lib/legend/report/trigger-expander.ts` (신규)
  - `src/lib/legend/report/stuck-tracker.ts` (신규)
  - `src/lib/legend/report/__tests__/trigger-expander.test.ts` (신규)
- **변경 내용**:
  - trigger-expander: `expandTrigger(primary_trigger_id, exclude_tool_id?)` → primary trigger.condition_pattern 임베딩 → math_tool_triggers ANN top-K (cosine ≥ 0.7) → exclude_tool_id 의 도구 제외 → max 3 TriggerCard. similar_problems 에서 같은 trigger.why → example_problem_ref.
  - stuck-tracker: `recordStuck` (delta update) + `aggregateStuck(session_id)` (StuckSnapshot[] 반환). solve_step_decomposition.user_stuck_ms / user_revisit_count 누적.
- **검증**: `pnpm dlx vitest run src/lib/legend/report/__tests__/trigger-expander.test.ts`
- **위험**: LOW (기존 retriever/embed 패턴 차용)
- **예상 토큰**: 6K
- **commit**: `feat(g06): trigger-expander + stuck-tracker`

### G06-16: report-builder + /api/legend/report 라우트 5종 ✅ (commit `367955d`)
- **선행**: G06-13, G06-14, G06-15
- **변경 파일**:
  - `src/lib/legend/report/report-builder.ts` (신규)
  - `src/app/api/legend/report/[sessionId]/route.ts` (신규, GET)
  - `src/app/api/legend/report/[sessionId]/stuck/route.ts` (신규, POST)
  - `src/app/api/legend/report/weekly/route.ts` (신규, POST)
  - `src/app/api/legend/report/monthly/route.ts` (신규, POST)
  - `src/app/api/legend/report/eligibility/route.ts` (신규, GET)
  - `src/lib/legend/report/__tests__/report-builder.test.ts` (신규)
- **변경 내용**: architecture.md §5.2 + §7.
  - report-builder: session 조회 → decomposeChainSteps → llm-struggle-extractor → tree-builder → trigger-expander → stuck-tracker → pivotal step 선정 (max difficulty, tie=tool_call) → per_problem_reports upsert (캐시).
  - `/report/[sessionId]` GET: lazy build + ETag (`session_id + generated_at` hash). RLS user_id 검증.
  - `/report/[sessionId]/stuck` POST: client → server stuck 보고
  - `/report/weekly` + `/monthly` POST: 자격 게이트 (`get_lifetime_problem_count` ≥ 10 / 20) + quota 검사 → 기존 `src/lib/euler/weakness-aggregator.ts` 호출 (R2 는 G-07 본격 — G-06 에서는 R1 만)
  - `/report/eligibility` GET: 누적 풀이 수 + 주간/월간 자격 상태 (UI 버튼 활성화용)
- **검증**: 평가셋 5문항 자동 R1 생성 → tree.depth_max ≥ 1 + steps.length ≥ 3 + pivotal_step_index 정상 + 캐시 hit 두 번째 호출
- **위험**: HIGH (4 모듈 통합 + 캐시 정합성)
- **예상 토큰**: 14K
- **commit**: `feat(g06): report-builder + /api/legend/report 5 라우트`

---

## M5. UI + ToT 시각화 (8일, 5 task)

### G06-17: 의존성 추가 + 컴포넌트 stub + /legend layout + 흉상 이미지 3종 ✅ (commit `00d9684`)
- **선행**: G06-04 (타입) — M5 첫 task 만 M4 완료 전 진입 가능 (T3 병렬)
- **변경 파일**:
  - `package.json` (`@xyflow/react@^12`, `dagre@^0.8` 추가)
  - `src/components/legend/` (신규 디렉터리, 11 컴포넌트 stub)
  - `src/app/legend/layout.tsx` (신규)
  - `src/app/legend/page.tsx` (신규, 기존 /euler 채팅 패턴 차용 stub)
  - **`public/von-neumann-portrait.jpg`** (신규) — Wikimedia Commons Los Alamos National Laboratory 공식 사진 (PD-USGov-DOE)
  - **`public/ramanujan-portrait.jpg`** (신규) — Wikimedia Commons (PD, 1920 사망)
  - **`public/leibniz-portrait.jpg`** (신규) — Wikimedia Commons (PD, 1716 사망)
  - `src/lib/legend/portraits.ts` (신규) — 5 튜터 portrait path 매핑 + label_ko + model_short
- **변경 내용**: architecture.md §6 표의 11 컴포넌트 stub (`'use client'` + props 인터페이스 + 빈 JSX). layout 에 QuotaIndicator 헤더. dynamic import 로 React Flow + dagre 는 ReasoningTreeView 내부에서만 lazy load (`/legend/*` 진입 시에만 +60KB 번들). **5 튜터 흉상 이미지 일관성**: 기존 euler/gauss-portrait.jpg 와 동일 포맷·비율(4:5 권장)·600px 단변. TutorBadge / TutorPickerModal / EscalationPrompt 모두 portraits.ts 의 path 사용.
- **라이선스 검수**: 폰 노이만 사진은 반드시 Wikimedia Commons 의 PD-USGov-DOE / PD-US-LANL 카테고리 자료만 사용 (LIFE 매거진 등 저작권 자료 금지). 모든 portrait 파일에 EXIF 또는 동봉 `LICENSES.md` 에 출처 URL + 라이선스 명시.
- **검증**: `pnpm tsc --noEmit && pnpm next build` (번들 사이즈 신규 라우트 한정 확인) + 5 portrait 파일 존재 확인
- **위험**: MEDIUM (`minimum-release-age=7일` 정책 — `@xyflow/react` 최신 버전이 너무 최근이면 한 단계 이전 버전 사용 / 폰 노이만 사진 라이선스 검수 필수)
- **예상 토큰**: 8K
- **commit**: `feat(g06): legend UI 의존성 + 11 컴포넌트 stub + 흉상 이미지 3종 + layout`

### G06-18: PerProblemReportCard + StepDecompositionView + TriggerExpansionCard ✅ (commit `e34aedc`)
- **선행**: G06-16, G06-17
- **변경 파일**:
  - `src/components/legend/PerProblemReportCard.tsx` (구현)
  - `src/components/legend/StepDecompositionView.tsx` (구현)
  - `src/components/legend/TriggerExpansionCard.tsx` (구현)
  - `src/components/legend/TutorBadge.tsx` (구현)
  - `src/app/legend/solve/[sessionId]/page.tsx` (신규, server component → fetch report)
- **변경 내용**: architecture.md §6.1 레이아웃. Framer Motion fade-in. Shadcn Card / Badge. pivotal step boxShadow + ★ 배지. stuck step ⚠ 배지. 6 섹션 중 3 (problem / steps / trigger) 우선 — tree·struggle 은 G06-19/20.
- **검증**: `pnpm dev` → `/legend/solve/<dummy-session-id>` 진입 → 3 섹션 정상 렌더 (mock data)
- **위험**: MEDIUM (Vibe 디자인 품질 — CLAUDE.md 핵심 규칙)
- **예상 토큰**: 12K
- **commit**: `feat(g06): PerProblemReportCard + step·trigger 섹션 UI`

### G06-19: ReasoningTreeView ⭐ Δ4 (React Flow + dagre)
- **선행**: G06-18
- **변경 파일**:
  - `src/components/legend/ReasoningTreeView.tsx` (구현)
  - `src/components/legend/ReasoningTreeNode.tsx` (신규, 커스텀 노드)
  - `src/components/legend/ReasoningTreeFullscreenModal.tsx` (신규)
- **변경 내용**: architecture.md §6 + §9.7.
  - dagre auto-layout (rankdir=BT, 답이 위)
  - 노드 종류 5 (goal/subgoal/condition/derived_fact/answer) 별 색상 + icon
  - 강조: pivotal=★/굵은 테두리 / student_stuck=⚠ 노란 / llm_struggle=🔴 빨간
  - 메인 카드는 depth 3 미리보기 (`LEGEND_TREE_DEPTH_PREVIEW`) + "전체 트리 펼쳐보기" → FullscreenModal
  - collapse_hint=true 시 default collapsed (`LEGEND_TREE_COLLAPSE_NODE_THRESHOLD`)
  - 노드 클릭 → onNodeClick(step_index) → 부모가 StepDecompositionView 의 해당 step 강조
  - 모바일: 풀스크린 모달 + lazy mount + INP ≤ 200ms 목표
- **검증**: Playwright `tests/e2e/legend-tree.spec.ts` 신규 — 트리 렌더 + 노드 클릭 + 풀스크린 모달 + 모바일 viewport
- **위험**: HIGH (React Flow + dagre 모바일 성능 + Vibe 품질)
- **예상 토큰**: 16K
- **commit**: `feat(g06): ReasoningTreeView React Flow + dagre + 풀스크린 모달 (Δ4)`

### G06-20: LLMStruggleSection ⭐ Δ3 + 나머지 6 컴포넌트 ✅ (commit `8579238`)
- **선행**: G06-19
- **변경 파일**:
  - `src/components/legend/LLMStruggleSection.tsx` (구현)
  - `src/components/legend/EscalationPrompt.tsx` (구현)
  - `src/components/legend/TutorPickerModal.tsx` (구현)
  - `src/components/legend/QuotaIndicator.tsx` (구현)
  - `src/components/legend/WeeklyReportRequestButton.tsx` (구현)
  - `src/components/legend/MonthlyReportRequestButton.tsx` (구현)
  - `src/components/legend/RoutingTrace.tsx` (구현, admin only)
  - `src/app/legend/solve/[sessionId]/page.tsx` (LLMStruggleSection + tree 통합)
- **변경 내용**: architecture.md §6 + Δ3 카피.
  - LLMStruggleSection: "AI도 어려웠던 순간" — hardest_step / step_ms / tool_retries / resolution_narrative 표시
  - EscalationPrompt: 3 선택지 inline 메시지
  - TutorPickerModal: 4 legend + 라마누잔 카드 + quota 표시 + 호출 시 +1 소진 알림
  - QuotaIndicator: 5 quota dot (problem/legend/report/weekly/monthly) — Δ1 통합
  - Weekly/Monthly Button: 자격 게이트 미충족 시 "n/10 풀이 후 활성화" 비활성 표시
- **검증**: `pnpm dev` → 평가셋 1문항 풀이 → R1 카드 6 섹션 + EscalationPrompt + TutorPickerModal + QuotaIndicator 모두 정상
- **위험**: MEDIUM (UI 통합 + Vibe 품질)
- **예상 토큰**: 14K
- **commit**: `feat(g06): LLMStruggleSection + 6 보조 컴포넌트 (Δ3 + Δ1)`

### G06-21: /euler→/legend 302 redirect + /legend 메인 채팅 ✅ (commit `acbd1c8`)
- **선행**: G06-20
- **변경 파일**:
  - `src/middleware.ts` (확장 또는 신규 `src/middleware.legend.ts` 추가)
  - `src/app/legend/page.tsx` (신규, 기존 /euler 채팅 패턴 차용 + Legend 진입 카피)
  - `src/app/legend/canvas/page.tsx` (신규, 기존 /euler/canvas 동등 기능)
  - `src/app/legend/beta/page.tsx`, `src/app/legend/billing/page.tsx`, `src/app/legend/family/page.tsx`, `src/app/legend/report/page.tsx` (모두 신규, 기존 /euler/* 의 import 와 동일)
- **변경 내용**: architecture.md §8.1 의 redirect 매핑 (302 임시). `/legend/*` 6 페이지 신규 (기존 /euler/* 페이지 컴포넌트 import only — 무수정). middleware 에서 `/euler` 경로 매칭 → 302 redirect.
- **검증**: `pnpm dev` → `/euler/canvas` 접속 → `/legend/canvas` 302 + 정상 렌더 / `/legend` 진입 → 채팅 정상 / Playwright `tests/e2e/legend-redirect.spec.ts` 6 경로 redirect 검증
- **위험**: MEDIUM (베타 사용자 즐겨찾기 무파괴 보장 핵심)
- **예상 토큰**: 8K
- **commit**: `feat(g06): /euler→/legend 302 redirect + /legend 6 페이지`

---

## M6. KPI 측정 + 베타 검증 (4일, 2 task)

### G06-22: 평가셋 38문항 자동 라우팅 KPI 재측정 ✅ (commit `9f3c3c9`, 3문항 샘플 100%)
- **선행**: G06-21
- **변경 파일**:
  - `scripts/eval-legend-routing.ts` (신규)
  - `docs/qa/kpi-legend-routing.md` (측정 보고서 신규)
- **변경 내용**: 기존 38 killer 평가셋 자동 라우팅 → 5 튜터 mode 별 정답률 + Stage 0 hit rate + Stage 2 escalation rate + 평균 라우팅 latency + R1 캐시 hit rate + 트리 평균 깊이·노드 수.
  - 모드별 분리: ramanujan_intuit / gauss / von_neumann / euler / leibniz
  - Gemini 429 fallback 발생 시 자동 기록 → 일 비중 보고
- **검증**: 보고서에 38문항 정답률 표 + ≥ 86% 유지 확인 (G-05 기준선) + 5종 quota 누적 ≤ 한도
- **위험**: MEDIUM (Gemini 250 RPD 한도 초과 가능 — fallback 검증으로 활용)
- **예상 토큰**: 10K
- **commit**: `test(g06): legend 라우팅 + R1 38 평가셋 KPI 측정`

### G06-23: 베타 5명 1주 만족도 인터뷰 (deferred → G06-34 리뷰 시스템 으로 대체)
- **상태**: ❌ 폐기 (2026-04-30, Δ11)
- **대체**: G06-34 (M13) — 베타 사용자가 자율적으로 5 항목 리뷰 글 작성. 인터뷰 약속 부담 제거 + 마케팅 활용도 ↑.
- **이유**: 1주 사용 후 인터뷰 일정 조율 비효율. 자율 리뷰 글이 실제 사용자 voice + 출시 시점 마케팅 자료로 그대로 활용 가능.

---

## M7. /euler→/legend 마이그·배포 (4일, 2 task)

### G06-24: /api/euler-tutor 내부 위임 + 1주 안정화 모니터링 ✅ (commit `c67bac8`)
- **선행**: G06-23 (deferred — 베타 인터뷰 별도)
- **변경 파일**:
  - `src/app/api/euler-tutor/route.ts` (점진적 위임 — `routeProblem` best-effort 비차단 호출 + streamData `legend_routing` payload 추가)
  - `src/lib/euler/solve-logger.ts` (`legend_session_id` 옵셔널 컬럼 매핑 추가)
  - `tests/e2e/euler-legacy.spec.ts` (신규 — 5 회귀 시나리오 spec)
- **변경 내용**:
  - **위임 범위**: `routeProblem` 만 (Stage 0/1/2 라우팅 + DB 적재). `callTutor` (튜터 호출) 위임은 G-07 으로 이관.
  - **이유**: 기존 라우트가 `messages` chat array → `streamText` (Sonnet 4.5/GPT-5.1) 코칭 stream 흐름. Legend orchestrator 의 비스트리밍 단발 호출 (`callTutor → final_answer 문자열`) 과 시그니처 비호환 + 베타 50명 회귀 위험 → task.md 안전 가드 ("이미 있는 라우트 구조가 너무 다르면 단계적 wrap 패턴 고려") 채택.
  - **베타 50명 회귀 0 보장**: 본 streamText 코칭 흐름 무파괴. Legend route 는 3초 timeout + try/catch silent skip + 환경변수 `LEGEND_DELEGATION_ENABLED=false` 로 즉시 disable 가능.
  - **legend_session_id**: solve_logger schema 만 마련 (DB column 은 G06-03 ALTER 로 이미 존재). 본 task 단계에선 routing_decision_id 만 streamData 로 전달. session_id 자체는 G-07 callTutor 위임 후 채워질 자리.
- **검증**:
  - `pnpm tsc --noEmit` ✅ (무에러)
  - `pnpm dlx vitest run` ✅ (213/213 회귀 0)
  - 5 회귀 시나리오 Playwright spec 작성 (실행은 G06-25 인증 fixture 통합 후)
- **위험**: HIGH → 본 task 위임 범위 축소로 MEDIUM 으로 완화 (callTutor 위임 미수행)
- **commit**: `refactor(g06): /api/euler-tutor routeProblem 점진적 위임 + legend_routing payload`

### G06-25: 302 → 301 영구 전환 + 베타 안내 + production 배포 ✅ (M7 2/2 — G-06 완결)
- **선행**: G06-24 (1주 안정화 후)
- **변경 파일**:
  - `src/middleware.ts` (302 → 301 변경 — 1줄)
  - `docs/work-log.md` (G-06 항목 추가)
  - `docs/progress.md` (9차 세션 상태 갱신)
  - `docs/task-g06.md` (M7 ✅ + G06-25 행 갱신)
  - `docs/qa/g06-launch-checklist.md` (신규, production 배포 체크리스트)
  - `docs/qa/g06-beta-announcement.md` (신규, 베타 안내 메일 템플릿)
- **변경 내용**: 302 → 301 영구 redirect 전환. 베타 안내 메일 템플릿 작성 (실제 발송은 G06-23 시점). production 배포 명령은 사용자가 직접 (`git push origin main`). G-06 ✅ 완결 → G-07 진입 대기.
- **검증**: `pnpm tsc --noEmit` 무에러 + vitest 213/213 PASS + 운영 배포 후 24h 모니터링 (라우팅 99%+ / quota 정상 / R1 P95 ≤ 25s)
- **위험**: HIGH (배포 시점 사용자 영향 최대) → 코드 변경 단 1줄로 완화. 배포는 사용자 결정.
- **commit**: `feat(g06): 301 영구 redirect + production 배포 + 베타 안내`

---

## 의존성 그래프 요약

```
G06-01 → G06-02 → G06-03 (M1)
                     ↓
                  G06-04 → G06-05 → G06-06 → G06-07 (M2)
                                                ↓
                                             G06-08 → G06-09 (M3)
                                                ↓        ↓
                                             G06-10 → G06-11
                                                ↓
                                             G06-12 (M4)
                                              ↙ ↓ ↘
                                       G06-13 G06-14 G06-15
                                              ↘ ↓ ↙
                                             G06-16
                                                ↓
                                  ┌──── G06-17 (병렬 가능, G06-04 의존)
                                  ↓
                               G06-18 → G06-19 → G06-20 → G06-21 (M5)
                                                              ↓
                                                          G06-22 → G06-23 (M6)
                                                                     ↓
                                                                  G06-24 → G06-25 (M7)
```

병렬 가능: G06-17 은 G06-04 만 의존 → M2/M3 와 병렬 진행 가능 (시간 단축 옵션).

## 검증 인프라 요약

| Task | 검증 명령어 |
|---|---|
| G06-01~03 | `pnpm dlx tsx scripts/test-legend-migrations.ts` |
| G06-04~06, 08~10, 12~15 | `pnpm dlx vitest run src/lib/legend/...` |
| G06-07, 11, 16, 21, 24 | `pnpm dev` + `curl` SSE / Playwright E2E |
| G06-17~20 | `pnpm tsc --noEmit && pnpm next build` + Playwright UI |
| G06-22 | `pnpm dlx tsx scripts/eval-legend-routing.ts` → 보고서 |
| G06-23 | 인터뷰 보고서 + 체크리스트 95%+ |
| G06-25 | production 24h 모니터링 + Vercel 분석 |

## 위험 마킹 분포

- **HIGH (8)**: G06-08 (멀티 모델), G06-09 (fallback), G06-11 (SSE+동시성), G06-12 (trace normalizer 정확성), G06-14 (트리 알고리즘), G06-16 (4 모듈 통합), G06-19 (트리 시각화 성능·Vibe), G06-23 (사용자 피드백), G06-24 (회귀), G06-25 (배포)
- **MEDIUM (10)**: 나머지 SSE / 인증 / Vibe 품질 / DB ALTER 등
- **LOW (4)**: 마이그레이션 idempotent, 타입 정의, 모듈 stub, trigger-expander/stuck-tracker (기존 패턴 차용)

## 토큰 예산 (대략)

총 ≈ **170K 토큰** (코드 작성). 평균 task 당 7K. M3·M4 가 가장 무거움 (각 30K+).

---

## M8. 베타 모집 준비 — 격 차별화 + 신청·승인 (2일, 2 task)

> 추가일: 2026-04-29 (사용자 결정)
> 목적: 베타 모집 직전 단계. 격 차별화 UI + 신청·승인제 + 피드백 동의 필수.

### G06-26: TutorChoicePrompt 카드 (격 차별화 + 카운트다운, 방안 A) ✅ (commit `bc3cd5a`)
- **선행**: G06-21 (M5 완료)
- **변경 파일**:
  - `src/components/legend/TutorChoicePrompt.tsx` (신규)
  - `src/lib/legend/portraits.ts` (Tier 시각 구분 메타 추가 — `tier_label: '기본' | '거장'`)
- **변경 내용**: 라우팅 결과 (Stage 0~2 완료) 직후 학생에게 카드 노출:
  - 라우팅된 튜터 (default 라마누잔) + tier_label 배지 (기본/거장)
  - **3초 카운트다운** 후 자동 풀이 시작 — 호버 시 일시정지, "바로 진행" 버튼 + 옵션 onCancel
  - 카운트다운 중 4 거장 카드 grid (가우스/폰노이만/오일러/라이프니츠) 클릭 → 즉시 onChooseLegend
  - quota 표시: 오늘 남은 문제 N/5 + 오늘 남은 레전드 M/3 (legend_call_daily 또는 problem_total_daily 0 시 거장 카드 disabled)
  - Vibe: 다크 글래스 + ring + Framer Motion fadeUp + 호버 lift + tabular-nums
- **통합 유보**: `/legend/page.tsx` 가 단순 `/euler-tutor` re-export 라 진입점이 아니어서 통합 위치가 없음. 본 task 는 컴포넌트 + portraits.ts 수정만 — `/legend/page.tsx` 통합은 G-07 callTutor 위임 시점에 진입.
- **검증**: `pnpm tsc --noEmit` 무에러 + vitest 213/213 PASS (회귀 0)
- **위험**: LOW (UI 추가, 기존 흐름 무파괴)
- **commit**: `feat(g06): TutorChoicePrompt 격 차별화 카드 (방안 A 카운트다운)`

### G06-27: 베타 신청·승인 시스템 (피드백 동의 필수)
- **선행**: G06-21 (M5 완료)
- **변경 파일**:
  - `supabase/migrations/20260609_beta_applications.sql` (신규) — `beta_applications` 테이블 (user_id, motivation, feedback_consent, status, applied_at, approved_at, approved_by) + RLS
  - `src/app/legend/beta/apply/page.tsx` (신규) — 신청 폼 (동기·피드백 동의 필수 체크박스)
  - `src/app/admin/beta-applications/page.tsx` (신규) — 관리자 승인 페이지
  - `src/app/api/legend/beta/apply/route.ts` (신규, POST)
  - `src/app/api/admin/beta-applications/route.ts` (신규, GET 목록)
  - `src/app/api/admin/beta-applications/[id]/approve/route.ts` (신규, POST)
  - `src/lib/euler/beta-gate.ts` (수정) — 기존 `EULER2026` 자동 승인 deprecate, 신청·승인 흐름으로 전환
- **변경 내용**:
  - 신청 폼: 동기 (자유 텍스트) + 피드백 동의 (필수 체크박스) + 학년·과목·풀이 빈도 (선택)
  - 관리자 페이지: 신청 목록 + 1-click 승인/거부 + 코멘트
  - 승인 시 `euler_beta_invites` 자동 발급 + 사용자에게 이메일 알림 (옵션 — Supabase Edge Function 또는 단순 status 변경)
  - 기존 `EULER2026` 코드는 backwards compat 유지 (사용자 직접 deprecate 결정 시까지)
- **검증**: vitest 단위 테스트 (RLS / 관리자 권한 / 신청 → 승인 흐름) + 수동 E2E
- **위험**: MEDIUM (RLS + 관리자 권한 + 이메일 알림)
- **예상 토큰**: 12K
- **commit**: `feat(g06): 베타 신청·승인 시스템 + 피드백 동의 필수`

---

## M9. R1 UX 개선 — 풀이 정리 섹션 (1일, 1 task)

> 추가일: 2026-04-29 (Δ7 사용자 결정)
> 목적: R1 카드에 학습 코치 차원의 "📝 풀이 정리" 섹션 신규 추가. LLMStruggleSection (정직성 차원) 과 분리.

### G06-28: SolutionSummarySection 풀이 정리 (옵션 B, Δ7) ✅ (commit `081c5d0`)
- **선행**: G06-27 (M8 완료)
- **변경 파일**:
  - `src/lib/legend/types.ts` (수정 — `SolutionSummary` 타입 신규, `PerProblemReport` schema_version 1.1 → 1.2 + `solution_summary` 필드)
  - `src/lib/legend/report/solution-summarizer.ts` (신규)
  - `src/lib/legend/report/report-builder.ts` (수정 — buildReport 에 summarizeSolution 단계 추가)
  - `src/components/legend/SolutionSummarySection.tsx` (신규)
  - `src/components/legend/PerProblemReportCard.tsx` (수정 — steps 직후 + trigger 직전 위치에 SolutionSummarySection 삽입)
  - `src/lib/legend/report/__tests__/solution-summarizer.test.ts` (신규, +18 테스트)
  - `src/lib/legend/report/__tests__/report-builder.test.ts` (수정 — schema 1.2 + solution_summary 필드 검증)
- **변경 내용**:
  - Haiku 4.5 1회 호출 (max_tokens 500, ~$0.001/문제)
  - 4 필드 JSON 강제 (core_insight / step_flow_narrative / hardest_resolution / generalization)
  - JSON 파싱 실패 / callModel throw / 빈 problem / 빈 steps → fallback (4 필드 모두 안전)
  - LLMStruggleSection 의 resolution_narrative 를 hardest_resolution_text 로 참고 주입 (정확도 ↑)
  - DB 스키마 변경 X (jsonb 안의 신규 필드)
  - UI 차원 분리: 🎯 어려운 부분 (italic + emerald accent border) / 💭 일반 원칙 (footer 톤)
- **검증**:
  - `pnpm tsc --noEmit` ✅ (무에러)
  - `pnpm dlx vitest run` ✅ (**248/248 PASS**, +18 신규 / 기존 230 회귀 0)
- **위험**: LOW (R1 카드 신규 섹션 추가 + LLM struggle 와 차원 분리)
- **commit**: `feat(g06): SolutionSummarySection 풀이 정리 (옵션 B, Δ7)`

---

## M11. Trial / Beta Access Tier + Legend 메인 채팅 통합 (1일, 1 task)

> 추가일: 2026-04-29 (Δ9 사용자 결정)
> 목적: 모든 Legend 기능 production 배포 + 권한 게이트. 베타 승인자만 5튜터·R1·R2 사용. 비-베타 = 라마누잔 일 3회 체험.

### G06-32: Trial/Beta Access Tier + Legend 메인 채팅 통합 (Δ9)
- **선행**: G06-30 (M10 완료) + G06-27 (베타 신청·승인 시스템)
- **변경 파일**:
  - `src/lib/legend/access-tier.ts` (신규) — `getUserAccessTier(userId)` 'trial' | 'beta' 판정
  - `src/lib/legend/types.ts` (수정) — `QuotaKind` 에 `'trial_ramanujan_daily'` 추가
  - `src/lib/legend/quota-manager.ts` (수정) — `QUOTA_LIMITS.trial_ramanujan_daily` 추가
  - `supabase/migrations/20260610_trial_ramanujan_quota.sql` (신규) — `legend_quota_counters_quota_kind_check` enum 확장 + Supabase MCP `apply_migration` 적용
  - `src/app/api/legend/solve/route.ts` (수정) — access-tier 게이트 (trial Tier 2 거부 / 라마누잔만 trial quota 소진)
  - `src/app/api/legend/retry-with-tutor/route.ts` (수정) — 동일 패턴
  - `src/app/api/legend/report/weekly/route.ts` (수정) — trial 즉시 거부 (beta_only)
  - `src/app/api/legend/report/monthly/route.ts` (수정) — 동일
  - `src/app/api/euler-tutor/route.ts` (수정) — Sonnet 4.5 → 4.6 + GPT-5.1 → GPT-5.5 (G-05 격상, env 외부화)
  - `src/components/legend/TrialChat.tsx` (신규) — 라마누잔 페르소나 + 5 거장 카드 잠금 + 베타 신청 CTA
  - `src/components/legend/BetaChat.tsx` (신규) — 5 튜터 카드 자유 선택 + 격 차별화
  - `src/components/legend/QuotaIndicator.tsx` (수정) — `QUOTA_DISPLAY` 에 `trial_ramanujan_daily` 매핑 추가 (타입 완전성)
  - `src/app/legend/page.tsx` (재작성) — re-export 폐지, Server Component access-tier 분기 (TrialChat / BetaChat)
  - `src/app/page.tsx` (수정) — studentFeatures 에 "🏛️ Legend Tutor" 카드 추가 + featureAccents 확장
  - `.env.example` + `docs/qa/g06-vercel-env-import.md` (수정) — `LEGEND_TRIAL_RAMANUJAN_DAILY` / `ANTHROPIC_SONNET_MODEL_ID` / `OPENAI_MODEL_ID` 추가
  - `src/lib/legend/__tests__/access-tier.test.ts` (신규, +6 테스트) — 5 시나리오 (approved / invite / both null / empty userId / regression / pending-then-trial)
  - `src/lib/legend/__tests__/quota-manager.test.ts` (수정, +3 테스트) — trial_ramanujan_daily quota
  - `src/app/api/legend/solve/__tests__/route.test.ts` (수정) — Trial Tier 시나리오 +3 + access-tier mock
  - `src/app/api/legend/retry-with-tutor/__tests__/route.test.ts` (수정) — access-tier mock
  - `src/app/api/legend/report/weekly/__tests__/route.test.ts` (수정) — access-tier mock
  - `src/app/api/legend/report/monthly/__tests__/route.test.ts` (수정) — access-tier mock
- **변경 내용**:
  - access-tier 판정: beta_applications.approved → euler_beta_invites.redeemed_by → trial (단락 평가)
  - 회귀 안전: 기존 베타 사용자 60명 (`euler_beta_invites.redeemed_by`) 모두 자동 'beta' 판정
  - API 가드: trial Tier 2 호출 → 402 `beta_only` + `apply_url='/legend/beta/apply'` / 라마누잔 quota 소진 → 402 `trial_quota_exceeded`
  - 마이그레이션 enum 확장 (5종 → 6종): drop+add CHECK constraint, 기존 row 무파괴
- **검증**:
  - `pnpm tsc --noEmit` ✅ (무에러)
  - `pnpm dlx vitest run` ✅ (**317/317 PASS**, +12 신규 / 기존 304 회귀 0)
  - `pnpm next build` ✅ — `/legend` 가 ƒ (Dynamic, server-rendered) 으로 빌드 (Server Component access-tier 분기 정확 반영)
  - Supabase MCP `apply_migration` ✅ (`trial_ramanujan_quota` 적용 성공)
- **위험**: LOW (회귀 0, 마이그레이션 idempotent)
- **commit**: `feat(g06): Trial/Beta Access Tier + Legend 메인 채팅 통합 (G06-32, Δ9)`

---

## M12. 풀이 정리 진입 + trigger_motivation + UX (Δ10, Night mode) (0.5일, 1 task)

> 추가일: 2026-04-29 (Night mode, Δ10 사용자 결정)
> 목적: 베타 모집 직전. BetaChat 발견 UX 결함 4종 통합 fix.
> 사용자 핵심 요구: "고난도 문제 풀이 후 풀이 정리 + ToT + 그 생각 떠올린 이유" 자동 노출.

### G06-33: R1 풀이 정리 진입 + Solution motivation + LaTeX·typewriter UX (Δ10)
- **선행**: G06-32 (M11 완료)
- **변경 파일** (4 sub-task 통합):
  - **G06-33a (풀이 정리 진입)**:
    - `src/app/api/legend/build-summary/route.ts` (신규, POST 90s)
    - `src/components/legend/SolutionSummaryButton.tsx` (신규)
    - `src/components/legend/BetaChat.tsx` (수정 — 마지막 assistant 직후 버튼 + 인라인 PerProblemReportCard)
    - `src/app/api/legend/build-summary/__tests__/route.test.ts` (신규, +10 테스트)
  - **G06-33b (trigger_motivation)**:
    - `src/lib/legend/types.ts` (수정 — schema 1.2 → 1.3, `SolutionSummary.trigger_motivation` 옵셔널 추가)
    - `src/lib/legend/report/solution-summarizer.ts` (수정 — 시스템 프롬프트 5필드 / FALLBACK +1필드 / parseSummaryJson +1필드 / `primary_trigger` args 추가)
    - `src/lib/legend/report/report-builder.ts` (수정 — `primary_trigger: primaryCard ?? undefined` 전달 + schema_version '1.3')
    - `src/components/legend/SolutionSummarySection.tsx` (수정 — "💡 떠올린 이유" 섹션 추가, blue accent)
    - `src/lib/legend/report/__tests__/report-builder.test.ts` (수정 — schema 1.3 + trigger_motivation 검증)
  - **G06-33c (LaTeX 깜빡임 fix)** + **G06-33d (typewriter throttle)**:
    - `src/components/legend/StreamingMarkdown.tsx` (신규 — useDeferredValue + safeStreamMarkdown + KaTeX 옵션)
    - `src/components/legend/BetaChat.tsx` (수정 — ReactMarkdown → StreamingMarkdown)
    - `src/components/legend/TrialChat.tsx` (수정 — 동일 패턴 적용)
  - **회귀 fix (Δ9 admin 가드 추가 후 누락)**:
    - `src/lib/legend/__tests__/quota-manager.test.ts` (수정 — supabase mock 에 `auth.getUser` 추가)
    - `src/lib/legend/__tests__/access-tier.test.ts` (수정 — 동일)
- **변경 내용**:
  - **풀이 정리 흐름**: BetaChat 마지막 assistant 메시지 직후 "📝 풀이 정리 보기" 버튼 → POST `/api/legend/build-summary` → routeProblem (Stage 0~2) → callTutor (Tier 0/1 라우팅 시 가우스 강제 — 정리 품질 ↑) → buildReport (Δ3 + Δ4 + Δ7 + Δ10 통합) → 인라인 PerProblemReportCard 노출
  - **권한 게이트**: trial 사용자 거부 (402 `beta_only` + `apply_url`), 베타 quota 2종 소진 (legend_call_daily + report_per_problem_daily)
  - **trigger_motivation**: solution-summarizer 가 primary_trigger 카드 (tool_name + pattern_short + why_text) 컨텍스트 받아 학생 친화 톤 동기 문장 생성. JSON 파싱 실패 시 fallback (5번째 필드도 안전 기본 문구)
  - **UX**: rehypeKatex `{ throwOnError:false, errorColor:'#888888', strict:'ignore' }` + 홀수 `$` 감지 시 escape + useDeferredValue (마지막 assistant 메시지 + 스트리밍 중에만 활성)
- **검증**:
  - `pnpm tsc --noEmit` ✅ (무에러)
  - `pnpm dlx vitest run` ✅ (**327/327 PASS**, +10 신규 build-summary 테스트 + 회귀 22건 fix)
  - `pnpm next build` ✅ (모든 라우트 정상)
- **위험**: MEDIUM → LOW (DB 스키마 무변경, schema 1.2 캐시 호환, 의존성 추가 X)
- **commit**: `feat(g06): G06-33 풀이 정리 진입 + Solution motivation + LaTeX·typewriter UX (Night mode)`

---

## M13. 베타 리뷰 시스템 (Δ11, Night mode) (0.5일, 1 task)

> 추가일: 2026-04-30 (Night mode, Δ11 사용자 결정)
> 목적: 기존 G06-23 인터뷰 폐기 → 베타 사용자 자율 글 후기 시스템.
> 사용자 핵심 요구: "5 항목 (장점·단점·구매 의향·추천 튜터·별점) 자율 리뷰 + 출시 시점 마케팅 활용".

### G06-34: 베타 리뷰 시스템 — 5 항목 자율 후기 + 공개 페이지 (Δ11)
- **선행**: G06-32 (M11 access_tier 가드 활용)
- **변경 파일**:
  - **DB**:
    - `supabase/migrations/20260611_beta_reviews.sql` (신규 — `beta_reviews` 테이블 + RLS 4종 + `get_beta_review_stats()` RPC)
  - **API**:
    - `src/app/api/legend/beta/review/route.ts` (신규 — POST 작성·수정 + GET 본인 조회, 인증 + access_tier='beta' 가드, 5 항목 검증, upsert)
    - `src/app/api/legend/beta/review/__tests__/route.test.ts` (신규 — 12 시나리오)
    - `src/app/api/legend/reviews/route.ts` (신규 — GET 공개 anon 가능, 통계 + 페이지네이션 10건/page, sort=latest|rating)
    - `src/app/api/legend/reviews/__tests__/route.test.ts` (신규 — 4 시나리오)
  - **UI**:
    - `src/app/legend/beta/review/page.tsx` (신규 — Server Component + redirect 가드 + 본인 기존 리뷰 fetch)
    - `src/app/legend/reviews/page.tsx` (신규 — 공개 페이지, 통계 hero + 정렬 + 페이지네이션)
    - `src/components/legend/BetaReviewForm.tsx` (신규 — 5 항목 인터랙티브 폼, Framer Motion 별점·튜터 카드·구매 의향 토글, 글자 수 카운터)
    - `src/components/legend/ReviewStatsHero.tsx` (신규 — 평균 별점·구매 의향·추천 튜터 분포 막대)
    - `src/components/legend/ReviewsList.tsx` (신규 — 카드 그리드, 가나다 line-clamp 처리)
    - `src/components/legend/BetaChat.tsx` (수정 — 헤더에 "📝 후기" 버튼 추가)
    - `src/app/page.tsx` (수정 — Legend Tutor 카드 옆에 "베타 후기" 카드 추가)
  - **타입**:
    - `src/lib/legend/types.ts` (수정 — `BetaReview`, `BetaReviewStats`, `RecommendedTutor` 추가)
- **변경 내용**:
  - **5 항목**: 장점 30자+ / 단점 20자+ / 구매 의향 boolean / 추천 튜터 enum (5종) / 별점 1~5 / (옵션) 자유 코멘트 / (옵션) 공개·비공개 토글 default 공개
  - **권한 게이트**: 베타 사용자만 작성 (`getUserAccessTier === 'beta'`). trial 거부 → 402 + `/legend/beta` redirect
  - **수정 가능**: `unique (user_id)` + upsert. 베타 사용자는 언제든 후기 갱신 가능
  - **공개 페이지**: anon 가능. RLS `is_public=true` 자동 필터. `get_beta_review_stats()` RPC 로 통계 (anon 가능, security stable)
  - **마케팅 활용**: `/legend/reviews` 가 SNS 공유 URL — 출시 시점 핵심 마케팅 자산
- **검증**:
  - `pnpm tsc --noEmit` ✅ (무에러)
  - `pnpm dlx vitest run` ✅ (**344/344 PASS**, +17 신규 review 테스트, 회귀 0)
  - `pnpm next build` ✅ (`/legend/beta/review` 3.79kB + `/legend/reviews` 2.36kB + API 2 라우트 정상)
- **위험**: LOW (신규 테이블·신규 라우트, 기존 무영향, 의존성 추가 X)
- **commit**: `feat(g06): 베타 리뷰 시스템 — 5 항목 자율 후기 + 공개 페이지 (G06-34, Δ11)`
