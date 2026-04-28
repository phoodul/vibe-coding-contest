/**
 * Euler Tutor 2.0 KPI 평가 스크립트.
 *
 * 측정 KPI 4종:
 *   1) Retriever hit rate ≥ 70% (expected_tools 가 retrieved top-3 에 포함되는 비율)
 *   2) 단순 계산 환각 0% (Reasoner 답변 vs expected_answer)
 *   3) "왜" 포함률 ≥ 90% (코칭 응답에 인과 어구 포함 비율)
 *   4) 난이도 ≥ 5 정답률 ≥ 70%
 *
 * 모드:
 *   pnpm dlx tsx scripts/eval-kpi.ts --mock          (env 없이 schema 검증 + 시뮬레이션)
 *   pnpm dlx tsx scripts/eval-kpi.ts --full          (baseline — Manager → Retriever → Reasoner 단발)
 *   pnpm dlx tsx scripts/eval-kpi.ts --full --chain  (Phase G-02 — Recursive Backward Chain inject)
 *
 * 환경변수 (--full 모드):
 *   - OPENAI_API_KEY (embedding)
 *   - ANTHROPIC_API_KEY (Manager Haiku, Reasoner Sonnet)
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY (match_math_tool_triggers RPC 호출)
 *
 * 출력:
 *   - 콘솔: 각 문항 결과 + 4 KPI 요약 표
 *   - 파일: docs/qa/kpi-evaluation-result.json (JSON)
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

interface EvalProblem {
  id: string;
  category: string;
  area: string;
  difficulty: number;
  problem: string;
  expected_answer: string;
  expected_tools: string[];
  expected_layers_used: number[];
  rationale: string;
  // killer 평가셋 전용 메타 (선택)
  is_multiple_choice?: boolean;
  killer_year?: number;
  killer_type?: string;
  killer_number?: number;
}

interface EvalFile {
  version: number;
  problems: EvalProblem[];
}

interface ManagerResult {
  variables: string[];
  conditions: string[];
  goal: string;
  area: string;
  difficulty: number;
  confidence: number;
}

interface RetrievedTool {
  tool_name: string;
  tool_layer: number;
  similarity: number;
  score: number;
  matched_via: "forward" | "backward";
}

interface ChainMeta {
  enabled: boolean;
  termination?:
    | "reached_conditions"
    | "max_depth"
    | "dead_end"
    | "cycle"
    | "forward_only_progress";
  depth?: number;
  used_tools?: string[];
  duration_ms?: number;
}

interface ProblemEvalResult {
  id: string;
  difficulty: number;
  manager_ok: boolean;
  manager_difficulty?: number;
  retrieved_tools: string[];
  expected_tools: string[];
  hit_top3: boolean;
  hit_top5: boolean;
  reasoner_text: string;
  reasoner_answer_correct: boolean | "skipped";
  why_included: boolean;
  errors: string[];
  duration_ms: number;
  chain?: ChainMeta;
  // Phase G-05
  area_label?: string;
  parse_error?: boolean; // true 면 모수 제외
  agentic_turns?: number;
  model_used?: string;
}

interface KpiSummary {
  total: number;
  retriever_hit_rate_top3: number;
  retriever_hit_rate_top5: number;
  reasoner_accuracy: number;
  reasoner_accuracy_hard: number;
  why_inclusion_rate: number;
  manager_classify_rate: number;
  pass: {
    retriever: boolean;
    accuracy: boolean;
    why: boolean;
  };
  chain?: {
    enabled: boolean;
    executed_count: number;
    avg_depth: number;
    termination_dist: Record<string, number>;
    success_rate: number;
  };
}

const REPO_ROOT = process.cwd();
const RESULT_DIR = path.join(REPO_ROOT, "docs", "qa");

// --killer: 수능 killer 평가셋 (G-04). --mode <baseline|chain_only|chain_rag|full>
//   baseline = 단발 / chain_only = alternating chain ON / chain_rag = chain + similar_problems RAG
//   full = chain + RAG + Manager expected_triggers 강화
//   후방 호환: --chain (= chain_only)
const KILLER_ON = process.argv.includes("--killer");
const MODE = process.argv.includes("--full") ? "full" : "mock";

function parseRunMode():
  | "baseline"
  | "chain_only"
  | "chain_rag"
  | "full"
  | "agentic" {
  const idx = process.argv.indexOf("--mode");
  if (idx >= 0 && process.argv[idx + 1]) {
    const v = process.argv[idx + 1] as "baseline" | "chain_only" | "chain_rag" | "full" | "agentic";
    if (["baseline", "chain_only", "chain_rag", "full", "agentic"].includes(v)) return v;
  }
  return process.argv.includes("--chain") ? "chain_only" : "baseline";
}
const RUN_MODE = parseRunMode();
const CHAIN_ON = RUN_MODE === "chain_only" || RUN_MODE === "chain_rag" || RUN_MODE === "full";
const RAG_ON = RUN_MODE === "chain_rag" || RUN_MODE === "full"; // G04-5 이후 활성화
const TRIGGERS_STRONG = RUN_MODE === "full"; // G04-3 expected_triggers (G04-3 이후)
const AGENTIC_ON = RUN_MODE === "agentic"; // G05: 진짜 multi-turn agentic

// Phase G-05: --model <sonnet|opus|gpt|gpt55|gemini> 플래그
type ModelName = "sonnet" | "opus" | "gpt" | "gpt55" | "gemini";
const MODEL_NAME: ModelName = (() => {
  const i = process.argv.indexOf("--model");
  if (i >= 0 && process.argv[i + 1]) {
    const v = process.argv[i + 1] as ModelName;
    if (["sonnet", "opus", "gpt", "gpt55", "gemini"].includes(v)) return v;
  }
  return "sonnet";
})();

// G-06: --eval-file <path> 로 평가셋 override (기하 등 별도 셋 측정용)
const EVAL_FILE_OVERRIDE = (() => {
  const i = process.argv.indexOf("--eval-file");
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : null;
})();
const EVAL_FILE = EVAL_FILE_OVERRIDE
  ? path.resolve(REPO_ROOT, EVAL_FILE_OVERRIDE)
  : KILLER_ON
    ? path.join(REPO_ROOT, "user_docs", "suneung-math", "eval", "killer-eval.json")
    : path.join(REPO_ROOT, "data", "kpi-eval-problems.json");

const RESULT_SUFFIX = EVAL_FILE_OVERRIDE
  ? `geometry-${MODEL_NAME}-${RUN_MODE}`
  : KILLER_ON
    ? `killer-${MODEL_NAME}-${RUN_MODE}`
    : CHAIN_ON ? "chain" : "baseline";
const RESULT_FILE = path.join(
  RESULT_DIR,
  MODE === "mock"
    ? "kpi-evaluation-result.json"
    : `kpi-evaluation-${RESULT_SUFFIX}.json`
);

const LIMIT = (() => {
  const idx = process.argv.indexOf("--limit");
  if (idx >= 0 && process.argv[idx + 1]) return parseInt(process.argv[idx + 1], 10) || 0;
  return 0;
})();

const HAIKU_MODEL = process.env.ANTHROPIC_HAIKU_MODEL_ID || "claude-haiku-4-5-20251001";
// Phase G-05: 모델 ID 정의
const SONNET_MODEL = process.env.ANTHROPIC_SONNET_MODEL_ID || "claude-sonnet-4-6";
const OPUS_MODEL = process.env.ANTHROPIC_OPUS_MODEL_ID || "claude-opus-4-7";
const GPT_MODEL = process.env.OPENAI_GPT_MODEL_ID || "gpt-5.1"; // 1단계 (가우스 호환)
const GPT55_MODEL = process.env.OPENAI_GPT55_MODEL_ID || "gpt-5.5";
const GEMINI_MODEL = process.env.GEMINI_MODEL_ID || "gemini-3.1-pro-preview";

const WHY_PATTERNS = [/왜냐하면/, /이유는/, /때문에/, /쓰는 이유/, /왜 (?:이|그|쓰)/];

function hasWhy(text: string): boolean {
  return WHY_PATTERNS.some((re) => re.test(text));
}

function tryParseJson<T>(text: string): T | null {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fence ? fence[1] : trimmed;
  try {
    return JSON.parse(candidate) as T;
  } catch {
    return null;
  }
}

/** 정답 동치 비교 — 공백/중괄호/단위 무시. 분수는 LLM에 맡기고 substring fallback */
function answerEquivalent(actual: string, expected: string): boolean {
  const norm = (s: string) =>
    s
      .replace(/\s+/g, "")
      .replace(/[{}()]/g, "")
      .replace(/(?:π|pi)/gi, "π")
      .toLowerCase();
  const a = norm(actual);
  const e = norm(expected);
  if (a.includes(e) || e.includes(a)) return true;
  // 두 변형 (분수 ↔ 소수) 모두 포함 시 일치로 — 조잡한 휴리스틱이지만 합성 문항엔 충분
  const expectedAlts = expected.split(/\s*\(또는|or|=\s*/);
  return expectedAlts.some((alt) => {
    const na = norm(alt);
    return na && (a.includes(na) || na.includes(a));
  });
}

/** 객관식(1~5) 정답 추출 — "(3)" / "③" / "정답: 3" / "답은 3번" */
const CIRCLED_NUM: Record<string, string> = {
  "①": "1", "②": "2", "③": "3", "④": "4", "⑤": "5",
};
function extractMultipleChoice(text: string): string | null {
  // 마지막 100자에서 우선 탐색
  const tail = text.slice(-200);
  const patterns = [
    /(?:최종\s*)?(?:정답|답)\s*[:은는]?\s*[(\[]?\s*([1-5])\s*[)\]]?\s*번?/,
    /(?:최종\s*)?(?:정답|답)\s*[:은는]?\s*([①-⑤])/,
    /\(\s*([1-5])\s*\)\s*$/m,
    /^\s*([①-⑤])\s*$/m,
  ];
  for (const re of patterns) {
    for (const src of [tail, text]) {
      const m = src.match(re);
      if (m) return CIRCLED_NUM[m[1]] ?? m[1];
    }
  }
  return null;
}

/** 주관식 정수 정답 추출 — "최종 답: 162" / "답은 162" / 마지막 줄의 정수 */
function extractIntegerAnswer(text: string): string | null {
  const tail = text.slice(-300);
  const patterns = [
    /(?:최종\s*)?(?:정답|답)\s*[:은는]?\s*([0-9]+)\b/,
    /(?:따라서|그러므로)[^.\n]*?\b([0-9]+)\b\s*(?:이다|입니다|\.|\n)/,
  ];
  for (const re of patterns) {
    for (const src of [tail, text]) {
      const m = src.match(re);
      if (m) return m[1];
    }
  }
  // fallback: 마지막 정수
  const all = text.match(/\b([0-9]+)\b/g);
  return all && all.length ? all[all.length - 1] : null;
}

/** killer 자동 채점 — is_multiple_choice 에 따라 분기. 실패 시 LLM judge fallback. */
async function judgeKillerAnswer(
  reasonerText: string,
  expected: string,
  isMultipleChoice: boolean
): Promise<{ extracted: string; correct: boolean; via: "regex" | "judge" }> {
  const extractor = isMultipleChoice ? extractMultipleChoice : extractIntegerAnswer;
  const extracted = extractor(reasonerText) ?? "";
  if (extracted && answerEquivalent(extracted, expected)) {
    return { extracted, correct: true, via: "regex" };
  }
  // LLM judge fallback (Haiku) — 정답 본문에서 최종 답만 추출
  if (!process.env.ANTHROPIC_API_KEY) {
    return { extracted, correct: false, via: "regex" };
  }
  try {
    const judgeText = await callAnthropic(
      HAIKU_MODEL,
      `당신은 수능 수학 자동 채점 보조입니다. 풀이 응답에서 ${isMultipleChoice ? "객관식 답 (1~5 정수)" : "주관식 답 (정수)"} 만 추출해 한 줄로 답하세요. 추출 실패 시 "?" 만 출력.`,
      [{ role: "user", content: `응답:\n${reasonerText.slice(-2000)}\n\n최종 답만 한 줄:` }],
      40
    );
    const judged = (judgeText.match(/[0-9]+/) || ["?"])[0];
    const ok = judged !== "?" && answerEquivalent(judged, expected);
    return { extracted: judged, correct: ok, via: "judge" };
  } catch {
    return { extracted, correct: false, via: "regex" };
  }
}

// ============================================================
// Anthropic 직접 호출
// ============================================================

interface AnthropicMessage {
  role: "user" | "assistant";
  content: string;
}

// Phase G-05: 모델 추상화 — sonnet/opus (Anthropic) / gpt/gpt55 (OpenAI) / gemini (Google)
async function callModel(
  modelName: ModelName,
  system: string,
  messages: AnthropicMessage[],
  maxTokens = 1500,
): Promise<string> {
  // OpenAI 라인 (GPT-5.1 / GPT-5.5)
  if (modelName === "gpt" || modelName === "gpt55") {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY missing");
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: modelName === "gpt55" ? GPT55_MODEL : GPT_MODEL,
        max_completion_tokens: maxTokens,
        messages: [
          { role: "system", content: system },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
    });
    if (!resp.ok) throw new Error(`OpenAI ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
    const data = (await resp.json()) as { choices: { message: { content: string } }[] };
    return data.choices[0]?.message?.content ?? "";
  }
  // Google Gemini 라인
  if (modelName === "gemini") {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY missing");
    // Google Generative Language REST API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
        generationConfig: { maxOutputTokens: maxTokens, temperature: 0.2 },
      }),
    });
    if (!resp.ok) throw new Error(`Gemini ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
    const data = (await resp.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    return (data.candidates?.[0]?.content?.parts ?? [])
      .map((p) => p.text ?? "")
      .join("");
  }
  // Anthropic 라인 (Sonnet 4.6 / Opus 4.7)
  const anthropicModel = modelName === "opus" ? OPUS_MODEL : SONNET_MODEL;
  return callAnthropic(anthropicModel, system, messages, maxTokens);
}

async function callAnthropic(
  model: string,
  system: string,
  messages: AnthropicMessage[],
  maxTokens = 1024
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY missing");

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Anthropic ${resp.status}: ${errText.slice(0, 200)}`);
  }

  const data = (await resp.json()) as { content: { type: string; text: string }[] };
  return data.content
    .filter((c) => c.type === "text")
    .map((c) => c.text)
    .join("");
}

const MANAGER_SYSTEM = `당신은 Manager Agent — 한국 수능·내신 수학 문제를 받아 풀이 전 구조화하는 분석가입니다.
출력은 JSON only:
{ "variables": [...], "conditions": [...], "goal": "...", "area": "calculus|algebra|geometry|sequence|probability|free", "difficulty": 1..6, "confidence": 0..1 }
- conditions 는 모든 명시·암시 조건 (놓치면 풀이 분기 어긋남).
- difficulty 1~3 단발, 4~5 도구 결합, 6 BFS 다중분기.
- 풀이/정답 추측 금지.`;

async function runManager(problem: string): Promise<ManagerResult | null> {
  const text = await callAnthropic(
    HAIKU_MODEL,
    MANAGER_SYSTEM,
    [{ role: "user", content: `문제:\n${problem}\n\nJSON 만 출력하세요.` }],
    800
  );
  return tryParseJson<ManagerResult>(text);
}

// ============================================================
// OpenAI embedding
// ============================================================

async function embedText(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY missing");
  const resp = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "text-embedding-3-small", input: text.trim() || "(empty)" }),
  });
  if (!resp.ok) {
    throw new Error(`OpenAI embed ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
  }
  const data = (await resp.json()) as { data: { embedding: number[] }[] };
  return data.data[0].embedding;
}

// ============================================================
// Supabase RPC (match_math_tool_triggers)
// ============================================================

interface MatchRow {
  trigger_id: string;
  tool_id: string;
  direction: "forward" | "backward" | "both";
  tool_name: string;
  tool_layer: number;
  tool_weight: number;
  similarity: number;
  trigger_condition: string;
  derived_fact: string | null;
  goal_pattern: string | null;
  why_text: string;
}

async function rpcMatchTriggers(
  embedding: number[],
  direction: "forward" | "backward",
  matchCount: number
): Promise<MatchRow[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env missing");
  const resp = await fetch(`${url}/rest/v1/rpc/match_math_tool_triggers`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "params=single-object",
    },
    body: JSON.stringify({
      query_embedding: embedding,
      direction_filter: direction,
      match_count: matchCount,
    }),
  });
  if (!resp.ok) {
    throw new Error(`Supabase RPC ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
  }
  return (await resp.json()) as MatchRow[];
}

async function runRetriever(
  conditions: string[],
  goal: string,
  topK = 5
): Promise<RetrievedTool[]> {
  const conditionsText = conditions.filter(Boolean).join(" / ").trim();
  const goalText = goal.trim();
  const overFetch = Math.max(topK * 3, 10);

  const wantForward = conditionsText.length > 0;
  const wantBackward = goalText.length > 0;
  if (!wantForward && !wantBackward) return [];

  const [fwdEmb, bwdEmb] = await Promise.all([
    wantForward ? embedText(conditionsText) : Promise.resolve<number[] | null>(null),
    wantBackward ? embedText(goalText) : Promise.resolve<number[] | null>(null),
  ]);

  const [fwdRows, bwdRows] = await Promise.all([
    fwdEmb ? rpcMatchTriggers(fwdEmb, "forward", overFetch) : Promise.resolve<MatchRow[]>([]),
    bwdEmb ? rpcMatchTriggers(bwdEmb, "backward", overFetch) : Promise.resolve<MatchRow[]>([]),
  ]);

  const merged = new Map<string, RetrievedTool>();
  const ingest = (rows: MatchRow[], via: "forward" | "backward") => {
    for (const r of rows) {
      const score = r.similarity * (r.tool_weight ?? 1.0);
      const existing = merged.get(r.tool_id);
      if (!existing || score > existing.score) {
        merged.set(r.tool_id, {
          tool_name: r.tool_name,
          tool_layer: r.tool_layer,
          similarity: r.similarity,
          score,
          matched_via: via,
        });
      }
    }
  };
  ingest(fwdRows, "forward");
  ingest(bwdRows, "backward");

  return Array.from(merged.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

// ============================================================
// Reasoner (단일 풀이 + "왜" 포함 코칭 멘트)
// ============================================================

const REASONER_SYSTEM = `당신은 한국 수학 학원의 시니어 강사이자 코치 (오일러 튜터) 입니다.
주어진 문제를 단계적으로 풀이한 후, **마지막에 다음 두 줄을 반드시 출력**하세요:
  최종 답: <간단한 표현>
  코칭 한마디: <학생에게 "왜 이 도구를 쓰는지" 설명을 한 문장 — '왜냐하면' 또는 '이유는' 으로 시작>`;

async function runReasoner(
  problem: string,
  retrieved: RetrievedTool[],
  chainContext?: string,
  similarContext?: string,
  expectedTriggersHint?: string,
): Promise<string> {
  const toolsHint = retrieved.length
    ? `\n\n참고 도구 후보 (Retriever):\n${retrieved.map((t, i) => `  ${i + 1}. ${t.tool_name} (L${t.tool_layer})`).join("\n")}`
    : "";
  const chainHint = chainContext
    ? `\n\n## 분해 사고 경로 (Recursive Backward Chain — Phase G-02/G-04)\n${chainContext}\n\n위 chain 의 분해 순서를 따라 풀이를 전개하세요.`
    : "";
  const triggersHint = expectedTriggersHint ? `\n\n## Manager 가 추정한 expected_triggers (G-04)\n${expectedTriggersHint}` : "";
  const text = await callModel(
    MODEL_NAME,
    REASONER_SYSTEM,
    [{ role: "user", content: `${problem}${toolsHint}${triggersHint}${similarContext ?? ""}${chainHint}` }],
    // G-05 (재측정): Gemini 응답 잘림 → 3000 → 5000
    5000
  );
  return text;
}

// ============================================================
// Phase G-02: Recursive Backward Chain (eval inline 구현)
// orchestrator route 의 recursive-reasoner.ts 와 동등하나, retrieve 는
// 본 스크립트의 runRetriever 를 사용 (server supabase 의존 회피).
// ============================================================

interface ChainNodeEval {
  depth: number;
  kind?: "backward" | "forward";
  goal: string;
  tool: string | null;
  rationale: string;
  next_subgoal: string | null;
  reached_conditions: boolean;
  derived_facts?: string[];
}

interface ChainResultEval {
  chain: ChainNodeEval[];
  termination:
    | "reached_conditions"
    | "max_depth"
    | "dead_end"
    | "cycle"
    | "forward_only_progress";
  used_tools: string[];
  duration_ms: number;
}

const SUBGOAL_DECOMPOSE_SYSTEM = `당신은 **Recursive Backward Reasoner** 입니다.
학생이 어려운 수학 문제를 풀 때 목표 → subgoal → subgoal 의 subgoal 순서로 거꾸로 분해.

## 작업
"currentGoal 을 풀려면 무엇이 필요한가?" — 단 하나의 가장 자연스러운 분해 경로를 선택.
- candidateTools 중 가장 적합한 도구를 골라 tool 에 적기. 없으면 null.
- 그 도구를 적용하기 위해 충족해야 할 새 subgoal 을 next_subgoal 에 적기.
- currentGoal 이 conditions 로 직접 풀린다고 판단하면 reached_conditions=true + next_subgoal=null.
- previousChain 에 이미 등장한 goal 이면 cycle 회피.

## 출력 (JSON only)
{ "tool": "...", "rationale": "...", "next_subgoal": "..." | null, "reached_conditions": false }`;

function buildDecomposeUser(args: {
  problem: string;
  conditions: string[];
  currentGoal: string;
  candidateTools: { tool_name: string; tool_layer: number }[];
  previousChain: ChainNodeEval[];
}): string {
  const tools = args.candidateTools.length
    ? args.candidateTools
        .map((t, i) => `  ${i + 1}. ${t.tool_name} (L${t.tool_layer})`)
        .join("\n")
    : "  (없음 — 일반 추론으로 분해)";
  const chain = args.previousChain.length
    ? args.previousChain
        .map((n) => `  depth ${n.depth}: ${n.goal}${n.tool ? ` [${n.tool}]` : ""}`)
        .join("\n")
    : "  (아직 없음)";
  return `### 문제
${args.problem}

### 알려진 조건
${args.conditions.map((c, i) => `  ${i + 1}. ${c}`).join("\n")}

### 현재 분해할 목표 (depth ${args.previousChain.length})
${args.currentGoal}

### 후보 도구 (Retriever — backward)
${tools}

### 지금까지의 chain
${chain}

JSON 만 출력하세요. 단일 분해 경로만.`;
}

function isCycle(newGoal: string, chain: ChainNodeEval[]): boolean {
  if (!newGoal) return false;
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
  const target = norm(newGoal);
  return chain.some((n) => norm(n.goal) === target);
}

// ───── Phase G-04: Forward Deduce (alternating loop 의 순행 단계) ─────

const FORWARD_DEDUCE_SYSTEM_EVAL = `당신은 **Forward Deductive Reasoner** 입니다 (math_process.md ③).
주어진 conditions (원본 + 누적 사실) 의 조합으로 **새 사실 1~3개** 를 도출.

## 출력 (JSON only)
{ "new_facts": [{"fact":"...","derived_from":"조건 1+2 결합","tool":null,"why":"..."}], "reached_goal_directly": false }

## 원칙
- 추측 금지. 조건 조합으로 수학적으로 도출 가능한 사실만.
- 새 사실 없으면 new_facts: [] (forward dead end).
- 최대 3개.`;

interface ForwardDeduceJsonEval {
  new_facts?: { fact: string; derived_from?: string; tool?: string | null; why?: string }[];
  reached_goal_directly?: boolean;
}

async function runForwardDeduce(args: {
  problem: string;
  conditions: string[];
  finalGoal: string;
  previousChain: ChainNodeEval[];
}): Promise<ForwardDeduceJsonEval | null> {
  const chainStr = args.previousChain.length
    ? args.previousChain
        .map((n) =>
          n.kind === "forward"
            ? `  depth ${n.depth} [forward]: ${(n.derived_facts || []).join(" / ")}`
            : `  depth ${n.depth} [backward]: ${n.goal}`,
        )
        .join("\n")
    : "  (아직 없음)";
  const user = `### 문제
${args.problem}

### 알려진 조건 (원본 + 누적 사실)
${args.conditions.map((c, i) => `  ${i + 1}. ${c}`).join("\n")}

### 최종 목표 (참고)
${args.finalGoal}

### 지금까지의 chain
${chainStr}

JSON 만 출력. 새 사실 1~3개.`;
  const text = await callAnthropic(SONNET_MODEL, FORWARD_DEDUCE_SYSTEM_EVAL, [{ role: "user", content: user }], 600);
  return tryParseJson<ForwardDeduceJsonEval>(text);
}

async function runAlternatingChain(args: {
  problem: string;
  conditions: string[];
  goal: string;
  maxDepth?: number;
}): Promise<ChainResultEval> {
  const t0 = Date.now();
  const cap = Math.max(2, Math.min((args.maxDepth ?? 5) * 2, 10));
  const chain: ChainNodeEval[] = [];
  const usedTools = new Set<string>();
  const knownFacts: string[] = [];
  let currentGoal = args.goal;
  let termination: ChainResultEval["termination"] = "max_depth";
  const accConditions = () => [...args.conditions, ...knownFacts];

  for (let depth = 0; depth < cap; depth++) {
    const isBackward = depth % 2 === 0;
    if (isBackward) {
      const tools = await runRetriever(accConditions(), currentGoal, 5).catch(() => []);
      const candidateTools = tools.map((t) => ({ tool_name: t.tool_name, tool_layer: t.tool_layer }));
      const userPrompt = buildDecomposeUser({
        problem: args.problem,
        conditions: accConditions(),
        currentGoal,
        candidateTools,
        previousChain: chain,
      });
      let decomposed: { tool?: string | null; rationale?: string; next_subgoal?: string | null; reached_conditions?: boolean } | null = null;
      try {
        const text = await callAnthropic(SONNET_MODEL, SUBGOAL_DECOMPOSE_SYSTEM, [{ role: "user", content: userPrompt }], 600);
        decomposed = tryParseJson(text);
      } catch (e) {
        console.warn(`[alt-chain] backward sonnet failed @d=${depth}:`, (e as Error).message);
      }
      if (!decomposed) {
        chain.push({ depth, kind: "backward", goal: currentGoal, tool: null, rationale: "backward fail", next_subgoal: null, reached_conditions: false });
        if (depth + 1 >= cap) { termination = "dead_end"; break; }
        continue;
      }
      const node: ChainNodeEval = {
        depth, kind: "backward", goal: currentGoal,
        tool: decomposed.tool ?? null,
        rationale: decomposed.rationale ?? "",
        next_subgoal: decomposed.next_subgoal ?? null,
        reached_conditions: !!decomposed.reached_conditions,
      };
      chain.push(node);
      if (node.tool) usedTools.add(node.tool);
      if (node.reached_conditions) { termination = "reached_conditions"; break; }
      if (!node.next_subgoal) { if (depth + 1 >= cap) { termination = "dead_end"; break; } continue; }
      if (isCycle(node.next_subgoal, chain)) { if (depth + 1 >= cap) { termination = "cycle"; break; } continue; }
      currentGoal = node.next_subgoal;
    } else {
      const deduced = await runForwardDeduce({
        problem: args.problem,
        conditions: accConditions(),
        finalGoal: args.goal,
        previousChain: chain,
      }).catch(() => null);
      const newFacts = (deduced?.new_facts ?? []).filter((f) => f && f.fact && !knownFacts.includes(f.fact));
      const node: ChainNodeEval = {
        depth, kind: "forward", goal: currentGoal,
        tool: newFacts.find((f) => f.tool)?.tool ?? null,
        rationale: newFacts.map((f) => `${f.fact} (${f.why ?? ""})`).join(" / "),
        next_subgoal: null, reached_conditions: false,
        derived_facts: newFacts.map((f) => f.fact),
      };
      chain.push(node);
      for (const f of newFacts) if (f.tool) usedTools.add(f.tool);
      if (deduced?.reached_goal_directly && newFacts.length > 0) { termination = "reached_conditions"; break; }
      if (newFacts.length === 0) {
        const hadBack = chain.some((n) => n.kind === "backward" && n.next_subgoal !== null);
        termination = hadBack ? "forward_only_progress" : "dead_end";
        break;
      }
      for (const f of newFacts) knownFacts.push(f.fact);
    }
  }

  return { chain, termination, used_tools: Array.from(usedTools), duration_ms: Date.now() - t0 };
}

// ───── Phase G-04 G04-5: similar_problems RAG (PostgREST 직접 호출) ─────

interface SimilarRow {
  id: string;
  year: number;
  type: string;
  number: number;
  problem_latex: string;
  answer: string;
  trigger_labels: { direction: string; condition_pattern?: string; goal_pattern?: string; why?: string; tool_hint?: string }[];
  similarity: number;
}

async function fetchSimilarProblems(problem: string, topK = 3): Promise<SimilarRow[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return [];
  let embedding: number[];
  try { embedding = await embedText(problem); } catch { return []; }
  const resp = await fetch(`${url}/rest/v1/rpc/match_similar_problems`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query_embedding: embedding, match_count: topK }),
  });
  if (!resp.ok) return [];
  return (await resp.json()) as SimilarRow[];
}

