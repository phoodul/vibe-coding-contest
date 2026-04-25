import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { retrieveTools, type RetrieveArgs } from "@/lib/euler/retriever";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as RetrieveArgs;
    const tools = await retrieveTools({
      conditions: body.conditions ?? [],
      goal: body.goal,
      direction: body.direction ?? "both",
      topK: Math.min(body.topK ?? 5, 20),
    });

    return NextResponse.json({ tools, count: tools.length });
  } catch (err) {
    console.error("euler-tools-search error:", err);
    return NextResponse.json({ error: "Tool search 실패" }, { status: 500 });
  }
}
