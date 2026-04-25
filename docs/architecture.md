# Euler Tutor 2.0 — 시스템 아키텍처

> 작성일: 2026-04-25
> 대상: 한국 SaaS급 AI 수학 튜터 (고3 미적분 우선, 듀얼 펀널 B2B/B2C)
> 코드베이스: Next.js 15 + Vercel AI SDK v4 + Supabase + Anthropic Claude
> 격리 원칙: 본 업그레이드는 EduFlow의 다른 도구(MindPalace, English Village, Conversation 등)에 영향을 주지 않는다. 신규 라우트와 테이블은 모두 `euler-*` 또는 `math_*` 네임스페이스를 사용한다.

---

## 1. 전체 시스템 구조도 (Phase A~D 누적 형태)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Next.js 15 RSC + PWA)                 │
│  ┌──────────────────┐  ┌────────────────┐  ┌──────────────────────┐    │
│  │ /euler/chat      │  │ /euler/canvas  │  │ /admin/math-tools    │    │
│  │ (코칭 채팅)      │  │ (필기 모드 ★) │  │ (Tier 2 검수 큐)     │    │
│  └────────┬─────────┘  └────────┬───────┘  └──────────┬───────────┘    │
│           │                     │                     │                 │
│  ┌────────┴─────────────────────┴─────────────────────┴───────────┐    │
│  │ UI 컴포넌트:                                                    │    │
│  │  ‧ KaTeX 수식 렌더 (기존 유지)                                  │    │
│  │  ‧ ★ HandwriteCanvas (Pointer Events + Canvas 2D)               │    │
│  │  ‧ "사고 과정" 스트리밍 표시 (Manager → Reasoner → Critic)      │    │
│  │  ‧ 약점 분석 리포트 / 진척 대시보드 (Phase C)                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                  │  HTTPS
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│           NEXT.JS ROUTE HANDLERS (Vercel Edge/Node Runtime)             │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  /api/euler-tutor (orchestrator, 기존 라우트 확장)                │  │
│  │     ↓                                                             │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │  L8 Manager Agent  (Sonnet 4.6, JSON 출력)                  │  │  │
│  │  │   ‧ 자연어 → 변수/조건/목표 구조화                          │  │  │
│  │  │   ‧ 단원 분류 + 난이도(1~6) 추정                           │  │  │
│  │  └────────┬────────────────────────────────────────────────────┘  │  │
│  │           │                                                       │  │
│  │     ┌─────┴──── 난이도 1~3 ──────► 단일 Sonnet 호출 → Critic     │  │
│  │     │                                                             │  │
│  │     ├──── 난이도 4~5 ──────► Retriever + Sonnet 단발 → Critic    │  │
│  │     │                                                             │  │
│  │     └──── 난이도 6+ ──────► 풀 파이프라인                        │  │
│  │                                                                   │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │  L4-5 Retriever Agent  (Haiku 4.5)                          │  │  │
│  │  │   ‧ Forward/Backward 양방향 임베딩 검색 (pgvector)          │  │  │
│  │  │   ‧ math_tool_triggers 곱집합 인덱스 lookup                  │  │  │
│  │  │   ‧ cosine + tool_weight 정렬 → top-K 도구 반환              │  │  │
│  │  └────────┬────────────────────────────────────────────────────┘  │  │
│  │           ▼                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │  L7 Reasoner Agent  (Sonnet 4.6, extended thinking)         │  │  │
│  │  │   ‧ Forward BFS: 현재 조건 → 알 수 있는 모든 사실 list       │  │  │
│  │  │   ‧ Backward BFS: 목표 → 필요한 모든 경로 list               │  │  │
│  │  │   ‧ 분기 (보기/케이스) → sub-task 병렬 실행                  │  │  │
│  │  │   ‧ 사용한 도구를 candidate_tools 큐에 자동 보고 (Tier 1)    │  │  │
│  │  └────────┬────────────────────────────────────────────────────┘  │  │
│  │           ▼                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │  L6 Executor (Tool Calling)                                  │  │  │
│  │  │   ‧ Phase A~C: Anthropic tool calling으로 우회               │  │  │
│  │  │   ‧ Phase D: SymPy μSvc 호출                                  │  │  │
│  │  └────────┬────────────────────────────────────────────────────┘  │  │
│  │           ▼                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │  Critic Agent  (Haiku 4.5) ★ Phase A 첫 번째 도입            │  │  │
│  │  │   ‧ 풀이 검증: 역대입 + 단계별 논리 점검                     │  │  │
│  │  │   ‧ 통과 → verified:true → Coaching이 더 이상 의심 안 함     │  │  │
│  │  │   ‧ 실패 → Reasoner에 백트래킹 신호                          │  │  │
│  │  └────────┬────────────────────────────────────────────────────┘  │  │
│  │           ▼                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │  Coaching Layer  (Sonnet 4.6, streamText)                    │  │  │
│  │  │   ‧ 검증된 풀이 + 도구 메타(why_use_it)를 컨텍스트로 주입    │  │  │
│  │  │   ‧ 기존 EULER_SYSTEM_PROMPT 6단계 코칭 흐름 유지             │  │  │
│  │  │   ‧ 답 공개 모드 / 잠금 모드 분기                            │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────────┐    │
│  │ /api/euler-tutor │ │ /api/euler-tutor │ │ /api/euler-tutor     │    │
│  │ /parse-image     │ │ /tools/search    │ │ /tools/report        │    │
│  │ (기존 + 필기★)   │ │ (Retriever 단독) │ │ (Tier 1 자동 보고)    │    │
│  └──────────────────┘ └──────────────────┘ └──────────────────────┘    │
│                                                                         │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────────┐    │
│  │ /api/euler-tutor │ │ /api/euler-tutor │ │ /api/euler-tutor     │    │
│  │ /critic          │ │ /report/weakness │ │ /sympy (Phase D)     │    │
│  │ (★ Phase A)      │ │ (★ Phase C)     │ │ (proxy → Railway)    │    │
│  └──────────────────┘ └──────────────────┘ └──────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────────┐  ┌─────────────┐  ┌───────────────────────────────┐
│  External OCR     │  │  Anthropic  │  │ Supabase (PostgreSQL +        │
│  ‧ Mathpix v3     │  │  Claude API │  │           pgvector)            │
│  ‧ Upstage        │  │  (Sonnet/   │  │  ‧ math_tools                  │
│  ‧ Vision fallbk  │  │   Haiku)    │  │  ‧ math_tool_triggers          │
│  (★ handwritten   │  │  + OpenAI   │  │  ‧ candidate_tools             │
│   옵션 추가)      │  │  Embedding  │  │  ‧ euler_solve_logs            │
└───────────────────┘  └─────────────┘  │  ‧ user_skill_stats            │
                                        │  ‧ problem_solutions (기존)    │
                                        │  ‧ usage_events (기존)         │
                                        └───────────────────────────────┘
                                                    │
                                                    ▼
                                ┌──────────────────────────────────┐
                                │ Railway FastAPI + SymPy μSvc     │
                                │  (Phase D 도입, $5~10/월)        │
                                │  POST /sympy/differentiate       │
                                │  POST /sympy/integrate           │
                                │  POST /sympy/solve_equation      │
                                │  POST /sympy/simplify            │
                                └──────────────────────────────────┘
