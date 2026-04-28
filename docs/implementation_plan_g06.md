# Phase G-06 구현 계획서

> 본 문서는 `docs/task-g06.md` 의 25 Task 각각에 대한 구체적 구현 가이드.
> Implementer 가 task ID 를 받아 이 문서에서 해당 섹션만 읽고 작업 수행.
> 베이스 문서: `docs/architecture-g06-legend.md` (이하 ARCH §X 로 인용)
> 결정 문서: `docs/project-decisions.md` 2026-04-28 항목 (Δ1~Δ4 포함)

---

## 공통 사항

### Tech Stack 재확인
- Next.js 15 App Router (Server / Client 분리)
- Supabase (RLS + RPC, server client는 `@/lib/supabase/server`)
- AI SDK v4 `generateText` (G-05 까지 검증된 버전, v6 마이그는 별도 Phase)
- React Flow (`@xyflow/react@^12`) + dagre (auto-layout, Δ4)
- Vercel Functions (Fluid Compute), maxDuration 30s 기본 / 60s for /solve
- Playwright (E2E), vitest (unit)

### 인증·RLS 패턴 (모든 라우트 공통)

```ts
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
  // ... 본 로직
}
```

RLS 정책은 `auth.uid() = user_id` 패턴 (기존 euler_* 모든 테이블 동일). Step 분해처럼 join 이 필요한 경우 `exists(select 1 from legend_tutor_sessions where ...)` 서브쿼리.

### 모델 호출 패턴 (callModel)

`scripts/eval-kpi.ts` 의 `callModel` 함수를 `src/lib/legend/call-model.ts` 로 추출. 5 분기:

| Provider | Model ID env | 호출 방식 |
|---|---|---|
| Anthropic Sonnet 4.6 | `ANTHROPIC_SONNET_MODEL_ID` | AI SDK v4 `generateText` |
| Anthropic Opus 4.7 | `ANTHROPIC_OPUS_MODEL_ID` | 동일 |
| Anthropic Haiku 4.5 | `ANTHROPIC_HAIKU_MODEL_ID` | 동일 |
| OpenAI GPT-5.5 | `OPENAI_MODEL_ID` | AI SDK v4 `openai()` |
| Google Gemini 3.1 Pro | `GEMINI_MODEL_ID` | `@google/genai` 직접 호출 + safetySettings BLOCK_NONE × 4 (G-05c 보강) |

agentic_5step 모드: 매 turn 마다 (1) 원문제 (2) 누적 trace (3) 다음 step 지시 — G-05 통찰 그대로. max_tokens 5000.

### 코드 스타일 (CLAUDE.md 준수)
- Simplicity first. 단일 사용 추상화 금지.
- Surgical changes. 기존 euler/ 모듈은 import only, 무수정.
- 명시적 > 영리함.
- 기존 패턴 (createClient / generateText / Supabase RPC) 그대로 차용.

### 환경변수 (ARCH 부록 B)

`.env.example` 에 신규 추가 (값 빈 문자열):
```
LEGEND_ROUTER_ENABLED=true
LEGEND_STAGE0_THRESHOLD=0.85
LEGEND_STAGE1_CONFIDENCE_THRESHOLD=0.7
LEGEND_REPORT_CACHE_TTL_HOURS=720
LEGEND_BETA_PROBLEM_TOTAL_DAILY=5
LEGEND_BETA_LEGEND_CALL_DAILY=3
LEGEND_BETA_REPORT_PER_PROBLEM_DAILY=1
LEGEND_BETA_WEEKLY_REPORT_LIMIT=1
LEGEND_BETA_MONTHLY_REPORT_LIMIT=1
LEGEND_WEEKLY_REPORT_PROBLEM_GATE=10
LEGEND_MONTHLY_REPORT_PROBLEM_GATE=20
GEMINI_FALLBACK_TUTOR=von_neumann
LEGEND_TREE_DEPTH_PREVIEW=3
LEGEND_TREE_COLLAPSE_NODE_THRESHOLD=30
```

---

## Task 별 구현 가이드

---

### G06-01: 라우팅·세션·quota 마이그레이션 3종

**목표**: ARCH §3.3 의 3 SQL 을 마이그레이션 파일로 작성 + RPC 2개 (`increment_legend_quota`, `get_lifetime_problem_count`).

**구현 단계**:
1. `supabase/migrations/20260601_legend_routing_decisions.sql` — ARCH §3.3 그대로 복사. RLS 정책 2종 (read_own, insert_own) 포함.
2. `supabase/migrations/20260602_legend_tutor_sessions.sql` — ARCH §3.3 그대로. 인덱스 2종 + RLS 2종.
3. `supabase/migrations/20260603_legend_quota_counters.sql` — 5 quota_kind enum check + RPC `increment_legend_quota` (atomic UPSERT) + RPC `get_lifetime_problem_count`.
4. Supabase MCP 또는 Supabase 대시보드 SQL editor 로 적용 (또는 `supabase db push`).
5. 적용 후 `select * from legend_quota_counters` 빈 결과 확인 (정상).

**검증 기준**:
- 3 마이그레이션 파일 모두 SQL 검증기 통과
- 2회 적용 시 idempotent (`if not exists` / `or replace`)
- 다른 user_id 로 SELECT 시도 → 0 row 반환 (RLS 정상)

**rollback 전략**:
```sql
drop function if exists increment_legend_quota;
drop function if exists get_lifetime_problem_count;
drop table if exists legend_quota_counters;
drop table if exists legend_tutor_sessions;
drop table if exists legend_routing_decisions;
```

**예상 시간**: 1.5일

---

### G06-02: R1 캐시·step 분해·reasoning tree 마이그레이션 3종 ⭐

**목표**: ARCH §3.3 의 `solve_step_decomposition` (Δ3 LLM struggle 5컬럼 포함) + `per_problem_reports` + `solve_reasoning_trees` (Δ4).

**구현 단계**:
1. `supabase/migrations/20260604_solve_step_decomposition.sql` — ARCH §3.3 그대로. Δ3 5 컬럼 (`llm_turns_at_step`, `llm_tool_retries`, `llm_reasoning_chars`, `llm_step_ms`, `llm_resolution_text`) 포함. RLS 는 join 서브쿼리 패턴.
2. `supabase/migrations/20260605_per_problem_reports.sql` — `unique index per_problem_reports_session_uniq on per_problem_reports(session_id)` 핵심 (캐시 정책).
3. `supabase/migrations/20260606_solve_reasoning_trees.sql` — `session_id unique` + tree_jsonb. RLS user_id 직접.
4. 적용.

**검증 기준**:
- 3 테이블 모두 select 빈 결과
- per_problem_reports.session_id unique 위반 시도 → 에러
- step_decomp join 서브쿼리 RLS — session 의 user_id 가 다른 사용자면 0 row

**rollback 전략**:
```sql
drop table if exists solve_reasoning_trees;
drop table if exists per_problem_reports;
drop table if exists solve_step_decomposition;
```

**예상 시간**: 1일

---

### G06-03: 기존 테이블 ALTER + 마이그레이션 검증 스크립트

**목표**: ARCH §3.4 의 ALTER 2종 + 8 마이그레이션 통합 검증 스크립트.

**구현 단계**:
1. `supabase/migrations/20260607_alter_usage_events_legend.sql` — `add column if not exists tutor_name text, tier smallint check (tier in (0,1,2))`.
2. `supabase/migrations/20260608_alter_euler_solve_logs_legend.sql` — `add column if not exists legend_session_id uuid references legend_tutor_sessions(id), tutor_name text, tier smallint` + 부분 인덱스 `where legend_session_id is not null`.
3. **`pg_dump` Supabase backup 1회 선행 (production 데이터 보호)**.
4. ALTER 2개 적용.
5. `scripts/test-legend-migrations.ts` 작성:
   - Supabase service role client 사용 (RLS bypass 로 검증, 그 다음 user client 로 RLS 검증)
   - 8 마이그레이션 2회 적용 idempotency
   - `increment_legend_quota` 동시 10 호출 (`Promise.all`) → 최종 count 정확히 10
   - `get_lifetime_problem_count(uuid)` → 0 (빈 DB) 또는 N (테스트 insert 후)
   - RLS 우회 시도 — 다른 user_id 로 SELECT → 0 row
   - 베타 사용자 1명 기존 풀이 50건 선택 (production read-only 검증) — 옵션 (skip if NODE_ENV != 'test_with_prod')

**검증 기준**:
- `pnpm dlx tsx scripts/test-legend-migrations.ts` 종료코드 0
- 모든 assert 통과 (10+ assertion)

**rollback 전략**:
```sql
alter table euler_solve_logs drop column if exists legend_session_id;
alter table euler_solve_logs drop column if exists tutor_name;
alter table euler_solve_logs drop column if exists tier;
alter table usage_events drop column if exists tutor_name;
alter table usage_events drop column if exists tier;
```

**예상 시간**: 1.5일

---

### G06-04: 공통 타입 + 모듈 stub

**목표**: ARCH §4.1 모든 타입 + ARCH §5.1 PerProblemReport 타입 + ARCH §5.1 ReasoningTree 타입 + 모듈 6개 stub.

