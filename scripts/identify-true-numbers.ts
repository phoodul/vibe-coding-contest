/**
 * identify-true-numbers.ts
 * sub-killer-eval.json 의 50문항을 마크다운 라인으로 매핑하고,
 * 영역별 등장 순서로 진짜 시험 번호를 추론한 뒤 math-problems.ts 의 정답을 가져온다.
 *
 * 출력: docs/qa/eval-true-number-mapping.json
 */

import * as fs from "fs";
import * as path from "path";
import { pathToFileURL } from "url";

type Area = "공통" | "확률과통계" | "미적분" | "기하";

interface AreaSlice {
  area: Area;
  startLine: number;
  endLine: number;
  numbers: { displayed: number; line: number }[];
}

const PARSED_DIR = path.resolve(
  process.cwd(),
  "user_docs/suneung-math/parsed"
);
const EVAL_PATH = path.resolve(
  process.cwd(),
  "user_docs/suneung-math/eval/sub-killer-eval.json"
);

function detectAreaFromConfirmBlock(text: string): Area | null {
  if (text.includes("선택과목(미적분)")) return "미적분";
  if (text.includes("선택과목(기하)")) return "기하";
  if (text.includes("선택과목(확률과 통계)") || text.includes("선택과목(확률과통계)"))
    return "확률과통계";
  return null;
}

function sliceFile(lines: string[]): AreaSlice[] {
  let cut = lines.length;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === "[^0]") {
      cut = i;
      break;
    }
  }
  const lines0 = lines.slice(0, cut);

  const confirmIdx: number[] = [];
  for (let i = 0; i < lines0.length; i++) {
    if (lines0[i].startsWith("## * 확인 사항")) confirmIdx.push(i);
  }

  const slices: AreaSlice[] = [];
  const firstEnd = confirmIdx.length > 0 ? confirmIdx[0] - 1 : lines0.length - 1;
  slices.push({
    area: "공통",
    startLine: 1,
    endLine: firstEnd + 1,
    numbers: [],
  });

  for (let k = 0; k < confirmIdx.length; k++) {
    const blockStart = confirmIdx[k];
    let blockEnd = lines0.length - 1;
    for (let j = blockStart + 1; j < lines0.length; j++) {
      if (lines0[j].startsWith("## 5지선다형")) {
        blockEnd = j - 1;
        break;
      }
    }
    const blockText = lines0.slice(blockStart, blockEnd + 1).join("\n");
    const area = detectAreaFromConfirmBlock(blockText);
    if (!area) continue;

    const sectionStart = blockEnd + 1;
    const sectionEnd =
      k + 1 < confirmIdx.length ? confirmIdx[k + 1] - 1 : lines0.length - 1;

    slices.push({
      area,
      startLine: sectionStart + 1,
      endLine: sectionEnd + 1,
      numbers: [],
    });
  }

  const numRe = /^(\d+)\.\s/;
  for (const s of slices) {
    for (let i = s.startLine - 1; i <= s.endLine - 1 && i < lines0.length; i++) {
      const m = lines0[i].match(numRe);
      if (m) {
        s.numbers.push({ displayed: parseInt(m[1], 10), line: i + 1 });
      }
    }
  }

  return slices;
}

/** 영역의 등장 순서 + 시작번호로 진짜 시험 번호를 계산 */
function trueNumberFromIndex(area: Area, indexInArea: number): number {
  const start = area === "공통" ? 1 : 23;
  return start + indexInArea;
}

/** 평가셋 problem_latex 의 첫 본문 30~80자(번호/공백/LaTeX 제거 후) 추출 */
function extractKeyText(latex: string): string {
  // 번호 prefix 제거: "12. " 같은 패턴
  let s = latex.replace(/^\d+\.\s*/, "");
  // 줄바꿈/탭 정리
  s = s.replace(/\r\n|\n|\r|\t/g, " ").trim();
  // LaTeX 명령어/괄호는 검색에 방해되므로 한글/숫자/괄호 위주로 처음 60자만
  return s.slice(0, 80);
}

/** 마크다운에서 핵심 텍스트가 등장하는 첫 라인 찾기 */
function findLineForKeyText(
  mdLines: string[],
  keyText: string,
  area: Area | null = null,
  slices: AreaSlice[] = []
): number | null {
  // keyText 의 일부 substring 들로 시도 (앞 40, 30, 20자)
  const candidates = [
    keyText.slice(0, 60),
    keyText.slice(0, 40),
    keyText.slice(0, 25),
  ];
  // 각 후보를 정규화 (공백 압축)
  const normalize = (x: string) => x.replace(/\s+/g, " ").trim();
  const normLines = mdLines.map(normalize);
  // 영역이 주어지면 해당 슬라이스 범위 우선 검색
  const ranges: [number, number][] = [];
  if (area) {
    for (const s of slices) if (s.area === area) ranges.push([s.startLine - 1, s.endLine - 1]);
  }
  ranges.push([0, mdLines.length - 1]); // fallback

  for (const cand of candidates) {
    const nc = normalize(cand);
    if (nc.length < 8) continue;
    for (const [lo, hi] of ranges) {
      for (let i = lo; i <= hi && i < mdLines.length; i++) {
        if (normLines[i].includes(nc)) return i + 1;
      }
    }
  }
  return null;
}

interface MathProblem {
  id: string;
  year: number;
  type: string;
  number: number;
  answer: string;
  isMultipleChoice: boolean;
}

