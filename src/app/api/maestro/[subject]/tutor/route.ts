/**
 * 22차 (2026-05-09) — POST /api/maestro/[subject]/tutor.
 *
 * Maestro / Legend 분리 5 phase 의 Phase 2.
 * 사용자 결정: "Maestro와 Legend를 분리해. Maestro 에서도 각 과목별로 모두 분리해."
 *
 * 이전: /api/legend/tutor 안의 isMaestro 분기 (line 218~503) 가 maestro 4 과목을
 * 처리. 본 라우트는 그 분기 코드를 maestro 전용으로 추출 + URL 파라미터 [subject]
 * 사용 (body subject 무시 가능).
 *
 * 흐름:
 *   1. URL [subject] 검증 (maestro 4 과목)
 *   2. body 파싱 (messages·selected_tutor·attached_image_url·data)
 *   3. message content 의 marker ([__MAESTRO_IMG__]URL[/]) 추출
 *   4. 페르소나 → 모델 매핑 (Sonnet/Opus/GPT/Gemini 4 그룹)
 *   5. Vercel Blob get() → base64 inline 이미지
 *   6. buildMaestroSystemPrompt → streamText → DataStreamResponse
 *
 * 의존: lib/maestro/system-prompts (system prompt) + lib/maestro/types (페르소나 union).
 */
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, type LanguageModelV1 } from 'ai';
import { get as blobGet } from '@vercel/blob';
import { buildMaestroSystemPrompt } from '@/lib/maestro/system-prompts';
import {
  ALL_MAESTRO_TUTORS,
  MAESTRO_SONNET_TUTORS,
  MAESTRO_GEMINI_TUTORS,
  MAESTRO_OPUS_TUTORS,
  MAESTRO_GPT_TUTORS,
  type MaestroTutorName,
} from '@/lib/maestro/types';
import { isMaestroSubject } from '@/lib/types/subject';

export const runtime = 'nodejs';
export const maxDuration = 300;

type MaestroSubject = 'physics' | 'chemistry' | 'biology' | 'earth-science';