**구현 단계**:
1. `src/lib/legend/types.ts` 작성:
   ```ts
   // ARCH §4.1 + §5.1 그대로
   export type TutorName = ... ;
   export type Tier = 0 | 1 | 2;
   export type ProblemArea = 'common' | 'calculus' | 'geometry' | 'probability' | 'algebra';
   export interface RouteInput { ... }
   export interface RouteDecision { ... }
   export interface EscalationPrompt { ... }
   export interface TriggerLabel { trigger_id: string; tool_id?: string; why?: string; direction?: 'forward'|'backward'|'both' }
   export interface TutorCallInput { ... }
   export interface TutorCallResult { ... }
   export type QuotaKind = 'problem_total_daily' | 'legend_call_daily' | 'report_per_problem_daily' | 'weekly_report' | 'monthly_report';
   export interface QuotaStatus { ... }
   export interface PerProblemReport { schema_version: '1.1'; ... }       // Δ3 + Δ4
   export interface PerProblemStep { ... }                                 // Δ3 llm_struggle 옵셔널
   export interface TriggerCard { ... }
   export interface ReasoningTree { ... }                                  // Δ4
   export interface ReasoningTreeNode { ... }
   export interface ReasoningTreeEdge { ... }
   ```
2. `src/lib/legend/index.ts` — named re-export (`export * from './types'`).
3. 6 모듈 stub:
   - `legend-router.ts`: `export async function routeProblem(input: RouteInput): Promise<RouteDecision> { throw new Error('not_implemented'); }`
   - `stage0-similar.ts`, `stage1-manager.ts`, `stage2-probe.ts`, `escalation-detector.ts` 동일 패턴
4. `pnpm tsc --noEmit` 통과 확인.

**검증 기준**: tsc 0 에러 + 모든 타입 export 정상.

**rollback 전략**: `rm -rf src/lib/legend/`

**예상 시간**: 0.5일

---

### G06-05: Stage 0 (similar) + Stage 1 (Manager Haiku)

**목표**: ARCH §4.2 의 `matchSimilarProblem` + `classifyDifficulty` 구현.

**구현 단계**:

1. `src/lib/legend/stage0-similar.ts`:
   ```ts
   import { matchSimilarProblems } from '@/lib/euler/similar-problems'; // 기존 RPC 래퍼
   import type { TriggerLabel } from './types';

   export async function matchSimilarProblem(
     embedding: number[],
     threshold = 0.85,
   ): Promise<{ row: { id: string; trigger_labels: any[]; similarity: number }; triggers: TriggerLabel[] } | null> {
     const rows = await matchSimilarProblems(embedding, /*top_k*/ 1);
     if (!rows.length || rows[0].similarity < threshold) return null;
     const triggers = (rows[0].trigger_labels ?? []).map(t => ({
       trigger_id: t.trigger_id,
       tool_id: t.tool_id,
       why: t.why,
       direction: t.direction,
     }));
     return { row: rows[0], triggers };
   }
   ```

2. `src/lib/legend/stage1-manager.ts`:
   - 기존 `src/lib/ai/euler-manager-prompt.ts` (또는 `src/lib/euler/manager` 차용) 의 difficulty-classifier 패턴 import
   - Haiku 4.5 JSON 모드 호출 → `{difficulty: 1..6, confidence: 0..1, area: ProblemArea}`
   - 프롬프트: "다음 수학 문제의 난이도(1~6, 수능 기준 1~3 평이/4~5 표준/6 킬러), confidence(0~1), area(common/calculus/geometry/probability/algebra) JSON 으로 출력하시오." + few-shot 3개

3. 단위 테스트 (vitest, 모킹 LLM/RPC):
   - `stage0-similar.test.ts`: similarity 0.9 → hit / 0.7 → null
   - `stage1-manager.test.ts`: 평이 문제 (난이도 1) / 킬러 (난이도 6) / area 분류 정확

**검증 기준**: `pnpm dlx vitest run src/lib/legend/__tests__/stage0-similar.test.ts src/lib/legend/__tests__/stage1-manager.test.ts` 모두 PASS.

**rollback 전략**: 두 파일 + 두 테스트 파일 삭제.

**예상 시간**: 1.5일

---

### G06-06: Stage 2 + escalation-detector + legend-router 통합

**목표**: ARCH §4.2 의 `runRamanujanProbe` + `detectEscalation` + `routeProblem` (3-Stage 통합).

**구현 단계**:

1. `src/lib/legend/stage2-probe.ts`:
   ```ts
   import { callModel } from './call-model';                // G06-08 작성 — 임시로 Anthropic SDK 직접 호출 후 G06-08 에서 대체
   import { verifyWithSympy } from '@/lib/euler/sympy-client';

   export interface ProbeResult { solved: boolean; trace_jsonb: unknown; escalation_signals: ('sympy_fail'|'stuck_token')[]; duration_ms: number; }

   export async function runRamanujanProbe(problem: string): Promise<ProbeResult> {
     const t0 = Date.now();
     const probePrompt = `다음 문제를 풀어보시오. 어렵다고 느끼면 "막힘:[이유]" 토큰을 반드시 출력하시오.\n\n문제: ${problem}`;
     const { text } = await callOpus(probePrompt, { mode: 'baseline', max_tokens: 5000 });
     const stuck = /막힘\s*:/i.test(text);
     const sympyResult = await verifyWithSympy(problem, text).catch(() => ({ ok: false }));
     const signals: ('sympy_fail'|'stuck_token')[] = [];
     if (!sympyResult.ok) signals.push('sympy_fail');
     if (stuck) signals.push('stuck_token');
     return { solved: sympyResult.ok && !stuck, trace_jsonb: { text }, escalation_signals: signals, duration_ms: Date.now()-t0 };
   }
   ```

2. `src/lib/legend/escalation-detector.ts`:
   - `sympy_fail` AND `stuck_token` 둘 다 있을 때만 EscalationPrompt 반환 (else null)
   - message: "라마누잔이 이 문제에서 막힘을 보입니다. 어떻게 할까요?"
   - options 3종: escalate (target_tutor 은 area별 매핑 — common/calculus → gauss, geometry → von_neumann, 가형 → leibniz, default → euler), retry, hint_only

3. `src/lib/legend/legend-router.ts`:
   - 통합 흐름:
     ```ts
     export async function routeProblem(input: RouteInput): Promise<RouteDecision> {
       const t0 = Date.now();
       const embedding = input.embedding ?? await embedText(input.problem_text);
       // Stage 0
       const s0 = await matchSimilarProblem(embedding);
       if (s0) {
         const decision = mkDecision({ stage_reached: 0, routed_tier: inferTierFromTriggers(s0.triggers), routed_tutor: pickTutor(...), precomputed_triggers: s0.triggers });
         await insertRoutingDecision(input.user_id, decision);
         return decision;
       }
       // Stage 1
       const s1 = await classifyDifficulty(input.problem_text);
       if (s1.confidence >= 0.7) {
         const tier = s1.difficulty <= 2 ? 0 : s1.difficulty <= 4 ? 1 : 2;
         const tutor = pickTutorByAreaAndTier(s1.area, tier);
         const decision = mkDecision({ stage_reached: 1, routed_tier: tier, routed_tutor: tutor, area: s1.area, confidence: s1.confidence });
         await insertRoutingDecision(...);
         return decision;
       }
       // Stage 2
       const probe = await runRamanujanProbe(input.problem_text);
       const escalation = detectEscalation(probe);
       const decision = mkDecision({ stage_reached: 2, routed_tier: escalation ? 2 : 1, routed_tutor: 'ramanujan_intuit', escalation_prompt: escalation });
       await insertRoutingDecision(...);
       return decision;
     }
     ```

4. 단위 테스트 `legend-router.test.ts` — 3 시나리오 모킹.

**검증 기준**: `pnpm dlx vitest run src/lib/legend/__tests__/legend-router.test.ts` PASS + 3 시나리오 모두 cover.

**rollback 전략**: 3 파일 + 테스트 삭제.

**예상 시간**: 2일

---

### G06-07: /api/legend/route SSE 라우트

**목표**: ARCH §7.2 의 SSE 메시지 형식. 인증 + rate limit + quota.

**구현 단계**:

1. `src/lib/legend/sse.ts` 헬퍼:
   ```ts
   export function sseEncoder() {
     const encoder = new TextEncoder();
     return {
       message(type: string, payload: unknown) {
         return encoder.encode(`data: ${JSON.stringify({ type, payload })}\n\n`);
       },
     };
   }
   ```

2. `src/app/api/legend/route/route.ts`:
   ```ts
   export async function POST(req: Request) {
     // 1. 인증
     const supabase = createClient();
     const { data: { user } } = await supabase.auth.getUser();
     if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
     // 2. rate limit (5 req/sec per user — Vercel KV 또는 in-memory Map TTL)
     if (!await checkRateLimit(user.id, 'legend_route')) return Response.json({ error: 'rate_limited' }, { status: 429 });
     // 3. quota (problem_total_daily +1)
     const q = await consumeQuota(user.id, 'problem_total_daily');
     if (!q.allowed) return Response.json({ error: 'quota_exceeded', kind: 'problem_total_daily', reset_at: q.reset_at }, { status: 402 });
     // 4. SSE stream
     const body = await req.json();
     const stream = new ReadableStream({
       async start(controller) {
         const sse = sseEncoder();
         try {
           // Stage 0 진행 알림 (즉시 출력)
           controller.enqueue(sse.message('stage_progress', { stage: 0, status: 'running' }));
           const decision = await routeProblem({ user_id: user.id, ...body });
           controller.enqueue(sse.message('stage_progress', { stage: decision.stage_reached, status: 'done' }));
           controller.enqueue(sse.message('route_decided', decision));
           // Tier 2 인 경우 legend_call_daily +1
           if (decision.routed_tier === 2) await consumeQuota(user.id, 'legend_call_daily');
           controller.close();
         } catch (e) {
           controller.enqueue(sse.message('error', { message: (e as Error).message }));
           controller.close();
         }
       },
     });
     return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } });
   }
   ```

