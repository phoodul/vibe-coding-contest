/**
 * Phase G-06 — SSE 메시지 빌더 + ReadableStream 헬퍼.
 *
 * 베이스 문서: docs/architecture-g06-legend.md §7.2 (SSE 메시지 형식).
 *
 * 메시지 종류:
 *   - stage_progress: 라우팅 단계 (Stage 0/1/2) 진행 신호
 *   - route_decided : 최종 라우팅 결정 (튜터/티어/decision_id/escalation_prompt 동봉)
 *   - error         : 라우팅 실패
 *
 * 표준 SSE 형식: `data: <json>\n\n`. content-type 은 호출처에서 `text/event-stream` 으로 지정.
 */
import type { TutorName, Tier, EscalationPrompt } from './types';
import type { FallbackEvent } from './tutor-fallback';

export type SSEEvent =
  | {
      type: 'stage_progress';
      stage: 0 | 1 | 2;
      payload: { reached: boolean };
    }
  | {
      type: 'route_decided';
      payload: {
        tutor: TutorName;
        tier: Tier;
        routing_decision_id: string;
        escalation_prompt?: EscalationPrompt;
      };
    }
  | {
      // G06-11 — /solve 스트림: 튜터 turn 단위 메시지 (UI 진행 가시화)
      type: 'tutor_turn';
      payload: { turn: number; content: string };
    }
  | {
      // G06-11 — /solve 스트림: 도구 호출 결과 (UI 배지 표시)
      type: 'tool_call';
      payload: { tool_id: string; ok: boolean };
    }
  | {
      // G06-11 — /solve 스트림: 1단계 자동 fallback 발생 가시화
      type: 'fallback';
      payload: FallbackEvent;
    }
  | {
      // G06-11 — /solve 스트림 종료 메시지
      type: 'final';
      payload: {
        answer: string;
        session_id: string;
        actual_tutor?: TutorName;
      };
    }
  | {
      type: 'error';
      payload: { message: string };
    };

export function sseEncode(event: SSEEvent): Uint8Array {
  const text = `data: ${JSON.stringify(event)}\n\n`;
  return new TextEncoder().encode(text);
}

export interface SSEStream {
  stream: ReadableStream<Uint8Array>;
  write: (event: SSEEvent) => void;
  close: () => void;
}

/**
 * 새 SSE ReadableStream 생성.
 * write/close 는 호출자가 비동기 작업 결과를 stream 으로 흘려보내는 데 사용.
 */
export function createSSEStream(): SSEStream {
  let controller: ReadableStreamDefaultController<Uint8Array> | null = null;
  let closed = false;

  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      controller = c;
    },
    cancel() {
      closed = true;
    },
  });

  return {
    stream,
    write: (event) => {
      if (closed || !controller) return;
      try {
        controller.enqueue(sseEncode(event));
      } catch {
        // stream 이 이미 닫혔으면 무시
        closed = true;
      }
    },
    close: () => {
      if (closed || !controller) return;
      closed = true;
      try {
        controller.close();
      } catch {
        // 이미 닫혔으면 무시
      }
    },
  };
}
