# Hooks & Middleware Research Report (2026-04-05)

> Next.js 15 + Supabase + Vercel AI SDK + Framer Motion 스택 기준
> 검증된(battle-tested) 도구와 패턴만 수록

---

## 1. Claude Code Hooks -- Best Practices & Production Patterns

### 1-1. 전체 Hook Event 목록 (2026 기준, 총 26개)

| Event | 실행 시점 | 차단 가능 | 주요 용도 |
|-------|----------|----------|----------|
| `SessionStart` | 새 세션/재개 | No | 환경 변수 설정, 인사 |
| `InstructionsLoaded` | CLAUDE.md 로드 시 | No | 로깅 |
| `UserPromptSubmit` | 사용자 프롬프트 제출 | **Yes** | 프롬프트 필터링 |
| **`PreToolUse`** | 도구 실행 전 | **Yes** | **보안 게이트 (핵심)** |
| `PermissionRequest` | 권한 다이얼로그 표시 | **Yes** | 자동 승인/거부 |
| `PermissionDenied` | auto 모드 거부 | No | 로깅 |
| **`PostToolUse`** | 도구 성공 후 | No | **품질 게이트 (핵심)** |
| `PostToolUseFailure` | 도구 실패 후 | No | 실패 분석 |
| `Notification` | 알림 발송 | No | 커스텀 알림 |
| `SubagentStart/Stop` | 서브에이전트 시작/종료 | Start: No, Stop: Yes | 에이전트 제어 |
| `TaskCreated/Completed` | 태스크 생성/완료 | **Yes** | 태스크 필터링 |
| **`Stop`** | Claude 응답 완료 | **Yes** | **빌드/테스트 체크** |
| `StopFailure` | API 에러로 턴 종료 | No | 에러 알림 |
| `PreCompact/PostCompact` | 컨텍스트 압축 전/후 | No | 상태 저장 |
| `SessionEnd` | 세션 종료 | No | 정리 작업 |

### 1-2. 핵심 규칙: Exit Code 의미

| Exit Code | 의미 | JSON 처리 |
|-----------|------|----------|
| **0** | 성공/허용 | stdout에서 JSON 파싱 |
| **2** | **차단** (PreToolUse에서만 강제력) | JSON 무시, stderr를 Claude에 전달 |
| 기타 (1 등) | 비차단 에러 | stderr는 verbose 모드에서만 표시 |

**치명적 실수: exit 1 vs exit 2**
- `exit 1`은 경고만 로깅하고 **실행을 차단하지 않음**
- 보안 훅에서 `exit 1`을 쓰면 "안전한 척"만 하고 실제로는 무방비
- 모든 보안 PreToolUse 훅은 반드시 **`exit 2`** 사용

### 1-3. 현재 프로젝트 설정 분석 & 개선 제안

현재 `.claude/settings.local.json`에 3개 훅이 설정되어 있다.

**현재 설정:**
- `PreToolUse > Bash`: security-guard.sh (위험 명령어 차단)
- `PostToolUse > Edit|Write`: post-edit-lint.sh (tsc --noEmit)
- `Stop`: stop-build-check.sh (next build 확인)

**개선 포인트:**

1. **`if` 조건 활용으로 불필요한 프로세스 스폰 방지:**
```json
{
  "matcher": "Bash",
  "hooks": [{
    "type": "command",
    "if": "Bash(rm *)",
    "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/security-guard.sh",
    "timeout": 10
  }]
}
```

2. **환경 변수로 경로 이식성 확보:** `post-edit-lint.sh`와 `stop-build-check.sh`에 하드코딩된 경로 대신 `$CLAUDE_PROJECT_DIR` 사용

3. **Stop 훅에서 `next build`는 무거움:** 7일 대회에서 매 Stop마다 풀 빌드는 과도함. `tsc --noEmit`으로 교체 또는 `.ts/.tsx` 변경이 있을 때만 조건부 실행(현재도 조건부이나 build 대신 typecheck가 적절)