function maestroErrorResponse(reason: string): Response {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();
      const msg = `⚠️ Maestro 라우트 오류 — ${reason}\n\n관리자에게 이 메시지 그대로 전달해주세요. (debug)`;
      controller.enqueue(encoder.encode(`0:${JSON.stringify(msg)}\n`));
      controller.close();
    },
  });
  return new Response(stream, {
    status: 200,
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ subject: string }> },
) {
  const { subject: subjectParam } = await params;
  if (!isMaestroSubject(subjectParam)) {
    return maestroErrorResponse(`알 수 없는 과목: ${subjectParam}`);
  }
  const maestroSubject = subjectParam as MaestroSubject;

  try {
    const reqBody = await req.json();
    const {
      messages: rawMessages,
      selected_tutor: maestroTutor,
      attached_image_url: attachedImageUrlBody,
      data: chatData,
    } = reqBody;

    if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
      return maestroErrorResponse('messages 가 비어있습니다.');
    }

    // marker 추출 ([__MAESTRO_IMG__]<URL>[/__MAESTRO_IMG__])
    let attachedImageUrlFromMarker: string | undefined;
    const MAESTRO_IMG_RE = /\[__MAESTRO_IMG__\]([\s\S]*?)\[\/__MAESTRO_IMG__\]/;
    for (let i = rawMessages.length - 1; i >= 0; i--) {
      const m = rawMessages[i];
      if (m?.role !== 'user') continue;
      const c = typeof m.content === 'string' ? m.content : '';
      const match = c.match(MAESTRO_IMG_RE);
      if (match) {
        attachedImageUrlFromMarker = match[1].trim();
        m.content = c.replace(MAESTRO_IMG_RE, '').trim();
        break;
      }
    }

    const attachedImageUrl: string | undefined =
      attachedImageUrlFromMarker ??
      (chatData && typeof chatData === 'object' && typeof chatData.imageUrl === 'string'
        ? chatData.imageUrl
        : undefined) ??
      attachedImageUrlBody;
    console.log(
      `[maestro/tutor:${maestroSubject}] attachedImageUrl source: marker=${attachedImageUrlFromMarker ? 'Y' : 'N'} data.imageUrl=${chatData?.imageUrl ? 'Y' : 'N'} body.attached_image_url=${attachedImageUrlBody ? 'Y' : 'N'} → ${attachedImageUrl ? 'Y' : 'N'}`,
    );

    const messages = rawMessages as Array<{ role: string; content: unknown; id?: string }>;

    // 페르소나 검증
    const tutorId =
      typeof maestroTutor === 'string' && (ALL_MAESTRO_TUTORS as readonly string[]).includes(maestroTutor)
        ? (maestroTutor as MaestroTutorName)
        : (() => {
            // subject 별 default 페르소나 (사용자 결정 2026-05-07: Sonnet 위치 = 기본)
            if (maestroSubject === 'earth-science') return 'wegener';
            if (maestroSubject === 'biology') return 'pasteur';
            if (maestroSubject === 'physics') return 'fermi';
            return 'curie'; // chemistry
          })();

    // 수능 기출 메타 추출
    function parseExamMeta():
      | { variant?: 'I' | 'II'; year?: number; number?: number }
      | undefined {
      const firstUser = messages.find((m) => m.role === 'user');
      if (!firstUser) return undefined;
      const text = typeof firstUser.content === 'string' ? firstUser.content : '';
      if (!text) return undefined;
      const subjectKo =
        maestroSubject === 'earth-science'
          ? '지구과학'
          : maestroSubject === 'biology'
            ? '생명과학'
            : maestroSubject === 'physics'
              ? '물리학'
              : '화학';
      const re = new RegExp(
        `\\[(\\d{4})학년도\\s*수능\\s*${subjectKo}\\s*(Ⅰ|Ⅱ|I|II)\\s*(\\d+)번`,
      );
      const m = text.match(re);
      if (!m) return undefined;
      const v = m[2] === 'Ⅰ' || m[2] === 'I' ? 'I' : 'II';
      return { year: parseInt(m[1], 10), variant: v, number: parseInt(m[3], 10) };
    }
    const examMeta = parseExamMeta();

    let maestroSystem: string;
    try {
      maestroSystem = buildMaestroSystemPrompt({
        subject: maestroSubject,
        tutor: tutorId as Parameters<typeof buildMaestroSystemPrompt>[0]['tutor'],
        exam_meta: examMeta,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`[maestro/tutor:${maestroSubject}] buildMaestroSystemPrompt failed:`, msg);
      return maestroErrorResponse(`system prompt build 실패: ${msg.slice(0, 200)}`);
    }

    // 모델 ID — 21차 alias + invalid env 자동 정정
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
    if (geminiId !== rawGeminiId) {
      console.warn(
        `[maestro/tutor:${maestroSubject}] GEMINI_MODEL_ID env "${rawGeminiId}" → 자동 정정 "${geminiId}".`,
      );
    }

    console.log(
      `[maestro/tutor:${maestroSubject}] env check — ANTHROPIC=${process.env.ANTHROPIC_API_KEY ? 'Y' : 'N'} GEMINI=${process.env.GEMINI_API_KEY ? 'Y' : 'N'} OPENAI=${process.env.OPENAI_API_KEY ? 'Y' : 'N'} | model IDs sonnet=${sonnetId} opus=${opusId} gpt=${gptId} gemini=${geminiId}`,
    );

    let maestroModel: LanguageModelV1;
    let actualProvider: 'sonnet' | 'opus' | 'gpt' | 'gemini';
    try {
      if ((MAESTRO_SONNET_TUTORS as readonly string[]).includes(tutorId)) {
        maestroModel = anthropic(sonnetId) as LanguageModelV1;
        actualProvider = 'sonnet';
      } else if ((MAESTRO_OPUS_TUTORS as readonly string[]).includes(tutorId)) {
        maestroModel = anthropic(opusId) as LanguageModelV1;
        actualProvider = 'opus';
      } else if ((MAESTRO_GPT_TUTORS as readonly string[]).includes(tutorId)) {
        maestroModel = openai(gptId) as LanguageModelV1;
        actualProvider = 'gpt';
      } else if ((MAESTRO_GEMINI_TUTORS as readonly string[]).includes(tutorId)) {
        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (!geminiApiKey || geminiApiKey.length === 0) {
          throw new Error(
            'Gemini 인물은 GEMINI_API_KEY 가 필요해요. 다른 거장을 선택해 주세요. 관리자: Vercel env 추가 후 자동 활성화됩니다.',
          );
        }
        const googleClient = createGoogleGenerativeAI({ apiKey: geminiApiKey });
        maestroModel = googleClient(geminiId, {
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          ],
        }) as unknown as LanguageModelV1;
        actualProvider = 'gemini';
      } else {
        console.warn(`[maestro/tutor:${maestroSubject}] unknown tutor=${tutorId} → Opus fallback`);
        maestroModel = anthropic(opusId) as LanguageModelV1;
        actualProvider = 'opus';
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return maestroErrorResponse(msg.slice(0, 300));
    }
    console.log(`[maestro/tutor:${maestroSubject}] tutor=${tutorId} → provider=${actualProvider}`);

    // image fetch + base64 inline (vision)
    let finalMessages: Array<unknown>;
    if (
      typeof attachedImageUrl === 'string' &&
      attachedImageUrl.length > 0 &&
      messages.length > 0
    ) {
      let lastUserIdx = -1;
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === 'user') {
          lastUserIdx = i;
          break;
        }
      }
      if (lastUserIdx === -1) {
        finalMessages = messages;
      } else {
        const lastUser = messages[lastUserIdx];
        const lastUserText =
          typeof lastUser.content === 'string'
            ? lastUser.content
            : '이 문제를 함께 풀어주세요.';

        let imageContent = '';
        let imageFetchOk = false;
        const fetchT0 = Date.now();
        try {
          const result = await blobGet(attachedImageUrl, { access: 'public' });
          if (!result || result.statusCode !== 200) {
            throw new Error(`statusCode=${result?.statusCode ?? 'null'}`);
          }
          const reader = result.stream.getReader();
          const chunks: Uint8Array[] = [];
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) chunks.push(value);
          }
          const totalLen = chunks.reduce((sum, c) => sum + c.length, 0);
          const merged = new Uint8Array(totalLen);
          let offset = 0;
          for (const c of chunks) {
            merged.set(c, offset);
            offset += c.length;
          }
          const base64 = Buffer.from(merged).toString('base64');
          imageContent = base64;
          imageFetchOk = true;
          console.log(
            `[maestro/tutor:${maestroSubject}] blob.get() OK ${Date.now() - fetchT0}ms — base64.length=${base64.length} (${(base64.length / 1024).toFixed(1)}KB)`,
          );
        } catch (e) {
          console.error(
            `[maestro/tutor:${maestroSubject}] blob.get() fail (image-less fallback): ${(e as Error).message} URL=${attachedImageUrl.slice(0, 80)}`,
          );
        }

        const partsList: Array<
          | { type: 'image'; image: string | URL; mimeType?: string }
          | { type: 'text'; text: string }
        > = [];
        if (imageFetchOk) {
          partsList.push({ type: 'image', image: imageContent, mimeType: 'image/png' });
          partsList.push({ type: 'text', text: lastUserText });
        } else {
          partsList.push({
            type: 'text',
            text: `${lastUserText}\n\n(시스템: 시험지 이미지를 일시적으로 불러오지 못했어요. 학생에게 시험지를 직접 첨부하거나 문제를 텍스트로 알려달라고 안내해주세요.)`,
          });
        }
        const newLastUser = { role: 'user' as const, content: partsList };
        finalMessages = [
          ...messages.slice(0, lastUserIdx),
          newLastUser,
          ...messages.slice(lastUserIdx + 1),
        ];
      }
    } else {
      finalMessages = messages;
    }

    console.log(
      `[maestro/tutor:${maestroSubject}] streamText 시작 — provider=${actualProvider} system.length=${maestroSystem.length}`,
    );
    const streamT0 = Date.now();
    const resultStream = streamText({
      model: maestroModel,
      system: maestroSystem,
      messages: finalMessages as Parameters<typeof streamText>[0]['messages'],
      onError: (event) => {
        console.error(`[maestro/tutor:${maestroSubject}] streamText onError:`, JSON.stringify(event));
      },
      onFinish: (result) => {
        console.log(
          `[maestro/tutor:${maestroSubject}] streamText onFinish ${Date.now() - streamT0}ms — finishReason=${result.finishReason} text.length=${result.text?.length ?? 0} usage=${JSON.stringify(result.usage)}`,
        );
      },
    });
    return resultStream.toDataStreamResponse({
      getErrorMessage: (error) => {
        console.error(`[maestro/tutor:${maestroSubject}] toDataStream error:`, error);
        const msg = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
        return `⚠️ Maestro 모델 응답 실패 — ${msg.slice(0, 300)}`;
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    console.error(`[maestro/tutor:${maestroSubject}] caught:`, msg, e);
    return maestroErrorResponse(msg.slice(0, 400));
  }
}