```

---

## 2. 모듈 의존성 (현재 코드 기준)

### 현재 (As-Is)
```
src/app/api/euler-tutor/
   ├── route.ts                       (단일 streamText 호출)
   └── parse-image/route.ts           (Mathpix → Upstage → Vision)
       ↓                              ↓
src/lib/ai/euler-prompt.ts            src/lib/solution-cache.ts
                                          ↓
                                      src/lib/search.ts (Tavily)
```

### 목표 (To-Be, Phase D 완료 시점)
```
src/app/api/euler-tutor/
   ├── route.ts                       (orchestrator: Manager → Retriever → Reasoner → Executor → Critic → Coaching)
   ├── parse-image/route.ts           (확장: { handwritten: boolean })
   ├── critic/route.ts                (★ Phase A)
   ├── tools/
   │    ├── search/route.ts           (Retriever 단독 노출, Phase B)
   │    └── report/route.ts           (Tier 1 자동 보고 endpoint, Phase B)
   ├── report/
   │    └── weakness/route.ts         (★ Phase C 약점 분석 리포트)
   └── sympy/route.ts                 (Phase D, Railway 프록시)

src/lib/ai/
   ├── euler-prompt.ts                (기존 유지)
   ├── euler-coaching-prompt.ts       (★ verified 신호 + why_use_it 주입 형태로 재작성)
   ├── euler-manager-prompt.ts        (★ Phase B)
   ├── euler-reasoner-prompt.ts       (★ Phase C, Forward/Backward BFS)
   ├── euler-critic-prompt.ts         (★ Phase A)
   └── euler-tools-schema.ts          (★ Phase D, Anthropic tool definitions)

src/lib/euler/
   ├── orchestrator.ts                (★ Phase B 도입, Phase C 확장)
   ├── retriever.ts                   (★ Phase B, pgvector 호출)
   ├── tool-reporter.ts               (★ Phase B, candidate_tools 자동 큐잉)
   ├── canvas-stroke-encoder.ts       (★ Phase A, 필기 → Mathpix payload)
   ├── difficulty-classifier.ts       (★ Phase B, Haiku 호출)
   ├── solution-cache.ts              (기존)
   └── weakness-aggregator.ts         (★ Phase C)

src/components/euler/
   ├── HandwriteCanvas.tsx            (★ Phase A)
   ├── ThoughtStream.tsx              (★ Phase A, Manager/Critic 사고 과정 표시)
   ├── WeaknessReport.tsx             (★ Phase C)
   └── ProgressDashboard.tsx          (★ Phase C)

supabase/migrations/                  (★ 신규)
   ├── 20260426_math_tools.sql        (Phase B)
   ├── 20260427_math_tool_triggers.sql(Phase B)
   ├── 20260428_candidate_tools.sql   (Phase B)
   ├── 20260501_euler_solve_logs.sql  (Phase C)
   └── 20260502_user_skill_stats.sql  (Phase C)
