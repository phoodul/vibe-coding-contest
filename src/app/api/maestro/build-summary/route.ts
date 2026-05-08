/**
 * 22차 (2026-05-08) — POST /api/maestro/build-summary.
 *
 * 사용자 신고: "고난도 문제 한 문제를 풀고 난 다음에 풀이를 정리해주는 기능이 maestro에 없어."
 *
 * Legend 의 build-summary 는 routeProblem (수학 area/layer) + callTutor (5-step agentic) +
 * buildReport (ToT 트리) 등 수학 전용 인프라 의존. Maestro 는 가벼운 정리 호출:
 *   - structured output (JSON) 한 번
 *   - 풀이 응답을 만든 페르소나 모델 그대로 재사용 (학생 입장 일관성)
 *   - 과목별 정리 차원 (물리: 단위·차원·함정 / 화학: 계수·평형 / 생물: 유전 비율 / 지구: 도표)
 *
 * 흐름:
 *   1. 인증 가드
 *   2. body 파싱 (subject·tutor·problem_text·conversation 필수)
 *   3. 페르소나 → 모델 매핑 (maestro tutor route 와 동일 분기)
 *   4. generateObject (Sonnet/Opus/Gemini/GPT) → MaestroSummary 반환
 *   5. JSON 응답 (DB 누적 X — 다음 commit 으로 분리)
 */
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 90;

type MaestroSubject = 'earth-science' | 'biology' | 'physics' | 'chemistry';

const SONNET_TUTORS = ['wegener', 'pasteur', 'fermi', 'curie'];
const GEMINI_TUTORS = ['galilei', 'mendel', 'einstein', 'lavoisier'];
const OPUS_TUTORS = ['hubble', 'watson', 'feynman', 'pauling'];
const GPT_TUTORS = ['sagan', 'darwin', 'newton', 'mendeleev'];
const ALL_MAESTRO_TUTORS = [
  ...SONNET_TUTORS,
  ...GEMINI_TUTORS,
  ...OPUS_TUTORS,
  ...GPT_TUTORS,
];

const VALID_SUBJECTS: MaestroSubject[] = [
  'earth-science',
  'biology',
  'physics',
  'chemistry',
];

const TUTOR_LABEL: Record<string, string> = {
  wegener: '베게너',
  galilei: '갈릴레이',
  hubble: '허블',
  sagan: '칼 세이건',
  pasteur: '파스퇴르',
  mendel: '멘델',
  watson: '왓슨',
  darwin: '다윈',
  fermi: '페르미',
  einstein: '아인슈타인',
  feynman: '파인만',
  newton: '뉴턴',
  curie: '마리 퀴리',
  lavoisier: '라부아지에',
  pauling: '폴링',
  mendeleev: '멘델레예프',
};

/**
 * 과목별 정리 차원 — system prompt 에 주입.
 * pitfalls 는 입시 단골 함정. next_practice 는 한 단계 위 학습 권장.
 */
const SUBJECT_SUMMARY_GUIDE: Record<MaestroSubject, string> = {
  physics: `
- key_concepts: 사용한 물리 법칙·공식 (예: "운동량 보존", "F=ma", "에너지 보존") 3-5개
- solution_steps: 풀이 단계마다 "어떤 양을 어떤 식으로 구했는지" 명시. 단위·차원 검증을 마지막 단계에 포함
- pitfalls: 단위 혼동 (m vs kg·m, J vs N·m), 부호 (벡터 방향), 근사 가정 등 1-2개
- persona_takeaway: 페르소나 시점의 한 줄 핵심 ("페르미식 자릿수 검증으로 보면..." 등)
`,
  chemistry: `
- key_concepts: 핵심 화학 개념 3-5개 (예: "산화수 변화", "Le Chatelier", "전자배치"). 분자식은 \\ce{} 으로
- solution_steps: 계수 맞추기 → 양적 관계 → 답 도출. 평형 화살표는 \\ce{<=>}
- pitfalls: 계수 누락, 산화수 부호, 몰비 오인, 산-염기 짝 1-2개
- persona_takeaway: 페르소나 시점 (예: 라부아지에의 "질량 보존이 보이는가?")
`,
  biology: `
- key_concepts: 핵심 생물 개념 3-5개 (예: "독립의 법칙", "세포 호흡", "면역 반응")
- solution_steps: 가설→증거→결론 단계. 유전자형은 \\text{AaBb}, 비율은 9:3:3:1 형식
- pitfalls: 우열 표기 혼동, 가계도 인접 세대만 보기, 항원-항체 대응 오인 1-2개
- persona_takeaway: 페르소나 시점 (예: 멘델의 "두 형질이 독립적인가?")
`,
  'earth-science': `
- key_concepts: 핵심 지구과학 개념 3-5개 (예: "판 경계 종류", "엘니뇨", "별의 진화"). 단위·고유명사는 \\text{}
- solution_steps: 도표→자료 정리→개념 매칭→답. 좌표 (35°N, 127°E) 형식
- pitfalls: 자료 축 단위 오인, 시간 척도 (수십만 년 vs 수십억 년), 위·경도 부호 1-2개
- persona_takeaway: 페르소나 시점 (예: 베게너의 "대륙은 움직였는가, 멈췄는가?")
`,
};

