/**
 * Killer 문제 평가셋 추출 — Phase G-04 task 1
 *
 * 출처:
 *   - 문제 본문: user_docs/suneung-math/parsed/all_problems.json + 2022~2026수능문제.md
 *   - 정답: src/lib/data/math-problems.ts (RAW_ANSWERS)
 *
 * 메인: 21번 + 29번 + 30번 (학년도 2017~2026, 가/나/공통/미적분/기하/확률과통계)
 * 보조: 28번 (별도 파일)
 *
 * 출력은 user_docs/suneung-math/eval/ — KICE 원문 git 추적 금지.
 *
 * unified JSON 의 23~30번 키 충돌(선택과목별로 같은 번호 덮어씀) 우회를 위해
 * 2022~2026 선택과목 29/30번은 .md 직접 파싱.
 */
import fs from "node:fs";
import path from "node:path";
import { mathProblems } from "../src/lib/data/math-problems";

interface AllProblemsJson {
  [key: string]: {
    year: number;
    type: string;
    problem_count: number;
    problems: Record<string, string>;
  };
}

type ExamType = "가형" | "나형" | "공통" | "미적분" | "기하" | "확률과통계";

type AreaLabel = "가형(2017~2021)" | "공통(2022~2026)" | "미적분(2022~2026)";

interface KillerProblem {
  id: string;
  year: number;
  type: ExamType;
  number: number;
  /** Phase G-05: 그룹 분리 통계용 — 2017~2021 가형 / 2022~2026 공통 / 2022~2026 미적분 */
  area_label: AreaLabel;
  problem_latex: string;
  answer: string;
  is_multiple_choice: boolean;
}

function areaLabelFor(year: number, type: ExamType): AreaLabel {
  if (year >= 2017 && year <= 2021) return "가형(2017~2021)";
  if (type === "미적분") return "미적분(2022~2026)";
  return "공통(2022~2026)";
}

const ROOT = process.cwd();
const ALL = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, "user_docs/suneung-math/parsed/all_problems.json"),
    "utf-8",
  ),
) as AllProblemsJson;

function findAnswer(year: number, type: string, number: number): string | null {
  const id = `${year}-${type}-${number}`;
  return mathProblems.find((p) => p.id === id)?.answer ?? null;
}

function isMultipleChoice(type: ExamType, number: number): boolean {
  if (type === "가형" || type === "나형") return number <= 21;
  if (type === "공통") return number <= 15;
  return number <= 28; // 선택 23~28 객관식, 29~30 주관식
}

const main: KillerProblem[] = [];
const extra: KillerProblem[] = [];

// Part 1: 2017~2021 가형만 → 21+28+29+30 (사용자 G-05 정정: 5개년 가형 4문항)
for (const year of [2017, 2018, 2019, 2020, 2021]) {
  const set = ALL[`${year}_가형`];
  if (!set) continue;
  for (const n of [21, 28, 29, 30] as const) {
    const body = set.problems[String(n)];
    const ans = findAnswer(year, "가형", n);
    if (!body || !ans) continue;
    main.push({
      id: `${year}-가형-${n}`,
      year,
      type: "가형",
      number: n,
      area_label: areaLabelFor(year, "가형"),
      problem_latex: body.trim(),
      answer: ans,
      is_multiple_choice: isMultipleChoice("가형", n),
    });
  }
}

// Part 2: 2022~2026 공통 21+22번 → unified JSON
for (const year of [2022, 2023, 2024, 2025, 2026]) {
  const set = ALL[`${year}_unified`];
  if (!set) continue;
  for (const n of [21, 22] as const) {
    const body = set.problems[String(n)];
    const ans = findAnswer(year, "공통", n);
    if (!body || !ans) continue;
    main.push({
      id: `${year}-공통-${n}`,
      year,
      type: "공통",
      number: n,
      area_label: areaLabelFor(year, "공통"),
      problem_latex: body.trim(),
      answer: ans,
      is_multiple_choice: isMultipleChoice("공통", n),
    });
  }
}

// Part 3: 2022~2026 선택과목 28/29/30 → md 파싱
function parseMarkdown(year: number): Record<
  "미적분" | "기하" | "확률과통계",
  Record<string, string>
> {
  const md = fs.readFileSync(
    path.join(ROOT, `user_docs/suneung-math/parsed/${year}수능문제.md`),
    "utf-8",
  );
  const lines = md.split("\n");
  const result: Record<string, Record<string, string>> = {};
  let cur: "확률과통계" | "미적분" | "기하" | null = null;
  let buf: string[] = [];
  let curNum: string | null = null;
  function flush() {
    if (cur && curNum && buf.length) {
      if (!result[cur]) result[cur] = {};
      if (!result[cur][curNum]) {
        result[cur][curNum] = buf.join("\n").trim();
      }
    }
    buf = [];
  }
  for (const line of lines) {
    const m = line.match(/선택과목\((확률과 통계|미적분|기하)\)/);
    if (m) {
      flush();
      curNum = null;
      cur = m[1] === "확률과 통계" ? "확률과통계" : (m[1] as "미적분" | "기하");
      continue;
    }
    if (!cur) continue;
    const numMatch = line.match(/^\s*(\d+)\.\s/);
    if (numMatch) {
      flush();
      curNum = numMatch[1];
      buf = [line];
    } else if (curNum) {
      buf.push(line);
    }
  }
  flush();
  return result as Record<
    "미적분" | "기하" | "확률과통계",
    Record<string, string>
  >;
}

