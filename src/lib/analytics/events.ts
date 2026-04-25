/**
 * Phase B-15: Euler Tutor 분석 이벤트 enum + 서버 트래킹 헬퍼.
 *
 * 클라이언트는 기존 `track(feature, event, metadata)` (track.ts) 사용.
 * 서버는 `trackServerEvent(supabase, ...)` 사용 — fire-and-forget 안전망.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export const EULER_EVENTS = {
  MANAGER_CLASSIFIED: "manager_classified",
  TOOL_RETRIEVED: "tool_retrieved",
  CANDIDATE_REPORTED: "candidate_reported",
  CRITIC_VERIFIED: "critic_verified",
  CRITIC_REJECTED: "critic_rejected",
  HANDWRITE_SUBMITTED: "handwrite_submitted",
} as const;

export type EulerEvent = (typeof EULER_EVENTS)[keyof typeof EULER_EVENTS];

/**
 * 서버 라우트에서 비동기 이벤트 기록 (실패해도 메인 흐름 무영향).
 * 클라이언트 track() 함수와 동일한 usage_events 스키마에 insert.
 */
export async function trackServerEvent(
  supabase: SupabaseClient,
  args: {
    user_id: string | null;
    feature: string; // 'euler' | 'euler_canvas' | ...
    event: string; // EulerEvent value
    path?: string | null;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  try {
    await supabase.from("usage_events").insert({
      user_id: args.user_id,
      session_id: null, // 서버는 세션 ID 없음
      feature: args.feature,
      event: args.event,
      path: args.path ?? null,
      metadata: args.metadata ?? {},
    });
  } catch {
    // 분석 실패는 무시
  }
}
