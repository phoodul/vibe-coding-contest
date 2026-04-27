/**
 * Phase G-04 G04-5: similar_problems 인덱스 구축.
 *
 * 입력: user_docs/suneung-math/eval/killer-eval.json (58문항)
 * 출력: similar_problems 테이블 upsert (백엔드 RAG 한정, 학생 노출 X)
 *
 * 라벨 단위는 trigger 패턴 (Tool 의 본질은 trigger when, 정리 이름이 아님 —
 * project-decisions.md 의 G-04 결정).
 *
 * 비용: 58 × ($0.001 Haiku + $0.000013 OpenAI embed) ≈ $0.06
 *
 * 실행:
 *   pnpm dlx dotenv-cli -e .env -- pnpm dlx tsx scripts/build-similar-problems.ts
 *   --dry-run  : Haiku 호출만, DB upsert X
 *   --limit N  : 처음 N 문항만
 */
import fs from "node:fs/promises";
import path from "node:path";

interface KillerProblem {
  id: string;
  year: number;
  type: string;
  number: number;
  problem_latex: string;
  answer: string;
  is_multiple_choice: boolean;
}

interface TriggerLabel {
  direction: "forward" | "backward" | "both";
  condition_pattern?: string;
  goal_pattern?: string;
  why: string;
  tool_hint?: string;
}

const ROOT = process.cwd();
const DRY_RUN = process.argv.includes("--dry-run");
const LIMIT = (() => {
  const i = process.argv.indexOf("--limit");
  return i >= 0 && process.argv[i + 1] ? parseInt(process.argv[i + 1], 10) || 0 : 0;
})();
const PARALLEL = 5;

const HAIKU_MODEL = process.env.ANTHROPIC_HAIKU_MODEL_ID || "claude-haiku-4-5-20251001";

const TRIGGER_EXTRACT_SYSTEM = `당신은 한국 수능 수학 풀이를 분석하는 전문가입니다.
주어진 문제를 보고 **풀이 시 발동되어야 할 trigger 패턴 1~3개** 를 추출하세요.

## 핵심 원칙 (math_process.md ② / project-decisions.md G-04)
- Tool 의 본질은 **trigger 패턴(when)** 입니다. "평균값 정리" 같은 정리 이름이 아니라,
  "닫힌구간 연속+미분가능 → 평균변화율 일치하는 c 존재" 같은 **발동 조건** 이 진짜 학습 대상.
- forward trigger: 조건 → 발동 (예: "닫힌구간 연속 + 미분가능 → 평균변화율 일치")
- backward trigger: 목표 → 발동 (예: "f'(c)=k → 평균변화율 등치")
- why: 왜 그 정리/도구가 떠올라야 하는지 한 문장 — 도구 이름이 아닌 **수학적 직관**.
- tool_hint: 정리 이름은 부수 정보로만 (선택).

## 출력 (JSON only)
{
  "trigger_labels": [
    {
      "direction": "backward",
      "goal_pattern": "f 의 극값 합 구하기",
      "why": "극값 합 → 비에타 정리 또는 f'(x)=0 의 근의 합",
      "tool_hint": "1계 도함수 + 비에타"
    },
    ...
  ]
}

## 절대 원칙
- 1~3개로 제한. 모르거나 추측이면 빈 배열.
- 풀이 자체나 정답 추측 금지.
- tool_hint 는 선택 — 모호하면 비워두기.`;

async function callHaiku(problem: string): Promise<TriggerLabel[]> {
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
      model: HAIKU_MODEL,
      max_tokens: 600,
      system: TRIGGER_EXTRACT_SYSTEM,
      messages: [
        { role: "user", content: `문제:\n${problem}\n\nJSON 만 출력하세요.` },
      ],
    }),
  });
  if (!resp.ok) throw new Error(`Haiku ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
  const data = (await resp.json()) as { content: { type: string; text: string }[] };
  const text = data.content
    .filter((c) => c.type === "text")
    .map((c) => c.text)
    .join("");
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fence ? fence[1] : text.trim();
  try {
    const parsed = JSON.parse(candidate) as { trigger_labels?: TriggerLabel[] };
    return Array.isArray(parsed.trigger_labels) ? parsed.trigger_labels.slice(0, 3) : [];
  } catch {
    return [];
  }
}

async function embedText(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY missing");
  const resp = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text.trim().slice(0, 8000) || "(empty)",
    }),
  });
  if (!resp.ok) throw new Error(`OpenAI embed ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
  const data = (await resp.json()) as { data: { embedding: number[] }[] };
  return data.data[0].embedding;
}

interface UpsertRow {
  year: number;
  type: string;
  number: number;
  problem_latex: string;
  problem_embedding: number[];
  answer: string;
  trigger_labels: TriggerLabel[];
  source: string;
}

async function upsertSimilarProblem(row: UpsertRow): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env missing");
  const resp = await fetch(`${url}/rest/v1/similar_problems?on_conflict=year,type,number`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(row),
  });
  if (!resp.ok) {
    throw new Error(`upsert ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
  }
}

async function processOne(p: KillerProblem): Promise<{
  id: string;
  ok: boolean;
  triggers: number;
  error?: string;
}> {
  try {
    const [labels, embedding] = await Promise.all([
      callHaiku(p.problem_latex),
      embedText(p.problem_latex),
    ]);
    if (!DRY_RUN) {
      await upsertSimilarProblem({
        year: p.year,
        type: p.type,
        number: p.number,
        problem_latex: p.problem_latex,
        problem_embedding: embedding,
        answer: p.answer,
        trigger_labels: labels,
        source: "haiku_auto",
      });
    }
    return { id: p.id, ok: true, triggers: labels.length };
  } catch (e) {
    return { id: p.id, ok: false, triggers: 0, error: (e as Error).message };
  }
}

async function processBatch<T, R>(items: T[], n: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += n) {
    const slice = items.slice(i, i + n);
    const results = await Promise.all(slice.map(fn));
    out.push(...results);
    process.stdout.write(`  진행: ${out.length}/${items.length}\n`);
  }
  return out;
}

async function main() {
  const raw = await fs.readFile(
    path.join(ROOT, "user_docs/suneung-math/eval/killer-eval.json"),
    "utf-8",
  );
  let problems = (JSON.parse(raw) as { problems: KillerProblem[] }).problems;
  if (LIMIT > 0) problems = problems.slice(0, LIMIT);

  console.log(
    `\nbuild-similar-problems — ${DRY_RUN ? "DRY RUN" : "WRITE"} mode, ${problems.length} 문항 (parallel ${PARALLEL})\n`,
  );

  const start = Date.now();
  const results = await processBatch(problems, PARALLEL, processOne);
  const dur = ((Date.now() - start) / 1000).toFixed(1);

  const ok = results.filter((r) => r.ok).length;
  const totalTriggers = results.reduce((s, r) => s + r.triggers, 0);
  const failed = results.filter((r) => !r.ok);

  console.log(`\n========================================`);
  console.log(`완료: ${ok}/${results.length} 성공 / 실패 ${failed.length} (${dur}s)`);
  console.log(`총 trigger 라벨: ${totalTriggers} (avg ${(totalTriggers / Math.max(1, ok)).toFixed(2)}/문제)`);
  if (failed.length > 0) {
    console.log(`\n실패 목록:`);
    for (const f of failed.slice(0, 10)) console.log(`  ${f.id}: ${f.error}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