```

격리 보장:
- 신규 컴포넌트는 모두 `src/components/euler/` 하위에만 배치
- 신규 lib는 `src/lib/euler/` 하위로 통일 (기존 `src/lib/solution-cache.ts`도 이쪽으로 이동, 단 import path는 호환)
- DB 테이블은 `math_*`, `euler_*`, `candidate_*` prefix 사용. 기존 `usage_events`, `problem_solutions`만 재사용

---

## 3. DB 스키마 (Supabase 마이그레이션 SQL)

> 모든 마이그레이션은 RLS(Row Level Security) 활성화. 사용자별 접근은 `auth.uid()` 기준. 도구 라이브러리(`math_tools`, `math_tool_triggers`)는 인증된 사용자 전체 read-only, 검수자(admin)만 write.

### 3.1 `math_tools` (Phase B, 도구 마스터)

```sql
-- supabase/migrations/20260426_math_tools.sql
create extension if not exists vector;

create table math_tools (
  id text primary key,                       -- 'MVT_basic', 'CHAIN_RULE_basic'
  name text not null,                        -- '평균값 정리 (기본)'
  knowledge_layer smallint not null check (knowledge_layer between 1 and 6),
  formula_latex text not null,
  prerequisites text[] not null default '{}',
  source text not null,                      -- 'parametric' | 'curated' | 'external' | 'user'
  source_meta jsonb not null default '{}'::jsonb,  -- { tier: 1|2|3|4, textbook?, page? }
  tool_weight real not null default 1.0,     -- self-improvement 누적 가중치
  hit_count integer not null default 0,
  success_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index math_tools_layer_idx on math_tools(knowledge_layer);
create index math_tools_source_idx on math_tools(source);

alter table math_tools enable row level security;
create policy "math_tools read" on math_tools for select using (auth.role() = 'authenticated');
create policy "math_tools admin write" on math_tools for all
  using (auth.jwt() ->> 'role' = 'admin');
```

### 3.2 `math_tool_triggers` (Phase B, 도구 × 트리거 곱집합 인덱스)

```sql
-- supabase/migrations/20260427_math_tool_triggers.sql
create table math_tool_triggers (
  id uuid primary key default gen_random_uuid(),
  tool_id text not null references math_tools(id) on delete cascade,
  direction text not null check (direction in ('forward', 'backward', 'both')),
  trigger_condition text not null,           -- '미분가능 함수와 두 점에서의 함숫값 차이가 주어짐'
  derived_fact text,                         -- forward인 경우: 도구 적용으로 알 수 있는 사실
  goal_pattern text,                         -- backward인 경우: 이 도구로 도달 가능한 목표 형태
  required_premises text[] not null default '{}',
  why_text text not null,                    -- ★ "왜 이 도구를 쓰는가" — 사용자 강조
  embedding_forward vector(1536),            -- trigger_condition + derived_fact 임베딩
  embedding_backward vector(1536),           -- goal_pattern + required_premises 임베딩
  created_at timestamptz not null default now()
);

create index math_tool_triggers_tool_idx on math_tool_triggers(tool_id);
create index math_tool_triggers_direction_idx on math_tool_triggers(direction);
create index math_tool_triggers_fwd_ann on math_tool_triggers
  using ivfflat (embedding_forward vector_cosine_ops) with (lists = 100);
create index math_tool_triggers_bwd_ann on math_tool_triggers
  using ivfflat (embedding_backward vector_cosine_ops) with (lists = 100);

alter table math_tool_triggers enable row level security;
create policy "triggers read" on math_tool_triggers for select using (auth.role() = 'authenticated');
create policy "triggers admin write" on math_tool_triggers for all
  using (auth.jwt() ->> 'role' = 'admin');
```

### 3.3 `candidate_tools` (Phase B, Tier 1 자동 보고 + Tier 2 검수 큐)

```sql
-- supabase/migrations/20260428_candidate_tools.sql
create table candidate_tools (
  id uuid primary key default gen_random_uuid(),
  proposed_name text not null,
  proposed_formula_latex text,
  proposed_layer smallint check (proposed_layer between 1 and 6),
  proposed_why text,
  proposed_trigger text,
  occurrence_count integer not null default 1,   -- 동일 후보 중복 누적
  source_problem_keys text[] not null default '{}',
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'merged')),
  merged_into_tool_id text references math_tools(id),
  reported_by uuid references auth.users(id),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index candidate_tools_status_idx on candidate_tools(status);
create index candidate_tools_count_idx on candidate_tools(occurrence_count desc);

alter table candidate_tools enable row level security;
create policy "candidates read own" on candidate_tools for select
  using (auth.uid() = reported_by or auth.jwt() ->> 'role' = 'admin');
create policy "candidates insert" on candidate_tools for insert
  with check (auth.uid() = reported_by);
create policy "candidates admin update" on candidate_tools for update
  using (auth.jwt() ->> 'role' = 'admin');