4. **추가 권장 훅:**
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{
          "type": "command",
          "if": "Write(.env*)|Edit(.env*)",
          "command": "echo 'BLOCKED: .env 파일 수정 시도' >&2 && exit 2",
          "timeout": 5
        }]
      }
    ]
  }
}
```

### 1-4. 해커톤 팀들이 사용하는 효과적인 훅 패턴

| 훅 | 패턴 | 효과 |
|----|------|------|
| PreToolUse(Bash) | 위험 명령어 차단 | `rm -rf`, `git push --force main`, `curl \| bash` 방지 |
| PreToolUse(Write/Edit) | `.env`, `middleware.ts` 보호 | 핵심 파일 무단 수정 방지 |
| PostToolUse(Edit/Write) | `tsc --noEmit` 실행 | 타입 에러 즉시 피드백 -> AI가 자동 수정 |
| Stop | 변경 파일이 있을 때 typecheck | 응답 완료 시 전체 정합성 확인 |
| SessionStart | 환경변수 셋업 | `$CLAUDE_ENV_FILE`에 PATH, NODE_ENV 등 주입 |

### 1-5. 알려진 이슈 (2026-04 기준)

- **exit 2 후 Claude가 멈추는 현상:** PreToolUse에서 차단하면 Claude가 사용자 입력을 기다리며 멈출 수 있음 (github.com/anthropics/claude-code/issues/24327). stderr에 **구체적인 대안**을 제시하면 Claude가 자동으로 대안을 시도할 확률이 높아짐
- **Write/Edit에서 exit 2 미작동:** 초기 버전 버그 (github.com/anthropics/claude-code/issues/13744). 최신 버전에서 수정됨

---

## 2. Lefthook vs Husky (2026년 현황)

### 2-1. 수치 비교

| 지표 | Husky | Lefthook |
|------|-------|----------|
| 주간 npm 다운로드 | **~24M** | ~1.25M |
| GitHub Stars | ~32k | ~5k |
| 런타임 | Node.js | Go 바이너리 |
| 병렬 실행 | 불가 (lint-staged 필요) | **기본 지원** |
| 설정 파일 | `.husky/` + `package.json` | **`lefthook.yml` 단일 파일** |
| 의존성 | Node.js 필수 | 없음 (Go 바이너리) |

### 2-2. 결론: 7일 대회에서는 Lefthook 우위

Husky가 업계 표준이지만, Lefthook이 7일 대회에 더 적합한 이유:

1. **단일 설정 파일** (`lefthook.yml`) -- 설정 시간 최소화
2. **병렬 실행 기본 지원** -- ESLint, Prettier, TypeScript 체크를 동시 실행
3. **Go 바이너리** -- Node.js 오버헤드 없이 빠른 실행
4. **`stage_fixed: true`** -- auto-fix 결과를 자동으로 staging

### 2-3. 대회용 Lefthook 설정

```yaml
# lefthook.yml
pre-commit:
  parallel: true
  commands:
    eslint:
      glob: "*.{ts,tsx}"
      run: npx eslint --fix {staged_files}
      stage_fixed: true
    prettier:
      glob: "*.{ts,tsx,json,css,md}"
      run: npx prettier --write {staged_files}
      stage_fixed: true
    typecheck:
      run: npx tsc --noEmit --skipLibCheck

commit-msg:
  commands:
    commitlint:
      run: npx commitlint --edit {1}
```

```bash
# 설치 (1줄)
npm install -D lefthook && npx lefthook install
```

---

## 3. Next.js 15 Middleware Patterns -- Supabase Auth + Rate Limiting

### 3-1. Supabase Auth 세션 갱신 미들웨어 (공식 패턴)

이 패턴은 프로젝트의 `references/supabase-nextjs-patterns.md`에 이미 상세 문서화되어 있다. 핵심 규칙만 재확인:

**필수 규칙:**
- 서버 코드에서 `getSession()` 절대 신뢰하지 말 것 -- 항상 `getUser()` 사용
- `getUser()`는 Supabase Auth 서버에 토큰을 재검증 요청함
- Server Components는 쿠키를 쓸 수 없으므로 middleware에서 갱신 필수
- `request.cookies.set` + `response.cookies.set` 양쪽 모두 설정

**파일 구조:**
```
utils/supabase/
  client.ts        -- createBrowserClient (Client Components)
  server.ts        -- createServerClient (Server Components, Server Actions)
  middleware.ts     -- updateSession() 함수
middleware.ts        -- 프로젝트 루트, updateSession 호출
```

### 3-2. Rate Limiting 통합 미들웨어 패턴

```typescript
// middleware.ts
import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
});

export async function middleware(request: NextRequest) {
  // 1. Rate limiting (API 라우트만)
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const { success, limit, reset, remaining } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      );
    }
  }

  // 2. Supabase Auth 세션 갱신 (모든 라우트)
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

### 3-3. 주의사항

- **middleware는 보안 경계가 아님:** Edge 레벨 라우팅 결정용. 실제 auth 검증은 Route Handlers와 Server Actions에도 반드시 구현
- **Next.js 15 + no-cache fetch 주의:** 다수의 서버 사이드 auth 호출이 캐시 없이 동시 발생하면 Supabase에서 429 에러 발생 가능
- **AI 엔드포인트 별도 제한:** `/api/chat` 같은 AI 라우트는 더 엄격한 rate limit 적용 권장 (예: 5 req/60s)

