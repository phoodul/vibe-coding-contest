import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Phase G-06 — /euler → /legend 302 redirect 매핑.
 *
 * 베이스: docs/architecture-g06-legend.md §8.1.
 * 정책: 302 임시 (베타 단계 SEO 영향 적음). M7 (G06-25) 에서 301 영구 전환.
 * 제외: /euler-tutor (api 호환 보존, §8.2). 본 매핑에 포함되지 않으므로 그대로 유지.
 */
const EULER_TO_LEGEND: Record<string, string> = {
  "/euler": "/legend",
  "/euler/canvas": "/legend/canvas",
  "/euler/billing": "/legend/billing",
  "/euler/family": "/legend/family",
  "/euler/beta": "/legend/beta",
  "/euler/report": "/legend/report",
};

function resolveLegendRedirect(pathname: string): string | null {
  const exact = EULER_TO_LEGEND[pathname];
  if (exact) return exact;

  // /euler/canvas/<slug> 같은 동적 하위 경로도 redirect 보존 (베타 즐겨찾기 무파괴).
  for (const [from, to] of Object.entries(EULER_TO_LEGEND)) {
    if (pathname.startsWith(`${from}/`)) {
      return `${to}${pathname.slice(from.length)}`;
    }
  }
  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /euler 계열은 인증 갱신보다 먼저 redirect 수행 — 새 라우트(/legend)에서 auth가 다시 갱신된다.
  // /euler-tutor 는 매핑에 없으므로 영향 X (api 호환 보존).
  if (pathname === "/euler" || pathname.startsWith("/euler/")) {
    const target = resolveLegendRedirect(pathname);
    if (target) {
      const url = request.nextUrl.clone();
      url.pathname = target;
      return NextResponse.redirect(url, 302);
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