```

### 3.4 `euler_solve_logs` (Phase C, 풀이 이력)

```sql
-- supabase/migrations/20260501_euler_solve_logs.sql
create table euler_solve_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  problem_text text not null,
  problem_image_url text,
  problem_key text,                          -- 기출이면 '2026_미적분_28' 형태
  area text,                                 -- 'algebra' | 'calculus' | ...
  difficulty smallint check (difficulty between 1 and 6),
  input_mode text check (input_mode in ('text','image','handwriting')),  -- 입력 채널
  tutor_persona text check (tutor_persona in ('euler','gauss')),         -- 학생 토글
  tools_used text[] not null default '{}',
  reasoner_path jsonb,                       -- BFS 경로 + step별 layer 메타데이터
  step_summary jsonb,                        -- ★ 학생 풀이 step 단위 진단 (아래 형식 참조)
  stuck_layer smallint check (stuck_layer between 1 and 8),  -- ★ 학생이 막힌 사용자 8-Layer
  stuck_reason text,                         -- ★ 'tool_not_found'|'computation_error'|'forward_dead_end'|'backward_dead_end'|'parse_failure' 등
  critic_passed boolean,
  critic_attempts integer not null default 0,
  final_answer text,
  user_answer text,
  is_correct boolean,
  reveal_used boolean not null default false,-- 답 공개 사용 여부
  duration_ms integer,
  created_at timestamptz not null default now()
);

-- step_summary jsonb 형식 예시:
-- {
--   "steps": [
--     { "n":1, "layer":8, "type":"parse",        "outcome":"success" },
--     { "n":2, "layer":5, "type":"domain_id",    "outcome":"success", "identified_domain":"미적분/적분/구분구적법" },
--     { "n":3, "layer":7, "type":"backward",     "outcome":"success", "facts_derived":["넓이 = 정적분"] },
--     { "n":4, "layer":6, "type":"tool_call",    "outcome":"stuck",   "tools_attempted":["MVT","Rolle"], "miss_subtype":"trigger" },
--     { "n":5, "layer":4, "type":"computation",  "outcome":"failure", "expected":"x=3", "got":"x=4" }
--   ],
--   "stuck_layer": 6,
--   "stuck_reason": "tool_trigger_miss"
-- }
--
-- stuck_reason enum:
--   'parse_failure'         (L8) — 자연어를 식으로 변환 실패
--   'domain_id_miss'        (L5) — 어떤 세부 영역인지 인식 실패 (예: 적분 문제인지 모름)
--   'tool_recall_miss'      (L6) — 도구 자체를 떠올리지 못함 (도구의 존재를 모름)
--   'tool_trigger_miss'     (L6) — 도구는 알지만 trigger 패턴 매칭 실패 (언제 쓸지 모름)
--   'forward_dead_end'      (L7) — 순행 중 더 이상 새 사실 도출 불가
--   'backward_dead_end'     (L7) — 역행 중 필요 조건 추적 실패
--   'computation_error'     (L1~4) — 단순 계산 실수
--   'success'               — 막히지 않고 정답 도달

create index euler_logs_user_idx on euler_solve_logs(user_id, created_at desc);
create index euler_logs_area_idx on euler_solve_logs(area);
create index euler_logs_correct_idx on euler_solve_logs(is_correct);

alter table euler_solve_logs enable row level security;
create policy "logs read own" on euler_solve_logs for select
  using (auth.uid() = user_id or auth.jwt() ->> 'role' = 'admin');
create policy "logs insert own" on euler_solve_logs for insert
  with check (auth.uid() = user_id);
```

### 3.5 `user_skill_stats` (Phase C, 약점 분석 집계)

```sql
-- supabase/migrations/20260502_user_skill_stats.sql
create table user_skill_stats (
  user_id uuid not null references auth.users(id) on delete cascade,
  tool_id text not null references math_tools(id) on delete cascade,
  area text not null,
  attempts integer not null default 0,
  successes integer not null default 0,
  last_used_at timestamptz,
  primary key (user_id, tool_id)
);

create index user_skill_stats_area_idx on user_skill_stats(user_id, area);

alter table user_skill_stats enable row level security;
create policy "stats read own" on user_skill_stats for select using (auth.uid() = user_id);
create policy "stats upsert own" on user_skill_stats for all using (auth.uid() = user_id);
```

### 3.5b `user_layer_stats` (Phase C, layer별 약점 집계)

> 사용자 8-Layer (`user_docs/math_layers.md`) 기준 — 단순 정답률이 아닌 "어디서 막히는가"를 진단하기 위한 핵심 테이블.

```sql
-- supabase/migrations/20260503_user_layer_stats.sql
create table user_layer_stats (
  user_id uuid not null references auth.users(id) on delete cascade,
  layer smallint not null check (layer between 1 and 8),
  area text not null,
  attempts integer not null default 0,           -- 해당 layer를 거친 풀이 수
  successes integer not null default 0,          -- 해당 layer를 성공적으로 통과한 수
  stuck_count integer not null default 0,        -- 해당 layer에서 막힌 횟수
  failure_count integer not null default 0,      -- 해당 layer에서 명시적 실패 (계산 오류 등)
  -- L6 세부 분리 (사용자 정정: recall vs trigger 차별화)
  l6_recall_miss integer not null default 0,     -- 도구 자체를 떠올리지 못한 횟수
  l6_trigger_miss integer not null default 0,    -- 도구는 알지만 trigger 매칭 실패 횟수
  l5_domain_miss integer not null default 0,     -- 영역 자체 인식 실패 횟수
  last_failure_at timestamptz,
  failure_examples jsonb default '[]'::jsonb,   -- 최근 5개 실패 사례 (problem_id + reason)
  primary key (user_id, layer, area)
);

