/**
 * Phase G-06 Δ14 — 학생 막힘 분석기.
 *
 * 베타 단계에서 `legend_step_stuck_snapshots` 테이블이 비어 있어 `stuck_signals` 가 항상
 * 0 으로 나오는 문제 보강. 학생-AI 대화 이력을 Haiku 가 분석하여 다음 5 차원을 1 카드로 추출:
 *   1) 학생이 막힌 step index
 *   2) 막힘의 한 줄 요약
 *   3) 그 step 에서 떠올렸어야 하는 trigger·접근법
 *   4) AI 가 학생을 도왔던 핵심 hint 인용
 *   5) 학생이 어떻게 극복했는지 (또는 못 했는지)
 *
 * 비용 가드: Haiku 1회 (~$0.001~0.002 / max_tokens 400).
 *
 * 영향 격리: src/lib/legend/report/ 전용. callModel + types 만 import. DB persist 없음
 * (PerProblemReport.student_struggle 필드로 buildReport 에서 함께 upsert).
 */
import { callModel } from '@/lib/legend/call-model';
import { tryParseJson } from '@/lib/euler/json';
import type {
  PerProblemStep,
  StudentStruggleSummary,
  TriggerCard,
} from '@/lib/legend/types';

export interface ExtractStudentStruggleArgs {
  /** 학생-AI 대화 이력 직렬화 본문 ([학생] / [튜터] 라벨, 각 메시지 max 400자) */
  conversation_text: string;
  problem_text: string;
  steps: PerProblemStep[];
  pivotal_step_index: number;
  primary_trigger?: TriggerCard;
}