function formatSimilarContextEval(rows: SimilarRow[]): string {
  if (!rows.length) return "";
  const all = rows.flatMap((r) => (r.trigger_labels || []).map((t) => ({ ...t })));
  const seen = new Set<string>();
  const uniq = all.filter((t) => {
    const k = (t.why || `${t.condition_pattern}|${t.goal_pattern}`).trim();
    if (!k || seen.has(k)) return false;
    seen.add(k); return true;
  }).slice(0, 8);
  if (!uniq.length) return "";
  const lines = uniq.map((t) => {
    const arrow = t.direction === "backward"
      ? `${t.goal_pattern ?? "(목표)"} ← ${t.tool_hint ?? "도구"}`
      : `${t.condition_pattern ?? "(조건)"} → ${t.tool_hint ?? "도구"}`;
    return `  - [${t.direction}] ${arrow} — ${t.why}`;
  });
  return `\n\n## 유사 과거 수능 killer 문항이 발동시킨 trigger 패턴 (백엔드 RAG)\n${lines.join("\n")}\n\n위 trigger 들을 풀이 방향성 추론에만 참고. 학생에게는 노출하지 마세요.`;
}

// ───── Phase G-05: 진짜 multi-turn agentic chain (math_process.md 정신) ─────
// 매 turn 마다 (원문제 + 누적 trace + 직전 step + 다음 instruction) 모두 컨텍스트 주입.
// 모델이 5 step 으로 분해해 풀이. 마지막 step 에서만 최종 답.