create index user_layer_stats_user_idx on user_layer_stats(user_id);

alter table user_layer_stats enable row level security;
create policy "layer stats read own" on user_layer_stats for select using (auth.uid() = user_id);
create policy "layer stats upsert own" on user_layer_stats for all using (auth.uid() = user_id);
```

용도 — 단순 정답률이 아닌 **"어디서, 왜 막히는가"** 진단:

| 진단 카테고리 | 신호 | 코칭 액션 (Coaching Layer 분기) |
|---|---|---|
| **L1~2 계산 미숙** | failure_count 高 (computation_error) | 사칙연산·지수·로그 기본기 보강 추천. SymPy로 검산 강제 |
| **L5 영역 인식 실패** | l5_domain_miss 高 | "이 문제는 미적분의 어떤 세부 영역일까요?" 문답. 영역별 도구 목록 제시 |
| **L6 Recall 실패** | l6_recall_miss 高 | **도구 자체를 가르침**: "평균값 정리란 무엇이고 어떤 경우에 쓰일까요?" 정의·예제·trigger 함께 |
| **L6 Trigger 실패** | l6_trigger_miss 高 | **도구는 알고 있음**. "이 정리는 어떤 조건일 때 쓸 수 있을까요?" trigger 패턴 학습 강화 |
| **L7 forward dead** | forward_dead_end 高 | "조건에서 알 수 있는 것을 한 번 더 나열해볼까요?" BFS 폭 확대 코칭 |
| **L7 backward dead** | backward_dead_end 高 | "답을 구하려면 무엇이 필요할지 거꾸로 생각해볼까요?" 역추적 코칭 |
| **L8 파싱 실패** | parse_failure 高 | 문제 구조화 연습 추천. 변수 할당·조건 분리 도구 제공 |

### 3.6 기존 테이블과의 관계

- `problem_solutions` (기존, 530문항 수능 캐시) — Phase B에서 `math_tools` 와 1:N 매핑 추가 (`solution_used_tools text[]` 칼럼만 추가)
- `usage_events` (기존 Analytics) — Euler 이벤트 종류 추가: `euler_solve_started`, `euler_critic_passed`, `euler_reveal_used`, `euler_handwrite_submit` (코드 레벨에서만 처리, 스키마 변경 없음)

### 3.7 시드 데이터 정책

- **시드 자동화 도구가 핵심**. 30개는 MVP 검증용 최소값일 뿐, 도구 라이브러리는 운영 중 지속 확장.
- 시드 자동화 파이프라인 (B-05 Task):
  1. 사용자가 정석/교과서 사진 업로드 (배치 업로드 가능)
  2. Mathpix OCR → LaTeX
  3. Sonnet 4.6이 정리·트리거·`why_text` 자동 생성 (저작권 안전 위해 자체 표현으로 재작성)
  4. CLI 또는 어드민 화면에서 한 페이지에 N개씩 검수 → 일괄 등록
  5. **저작권 차단**: 원문과 동일성 hash 비교 → 일정 임계값 초과 시 reject (정석 표현 그대로 저장 금지)
- 운영 단계별 시드 누적 목표 (강제 아님, 가이드라인):
  - Phase B 종료 시 미적분 정리 ≥ 30개
  - Phase C 종료 시 ≥ 100개 (Tier 1/2 자동 누적 포함)
  - Phase D 종료 시 ≥ 300개 (사용자 검수 큐 처리)
  - 1년 후 ≥ 1,500개 (정석 1권 분량)
- 학원/B2B 도입 시: 학원이 자기 도구 라이브러리를 별도 namespace에 추가 (multi-tenant 검토, Phase D+ 결정)

---

## 4. API 라우트 명세

### 4.1 기존 라우트 (확장)

#### `POST /api/euler-tutor` (orchestrator로 진화)

요청 (Phase A 이후):
```json
{
  "messages": [...],
  "area": "calculus" | "algebra" | ...,
  "useGpt": false,
  "input_mode": "text" | "image" | "handwriting",
  "image_data_url": "data:image/png;base64,...",
  "reveal_answer": false,
  "lock_reveal": false
}
```

응답: 기존 `streamText().toDataStreamResponse()` 유지하되 stream에 `data: { stage: "manager" | "retriever" | "reasoner" | "critic" | "coaching", payload: ... }` 메시지 인터리브.

내부 흐름:
1. (Phase A) `parse-image` 호출 (필기 모드면 `handwritten: true`)
2. (Phase B) Manager → 단원/난이도 분류 + Retriever 호출
3. (Phase C) 난이도 4+ 면 Reasoner BFS 실행
4. (Phase A 첫 도입) Critic 검증
5. Coaching streamText (기존 EULER_SYSTEM_PROMPT + verified 플래그 + retrieved_tools 컨텍스트)
6. 응답 종료 후 비동기로 `euler_solve_logs` 저장 + `user_skill_stats` 갱신 + Tier 1 자동 보고

#### `POST /api/euler-tutor/parse-image` (확장)

요청 추가:
```json
{
  "image": "data:...",
  "handwritten": true,            // Phase A 신규
  "stroke_meta": { "width": 1280, "height": 720, "stroke_count": 14 }
}
```

내부: `handwritten: true` 면 Mathpix 호출 시 `formats: ["text", "data"], data_options: { include_asciimath: true, include_latex: true }, ocr: ["math", "text"]` + `skip_recrop: false` + 손글씨 모드 가중. Mathpix 실패 시 Vision fallback 그대로.

### 4.2 신규 라우트

| 메서드 | 경로 | 도입 Phase | 인증 | 설명 |
|---|---|---|---|---|
| POST | `/api/euler-tutor/critic` | A | required | Reasoner 결과를 받아 역대입 검산. `{ verified, errors, suggested_backtrack }` 반환 |
| POST | `/api/euler-tutor/tools/search` | B | required | Retriever 단독 호출 (디버깅용). `{ query, direction }` → top-K 도구 + why_text |
| POST | `/api/euler-tutor/tools/report` | B | required | Reasoner가 사용한 도구 자동 보고. `candidate_tools` 큐 적재 |
| GET | `/api/euler-tutor/report/weakness` | C | required | 학생별 약점 분석. 최근 30일 `euler_solve_logs` + `user_skill_stats` 집계 |
| GET | `/api/euler-tutor/report/progress` | C | required | 주간/월간 진척 (풀이 수, 정답률 추이, 사용 도구 다양성) |
| POST | `/api/euler-tutor/sympy` | D | required | Railway μSvc 프록시. tool_name + args → result_latex |
| POST | `/api/admin/math-tools` | B | admin | 도구 추가/수정 (Tier 4 사용자 정석 등록 포함) |
| POST | `/api/admin/candidate-tools/:id/approve` | B | admin | 검수 큐 승인 → `math_tools`로 머지 |

모든 라우트:
- 미들웨어에서 Supabase auth 세션 확인 (`@/lib/supabase/server`의 `createClient` 사용)
- 익명 사용자 차단. 단 기존 `/euler` 페이지는 비로그인도 시연 가능 (서버 라우트만 차단)
- 표준 에러 응답: `{ error: string, code?: string }`

### 4.3 외부 (Railway) — Phase D

```
POST https://euler-sympy.up.railway.app/sympy/differentiate
  Body: { "expr": "x**3 + 2*x", "var": "x" }
  Response: { "result_latex": "3 x^{2} + 2", "result_str": "3*x**2 + 2" }
