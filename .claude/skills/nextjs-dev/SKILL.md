---
name: nextjs-dev
description: Next.js 15 App Router + Shadcn/ui + Supabase + Vercel AI SDK 웹 개발 전문가. 페이지 라우팅, Server/Client Components, API Routes, 미들웨어, 데이터 패칭, SEO 최적화를 포함한다. Next.js 앱 개발, 페이지 구현, 컴포넌트 설계, package.json 설정, npm/pnpm 명령어 사용, TypeScript 코드 작성 등 Next.js와 관련된 모든 작업에서 반드시 이 skill을 사용한다.
---

# Next.js 15 Development Expert

시니어 풀스택 개발자로서 Next.js 15 App Router 기반의 고품질 웹 애플리케이션을 설계하고 구현한다.

## 핵심 원칙

1. **Server Components 기본**: `'use client'`는 인터랙션이 필요한 곳에만 사용한다.
2. **App Router 패턴 준수**: `app/` 디렉토리의 파일 컨벤션(layout, page, loading, error, not-found)을 철저히 따른다.
3. **타입 안전성**: TypeScript strict 모드, Zod 유효성 검사를 적극 활용한다.
4. **점진적 향상**: JavaScript 없이도 핵심 기능이 동작하도록 설계한다.

## 프로젝트 구조

```
app/
├── layout.tsx              # 루트 레이아웃 (폰트, 테마, 글로벌 스타일)
├── page.tsx                # 랜딩 페이지
├── globals.css             # Tailwind + 커스텀 CSS
├── (auth)/
│   ├── login/page.tsx
│   └── signup/page.tsx
├── dashboard/
│   ├── page.tsx
│   ├── loading.tsx         # 스켈레톤 UI
│   └── error.tsx           # 에러 바운더리
├── [feature]/
│   ├── page.tsx
│   ├── loading.tsx
│   └── _components/        # 기능 전용 컴포넌트
├── api/
│   ├── chat/route.ts       # Vercel AI SDK 스트리밍
│   └── [기능]/route.ts
components/
├── ui/                     # Shadcn/ui 컴포넌트
├── layout/                 # Header, Footer, Sidebar
└── shared/                 # 공용 컴포넌트
lib/
├── supabase/
│   ├── client.ts           # 브라우저 클라이언트
│   ├── server.ts           # 서버 클라이언트
│   └── middleware.ts       # Auth 미들웨어
├── ai/
│   └── agent.ts            # AI 에이전트 설정
└── utils.ts
```

## Server vs Client Components 가이드

### Server Component (기본값)
```tsx
// app/dashboard/page.tsx — 'use client' 없음
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('items').select()

  return <ItemList items={data ?? []} />
}
```

### Client Component (인터랙션 필요 시에만)
```tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export function InteractiveCard({ data }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={() => setIsOpen(!isOpen)}
    >
      {/* ... */}
    </motion.div>
  )
}
```

## 데이터 패칭 패턴

### Server Actions
```tsx
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createItem(formData: FormData) {
  const supabase = await createClient()
  const title = formData.get('title') as string

  await supabase.from('items').insert({ title })
  revalidatePath('/dashboard')
}
```

### Vercel AI SDK 스트리밍
```tsx
// app/api/chat/route.ts
import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    system: `역할 정의...`,
    messages,
  })

  return result.toDataStreamResponse()
}
```

## Shadcn/ui 활용

```bash
# 필요한 컴포넌트만 추가
npx shadcn@latest add button card dialog toast
```

- 라이브러리가 아닌 **소스 코드**로 취급한다
- `components/ui/` 안의 파일을 프로젝트 디자인 토큰에 맞게 직접 수정한다
- `tailwind.config.ts`의 디자인 토큰과 일치하도록 커스텀한다

## 스타일 규칙

- Tailwind CSS 유틸리티 클래스 우선
- 글래스모피즘: `backdrop-blur-xl bg-white/5 border border-white/10`
- 벤토 그리드: CSS Grid + 비대칭 span
- 다크 테마 기본
- 반응형: 모바일 퍼스트 (sm → md → lg)

## Micro-interactions (필수)

- 모든 클릭 가능 요소에 Framer Motion 또는 CSS Transition 적용
- hover: `translateY(-2~4px)` + `border-color` 변화
- 페이지 전환: Framer Motion `AnimatePresence`
- 등장 애니메이션: staggered fadeUp

## 에러 처리

- `error.tsx`: 각 라우트 세그먼트에 에러 바운더리
- `loading.tsx`: 스켈레톤 UI
- `not-found.tsx`: 404 페이지
- Shadcn `toast`로 사용자 피드백
- 빈 화면 절대 노출 금지

## 성능 체크리스트

- [ ] 불필요한 `'use client'` 없는가?
- [ ] `next/image`로 이미지 최적화
- [ ] 대용량 라이브러리 `dynamic()` import
- [ ] Metadata API로 SEO 설정
- [ ] `loading.tsx`로 Suspense 경계 설정
- [ ] 번들 사이즈 확인 (`@next/bundle-analyzer`)

## 작업 워크플로우

1. **Setup**: `npx create-next-app@latest` + Shadcn/ui + Supabase + Vercel 배포
2. **Analyze**: `npm run build`로 타입/빌드 에러 0개 유지
3. **Build**: Server Components 우선, 클라이언트 최소화
4. **Test**: Playwright E2E + 빌드 확인
5. **Deploy**: `git push` → Vercel 자동 배포

## 코드 규칙

- 파일명: `kebab-case.tsx` (컴포넌트), `camelCase.ts` (유틸)
- 컴포넌트명: `PascalCase`
- 함수/변수명: `camelCase`
- 타입/인터페이스: `PascalCase`
- 환경 변수: 클라이언트용은 `NEXT_PUBLIC_` 접두어 필수, 그 외는 서버 전용
