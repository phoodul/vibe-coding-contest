import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runCritic } from "@/lib/euler/critic-client";
import { retrieveTools } from "@/lib/euler/retriever";
import type { StudentStep } from "@/lib/ai/euler-critic-prompt";

export const maxDuration = 30;

interface DiagnoseRequest {
  problem: string;
  studentSteps: StudentStep[];
  /** Manager 가 추출한 조건 (있으면 retrieved_tools 자동 부착에 사용) */
  conditions?: string[];
  /** Manager 가 추출한 목표 */
  goal?: string;
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as DiagnoseRequest;
    if (!body.problem || !Array.isArray(body.studentSteps) || body.studentSteps.length === 0) {
      return NextResponse.json(
        { error: "problem + studentSteps[] required" },
        { status: 400 }
      );
    }

    // retrieved_tools 자동 부착 — recall vs trigger 판별 보조
    let stepsWithRetrieved = body.studentSteps;
    if (body.conditions || body.goal) {
      try {
        const tools = await retrieveTools({
          conditions: body.conditions ?? [],
          goal: body.goal,
          direction: "both",
          topK: 5,
        });
        if (tools.length) {
          const retrievedNames = tools.map((t) => t.tool_name);
          // 마지막 step 에 retrieved_tools 주입 (이미 있으면 보존)
          stepsWithRetrieved = body.studentSteps.map((s, i, arr) =>
            i === arr.length - 1 && !s.retrieved_tools
              ? { ...s, retrieved_tools: retrievedNames }
              : s
          );
        }
      } catch (e) {
        console.warn("[diagnose] retriever skipped:", e);
      }
    }

    const result = await runCritic({
      problem: body.problem,
      studentSteps: stepsWithRetrieved,
      mode: "diagnose",
    });

    if (!result || result.mode !== "diagnose") {
      return NextResponse.json(
        { error: "Critic diagnose failed" },
        { status: 502 }
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("euler-diagnose error:", err);
    return NextResponse.json({ error: "Diagnose 호출 실패" }, { status: 500 });
  }
}