const MaestroSummarySchema = z.object({
  key_concepts: z
    .array(z.string())
    .min(2)
    .max(6)
    .describe('이 문제에서 핵심으로 쓰인 개념·공식·법칙 3-5개. 한 줄씩.'),
  solution_steps: z
    .array(
      z.object({
        step: z.number().int().min(1).max(7),
        title: z.string().describe('이 단계의 한 줄 요약 (10-25자).'),
        explanation: z
          .string()
          .describe('이 단계에서 무엇을 어떤 식으로 구했는지 1-3 문장. KaTeX 수식 사용.'),
      }),
    )
    .min(3)
    .max(7)
    .describe('풀이를 학생이 다시 따라할 수 있도록 정리한 단계.'),
  pitfalls: z
    .array(z.string())
    .min(1)
    .max(3)
    .describe('이 문제에서 학생이 자주 빠지는 함정 1-2개. 한 줄씩.'),
  next_practice: z
    .array(z.string())
    .min(1)
    .max(3)
    .describe('이 풀이를 마친 학생에게 다음 학습 권장 1-2개. 단원·문제 유형 명시.'),
  persona_takeaway: z
    .string()
    .describe('페르소나 시점에서의 한 줄 핵심 메시지 (50-120자). 학생을 격려하는 톤.'),
});

interface BuildSummaryRequestBody {
  subject?: string;
  tutor?: string;
  problem_text?: string;
  conversation?: Array<{ role: string; content: unknown }>;
}

function getModel(tutor: string) {
  // 21차 fix 의 alias ID 그대로 재사용. env 미설정 시 default.
  const sonnetId = process.env.ANTHROPIC_SONNET_MODEL_ID || 'claude-sonnet-4-6';
  const opusId = process.env.ANTHROPIC_OPUS_MODEL_ID || 'claude-opus-4-7';
  const gptId = process.env.OPENAI_MODEL_ID || 'gpt-5.5';
  const rawGeminiId = process.env.GEMINI_MODEL_ID || 'gemini-3.1-pro-preview';
  const geminiIdMap: Record<string, string> = {
    'gemini-3-1-pro': 'gemini-3.1-pro-preview',
    'gemini-3-pro': 'gemini-3-pro-preview',
    'gemini-3.1-pro': 'gemini-3.1-pro-preview',
  };
  const geminiId = geminiIdMap[rawGeminiId] || rawGeminiId;

  if (SONNET_TUTORS.includes(tutor)) return anthropic(sonnetId);
  if (OPUS_TUTORS.includes(tutor)) return anthropic(opusId);
  if (GPT_TUTORS.includes(tutor)) return openai(gptId);
  if (GEMINI_TUTORS.includes(tutor)) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY env 누락 — 정리는 다른 거장으로 시도해 주세요.');
    }
    const googleClient = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
    return googleClient(geminiId, {
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      ],
    });
  }
  // 알 수 없는 tutor → Opus fallback (사용자 정책: 최고 모델)
  return anthropic(opusId);
}

