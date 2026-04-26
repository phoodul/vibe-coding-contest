/**
 * Anthropic tool calling JSON schema 정의 (Phase D-04 + Phase F-07 확장).
 *
 * zod 의존 없이 raw JSON schema 로 정의 — Anthropic Messages API
 * tools 필드에 그대로 전달. Reasoner (D-05) 가 tool_use 응답을
 * 받아 callSympy 로 실행.
 *
 * Phase D 6 tool: differentiate, integrate, solve_equation, simplify, factor, series_expand
 * Phase F 신규 11 tool: summation, limit, solve_inequality, probability, geometry,
 *                     vector, partial_fraction, trig_simplify, log_simplify, plot_function, wolfram_query
 *
 * 영역별 권장 tool 셋은 EULER_TOOLS_BY_AREA 로 분리 — Reasoner 가 area 에 따라
 * 호출 가능한 도구 부분집합을 선택해 컨텍스트를 절약.
 */

import { callSympy, type SympyOp, type SympyResult, type SympyError } from "@/lib/euler/sympy-client";

export interface AnthropicToolDef {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required: string[];
  };
}

export const EULER_TOOLS: AnthropicToolDef[] = [
  {
    name: "differentiate",
    description:
      "표현식을 미분합니다. 학생이 손으로 미분하면 실수할 수 있는 단계는 반드시 이 tool 을 호출하세요.",
    input_schema: {
      type: "object",
      properties: {
        expr: { type: "string", description: "SymPy 호환 식 (예: 'x**3 - 3*x')" },
        var: { type: "string", description: "미분할 변수", default: "x" },
        order: { type: "integer", description: "미분 차수", default: 1 },
      },
      required: ["expr"],
    },
  },
  {
    name: "integrate",
    description:
      "표현식을 적분합니다. lower/upper 제공 시 정적분, 미제공 시 부정적분.",
    input_schema: {
      type: "object",
      properties: {
        expr: { type: "string" },
        var: { type: "string", default: "x" },
        lower: { type: "string", description: "정적분 하한 (옵션)" },
        upper: { type: "string", description: "정적분 상한 (옵션)" },
      },
      required: ["expr"],
    },
  },
  {
    name: "solve_equation",
    description:
      "방정식 expr = 0 의 해를 구합니다. 좌변만 받음.",
    input_schema: {
      type: "object",
      properties: {
        expr: { type: "string" },
        var: { type: "string", default: "x" },
      },
      required: ["expr"],
    },
  },
  {
    name: "simplify",
    description: "식을 가능한 한 단순화합니다.",
    input_schema: {
      type: "object",
      properties: { expr: { type: "string" } },
      required: ["expr"],
    },
  },
  {
    name: "factor",
    description: "다항식을 인수분해합니다.",
    input_schema: {
      type: "object",
      properties: { expr: { type: "string" } },
      required: ["expr"],
    },
  },
  {
    name: "series_expand",
    description: "테일러/매클로린 급수 전개. point 주변 차수 n 까지.",
    input_schema: {
      type: "object",
      properties: {
        expr: { type: "string" },
        var: { type: "string", default: "x" },
        point: { type: "string", default: "0" },
        n: { type: "integer", default: 6 },
      },
      required: ["expr"],
    },
  },
  // ────────── Phase F 신규 ──────────
  {
    name: "summation",
    description:
      "Σ — 유한합·무한합. upper='oo' 가능. 수열의 합·급수 수렴 계산에 필수.",
    input_schema: {
      type: "object",
      properties: {
        expr: { type: "string", description: "합할 식 (예: 'k**2')" },
        var: { type: "string", default: "k" },
        lower: { type: "string", default: "1" },
        upper: { type: "string", default: "n", description: "유한합 시 정수, 무한합 시 'oo'" },
      },
      required: ["expr"],
    },
  },
  {
    name: "limit",
    description:
      "함수의 극한. point='oo' 또는 '-oo' 가능. direction='+'(우극한) 또는 '-'(좌극한) 또는 '+-'(양쪽).",
    input_schema: {
      type: "object",
      properties: {
        expr: { type: "string" },
        var: { type: "string", default: "x" },
        point: { type: "string", default: "0" },
        direction: { type: "string", default: "+-" },
      },
      required: ["expr"],
    },
  },
  {
    name: "solve_inequality",
    description:
      "단변수 부등식의 해 영역. 예: 'x**2 - 4 > 0'. SymPy 의 정확 풀이.",
    input_schema: {
      type: "object",
      properties: {
        expr: { type: "string", description: "부등식 (>, <, >=, <= 사용)" },
        var: { type: "string", default: "x" },
      },
      required: ["expr"],
    },
  },
  {
    name: "partial_fraction",
    description: "유리식 부분분수 분해. telescoping 합·적분 보조에 필수.",
    input_schema: {
      type: "object",
      properties: {
        expr: { type: "string" },
        var: { type: "string", default: "x" },
      },
      required: ["expr"],
    },
  },
  {
    name: "trig_simplify",
    description: "삼각함수 항등식 단순화. sin²+cos²=1 등 자동 적용.",
    input_schema: {
      type: "object",
      properties: { expr: { type: "string" } },
      required: ["expr"],
    },
  },
  {
    name: "probability",
    description:
      "확률분포 — 이항/정규/기하/초기하. P(X=k), P(X>=k), E(X), V(X) 정확 계산.",
    input_schema: {
      type: "object",
      properties: {
        distribution: {
          type: "string",
          enum: ["binomial", "normal", "geometric", "hypergeometric"],
        },
        params: {
          type: "object",
          description:
            "분포별 파라미터. binomial: {n,p}, normal: {mean,std}, geometric: {p}, hypergeometric: {N,K,n}",
        },
        query: { type: "string", description: "'P(X=k)', 'P(X>=k)', 'E', 'V'" },
        k: { type: "number", description: "P 쿼리에서 비교 값" },
      },
      required: ["distribution", "params", "query"],
    },
  },
  {
    name: "geometry",
    description:
      "평면기하 — 거리·직선·원·교점. operation: distance_points / line_through / circle_3pt / intersection_lines / triangle_area",
    input_schema: {
      type: "object",
      properties: {
        operation: { type: "string" },
        points: {
          type: "array",
          items: { type: "array", items: { type: "number" } },
          description: "[[x1,y1], [x2,y2], ...] (operation 별 개수 다름)",
        },
      },
      required: ["operation", "points"],
    },
  },
  {
    name: "vector",
    description:
      "벡터 — 내적·외적·노름·사잇각·정사영. operation: dot / cross / norm / angle / projection",
    input_schema: {
      type: "object",
      properties: {
        operation: { type: "string" },
        a: { type: "array", items: { type: "number" }, description: "[x,y,(z)]" },
        b: { type: "array", items: { type: "number" } },
      },
      required: ["operation", "a"],
    },
  },
  {
    name: "plot_function",
    description:
      "함수 그래프를 PNG 로 그려 base64 로 반환. 학생에게 시각적으로 보여줄 때 호출.",
    input_schema: {
      type: "object",
      properties: {
        expr: { type: "string" },
        var: { type: "string", default: "x" },
        x_min: { type: "number", default: -10 },
        x_max: { type: "number", default: 10 },
        title: { type: "string" },
      },
      required: ["expr"],
    },
  },
  {
    name: "wolfram_query",
    description:
      "Wolfram Alpha API — 자연어 수학 query 의 답. SymPy 결과를 cross-check 하거나 SymPy 가 못 푸는 영역 fallback. 비싼 호출이므로 최소한으로.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "예: 'integrate sin(x)/x from 0 to infinity'" },
      },
      required: ["query"],
    },
  },
];