3. rate limiter: `src/lib/legend/rate-limit.ts` — Vercel KV 사용 (없으면 in-memory Map + setInterval cleanup, 단일 노드 한정 — production 에서는 KV 필수).

**검증 기준**:
- `pnpm dev` + `curl -N -X POST http://localhost:3000/api/legend/route -H "Cookie: <session>" -d '{"problem_text":"sin x = 1/2 의 해","input_mode":"text"}'` → SSE 3 메시지 (stage_progress running → stage_progress done → route_decided)
- 인증 없으면 401
- 6회 연속 호출 → 6번째 429
- quota 5회 도달 후 6번째 402

**rollback 전략**: route 디렉터리 삭제 + sse.ts 삭제.

**예상 시간**: 1.5일

---

### G06-08: callModel 추출 + tutor-orchestrator 코어

**목표**: `scripts/eval-kpi.ts` 의 callModel 을 `src/lib/legend/call-model.ts` 로 추출 + `tutor-orchestrator.ts` 6 튜터 통합.

**구현 단계**:

1. `src/lib/legend/call-model.ts`:
   - `eval-kpi.ts` 의 callModel 함수 그대로 이동 (5 분기: anthropic-sonnet/opus/haiku, openai gpt-5.5, google gemini-3-1-pro)
   - 시그니처: `export async function callModel(args: { provider, model_id, prompt, mode: 'baseline'|'agentic_5step'|'calc_haiku', max_tokens?, system?, tools? }): Promise<{ text: string; trace: unknown; turns: number; tool_retries: number; reasoning_chars: number; }>`
   - agentic_5step: G-05 의 진짜 multi-turn (매 turn 마다 원문제 + 누적 trace 주입). 5 turn max. 매 turn 후 self-eval ("막힘"|"답:"|"진행 중") 분기.
   - calc_haiku: Haiku + Anthropic tool calling (기존 `src/lib/euler/reasoner-with-tools.ts` 패턴 + sympy tools 6종 import)
   - Gemini: G-05c 의 safetySettings BLOCK_NONE × 4 + finishReason 로깅 + system prompt 에 "원문제 인용 X, 자기 표현"

2. `src/lib/legend/tutor-orchestrator.ts`:
   ```ts
   const TUTOR_CONFIG: Record<TutorName, { tier: Tier; model: string; mode: string; provider: string }> = {
     ramanujan_calc:   { tier: 0, model: process.env.ANTHROPIC_HAIKU_MODEL_ID!, mode: 'calc_haiku',    provider: 'anthropic' },
     ramanujan_intuit: { tier: 1, model: process.env.ANTHROPIC_OPUS_MODEL_ID!,  mode: 'baseline',      provider: 'anthropic' },
     gauss:            { tier: 2, model: process.env.GEMINI_MODEL_ID!,          mode: 'agentic_5step', provider: 'google' },
     von_neumann:      { tier: 2, model: process.env.OPENAI_MODEL_ID!,          mode: 'agentic_5step', provider: 'openai' },
     euler:            { tier: 2, model: process.env.ANTHROPIC_OPUS_MODEL_ID!,  mode: 'agentic_5step', provider: 'anthropic' },
     leibniz:          { tier: 2, model: process.env.ANTHROPIC_SONNET_MODEL_ID!,mode: 'agentic_5step', provider: 'anthropic' },
   };

   export async function callTutor(input: TutorCallInput): Promise<TutorCallResult> {
     const cfg = TUTOR_CONFIG[input.tutor];
     const t0 = Date.now();
     const result = await callModel({ provider: cfg.provider, model_id: cfg.model, prompt: input.problem_text, mode: cfg.mode });
     // legend_tutor_sessions insert
     const { data: session } = await supabaseServer().from('legend_tutor_sessions').insert({
       user_id: input.user_id,
       routing_decision_id: input.routing_decision_id,
       problem_hash: sha256(input.problem_text),
       tutor_name: input.tutor,
       tier: cfg.tier,
       call_kind: input.call_kind,
       model_id: cfg.model,
       mode: cfg.mode,
       trace_jsonb: result.trace,
       final_answer: extractFinalAnswer(result.text),
       duration_ms: Date.now()-t0,
     }).select('id').single();
     return { session_id: session!.id, trace_jsonb: result.trace, final_answer: extractFinalAnswer(result.text), duration_ms: Date.now()-t0 };
   }
   ```

3. agentic_5step 핵심 (G-05 통찰 — 매 turn 마다 원문제 + 누적 trace 주입):
   ```
   for turn in 1..5:
     prompt = `[문제]\n${problem}\n\n[지금까지 풀이]\n${traceSoFar}\n\n[다음 단계]\n다음 step 1개만 진행. 막혔으면 "막힘:[이유]". 답이 나왔으면 "답:[값]".`
     result = generateText(prompt, max_tokens=5000)
     traceSoFar += result
     if result startsWith "답:": break
     if result startsWith "막힘:": break
   ```

4. 단위 테스트 — 6 튜터 모킹 호출 시 정확한 cfg 매핑.

**검증 기준**: `pnpm dlx vitest run src/lib/legend/__tests__/tutor-orchestrator.test.ts` 6/6 PASS.

**rollback 전략**: call-model.ts + tutor-orchestrator.ts 삭제. `eval-kpi.ts` 의 callModel 은 무수정 (참조만 하므로).

**예상 시간**: 2.5일

---

### G06-09: fallback 매트릭스

**목표**: ARCH §9.5 의 fallback 매트릭스. Gemini 429 자동 전환.

**구현 단계**:

1. `src/lib/legend/tutor-fallback.ts`:
   ```ts
   const FALLBACK: Record<TutorName, [TutorName, TutorName] | [TutorName] | []> = {
     gauss: ['von_neumann', 'leibniz'],
     von_neumann: ['gauss', 'euler'],
     euler: ['leibniz', 'gauss'],
     leibniz: ['euler', 'von_neumann'],
     ramanujan_calc: ['ramanujan_intuit'],
     ramanujan_intuit: ['leibniz'],
   };

   export function getFallback(tutor: TutorName, level: 1|2): TutorName | null {
     return FALLBACK[tutor]?.[level-1] ?? null;
   }

   export function isRecoverableError(err: unknown): { recoverable: boolean; reason?: string } {
     const msg = (err as any)?.message ?? '';
     if (/RESOURCE_EXHAUSTED|429/i.test(msg)) return { recoverable: true, reason: 'gemini_quota' };
     if (/rate_limit|too_many_requests/i.test(msg)) return { recoverable: true, reason: 'rate_limit' };
     if (/api_key|authentication/i.test(msg)) return { recoverable: true, reason: 'auth' };
     return { recoverable: false };
   }
   ```

2. `tutor-orchestrator.ts` 의 `callTutor` 에 try/catch 통합:
   ```ts
   export async function callTutor(input: TutorCallInput): Promise<TutorCallResult & { fallback_used?: { from: TutorName; to: TutorName; reason: string } }> {
     try {
       return await callTutorRaw(input);
     } catch (e) {
       const check = isRecoverableError(e);
       if (!check.recoverable) throw e;
       const fb = getFallback(input.tutor, 1);
       if (!fb) throw e;
       const result = await callTutorRaw({ ...input, tutor: fb });
       return { ...result, fallback_used: { from: input.tutor, to: fb, reason: check.reason! } };
     }
   }
   ```

3. SSE stream 에서 fallback_used 감지 시 사용자 메시지 1줄 추가:
   - `controller.enqueue(sse.message('tutor_fallback', { from: 'gauss', to: 'von_neumann', message: '가우스가 잠시 휴식 중, 폰 노이만이 응답합니다' }))`

4. 단위 테스트 — Gemini 429 throw → 폰 노이만 자동 호출 + fallback_used 필드.

**검증 기준**: `pnpm dlx vitest run src/lib/legend/__tests__/tutor-fallback.test.ts` PASS.

**rollback 전략**: tutor-fallback.ts 삭제 + tutor-orchestrator.ts 의 try/catch 제거.

**예상 시간**: 1일

---

### G06-10: quota-manager (Δ1)

**목표**: ARCH §4.2 의 5종 quota + RPC `increment_legend_quota` + 자격 게이트.

**구현 단계**:

1. KST boundary 헬퍼 (`src/lib/legend/quota-boundaries.ts`):
   ```ts
   const KST = 9 * 60; // minutes
   export function todayKST(): string { /* YYYY-MM-DD KST 자정 */ }
   export function thisMondayKST(): string { /* 월요일 자정 */ }
   export function thisMonthFirstKST(): string { /* 1일 자정 */ }
   export function periodStartFor(kind: QuotaKind): string {
     if (kind === 'weekly_report') return thisMondayKST();
     if (kind === 'monthly_report') return thisMonthFirstKST();
     return todayKST();
   }
   export function nextResetAt(kind: QuotaKind): string { /* ISO */ }
   ```

