/**
 * Anthropic tool calling JSON schema 정의 (Phase D-04).
 *
 * zod 의존 없이 raw JSON schema 로 정의 — Anthropic Messages API
 * tools 필드에 그대로 전달. Reasoner (D-05) 가 tool_use 응답을
 * 받아 callSympy 로 실행.
 *
 * 6 tool: differentiate, integrate, solve_equation, simplify, factor, series_expand
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
];

const TOOL_TO_OP: Record<string, SympyOp> = {
  differentiate: "differentiate",
  integrate: "integrate",
  solve_equation: "solve_equation",
  simplify: "simplify",
  factor: "factor",
  series_expand: "series_expand",
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