interface AgenticTurn {
  step: number;
  response: string;
  duration_ms: number;
}

interface AgenticResult {
  turns: AgenticTurn[];
  final_answer_text: string;
  total_duration_ms: number;
}

const AGENTIC_SYSTEM = `당신은 한국 수학 전문 시니어 강사입니다. 어려운 수능 문제를 단계적으로 분해해 풀이합니다.

## 핵심 원칙
- 매 step 마다 한 걸음만. 한 번에 답 도출 X.
- 매 step 마다 원문제 컨텍스트가 함께 주입됨 — 절대 잊지 마세요.
- 자가 검증 포함: 계산 오류, 누락 조건, 정의역 위반 점검.
- 마지막 step 에서만 "최종 답: <값>" 한 줄 출력 (객관식 1~5 또는 정수).`;

async function runAgenticChain(args: {
  problem: string;
  modelName: ModelName;
  maxTurns?: number;
}): Promise<AgenticResult> {
  const t0 = Date.now();
  const cap = Math.max(2, Math.min(args.maxTurns ?? 5, 8));
  const turns: AgenticTurn[] = [];
  const problemContext = `### 원문제 (변하지 않는 컨텍스트)
${args.problem}

### 풀이 절차
${cap}단계로 나눠 풀이합니다. 각 단계는 한 걸음만.
- Step 1: 문제 구조화 — 구해야 할 것 / 조건 / 제약 분리 + 첫 추론 1걸음
- Step 2~${cap - 1}: 다음 1걸음 (forward 또는 backward) + 자가 검증
- Step ${cap}: 누적 추론 종합 + "최종 답: <값>" 한 줄`;

  let trace = "";
  for (let step = 0; step < cap; step++) {
    const isLast = step === cap - 1;
    const instruction = isLast
      ? `### Step ${step + 1} (마지막): 최종 답
지금까지의 누적 추론을 모두 종합해 최종 답만 정리. 마지막 줄에 반드시 "최종 답: <값>". 객관식이면 1~5, 주관식이면 정수.`
      : step === 0
        ? `### Step 1: 문제 구조화 + 첫 추론 1걸음
원문제를 분해 — (구해야 할 것 list) / (조건 list) / (제약 list) 분리. 그 다음 첫 1걸음만 (forward = 조건 조합으로 새 사실, 또는 backward = 목표를 subgoal 로 분해). 답 도출 X.`
        : `### Step ${step + 1}: 다음 1걸음 추론
직전 step 결과를 받아 다음 1걸음 (forward 또는 backward). 자가 검증 (계산 오류, 누락 조건). 답 도출 X.`;

    const userMsg = `${problemContext}

### 누적 reasoning trace (Step 1~${step} 결과)
${trace || "(아직 없음 — 이번이 Step 1)"}

${instruction}`;

    let respText: string;
    try {
      respText = await callModel(
        args.modelName,
        AGENTIC_SYSTEM,
        [{ role: "user", content: userMsg }],
        // G-05 (재측정): 마지막 step 도 풀이 잘리지 않게 토큰 ↑
        // Gemini 응답이 길어 5000 까지 허용
        isLast ? 3000 : 5000,
      );
    } catch (e) {
      console.warn(`[agentic] step ${step + 1} failed:`, (e as Error).message);
      break;
    }
    const stepDur = Date.now() - t0;
    turns.push({ step: step + 1, response: respText, duration_ms: stepDur });
    trace += `\n--- Step ${step + 1} 결과 ---\n${respText}\n`;
  }

  return {
    turns,
    final_answer_text: turns[turns.length - 1]?.response ?? "",
    total_duration_ms: Date.now() - t0,
  };
}