---

## 4. Custom React Hooks for AI Apps

### 4-1. 핵심 훅: Vercel AI SDK (이미 문서화됨)

`references/vercel-ai-sdk-patterns.md`에 상세 문서 있음. 요약:

| Hook | 패키지 | 용도 |
|------|--------|------|
| `useChat` | `@ai-sdk/react` | 풀 채팅 UI (스트리밍, 히스토리, 도구 호출) |
| `useCompletion` | `@ai-sdk/react` | 단일 프롬프트/응답 텍스트 완성 |
| `useObject` | `@ai-sdk/react` | 스트리밍 구조화된 오브젝트 (Zod 스키마) |

**AI SDK 5+ 변경사항:**
- `import { useChat } from 'ai/react'` -> `import { useChat } from '@ai-sdk/react'`
- `parameters` -> `inputSchema` (tool 정의)
- `toDataStreamResponse()` -> `toUIMessageStreamResponse()` (useChat용)
- `maxSteps` (숫자) -> `stopWhen: stepCountIs(n)` (선택적)

### 4-2. 유틸리티 훅: 추천 라이브러리

**`usehooks-ts` (주간 ~3M 다운로드, SSR 안전)**

2026년 기준 Next.js 프로젝트에서 가장 많이 쓰이는 유틸리티 훅 라이브러리. SSR 환경을 기본 고려하며, 별도의 라이브러리 없이 복사해서 사용 가능한 수준의 단순한 코드.

```bash
npm install usehooks-ts
```

| Hook | 용도 | 대회 활용 |
|------|------|----------|
| `useLocalStorage` | localStorage 동기화 + SSR 안전 | 사용자 설정, 채팅 히스토리 캐시 |
| `useMediaQuery` | CSS 미디어 쿼리 구독 (boolean) | 반응형 레이아웃 분기 |
| `useDebounce` | 값 디바운스 (기본 300ms 권장) | 검색 입력, auto-save |
| `useIntersectionObserver` | 뷰포트 진입 감지 | 무한 스크롤, lazy load |
| `useEventListener` | 이벤트 리스너 자동 정리 | 키보드 단축키, 클릭 외부 감지 |
| `useCopyToClipboard` | 클립보드 복사 | AI 응답 복사 버튼 |

**usehooks-ts 사용 예시:**

```tsx
'use client';
import { useLocalStorage } from 'usehooks-ts';
import { useDebounce } from 'usehooks-ts';
import { useMediaQuery } from 'usehooks-ts';

export function SearchComponent() {
  const [query, setQuery] = useLocalStorage('search-query', '');
  const debouncedQuery = useDebounce(query, 300);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // debouncedQuery가 변경될 때 API 호출
  // isMobile로 레이아웃 분기
  // query는 localStorage에 자동 저장
}
```

### 4-3. Framer Motion 관련 커스텀 훅

별도 라이브러리 불필요. 직접 작성이 간결:

```tsx
// hooks/useReducedMotion.ts
import { useMediaQuery } from 'usehooks-ts';

export function useReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
```

```tsx
// 사용
const prefersReducedMotion = useReducedMotion();
const variants = prefersReducedMotion
  ? {} // 애니메이션 없음
  : { initial: { opacity: 0 }, animate: { opacity: 1 } };
```

---

## 5. Upstash Rate Limiting -- 2026 현황

### 5-1. 결론: 여전히 Edge Rate Limiting의 사실상 표준

`@upstash/ratelimit`은 2026년에도 Next.js Edge Middleware에서 rate limiting의 go-to 솔루션이다. 대안이 사실상 없음.

| 특성 | 상세 |
|------|------|
| **Edge 호환** | Vercel Edge Runtime, Cloudflare Workers에서 동작 |
| **Redis 기반** | Upstash Redis (서버리스, HTTP 기반) |
| **콜드 캐시 최적화** | Edge 함수가 "hot"인 동안 데이터를 캐시하여 Redis 호출 최소화 |
| **알고리즘** | Fixed Window, Sliding Window, Token Bucket |
| **비용** | Upstash 무료 티어: 10K req/day (대회 충분) |

### 5-2. 대회용 Rate Limit 전략

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// 일반 API: 넉넉하게
const apiLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(30, '10 s'),
});

// AI 엔드포인트: 엄격하게 (비용 보호)
const aiLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '60 s'),
  prefix: 'ratelimit:ai',
});

