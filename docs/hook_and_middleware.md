# Hook & Middleware 통합 가이드

> 바이브코딩 2026 공모전 — Next.js 15 + Supabase + Vercel AI SDK 스택 전용
> 3개 레이어(Claude Code / Git / Next.js)에 걸친 자동화 설정

---

## 아키텍처 개요

```
┌─────────────────────────────────────────────────────────┐
│  Layer 1: Claude Code Hooks (에이전트 제어)               │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ PreToolUse   │  │ PostToolUse  │  │ Stop          │  │
│  │ 위험 명령 차단 │  │ TypeScript   │  │ 빌드 체크      │  │
│  │              │  │ 타입 체크     │  │               │  │
│  └──────────────┘  └──────────────┘  └───────────────┘  │
├─────────────────────────────────────────────────────────┤
│  Layer 2: Git Hooks (코드 품질 게이트)                    │
│  ┌──────────────────────┐  ┌──────────────────────────┐ │
│  │ pre-commit (Lefthook)│  │ commit-msg (Commitlint)  │ │
│  │ ESLint + Prettier    │  │ Conventional Commits 강제 │ │
│  │ + TypeScript 병렬     │  │                          │ │
│  └──────────────────────┘  └──────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│  Layer 3: Next.js Middleware (런타임 요청 제어)            │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Rate Limit   │  │ Supabase Auth│  │ Route Guard   │  │
│  │ AI API 보호   │  │ 세션 갱신     │  │ 미인증 리다이렉트│  │
│  └──────────────┘  └──────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Layer 1: Claude Code Hooks

### 설정 위치: `.claude/settings.local.json`

에이전트(Claude)의 실행 생명주기 중 특정 시점에 끼어들어 **자동 검증**과 **안전 장치**를 건다.

| Hook | 시점 | 파일 | 역할 |
|------|------|------|------|
| **PreToolUse** | Bash 실행 **직전** | `security-guard.sh` | 위험 명령어 차단 |
| **PreToolUse** | Edit/Write **직전** | `env-guard.sh` | .env 등 시크릿 파일 수정 차단 |
| **PostToolUse** | Edit/Write **직후** | `post-edit-lint.sh` | TypeScript 타입 에러 즉시 피드백 |
| **Stop** | Claude 응답 **완료** | `stop-build-check.sh` | TypeScript 타입 체크 (tsc --noEmit) |

### 1-1. PreToolUse: Security Guard

**역할:** Claude가 Bash 명령어를 실행하기 직전에 위험한 패턴을 감지하고 차단한다.

차단 대상:
- `rm -rf /` — 루트/홈/상위 디렉토리 삭제
- `git push --force main` — main에 force push
- `git reset --hard` — 커밋되지 않은 변경 손실
- `curl | bash` — 원격 스크립트 실행
- `cat .env` — 시크릿 파일 내용 출력
- `npm config set` — 글로벌 패키지 설정 변경

**exit code 규칙:**
- `exit 0` → 통과 (실행 허용)
- `exit 1` → 경고 로깅 (실행은 허용)
- `exit 2` → **차단** (실행 거부)

### 1-2. PostToolUse: TypeScript Lint

**역할:** Claude가 파일을 수정(Edit) 또는 생성(Write)한 직후, `tsc --noEmit`으로 타입 에러를 즉시 감지하여 Claude 컨텍스트에 피드백한다. Claude가 자기 실수를 바로 인지하고 수정할 수 있게 한다.

**조건:** `package.json`과 `node_modules`가 존재할 때만 동작 (프로젝트 초기화 전에는 자동 스킵).

### 1-3. Stop: Build Check

**역할:** Claude가 응답을 마칠 때, `.ts/.tsx` 파일이 변경된 경우에만 `next build`를 실행하여 빌드 가능 여부를 확인한다. 배포 가능한 상태를 항상 유지하기 위한 최종 안전망.

---

## Layer 2: Git Hooks (Lefthook)

### 설정 위치: `lefthook.yml` + `commitlint.config.js`

### 왜 Lefthook인가? (vs Husky)

| | Husky | Lefthook |
|---|---|---|
| 런타임 | Node.js | Go 바이너리 (의존성 없음) |
| 병렬 실행 | X (lint-staged 필요) | O (기본 내장) |
| 설정 | `.husky/` + `package.json` 분산 | 단일 `lefthook.yml` |
| 속도 | 느림 (Node 오버헤드) | 빠름 |

7일 대회에서 **커밋 속도가 생명**이므로 Lefthook 선택.

### 2-1. pre-commit: 코드 품질 자동화

**역할:** 커밋 전 3가지 검증을 **병렬로** 실행한다.

| 명령 | 역할 |
|------|------|
| ESLint `--fix` | 코드 규칙 위반 자동 수정 후 스테이징 |
| Prettier `--write` | 코드 포맷팅 자동 수정 후 스테이징 |
| `tsc --noEmit` | TypeScript 타입 에러 확인 |

**임팩트:** "Doom Loop" 방지 — 포맷팅/타입 에러가 커밋에 섞이지 않으므로 다음 작업에서 불필요한 수정을 줄인다.

### 2-2. commit-msg: Conventional Commits 강제

**역할:** `feat:`, `fix:`, `refactor:` 등의 prefix를 강제하여 7일간의 개발 스토리를 자동 구조화한다.

**대회 임팩트:** AI 활용 리포트 작성 시 `git log --oneline`에서 "Day 3에 AI로 해결한 문제 5건"을 바로 추출할 수 있다.

### 설치 명령어 (프로젝트 초기화 후)

```bash
npm install -D lefthook @commitlint/cli @commitlint/config-conventional
npx lefthook install
```

---

## Layer 3: Next.js Middleware

### 설정 위치: `middleware.ts` (프로젝트 루트)

> 상세 코드는 `references/nextjs-middleware-patterns.md` 참조

### 3-1. Supabase Auth 세션 갱신 (필수)

**역할:** Server Components는 쿠키를 직접 쓸 수 없으므로, 만료된 Auth 토큰을 갱신하고 request/response 쿠키에 저장한다.

**핵심 규칙:**
- 반드시 `getUser()`를 사용해야 토큰 재검증이 보장됨
- `getSession()`은 토큰 재검증이 보장되지 않으므로 **서버 코드에서 절대 신뢰 금지**

### 3-2. 라우트 보호 (Route Guard)

**역할:** 미인증 사용자가 보호된 라우트(`/dashboard`, `/feature/*`)에 접근하면 `/login`으로 리다이렉트한다.

**제외 경로:** `/`, `/login`, `/signup`, `/auth/*`, 정적 파일

### 3-3. Rate Limiting (AI API 비용 보호)

**역할:** AI API 호출이 많은 프로젝트에서 브루트포스 공격과 비용 폭탄을 방지한다.

**도구:** Upstash Redis + `@upstash/ratelimit` (Edge 호환 표준)

**설정:** IP 기반 슬라이딩 윈도우 — 10초에 10회 제한

### 3-4. 보안 헤더

**역할:** `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security` 등을 설정하여 Lighthouse 보안 점수와 심사 가산점을 확보한다.

### 미들웨어 실행 순서

```
요청 → [Rate Limit] → [Auth 세션 갱신] → [Route Guard] → 응답
```

---

## Layer 4: Custom React Hooks

### 설정 위치: `hooks/` 디렉토리 (프로젝트 내)

> 상세 코드는 `references/custom-hooks-patterns.md` 참조

| 훅 | 역할 | 우선순위 |
|---|---|---|
| `useChat` | Vercel AI SDK 스트리밍 대화 관리 | 필수 |
| `useSupabaseAuth` | 클라이언트 인증 상태 실시간 구독 | 필수 |
| `useDebounce` | 검색/입력 API 호출 최적화 (비용 절감) | 높음 |
| `useAnimationInView` | Framer Motion 스크롤 등장 애니메이션 (Vibe) | 높음 |
| `useMediaQuery` | JS 레벨 반응형 분기 | 중간 |
| `useRealtime` | Supabase Realtime 데이터 구독 | 주제 따라 |
| `useLocalStorage` | 사용자 설정 영속화 (로그인 불필요) | 낮음 |
| `useCompletion` | 단발 AI 텍스트 생성 (요약/번역) | 주제 따라 |

---

## 설치 체크리스트 (프로젝트 초기화 시)

```bash
# 1. Lefthook + Commitlint
npm install -D lefthook @commitlint/cli @commitlint/config-conventional
npx lefthook install

# 2. Supabase SSR
npm install @supabase/ssr @supabase/supabase-js

# 3. Rate Limiting (선택)
npm install @upstash/ratelimit @upstash/redis

# 4. Vercel AI SDK
npm install ai @ai-sdk/anthropic

# 5. Framer Motion
npm install framer-motion
```

---

## 파일 구조

```
vibe-coding-contest/
├── .claude/
│   ├── hooks/
│   │   ├── security-guard.sh      ← PreToolUse: 위험 Bash 명령 차단
│   │   ├── env-guard.sh           ← PreToolUse: .env 시크릿 파일 수정 차단
│   │   ├── post-edit-lint.sh      ← PostToolUse: TypeScript 타입 체크
│   │   └── stop-build-check.sh    ← Stop: TypeScript 타입 체크 (tsc --noEmit)
│   └── settings.local.json        ← Hook 등록
├── lefthook.yml                   ← Git pre-commit + commit-msg
├── commitlint.config.js           ← Conventional Commits 규칙
├── middleware.ts                   ← (초기화 후 생성) Supabase Auth + Rate Limit
├── references/
│   ├── nextjs-middleware-patterns.md  ← 미들웨어 복사-붙여넣기 코드
│   └── custom-hooks-patterns.md       ← React 커스텀 훅 복사-붙여넣기 코드
└── hooks/                          ← (초기화 후 생성) useDebounce, useMediaQuery 등
```
