/**
 * SymPy μSvc 클라이언트 — Railway 배포된 FastAPI 호출.
 *
 * 사용 위치:
 *   - /api/euler-tutor/sympy 프록시 라우트
 *   - Phase D-04 의 AI SDK tool() 정의 내부
 */

const SYMPY_URL = process.env.EULER_SYMPY_URL;
const INTERNAL_TOKEN = process.env.EULER_SYMPY_INTERNAL_TOKEN ?? "";

export type SympyOp =
  | "differentiate"
  | "integrate"
  | "solve_equation"
  | "simplify"
  | "factor"
  | "series_expand";

export interface SympyResult {
  latex: string;
  result: string;
}

export interface SympyError {
  error: string;
  detail?: string;
}

export async function callSympy(
  op: SympyOp,
  args: Record<string, unknown>,
  timeoutMs = 35_000
): Promise<SympyResult | SympyError> {
  if (!SYMPY_URL) {
    return { error: "sympy_not_configured", detail: "EULER_SYMPY_URL missing" };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(`${SYMPY_URL.replace(/\/$/, "")}/${op}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Token": INTERNAL_TOKEN,
      },
      body: JSON.stringify(args),
      signal: controller.signal,
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      return { error: `sympy_${resp.status}`, detail: text.slice(0, 200) };
    }
    const data = (await resp.json()) as SympyResult;
    return data;
  } catch (e) {
    return { error: "sympy_unreachable", detail: String(e).slice(0, 200) };
  } finally {
    clearTimeout(timer);
  }
}

export function isSympyError(r: SympyResult | SympyError): r is SympyError {
  return "error" in r;
}
