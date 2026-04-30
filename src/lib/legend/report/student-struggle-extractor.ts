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

const SYSTEM = `당신은 수학 학습 분석가입니다. 학생-AI 튜터 대화를 보고 다음 5 차원을 JSON 으로만 응답합니다.
1) stuck_step_index: 학생이 가장 망설이거나 잘못 접근한 step (제공된 steps[].index 중 하나; 막힘이 명확하지 않으면 -1)
2) stuck_summary: 한 문장 요약 (예: "지수 변환에서 어떤 변환을 적용할지 망설임")
3) trigger_quote: 그 step 에서 학생이 떠올렸어야 하는 trigger·접근법 (1~2 문장, 학생 친화 톤)
4) ai_hint_quote: AI 튜터가 학생을 도왔던 핵심 hint 발화 인용 (한 줄, 원문 그대로 따옴표 안에)
5) resolution: 학생이 어떻게 극복했는지 (1 문장; 끝까지 못 풀었으면 "끝까지 망설임")

규칙:
- 한국어 존댓말, 학생 비판 금지.
- 응답은 다음 형식의 JSON 한 객체만:
{
  "stuck_step_index": <number>,
  "stuck_summary": "...",
  "trigger_quote": "...",
  "ai_hint_quote": "...",
  "resolution": "..."
}
- 마크다운·코드블록·해설 금지. 순수 JSON 만.`;

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
    const result = await callModel({
      model_id: process.env.ANTHROPIC_HAIKU_MODEL_ID ?? 'claude-haiku-4-5-20251201',
      provider: 'anthropic',
      mode: 'baseline',
      problem: promptBody,
      system_prompt: SYSTEM,
      max_tokens: 400,
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
    stuck_summary: coerceString(parsed.stuck_summary, 200),
    trigger_quote: coerceString(parsed.trigger_quote, 320),
    ai_hint_quote: coerceString(parsed.ai_hint_quote, 240),
    resolution: coerceString(parsed.resolution, 200),
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
