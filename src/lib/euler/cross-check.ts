/**
 * Cross-check — SymPy 결과를 Wolfram Alpha 로 교차검증.
 *
 * Phase F-05: "두 엔진이 모두 동일한 답을 도출 → 신뢰도 99%" 배지 로직.
 *
 * 사용 위치:
 *   - reasoner-with-tools 가 핵심 계산 결과를 산출한 직후
 *   - orchestrator route 에서 verified=true 면 system 에 신뢰 배지 신호 주입
 *
 * 호출 비용:
 *   - Wolfram Alpha API 호출 1회 ≈ \$0.0025 (월 \$5 / 2K queries)
 *   - 따라서 *항상* 호출하지 않고, 다음 조건에서만 호출:
 *     1) Reasoner 가 명시적으로 wolfram_query tool 을 사용한 경우
 *     2) sympy 결과의 신뢰도가 낮을 때 (예: 결과가 'no solution' 또는 빈 문자열)
 *     3) cross-check 를 명시적으로 요청한 경우
 */

import { callSympy } from "./sympy-client";

export interface CrossCheckResult {
  /** 두 엔진이 동치인 답을 도출했는가 */
  verified: boolean;
  /** 0..1 신뢰도. 두 엔진 일치 시 0.99, 한쪽만 답 시 0.7, 불일치 시 0.3 */
  confidence: number;
  /** 사용된 엔진 목록 */
  sources: ("sympy" | "wolfram")[];
  sympy_result?: string;
  wolfram_result?: string;
  /** UI 배지에 표시할 짧은 설명 */
  message: string;
}

/**
 * 두 결과 문자열의 수학적 동치성을 휴리스틱으로 비교.
 *
 * 1) 정확 일치
 * 2) 공백·괄호 무시 일치
 * 3) SymPy 의 simplify(a - b) == 0 (양쪽 모두 SymPy 가 파싱 가능할 때)
 *
 * Wolfram 답은 자연어가 섞일 수 있으므로 (1)·(2) 가 우선.
 */
function looseMatch(a: string, b: string): boolean {
  if (!a || !b) return false;
  const norm = (s: string) =>
    s
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[(){}[\]]/g, "")
      .replace(/\*\*/g, "^");
  return norm(a) === norm(b);
}

async function symbolicEqual(a: string, b: string): Promise<boolean> {
  // simplify(a - b) == 0 — 두 SymPy expression 의 차이가 0이면 동치
  try {
    const result = await callSympy("simplify", { expr: `(${a}) - (${b})` }, 8000);
    if ("error" in result) return false;
    const r = result.result.trim();
    return r === "0" || r === "0.0";
  } catch {
    return false;
  }
}

interface CrossCheckArgs {
  /** SymPy 가 도출한 결과 (예: "x**2 + 2*x + 1" 또는 "1/2") */
  sympyResult: string;
  /** Wolfram 에 던질 자연어 query (예: "integrate sin(x)/x from 0 to pi") */
  wolframQuery: string;
  /** 비교에 너무 비용을 쓰지 않도록 — 핵심 계산만 */
  enabled?: boolean;
}

export async function crossCheck({
  sympyResult,
  wolframQuery,
  enabled = true,
}: CrossCheckArgs): Promise<CrossCheckResult> {
  if (!enabled) {
    return {
      verified: false,
      confidence: 0.5,
      sources: ["sympy"],
      sympy_result: sympyResult,
      message: "교차검증 비활성",
    };
  }

  const wolfram = await callSympy("wolfram_query", { query: wolframQuery }, 12_000);

  if ("error" in wolfram) {
    // Wolfram 호출 실패 — SymPy 단독
    return {
      verified: false,
      confidence: 0.7,
      sources: ["sympy"],
      sympy_result: sympyResult,
      message: `SymPy 단독 (Wolfram ${wolfram.error})`,
    };
  }

  const wolframStr = wolfram.result?.toString() ?? "";
  if (!wolframStr || wolframStr === "no_result" || wolframStr === "no_plaintext") {
    return {
      verified: false,
      confidence: 0.7,
      sources: ["sympy"],
      sympy_result: sympyResult,
      wolfram_result: wolframStr,
      message: "Wolfram 응답 없음 — SymPy 단독",
    };
  }

  // 1) loose 일치 우선
  if (looseMatch(sympyResult, wolframStr)) {
    return {
      verified: true,
      confidence: 0.99,
      sources: ["sympy", "wolfram"],
      sympy_result: sympyResult,
      wolfram_result: wolframStr,
      message: "✓ SymPy + Wolfram 두 엔진 모두 동일",
    };
  }

  // 2) 기호 동치 (SymPy 가 양쪽을 파싱 가능할 때만 — Wolfram 자연어는 종종 실패)
  const symbolic = await symbolicEqual(sympyResult, wolframStr);
  if (symbolic) {
    return {
      verified: true,
      confidence: 0.95,
      sources: ["sympy", "wolfram"],
      sympy_result: sympyResult,
      wolfram_result: wolframStr,
      message: "✓ 두 엔진의 표현은 다르지만 수학적으로 동일",
    };
  }

  // 3) 불일치 — confidence 낮춤
  return {
    verified: false,
    confidence: 0.4,
    sources: ["sympy", "wolfram"],
    sympy_result: sympyResult,
    wolfram_result: wolframStr,
    message: `⚠ 두 엔진 결과 불일치 (sympy=${sympyResult.slice(0, 40)} / wolfram=${wolframStr.slice(0, 40)})`,
  };
}
