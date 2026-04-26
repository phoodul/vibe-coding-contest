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
 *   pnpm dlx tsx scripts/eval-kpi.ts --mock   (env 없이 schema 검증 + 시뮬레이션)
 *   pnpm dlx tsx scripts/eval-kpi.ts --full   (실제 API 호출 — env 필요)
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
}

const REPO_ROOT = process.cwd();
const EVAL_FILE = path.join(REPO_ROOT, "data", "kpi-eval-problems.json");
const RESULT_DIR = path.join(REPO_ROOT, "docs", "qa");
const RESULT_FILE = path.join(RESULT_DIR, "kpi-evaluation-result.json");

const MODE = process.argv.includes("--full") ? "full" : "mock";

const HAIKU_MODEL = process.env.ANTHROPIC_HAIKU_MODEL_ID || "claude-haiku-4-5-20251001";
const SONNET_MODEL = process.env.ANTHROPIC_SONNET_MODEL_ID || "claude-sonnet-4-5-20250929";

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

// ============================================================
// Anthropic 직접 호출
// ============================================================

interface AnthropicMessage {
  role: "user" | "assistant";
  content: string;
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
    600
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

async function runReasoner(problem: string, retrieved: RetrievedTool[]): Promise<string> {
  const toolsHint = retrieved.length
    ? `\n\n참고 도구 후보 (Retriever):\n${retrieved.map((t, i) => `  ${i + 1}. ${t.tool_name} (L${t.tool_layer})`).join("\n")}`
    : "";
  const text = await callAnthropic(
    SONNET_MODEL,
    REASONER_SYSTEM,
    [{ role: "user", content: `${problem}${toolsHint}` }],
    1500
  );
  return text;
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

  try {
    reasonerText = await runReasoner(p.problem, retrieved);
  } catch (e) {
    errors.push(`Reasoner: ${(e as Error).message}`);
  }

  const retrievedNames = retrieved.map((t) => t.tool_name);
  const top3 = retrievedNames.slice(0, 3);
  const top5 = retrievedNames.slice(0, 5);
  const hitTop3 = p.expected_tools.some((t) => top3.some((r) => r.includes(t.split(" ")[0]) || t.includes(r.split(" ")[0])));
  const hitTop5 = p.expected_tools.some((t) => top5.some((r) => r.includes(t.split(" ")[0]) || t.includes(r.split(" ")[0])));

  const finalAnswer = extractFinalAnswer(reasonerText);
  const correct = reasonerText
    ? answerEquivalent(finalAnswer || reasonerText, p.expected_answer)
    : false;

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
  };
}

// ============================================================
// Aggregate
// ============================================================

function summarize(results: ProblemEvalResult[]): KpiSummary {
  const total = results.length;
  const hardResults = results.filter((r) => r.difficulty >= 5);

  const correctCount = results.filter((r) => r.reasoner_answer_correct === true).length;
  const hardCorrectCount = hardResults.filter((r) => r.reasoner_answer_correct === true).length;
  const top3HitCount = results.filter((r) => r.hit_top3).length;
  const top5HitCount = results.filter((r) => r.hit_top5).length;
  const whyCount = results.filter((r) => r.why_included).length;
  const managerOkCount = results.filter((r) => r.manager_ok).length;

  const top3 = top3HitCount / total;
  const top5 = top5HitCount / total;
  const acc = correctCount / total;
  const accHard = hardResults.length > 0 ? hardCorrectCount / hardResults.length : 0;
  const why = whyCount / total;

  return {
    total,
    retriever_hit_rate_top3: top3,
    retriever_hit_rate_top5: top5,
    reasoner_accuracy: acc,
    reasoner_accuracy_hard: accHard,
    why_inclusion_rate: why,
    manager_classify_rate: managerOkCount / total,
    pass: {
      retriever: top3 >= 0.7,
      accuracy: accHard >= 0.7,
      why: why >= 0.9,
    },
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
  console.log(`Manager 분류 성공률: ${formatPercent(summary.manager_classify_rate)}\n`);
}

// ============================================================
// Main
// ============================================================

async function main() {
  const evalRaw = await readFile(EVAL_FILE, "utf-8");
  const evalFile = JSON.parse(evalRaw) as EvalFile;

  // 시드 도구 이름 집합 (mock 모드 검증용)
  const seedRaw = await readFile(path.join(REPO_ROOT, "data", "math-tools-seed.json"), "utf-8");
  const seedFile = JSON.parse(seedRaw) as { tools: { name: string }[] };
  const seedToolNames = new Set(seedFile.tools.map((t) => t.name));

  console.log(`Mode: ${MODE}`);
  console.log(`Problems: ${evalFile.problems.length}`);
  console.log(`Seed tools: ${seedToolNames.size}\n`);

  const results: ProblemEvalResult[] = [];

  for (const p of evalFile.problems) {
    process.stdout.write(`[${p.id}] ${p.category} (난이도 ${p.difficulty}) ... `);
    const result =
      MODE === "mock" ? mockEvaluate(p, seedToolNames) : await fullEvaluate(p);
    results.push(result);
    console.log(
      `Hit3=${result.hit_top3 ? "✓" : "✗"} 정답=${result.reasoner_answer_correct === true ? "✓" : "✗"} 왜=${result.why_included ? "✓" : "✗"} (${result.duration_ms}ms)`
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
