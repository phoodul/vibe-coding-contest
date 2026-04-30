/**
 * Phase G-06 Δ24 — Legend Tutor 가드레일.
 *
 * 사용자 메시지를 Haiku 4.5 로 분류 → 정책 결정 → 위반 시 표준 응답 + DB 로그.
 *
 * 카테고리 9 종 + safe(=수학):
 *   - safe: 수학 문제·풀이·개념 (정상 통과)
 *   - non_math_subject: 다른 학습 (영어·과학·사회 등)
 *   - meta_curiosity: Legend Tutor 자체에 대한 질문 (어떤 모델이야? 누가 만들었어?)
 *   - ai_model_question: AI/LLM 일반 질문
 *   - personal_concern: 개인 고민·삶 상담
 *   - profanity: 욕설·비방
 *   - sexual_content: 외설·성적 표현
 *   - self_harm_crisis: 자해·자살 관련 (안전 우선 — 거부 X)
 *   - violence: 폭력·위협
 *   - political: 정치적 주장
 *
 * 정책:
 *   - safe → null 반환 (정상 처리)
 *   - 일반 위반 (non_math_subject ~ political 8 종) → 1차 안내 + DB warning_1 로그.
 *     같은 user 가 24시간 내 같은 카테고리 재위반 시 violation 로그 + 동일 메시지 (단 운영자가
 *     검토 가능하도록 누적 카운터로 관리).
 *   - self_harm_crisis → 즉시 전문 상담 자원 안내 (1393 자살예방상담전화 + 청소년 1388 + Wee센터)
 *     + crisis_alert 로그. 거부가 아니라 전문가 연결.
 *
 * 비용: Haiku 1회 (~$0.0005/turn). 첫 user 메시지에만 적용.
 *
 * 영향 격리: src/lib/legend/. callModel + supabase server client.
 */
import { createClient } from '@/lib/supabase/server';
import { callModel } from './call-model';
import { tryParseJson } from '@/lib/euler/json';

export type GuardrailCategory =
  | 'safe'
  | 'non_math_subject'
  | 'meta_curiosity'
  | 'ai_model_question'
  | 'personal_concern'
  | 'profanity'
  | 'sexual_content'
  | 'self_harm_crisis'
  | 'violence'
  | 'political'
  | 'other';

export interface GuardrailDecision {
  category: GuardrailCategory;
  /** Haiku confidence 0~1 */
  confidence: number;
  /** 학생에게 노출될 표준 안내 카피 */
  message_to_user: string;
  /** DB severity */
  severity: 'warning_1' | 'violation' | 'crisis_alert';
  /** Haiku 짧은 사유 */
  reason: string;
}

const CRISIS_MESSAGE = `당신의 마음이 많이 힘드시군요. 지금 가장 중요한 것은 당신의 안전입니다. 혼자 견디지 마시고 전문가의 도움을 받아주세요.

화면 오른쪽 아래 **"혼자가 아닙니다"** 버튼을 누르시거나, [/crisis](/crisis) 페이지에서 24시간 위기상담 자원과 연결될 수 있습니다.

저는 수학 코칭 AI 라 여러분의 마음을 충분히 도울 수 없지만, 위 자원들은 정말로 당신을 도울 수 있는 분들입니다.`;

const STANDARD_MESSAGES: Record<Exclude<GuardrailCategory, 'safe' | 'self_harm_crisis'>, string> = {
  non_math_subject:
    '저는 수학 풀이 코칭에 특화된 Legend Tutor 예요. 다른 과목에 대한 도움은 드리기 어려워요. 수학 문제로 다시 시작해볼까요?',
  meta_curiosity:
    '저는 Legend Tutor 라는 수학 코칭 AI 예요. 제 모델이나 내부 구조보다는 함께 풀 수학 문제에 집중해주시면 좋겠어요. 어떤 문제를 같이 볼까요?',
  ai_model_question:
    '저는 수학 코칭에 집중된 AI 도구입니다. AI 일반에 대한 토론보다 수학 문제 풀이로 시간을 써주시면 가장 도움이 될 거예요.',
  personal_concern:
    '진심 어린 고민을 들려주신 마음은 이해합니다. 다만 저는 수학 학습을 돕는 AI 라 일반적 고민 상담은 드리기 어려워요. 학교 상담 선생님이나 1388 청소년상담전화 같은 전문가에게 도움을 받으시면 좋겠어요. 수학 문제로 함께 시간을 보낼 마음이 있으시면 언제든 환영합니다.',
  profanity:
    '대화 중에 부적절한 표현이 보여요. Legend Tutor 와의 시간을 학습에 집중하기 위해 그런 표현은 사용하지 말아주세요. 수학 문제로 다시 시작해볼까요?',
  sexual_content:
    'Legend Tutor 는 수학 학습 전용 도구입니다. 그런 주제는 다룰 수 없습니다. 수학 문제로 돌아와주세요.',
  violence:
    '폭력과 관련된 내용은 다루지 않습니다. Legend Tutor 와의 시간을 수학 학습에 사용해주세요.',
  political:
    '저는 정치적 주제에 대해 의견을 드리지 않아요. 수학 풀이로 함께 시간을 보내주세요.',
  other:
    '저는 수학 풀이 코칭만 도와드릴 수 있어요. 수학 문제로 다시 시작해볼까요?',
};

