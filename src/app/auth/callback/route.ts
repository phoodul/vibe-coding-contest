import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // OAuth 에러가 URL 파라미터로 올 경우
  if (error) {
    const msg = encodeURIComponent(errorDescription || error);
    return NextResponse.redirect(`${origin}/login?error=${msg}`);
  }

  if (code) {
    try {
      const supabase = await createClient();
      const { data, error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error("OAuth exchange error:", exchangeError.message);
        const msg = encodeURIComponent(exchangeError.message);
        return NextResponse.redirect(`${origin}/login?error=${msg}`);
      }

      if (data.user) {
        // 소셜 로그인 시 프로필 자동 생성
        const meta = data.user.user_metadata;
        await supabase.from("profiles").upsert(
          {
            id: data.user.id,
            display_name:
              meta?.full_name ||
              meta?.name ||
              meta?.preferred_username ||
              data.user.email?.split("@")[0] ||
              "사용자",
            role: "student",
          },
          { onConflict: "id" }
        );

        return NextResponse.redirect(`${origin}/dashboard`);
      }
    } catch (err) {
      console.error("OAuth callback error:", err);
      const msg = encodeURIComponent("인증 처리 중 오류가 발생했습니다.");
      return NextResponse.redirect(`${origin}/login?error=${msg}`);
    }
  }

  // code가 없는 경우
  return NextResponse.redirect(`${origin}/login`);
}