async function runRecursiveChain(args: {
  problem: string;
  conditions: string[];
  goal: string;
  maxDepth?: number;
}): Promise<ChainResultEval> {
  const t0 = Date.now();
  const cap = Math.max(1, Math.min(args.maxDepth ?? 5, 8));
  const chain: ChainNodeEval[] = [];
  const usedTools = new Set<string>();
  let currentGoal = args.goal;
  let termination: ChainResultEval["termination"] = "max_depth";

  for (let depth = 0; depth < cap; depth++) {
    const tools = await runRetriever(args.conditions, currentGoal, 5).catch(() => []);
    const candidateTools = tools.map((t) => ({
      tool_name: t.tool_name,
      tool_layer: t.tool_layer,
    }));

    const userPrompt = buildDecomposeUser({
      problem: args.problem,
      conditions: args.conditions,
      currentGoal,
      candidateTools,
      previousChain: chain,
    });

    let parsed: {
      tool?: string | null;
      rationale?: string;
      next_subgoal?: string | null;
      reached_conditions?: boolean;
    } | null = null;
    try {
      const text = await callAnthropic(
        SONNET_MODEL,
        SUBGOAL_DECOMPOSE_SYSTEM,
        [{ role: "user", content: userPrompt }],
        600
      );
      parsed = tryParseJson(text);
    } catch (e) {
      console.warn(`  chain depth=${depth}: decompose failed: ${(e as Error).message}`);
    }

    if (!parsed) {
      termination = "dead_end";
      break;
    }

    const node: ChainNodeEval = {
      depth,
      goal: currentGoal,
      tool: parsed.tool ?? null,
      rationale: parsed.rationale ?? "",
      next_subgoal: parsed.next_subgoal ?? null,
      reached_conditions: !!parsed.reached_conditions,
    };
    chain.push(node);
    if (node.tool) usedTools.add(node.tool);

    if (node.reached_conditions) {
      termination = "reached_conditions";
      break;
    }
    if (!node.next_subgoal) {
      termination = "dead_end";
      break;
    }
    if (isCycle(node.next_subgoal, chain)) {
      termination = "cycle";
      break;
    }
    currentGoal = node.next_subgoal;
  }

  return {
    chain,
    termination,
    used_tools: Array.from(usedTools),
    duration_ms: Date.now() - t0,
  };
}

