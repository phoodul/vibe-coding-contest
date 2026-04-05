---
name: web-testing
description: Next.js 15 웹 테스팅 전문가. Playwright E2E 테스트, Vitest 단위 테스트, React Testing Library 컴포넌트 테스트를 작성하고 테스트 커버리지를 관리한다. Server Actions 테스트, API Route 테스트, Supabase 모킹 패턴을 포함한다. "테스트 작성", "테스트 코드", "단위 테스트", "E2E 테스트", "통합 테스트", "TDD", "테스트 실패", "커버리지" 등의 요청에서 반드시 이 skill을 사용한다.
---

# Web Testing Expert (Next.js 15)

Next.js 15 앱의 안정성과 품질을 보장하는 체계적인 테스트 전략을 제공한다.

## 테스트 피라미드

```
        /    E2E (Playwright)   \        ← 적게, 핵심 흐름만
       /  Component (RTL + Vitest) \     ← 중간, UI 상호작용
      /    Unit (Vitest)             \   ← 많이, 비즈니스 로직
```

## 테스트 파일 구조

```
__tests__/
├── unit/
│   ├── lib/
│   └── utils/
├── components/
│   ├── ui/
│   └── shared/
├── e2e/
│   └── flows/
├── helpers/
│   ├── test-helpers.ts
│   └── mocks.ts
└── fixtures/
    └── data.ts
```

## Unit Test (Vitest)

비즈니스 로직, 유틸리티 함수, 서버 액션 입력 검증을 테스트한다.

```typescript
import { describe, it, expect } from 'vitest'

describe('formatCurrency', () => {
  it('원화를 올바르게 포맷한다', () => {
    expect(formatCurrency(1000)).toBe('₩1,000')
  })

  it('음수를 올바르게 처리한다', () => {
    expect(formatCurrency(-500)).toBe('-₩500')
  })
})
```

## Component Test (React Testing Library + Vitest)

컴포넌트의 렌더링과 사용자 상호작용을 테스트한다.

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'

describe('LoginForm', () => {
  it('이메일이 비어있으면 에러를 표시한다', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.click(screen.getByRole('button', { name: '로그인' }))

    expect(screen.getByText('이메일을 입력해주세요')).toBeInTheDocument()
  })
})
```

## E2E Test (Playwright)

핵심 사용자 시나리오를 브라우저에서 테스트한다.

```typescript
import { test, expect } from '@playwright/test'

test('로그인 후 대시보드로 이동한다', async ({ page }) => {
  await page.goto('/login')

  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')

  await expect(page).toHaveURL('/dashboard')
  await expect(page.getByText('환영합니다')).toBeVisible()
})
```

## Supabase 모킹 패턴

```typescript
import { vi } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-uid', email: 'test@test.com' } },
        error: null,
      }),
    },
  })),
}))
```

## API Route 테스트

```typescript
import { describe, it, expect } from 'vitest'

describe('POST /api/chat', () => {
  it('인증 없이 요청하면 401을 반환한다', async () => {
    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [] }),
    })

    const { POST } = await import('@/app/api/chat/route')
    const res = await POST(req)

    expect(res.status).toBe(401)
  })
})
```

## 테스트 실행 명령어

```bash
# Vitest 단위/컴포넌트 테스트
npx vitest run

# Vitest 워치 모드
npx vitest

# 특정 파일
npx vitest run __tests__/unit/utils.test.ts

# 커버리지
npx vitest run --coverage

# Playwright E2E
npx playwright test

# Playwright UI 모드
npx playwright test --ui
```

## 테스트 네이밍 규칙

- 파일: `{대상}.test.ts` (유닛/컴포넌트), `{흐름}.spec.ts` (E2E)
- describe: 테스트 대상 컴포넌트/함수명
- it/test: 한국어로 **"~하면 ~한다"** 형식
  - 예: `'이메일이 비어있으면 에러를 반환한다'`
  - 예: `'로그인 성공 시 대시보드로 이동한다'`

## AAA 패턴

모든 테스트는 Arrange → Act → Assert 순서를 따른다:

```typescript
it('설명', async () => {
  // Arrange: 테스트 데이터와 의존성 준비
  // Act: 테스트 대상 실행
  // Assert: 결과 검증
})
```
