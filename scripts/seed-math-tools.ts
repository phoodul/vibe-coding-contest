/**
 * Phase B-05 / Phase E (영역 확장): 시드 도구 적재 자동화 진입점.
 *
 * 동작:
 *   1) data/math-tools-seed.json (단일) **또는** data/math-tools-seed/*.json (디렉터리) 검증
 *   2) 저작권 차단 — data/textbook-corpus.txt 와 trigram Jaccard 비교 (>0.8 reject)
 *   3) 각 trigger 별 embedding (forward/backward) 생성
 *   4) Supabase math_tools / math_tool_triggers upsert
 *
 * 실행:
 *   pnpm dlx tsx scripts/seed-math-tools.ts --dry-run         (전체 검증)
 *   pnpm dlx tsx scripts/seed-math-tools.ts                    (전체 실 적재)
 *   pnpm dlx tsx scripts/seed-math-tools.ts --only=middle.json (특정 파일만)
 *
 * 환경변수:
 *   - OPENAI_API_KEY (embedding)
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY (실제 적재 시 필수, dry-run 에서는 skip)
 */

import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
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
  source: "parametric" | "curated" | "external" | "user";
  triggers: SeedTrigger[];
}

interface SeedFile {
  version: number;
  tools: SeedTool[];
}

const REPO_ROOT = process.cwd();
const SEED_FILE = path.join(REPO_ROOT, "data", "math-tools-seed.json");
const SEED_DIR = path.join(REPO_ROOT, "data", "math-tools-seed");
const CORPUS_FILE = path.join(REPO_ROOT, "data", "textbook-corpus.txt");
const SIMILARITY_THRESHOLD = 0.8;

function getOnlyFilter(): string | null {
  const arg = process.argv.find((a) => a.startsWith("--only="));
  return arg ? arg.slice("--only=".length) : null;
}

async function loadSeedFiles(only: string | null): Promise<{ file: string; seed: SeedFile }[]> {
  const out: { file: string; seed: SeedFile }[] = [];

  // 1) 디렉터리 모드 우선 (영역별 분리 관리 시)
  if (existsSync(SEED_DIR)) {
    const entries = (await readdir(SEED_DIR)).filter((f) => f.endsWith(".json")).sort();
    for (const f of entries) {
      if (only && f !== only) continue;
      const raw = await readFile(path.join(SEED_DIR, f), "utf8");
      out.push({ file: `seed/${f}`, seed: JSON.parse(raw) as SeedFile });
    }
  }

  // 2) 레거시 단일 파일 (있으면 함께)
  if (existsSync(SEED_FILE) && (!only || only === "math-tools-seed.json")) {
    const raw = await readFile(SEED_FILE, "utf8");
    out.push({ file: "math-tools-seed.json", seed: JSON.parse(raw) as SeedFile });
  }

  if (out.length === 0) {
    throw new Error(`no seed files found (looked at ${SEED_FILE} and ${SEED_DIR})`);
  }
  return out;
}

function trigrams(text: string): Set<string> {
  const norm = text.toLowerCase().replace(/\s+/g, " ").trim();
  const out = new Set<string>();
  for (let i = 0; i <= norm.length - 3; i++) out.add(norm.slice(i, i + 3));
  return out;
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / (a.size + b.size - inter);
}

async function loadCorpusGrams(): Promise<Set<string> | null> {
  if (!existsSync(CORPUS_FILE)) return null;
  const text = await readFile(CORPUS_FILE, "utf8");
  return trigrams(text);
}

