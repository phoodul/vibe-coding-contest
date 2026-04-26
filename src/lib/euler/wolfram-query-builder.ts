/**
 * Reasoner 가 호출한 SymPy tool 의 (name, input) 을 Wolfram Alpha 가 이해하는
 * 자연어 query 로 변환.
 *
 * Phase F-09: cross-check 의 입력으로 사용.
 *
 * 예:
 *   { name: "differentiate", input: { expr: "x^3 - 3*x", var: "x", order: 1 } }
 *     → "differentiate x^3 - 3*x with respect to x"
 *   { name: "integrate", input: { expr: "sin(x)", var: "x", lower: "0", upper: "pi" } }
 *     → "integrate sin(x) from 0 to pi with respect to x"
 *   { name: "solve_equation", input: { expr: "x**2 - 4", var: "x" } }
 *     → "solve x**2 - 4 = 0 for x"
 */

interface ToolCall {
  name: string;
  input: Record<string, unknown>;
}

function s(v: unknown): string {
  return typeof v === "string" ? v : String(v ?? "");
}

export function buildWolframQuery(tool: ToolCall): string | null {
  const i = tool.input;
  switch (tool.name) {
    case "differentiate": {
      const expr = s(i.expr);
      const v = s(i.var || "x");
      const order = Number(i.order ?? 1);
      if (!expr) return null;
      return order > 1
        ? `${order}-th derivative of ${expr} with respect to ${v}`
        : `differentiate ${expr} with respect to ${v}`;
    }
    case "integrate": {
      const expr = s(i.expr);
      const v = s(i.var || "x");
      const lo = i.lower != null ? s(i.lower) : null;
      const up = i.upper != null ? s(i.upper) : null;
      if (!expr) return null;
      if (lo != null && up != null) {
        return `integrate ${expr} from ${lo} to ${up} with respect to ${v}`;
      }
      return `integrate ${expr} with respect to ${v}`;
    }
    case "solve_equation": {
      const expr = s(i.expr);
      const v = s(i.var || "x");
      if (!expr) return null;
      return `solve ${expr} = 0 for ${v}`;
    }
    case "solve_inequality": {
      const expr = s(i.expr);
      const v = s(i.var || "x");
      if (!expr) return null;
      return `solve ${expr} for ${v}`;
    }
    case "simplify": {
      const expr = s(i.expr);
      if (!expr) return null;
      return `simplify ${expr}`;
    }
    case "factor": {
      const expr = s(i.expr);
      if (!expr) return null;
      return `factor ${expr}`;
    }
    case "series_expand": {
      const expr = s(i.expr);
      const v = s(i.var || "x");
      const point = s(i.point || "0");
      const n = Number(i.n ?? 6);
      if (!expr) return null;
      return `series expansion of ${expr} around ${v} = ${point} to order ${n}`;
    }
    case "summation": {
      const expr = s(i.expr);
      const v = s(i.var || "k");
      const lo = s(i.lower || "1");
      const up = s(i.upper || "n");
      if (!expr) return null;
      const upDisplay = up === "oo" ? "infinity" : up;
      return `sum ${expr} from ${v} = ${lo} to ${upDisplay}`;
    }
    case "limit": {
      const expr = s(i.expr);
      const v = s(i.var || "x");
      const point = s(i.point || "0");
      const dir = s(i.direction || "+-");
      if (!expr) return null;
      const pointDisplay = point === "oo" ? "infinity" : point === "-oo" ? "-infinity" : point;
      const dirNote = dir === "+" ? " from the right" : dir === "-" ? " from the left" : "";
      return `limit of ${expr} as ${v} approaches ${pointDisplay}${dirNote}`;
    }
    case "partial_fraction": {
      const expr = s(i.expr);
      if (!expr) return null;
      return `partial fraction decomposition of ${expr}`;
    }
    case "trig_simplify": {
      const expr = s(i.expr);
      if (!expr) return null;
      return `simplify ${expr}`;
    }
    case "log_simplify": {
      const expr = s(i.expr);
      if (!expr) return null;
      return `simplify ${expr}`;
    }
    case "probability": {
      const dist = s(i.distribution);
      const params = i.params as Record<string, unknown> | undefined;
      const query = s(i.query);
      const k = i.k;
      if (!dist || !params) return null;
      // 분포 + 쿼리를 자연어로
      if (dist === "binomial") {
        return `${query.replace("X", `X`)} for X binomial(${params.n}, ${params.p})`;
      }
      if (dist === "normal") {
        return `${query} for X normal distribution mean ${params.mean} std ${params.std} k=${k}`;
      }
      // 기본 fallback — 거칠지만 요청
      return `${query} for ${dist} distribution with params ${JSON.stringify(params)} k=${k ?? ""}`;
    }
    case "geometry": {
      const op = s(i.operation);
      const points = i.points as number[][] | undefined;
      if (!op || !points) return null;
      if (op === "distance_points" && points.length === 2) {
        return `distance between points (${points[0].join(",")}) and (${points[1].join(",")})`;
      }
      if (op === "triangle_area" && points.length === 3) {
        return `area of triangle with vertices ${points.map((p) => `(${p.join(",")})`).join(", ")}`;
      }
      // 기타 — 거칠지만 시도
      return `${op} with points ${points.map((p) => `(${p.join(",")})`).join(", ")}`;
    }
    case "vector": {
      const op = s(i.operation);
      const a = i.a as number[] | undefined;
      const b = i.b as number[] | undefined;
      if (!op || !a) return null;
      if (op === "dot" && b) return `dot product of (${a.join(",")}) and (${b.join(",")})`;
      if (op === "cross" && b) return `cross product of (${a.join(",")}) and (${b.join(",")})`;
      if (op === "norm") return `magnitude of vector (${a.join(",")})`;
      if (op === "angle" && b)
        return `angle between vectors (${a.join(",")}) and (${b.join(",")})`;
      return null;
    }
    default:
      return null;
  }
}