2. `src/lib/legend/quota-manager.ts`:
   ```ts
   const LIMITS: Record<QuotaKind, number> = {
     problem_total_daily: Number(process.env.LEGEND_BETA_PROBLEM_TOTAL_DAILY ?? 5),
     legend_call_daily:   Number(process.env.LEGEND_BETA_LEGEND_CALL_DAILY ?? 3),
     report_per_problem_daily: Number(process.env.LEGEND_BETA_REPORT_PER_PROBLEM_DAILY ?? 1),
     weekly_report:  Number(process.env.LEGEND_BETA_WEEKLY_REPORT_LIMIT ?? 1),
     monthly_report: Number(process.env.LEGEND_BETA_MONTHLY_REPORT_LIMIT ?? 1),
   };

   const GATES: Partial<Record<QuotaKind, number>> = {
     weekly_report: Number(process.env.LEGEND_WEEKLY_REPORT_PROBLEM_GATE ?? 10),
     monthly_report: Number(process.env.LEGEND_MONTHLY_REPORT_PROBLEM_GATE ?? 20),
   };

   export async function checkQuota(user_id: string, kind: QuotaKind): Promise<QuotaStatus> {
     const period = periodStartFor(kind);
     const { data: row } = await supabase.from('legend_quota_counters').select('count').eq('user_id', user_id).eq('quota_kind', kind).eq('period_start', period).maybeSingle();
     const used = row?.count ?? 0;
     const limit = LIMITS[kind];
     // 자격 게이트
     if (GATES[kind] != null) {
       const { data: lifetime } = await supabase.rpc('get_lifetime_problem_count', { p_user_id: user_id });
       if (lifetime < GATES[kind]!) return { kind, used, limit, allowed: false, blocked_reason: 'eligibility_gate', eligibility: { current: lifetime, required: GATES[kind]! }, reset_at: nextResetAt(kind) };
     }
     return { kind, used, limit, allowed: used < limit, blocked_reason: used >= limit ? 'limit_exceeded' : undefined, reset_at: nextResetAt(kind) };
   }

   export async function consumeQuota(user_id: string, kind: QuotaKind): Promise<QuotaStatus> {
     const status = await checkQuota(user_id, kind);
     if (!status.allowed) return status;
     const period = periodStartFor(kind);
     const { data: new_count } = await supabase.rpc('increment_legend_quota', { p_user_id: user_id, p_quota_kind: kind, p_period_start: period });
     return { ...status, used: new_count, allowed: new_count <= LIMITS[kind] };
   }
   ```

3. 단위 테스트 (10 시나리오):
   - 5 quota 각각 첫 호출 (used=0, allowed=true)
   - 한도 도달 직후 (used=limit, allowed=false, reason=limit_exceeded)
   - weekly 자격 게이트 미충족 (lifetime=5, gate=10 → blocked, reason=eligibility_gate)
   - weekly 자격 게이트 충족 (lifetime=10, gate=10 → allowed)
   - monthly 자격 게이트
   - boundary: 월요일 자정 직후 reset
   - 동시 5 호출 → atomic count

**검증 기준**: `pnpm dlx vitest run src/lib/legend/__tests__/quota-manager.test.ts` 10/10 PASS.

**rollback 전략**: 2 파일 + 테스트 삭제.

**예상 시간**: 2일

---

### G06-11: /api/legend/solve + /escalate + /retry-with-tutor + /quota

**목표**: ARCH §7 의 4 라우트.

**구현 단계**:

1. `src/app/api/legend/solve/route.ts` (POST + SSE):
   - body: `{ routing_decision_id: string; tutor: TutorName; call_kind: 'primary'|'second_opinion'|'retry' }`
   - SSE 메시지: `tutor_turn` (turn 마다) → `tool_call` (tool 호출 시) → `tutor_fallback` (fallback 발생 시) → `final` (session_id 포함)
   - quota 처리: Tier 2 호출 시 legend_call_daily +1 (이미 /route 에서 처리됐는지 체크 — `routing_decision_id` 의 routed_tier 확인)
   - report 비동기 build: `final` payload 반환 후 backgroundTask `await buildReport({ session_id })` (Vercel after())

2. `src/app/api/legend/escalate/route.ts` (POST):
   - body: `{ routing_decision_id: string; choice: 'escalate'|'retry'|'hint_only'; target_tutor?: TutorName }`
   - choice 별 분기:
     - escalate → /solve 와 동일 흐름 (target_tutor 호출)
     - retry → 라마누잔 baseline 재호출 (max_tokens 8000 으로 깊이 추가)
     - hint_only → Haiku 4.5 힌트 1~2문장 (정답 X)
   - legend_routing_decisions.user_chose_escalation update

3. `src/app/api/legend/retry-with-tutor/route.ts` (POST):
   - body: `{ problem_hash: string; target_tutor: TutorName }`
   - 같은 problem_hash 의 가장 최근 routing_decision_id 조회 → callTutor (call_kind='second_opinion')
   - quota: problem_total_daily + legend_call_daily 둘 다 +1 (Δ1)

4. `src/app/api/legend/quota/route.ts` (GET):
   - 5 QuotaStatus 병렬 조회 (`Promise.all`) → 배열 반환

5. 모든 라우트: 인증 가드 + RLS user_id 일치 검증 (routing_decision / session 의 user_id 가 auth.uid 와 일치 확인).

**검증 기준**:
- `pnpm dev` + 4 curl 시나리오 통과
- /solve SSE final 도달 / final.session_id 로 R1 fetch 성공
- /escalate 3 choice 모두 200
- /retry-with-tutor 후 /quota 응답에서 problem_total + legend_call 둘 다 +1
- 다른 user 의 routing_decision_id 로 /solve 시도 → 403

**rollback 전략**: 4 라우트 디렉터리 삭제.

**예상 시간**: 2일

---

### G06-12: step-decomposer + 모델별 trace normalizer

**목표**: ARCH §5.2 의 `decomposeChainSteps` + 3 provider trace normalizer.

**구현 단계**:

1. fixture 6종 작성 (`src/lib/legend/report/fixtures/`):
   - `anthropic-baseline.json`: Anthropic Sonnet baseline 응답 (단일 text)
   - `anthropic-agentic.json`: Opus 4.7 agentic_5step (5 turn + tool_use blocks)
   - `openai-agentic.json`: GPT-5.5 agentic (function_call 포함)
   - `google-agentic.json`: Gemini 3.1 Pro (parts array)
   - `chain-depth1.json`: 단일 step (parse → answer)
   - `chain-depth5.json`: 깊은 chain (parse → backward 2 → forward 1 → tool_call → answer)

2. `src/lib/legend/report/trace-normalizer.ts`:
   ```ts
   export interface NormalizedStep {
     index: number;
     turn_index: number;          // agentic turn 번호
     content: string;
     tool_use?: { name: string; input: any; output: any };
     reasoning_chars: number;
     step_ms: number;
   }
   export function normalizeTrace(trace: unknown, provider: 'anthropic'|'openai'|'google'): NormalizedStep[] {
     if (provider === 'anthropic') return normalizeAnthropic(trace);
     if (provider === 'openai') return normalizeOpenAI(trace);
     return normalizeGoogle(trace);
   }
   ```
   - Anthropic: `content[]` 배열, `type='tool_use'` block 추출
   - OpenAI: `choices[0].message.tool_calls` 또는 streaming delta function_call
   - Google: `candidates[0].content.parts[]` (text / functionCall 분기)

3. `src/lib/legend/report/step-decomposer.ts`:
   ```ts
   export async function decomposeChainSteps(trace: unknown, session_id: string): Promise<PerProblemStep[]> {
     const session = await fetchSession(session_id);
     const steps_raw = normalizeTrace(trace, session.provider);
     const steps: PerProblemStep[] = [];
     for (const [idx, raw] of steps_raw.entries()) {
       const kind = classifyStepKind(raw);                          // heuristic regex 1차
       const trigger_id = await matchTrigger(raw, session.area);    // 1.used_tool_id / 2.embed ANN / 3.Haiku fallback
       const difficulty = inferDifficulty(raw, kind);
       steps.push({ index: idx, kind, summary: raw.content.slice(0, 120), difficulty, is_pivotal: false, trigger_id, tool_id: raw.tool_use?.name });
     }
     // pivotal: max difficulty (kind=='tool_call' tie-breaker)
     const pivotal = pickPivotal(steps);
     steps[pivotal].is_pivotal = true;
     // DB insert
     await supabaseServer().from('solve_step_decomposition').insert(steps.map(s => ({ ...s, session_id })));
     return steps;
   }

   function classifyStepKind(raw: NormalizedStep): PerProblemStep['kind'] {
     if (raw.tool_use) return 'tool_call';
     if (/구해야|문제를 정리|주어진/.test(raw.content)) return 'parse';
     if (/이 문제는|영역은|단원은/.test(raw.content)) return 'domain_id';
     if (/조건에서|알 수 있는|유도/.test(raw.content)) return 'forward';
     if (/필요한|역으로|구하려면/.test(raw.content)) return 'backward';
     if (/계산|값은|=/.test(raw.content)) return 'computation';
     if (/검산|확인|verify/.test(raw.content)) return 'verify';
     if (/답은|따라서|∴/.test(raw.content)) return 'answer';
     return 'computation'; // fallback
   }
   ```
   - matchTrigger 3-tier: (1) raw.tool_use.name → math_tools.id 직접 / (2) raw.content embed → match_math_tool_triggers RPC top-1 ≥ 0.7 / (3) Haiku 4.5 fallback ($0.0001)

4. 단위 테스트:
   - `trace-normalizer.test.ts`: 6 fixture → 정확한 NormalizedStep[]
   - `step-decomposer.test.ts`: chain-depth5 fixture → 5 steps + pivotal idx 정확

**검증 기준**: `pnpm dlx vitest run src/lib/legend/report/__tests__/` 모두 PASS.

**rollback 전략**: report/ 디렉터리 삭제.

**예상 시간**: 3일

---

### G06-13: llm-struggle-extractor ⭐ Δ3

