/**
 * G-06 일회성 재채점 스크립트
 *
 * Sonnet baseline (geometry, sub-killer 35건 중 15건 parse_error) 케이스를
 * Haiku judge 로 다시 채점해 "진짜 Sonnet 정답률" 을 산출한다.
 *
 * 입력:
 *   - docs/qa/kpi-evaluation-geometry-sonnet-baseline.json (parse_error=true 만 추출)
 *   - user_docs/suneung-math/eval/sub-killer-eval.json (problem_latex + answer)
 *
 * 출력:
 *   - docs/qa/sonnet-rejudge-15-cases.json
 *
 * 실행:
 *   pnpm dlx dotenv-cli -e .env -- pnpm dlx tsx scripts/rejudge-parse-errors.ts
 */

import { readFile, writeFile } from "node:fs/promises";

const HAIKU_MODEL = process.env.ANTHROPIC_HAIKU_MODEL_ID || "claude-haiku-4-5-20251001";

interface SonnetResult {
  id: string;
  reasoner_text: string;
  reasoner_answer_correct: boolean;
  parse_error?: boolean;
  area_label?: string;
  model_used?: string;
}

interface SonnetReport {
  results: SonnetResult[];
}

interface EvalProblem {
  id: string;
  problem_latex?: string;
  problem?: string;
  answer: string;
}

interface EvalFile {
  problems: EvalProblem[];
}

interface JudgeResult {
  id: string;
  expected: string;
  sonnet_answer: string;
  matched_choice: string;
  is_correct: boolean;
  reasoning: string;
}

async function callAnthropic(
  model: string,
  system: string,
  userContent: string,
  maxTokens = 200,
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
      messages: [{ role: "user", content: userContent }],
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

function tryParseJson(raw: string): { extracted_answer?: string; matched_choice?: string; reasoning?: string } | null {
  // ```json ... ``` 블록 추출
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : raw;
  // 첫 { ... } 블록
  const objMatch = candidate.match(/\{[\s\S]*\}/);
  if (!objMatch) return null;
  try {
    return JSON.parse(objMatch[0]);
  } catch {
    return null;
  }
}

const SYSTEM = `당신은 한국 수능 수학 객관식 자동 채점 보조입니다. 학생 풀이의 최종 답을 추출하고, 그 값이 보기 ①~⑤ 중 어느 것과 같은지 판단하여 JSON 으로만 답하세요. 추측·계산은 하지 말고, 학생이 명시한 답에만 의존하세요.`;

async function judgeOne(problemLatex: string, sonnetTail: string): Promise<JudgeResult["reasoning"] | { extracted_answer: string; matched_choice: string; reasoning: string }> {
  const userPrompt = `다음 객관식 수학 문제와 학생 풀이의 마지막 부분을 비교해 정답 보기 번호를 판단하세요.

## 문제 (보기 ①~⑤ 포함)
${problemLatex}

## 학생 풀이 마지막 부분 (정답이 명시된 영역)
${sonnetTail}

## 작업
1. 학생이 도출한 최종 답을 추출 (실제 값으로 표현됨, 예: "3/2", "ㄱ, ㄷ", "12")
2. 그 값이 보기 (1)~(5) 중 어느 것과 일치하는지 판단
3. 정답 보기 번호만 1~5 중 하나의 숫자로 답. 학생 답이 어떤 보기와도 명확히 매핑되지 않으면 "?"

## 응답 (JSON only, 다른 글자·코드펜스 금지)
{ "extracted_answer": "<학생이 도출한 실제 값>", "matched_choice": "<1|2|3|4|5|?>", "reasoning": "<1줄 한국어>" }`;

  const raw = await callAnthropic(HAIKU_MODEL, SYSTEM, userPrompt, 250);
  const parsed = tryParseJson(raw);
  if (!parsed || !parsed.matched_choice) {
    return {
      extracted_answer: "(parse failed)",
      matched_choice: "?",
      reasoning: `judge raw: ${raw.slice(0, 120)}`,
    };
  }
  return {
    extracted_answer: String(parsed.extracted_answer ?? ""),
    matched_choice: String(parsed.matched_choice),
    reasoning: String(parsed.reasoning ?? ""),
  };
}

async function main() {
  const reportRaw = await readFile("docs/qa/kpi-evaluation-geometry-sonnet-baseline.json", "utf8");
  const report = JSON.parse(reportRaw) as SonnetReport | { results: SonnetResult[] };
  const arr: SonnetResult[] = Array.isArray((report as unknown as { results: SonnetResult[] }).results)
    ? (report as { results: SonnetResult[] }).results
    : (report as unknown as SonnetResult[]);

  const evalRaw = await readFile("user_docs/suneung-math/eval/sub-killer-eval.json", "utf8");
  const evalFile = JSON.parse(evalRaw) as EvalFile;

  const parseErrs = arr.filter((x) => x.parse_error);
  console.log(`parse_error 케이스 ${parseErrs.length}건 발견`);

  const results: JudgeResult[] = [];

  for (const s of parseErrs) {
    const p = evalFile.problems.find((x) => x.id === s.id);
    if (!p) {
      console.warn(`[skip] eval 평가셋에 ${s.id} 없음`);
      continue;
    }
    const problemLatex = p.problem_latex || p.problem || "";
    const sonnetTail = (s.reasoner_text || "").slice(-700);

    process.stdout.write(`  ${s.id} ... `);
    let judged: { extracted_answer: string; matched_choice: string; reasoning: string };
    try {
      judged = (await judgeOne(problemLatex, sonnetTail)) as { extracted_answer: string; matched_choice: string; reasoning: string };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`FAIL (${msg})`);
      results.push({
        id: s.id,
        expected: String(p.answer),
        sonnet_answer: "(judge error)",
        matched_choice: "?",
        is_correct: false,
        reasoning: msg,
      });
      continue;
    }
    const expected = String(p.answer);
    const isCorrect = judged.matched_choice === expected;
    console.log(`expected=${expected}, judged=${judged.matched_choice} ${isCorrect ? "OK" : "x"} (${judged.extracted_answer})`);
    results.push({
      id: s.id,
      expected,
      sonnet_answer: judged.extracted_answer,
      matched_choice: judged.matched_choice,
      is_correct: isCorrect,
      reasoning: judged.reasoning,
    });
  }

  const total = results.length;
  const correct = results.filter((r) => r.is_correct).length;
  const ambiguous = results.filter((r) => r.matched_choice === "?").length;
  const ratePercent = total > 0 ? ((correct / total) * 100).toFixed(1) : "0.0";

  console.log("");
  console.log(`재채점 결과: ${correct}/${total} 정답 (모호 ${ambiguous}건, ${ratePercent}%)`);

  await writeFile(
    "docs/qa/sonnet-rejudge-15-cases.json",
    JSON.stringify(
      {
        run_at: new Date().toISOString(),
        source_report: "docs/qa/kpi-evaluation-geometry-sonnet-baseline.json",
        eval_set: "user_docs/suneung-math/eval/sub-killer-eval.json",
        judge_model: HAIKU_MODEL,
        rejudged: results,
        summary: { total, correct, ambiguous, rate_percent: Number(ratePercent) },
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log("저장: docs/qa/sonnet-rejudge-15-cases.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
