/**
 * Phase G-03 Track 2: trigger 자동 보강.
 *
 * 동작:
 *   - data/math-tools-seed/ 의 영역별 JSON 파일을 읽음
 *   - 도구당 기존 trigger 수 < target (기본 2) 인 도구만 골라 LLM(Haiku) 으로 보완 trigger 1개씩 생성
 *   - direction 은 기존 trigger 와 반대 방향 우선 (forward 1개만 있으면 backward 추가)
 *   - 같은 파일에 in-place 덮어쓰기 (--write 플래그) / 기본은 dry-run
 *
 * 실행:
 *   pnpm dlx dotenv-cli -e .env -- pnpm dlx tsx scripts/augment-triggers.ts                  (dry-run)
 *   pnpm dlx dotenv-cli -e .env -- pnpm dlx tsx scripts/augment-triggers.ts --write          (실제 갱신)
 *   pnpm dlx dotenv-cli -e .env -- pnpm dlx tsx scripts/augment-triggers.ts --only=math2.json (특정 파일만)
 *   pnpm dlx dotenv-cli -e .env -- pnpm dlx tsx scripts/augment-triggers.ts --target=2       (목표 trigger 수)
 *
 * 환경변수: ANTHROPIC_API_KEY (필수)
 *
 * 비용 추정: 영역별 ~30 도구 × ~$0.005/도구 (Haiku) ≈ $0.15/영역, 전체 < $1
 *
 * 후속:
 *   생성된 JSON 을 commit → `pnpm dlx tsx scripts/seed-math-tools.ts` 로 DB 임베딩 갱신
 */

import { readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";

interface SeedTrigger {
  direction: "forward" | "backward" | "both";
  condition?: string;
  derived_fact?: string;
  goal_pattern?: string;
  premises?: string[];
  why: string;
}

interface SeedTool {
  id: string;
  name: string;
  knowledge_layer: number;
  formula_latex: string;
  prerequisites?: string[];
  source: string;
  triggers: SeedTrigger[];
}

interface SeedFile {
  version: number;
  area?: string;
  tools: SeedTool[];
  [key: string]: unknown;
}

const REPO_ROOT = process.cwd();
const SEED_DIR = path.join(REPO_ROOT, "data", "math-tools-seed");
const HAIKU_MODEL = process.env.ANTHROPIC_HAIKU_MODEL_ID || "claude-haiku-4-5-20251001";

function getArg(name: string): string | null {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  return arg ? arg.slice(`--${name}=`.length) : null;
}

const WRITE = process.argv.includes("--write");
const ONLY = getArg("only");
const TARGET = parseInt(getArg("target") ?? "2", 10);

interface AugmentJson {
  direction: "forward" | "backward";
  condition?: string;
  derived_fact?: string;
  goal_pattern?: string;
  premises?: string[];
  why: string;
}

const SYSTEM_PROMPT = `당신은 한국 수학 (수능·내신) 도구 라이브러리 큐레이터입니다.
주어진 수학 도구(정리·공식)에 **기존 trigger 와 반대 방향의 새 trigger 1개**를 JSON 으로 생성하세요.

규칙:
- direction: "forward" 면 condition + derived_fact + why 필요. "backward" 면 goal_pattern + premises + why 필요.
- forward = "조건 → 새 사실 도출" (학생이 가진 정보로 진행)
- backward = "목표 → 거꾸로 필요한 것 추정" (역행 분해)
- condition / goal_pattern: 학생 입장에서 이 도구를 떠올릴 단서 (자연어 한 줄)
- derived_fact: forward 시 새로 알게 되는 사실
- premises: backward 시 이 목표로 가려면 갖춰야 할 조건들 (배열)
- why: 왜 이 도구가 그 방향으로 작동하는지 (한 줄)

기존 trigger 와 의미가 겹치지 않게, 다른 학습 시점·다른 패턴을 노려야 합니다.
교과서 원문 인용 금지 — 본인의 자연어 설명으로 작성.

출력은 JSON only:
{ "direction": "...", "condition": "...", "derived_fact": "...", "goal_pattern": "...", "premises": [...], "why": "..." }
`;

async function callHaiku(prompt: string): Promise<string> {
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
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!resp.ok) {
    throw new Error(`Anthropic ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
  }
  const data = (await resp.json()) as { content: { type: string; text: string }[] };
  return data.content
    .filter((c) => c.type === "text")
    .map((c) => c.text)
    .join("");
}

function parseJson<T>(text: string): T | null {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fence ? fence[1] : trimmed;
  try {
    return JSON.parse(candidate) as T;
  } catch {
    return null;
  }
}

function existingDirections(t: SeedTool): Set<"forward" | "backward"> {
  const out = new Set<"forward" | "backward">();
  for (const tr of t.triggers ?? []) {
    if (tr.direction === "forward" || tr.direction === "both") out.add("forward");
    if (tr.direction === "backward" || tr.direction === "both") out.add("backward");
  }
  return out;
}

function buildPrompt(t: SeedTool, wantDirection: "forward" | "backward"): string {
  const triggerSummary = t.triggers
    .map(
      (tr, i) =>
        `  ${i + 1}. [${tr.direction}] cond="${tr.condition ?? ""}" goal="${tr.goal_pattern ?? ""}" why="${tr.why}"`
    )
    .join("\n");
  return `도구:
- id: ${t.id}
- name: ${t.name}
- formula: ${t.formula_latex}
- knowledge_layer: ${t.knowledge_layer}
- prerequisites: ${(t.prerequisites ?? []).join(", ") || "(none)"}
기존 trigger:
${triggerSummary}

위 도구에 새 ${wantDirection} trigger 1개를 JSON 으로 생성하세요. 기존과 의미가 겹치지 않게.`;
}

function validateAugment(j: AugmentJson, want: "forward" | "backward"): string | null {
  if (j.direction !== want) return `direction mismatch: got ${j.direction}`;
  if (!j.why) return "why missing";
  if (want === "forward" && !j.condition) return "forward needs condition";
  if (want === "backward" && !j.goal_pattern) return "backward needs goal_pattern";
  return null;
}

async function augmentOne(
  t: SeedTool,
  want: "forward" | "backward"
): Promise<SeedTrigger | null> {
  const text = await callHaiku(buildPrompt(t, want));
  const j = parseJson<AugmentJson>(text);
  if (!j) {
    console.warn(`  ✗ ${t.id}: JSON parse failed`);
    return null;
  }
  const err = validateAugment(j, want);
  if (err) {
    console.warn(`  ✗ ${t.id}: ${err}`);
    return null;
  }
  return {
    direction: j.direction,
    condition: j.condition,
    derived_fact: j.derived_fact,
    goal_pattern: j.goal_pattern,
    premises: j.premises,
    why: j.why,
  };
}

async function processFile(file: string): Promise<{ added: number; failed: number }> {
  const fp = path.join(SEED_DIR, file);
  const raw = await readFile(fp, "utf8");
  const seed = JSON.parse(raw) as SeedFile;

  const candidates: { tool: SeedTool; want: "forward" | "backward" }[] = [];
  for (const t of seed.tools) {
    if (t.triggers.length >= TARGET) continue;
    const dirs = existingDirections(t);
    // 우선순위: 반대 방향이 빠진 경우
    if (!dirs.has("backward")) candidates.push({ tool: t, want: "backward" });
    else if (!dirs.has("forward")) candidates.push({ tool: t, want: "forward" });
  }

  console.log(`\n[${file}] ${seed.tools.length} tools, ${candidates.length} need augmentation (target ${TARGET})`);

  let added = 0;
  let failed = 0;

  // 5개씩 병렬 (rate limit 회피)
  for (let i = 0; i < candidates.length; i += 5) {
    const batch = candidates.slice(i, i + 5);
    const results = await Promise.all(
      batch.map(async (c) => {
        try {
          return { c, trigger: await augmentOne(c.tool, c.want) };
        } catch (e) {
          console.warn(`  ✗ ${c.tool.id}: ${(e as Error).message}`);
          return { c, trigger: null };
        }
      })
    );
    for (const { c, trigger } of results) {
      if (!trigger) {
        failed++;
        continue;
      }
      c.tool.triggers.push(trigger);
      added++;
      console.log(`  + ${c.tool.id} [${c.want}]: "${trigger.condition ?? trigger.goal_pattern}"`);
    }
  }

  if (WRITE && added > 0) {
    await writeFile(fp, JSON.stringify(seed, null, 2) + "\n", "utf8");
    console.log(`  ✓ wrote ${file} (+${added} triggers)`);
  } else if (added > 0) {
    console.log(`  (dry-run) would add ${added} triggers to ${file}`);
  }

  return { added, failed };
}

async function main() {
  console.log(`[augment-triggers] write=${WRITE} only=${ONLY ?? "(all)"} target=${TARGET}`);
  const entries = (await readdir(SEED_DIR)).filter((f) => f.endsWith(".json")).sort();
  const targets = ONLY ? entries.filter((f) => f === ONLY) : entries;
  if (!targets.length) {
    console.error("No matching files");
    process.exit(1);
  }

  let totalAdded = 0;
  let totalFailed = 0;
  for (const f of targets) {
    const { added, failed } = await processFile(f);
    totalAdded += added;
    totalFailed += failed;
  }

  console.log(`\n[augment-triggers] DONE — added=${totalAdded} failed=${totalFailed} (write=${WRITE})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
