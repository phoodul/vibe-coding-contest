# 웹 기반 스택 확정 — 최종 결정

> **결정일:** 2026-04-05
> **상태:** 확정

---

## 결정: Next.js 15 웹 기반으로 단일화

Flutter를 포기하고 **Next.js 15 + Shadcn/ui + Supabase + Vercel** 웹 스택으로 확정한다.

### 결정 근거

1. **제출물이 웹 URL을 전제**: "배포된 서비스 URL" 가산점 — 웹이 압도적 유리
2. **공모전 AI 도구가 전부 웹 스택**: Cursor, v0, Claude Code — Flutter 전용 도구 없음
3. **"배포 안정성" 심사**: Vercel 원클릭 배포 vs Flutter web 배포 리스크
4. **7일 개발 기간**: AI 도구 지원이 풍부한 웹이 프로토타이핑 속도 우위
5. **"모바일 앱" 언급 0건**: 공모전 전체에서 모바일/앱/스마트폰 관련 언급 없음

### 확정 기술 스택

```
Next.js 15 (App Router) + Shadcn/ui + Tailwind CSS
        ↓
    Supabase (Auth + PostgreSQL + Storage + RLS)
        ↓
    Vercel AI SDK + Claude 4.6 Opus
        ↓
    Framer Motion (Micro-interactions)
        ↓
    Vercel (원클릭 배포)
```

### 선택 근거

| 기술 | 선택 이유 |
|------|----------|
| Next.js 15 | 다수 우승작 사용 (RiskWise, ChatEDU, PixelFlow), App Router SSR |
| Shadcn/ui | 소스 코드 커스텀, v0.dev 호환 |
| Supabase | 설정 없이 즉시 사용, Auth + RLS 내장 |
| Vercel AI SDK | Claude 스트리밍 응답, 에이전트 기능 최적 |
| Framer Motion | Micro-interaction으로 Vibe Factor 극대화 |
| Vercel | 원클릭 배포, 서버리스 함수 자동 관리 |

### 스킬 구성 (웹 전용)

| 스킬 | 용도 |
|------|------|
| `nextjs-dev` | Next.js 15 App Router 개발 |
| `web-testing` | Vitest + Playwright E2E 테스트 |
| `code-review` | TypeScript/React/Next.js 코드 리뷰 |
| `git-workflow` | Conventional Commits + Next.js .gitignore |
| `modern-glass-bento` | 글래스모피즘 벤토 그리드 UI |
| `explain-code` | 코드 설명 |