// 인증 엔드포인트: 브루트포스 방지
const authLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.fixedWindow(5, '15 m'),
  prefix: 'ratelimit:auth',
});
```

### 5-3. 대안 비교

| 솔루션 | Edge 호환 | 상태 저장 | 비고 |
|--------|----------|----------|------|
| **@upstash/ratelimit** | O | Redis (분산) | **권장** |
| Vercel KV + 수동 구현 | O | KV store | Upstash Redis와 동일 백엔드 |
| express-rate-limit | X | 인메모리 | Edge 미지원, 서버리스 부적합 |
| 쿠키 기반 수동 구현 | O | 클라이언트 | 우회 가능, 간단한 보호만 |

### 5-4. 필요 환경변수

```env
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=AX...
```

---

## 6. 대회 Day 1 설정 체크리스트

프로젝트 초기화 시 아래 순서로 설정:

| # | 항목 | 도구 | 우선순위 |
|---|------|------|---------|
| 1 | Claude Code Hooks (PreToolUse + PostToolUse + Stop) | settings.json | **필수** |
| 2 | Supabase Auth Middleware (updateSession) | middleware.ts | **필수** |
| 3 | Lefthook (pre-commit: ESLint + Prettier + tsc) | lefthook.yml | 높음 |
| 4 | Upstash Rate Limiting (AI 엔드포인트 보호) | middleware.ts | 높음 |
| 5 | Commitlint (Conventional Commits) | commitlint.config.js | 중간 |
| 6 | usehooks-ts 설치 | package.json | 낮음 (필요시) |

---

## Sources

### Claude Code Hooks
- [Hooks Reference -- Claude Code Official Docs](https://code.claude.com/docs/en/hooks)
- [Automate Workflows with Hooks -- Claude Code Guide](https://code.claude.com/docs/en/hooks-guide)
- [Claude Code Hooks All 12 Events [2026] -- Pixelmojo](https://www.pixelmojo.io/blogs/claude-code-hooks-production-quality-ci-cd-patterns)
- [5 Claude Code Hook Mistakes -- DEV Community](https://dev.to/yurukusa/5-claude-code-hook-mistakes-that-silently-break-your-safety-net-58l3)
- [Claude Code Hooks Tutorial: 5 Production Hooks -- Blake Crosley](https://blakecrosley.com/blog/claude-code-hooks-tutorial)
- [Claude Code Hook Examples -- Steve Kinney](https://stevekinney.com/courses/ai-development/claude-code-hook-examples)
- [Hook Control Flow -- Steve Kinney](https://stevekinney.com/courses/ai-development/claude-code-hook-control-flow)
- [PreToolUse exit 2 stops Claude (Issue #24327)](https://github.com/anthropics/claude-code/issues/24327)
- [PreToolUse exit 2 and Write/Edit (Issue #13744)](https://github.com/anthropics/claude-code/issues/13744)

### Lefthook vs Husky
- [husky vs lefthook vs pre-commit -- npm trends](https://npmtrends.com/husky-vs-lefthook-vs-pre-commit)
- [Lefthook vs Husky Comparison -- Edopedia](https://www.edopedia.com/blog/lefthook-vs-husky/)
- [husky vs lefthook -- NPM Compare](https://npm-compare.com/husky,lefthook)
- [Saying Goodbye to Husky: Lefthook -- DEV Community](https://dev.to/saltyshiomix/saying-goodbye-to-husky-how-lefthook-supercharged-our-typescript-workflow-35c8)

### Next.js Middleware & Supabase Auth
- [Setting up Server-Side Auth for Next.js -- Supabase Docs](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Creating a Supabase Client for SSR -- Supabase Docs](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Next.js Middleware in 2026: Beyond Auth -- DEV Community](https://dev.to/bean_bean/nextjs-middleware-in-2026-beyond-auth-advanced-patterns-most-developers-miss-2d5k)
- [AI Prompt: Bootstrap Next.js v16 with Supabase Auth -- Supabase Docs](https://supabase.com/docs/guides/getting-started/ai-prompts/nextjs-supabase-auth)

### React Hooks
- [useHooks -- The React Hooks Library](https://usehooks.com/)
- [usehooks-ts -- npm](https://www.npmjs.com/package/usehooks-ts)
- [Best React Hooks Libraries 2026 -- ReactUse](https://reactuse.com/blog/best-react-hooks-libraries-2026/)
- [15 Essential React Hooks for 2026 -- TurboDocx](https://www.turbodocx.com/blog/react-hooks-you-need-to-know)

### Upstash Rate Limiting
- [Rate Limiting Your Next.js App with Vercel Edge -- Upstash Blog](https://upstash.com/blog/edge-rate-limiting)
- [@upstash/ratelimit Overview -- Upstash Docs](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview)
- [Ratelimit with Upstash Redis -- Vercel Template](https://vercel.com/templates/next.js/ratelimit-with-upstash-redis)
- [upstash/ratelimit-js -- GitHub](https://github.com/upstash/ratelimit-js)
