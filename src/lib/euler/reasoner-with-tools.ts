/**
 * Reasoner + Tool Calling — Sonnet 4.6 가 SymPy μSvc 도구를 호출해 계산 환각 0% 유지.
 *
 * Anthropic Messages API 직접 호출 (raw fetch).
 * useGpt=true (가우스 / GPT-5.1) 인 경우는 폴백: 기본 reasoner (tool 없음) 사용.
 *
 * 사용 위치:
 *   - Phase D 의 orchestrator route 가 difficulty 6+ 일 때 호출
 *   - 결과는 Reasoner BFS 의 facts 와 통합 가능
 */

import { EULER_TOOLS, EULER_TOOLS_BY_AREA, executeEulerTool } from "@/lib/ai/euler-tools-schema";

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";
const SONNET_MODEL = "claude-sonnet-4-5-20250929";

interface ToolUseBlock {
  type: "tool_use";
  id: string;
  name: string;
  input: Record<string, unknown>;
}

interface TextBlock {
  type: "text";
  text: string;
}

type ContentBlock = TextBlock | ToolUseBlock;

interface AnthropicResponse {
  content: ContentBlock[];
  stop_reason: string;
  usage?: { input_tokens: number; output_tokens: number };
}

export interface ReasonerWithToolsResult {
  text: string;
  used_tools: { name: string; input: Record<string, unknown>; latex?: string; result?: string }[];
  steps: number;
  duration_ms: number;
}

const SYSTEM_TOOL = `당신은 **Euler Reasoner — Tool 모드** 입니다. SymPy μSvc 도구로 모든 계산을 수행해 환각을 0% 로 유지합니다.

## 절대 원칙
- **단순 계산은 항상 tool 호출**. 손으로 계산해서 답을 만들지 마세요.
- 미분 / 적분 / 방정식 해 / 인수분해 / 단순화 / 급수 전개 가 필요하면 해당 tool 호출.
- tool 결과의 latex 를 그대로 사용. 임의 변형 금지.
- 사고 과정은 자연어로, 계산값은 tool 결과로 결합.

## 출력
최종 답은 자연어 + 핵심 LaTeX 표기. 학생에게 직접 보여줘도 안전한 형식.`;

interface RunArgs {
  problem: string;
  conditions: string[];
  goal: string;
  maxSteps?: number;
  /** Manager 가 분류한 영역 — 영역별 tool subset 선택용. 미지정 시 전체 tool. */
  area?: string;
}

/**
 * 영역별 tool 부분집합 — 컨텍스트 절약 + LLM 의 tool 선택 부담 감소.
 */
function pickToolsByArea(area?: string) {
  if (!area) return EULER_TOOLS;
  const allowed = EULER_TOOLS_BY_AREA[area];
  if (!allowed || allowed.length === 0) return EULER_TOOLS;
  return EULER_TOOLS.filter((t) => allowed.includes(t.name));
}

export async function runReasonerWithTools(args: RunArgs): Promise<ReasonerWithToolsResult | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const t0 = Date.now();
  const userPrompt = `### 문제
${args.problem}

### 알려진 조건
${args.conditions.map((c, i) => `  ${i + 1}. ${c}`).join("\n")}

### 목표
${args.goal}

위 문제의 풀이 핵심을 도구를 사용해 계산하세요. 자연어 + LaTeX 로 결과를 정리하세요.`;

  const messages: { role: "user" | "assistant"; content: ContentBlock[] | string }[] = [
    { role: "user", content: userPrompt },
  ];

  const used: ReasonerWithToolsResult["used_tools"] = [];
  const maxSteps = Math.max(1, Math.min(args.maxSteps ?? 5, 8));

  for (let step = 0; step < maxSteps; step++) {
    const resp = await fetch(ANTHROPIC_API, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: SONNET_MODEL,
        max_tokens: 1500,
        system: SYSTEM_TOOL,
        tools: pickToolsByArea(args.area),
        messages,
      }),
    });

    if (!resp.ok) {
      console.error("[reasoner-with-tools] anthropic", resp.status, await resp.text().catch(() => ""));
      return null;
    }

    const data = (await resp.json()) as AnthropicResponse;

    if (data.stop_reason !== "tool_use") {
      const text = data.content
        .filter((b): b is TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();
      return {
        text,
        used_tools: used,
        steps: step + 1,
        duration_ms: Date.now() - t0,
      };
    }

    // tool_use 블록 실행
    const toolResults: { type: "tool_result"; tool_use_id: string; content: string }[] = [];
    for (const block of data.content) {
      if (block.type === "tool_use") {
        const result = await executeEulerTool(block.name, block.input);
        const summary =
          "error" in result
            ? { error: result.error, detail: result.detail }
            : { latex: result.latex, result: result.result };
        used.push({
          name: block.name,
          input: block.input,
          latex: "latex" in result ? result.latex : undefined,
          result: "result" in result ? result.result : undefined,
        });
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify(summary),
        });
      }
    }

    // assistant 응답 + user(tool_result) 메시지 추가
    messages.push({ role: "assistant", content: data.content });
    messages.push({ role: "user", content: toolResults as unknown as ContentBlock[] });
  }

  // maxSteps 초과 — 마지막 응답을 그대로 반환
  return {
    text: "(maxSteps 초과 — 도구 호출이 너무 많아 종료)",
    used_tools: used,
    steps: maxSteps,
    duration_ms: Date.now() - t0,
  };
}