/** math-problems.ts 의 RAW_ANSWERS 를 직접 임포트해서 정답표 빌드 */
async function loadAnswers(): Promise<Map<string, string>> {
  const abs = path.resolve(process.cwd(), "src/lib/data/math-problems.ts");
  const mod = await import(pathToFileURL(abs).href);
  const map = new Map<string, string>();
  for (const p of mod.mathProblems as MathProblem[]) {
    map.set(`${p.year}-${p.type}-${p.number}`, p.answer);
  }
  return map;
}

interface EvalProblem {
  id: string;
  area: string;
  area_label: string;
  killer_year: number;
  killer_type: string;
  killer_number: number;
  problem_latex: string;
  expected_answer: string;
  is_multiple_choice: boolean;
}

interface MappingRow {
  eval_id: string;
  killer_year: number;
  killer_area: Area;
  killer_displayed_number: number;
  matched_md_line: number | null;
  matched_md_displayed_number: number | null;
  matched_md_label_index_in_area: number | null;
  true_test_number: number | null;
  true_answer_key: string | null;
  true_answer: string | null;
  eval_expected_answer: string;
  shift_detected: number | null; // killer_displayed_number - true_test_number
}

async function main() {
  const evalRaw = JSON.parse(fs.readFileSync(EVAL_PATH, "utf8"));
  const evalProblems: EvalProblem[] = evalRaw.problems;
  const answerMap = await loadAnswers();

  // 연도별 마크다운 슬라이스 캐시
  const yearSlices = new Map<number, { lines: string[]; slices: AreaSlice[] }>();
  for (const year of [2022, 2023, 2024, 2025, 2026]) {
    const fp = path.join(PARSED_DIR, `${year}수능문제.md`);
    const lines = fs.readFileSync(fp, "utf8").split(/\r?\n/);
    const slices = sliceFile(lines);
    yearSlices.set(year, { lines, slices });
  }

  const rows: MappingRow[] = [];
  for (const p of evalProblems) {
    // killer_type 정규화
    let area: Area = "공통";
    if (p.killer_type === "미적분") area = "미적분";
    else if (p.killer_type === "기하") area = "기하";
    else if (p.killer_type === "확률과통계") area = "확률과통계";
    else area = "공통";

    const yearData = yearSlices.get(p.killer_year);
    if (!yearData) {
      rows.push({
        eval_id: p.id,
        killer_year: p.killer_year,
        killer_area: area,
        killer_displayed_number: p.killer_number,
        matched_md_line: null,
        matched_md_displayed_number: null,
        matched_md_label_index_in_area: null,
        true_test_number: null,
        true_answer_key: null,
        true_answer: null,
        eval_expected_answer: p.expected_answer,
        shift_detected: null,
      });
      continue;
    }

    const keyText = extractKeyText(p.problem_latex);
    const matchedLine = findLineForKeyText(
      yearData.lines,
      keyText,
      area,
      yearData.slices
    );

    let matchedDisplayed: number | null = null;
    let labelIdx: number | null = null;
    let trueNumber: number | null = null;
    if (matchedLine != null) {
      const slice = yearData.slices.find((s) => s.area === area);
      if (slice) {
        // 매칭 라인 이상에서 가장 가까운(작거나 같은) numbers[i].line 찾기
        // 즉 그 라벨이 매칭 라인을 포함하는 문제의 라벨
        let chosen: { displayed: number; line: number } | null = null;
        let chosenIdx = -1;
        for (let i = 0; i < slice.numbers.length; i++) {
          if (slice.numbers[i].line <= matchedLine) {
            chosen = slice.numbers[i];
            chosenIdx = i;
          } else break;
        }
        if (chosen) {
          matchedDisplayed = chosen.displayed;
          labelIdx = chosenIdx;
          trueNumber = trueNumberFromIndex(area, chosenIdx);
        }
      }
    }

    let trueAnswer: string | null = null;
    let trueKey: string | null = null;
    if (trueNumber != null) {
      // math-problems.ts type 명: 공통/확률과통계/미적분/기하
      const tType =
        area === "확률과통계" ? "확률과통계" : area === "미적분" ? "미적분" : area === "기하" ? "기하" : "공통";
      trueKey = `${p.killer_year}-${tType}-${trueNumber}`;
      trueAnswer = answerMap.get(trueKey) ?? null;
    }

    rows.push({
      eval_id: p.id,
      killer_year: p.killer_year,
      killer_area: area,
      killer_displayed_number: p.killer_number,
      matched_md_line: matchedLine,
      matched_md_displayed_number: matchedDisplayed,
      matched_md_label_index_in_area: labelIdx,
      true_test_number: trueNumber,
      true_answer_key: trueKey,
      true_answer: trueAnswer,
      eval_expected_answer: p.expected_answer,
      shift_detected:
        trueNumber != null ? p.killer_number - trueNumber : null,
    });
  }

  const outPath = path.resolve(
    process.cwd(),
    "docs/qa/eval-true-number-mapping.json"
  );
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(rows, null, 2), "utf8");
  console.log(`[map] wrote ${outPath}`);

  // 콘솔 요약
  let unmapped = 0;
  let shiftCount = 0;
  let answerMismatch = 0;
  for (const r of rows) {
    if (r.true_test_number == null) {
      unmapped++;
      console.log(`UNMAPPED: ${r.eval_id}`);
    } else if (r.shift_detected !== 0) {
      shiftCount++;
      console.log(
        `SHIFT(${r.shift_detected}): ${r.eval_id} → true=${r.true_answer_key} ans=${r.true_answer} (eval ans=${r.eval_expected_answer})`
      );
    }
    if (r.true_answer != null && r.true_answer !== r.eval_expected_answer) {
      answerMismatch++;
    }
  }
  console.log(
    `\nSummary: ${rows.length} total, unmapped=${unmapped}, shifted=${shiftCount}, eval-vs-true-answer mismatches=${answerMismatch}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