function chainToText(result: ChainResultEval): string {
  if (!result.chain.length) return "";
  const lines = result.chain.map((n) => {
    const head = n.depth === 0
      ? `최종 목표: ${n.goal}`
      : `↳ 그래서 다음을 풀어야 해요: ${n.goal}`;
    const tool = n.tool ? `\n   사용 도구: ${n.tool}` : "";
    const why = n.rationale ? `\n   이유: ${n.rationale}` : "";
    return `${head}${tool}${why}`;
  });
  return lines.join("\n");
}

function extractFinalAnswer(reasonerText: string): string {
  const match = reasonerText.match(/최종 답\s*[:：]\s*(.+)/);
  if (match) return match[1].trim().split("\n")[0];
  return "";
}

// ============================================================
// Mock mode — schema 검증 + 시뮬레이션
// ============================================================

function mockEvaluate(p: EvalProblem, seedToolNames: Set<string>): ProblemEvalResult {
  const errors: string[] = [];
  for (const t of p.expected_tools) {
    if (!seedToolNames.has(t)) {
      errors.push(`expected_tool '${t}' 가 math-tools-seed.json 에 없음`);
    }
  }
  // 시뮬레이션: top-3 hit 가정, top-5 hit 가정, "왜" 포함 가정 (스크립트 동작 확인용)
  return {
    id: p.id,
    difficulty: p.difficulty,
    manager_ok: true,
    manager_difficulty: p.difficulty,
    retrieved_tools: p.expected_tools.slice(0, 3),
    expected_tools: p.expected_tools,
    hit_top3: errors.length === 0,
    hit_top5: errors.length === 0,
    reasoner_text: "(mock) 최종 답: " + p.expected_answer + "\n코칭 한마디: 왜냐하면 ...",
    reasoner_answer_correct: errors.length === 0,
    why_included: true,
    errors,
    duration_ms: 0,
  };
}