```

라우트: `differentiate`, `integrate`, `solve_equation`, `simplify`, `factor`, `series_expand`. 모두 동일 형태. 인증: 공유 시크릿 헤더 `X-Internal-Token`.

---

## 5. 환경변수 추가 항목

`.env.local` 키 이름만 (값 노출 금지):

```
# Phase A
ANTHROPIC_HAIKU_MODEL_ID=claude-haiku-4-5-20251201   # Critic용
EULER_CRITIC_ENABLED=true

# Phase B
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
EULER_RETRIEVER_TOPK=5
EULER_TOOL_REPORT_THRESHOLD=3                         # 동일 후보 N회 누적 시 검수 알림

# Phase D
SYMPY_SERVICE_URL=https://euler-sympy.up.railway.app
SYMPY_SERVICE_TOKEN=                                  # 공유 시크릿
```

기존 키(변경 없음): `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `MATHPIX_APP_ID`, `MATHPIX_API_KEY`, `UPSTAGE_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `TAVILY_API_KEY`.

비밀 안전: `.env*` 내용은 채팅에 붙여넣지 말 것. 키 존재 여부는 `cut -d= -f1`로 이름만 확인.

---

## 6. 데이터 흐름 (대표 시나리오)

### 6.1 시나리오: 고3 학생이 미적분 28번 사진 업로드 (Phase D 완료 시점)

```
1. 클라이언트
   ‧ <input type="file"> → data URL → POST /api/euler-tutor (input_mode=image)
   ‧ usage_events: euler_solve_started

2. 서버 orchestrator
   2-1. parse-image 호출 (Mathpix) → LaTeX 텍스트
   2-2. Manager Agent (Sonnet 4.6, JSON 모드)
        입력: 문제 텍스트
        출력: { variables: [...], conditions: [...], goal: "...", area: "calculus", difficulty: 6 }
   2-3. 난이도 6 → 풀 파이프라인
   2-4. Retriever Agent (Haiku 4.5)
        ‧ conditions[] → embedding_forward으로 검색 → forward 도구 top-5
        ‧ goal → embedding_backward으로 검색 → backward 도구 top-5
        ‧ tool_weight 가중 정렬
   2-5. Reasoner Agent (Sonnet 4.6, extended thinking)
        ‧ Forward BFS 1단계: { from: conditions, derived_facts: [...] }
        ‧ Backward BFS 1단계: { goal, required_premises: [...] }
        ‧ 분기 발생 (a > 0, a < 0) → 두 sub-task 병렬 generateText
        ‧ 매 단계마다 SymPy tool calling으로 계산 검증
        ‧ 사용한 도구 → tool-reporter로 candidate_tools 자동 보고 (Tier 1)
   2-6. Critic Agent (Haiku 4.5) — 검증 + 막힘 진단
        ‧ Phase A: 정답 검증 (역대입). 모순 없으면 verified:true
        ‧ Phase C 확장: 학생 풀이 step에 대해 막힘 진단 분류
          - stuck_reason ∈ {parse_failure, domain_id_miss, tool_recall_miss, tool_trigger_miss,
                            forward_dead_end, backward_dead_end, computation_error}
        ‧ 실패 시 한 번 더 백트래킹 (최대 2회)
   2-7. Coaching Layer (Sonnet 4.6 또는 GPT-5.1, streamText) — useGpt 토글 분기
        ‧ tutor_persona = useGpt ? 'gauss' : 'euler'
        ‧ system: EULER_SYSTEM_PROMPT + verified=true + retrieved_tools(why_use_it) + stuck_reason
        ‧ stuck_reason별 분기 멘트:
          - tool_recall_miss → "OO 정리는 어떤 정리일까요? 같이 살펴볼까요?" (정의·예제 포함)
          - tool_trigger_miss → "OO 정리는 어떤 조건일 때 쓸 수 있을까요?" (trigger 패턴 학습)
          - domain_id_miss → "이 문제는 미적분의 어떤 세부 영역일까요?" (영역 식별 후 도구 목록)
          - forward_dead_end → "조건에서 알 수 있는 것들을 한 번 더 나열해볼까요?"
          - backward_dead_end → "답을 구하려면 무엇이 필요할지 거꾸로 생각해볼까요?"
          - computation_error → 해당 계산 단계로 돌아가 SymPy 검산 (Phase D)
        ‧ 학생에게 코칭 시작 (lock_reveal=true이면 답 절대 노출 금지)