function formatConversation(
  messages: Array<{ role: string; content: unknown }>,
): string {
  // 마커 ([__MAESTRO_IMG__]URL[/__MAESTRO_IMG__]) 제거 + 텍스트만 추출.
  const lines: string[] = [];
  for (const m of messages) {
    const text =
      typeof m.content === 'string'
        ? m.content.replace(/\[__MAESTRO_IMG__\][^[]*\[\/__MAESTRO_IMG__\]/g, '').trim()
        : '';
    if (!text) continue;
    const role = m.role === 'user' ? '학생' : '거장';
    lines.push(`${role}: ${text}`);
  }
  return lines.join('\n\n');
}

export async function POST(req: Request) {
  // 1. 인증 가드
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  // 2. body 파싱
  let body: BuildSummaryRequestBody;
  try {
    body = (await req.json()) as BuildSummaryRequestBody;
  } catch {
    return Response.json({ error: 'invalid_input' }, { status: 400 });
  }
  const subject = body.subject as MaestroSubject;
  const tutor = body.tutor;
  const problemText = body.problem_text;
  const conversation = body.conversation;

  if (!subject || !VALID_SUBJECTS.includes(subject)) {
    return Response.json(
      { error: 'invalid_subject', message: 'subject 가 maestro 4 과목 중 하나여야 합니다.' },
      { status: 400 },
    );
  }
  if (!tutor || !ALL_MAESTRO_TUTORS.includes(tutor)) {
    return Response.json(
      { error: 'invalid_tutor', message: '페르소나 식별이 잘못되었습니다.' },
      { status: 400 },
    );
  }
  if (!problemText || typeof problemText !== 'string' || !problemText.trim()) {
    return Response.json(
      { error: 'invalid_input', message: '문제 텍스트가 비어있습니다.' },
      { status: 400 },
    );
  }
  if (!Array.isArray(conversation) || conversation.length < 2) {
    return Response.json(
      {
        error: 'conversation_too_short',
        message: '대화가 충분하지 않아 풀이 정리를 만들 수 없습니다. 한 단계 더 풀어보고 다시 시도해 주세요.',
      },
      { status: 400 },
    );
  }

  // 3. 페르소나 → 모델 매핑
  let model;
  try {
    model = getModel(tutor);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'model_unavailable';
    return Response.json({ error: 'model_unavailable', message }, { status: 503 });
  }

  const personaLabel = TUTOR_LABEL[tutor] ?? tutor;
  const subjectKo =
    subject === 'physics'
      ? '물리학'
      : subject === 'chemistry'
        ? '화학'
        : subject === 'biology'
          ? '생명과학'
          : '지구과학';
  const guide = SUBJECT_SUMMARY_GUIDE[subject];
  const conversationText = formatConversation(conversation);

  const systemPrompt = `당신은 ${personaLabel} 페르소나의 ${subjectKo} 거장입니다. 학생과 함께 푼 한 문제의 풀이를 정리합니다.
출력은 학생이 이 풀이를 다시 보고 스스로 따라갈 수 있도록 깔끔하게 구조화하세요.
${guide}

규칙:
- 핵심 개념·풀이 단계는 KaTeX 수식 사용. 화학식은 \\ce{}, 단위는 \\,\\mathrm{}.
- 학생이 입력한 식 (\`F=ma\`, \`H2O\`) 은 인접 표기·plain text 그대로 의미 보존.
- pitfalls·next_practice 는 입시 관점에서 실제로 발생하는 함정·다음 학습.
- persona_takeaway 는 ${personaLabel} 자신의 시점 + 학생을 격려하는 톤.`;

  const userPrompt = `[원문제]
${problemText}

[학생-거장 대화 이력]
${conversationText}

위 대화를 토대로 풀이 정리 객체 (key_concepts·solution_steps·pitfalls·next_practice·persona_takeaway) 를 생성하세요.`;

  try {
    const { object } = await generateObject({
      model,
      schema: MaestroSummarySchema,
      system: systemPrompt,
      prompt: userPrompt,
      maxRetries: 1,
    });

    // 22차 Phase 5 — maestro_summaries 누적. SQL 적용 전 silent fail.
    try {
      await supabase.from('maestro_summaries').insert({
        user_id: user.id,
        subject,
        tutor,
        problem_text: problemText.slice(0, 4000),
        summary: object,
      });
    } catch (e) {
      console.warn(
        '[maestro/build-summary] insert 실패 (SQL 미적용?):',
        (e as Error).message,
      );
    }

    return Response.json({
      subject,
      tutor,
      tutor_label: personaLabel,
      summary: object,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'build_summary_failed';
    console.warn('[maestro/build-summary] failed:', message);
    return Response.json(
      { error: 'build_summary_failed', message },
      { status: 500 },
    );
  }
}
