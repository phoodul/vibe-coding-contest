/**
 * fix-eval-answers.ts
 * eval-true-number-mapping.json 의 shift_detected != 0 + answer mismatch 케이스를
 * sub-killer-eval.json 에 반영한다 (answer / expected_answer 두 필드 모두 갱신).
 *
 * 정정 정책: math-problems.ts 의 진짜 시험 번호 정답 (true_answer) 을 권위로 삼는다.
 * 마크다운 본문은 정확하지만, 본문 위 라벨(`12.`, `14.` 등)이 OCR 단계에서
 * 어긋난 결과 평가셋의 expected_answer 가 다른 문항의 정답을 들고 있게 된 경우를 정정.
 *
 * unmapped (true_test_number == null) 케이스는 본문 매칭 자체가 실패했으므로 건너뛰고
 * 콘솔에 보고만 한다 (수동 검증 후속 task).
 */

import * as fs from "fs";
import * as path from "path";

interface MappingRow {
  eval_id: string;
  killer_year: number;
  killer_area: string;
  killer_displayed_number: number;
  matched_md_line: number | null;
  matched_md_displayed_number: number | null;
  matched_md_label_index_in_area: number | null;
  true_test_number: number | null;
  true_answer_key: string | null;
  true_answer: string | null;
  eval_expected_answer: string;
  shift_detected: number | null;
}

interface EvalProblem {
  id: string;
  expected_answer: string;
  answer: string;
  killer_number: number;
  number: number;
  [k: string]: unknown;
}

interface EvalFile {
  version: number;
  count: number;
  problems: EvalProblem[];
  [k: string]: unknown;
}

const MAPPING_PATH = path.resolve(
  process.cwd(),
  "docs/qa/eval-true-number-mapping.json"
);
const EVAL_PATH = path.resolve(
  process.cwd(),
  "user_docs/suneung-math/eval/sub-killer-eval.json"
);

function main() {
  const rows: MappingRow[] = JSON.parse(fs.readFileSync(MAPPING_PATH, "utf8"));
  const evalRaw: EvalFile = JSON.parse(fs.readFileSync(EVAL_PATH, "utf8"));

  // mismatch = mapping 성공 + 실제 정답이 평가셋과 다름
  const mismatches = rows.filter(
    (r) =>
      r.true_test_number != null &&
      r.true_answer != null &&
      r.true_answer !== r.eval_expected_answer
  );
  const unmapped = rows.filter((r) => r.true_test_number == null);

  console.log(`총 ${rows.length}문항 / mismatch ${mismatches.length} / unmapped ${unmapped.length}`);
  console.log("\n[unmapped — 수동 검증 후속]");
  for (const u of unmapped) console.log(`  ${u.eval_id}`);

  console.log("\n[정정 적용]");
  const evalIndex = new Map(evalRaw.problems.map((p) => [p.id, p]));
  let applied = 0;
  for (const m of mismatches) {
    const p = evalIndex.get(m.eval_id);
    if (!p) {
      console.log(`  ! ${m.eval_id}: 평가셋에서 못 찾음`);
      continue;
    }
    const before = { expected_answer: p.expected_answer, answer: p.answer };
    p.expected_answer = m.true_answer!;
    p.answer = m.true_answer!;
    applied++;
    console.log(
      `  ✓ ${m.eval_id}: expected_answer ${before.expected_answer} → ${p.expected_answer} / answer ${before.answer} → ${p.answer}`
    );
  }

  // 메타데이터에 정정 노트 추가
  evalRaw.note =
    (evalRaw.note as string) +
    ` [v2 2026-05-02: ${applied}건 정답 정정 — Δ29 audit (마크다운 라벨 OCR 어긋남 보정).]`;
  evalRaw.version = 2;

  fs.writeFileSync(EVAL_PATH, JSON.stringify(evalRaw, null, 2) + "\n", "utf8");
  console.log(`\n[wrote] ${EVAL_PATH} (${applied}건 적용)`);
}

main();
