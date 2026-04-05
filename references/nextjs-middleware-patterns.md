# Next.js 15 Middleware 패턴 레퍼런스

> 프로젝트 초기화 후 바로 복사-붙여넣기할 수 있는 실전 미들웨어 코드

---

## 1. Supabase Auth 세션 갱신 미들웨어 (필수)

Server Components는 쿠키를 직접 쓸 수 없으므로, 만료된 Auth 토큰을 갱신하고 저장하는 미들웨어가 **반드시** 필요하다.

### 역할
1. `supabase.auth.getUser()`로 토큰 갱신 (getSession이 아님!)
2. `request.cookies.set()`으로 Server Components에 갱신된 토큰 전달
3. `response.cookies.set()`으로 브라우저에 새 토큰 전달

### middleware.ts (프로젝트 루트)

```typescript
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 중요: getSession() 대신 getUser()를 사용해야 토큰 재검증이 보장됨
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 보호된 라우트: 미인증 사용자 리다이렉트
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/signup') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    request.nextUrl.pathname !== '/'
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // 정적 파일과 이미지 제외
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

## 2. Supabase 클라이언트 유틸리티

### lib/supabase/server.ts (Server Components용)

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component에서 호출 시 무시 (미들웨어가 처리)
          }
        },
      },
    }
  )
}
```

### lib/supabase/client.ts (Client Components용)

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

---

## 3. Rate Limiting 미들웨어 (AI API 비용 보호)

AI API 호출이 많은 프로젝트에서 비용 폭탄을 방지한다.
Upstash Redis + `@upstash/ratelimit`이 Edge 호환 표준.

### 설치

```bash
npm install @upstash/ratelimit @upstash/redis
```

### lib/rate-limit.ts

용도별 다른 임계값을 설정하는 것이 권장됨:

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()
// 환경 변수: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN

// 일반 API — 넉넉하게
export const generalLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '10 s'),
  analytics: true,
})

// AI 엔드포인트 — 비용 보호용으로 엄격하게
export const aiLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '10 s'),
  analytics: true,
})

// 인증 엔드포인트 — 브루트포스 방지용 매우 엄격
export const authLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '60 s'),
  analytics: true,
})
```

### API Route에서 사용 (app/api/chat/route.ts)

```typescript
import { ratelimit } from '@/lib/rate-limit'

export async function POST(req: Request) {
  // IP 기반 rate limiting
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1'
  const { success, limit, remaining } = await ratelimit.limit(ip)

  if (!success) {
    return new Response('Too many requests', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
      },
    })
  }

  // ... AI 로직 계속
}
```

---

## 4. 보안 헤더 미들웨어 (next.config.ts)

Lighthouse 보안 점수와 심사 가산점을 위한 보안 헤더.

### next.config.ts

```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ]
  },
}
```

---

## 5. 미들웨어 조합 순서

실제 프로젝트에서는 하나의 `middleware.ts`에 순서대로 조합한다:

```
요청 진입
    ↓
[1] Rate Limiting 체크 (429 반환 or 통과)
    ↓
[2] Supabase 세션 갱신 (토큰 refresh)
    ↓
[3] 라우트 보호 (미인증 → /login 리다이렉트)
    ↓
[4] 응답 반환
```

> **주의:** 미들웨어는 보안 경계가 아니다. 실제 auth 검사는 Route Handlers와 Server Actions에도 반드시 있어야 한다.