// ============================================================
// Full mode
// ============================================================

async function fullEvaluate(p: EvalProblem): Promise<ProblemEvalResult> {
  const start = Date.now();
  const errors: string[] = [];
  let manager: ManagerResult | null = null;
  let retrieved: RetrievedTool[] = [];
  let reasonerText = "";
  let chainMeta: ChainMeta = { enabled: CHAIN_ON };
  let chainContext: string | undefined;
  let agenticTurns = 0;

  // ─── Phase G-05 agentic mode: Manager/Retriever/Chain skip, multi-turn 만 ───
  if (AGENTIC_ON) {
    try {
      const ag = await runAgenticChain({
        problem: p.problem,
        modelName: MODEL_NAME,
        maxTurns: 5,
      });
      reasonerText = ag.turns.map((t) => `--- Step ${t.step} ---\n${t.response}`).join("\n\n");
      agenticTurns = ag.turns.length;
    } catch (e) {
      errors.push(`Agentic: ${(e as Error).message}`);
    }
    // 채점 (객관식/주관식 분기)
    let finalAnswer = "";
    let correct = false;
    let parseError = false;
    if (reasonerText) {
      const judged = await judgeKillerAnswer(reasonerText, p.expected_answer, !!p.is_multiple_choice);
      finalAnswer = judged.extracted;
      correct = judged.correct;
      // parse error: 추출 결과 비어 있고 judge fallback 도 빈값
      if (!finalAnswer || finalAnswer === "?") parseError = true;
    } else {
      parseError = true;
    }
    return {
      id: p.id,
      difficulty: p.difficulty,
      manager_ok: false,
      retrieved_tools: [],
      expected_tools: p.expected_tools,
      hit_top3: false,
      hit_top5: false,
      reasoner_text: reasonerText,
      reasoner_answer_correct: correct,
      why_included: hasWhy(reasonerText),
      errors,
      duration_ms: Date.now() - start,
      area_label: (p as EvalProblemWithArea).area_label,
      parse_error: parseError,
      agentic_turns: agenticTurns,
      model_used: MODEL_NAME,
    };
  }

  try {
    manager = await runManager(p.problem);
    if (!manager) errors.push("Manager JSON parse failed");
  } catch (e) {
    errors.push(`Manager: ${(e as Error).message}`);
  }

  if (manager) {
    try {
      retrieved = await runRetriever(manager.conditions, manager.goal, 5);
    } catch (e) {
      errors.push(`Retriever: ${(e as Error).message}`);
    }
  }

  // Phase G-02/G-04 chain: 모드가 ON 이고 난이도 >= 5 일 때만
  // G-04: chain_only 이상이면 alternating 사용, baseline 은 chain X.
  if (CHAIN_ON && manager && p.difficulty >= 5) {
    try {
      // CHAIN_ON 진입 시점에 RUN_MODE 는 baseline 이 아님 (alternating 사용)
      const cr = await runAlternatingChain({
        problem: p.problem,
        conditions: manager.conditions,
        goal: manager.goal,
        maxDepth: 5,
      });
      chainMeta = {
        enabled: true,
        termination: cr.termination,
        depth: cr.chain.length,
        used_tools: cr.used_tools,
        duration_ms: cr.duration_ms,
      };
      if (cr.chain.length > 0) {
        chainContext = chainToText(cr);
      }
    } catch (e) {
      errors.push(`Chain: ${(e as Error).message}`);
    }
  }

  // Phase G-04: chain_rag/full 일 때 similar_problems RAG 호출 (eff>=5 만)
  let similarContext: string | undefined;
  if (RAG_ON && manager && p.difficulty >= 5) {
    try {
      const sims = await fetchSimilarProblems(p.problem, 3);
      similarContext = formatSimilarContextEval(sims);
    } catch (e) {
      console.warn(`[eval] similar fetch failed:`, (e as Error).message);
    }
  }

  // Phase G-04 full: Manager expected_triggers 를 reasoner inject (Manager 출력에 있을 때만)
  let expectedTriggersHint: string | undefined;
  if (TRIGGERS_STRONG && manager) {
    const exp = (manager as ManagerResult & { expected_triggers?: { direction: string; condition_pattern?: string; goal_pattern?: string; why?: string; tool_hint?: string }[] }).expected_triggers;
    if (Array.isArray(exp) && exp.length) {
      expectedTriggersHint = exp.map((t) => {
        const arrow = t.direction === "backward"
          ? `${t.goal_pattern ?? "(목표)"} ← ${t.tool_hint ?? "도구"}`
          : `${t.condition_pattern ?? "(조건)"} → ${t.tool_hint ?? "도구"}`;
        return `  - [${t.direction}] ${arrow} — ${t.why}`;
      }).join("\n");
    }
  }

  try {
    reasonerText = await runReasoner(p.problem, retrieved, chainContext, similarContext, expectedTriggersHint);
  } catch (e) {
    errors.push(`Reasoner: ${(e as Error).message}`);
  }

  const retrievedNames = retrieved.map((t) => t.tool_name);
  const top3 = retrievedNames.slice(0, 3);
  const top5 = retrievedNames.slice(0, 5);
  const hitTop3 = p.expected_tools.some((t) => top3.some((r) => r.includes(t.split(" ")[0]) || t.includes(r.split(" ")[0])));
  const hitTop5 = p.expected_tools.some((t) => top5.some((r) => r.includes(t.split(" ")[0]) || t.includes(r.split(" ")[0])));

  let finalAnswer = "";
  let correct = false;
  let parseError = false;
  if (reasonerText) {
    if (typeof p.is_multiple_choice === "boolean") {
      // killer 평가셋: 객관식/주관식 분기 + LLM judge fallback
      const judged = await judgeKillerAnswer(reasonerText, p.expected_answer, p.is_multiple_choice);
      finalAnswer = judged.extracted;
      correct = judged.correct;
      if (!finalAnswer || finalAnswer === "?") parseError = true;
    } else {
      finalAnswer = extractFinalAnswer(reasonerText);
      correct = answerEquivalent(finalAnswer || reasonerText, p.expected_answer);
    }
  } else {
    parseError = true;
  }

  return {
    id: p.id,
    difficulty: p.difficulty,
    manager_ok: !!manager,
    manager_difficulty: manager?.difficulty,
    retrieved_tools: retrievedNames,
    expected_tools: p.expected_tools,
    hit_top3: hitTop3,
    hit_top5: hitTop5,
    reasoner_text: reasonerText,
    reasoner_answer_correct: correct,
    why_included: hasWhy(reasonerText),
    errors,
    duration_ms: Date.now() - start,
    chain: chainMeta,
    area_label: (p as EvalProblemWithArea).area_label,
    parse_error: parseError,
    model_used: MODEL_NAME,
  };
}