**목표**: ARCH §5.2 의 `extractLLMStruggle` 알고리즘.

**구현 단계**:

1. `src/lib/legend/report/llm-struggle-extractor.ts`:
   ```ts
   export interface LLMStruggleSnapshot { step_index: number; turns_at_step: number; tool_retries: number; reasoning_chars: number; step_ms: number; resolution_text?: string; }

   export async function extractLLMStruggle(trace: unknown, steps: PerProblemStep[], provider: 'anthropic'|'openai'|'google'): Promise<LLMStruggleSnapshot[]> {
     const normalized = normalizeTrace(trace, provider);
     const turn_ranges = mapStepsToTurnRanges(steps, normalized);  // step.index → [turn_start, turn_end]
     const snapshots: LLMStruggleSnapshot[] = [];
     for (const [idx, range] of turn_ranges.entries()) {
       const turns_at_step = range[1] - range[0] + 1;
       const tool_retries = countToolRetries(normalized.slice(range[0], range[1]+1));
       const reasoning_chars = sumReasoningChars(normalized.slice(range[0], range[1]+1));
       const step_ms = sumStepMs(normalized.slice(range[0], range[1]+1));
       snapshots.push({ step_index: idx, turns_at_step, tool_retries, reasoning_chars, step_ms });
     }
     // hardest = max(step_ms)
     const hardest = snapshots.reduce((a,b)=> b.step_ms > a.step_ms ? b : a);
     // Haiku 요약 ($0.0002, max_tokens 200) — hardest step 한정
     const hardestStep = steps[hardest.step_index];
     hardest.resolution_text = await summarizeResolution(hardestStep.summary, /*1~2문장*/);
     // DB update solve_step_decomposition.llm_*
     await Promise.all(snapshots.map(s => supabaseServer().from('solve_step_decomposition').update({ llm_turns_at_step: s.turns_at_step, llm_tool_retries: s.tool_retries, llm_reasoning_chars: s.reasoning_chars, llm_step_ms: s.step_ms, llm_resolution_text: s.resolution_text }).eq('session_id', session_id).eq('step_index', s.step_index)));
     return snapshots;
   }

   async function summarizeResolution(stepSummary: string): Promise<string> {
     const { text } = await callModel({ provider: 'anthropic', model_id: process.env.ANTHROPIC_HAIKU_MODEL_ID!, prompt: `다음 풀이 단계가 가장 어려웠습니다. "어떻게 해결했는가" 를 1~2문장 (max 200자) 학생 친화적으로 요약하시오.\n\n단계 요약: ${stepSummary}`, mode: 'baseline', max_tokens: 200 });
     return text.trim();
   }
   ```

2. `mapStepsToTurnRanges` 의사코드:
   ```
   step → turn 매핑 = step.summary 의 첫 30자가 normalized[turn].content 에 substring 일치하는 turn 검색
   매칭 실패 시 turn_index 순서대로 분할
   ```

3. 단위 테스트 — fixture 6종 → snapshots 정확.

**검증 기준**: `pnpm dlx vitest run src/lib/legend/report/__tests__/llm-struggle-extractor.test.ts` PASS + hardest step idx 정확.

**rollback 전략**: 파일 삭제.

**예상 시간**: 1.5일

---

### G06-14: tree-builder ⭐ Δ4

**목표**: ARCH §5.2 의 `buildReasoningTree` — recursive-reasoner / alternatingChain trace → ReasoningTree DAG.

**구현 단계**:

1. `src/lib/legend/report/tree-builder.ts`:
   ```ts
   export async function buildReasoningTree(args: { session_id: string; problem_text: string; steps: PerProblemStep[]; trace: unknown; }): Promise<ReasoningTree> {
     const conditions = parseConditions(args.problem_text);    // "조건 1·2·3..." 추출 (regex + LLM fallback)
     const nodes: ReasoningTreeNode[] = [];
     const edges: ReasoningTreeEdge[] = [];

     // 1. answer 노드 (root)
     nodes.push({ id: 'answer', label: '답', text: extractFinalAnswer(args.steps), kind: 'answer', depth: 0, is_pivotal: false });

     // 2. step 별 노드 + edge
     for (const step of args.steps) {
       if (step.kind === 'answer') continue;  // 이미 root
       const node: ReasoningTreeNode = {
         id: `s${step.index}`,
         label: step.kind === 'tool_call' ? step.tool_id ?? `s${step.index}` : `s${step.index}`,
         text: step.summary,
         kind: mapStepToTreeKind(step.kind),         // backward→subgoal, forward→derived_fact, tool_call→subgoal, parse→condition, ...
         depth: -1,                                  // 후처리
         step_index: step.index,
         trigger_id: step.trigger_id,
         is_pivotal: step.is_pivotal,
         student_stuck_ms: step.user_stuck_ms,
         llm_struggle_ms: step.llm_struggle?.step_ms,
       };
       nodes.push(node);
       // backward step: requires edge 부모 (다음 backward 또는 answer)
       if (step.kind === 'backward') {
         const parent = findNextBackwardOrAnswer(args.steps, step.index);
         edges.push({ from: node.id, to: parent.id, kind: 'requires' });
       }
       // forward step: derived_from edge (조건 → derived_fact)
       if (step.kind === 'forward') {
         const sourceConditions = matchConditions(step.summary, conditions);
         for (const c of sourceConditions) edges.push({ from: node.id, to: `c${c.idx}`, kind: 'derived_from' });
       }
       // tool_call: requires edge (해당 step 의 input → tool 노드 → output)
     }

     // 3. condition 노드 추가
     for (const c of conditions) {
       nodes.push({ id: `c${c.idx}`, label: `조건 ${c.idx+1}`, text: c.text, kind: 'condition', depth: -1, source_condition_idx: c.idx, is_pivotal: false });
     }

     // 4. 다중 부모 감지 — 같은 trigger_id 또는 같은 summary hash 보유 노드 → edge 다중
     detectMultiParents(nodes, edges);

     // 5. depth 계산 (BFS from root='answer')
     computeDepth(nodes, edges, 'answer');

     // 6. 미매칭 step (parse / answer kind 외 isolated) → root 직접 자식 fallback
     attachOrphans(nodes, edges, 'answer');

     // 7. collapse hint
     const node_count = nodes.length;
     const depth_max = Math.max(...nodes.map(n => n.depth));
     const tree: ReasoningTree = {
       schema_version: '1.0',
       root_id: 'answer',
       nodes, edges, conditions,
       depth_max, node_count,
     };
     // 8. DB insert
     await supabaseServer().from('solve_reasoning_trees').upsert({
       session_id: args.session_id,
       user_id: /* fetch from session */,
       tree_jsonb: tree,
       depth_max, node_count,
       branching_factor: edges.length / Math.max(node_count - 1, 1),
     });
     return tree;
   }
   ```

2. fixture 4 트리:
   - `tree-single-path.json`: depth 3, 직선 (parse → backward → answer)
   - `tree-multi-parent.json`: depth 4, 같은 derived_fact 두 subgoal 참조
   - `tree-deep.json`: depth 7, 노드 15
   - `tree-collapse.json`: 노드 35 (collapse_hint=true)

3. 단위 테스트 — fixture 4 → 정확한 nodes/edges 수 + depth_max + branching_factor.

**검증 기준**: `pnpm dlx vitest run src/lib/legend/report/__tests__/tree-builder.test.ts` PASS.

**rollback 전략**: tree-builder.ts 삭제.

**예상 시간**: 3일

---

### G06-15: trigger-expander + stuck-tracker

**목표**: ARCH §5.2 의 `expandTrigger` + stuck-tracker.

**구현 단계**:

1. `src/lib/legend/report/trigger-expander.ts`:
   ```ts
   export async function expandTrigger(primary_trigger_id: string, exclude_tool_id?: string): Promise<TriggerCard[]> {
     const { data: primary } = await supabase.from('math_tool_triggers').select('id, condition_pattern, tool_id, embedding_forward').eq('id', primary_trigger_id).single();
     // ANN top-K (기존 retriever 패턴)
     const { data: candidates } = await supabase.rpc('match_math_tool_triggers', { query_embedding: primary.embedding_forward, threshold: 0.7, top_k: 10 });
     const filtered = candidates.filter(c => c.tool_id !== exclude_tool_id && c.id !== primary_trigger_id).slice(0, 3);
     // similar_problems 에서 같은 trigger.why 라벨 → example_problem_ref
     const cards = await Promise.all(filtered.map(async c => ({
       trigger_id: c.id, tool_name: c.tool_name, direction: c.direction, pattern_short: c.condition_pattern.slice(0, 60), why_text: c.why_text,
       example_problem_ref: await findExampleByTrigger(c.id),
     })));
     return cards;
   }
   ```

2. `src/lib/legend/report/stuck-tracker.ts`:
   ```ts
   export async function recordStuck(args: { session_id: string; step_index: number; delta_stuck_ms: number; delta_revisits: number; }): Promise<void> {
     await supabase.rpc('increment_stuck_metrics', args);  // RPC 신규 — `update solve_step_decomposition set user_stuck_ms = coalesce(user_stuck_ms, 0) + delta_stuck_ms, user_revisit_count = user_revisit_count + delta_revisits where session_id and step_index`
   }
   export async function aggregateStuck(session_id: string): Promise<StuckSnapshot[]> {
     const { data } = await supabase.from('solve_step_decomposition').select('step_index, user_stuck_ms, user_revisit_count').eq('session_id', session_id);
     return data.map(d => ({ step_index: d.step_index, user_stuck_ms: d.user_stuck_ms ?? 0, revisit_count: d.user_revisit_count }));
   }
   ```
   - `increment_stuck_metrics` RPC 신규 추가 — 마이그레이션 G06-02 에 추가하거나 별도 파일. 단순 update 이므로 함수 안 만들고 client-side update 도 가능. 보안상 RPC 권장.

