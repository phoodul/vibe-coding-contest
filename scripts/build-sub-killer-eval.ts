/**
 * Sub-killer 평가셋 추출 — 라마누잔 Tier 1 모델 결정용
 *
 * 출처:
 *   - 문제 본문: user_docs/suneung-math/parsed/{2022~2026}수능문제.md
 *   - 정답: src/lib/data/math-problems.ts (mathProblems)
 *
 * 평가셋 정의 (5년 × 10문항 = 50):
 *   - 공통: 6, 9, 12, 14번 (4문항 × 5년 = 20)
 *   - 미적분: 24, 26번 (2 × 5 = 10)
 *   - 기하: 25, 27번 (2 × 5 = 10)
 *   - 확률과통계: 25, 27번 (2 × 5 = 10)
 *
 * 출력: user_docs/suneung-math/eval/sub-killer-eval.json
 */
import fs from "node:fs";
import path from "node:path";
import { mathProblems } from "../src/lib/data/math-problems";

type ExamType = "공통" | "미적분" | "기하" | "확률과통계";

interface SubKillerProblem {
  id: string;
  year: number;
  type: ExamType;
  number: number;
  area_label: string;
  problem_latex: string;
  answer: string;
  is_multiple_choice: boolean;
}

const ROOT = process.cwd();

function findAnswer(year: number, type: string, number: number): string | null {
  const id = `${year}-${type}-${number}`;
  return mathProblems.find((p) => p.id === id)?.answer ?? null;
}

function isMultipleChoice(type: ExamType, number: number): boolean {
  if (type === "공통") return number <= 15; // 1~15 객관식, 16~22 주관식
  return number <= 28; // 선택과목 23~28 객관식, 29~30 주관식
}

/**
 * 마크다운 파싱 — 5개 섹션(공통 / 확률과 통계 / 미적분 / 기하)별 번호→본문 사전.
 * 첫 `선택과목(...)` 이전은 공통, 이후는 각 선택과목 헤더 기준.
 *
 * 예외: 2022 처럼 확통 헤더가 누락된 학년도는, 공통 섹션에서 23번 이상 번호가
 * 시작되면 (= 공통 22번 끝) 자동으로 확통 섹션으로 전환한다.
 *
 * 또한 정규식은 "25.숫자" 처럼 점 뒤 공백 누락 패턴도 포착해야 한다 (`\.\s?`).
 */
function parseMarkdown(year: number): Record<
  "공통" | "확률과통계" | "미적분" | "기하",
  Record<string, string>
> {
  const md = fs.readFileSync(
    path.join(ROOT, `user_docs/suneung-math/parsed/${year}수능문제.md`),
    "utf-8",
  );
  const lines = md.split("\n");
  const result: Record<string, Record<string, string>> = {
    공통: {},
    확률과통계: {},
    미적분: {},
    기하: {},
  };
  let cur: "공통" | "확률과통계" | "미적분" | "기하" = "공통";
  let curNum: string | null = null;
  let buf: string[] = [];

  function flush() {
    if (curNum && buf.length) {
      // 같은 섹션 내 동일 번호 중복 시 첫 번째 보존 (마크다운 노이즈 방어)
      if (!result[cur][curNum]) {
        result[cur][curNum] = buf.join("\n").trim();
      }
    }
    buf = [];
  }

  for (const line of lines) {
    // 선택과목 헤더 감지
    const m = line.match(/선택과목\((확률과 통계|미적분|기하)\)/);
    if (m) {
      flush();
      curNum = null;
      cur = m[1] === "확률과 통계" ? "확률과통계" : (m[1] as "미적분" | "기하");
      continue;
    }
    // 문제 번호 시작 (예: "6. ..." / "  24. ..." / "25.숫자")
    const numMatch = line.match(/^\s*(\d+)\.\s?/);
    if (numMatch) {
      flush();
      curNum = numMatch[1];
      // 헤더 없이 23번 이상이 공통 섹션에서 등장하면 확통 섹션으로 자동 전환 (2022 케이스)
      if (cur === "공통" && parseInt(curNum, 10) >= 23) {
        cur = "확률과통계";
      }
      buf = [line];
    } else if (curNum) {
      buf.push(line);
    }
  }
  flush();

  return result as Record<
    "공통" | "확률과통계" | "미적분" | "기하",
    Record<string, string>
  >;
}