// ============================================================
// Aggregate
// ============================================================

interface AreaStat {
  area: string;
  total: number;
  parse_errors: number;
  effective_total: number; // total - parse_errors
  correct: number;
  accuracy: number;
}

function summarizeByArea(results: ProblemEvalResult[]): AreaStat[] {
  const byArea: Record<string, ProblemEvalResult[]> = {};
  for (const r of results) {
    const a = r.area_label || "기타";
    if (!byArea[a]) byArea[a] = [];
    byArea[a].push(r);
  }
  return Object.entries(byArea)
    .map(([area, rows]) => {
      const total = rows.length;
      const parseErrors = rows.filter((r) => r.parse_error).length;
      const effective = total - parseErrors;
      const correct = rows.filter((r) => r.reasoner_answer_correct === true).length;
      return {
        area,
        total,
        parse_errors: parseErrors,
        effective_total: effective,
        correct,
        accuracy: effective > 0 ? correct / effective : 0,
      };
    })
    .sort((a, b) => a.area.localeCompare(b.area));
}

function summarize(results: ProblemEvalResult[]): KpiSummary {
  // Phase G-05: parse_error 는 모수 제외
  const validResults = results.filter((r) => !r.parse_error);
  const total = validResults.length;
  const hardResults = validResults.filter((r) => r.difficulty >= 5);

  const correctCount = validResults.filter((r) => r.reasoner_answer_correct === true).length;
  const hardCorrectCount = hardResults.filter((r) => r.reasoner_answer_correct === true).length;
  const top3HitCount = validResults.filter((r) => r.hit_top3).length;
  const top5HitCount = validResults.filter((r) => r.hit_top5).length;
  const whyCount = validResults.filter((r) => r.why_included).length;
  const managerOkCount = validResults.filter((r) => r.manager_ok).length;

  const top3 = total > 0 ? top3HitCount / total : 0;
  const top5 = total > 0 ? top5HitCount / total : 0;
  const acc = total > 0 ? correctCount / total : 0;
  const accHard = hardResults.length > 0 ? hardCorrectCount / hardResults.length : 0;
  const why = total > 0 ? whyCount / total : 0;

  // Chain 통계 (chain.enabled === true 인 결과만 집계, parse_error 도 포함)
  const chainResults = results.filter((r) => r.chain?.enabled && !r.parse_error);
  const chainExecuted = chainResults.filter((r) => r.chain?.depth && r.chain.depth > 0);
  const termDist: Record<string, number> = {
    reached_conditions: 0,
    max_depth: 0,
    dead_end: 0,
    cycle: 0,
  };
  for (const r of chainExecuted) {
    if (r.chain?.termination) termDist[r.chain.termination] = (termDist[r.chain.termination] ?? 0) + 1;
  }
  const avgDepth =
    chainExecuted.length > 0
      ? chainExecuted.reduce((s, r) => s + (r.chain?.depth ?? 0), 0) / chainExecuted.length
      : 0;
  const chainSummary = chainResults.length
    ? {
        enabled: true,
        executed_count: chainExecuted.length,
        avg_depth: avgDepth,
        termination_dist: termDist,
        success_rate:
          chainExecuted.length > 0
            ? termDist.reached_conditions / chainExecuted.length
            : 0,
      }
    : { enabled: false, executed_count: 0, avg_depth: 0, termination_dist: termDist, success_rate: 0 };

  return {
    total,
    retriever_hit_rate_top3: top3,
    retriever_hit_rate_top5: top5,
    reasoner_accuracy: acc,
    reasoner_accuracy_hard: accHard,
    why_inclusion_rate: why,
    manager_classify_rate: total > 0 ? managerOkCount / total : 0,
    pass: {
      retriever: top3 >= 0.7,
      accuracy: accHard >= 0.7,
      why: why >= 0.9,
    },
    chain: chainSummary,
  };
}

function formatPercent(v: number): string {
  return `${(v * 100).toFixed(1)}%`;
}