3. 단위 테스트 — primary trigger ID 1개 → expansion 카드 ≤ 3개 + exclude 정확 / stuck 누적 정확.

**검증 기준**: `pnpm dlx vitest run src/lib/legend/report/__tests__/trigger-expander.test.ts` PASS.

**rollback 전략**: 2 파일 삭제.

**예상 시간**: 1.5일

---

### G06-16: report-builder + /api/legend/report 5 라우트

**목표**: ARCH §5.2 의 `buildReport` + 5 라우트.

**구현 단계**:

1. `src/lib/legend/report/report-builder.ts`:
   ```ts
   export async function buildReport(args: { session_id: string; user_id: string; problem_text: string; }): Promise<PerProblemReport> {
     // 1. cache check
     const cached = await fetchCachedReport(args.session_id);
     if (cached) return cached;
     // 2. session + trace
     const session = await fetchSession(args.session_id);
     // 3. step decomposition
     const steps = await decomposeChainSteps(session.trace_jsonb, args.session_id);
     // 4. LLM struggle (Δ3) — 비동기 가능, 단 첫 build 에서는 await
     const struggles = await extractLLMStruggle(session.trace_jsonb, steps, session.provider);
     // 5. tree (Δ4)
     const tree = await buildReasoningTree({ session_id: args.session_id, problem_text: args.problem_text, steps, trace: session.trace_jsonb });
     // 6. trigger expansion
     const primary_trigger = pickPrimaryTrigger(steps);
     const expansions = primary_trigger ? await expandTrigger(primary_trigger, /*exclude=*/ session.tool_id) : [];
     // 7. stuck aggregation
     const stuck = await aggregateStuck(args.session_id);
     // 8. weakness reason — 기존 src/lib/euler/weakness-aggregator.ts 호출
     const stuck_signals = aggregateStuckSignals(stuck, steps);
     // 9. PerProblemReport 조립
     const report: PerProblemReport = {
       schema_version: '1.1',
       problem_summary: { text_short: args.problem_text.slice(0,80), area: session.area, difficulty: session.difficulty },
       tutor: { name: session.tutor_name, label_ko: TUTOR_LABEL_KO[session.tutor_name], model_short: TUTOR_MODEL_SHORT[session.tutor_name] },
       steps: steps.map((s, i) => ({ ...s, llm_struggle: struggles.find(x => x.step_index === i) })),
       pivotal_step_index: steps.findIndex(s => s.is_pivotal),
       trigger_summary: { primary: makeTriggerCard(primary_trigger), expansions },
       stuck_signals,
       llm_struggle_summary: makeLLMStruggleSummary(struggles, steps),
       reasoning_tree: tree,
     };
     // 10. cache upsert
     await supabase.from('per_problem_reports').upsert({ user_id: args.user_id, session_id: args.session_id, problem_hash: session.problem_hash, report_jsonb: report });
     return report;
   }
   ```

2. 5 라우트:
   - `src/app/api/legend/report/[sessionId]/route.ts` GET:
     - lazy build (cache miss 시 buildReport)
     - ETag = sha256(`${session_id}|${generated_at}`). client If-None-Match 시 304
     - RLS: session 의 user_id == auth.uid 검증
   - `src/app/api/legend/report/[sessionId]/stuck/route.ts` POST:
     - body: `{ step_index, delta_stuck_ms, delta_revisits }`
     - recordStuck 호출
   - `src/app/api/legend/report/weekly/route.ts` POST:
     - 자격 게이트 + quota 검사
     - 기존 `weakness-aggregator.ts` 호출 (R2 본격 build 는 G-07 — G-06 에서는 자격/quota 만 처리하고 단순 응답)
   - `src/app/api/legend/report/monthly/route.ts` POST: 동일 패턴
   - `src/app/api/legend/report/eligibility/route.ts` GET:
     - `get_lifetime_problem_count` RPC 호출
     - 응답: `{ lifetime_problem_count, weekly_eligible, monthly_eligible, weekly_gate, monthly_gate }`

3. 평가셋 5문항 자동 R1 생성 검증 스크립트 (`scripts/test-report-builder.ts`)

**검증 기준**:
- 평가셋 5문항 R1 생성 → tree.depth_max ≥ 1 + steps.length ≥ 3 + pivotal_step_index 정상
- 동일 session GET 두 번째 호출 → cache hit (build 시간 0)
- 자격 게이트 미충족 시 weekly/monthly 거부 응답

**rollback 전략**: report-builder.ts + 5 라우트 디렉터리 삭제.

**예상 시간**: 2일

---

### G06-17: 의존성 추가 + 컴포넌트 stub + /legend layout

**목표**: ARCH §6 표 + 부록 B.

**구현 단계**:

1. `package.json` 의존성 추가 (`minimum-release-age=7일` 정책 — `@xyflow/react@^12` 와 `dagre@^0.8` 모두 7일 이상 된 안정 버전 선택):
   ```bash
   pnpm add "@xyflow/react@^12" "dagre@^0.8"
   pnpm add -D "@types/dagre"
   ```
   - 만약 "too new" 에러 시 한 단계 이전 minor 사용 (e.g. 12.0.x 의 7일 이상 된 patch)

2. 11 컴포넌트 stub:
   - `PerProblemReportCard.tsx`, `ReasoningTreeView.tsx`, `StepDecompositionView.tsx`, `TriggerExpansionCard.tsx`, `LLMStruggleSection.tsx`, `TutorPickerModal.tsx`, `EscalationPrompt.tsx`, `QuotaIndicator.tsx`, `WeeklyReportRequestButton.tsx`, `MonthlyReportRequestButton.tsx`, `TutorBadge.tsx`, `RoutingTrace.tsx`
   - 각 stub: `'use client'` (또는 server component) + props 인터페이스 + 빈 JSX (Card placeholder)

3. `src/app/legend/layout.tsx`:
   - server component
   - Header 에 QuotaIndicator (5 dot)
   - children render
   - 인증 가드 (미인증 시 /login redirect)

4. `src/app/legend/page.tsx`:
   - 메인 채팅 화면 stub (G06-21 에서 본격 구현)
   - 기존 `src/app/euler/page.tsx` 패턴 차용 — import only 무수정

5. dynamic import for React Flow:
   ```tsx
   // ReasoningTreeView.tsx 내부
   const ReactFlow = dynamic(() => import('@xyflow/react').then(m => m.ReactFlow), { ssr: false, loading: () => <Skeleton /> });
   ```

**검증 기준**:
- `pnpm tsc --noEmit && pnpm next build` 통과
- 번들 분석 (`ANALYZE=true pnpm next build` 옵션) — `/legend/*` 신규 라우트 chunk 에 React Flow 60KB 추가 / 메인 라우트 chunk 변화 없음

**rollback 전략**: package.json 의존성 제거 + components/legend/ + app/legend/ 디렉터리 삭제.

**예상 시간**: 1일

---

### G06-18: PerProblemReportCard + Step + Trigger + TutorBadge

**목표**: ARCH §6.1 레이아웃 6 섹션 중 3 (problem / steps / trigger) + TutorBadge.

**구현 단계**:

1. `src/components/legend/TutorBadge.tsx`:
   - props: `{ tutor: TutorName }`
   - Shadcn Badge + tooltip ("가우스 — Gemini 3.1 Pro" + 한 줄 소개)
   - TUTOR_LABEL_KO 맵 차용

2. `src/components/legend/StepDecompositionView.tsx`:
   - props: `{ steps: PerProblemStep[]; pivotal_step_index: number; onStepClick?: (idx: number) => void }`
   - 각 step: 번호 + kind 라벨 + summary + difficulty stars
   - pivotal step: boxShadow + ★ 배지 + Framer Motion scale: 1.02
   - kind 별 아이콘 (parse=📝, backward=⬅, forward=➡, tool_call=🔧, computation=🔢, answer=✓)

3. `src/components/legend/TriggerExpansionCard.tsx`:
   - props: `{ primary: TriggerCard; expansions: TriggerCard[]; onExpandTrigger?: (id: string) => void }`
   - "같은 발동 조건 (\"패턴\"):" 헤딩 + 3 expansion 카드 horizontal scroll
   - example_problem_ref 있으면 "2017년 가형 30번 — 같은 trigger" 1줄

4. `src/components/legend/PerProblemReportCard.tsx`:
   - props: `{ report: PerProblemReport; onExpandStep?, onExpandTrigger?, onCallSecondOpinion? }`
   - 6 섹션 vertical stack — G06-18 에서는 3 섹션만 렌더 (tree·struggle·stuck 은 G06-19/20)
   - Framer Motion staggered fade-in (0.1s delay each)

5. `src/app/legend/solve/[sessionId]/page.tsx`:
   ```tsx
   export default async function Page({ params }: { params: Promise<{ sessionId: string }> }) {
     const { sessionId } = await params;
     const supabase = createClient();
     const { data: { user } } = await supabase.auth.getUser();
     if (!user) redirect('/login');
     const report = await fetch(`/api/legend/report/${sessionId}`, { /* server-side fetch */ }).then(r => r.json());
     return <PerProblemReportCard report={report} />;
   }
   ```