/**
 * 영역별 권장 tool 부분집합 — Reasoner 가 컨텍스트 절약을 위해 선택적으로 전달.
 *
 * 'free' 또는 매핑 없는 영역은 EULER_TOOLS 전체.
 */
export const EULER_TOOLS_BY_AREA: Record<string, string[]> = {
  middle: ["solve_equation", "factor", "simplify", "geometry", "plot_function"],
  common: [
    "solve_equation", "factor", "simplify", "solve_inequality",
    "partial_fraction", "geometry", "plot_function", "wolfram_query",
  ],
  math1: [
    "summation", "trig_simplify", "log_simplify", "solve_equation", "solve_inequality",
    "limit", "plot_function", "wolfram_query",
  ],
  math2: [
    "differentiate", "integrate", "limit", "solve_equation", "solve_inequality",
    "factor", "plot_function", "plot_region", "wolfram_query",
  ],
  calculus: [
    "differentiate", "integrate", "limit", "series_expand", "summation",
    "partial_fraction", "trig_simplify", "plot_function", "plot_region", "wolfram_query",
  ],
  probability: ["probability", "summation", "numeric", "wolfram_query"],
  geometry: ["geometry", "vector", "plot_geometry", "plot_function", "wolfram_query"],
};

/**
 * 영역별 Reasoner 호출 임계값.
 * 미적분·기하·확통은 LLM 환각 위험이 더 일찍 시작 → 난이도 4+ 부터 도구 호출.
 * 중학·공통은 5+ 부터.
 */