function validateTool(t: SeedTool, idx: number): string[] {
  const errs: string[] = [];
  if (!t.id) errs.push(`[${idx}] id missing`);
  if (!t.name) errs.push(`[${idx}] name missing`);
  if (!t.formula_latex) errs.push(`[${idx}] formula_latex missing`);
  if (!Number.isInteger(t.knowledge_layer) || t.knowledge_layer < 1 || t.knowledge_layer > 6)
    errs.push(`[${idx}] knowledge_layer must be 1..6`);
  if (!Array.isArray(t.triggers) || t.triggers.length === 0)
    errs.push(`[${idx}] triggers empty`);
  for (const trig of t.triggers ?? []) {
    if (!trig.why) errs.push(`[${idx}] trigger why missing`);
    if (trig.direction === "forward" && !trig.condition)
      errs.push(`[${idx}] forward trigger needs condition`);
    if (trig.direction === "backward" && !trig.goal_pattern)
      errs.push(`[${idx}] backward trigger needs goal_pattern`);
  }
  return errs;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const only = getOnlyFilter();
  console.log(`[seed-math-tools] dry-run=${dryRun} only=${only ?? "(all)"}`);

  const files = await loadSeedFiles(only);
  console.log(`[seed-math-tools] loaded ${files.length} seed file(s):`);
  for (const { file, seed: s } of files) {
    console.log(`  - ${file}: ${s.tools.length} tools (version ${s.version})`);
  }

  // 단일 SeedFile 로 평탄화 (id 중복 시 마지막 승)
  const merged: SeedTool[] = [];
  const idIndex = new Map<string, string>();
  for (const { file, seed: s } of files) {
    for (const t of s.tools) {
      if (idIndex.has(t.id)) {
        console.error(
          `[seed-math-tools] duplicate id "${t.id}" in ${file} (already in ${idIndex.get(t.id)})`
        );
        process.exit(1);
      }
      idIndex.set(t.id, file);
      merged.push(t);
    }
  }
  const seedVersion = files[0]?.seed.version ?? 1;
  const seed: SeedFile = { version: seedVersion, tools: merged };
  console.log(`[seed-math-tools] merged total: ${seed.tools.length} tools`);

  // 1) 정합성 검증
  const allErrors: string[] = [];
  seed.tools.forEach((t, i) => allErrors.push(...validateTool(t, i)));
  if (allErrors.length) {
    console.error(`[seed-math-tools] ${allErrors.length} validation errors:`);
    allErrors.forEach((e) => console.error("  - " + e));
    process.exit(1);
  }
  console.log(`[seed-math-tools] ✓ validation passed`);

  // 2) 저작권 차단
  const corpusGrams = await loadCorpusGrams();
  if (corpusGrams) {
    let rejected = 0;
    for (const t of seed.tools) {
      const text = `${t.name}\n${t.formula_latex}\n${t.triggers.map((x) => x.why).join("\n")}`;
      const sim = jaccard(trigrams(text), corpusGrams);
      if (sim > SIMILARITY_THRESHOLD) {
        console.warn(
          `[seed-math-tools] ⚠ rejected ${t.id}: trigram Jaccard ${sim.toFixed(2)} > ${SIMILARITY_THRESHOLD}`
        );
        rejected++;
      }
    }
    if (rejected) {
      console.error(`[seed-math-tools] ${rejected} tools rejected by copyright filter`);
      process.exit(1);
    }
    console.log(`[seed-math-tools] ✓ copyright check passed`);
  } else {
    console.log(`[seed-math-tools] ℹ corpus file not found at ${CORPUS_FILE} — skipping copyright check`);
  }

  // 3) 통계
  const triggerCount = seed.tools.reduce((acc, t) => acc + t.triggers.length, 0);
  console.log(
    `[seed-math-tools] summary: ${seed.tools.length} tools / ${triggerCount} triggers (avg ${(triggerCount / seed.tools.length).toFixed(1)} per tool)`
  );

  if (dryRun) {
    console.log(`[seed-math-tools] dry-run done. no DB write.`);
    return;
  }

  // 4) 실제 적재 — service role 필요
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!url || !serviceKey || !openaiKey) {
    console.error(
      `[seed-math-tools] env missing — need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY + OPENAI_API_KEY`
    );
    process.exit(1);
  }

  const { createClient } = await import("@supabase/supabase-js");
  const { embedBatch } = await import("../src/lib/euler/embed");
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  // 4-a) math_tools upsert
  const toolRows = seed.tools.map((t) => ({
    id: t.id,
    name: t.name,
    knowledge_layer: t.knowledge_layer,
    formula_latex: t.formula_latex,
    prerequisites: t.prerequisites ?? [],
    source: t.source,
    source_meta: { tier: 1, seed_version: seed.version },
  }));
  const { error: toolErr } = await supabase
    .from("math_tools")
    .upsert(toolRows, { onConflict: "id" });
  if (toolErr) {
    console.error(`[seed-math-tools] math_tools upsert failed:`, toolErr);
    process.exit(1);
  }
  console.log(`[seed-math-tools] ✓ math_tools upserted (${toolRows.length})`);

  // 4-b) trigger embeddings + insert
  const triggerJobs: { tool_id: string; trig: SeedTrigger; fwdText: string; bwdText: string }[] = [];
  for (const t of seed.tools) {
    for (const trig of t.triggers) {
      const fwdText = [trig.condition, trig.derived_fact, trig.why].filter(Boolean).join(" / ");
      const bwdText = [trig.goal_pattern, ...(trig.premises ?? []), trig.why].filter(Boolean).join(" / ");
      triggerJobs.push({ tool_id: t.id, trig, fwdText, bwdText });
    }
  }
  console.log(`[seed-math-tools] embedding ${triggerJobs.length * 2} texts...`);
  const fwdVecs = await embedBatch(triggerJobs.map((j) => j.fwdText));
  const bwdVecs = await embedBatch(triggerJobs.map((j) => j.bwdText));

  const triggerRows = triggerJobs.map((j, i) => ({
    tool_id: j.tool_id,
    direction: j.trig.direction,
    trigger_condition: j.trig.condition ?? "",
    derived_fact: j.trig.derived_fact ?? null,
    goal_pattern: j.trig.goal_pattern ?? null,
    required_premises: j.trig.premises ?? [],
    why_text: j.trig.why,
    embedding_forward: fwdVecs[i],
    embedding_backward: bwdVecs[i],
  }));

  // tool_id 단위로 한 번 비우고 새로 적재 (멱등)
  const distinctIds = Array.from(new Set(triggerJobs.map((j) => j.tool_id)));
  const { error: delErr } = await supabase
    .from("math_tool_triggers")
    .delete()
    .in("tool_id", distinctIds);
  if (delErr) {
    console.error(`[seed-math-tools] trigger delete failed:`, delErr);
    process.exit(1);
  }
  const { error: trigErr } = await supabase.from("math_tool_triggers").insert(triggerRows);
  if (trigErr) {
    console.error(`[seed-math-tools] trigger insert failed:`, trigErr);
    process.exit(1);
  }
  console.log(`[seed-math-tools] ✓ math_tool_triggers inserted (${triggerRows.length})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