**검증 기준**:
- `pnpm dev` → `/legend/solve/<dummy-session>` (mock report fixture) → 3 섹션 정상 렌더 + Vibe (애니메이션 + glass card + Shadcn 일관성)
- Lighthouse Desktop ≥ 90
- 스크린샷 비교 (Chrome DevTools)

**rollback 전략**: 4 컴포넌트 + page.tsx 삭제.

**예상 시간**: 2일

---

### G06-19: ReasoningTreeView ⭐ Δ4

**목표**: ARCH §6 + §9.7 — React Flow + dagre 트리 시각화.

**구현 단계**:

1. `src/components/legend/ReasoningTreeNode.tsx` (커스텀 노드):
   - props: `{ data: { label, kind, is_pivotal, student_stuck_ms, llm_struggle_ms } }`
   - kind 별 색상 (5종):
     - goal: 보라
     - subgoal: 파랑
     - condition: 회색 (라이트)
     - derived_fact: 초록
     - answer: 골드 + 굵은 테두리
   - 강조 배지:
     - is_pivotal: ★ 배지 우상단
     - student_stuck_ms > threshold: ⚠ 노란 outline
     - llm_struggle_ms > threshold: 🔴 빨간 outline

2. `src/components/legend/ReasoningTreeView.tsx`:
   ```tsx
   'use client';
   const ReactFlow = dynamic(() => import('@xyflow/react').then(m => m.ReactFlow), { ssr: false });
   import dagre from 'dagre';

   export function ReasoningTreeView({ tree, onNodeClick, fullscreen = false }: Props) {
     const { nodes, edges } = useMemo(() => layoutTreeWithDagre(tree, fullscreen), [tree, fullscreen]);
     // 메인 카드 미리보기: depth ≤ LEGEND_TREE_DEPTH_PREVIEW (3) 노드만
     const visibleNodes = fullscreen ? nodes : nodes.filter(n => n.data.depth <= 3);
     // collapse hint
     const collapsed = !fullscreen && tree.node_count >= LEGEND_TREE_COLLAPSE_NODE_THRESHOLD;
     return (
       <div className={fullscreen ? 'fixed inset-0' : 'h-64'}>
         <ReactFlow nodes={visibleNodes} edges={edges} nodeTypes={{ custom: ReasoningTreeNode }} fitView onNodeClick={(_, n) => onNodeClick?.(n.data.step_index)} />
         {!fullscreen && <Button onClick={openFullscreen}>전체 트리 펼쳐보기</Button>}
       </div>
     );
   }

   function layoutTreeWithDagre(tree: ReasoningTree, fullscreen: boolean) {
     const g = new dagre.graphlib.Graph();
     g.setGraph({ rankdir: 'BT', nodesep: 40, ranksep: 60 });
     g.setDefaultEdgeLabel(() => ({}));
     for (const n of tree.nodes) g.setNode(n.id, { width: 140, height: 60 });
     for (const e of tree.edges) g.setEdge(e.from, e.to);
     dagre.layout(g);
     const nodes = tree.nodes.map(n => {
       const pos = g.node(n.id);
       return { id: n.id, type: 'custom', position: { x: pos.x, y: pos.y }, data: { ...n } };
     });
     const edges = tree.edges.map(e => ({ id: `${e.from}-${e.to}`, source: e.from, target: e.to, type: e.kind === 'requires' ? 'smoothstep' : 'default' }));
     return { nodes, edges };
   }
   ```

3. `src/components/legend/ReasoningTreeFullscreenModal.tsx`:
   - Shadcn Dialog 풀스크린
   - ReasoningTreeView fullscreen={true} + 노드 클릭 → 사이드 패널에 step 상세 (kind / summary / trigger / llm_struggle)

4. PerProblemReportCard 에 통합:
   ```tsx
   <Section title="추론 트리">
     <ReasoningTreeView tree={report.reasoning_tree} onNodeClick={handleNodeClick} />
   </Section>
   ```

5. Playwright `tests/e2e/legend-tree.spec.ts`:
   - 트리 렌더 + 노드 클릭 → step 강조
   - "전체 트리 펼쳐보기" → 풀스크린 모달
   - 모바일 viewport (iPhone 13) → INP ≤ 200ms 측정

**검증 기준**:
- Playwright 3 시나리오 PASS
- 모바일 Lighthouse INP ≤ 200ms
- depth 7+ tree 풀스크린 렌더 ≤ 600ms

**rollback 전략**: 3 파일 삭제.

**예상 시간**: 3일

---

### G06-20: LLMStruggleSection (Δ3) + 6 보조 컴포넌트

**목표**: ARCH §6 표의 나머지 컴포넌트.

**구현 단계**:

1. `LLMStruggleSection.tsx` (Δ3):
   - props: `{ summary: PerProblemReport['llm_struggle_summary']; hardestStep: PerProblemStep }`
   - "AI도 어려웠던 순간" 헤딩 + glass card
   - hardest_step_index, hardest_step_ms, total_turns, total_tool_retries
   - resolution_narrative quote-style
   - Framer Motion fade-in

2. `EscalationPrompt.tsx`:
   - props: `{ prompt: EscalationPromptType; onChoose: (choice: 'escalate'|'retry'|'hint_only', target?: TutorName) => void }`
   - 3 button (Shadcn Button variant)
   - escalate 버튼: target_tutor 표시

3. `TutorPickerModal.tsx`:
   - props: `{ open: boolean; onClose: () => void; problem_hash: string; quota: QuotaStatus[]; onPick: (tutor: TutorName) => void }`
   - 4 legend + 라마누잔 카드 grid
   - 각 카드: TutorBadge + 한 줄 설명 + "호출 시 quota -1" 표시
   - quota 부족 시 disabled

4. `QuotaIndicator.tsx` (Δ1):
   - 5 dot 가로 배치 (problem 5/5, legend 3/3, report 1/1, weekly 1/1, monthly 1/1)
   - hover 시 reset_at + 자격 게이트 상태 tooltip

5. `WeeklyReportRequestButton.tsx` + `MonthlyReportRequestButton.tsx` (Δ1):
   - eligibility API 호출 → lifetime_problem_count
   - 미충족: disabled + "n/10 풀이 후 활성화" 카피
   - 충족 + quota 남음: 활성 + 클릭 → POST /api/legend/report/weekly

6. `RoutingTrace.tsx` (admin only):
   - admin role check (server)
   - Stage 0/1/2 흐름 디버그 패널

7. PerProblemReportCard 통합 — 6 섹션 모두 렌더 완성.

**검증 기준**:
- 평가셋 1문항 풀이 → R1 카드 6 섹션 모두 정상
- EscalationPrompt 3 choice → API 호출
- TutorPickerModal quota 부족 시 disabled
- Weekly Button 자격 게이트 미충족 시 disabled

**rollback 전략**: 7 컴포넌트 삭제.

**예상 시간**: 2일

---

### G06-21: /euler→/legend 302 redirect + /legend 6 페이지

**목표**: ARCH §8.1 redirect 정책 + 6 페이지 구현.

**구현 단계**:

1. `src/middleware.ts` 확장 (또는 신규 분리):
   ```ts
   const EULER_TO_LEGEND: Record<string, string> = {
     '/euler': '/legend',
     '/euler/canvas': '/legend/canvas',
     '/euler/billing': '/legend/billing',
     '/euler/family': '/legend/family',
     '/euler/beta': '/legend/beta',
     '/euler/report': '/legend/report',
   };

   export function middleware(req: NextRequest) {
     const path = req.nextUrl.pathname;
     // /euler-tutor 는 제외 (API 호환 보존)
     if (path.startsWith('/euler-tutor')) return NextResponse.next();
     const target = EULER_TO_LEGEND[path] ?? (path.startsWith('/euler/') ? path.replace('/euler/', '/legend/') : null);
     if (target) {
       const url = req.nextUrl.clone();
       url.pathname = target;
       return NextResponse.redirect(url, 302);  // M7 에서 301 전환
     }
     return NextResponse.next();
   }

   export const config = { matcher: ['/euler', '/euler/:path*'] };
   ```