3. 클라이언트
   ‧ 스트리밍 수신 + ThoughtStream UI에 단계 진행 표시
   ‧ 학생 답 입력 → euler_solve_logs.user_answer 저장
   ‧ usage_events: euler_critic_passed | euler_reveal_used
```

### 6.2 시나리오: PWA 필기 모드 (Phase A 핵심)

```
1. 학생이 /euler/canvas 진입 (PWA 설치된 iPad + Apple Pencil)
2. Pointer Events로 strokes 누적 → Canvas 2D 렌더
3. "도와줘" 버튼 → canvas-stroke-encoder가 PNG export
4. POST /api/euler-tutor/parse-image (handwritten: true)
5. Mathpix handwritten OCR → LaTeX
6. POST /api/euler-tutor (input_mode=handwriting, problem_text=parsed_latex)
   ‧ Critic이 학생의 현재 풀이 단계까지 검증
   ‧ "지금 단계까지는 정확해요. 다음은 ..."
7. 응답을 기존 코칭 채팅으로 표시
```

---

## 7. 외부 서비스 의존성

| 서비스 | 용도 | 비용 (학생 100명 가정) | 도입 시점 | Failover |
|---|---|---|---|---|
| Anthropic Claude (Sonnet 4.6, Haiku 4.5) | Manager/Reasoner/Critic/Coaching | $150~250/월 | 즉시 | OpenAI GPT-5.x로 폴백 (`useGpt:true`) |
| OpenAI (text-embedding-3-small) | 도구 임베딩 | $1~3/월 | Phase B | 없음 (배치 작업이라 재시도) |
| Mathpix v3 | OCR (인쇄/필기) | $2~5/월 | 기존 | Upstage → Vision |
| Upstage Document Parse | OCR fallback | $0.01~0.03/페이지 (사용 시) | 기존 | Vision |
| Supabase Pro | DB + pgvector + Auth | $25/월 | 기존 | 없음 (핵심 인프라) |
| Vercel Pro | 호스팅 + Analytics | $20/월 | 기존 | 없음 |
| Railway (FastAPI + SymPy) | CAS μSvc | $5~10/월 | Phase D | Anthropic tool calling 임시 폴백 |
| Toss Payments | 결제 | 거래액의 2.9% | Phase C 후반 | 없음 |
| Tavily | 풀이 검색 (기존) | 기존 무료 티어 | 기존 | 비활성화 가능 |

---

## 8. 기술 스택 결정 근거

| 결정 | 선택 | 대안 | 채택 이유 (integrator_report.md 근거) |
|---|---|---|---|
| 오케스트레이션 | Vercel AI SDK v4 `generateText` 다단 호출 + Next.js Route Handlers | LangGraph (Python) | 1인 운영 부담 최소화. 단일 스택(JS/TS) 유지가 배포·디버깅 효율↑. AI SDK의 `streamText` + `tool` + multi-step만으로 사용자 정의 BFS 구현 가능. LangGraph는 Python 별도 서비스가 필요해 Vercel + Next 단일 배포 모델 깨짐 |
| 메인 모델 분담 | **Manager/Critic/Retriever 보조: Haiku 4.5 (항상)** + **Reasoner·Coaching: useGpt 토글에 따라 Sonnet 4.6(=오일러) ↔ GPT-5.1(=가우스)** | 단일 Sonnet, 모든 단계 Sonnet | 학생이 두 모델을 비교 학습 가능 + Manager/Critic은 비용 절감 위해 Haiku 고정. 기존 `useGpt` 토글(`src/app/euler-tutor/page.tsx`) + 가우스 페르소나 그대로 유지. 새 단계(Manager/Critic)는 모델 토글 영향 없음 |
| 입력 모드 | **텍스트 (현재 유지) + 이미지 사진 (현재 유지) + 필기(Phase A 신규) + (선택) 음성**: 모두 공존 | 단일 입력 | 학생 학습 환경 다양: 데스크톱은 텍스트, 폰은 사진, iPad는 필기. 음성 입력은 Phase A~D 후 사용자 피드백 보고 결정 (Conversation 도구의 기존 STT 인프라 재활용 가능) |
| CAS | Phase A~C: Anthropic tool calling 우회 / Phase D: Railway FastAPI + SymPy | Vercel Python Functions, Pyodide WASM, Wolfram Alpha | Vercel Python은 SymPy 패키징 시 cold start 1~3초 + 250MB 번들 한계 (research_raw 섹션 2). Pyodide는 모바일 저사양 UX 불안정. Railway 월 $5~10는 가장 합리적. 도입 전까지는 tool calling으로 단계별 우회 가능 |
| 벡터 DB | Supabase pgvector | Pinecone, Qdrant | 이미 Supabase 사용 중. 별도 인프라 비용 0. 학생 100~1,000명 규모에서 ivfflat 인덱스로 충분한 검색 속도 (sub-100ms) |
| 임베딩 | OpenAI text-embedding-3-small | Voyage, Cohere, Anthropic embedding | 1M 토큰 $0.02로 가장 저렴. 한국어 성능 입증. 1536차원으로 pgvector 호환 |
| OCR | Mathpix → Upstage → Vision (기존 유지) + handwritten 옵션 | Pix2Text, Nougat | 한국 학생 폰 사진 환경에서 Mathpix 99%+ 정확도 (research_raw 섹션 4). Pix2Text 자체 서버 운영 부담↑. 필기 모드도 Mathpix가 강점 |
| 파인튜닝 | 미도입 (RAG + few-shot으로 대체) | o4-mini RFT, Claude Bedrock Haiku FT, Qwen3 SFT | 1인 SaaS + 사용자 데이터 미축적 단계에서 ROI 매우 낮음 (research_raw 섹션 3). 사용자 1,000명 + 풀이 10,000건 누적 후 o4-mini RFT 검토 |
| 필기 입력 | PWA + Canvas 2D + Pointer Events | React Native, Flutter, native iOS | 기존 EduFlow가 Next.js 단일 스택. PWA로 iOS Safari + Android Chrome 모두 지원. Apple Pencil은 Pointer Events `pointerType==='pen'` + `pressure` 그대로 활용 가능 |
| 결제 | Toss Payments | Stripe, KG이니시스 | 한국 시장 + B2C 구독 모델에서 표준. 12,000원/월 정기결제 SDK 제공 |

---

## 9. 비기능 요구사항

- **응답 지연**: 풀 파이프라인 5~15초 예상. 스트리밍 + ThoughtStream UI로 체감 지연 완화
- **동시 요청**: Vercel Pro 동시 100 함수 호출. 병목 시 Anthropic API rate limit이 먼저 닿음 → Phase D 이후 BullMQ 큐 도입 검토 (현재는 보류)
- **저작권 안전**: AI가 정리 내용을 자체 표현으로 재작성. 정석/교과서 원문은 `source_meta`에 출처 메타데이터만 저장. 사용자 본인 업로드는 "개인 학습용" 명시 약관
- **개인정보**: 만 14세 미만 부모 동의 절차 (별도 가입 화면). 졸업 후 1년 자동 삭제 (cron 작업, Phase C 도입). 익명화 통계만 보존
- **사용량 / 답 공개 정책**:
  - Free: 일일 풀이 시작 한도 (기본 10회, `EULER_FREE_DAILY_LIMIT` 환경변수로 조정). 답 공개 자체는 무제한 (학생이 원할 때 항상 가능)
  - Student / Family / Academy: 일일 한도 없음
  - Family / Academy: 부모/교사가 `lock_reveal=true` 토글 시 학생 답 공개 차단 (잠금 모드)
  - 답 공개 후에도 학생이 "왜 그렇게 푸나" 질문 시 사고 과정 설명 강제
- **Coaching 흐름**: Critic 검증은 학생에게 직접 노출하지 않고 "확신 신호"로만 사용. 정답 도출 후 의심 발화 차단

---

## 10. 보안 고려사항

- 모든 신규 API 라우트: Supabase auth 세션 필수 (`@/lib/supabase/server`)
- Tier 1 자동 보고는 사용자 user_id 기록. abuse 방지: 동일 사용자가 동일 후보 N회 보고해도 `occurrence_count`만 증가
- SymPy 마이크로서비스: 격리 컨테이너, 30초 타임아웃, 메모리 256MB 제한
- 이미지 업로드: 최대 10MB, MIME 화이트리스트 (image/png, image/jpeg, image/webp)
- Mathpix/OpenAI/Anthropic API 키는 서버 전용. 클라이언트 노출 금지

---

## 11. 향후 확장 (Phase E+, 참고)

- 사용자 풀이 누적 → `euler_solve_logs` 1만 건 도달 시 RAG 가중치 자가 강화 학습
- ProofWiki 등 외부 데이터셋 임포트 (Tier 3) — 사용자 1,000명 이후
- 학원 교사 대시보드 확장 — 반별 약점 비교, 자동 숙제 추천
- 음성 입력 (기존 conversation 모듈의 PTT 패턴 재활용)