const CLASSIFIER_SYSTEM = `당신은 수학 학습 AI 의 가드레일 분류기입니다. 사용자 메시지를 다음 10 카테고리 중 하나로 분류합니다.

카테고리:
- "safe": 수학 문제·풀이·개념·학습 자료 질문 (정상)
- "non_math_subject": 영어·과학·사회 등 다른 과목 학습
- "meta_curiosity": Legend Tutor 자체에 대한 호기심 (모델, 만든 사람, 작동 원리, 가격, 베타 등)
- "ai_model_question": AI/LLM/머신러닝 일반 질문
- "personal_concern": 개인 고민·삶 상담·감정 토로 (자해·자살 제외)
- "profanity": 욕설·비방·모욕
- "sexual_content": 외설·성적 표현
- "self_harm_crisis": 자해·자살·생명 위협 신호 (간접 표현 포함: "사라지고 싶다", "죽고 싶다", "살기 싫다")
- "violence": 폭력·위협·살해 의도
- "political": 정치 주장·이념 토론·특정 인물 평가

원칙:
- 의심스러우면 "safe" 가 아닌 가장 가까운 카테고리로 판정.
- self_harm_crisis 는 매우 민감하게 판정 (간접 표현도 포함). 이는 거부가 아닌 즉시 전문 안내로 이어집니다.
- 수학과 일상 대화 (인사·감사 등) 가 섞인 경우 → safe.

JSON 만 출력 (다른 텍스트 금지):
{
  "category": "safe" | "non_math_subject" | ... | "political" | "other",
  "confidence": <0.0~1.0>,
  "reason": "분류 근거 한 문장 (50자 내)"
}`;

interface ClassifierJson {
  category?: string;
  confidence?: number;
  reason?: string;
}

const VALID_CATEGORIES = new Set<GuardrailCategory>([
  'safe',
  'non_math_subject',
  'meta_curiosity',
  'ai_model_question',
  'personal_concern',
  'profanity',
  'sexual_content',
  'self_harm_crisis',
  'violence',
  'political',
  'other',
]);

/**
 * Haiku 1회 호출로 분류. 실패 시 'safe' fallback (false negative 가 false positive 보다 낫다 — 학생 학습 흐름을 우선).
 * 단 self_harm 키워드 hard-coded 매칭은 파싱 실패해도 동작하도록 별도 검사.
 */
export async function classifyMessage(text: string): Promise<{
  category: GuardrailCategory;
  confidence: number;
  reason: string;
}> {
  // hard-coded crisis 키워드 (파싱 실패해도 안전 우선)
  const crisisPatterns = [
    /자살/,
    /자해/,
    /죽고\s*싶/,
    /살기\s*싫/,
    /사라지고\s*싶/,
    /죽어\s*버리/,
    /목매/,
    /투신/,
    /약\s*먹고\s*죽/,
  ];
  if (crisisPatterns.some((re) => re.test(text))) {
    return {
      category: 'self_harm_crisis',
      confidence: 1,
      reason: 'crisis 키워드 hard-match',
    };
  }

  try {
    const result = await callModel({
      model_id: process.env.ANTHROPIC_HAIKU_MODEL_ID ?? 'claude-haiku-4-5-20251001',
      provider: 'anthropic',
      mode: 'baseline',
      problem: `사용자 메시지:\n${text.slice(0, 2000)}\n\n분류 JSON 만 출력.`,
      system_prompt: CLASSIFIER_SYSTEM,
      max_tokens: 200,
    });
    const parsed = tryParseJson<ClassifierJson>((result.text ?? '').trim());
    if (!parsed || typeof parsed.category !== 'string') {
      return { category: 'safe', confidence: 0, reason: 'parse failed' };
    }
    const cat = parsed.category as GuardrailCategory;
    if (!VALID_CATEGORIES.has(cat)) {
      return { category: 'safe', confidence: 0, reason: 'invalid category' };
    }
    return {
      category: cat,
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
      reason: typeof parsed.reason === 'string' ? parsed.reason.slice(0, 100) : '',
    };
  } catch (e) {
    console.warn('[guardrail] classify failed:', (e as Error).message);
    return { category: 'safe', confidence: 0, reason: 'classify error' };
  }
}