const TARGETS: { type: ExamType; numbers: number[] }[] = [
  { type: "공통", numbers: [6, 9, 12, 14] },
  { type: "미적분", numbers: [24, 26] },
  { type: "기하", numbers: [25, 27] },
  { type: "확률과통계", numbers: [25, 27] },
];

const YEARS = [2022, 2023, 2024, 2025, 2026];

const problems: SubKillerProblem[] = [];
const failures: string[] = [];

for (const year of YEARS) {
  const parsed = parseMarkdown(year);
  for (const { type, numbers } of TARGETS) {
    const sset = parsed[type];
    if (!sset) {
      failures.push(`${year}-${type}: 섹션 자체 없음`);
      continue;
    }
    for (const n of numbers) {
      const body = sset[String(n)];
      const ans = findAnswer(year, type, n);
      if (!body) {
        failures.push(`${year}-${type}-${n}: 본문 추출 실패`);
        continue;
      }
      if (!ans) {
        failures.push(`${year}-${type}-${n}: 정답 매핑 실패`);
        continue;
      }
      problems.push({
        id: `${year}-${type}-${n}`,
        year,
        type,
        number: n,
        area_label: `${type}(2022~2026)`,
        problem_latex: body,
        answer: ans,
        is_multiple_choice: isMultipleChoice(type, n),
      });
    }
  }
}

problems.sort((a, b) => a.id.localeCompare(b.id));

// eval-kpi.ts 가 기대하는 EvalProblem schema 와 호환되도록 필드 추가
const enriched = problems.map((p) => ({
  // EvalProblem 필수 필드
  id: p.id,
  category: "killer", // killer 평가 모드 사용
  area: p.area_label,
  difficulty: p.type === "공통" ? 4 : 5, // 공통 6/9/12/14는 중등, 선택 24/26/25/27 은 준-killer
  problem: p.problem_latex,
  expected_answer: p.answer,
  expected_tools: [],
  expected_layers_used: [],
  rationale: `라마누잔 Tier 1 모델 결정용 sub-killer (${p.area_label}, ${p.number}번)`,
  // killer 메타
  is_multiple_choice: p.is_multiple_choice,
  killer_year: p.year,
  killer_type: p.type,
  killer_number: p.number,
  // 호환성용 필드
  year: p.year,
  type: p.type,
  number: p.number,
  area_label: p.area_label,
  problem_latex: p.problem_latex,
  answer: p.answer,
}));

const today = new Date().toISOString().split("T")[0];
const output = {
  version: 1,
  created_at: today,
  note: "라마누잔 Tier 1 모델 결정용 sub-killer 평가셋 — 2022~2026 수능 공통 6/9/12/14 + 미적분 24/26 + 기하 25/27 + 확률과통계 25/27. 출처: KICE 원본 (학습/평가 목적, 외부 배포 금지).",
  count: enriched.length,
  problems: enriched,
};

fs.mkdirSync(path.join(ROOT, "user_docs/suneung-math/eval"), { recursive: true });
fs.writeFileSync(
  path.join(ROOT, "user_docs/suneung-math/eval/sub-killer-eval.json"),
  JSON.stringify(output, null, 2),
);

console.log(`✅ sub-killer-eval.json: ${enriched.length} 문항 추출`);
if (failures.length) {
  console.log(`\n⚠️ 추출 실패 ${failures.length}건:`);
  for (const f of failures) console.log(`  - ${f}`);
}

const byArea: Record<string, number> = {};
for (const p of problems) {
  byArea[p.area_label] = (byArea[p.area_label] || 0) + 1;
}
console.log("\n영역별 분포:");
for (const [k, v] of Object.entries(byArea).sort()) {
  console.log(`  ${k}: ${v}`);
}

const objCount = problems.filter((p) => p.is_multiple_choice).length;
console.log(`\n객관식: ${objCount} / 주관식: ${problems.length - objCount}`);

console.log("\nID 목록 (spot check 용):");
for (const p of problems.slice(0, 5)) {
  console.log(`  ${p.id} → answer="${p.answer}" / mc=${p.is_multiple_choice} / body[:60]="${p.problem_latex.slice(0, 60).replace(/\n/g, " ")}..."`);
}
