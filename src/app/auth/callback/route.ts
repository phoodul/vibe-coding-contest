import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // 소셜 로그인 시 프로필 자동 생성
      const meta = data.user.user_metadata;
      await supabase.from("profiles").upsert({
        id: data.user.id,
        display_name: meta?.full_name || meta?.name || meta?.preferred_username || data.user.email?.split("@")[0] || "사용자",
        role: "student", // 기본값 학생, 교사는 별도 전환
      }, { onConflict: "id" });

      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // 에러 시 로그인 페이지로
  return NextResponse.redirect(`${origin}/login`);
}