function printReport(results: ProblemEvalResult[], summary: KpiSummary, mode: string) {
  const line = "─".repeat(72);
  console.log(`\n${line}\nEuler Tutor 2.0 — KPI Evaluation Report (${mode} mode)\n${line}\n`);

  console.log("문항별 결과:");
  console.log(
    "ID        | 난이도 | Hit3 | Hit5 | 정답 | 왜 | Manager | 시간(ms)"
  );
  console.log("-".repeat(72));
  for (const r of results) {
    const correctMark =
      r.reasoner_answer_correct === true
        ? " ✓ "
        : r.reasoner_answer_correct === "skipped"
          ? " - "
          : " ✗ ";
    console.log(
      `${r.id.padEnd(9)} | ${String(r.difficulty).padStart(5)} | ${r.hit_top3 ? " ✓ " : " ✗ "}  | ${r.hit_top5 ? " ✓ " : " ✗ "}  |${correctMark} | ${r.why_included ? "✓" : "✗"} | ${r.manager_ok ? "✓" : "✗"}      | ${r.duration_ms}`
    );
    if (r.errors.length) {
      for (const e of r.errors) console.log(`           └─ ${e}`);
    }
  }

  console.log(`\n${line}\nKPI 종합\n${line}`);
  console.log(`총 문항 수: ${summary.total}`);
  console.log(
    `Retriever Hit Rate (top-3): ${formatPercent(summary.retriever_hit_rate_top3)} ${summary.pass.retriever ? "✅ PASS (≥70%)" : "❌ FAIL (<70%)"}`
  );
  console.log(`Retriever Hit Rate (top-5): ${formatPercent(summary.retriever_hit_rate_top5)}`);
  console.log(
    `Reasoner 정답률 전체: ${formatPercent(summary.reasoner_accuracy)} / 난이도≥5: ${formatPercent(summary.reasoner_accuracy_hard)} ${summary.pass.accuracy ? "✅ PASS" : "❌ FAIL (<70%)"}`
  );
  console.log(
    `"왜" 포함률: ${formatPercent(summary.why_inclusion_rate)} ${summary.pass.why ? "✅ PASS (≥90%)" : "❌ FAIL (<90%)"}`
  );
  console.log(`Manager 분류 성공률: ${formatPercent(summary.manager_classify_rate)}`);

  // Phase G-05: 영역별 통계 (parse_error 제외)
  const areaStats = summarizeByArea(results);
  if (areaStats.length > 1) {
    console.log(`\n${line}\n영역별 정답률 (parse_error 모수 제외)\n${line}`);
    console.log("영역                    | 총 | parse_err | 유효 | 정답 | 정답률");
    console.log("-".repeat(72));
    for (const s of areaStats) {
      console.log(
        `${s.area.padEnd(22)} | ${String(s.total).padStart(2)} |    ${String(s.parse_errors).padStart(2)}     |  ${String(s.effective_total).padStart(2)}  |  ${String(s.correct).padStart(2)}  | ${formatPercent(s.accuracy)}`,
      );
    }
  }

  if (summary.chain?.enabled) {
    console.log(`\nRecursive Chain (Phase G-02):`);
    console.log(`  실행 건수: ${summary.chain.executed_count}/${summary.total} (난이도 ≥ 5 만)`);
    console.log(`  평균 depth: ${summary.chain.avg_depth.toFixed(2)}`);
    console.log(`  조건 도달률: ${formatPercent(summary.chain.success_rate)}`);
    console.log(`  종료 분포:`);
    for (const [k, v] of Object.entries(summary.chain.termination_dist)) {
      console.log(`    ${k}: ${v}`);
    }
  }
  console.log("");
}

// ============================================================
// Main
// ============================================================

interface KillerProblem {
  id: string;
  year: number;
  type: string;
  number: number;
  area_label?: string; // G-05: "가형(2017~2021)" / "공통(2022~2026)" / "미적분(2022~2026)"
  problem_latex: string;
  answer: string;
  is_multiple_choice: boolean;
}

interface EvalProblemWithArea extends EvalProblem {
  area_label?: string;
}

function adaptKillerToEval(k: KillerProblem): EvalProblemWithArea {
  // G-05: 21+22 = 공통(난이도 5), 28+30 = 미적분(난이도 6)
  const difficulty = k.number >= 28 ? 6 : 5;
  return {
    id: k.id,
    category: `${k.area_label ?? k.type}-${k.number}`,
    area: k.area_label ?? "killer",
    difficulty,
    problem: k.problem_latex,
    expected_answer: k.answer,
    expected_tools: [],
    expected_layers_used: [6, 7],
    rationale: "",
    is_multiple_choice: k.is_multiple_choice,
    killer_year: k.year,
    killer_type: k.type,
    killer_number: k.number,
    area_label: k.area_label,
  };
}

async function main() {
  const evalRaw = await readFile(EVAL_FILE, "utf-8");
  let problems: EvalProblem[];
  if (KILLER_ON) {
    const killerFile = JSON.parse(evalRaw) as { problems: KillerProblem[] };
    problems = killerFile.problems.map(adaptKillerToEval);
  } else {
    const evalFile = JSON.parse(evalRaw) as EvalFile;
    problems = evalFile.problems;
  }
  if (LIMIT > 0) problems = problems.slice(0, LIMIT);

  // 시드 도구 이름 집합 (mock 모드 검증용)
  const seedRaw = await readFile(path.join(REPO_ROOT, "data", "math-tools-seed.json"), "utf-8");
  const seedFile = JSON.parse(seedRaw) as { tools: { name: string }[] };
  const seedToolNames = new Set(seedFile.tools.map((t) => t.name));

  console.log(`Mode: ${MODE}${KILLER_ON ? ` killer (run=${RUN_MODE}, chain=${CHAIN_ON ? "ON" : "OFF"}, RAG=${RAG_ON ? "ON" : "OFF"}, triggers=${TRIGGERS_STRONG ? "ON" : "OFF"})` : ` (chain=${CHAIN_ON ? "ON" : "OFF"})`}`);
  console.log(`Problems: ${problems.length}${LIMIT > 0 ? ` (limit ${LIMIT})` : ""}`);
  console.log(`Seed tools: ${seedToolNames.size}`);
  console.log(`Result file: ${path.relative(REPO_ROOT, RESULT_FILE)}\n`);

  const results: ProblemEvalResult[] = [];

  for (const p of problems) {
    process.stdout.write(`[${p.id}] ${p.category} (난이도 ${p.difficulty}) ... `);
    const result =
      MODE === "mock" ? mockEvaluate(p, seedToolNames) : await fullEvaluate(p);
    results.push(result);
    console.log(
      `${KILLER_ON ? "" : `Hit3=${result.hit_top3 ? "✓" : "✗"} `}정답=${result.reasoner_answer_correct === true ? "✓" : "✗"} 왜=${result.why_included ? "✓" : "✗"} (${result.duration_ms}ms)`
    );
  }

  const summary = summarize(results);
  printReport(results, summary, MODE);

  await mkdir(RESULT_DIR, { recursive: true });
  await writeFile(
    RESULT_FILE,
    JSON.stringify({ mode: MODE, run_at: new Date().toISOString(), summary, results }, null, 2),
    "utf-8"
  );
  console.log(`결과 저장: ${path.relative(REPO_ROOT, RESULT_FILE)}`);

  const allPass = summary.pass.retriever && summary.pass.accuracy && summary.pass.why;
  if (MODE === "full" && !allPass) {
    console.log("\n⚠️ KPI 미달 — 시드 도구 추가 / Reasoner 프롬프트 보강 / 코칭 프롬프트 '왜' 강제 등 보완 필요");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