/**
 * 같은 user 의 같은 카테고리 24시간 내 위반 횟수 조회.
 * service_role 우회 권한이 없으면 0 반환 (안전).
 */
async function recentViolationCount(
  userId: string,
  category: GuardrailCategory,
  windowHours = 24,
): Promise<number> {
  try {
    const supabase = await createClient();
    const since = new Date(Date.now() - windowHours * 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('guardrail_violations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('category', category)
      .gte('created_at', since);
    return count ?? 0;
  } catch {
    return 0;
  }
}

/**
 * DB 위반 로그 insert (silent failure).
 */
async function logViolation(args: {
  user_id?: string;
  message_excerpt: string;
  category: GuardrailCategory;
  severity: 'warning_1' | 'violation' | 'crisis_alert';
  action_taken: string;
  conversation_snippet?: string;
  classifier_meta: ClassifierJson;
}): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.from('guardrail_violations').insert({
      user_id: args.user_id ?? null,
      message_excerpt: args.message_excerpt.slice(0, 1000),
      category: args.category,
      severity: args.severity,
      action_taken: args.action_taken.slice(0, 1000),
      conversation_snippet: args.conversation_snippet?.slice(0, 4000) ?? null,
      classifier_meta: args.classifier_meta,
    });
  } catch (e) {
    console.warn('[guardrail] log failed:', (e as Error).message);
  }
}

/**
 * 메인 가드레일 평가. safe 면 null 반환 (정상 처리). 위반 시 GuardrailDecision 반환.
 *
 * 호출 시점: /api/euler-tutor route 의 첫 user 메시지 도착 직후, LLM 호출 직전.
 */
export async function evaluateGuardrail(args: {
  message: string;
  user_id?: string;
  conversation_snippet?: string;
}): Promise<GuardrailDecision | null> {
  const text = args.message?.trim();
  if (!text || text.length < 2) return null; // 너무 짧은 메시지는 무시

  const cls = await classifyMessage(text);

  if (cls.category === 'safe') return null;

  // 위기 메시지 — 즉시 전문 안내 (거부 X, 안전 우선)
  if (cls.category === 'self_harm_crisis') {
    await logViolation({
      user_id: args.user_id,
      message_excerpt: text,
      category: 'self_harm_crisis',
      severity: 'crisis_alert',
      action_taken: '전문 상담 자원 안내 (1393 / 1388 / Wee센터)',
      conversation_snippet: args.conversation_snippet,
      classifier_meta: cls,
    });
    return {
      category: 'self_harm_crisis',
      confidence: cls.confidence,
      message_to_user: CRISIS_MESSAGE,
      severity: 'crisis_alert',
      reason: cls.reason,
    };
  }

  // 일반 위반 — 누적 검사
  const cat = cls.category as Exclude<GuardrailCategory, 'safe' | 'self_harm_crisis'>;
  const standardMessage = STANDARD_MESSAGES[cat] ?? STANDARD_MESSAGES.other;

  let severity: 'warning_1' | 'violation' = 'warning_1';
  if (args.user_id) {
    const recent = await recentViolationCount(args.user_id, cat);
    if (recent >= 1) severity = 'violation'; // 24h 내 같은 카테고리 재위반 → 경고
  }

  await logViolation({
    user_id: args.user_id,
    message_excerpt: text,
    category: cat,
    severity,
    action_taken: severity === 'violation'
      ? `경고 1회 부여 (${cat} 24h 내 반복) — 안내: ${standardMessage.slice(0, 60)}...`
      : `정중한 안내 (${cat} 1차)`,
    conversation_snippet: args.conversation_snippet,
    classifier_meta: cls,
  });

  return {
    category: cat,
    confidence: cls.confidence,
    message_to_user:
      severity === 'violation'
        ? `${standardMessage}\n\n⚠️ 이 카테고리 (${cat}) 의 부적절한 메시지가 24시간 내 재발하여 **경고 1회**가 기록되었습니다. 향후 분쟁 시 본 기록이 근거가 됩니다.`
        : standardMessage,
    severity,
    reason: cls.reason,
  };
}
