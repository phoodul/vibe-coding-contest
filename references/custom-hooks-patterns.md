# Custom React Hooks 레퍼런스

> Next.js 15 + Supabase + Vercel AI SDK + Framer Motion 프로젝트에서 즉시 활용할 커스텀 훅

---

## 1. useChat — Vercel AI SDK (AI 스트리밍 대화)

Vercel AI SDK 내장 훅. AI 챗봇/에이전트 구현의 핵심.

```typescript
'use client'

import { useChat } from 'ai/react'

export function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    onError: (error) => {
      console.error('Chat error:', error)
    },
  })

  return (
    <form onSubmit={handleSubmit}>
      {messages.map((m) => (
        <div key={m.id}>{m.role === 'user' ? '나: ' : 'AI: '}{m.content}</div>
      ))}
      <input value={input} onChange={handleInputChange} disabled={isLoading} />
    </form>
  )
}
```

**역할:** AI 스트리밍 응답을 자동 관리. 메시지 상태, 로딩 상태, 에러 핸들링을 한 번에 처리.

---

## 2. useCompletion — Vercel AI SDK (단발 AI 완성)

채팅이 아닌 단발 AI 텍스트 생성용.

```typescript
'use client'

import { useCompletion } from 'ai/react'

export function SummaryGenerator() {
  const { completion, input, handleInputChange, handleSubmit, isLoading } =
    useCompletion({ api: '/api/summarize' })

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <textarea value={input} onChange={handleInputChange} />
        <button disabled={isLoading}>요약하기</button>
      </form>
      {completion && <p>{completion}</p>}
    </div>
  )
}
```

**역할:** 요약, 번역, 분석 등 단발 AI 작업에 최적화.

---

## 3. useMediaQuery — 반응형 조건부 렌더링

```typescript
'use client'

import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}

// 사용 예시
// const isMobile = useMediaQuery('(max-width: 640px)')
// const isTablet = useMediaQuery('(max-width: 1024px)')
```

**역할:** Tailwind 브레이크포인트와 연동하여 JS 레벨에서 반응형 분기. 모바일에서 Framer Motion 애니메이션을 간소화할 때 유용.

---

## 4. useDebounce — 검색/입력 최적화

```typescript
'use client'

import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

// 사용 예시
// const [search, setSearch] = useState('')
// const debouncedSearch = useDebounce(search, 300)
// useEffect(() => { fetchResults(debouncedSearch) }, [debouncedSearch])
```

**역할:** 실시간 검색, AI 자동완성에서 불필요한 API 호출을 줄여 비용 절감.

---

## 5. useLocalStorage — 클라이언트 상태 영속화

```typescript
'use client'

import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) setStoredValue(JSON.parse(item))
    } catch (error) {
      console.error(error)
    }
  }, [key])

  const setValue = (value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value
    setStoredValue(valueToStore)
    window.localStorage.setItem(key, JSON.stringify(valueToStore))
  }

  return [storedValue, setValue] as const
}

// 사용 예시
// const [theme, setTheme] = useLocalStorage('theme', 'dark')
// const [sidebarOpen, setSidebarOpen] = useLocalStorage('sidebar', true)
```

**역할:** 사용자 설정(테마, 사이드바 상태 등)을 로그인 없이 유지. 간단한 UX 향상.

---

## 6. useSupabaseAuth — Supabase 인증 상태 구독

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}

// 사용 예시
// const { user, loading } = useSupabaseAuth()
// if (loading) return <Skeleton />
// if (!user) return <LoginPrompt />
```

**역할:** 클라이언트에서 실시간 인증 상태 구독. 로그인/로그아웃 시 UI 즉시 반영.

---

## 7. useAnimationInView — Framer Motion 스크롤 등장 애니메이션

```typescript
'use client'

import { useInView } from 'framer-motion'
import { useRef } from 'react'

export function useAnimationInView(options?: { once?: boolean; margin?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, {
    once: options?.once ?? true,
    margin: options?.margin ?? '-100px',
  })

  const animationProps = {
    initial: { opacity: 0, y: 30 },
    animate: isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 },
    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
  }

  return { ref, isInView, animationProps }
}

// 사용 예시
// const { ref, animationProps } = useAnimationInView()
// <motion.div ref={ref} {...animationProps}>콘텐츠</motion.div>
```

**역할:** 스크롤 시 카드가 순차적으로 나타나는 Staggered 애니메이션 구현. Vibe Factor 핵심.

---

## 8. useRealtime — Supabase 실시간 데이터 구독

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRealtime<T extends Record<string, unknown>>(
  table: string,
  initialData: T[] = []
) {
  const [data, setData] = useState<T[]>(initialData)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setData((prev) => [...prev, payload.new as T])
          } else if (payload.eventType === 'UPDATE') {
            setData((prev) =>
              prev.map((item) =>
                (item as any).id === payload.new.id ? (payload.new as T) : item
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setData((prev) =>
              prev.filter((item) => (item as any).id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table])

  return data
}

// 사용 예시
// const messages = useRealtime('messages', initialMessages)
```

**역할:** Supabase Realtime으로 실시간 데이터 동기화. 채팅, 대시보드 등에서 "살아있는" 느낌 연출.

---

## 훅 선택 가이드

| 훅 | 사용 시점 | 우선순위 |
|---|---|---|
| `useChat` | AI 대화 기능 | 필수 |
| `useSupabaseAuth` | 인증 필요 시 | 필수 |
| `useDebounce` | 검색/입력 필드 | 높음 |
| `useAnimationInView` | 스크롤 애니메이션 | 높음 (Vibe) |
| `useMediaQuery` | 반응형 분기 | 중간 |
| `useRealtime` | 실시간 데이터 | 주제에 따라 |
| `useLocalStorage` | 사용자 설정 | 낮음 |
| `useCompletion` | 단발 AI 작업 | 주제에 따라 |