// Part 3: 2022~2026 미적분 28+30 → md 파싱. 기하/확통은 메인 평가셋 X (G-05 결정)
for (const year of [2022, 2023, 2024, 2025, 2026]) {
  const parsed = parseMarkdown(year);
  const sset = parsed["미적분"];
  if (!sset) continue;
  for (const n of [28, 30] as const) {
    const body = sset[String(n)];
    const ans = findAnswer(year, "미적분", n);
    if (!body || !ans) continue;
    main.push({
      id: `${year}-미적분-${n}`,
      year,
      type: "미적분",
      number: n,
      area_label: areaLabelFor(year, "미적분"),
      problem_latex: body,
      answer: ans,
      is_multiple_choice: isMultipleChoice("미적분", n),
    });
  }
}

// (보조) 2017~2021 가형 29번 + 2022~2026 미적분 29번 + 기하/확통 28+30 → extra
for (const year of [2017, 2018, 2019, 2020, 2021]) {
  const set = ALL[`${year}_가형`];
  if (!set) continue;
  const b29 = set.problems["29"];
  const a29 = findAnswer(year, "가형", 29);
  if (b29 && a29) {
    extra.push({
      id: `${year}-가형-29`,
      year, type: "가형", number: 29,
      area_label: "미적분(2022~2026)",
      problem_latex: b29.trim(), answer: a29,
      is_multiple_choice: isMultipleChoice("가형", 29),
    });
  }
}
for (const year of [2022, 2023, 2024, 2025, 2026]) {
  const parsed = parseMarkdown(year);
  for (const subj of ["미적분", "기하", "확률과통계"] as const) {
    const sset = parsed[subj];
    if (!sset) continue;
    for (const n of subj === "미적분" ? [29] : [28, 29, 30]) {
      const body = sset[String(n)];
      const ans = findAnswer(year, subj, n);
      if (!body || !ans) continue;
      extra.push({
        id: `${year}-${subj}-${n}`,
        year, type: subj, number: n,
        area_label: subj === "미적분" ? "미적분(2022~2026)" : "공통(2022~2026)",
        problem_latex: body, answer: ans,
        is_multiple_choice: isMultipleChoice(subj, n),
      });
    }
  }
}

main.sort((a, b) => a.id.localeCompare(b.id));
extra.sort((a, b) => a.id.localeCompare(b.id));

const today = new Date().toISOString().split("T")[0];
const outMain = {
  version: 1,
  created_at: today,
  note: "수능 killer 평가셋 (메인) — 21+29+30번. 정답 자동 채점. 출처: KICE 원본 (학습/평가 목적, 외부 배포 금지).",
  count: main.length,
  problems: main,
};
const outExtra = {
  version: 1,
  created_at: today,
  note: "수능 killer 평가셋 (보조) — 28번. 메인 측정 후 회귀 검증용.",
  count: extra.length,
  problems: extra,
};
fs.writeFileSync(
  path.join(ROOT, "user_docs/suneung-math/eval/killer-eval.json"),
  JSON.stringify(outMain, null, 2),
);
fs.writeFileSync(
  path.join(ROOT, "user_docs/suneung-math/eval/killer-eval-extra.json"),
  JSON.stringify(outExtra, null, 2),
);

console.log(`✅ killer-eval.json: ${main.length} 문항 (메인 21+29+30)`);
console.log(`✅ killer-eval-extra.json: ${extra.length} 문항 (보조 28)`);

const byArea: Record<string, number> = {};
for (const p of main) {
  byArea[p.area_label] = (byArea[p.area_label] || 0) + 1;
}
console.log("\n영역 분포 (G-05):");
for (const [k, v] of Object.entries(byArea).sort()) {
  console.log(`  ${k}: ${v}`);
}

const byYear: Record<string, number> = {};
for (const p of main) {
  const k = `${p.year}-${p.type}-${p.number}`;
  byYear[k] = (byYear[k] || 0) + 1;
}
console.log("\n학년도-유형-번호 분포:");
for (const [k, v] of Object.entries(byYear).sort()) {
  console.log(`  ${k}: ${v}`);
}

const objCount = main.filter((p) => p.is_multiple_choice).length;
console.log(`\n객관식: ${objCount} / 주관식: ${main.length - objCount}`);