const SYSTEM = `당신은 학생의 사고 발달을 돕는 학습 분석가입니다. 학생-AI 튜터 대화를 깊이 분석해 학생이 막혔던 지점과 어떻게 극복했는지 5 차원으로 정리합니다.

## 핵심 철학
이 분석은 학생이 다음에 비슷한 문제에서 같은 자리에 막히지 않도록, 막힘의 본질과 떠올렸어야 할 trigger 를 명시화하는 것입니다.

## 5 차원 (각 필드의 깊이 있는 분석)

1. **stuck_step_index** — 학생이 가장 망설이거나 잘못 접근한 step (steps[].index 중 하나; 막힘이 명확하지 않으면 -1)

2. **stuck_summary** (2~3 문장) — 학생 막힘의 본질
   - 학생이 어디서, 무엇을 떠올리지 못했는지 구체적으로.
   - 표면적 "모르겠다" 가 아닌 "어떤 사고 도약이 안 됐는가" 차원.
   - 비판 금지. 학생 입장에서 자연스러운 어려움으로 묘사.

3. **trigger_quote** (6~10 문장) — Tool 과 Trigger 의 엄격한 분리. Trigger 의 본질은 "왜 하필 이 도구인가의 필연성·개연성"

   ### Trigger 의 본질 — (Cue, Tool) 매핑 명제

   **Trigger 자체 = "X 일 때 Y 를 한다" 형식의 한 줄 매핑 명제**. 학생이 노트에 옮겨 적을 수 있는 정석 표현.

   수학 정석 형식 예:
   > 예 ① "반복되는 도형에 관한 문제라면 닮음비를 이용해 점화식으로 나타낸다"
   > 예 ② "두 직선의 기울기가 주어졌을 때 그 예각의 크기는 \\(\\tan(a-b)\\) 로 구한다"

   여기서:
   - **Cue (인지 단서)**: 문제 표면에서 학생이 즉시 알아차릴 수 있는 표현·구조·키워드.
   - **Tool (수학적 도구)**: 그 cue 에 의해 호출되어야 하는 **세밀한 풀이 수단** (공식·정리·항등식·구체 테크닉). 단원 이름 (치환·보조선) X — 더 세밀하게.
   - **Trigger 자체**: "X 일 때 Y 를 한다" 한 줄 매핑. 노트화 가능한 압축 형식.
   - **Trigger 분석**: 그 매핑이 왜 자연스러운지 / 왜 필연적인지의 **인과**를 학생이 깨닫도록 풀어 설명.

   ### Trigger 분석 절차 (정석 형식 + 인과 풀이)
   학생 막힘 자리에서 떠올렸어야 한 trigger 를 다음 4 요소로 모두 명시하세요:

   **(1) Trigger 명제 (한 줄 정석 형식)** — 학생이 노트에 옮겨 적을 수 있는 압축 매핑.
   - 형식: "[Cue] 일 때 → [Tool] 을 한다" 한 줄.
   - 예 ①: "반복되는 도형 문제라면 닮음비를 이용해 점화식으로 나타낸다"
   - 예 ②: "두 직선의 기울기가 주어졌을 때 그 예각의 크기는 \\(\\tan(a-b)\\) 로 구한다"
   - 예 ③: "두 변과 끼인각이 주어졌을 때 삼각형의 넓이는 \\(S = \\tfrac{1}{2}ab\\sin\\theta\\) 로 구한다"
   - 이 한 줄 자체가 trigger.

   **(2) Cue 풀이** — 문제 표면에서 학생이 봤어야 했지만 못 본 인식 단서가 정확히 무엇인지.

   **(3) 필연성·개연성** — Trigger 의 핵심.
     - **개연성**: cue 가 보일 때 가능한 여러 도구 중 이 도구가 가장 효율적·자연스러운 이유.
     - **필연성**: cue 의 수학 구조가 이 도구만의 적용을 보장·강제하는 이유.
     - 다른 가능 도구와의 비교 필수: "대안 ~ 도 시도 가능했지만, 그것이 비효율적이거나 작동하지 않는 이유".

   **(4) 인식 구조 형성** — 학생이 다음에 같은 cue 를 만나면 자동으로 같은 tool 이 떠오르도록 어떻게 매핑을 내재화할지.

   ### 단 하나의 절차 적용 시연 (이를 모든 문제에 일반화)
   합성함수 \\(f(x-1)\\) 반복 등장 자리에서 학생이 막혔던 경우:

   "**Trigger 명제**: 합성함수 인자가 일차식으로 반복될 때는 \\(u = x-1\\) 로 치환하여 \\(f(u)\\) 형태로 재기술한다. **Cue 풀이**: 함수 인자가 단순 변수가 아닌 \\(x-1\\) 같은 일차식으로 식 안에 여러 번 반복 등장하는 것이 표면 단서였습니다. **필연성·개연성**: 같은 인자가 반복되는 구조에서는 그 인자를 통째로 새 변수로 보는 것이 사고를 가장 단순화시킵니다. 직접 전개나 미분으로 풀 수도 있었으나 표현식이 복잡할수록 비효율이 누적되고 결국 치환을 거치게 되므로, 처음부터 치환이 자연스럽고 거의 불가피한 선택이 됩니다. **인식 구조 형성**: '합성함수 인자가 일차식·익숙한 형태로 반복' cue → '인자를 새 변수로 두는 치환' tool. 이 매핑이 자동 호출되도록 새기면 다음에 같은 cue 만났을 때 머릿속에서 치환 사고가 즉시 일어납니다."

   ### 절대 금지
   - 추상 메타: "양방향 trigger", "역행 trigger", "forward/backward", "trigger 발동 패턴"
   - 단원 이름만: "치환을 떠올렸어야" — 어떤 치환인지 세밀히 명시 안 하면 의미 없음.
   - Tool 과 Trigger 혼동: "이 trigger 는 치환이다" 는 틀림. Trigger 는 (Cue→Tool) 매핑 명제 + 그 매핑의 인과.
   - 명제 한 줄 누락: 학생이 노트에 적을 수 있는 압축 매핑 없으면 학습 압축 가치 ↓.

4. **ai_hint_quote** (1~2 문장) — AI 튜터가 학생을 도왔던 핵심 hint
   - 대화 이력에서 학생의 사고를 가장 효과적으로 도왔던 한 마디 인용.
   - 원문 그대로 따옴표 안에. 인용 못 하면 의미를 보존한 paraphrase.

5. **resolution** (2~3 문장) — 학생이 어떻게 극복했는지
   - 어떤 사고 전환·관점 변경으로 막힘을 풀었는가?
   - 학습 전이 관점: 다음에 비슷한 자리에 막히면 무엇을 떠올려야 하는지.
   - 끝까지 못 풀었으면 "끝까지 망설였으나, 다음에는 ~ 를 떠올려보세요" 형식.

## 출력 (반드시 JSON 만, 다른 텍스트·코드펜스·해설 금지)
{
  "stuck_step_index": <number>,
  "stuck_summary": "...",
  "trigger_quote": "...",
  "ai_hint_quote": "...",
  "resolution": "..."
}

대화 이력이 짧거나 학생 발화가 적어도 각 필드를 비워두지 마세요. 추론으로라도 의미있는 분석을 채우세요.`;

interface RawJson {
  stuck_step_index?: unknown;
  stuck_summary?: unknown;
  trigger_quote?: unknown;
  ai_hint_quote?: unknown;
  resolution?: unknown;
}

