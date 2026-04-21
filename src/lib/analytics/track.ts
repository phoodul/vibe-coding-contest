"use client";

import { createClient } from "@/lib/supabase/client";

type EventType = "open" | "generate" | "complete" | "error" | "action";

const SESSION_KEY = "eduflow_sid";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = sessionStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

export async function track(
  feature: string,
  event: EventType = "open",
  metadata: Record<string, unknown> = {}
): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("usage_events").insert({
      user_id: user?.id ?? null,
      session_id: getSessionId(),
      feature,
      event,
      path: window.location.pathname,
      metadata,
    });
  } catch {
    // 분석 실패는 사용자 경험을 방해하지 않는다
  }
}
