# Implementation Plan

> 작성일: YYYY-MM-DD | 상태: Draft → **승인 대기** → 승인됨
> 이 문서의 승인 없이 코드 작성을 시작하지 않는다.

---

## 1. 프로젝트 개요

### 프로젝트명
(한 줄)

### 목표
(이 구현으로 달성하려는 것)

### 스코프 경계
- **포함:** 
- **제외 (Phase 2):** 

---

## 2. 기술 아키텍처

### 시스템 구조
```
[Browser] → [Next.js 15 App Router] → [Vercel Serverless Functions]
                                              ↓
                                    [Supabase (PostgreSQL + Auth)]
                                              ↓
                                    [Claude 4.6 Opus via Vercel AI SDK]
```

### 폴더 구조
```
app/
├── layout.tsx          # 루트 레이아웃 (폰트, 테마, 글로벌 스타일)
├── page.tsx            # 랜딩 페이지
├── globals.css         # Tailwind + 커스텀 CSS
├── (auth)/
│   ├── login/page.tsx
│   └── signup/page.tsx
├── dashboard/
│   ├── page.tsx
│   ├── loading.tsx     # 스켈레톤 UI
│   └── error.tsx       # 에러 바운더리
├── [feature-a]/
│   ├── page.tsx
│   ├── loading.tsx
│   └── _components/    # 기능 전용 컴포넌트
├── [feature-b]/
│   └── ...
├── api/
│   ├── chat/route.ts   # Vercel AI SDK 스트리밍 엔드포인트
│   └── [기능]/route.ts
components/
├── ui/                 # Shadcn/ui 컴포넌트
├── layout/             # Header, Footer, Sidebar
└── shared/             # 공용 컴포넌트
hooks/                  # 커스텀 React hooks (useDebounce, useMediaQuery 등)
lib/
├── supabase/
│   ├── client.ts       # 브라우저 클라이언트
│   ├── server.ts       # 서버 클라이언트
│   └── middleware.ts   # Auth 미들웨어
├── ai/
│   └── agent.ts        # AI 에이전트 설정
└── utils.ts            # cn() 헬퍼
types/                  # 공용 TypeScript 타입
__tests__/              # Vitest 단위/컴포넌트 테스트
├── unit/
└── components/
e2e/                    # Playwright E2E 테스트
middleware.ts           # Supabase Auth 세션 갱신 (루트)
```

---

## 3. DB 스키마 (Supabase)

### 테이블 정의

```sql
-- 예시: users 확장
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS 정책
CREATE POLICY "Users can read own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);
```

### 테이블 목록
| 테이블 | 주요 컬럼 | RLS | 용도 |
|--------|----------|-----|------|
| profiles | id, display_name, avatar_url | O | 사용자 프로필 |
| | | | |

---

## 4. API 엔드포인트

| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| POST | /api/chat | Required | AI 채팅 (스트리밍) |
| | | | |

---

## 5. 페이지별 구현 상세

### 5-1. 랜딩 페이지 (`/`)
- **레이아웃:** 벤토 그리드 + 글래스모피즘
- **핵심 요소:** Hero, 기능 소개, CTA
- **애니메이션:** Staggered fadeUp, Mesh Gradient 배경

### 5-2. [주요 페이지 1] (`/feature-a`)
- **목적:** 
- **컴포넌트:** 
- **데이터 흐름:** 

### 5-3. [주요 페이지 2] (`/feature-b`)
- **목적:** 
- **컴포넌트:** 
- **데이터 흐름:** 

---

## 6. AI 에이전트 설계

### 에이전트 역할
(사용자가 [행동]하면, AI가 [분석/생성/추천]하여 [결과]를 반환)

### 구현 패턴
```typescript
// app/api/chat/route.ts
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    system: `역할 정의...`,
    messages,
  });
  
  return result.toDataStreamResponse();
}
```

---

## 7. 구현 순서 (스프린트 플랜)

### Day 2: 기반 + 핵심 A
- [ ] Supabase 테이블 생성 + RLS
- [ ] Auth 연동 (로그인/회원가입)
- [ ] [핵심 기능 A] CRUD
- **체크포인트:** 중간 배포

### Day 3: 핵심 B + AI
- [ ] [핵심 기능 B] 구현
- [ ] AI 에이전트 연동 (Vercel AI SDK)
- [ ] 스트리밍 응답 UI
- **체크포인트:** 중간 배포

### Day 4: 통합 & 안정화
- [ ] 전체 기능 E2E 동작 확인
- [ ] 엣지 케이스 처리
- [ ] 빌드 에러 0
- **체크포인트:** Vercel 프로덕션 빌드 성공

### Day 5~6: UI 광택 & Wow Feature
- [ ] Framer Motion 애니메이션
- [ ] 스켈레톤 UI + 토스트
- [ ] 다크 모드 + 반응형
- [ ] Wow Feature 추가
- **체크포인트:** Vibe Score 8+/10

---

## 8. 리스크 & 대안

| 리스크 | 확률 | 대안 |
|--------|------|------|
| AI API 속도 저하 | 중 | 캐싱 + 스트리밍 UI로 체감 속도 개선 |
| 스코프 초과 | 높 | Must-Have만 집중, Nice-to-Have는 시간 남을 때만 |
| | | |

---

## 승인

- [ ] 스코프가 7일 내 완성 가능한가?
- [ ] 핵심 기능이 심사 기준 4가지를 커버하는가?
- [ ] Wow Feature가 정의되어 있는가?

> **승인자 서명:** _________________ (날짜: )