export const REASONER_THRESHOLD_BY_AREA: Record<string, number> = {
  middle: 5,
  common: 5,
  math1: 4,
  math2: 4,
  calculus: 4,
  probability: 4,
  geometry: 4,
  free: 5,
};

/**
 * Manager Haiku 가 영문 enum 대신 한글 영역명을 반환하는 경우를 대비한 매핑.
 * 또한 EduFlow 기존 UI 의 한글 카테고리명과의 일관성 보장.
 *
 * 미지정 영역은 그대로 반환 (영문 enum 정상 응답인 경우).
 */
const KOREAN_AREA_MAP: Record<string, string> = {
  중학수학: "middle",
  중학: "middle",
  공통수학: "common",
  공통: "common",
  수학1: "math1",
  수학Ⅰ: "math1",
  수학i: "math1",
  수학2: "math2",
  수학Ⅱ: "math2",
  수학ii: "math2",
  미적분: "calculus",
  미분법: "calculus",
  적분법: "calculus",
  미분: "calculus",
  적분: "calculus",
  확률과통계: "probability",
  확률통계: "probability",
  확률: "probability",
  통계: "probability",
  기하: "geometry",
  기하벡터: "geometry",
  자유: "free",
  자유질문: "free",
};

/**
 * Manager 가 반환한 area 문자열을 표준 영문 enum 으로 정규화.
 * 이미 영문 enum 이면 그대로, 한글 영역명이면 매핑, 모호하면 'free'.
 */
export function normalizeArea(area: string | undefined | null): string {
  if (!area) return "free";
  const trimmed = area.trim().toLowerCase();
  if (REASONER_THRESHOLD_BY_AREA[trimmed] !== undefined) return trimmed;
  // 한글 매핑 (대소문자 무시 + 공백 제거)
  const cleaned = area.trim().replace(/\s+/g, "").toLowerCase();
  for (const [k, v] of Object.entries(KOREAN_AREA_MAP)) {
    if (cleaned === k.toLowerCase()) return v;
  }
  // 부분 일치 (예: "미적분 영역", "수학Ⅰ 지수로그")
  for (const [k, v] of Object.entries(KOREAN_AREA_MAP)) {
    if (cleaned.includes(k.toLowerCase())) return v;
  }
  return "free";
}

const TOOL_TO_OP: Record<string, SympyOp> = {
  differentiate: "differentiate",
  integrate: "integrate",
  solve_equation: "solve_equation",
  simplify: "simplify",
  factor: "factor",
  series_expand: "series_expand",
  // Phase F
  summation: "summation",
  limit: "limit",
  solve_inequality: "solve_inequality",
  partial_fraction: "partial_fraction",
  trig_simplify: "trig_simplify",
  probability: "probability",
  geometry: "geometry",
  vector: "vector",
  plot_function: "plot_function",
  wolfram_query: "wolfram_query",
};

/**
 * tool_use 블록 한 개를 실행하고 SymPy 응답을 반환.
 */
export async function executeEulerTool(
  toolName: string,
  toolInput: Record<string, unknown>
): Promise<SympyResult | SympyError> {
  const op = TOOL_TO_OP[toolName];
  if (!op) {
    return { error: "unknown_tool", detail: toolName };
  }
  return callSympy(op, toolInput);
}
