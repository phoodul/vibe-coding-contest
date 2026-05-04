import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * /euler* → /legend* 301 영구 redirect 매핑. SEO·외부 링크·즐겨찾기 보존.
 * /api/euler-tutor/** 는 /api/legend/tutor/** 로 이전됨 (16차 D1).
 */
const EULER_TO_LEGEND: Record<string, string> = {
  "/euler": "/legend",
  "/euler-tutor": "/legend",
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

// 2026-05-03 — 프로덕션 도메인 easyedu.ai (apex primary). 레거시 *.vercel.app
// production host 만 정확 매칭하여 301 redirect. www→apex 정규화는 Vercel
// Domains 패널이 처리 (308 redirect) — middleware 에서 다루면 무한 루프 발생.
// preview/branch deploy(*.vercel.app)는 LEGACY_PRODUCTION_HOSTS 미포함이라 영향 없음.
const PRODUCTION_HOST = "easyedu.ai";
const LEGACY_PRODUCTION_HOSTS = new Set([
  "vibe-coding-contest.vercel.app",
]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") ?? "";

  // 레거시 production host → easyedu.ai 영구 redirect (인증 갱신보다 먼저).
  if (LEGACY_PRODUCTION_HOSTS.has(host)) {
    const url = request.nextUrl.clone();
    url.host = PRODUCTION_HOST;
    url.protocol = "https:";
    url.port = "";
    return NextResponse.redirect(url, 301);
  }

  // /euler 계열은 인증 갱신보다 먼저 redirect 수행 — 새 라우트(/legend)에서 auth가 다시 갱신된다.
  // /euler-tutor 는 매핑에 없으므로 영향 X (api 호환 보존).
  if (pathname === "/euler" || pathname.startsWith("/euler/")) {
    const target = resolveLegendRedirect(pathname);
    if (target) {
      const url = request.nextUrl.clone();
      url.pathname = target;
      return NextResponse.redirect(url, 301);
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