2. `/legend/*` 6 페이지 (기존 /euler/* 컴포넌트 import only — 무수정):
   ```tsx
   // src/app/legend/canvas/page.tsx
   export { default } from '@/app/euler/canvas/page';     // 또는 wrapper component
   ```
   - `page.tsx`, `canvas/page.tsx`, `billing/page.tsx`, `family/page.tsx`, `beta/page.tsx`, `report/page.tsx`
   - 단, /legend/page.tsx 는 메인 채팅으로 신규 디자인 — 기존 /euler 채팅 컴포넌트 import + Legend 카피 (5 튜터 소개 hero)

3. Playwright `tests/e2e/legend-redirect.spec.ts`:
   - 6 경로 redirect 검증
   - 베타 사용자 cookie 보존 확인
   - /euler-tutor (API) 는 redirect 되지 않음

**검증 기준**:
- `/euler/canvas` → 302 → `/legend/canvas` 정상 렌더
- 6 경로 모두 redirect 정확
- `/euler-tutor/route` (API) 는 무영향

**rollback 전략**: middleware 변경 revert + 6 페이지 삭제.

**예상 시간**: 1일

---

### G06-22: 평가셋 38문항 자동 라우팅 KPI 재측정

**목표**: G-05 baseline 86~89.5% 유지 검증 + 5종 quota 소진율 + R1 캐시 + 트리 통계.

**구현 단계**:

1. `scripts/eval-legend-routing.ts`:
   - killer-eval.json 38문항 load
   - 각 문항 → POST /api/legend/route → routed_tutor 분포
   - routed_tutor 별로 /api/legend/solve 호출 → 정답 추출 (G-05 패턴)
   - R1 build (자동) → tree.depth_max / node_count / pivotal_idx 통계
   - Gemini 429 fallback 발생 횟수 카운트
   - 출력 `docs/qa/kpi-legend-routing.md`:
     - 정답률 (5 튜터 별)
     - Stage 0 hit rate / Stage 2 escalation rate
     - 평균 라우팅 latency / R1 캐시 hit rate
     - 트리 평균 depth_max / node_count / branching_factor
     - fallback 비중

2. 측정 시 Gemini 250 RPD 한도 주의 — 평가셋 일부 (38문항) 만 사용 + Tier 2 비중 0.3 가정 시 가우스 호출 ~12회 (충분히 한도 내).

**검증 기준**:
- 보고서에 38문항 정답률 표 + ≥ 86% 유지
- 5종 quota 누적 ≤ 한도 (테스트 사용자 1명 기준 무한도 환경변수 옵션 고려)
- 트리 depth_max 평균 ≥ 2 / node_count 평균 ≥ 5

**rollback 전략**: 스크립트 + 보고서 삭제 (production 영향 없음).

**예상 시간**: 1.5일

---

### G06-23: 베타 5명 1주 만족도 인터뷰

**목표**: 4 질문 인터뷰 + 결함 P0/P1 수정.

**구현 단계**:

1. 베타 사용자 5명 모집 (기존 베타 풀에서)
2. 1주 사용 안내 메일 (도메인 변경 + 5종 quota + 트리·struggle 안내)
3. 인터뷰 질문 4종:
   - Q1: 추론 트리 시각화가 풀이 이해에 도움되었나요? (1~5)
   - Q2: "AI도 어려웠던 순간" 섹션이 학습 동기에 도움되었나요? (1~5)
   - Q3: trigger expansion 카드 (같은 발동 조건의 다른 도구) 가 사고 확장에 도움되었나요? (1~5)
   - Q4: 전체 만족도 (1~5) + 자유 코멘트
4. 결과 → `docs/qa/g06-beta-feedback.md`
5. 발견된 P0/P1 결함 → 별도 fix 커밋 (commit prefix: `fix(g06): ...`)
6. 체크리스트 → `docs/qa/g06-checklist.md` (모든 항목 95%+ 통과 목표)

**검증 기준**:
- Q1, Q2 "도움됨" (4 이상) ≥ 80%
- Q4 평균 ≥ 4/5
- P0 0건 미해결

**rollback 전략**: N/A (사용자 인터뷰는 되돌릴 수 없음). 결함 발견 시 별도 fix 커밋.

**예상 시간**: 7일 (1주 사용 기간 + 인터뷰 + 수정)

---

### G06-24: /api/euler-tutor 내부 위임 + 1주 안정화

**목표**: ARCH §8.2 — 외부 시그니처 무변경, 내부 위임만.

**구현 단계**:

1. `src/app/api/euler-tutor/route.ts` 의 POST 핸들러 내부:
   ```ts
   // BEFORE: 직접 Manager + Reasoner 호출
   // AFTER: legend-router.routeProblem + tutor-orchestrator.callTutor 위임

   import { routeProblem } from '@/lib/legend/legend-router';
   import { callTutor } from '@/lib/legend/tutor-orchestrator';

   export async function POST(req: Request) {
     // ... 기존 인증·body 파싱
     const decision = await routeProblem({ user_id, problem_text, input_mode });
     const result = await callTutor({ user_id, problem_text, tutor: decision.routed_tutor, call_kind: 'primary', routing_decision_id: decision.routing_decision_id });
     // 기존 응답 포맷 보존 (legend_session_id 옵셔널 추가)
     return /* SSE stream with legend_session_id 필드 추가 */;
   }
   ```

2. 1주 production 모니터링 — Vercel Analytics + Supabase logs + Sentry (있으면):
   - 회귀 0 보장 (기존 5 시나리오: 텍스트 / 사진 / 필기 / 가우스 토글 / 베타 게이트)
   - usage_events 의 tutor_name·tier 새 컬럼 채워지는지 확인

3. Playwright `tests/e2e/euler-legacy.spec.ts` 회귀 테스트.

**검증 기준**:
- 5 회귀 시나리오 모두 PASS
- 1주 모니터링 P0 0건
- legend_session_id 가 새 풀이부터 채워짐

**rollback 전략**:
```ts
// /api/euler-tutor/route.ts 의 내부 위임 코드 → 기존 직접 호출로 revert
git revert <commit_hash>
```
1주 안정화 중 발견된 P0 → 즉시 revert 후 fix.

**예상 시간**: 8일 (코드 변경 1일 + 1주 모니터링)

---

### G06-25: 302 → 301 영구 + 베타 안내 + production 배포

**목표**: M7 마무리 + 운영 라이브.

**구현 단계**:

1. `src/middleware.ts` 의 redirect 302 → 301 변경:
   ```ts
   return NextResponse.redirect(url, 301);
   ```

2. 베타 50명 안내 메일 발송 (Resend 또는 기존 메일 인프라):
   - 도메인 변경 (`/euler` → `/legend`) 안내
   - 5종 quota 한도 (Δ1)
   - 트리·struggle 신규 기능 소개
   - 인터뷰 참여 감사 (G06-23 참여자 한정)

3. 문서 갱신:
   - `docs/work-log.md` G-06 항목 추가
   - `docs/progress.md` 9차 세션 상태 갱신 (M1~M7 완료)
   - `docs/task.md` G06-01~25 매핑 표 갱신 (커밋 해시)

4. `docs/qa/g06-launch-checklist.md` (production 배포 체크리스트):
   - DB 마이그레이션 8개 production 적용 확인
   - 환경변수 16개 production 설정 확인 (LEGEND_* + GEMINI_* + LEGEND_TREE_*)
   - 의존성 (@xyflow/react, dagre) production 빌드 확인
   - Vercel cron 영향 없음 확인
   - SymPy μSvc 영향 없음 확인

5. production 배포 + 24h 모니터링:
   - Vercel function 호출 통계
   - Supabase 신규 테이블 row 누적
   - 에러 rate < 1%
   - quota 차단 정상 동작

**검증 기준**:
- 24h 모니터링 — 라우팅 99%+ 성공률 / quota 차단 정상 / fallback 0 또는 정상 동작 / R1 카드 응답 시간 P95 ≤ 25s
- 베타 50명 메일 발송 완료 (open rate 확인)

**rollback 전략**:
- 301 → 302 즉시 revert (브라우저 캐시 위험 최소화)
- production 배포 직전 Vercel branch deployment 으로 dry-run

**예상 시간**: 1.5일

---

## 부록 A. 사전 준비 사항 (M1 진입 전)

1. **환경변수**: 모든 LEGEND_* / GEMINI_FALLBACK_TUTOR / LEGEND_TREE_* 16종 Vercel production + preview 등록
2. **Supabase 백업**: `pg_dump` 1회 (M1 적용 직전)
3. **패키지 버전**: `@xyflow/react@^12` / `dagre@^0.8` 7일 이상 된 버전 확인 (`minimum-release-age` 정책)
4. **베타 사용자 풀**: G06-23 인터뷰 5명 사전 섭외 (M5 시작 전)
5. **Gemini RPD 모니터링**: G-05c 의 probe-gemini.ts 로 일일 잔여 RPD 확인 헬퍼 운영

## 부록 B. 위험 완화 전략

| 위험 | 완화 |
|---|---|
| Gemini 250 RPD 초과 | G06-09 fallback 매트릭스 + 비중 모니터링 → 20% 초과 시 Vertex AI 마이그 trigger |
| trace normalizer 정확도 미달 | G06-12 의 Haiku 3-tier fallback (rule → ANN → Haiku) |
| 트리 시각화 모바일 성능 | G06-19 의 lazy mount + collapse hint + depth 3 미리보기 |
| /euler 베타 사용자 회귀 | G06-24 의 1주 안정화 + 5 회귀 시나리오 |
| quota 동시성 race | `increment_legend_quota` RPC atomic UPSERT |
| 비용 폭증 (5 모델 동시) | quota 5/3/1 한도 + Tier 별 자연 분배 |

## 부록 C. 롤백 계획 (전체)

1. **DB 롤백**: `drop` 8 마이그레이션 (G06-01~03 의 rollback SQL 결합)
2. **API 롤백**: middleware 302 → 410 (Gone) 또는 단순 제거 → 기존 /euler/* 직접 사용 복원
3. **코드 롤백**: `git revert <G06-XX commit hash>` chain
4. **기존 사용자 데이터**: euler_solve_logs ALTER 의 신규 컬럼은 NULL 유지 → 기존 코드 무영향. drop 시 신규 컬럼만 제거.
5. **부분 롤백**: M5 (UI) 만 롤백 시 — middleware revert + /legend/* 페이지 삭제. 백엔드 (M1~M4) 는 유지 가능 (사용자 노출 X).

## 부록 D. 토큰 및 비용 추정

| 항목 | 비용 |
|---|---|
| 코드 작성 | ~170K 토큰 |
| 평가셋 측정 (G06-22) | ~$5 (38문항 × 5 튜터) |
| 베타 1주 운영 (50명) | ~$10 (quota 한도 내) |
| Haiku struggle 요약 (Δ3) | $0.0002 / R1 (무시 가능) |
| trigger 임베딩 (R1 builder) | $0.0001 / R1 |
| **MVP 검증 총합** | **~$30** |