function coerceNumber(v: unknown, fallback: number): number {
  if (typeof v === 'number' && Number.isFinite(v)) return Math.floor(v);
  if (typeof v === 'string') {
    const n = parseInt(v, 10);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function coerceString(v: unknown, max = 240): string {
  if (typeof v !== 'string') return '';
  return v.trim().slice(0, max);
}

// Δ16 — Sonnet 응답이 더 길어졌으므로 truncation 한도 상향
const STUCK_SUMMARY_MAX = 600;
const TRIGGER_QUOTE_MAX = 800;
const AI_HINT_QUOTE_MAX = 400;
const RESOLUTION_MAX = 600;

/**
 * 학생-AI 대화를 분석해 학생 막힘 5 차원을 추출한다.
 *
 * 멱등성: 같은 입력에 대해 LLM 응답이 다를 수 있으나 schema 는 안정.
 * 실패 안전: LLM 호출/파싱 실패 시 빈 fallback 반환 (UI 가 falsy 체크 후 섹션 숨김).
 */
export async function extractStudentStruggle(
  args: ExtractStudentStruggleArgs,
): Promise<StudentStruggleSummary | null> {
  if (!args.conversation_text?.trim()) return null;
  if (args.steps.length === 0) return null;

  const validIndices = args.steps.map((s) => s.index).join(', ');
  const triggerHint = args.primary_trigger?.why_text
    ? `\n참고 — 핵심 trigger: ${args.primary_trigger.tool_name} (${args.primary_trigger.why_text})`
    : '';

  const promptBody = `### 원문제
${args.problem_text.slice(0, 1000)}

### 풀이 단계 요약 (steps[].index = ${validIndices}, pivotal=${args.pivotal_step_index})
${args.steps
  .map((s) => `- step ${s.index} (${s.kind}): ${s.summary.slice(0, 200)}`)
  .join('\n')}${triggerHint}

### 학생-AI 대화 이력
${args.conversation_text.slice(0, 4000)}

위 5 차원을 JSON 으로만 응답하세요.`;

  let parsed: RawJson | null = null;
  try {
    // Δ16 — Haiku → Sonnet 4.6 격상. max 400 → 2000. 학생 막힘의 본질을 깊이 분석.
    const result = await callModel({
      model_id:
        process.env.LEGEND_REPORT_MODEL ??
        process.env.ANTHROPIC_SONNET_MODEL_ID ??
        'claude-sonnet-4-6-20260101',
      provider: 'anthropic',
      mode: 'baseline',
      problem: promptBody,
      system_prompt: SYSTEM,
      max_tokens: 2000,
    });
    const text = (result.text ?? '').trim();
    parsed = tryParseJson<RawJson>(text);
  } catch (e) {
    console.warn('[student-struggle-extractor] Haiku failed:', (e as Error).message);
    return null;
  }

  if (!parsed) return null;

  const stuckIdx = coerceNumber(parsed.stuck_step_index, -1);
  const validIdxSet = new Set(args.steps.map((s) => s.index));
  const safeStuckIdx = validIdxSet.has(stuckIdx) ? stuckIdx : -1;

  const summary: StudentStruggleSummary = {
    stuck_step_index: safeStuckIdx,
    stuck_summary: coerceString(parsed.stuck_summary, STUCK_SUMMARY_MAX),
    trigger_quote: coerceString(parsed.trigger_quote, TRIGGER_QUOTE_MAX),
    ai_hint_quote: coerceString(parsed.ai_hint_quote, AI_HINT_QUOTE_MAX),
    resolution: coerceString(parsed.resolution, RESOLUTION_MAX),
  };

  // 모든 텍스트 차원이 비어있으면 의미 없음 — null 반환 (UI 섹션 숨김)
  if (
    !summary.stuck_summary &&
    !summary.trigger_quote &&
    !summary.ai_hint_quote &&
    !summary.resolution
  ) {
    return null;
  }
  return summary;
}

/**
 * 학생-AI 대화 이력 (ChatMessage[]) 을 분석용 텍스트로 직렬화한다.
 *
 * - 각 메시지 본문 400자로 truncate
 * - 최대 12 메시지 (앞뒤 균형: 첫 4 + 마지막 8)
 * - role → [학생] / [튜터] 라벨
 * - multimodal content (image+text) 의 text 부분만
 */
export function formatConversation(
  messages: Array<{ role: string; content: unknown }>,
  opts: { maxMessages?: number; maxCharsPerMessage?: number } = {},
): string {
  const maxMessages = opts.maxMessages ?? 12;
  const maxChars = opts.maxCharsPerMessage ?? 400;

  // 본문 추출 (string 또는 multimodal text parts)
  const flat = messages
    .map((m) => {
      const role = m.role === 'user' ? '학생' : m.role === 'assistant' ? '튜터' : m.role;
      let text = '';
      if (typeof m.content === 'string') {
        text = m.content;
      } else if (Array.isArray(m.content)) {
        const parts = m.content as { type?: string; text?: string }[];
        text = parts
          .filter((p) => p.type === 'text' && p.text)
          .map((p) => p.text!)
          .join('\n');
      }
      return { role, text: text.trim().slice(0, maxChars) };
    })
    .filter((m) => m.text);

  if (flat.length === 0) return '';

  // 메시지 수가 maxMessages 이하면 그대로
  let kept: typeof flat;
  if (flat.length <= maxMessages) {
    kept = flat;
  } else {
    // 앞 4 + 마지막 (maxMessages - 4) — 풀이 시작과 끝부분 보존
    const headCount = Math.min(4, Math.floor(maxMessages / 3));
    const tailCount = maxMessages - headCount;
    kept = [...flat.slice(0, headCount), ...flat.slice(-tailCount)];
  }

  return kept.map((m) => `[${m.role}] ${m.text}`).join('\n\n');
}
