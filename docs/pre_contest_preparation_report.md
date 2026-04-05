# 바이브코딩 2026 — 사전 준비 보고서

> **작성일:** 2026-04-05 (주제 공개 D-1)
> **작성자:** 정성수
> **목적:** 주제 공개(04.06) 전까지 수행한 전략 수립, 인프라 구축, AI 하네스 엔지니어링의 전 과정 기록

---

## Executive Summary

본 보고서는 바이브코딩 2026 공모전(총 상금 600만원) 주제 공개 전, **코드를 한 줄도 작성하지 않은 상태에서** 수행한 사전 준비의 전 과정을 기록한다.

핵심 전략은 **"주제가 공개되는 순간, 기획만 하면 바로 구현에 돌입할 수 있는 상태를 만드는 것"**이다. 이를 위해 3개 AI 모델(Gemini, Claude Opus 4.6, ChatGPT)을 교차 활용하여 전략을 수립하고, Claude Code CLI를 중심으로 5개 전문 서브에이전트, 7개 커스텀 스킬(웹 전용), 4개 Claude Code Hooks, 2개 Git Hooks(Lefthook + Commitlint), 6개 MCP 서버, 4개 문서 템플릿, 5개 기술 레퍼런스 시트를 사전 구축했다.

**결과:** 42개 파일, 7개 커밋으로 구성된 "코드 없는 전투 준비"가 완성되었다. 주제 공개 후 Day 1에는 기획과 설계에만 집중할 수 있는 상태다.

---

## 1. 준비 과정 타임라인 — 두 단계의 사전 작업

전체 사전 준비는 **"사람의 전략적 판단"**과 **"AI의 야간 자동화"** 두 단계로 나뉜다.

### Phase 1: 직접 수행한 전략적 준비 (04.01~04.05 낮)

코드 작성 이전에, 대회의 본질을 파악하고 도구 환경을 직접 구축하는 12단계를 수행했다.

| # | 작업 | 의도 |
|---|------|------|
| 1 | **Gemini Pro에게 공모전 우승 전략을 요청**하고 정리 | 첫 번째 AI 관점 확보 — "Speed-First" 스택과 7일 파이프라인 도출 |
| 2 | **GitHub에서 remote-first 방식으로 repository 생성** | 첫 커밋부터 원격 저장소 연동 — Vercel 배포 파이프라인의 전제 조건 |
| 3 | **.gitignore를 node 기반으로 설정** 후 전략에 맞게 수정 | .env, 키 파일 등 민감 정보 유출 사전 방지 |
| 4 | **목적에 맞는 Rule, Skill, Workflow 설정** (Gemini Pro로 검색) | AI의 행동 규칙을 프로젝트에 최적화 — "지시하는 AI"에서 "룰을 따르는 팀원"으로 전환 |
| 5 | **Andrej Karpathy의 코딩 철학**을 Rule에 추가 | "Simplicity First", "Surgical Changes" 등 과도한 코드 생성을 억제하는 가드레일 |
| 6 | **Claude MCP 서버 6개 설치** (Supabase, Playwright, Sequential Thinking, Context7, Firebase, Vercel) | AI가 DB, 브라우저, 문서, 배포 시스템을 직접 조작할 수 있는 도구 체인 구축 |
| 7 | **Supabase Access Token**을 .env에 저장 | MCP를 통한 자연어 DB 관리의 전제 조건 |
| 8 | **Firebase MCP 설치** + serviceAccountKey.json을 .env에 연결 | 대안 백엔드 옵션 확보 — 주제에 따라 Firebase가 더 적합할 경우를 대비 |
| 9 | **Vercel OAuth 설정** 완료 | MCP를 통한 배포 자동화 — push 한 번으로 프로덕션 배포 가능 |
| 10 | **Claude Code 커스텀 스킬 생성**을 Claude에게 요청하여 구축 | 반복 작업(코드 리뷰, 커밋, 설명)을 한 마디로 트리거하는 자동화 |
| 11 | **frontendstyle.md** — 최신 프론트엔드 디자인 트렌드 정리 | 2024-2026 UI 트렌드(벤토 그리드, 글래스모피즘 등)를 사전 학습하여 디자인 의사결정 시간 단축 |
| 12 | **프론트엔드 디자인 전문 Skill** (modern-glass-bento) 추가 | 6대 핵심 요소 + CSS 레시피를 스킬에 내장 — AI가 트렌디한 UI를 기본값으로 생성 |

**핵심 판단:** 이 12단계는 모두 **"어떤 주제가 나와도 변하지 않는 것"**에 집중했다. 기술 스택, 도구 환경, AI 행동 규칙, 디자인 시스템은 주제와 무관하게 필요한 것이다. 주제에 따라 바뀌는 것(아이디어, DB 스키마, 비즈니스 로직)은 의도적으로 건드리지 않았다.

### Phase 2: AI 야간 자동화 (04.05 밤)

Phase 1에서 구축한 환경 위에, Claude Code Opus 4.6에게 **승인 없이 진행 가능한 준비 작업**을 위임했다.

| 작업 | 산출물 | 소요 |
|------|--------|------|
| 서브에이전트 5개 설계 및 생성 | `.claude/agents/` (researcher, architect, implementer, reviewer, designer) | 즉시 |
| 문서 템플릿 4개 생성 | `templates/` (PRD, implementation_plan, AI 로그, AI 리포트) | 즉시 |
| 기술 레퍼런스 3개 리서치 (병렬) | `references/` (Vercel AI SDK, Supabase RLS, Framer Motion) | ~6분 (3개 병렬) |
| 메모리 시스템 구축 | `.claude/projects/.../memory/` (대회 정보, 준비 현황, 기술 스택, 유저 프로필) | 즉시 |

**위임 기준:** "내 승인이 필요 없는 작업만 해라." 프로젝트 구조를 변경하거나 기술적 결정을 내리는 작업(Next.js 초기화, Supabase 프로젝트 생성 등)은 의도적으로 제외했다.

---

## 2. 전략 수립 — 멀티 AI 교차 분석

### 2-1. 접근 방법

단일 AI에 의존하지 않고, **3개 AI 모델에게 독립적으로 우승 전략을 요청**한 뒤 교차 분석하여 공통 패턴을 추출했다.

| AI 모델 | 산출물 | 핵심 기여 |
|---------|--------|----------|
| **Gemini Pro** | `gemini_winner_plan.md` | 7일 스프린트 파이프라인, "Speed-First" 스택 제안, Claude 4.6 활용 팁 |
| **Claude Opus 4.6** | `winner_plan.md` | 실제 우승자 8팀 사례 분석, 심사 기준별 전략 매핑, AI 활용 리포트 구조 설계 |
| **교차 종합** | `CLAUDE.md`, `rule_skill_workflow_setting.md` | 두 AI의 공통 권장사항을 프로젝트 룰로 확정 |

### 2-2. 우승자 분석에서 도출한 3대 핵심 패턴

8개 대회 우승 사례(Anthropic Hackathon, Lovable AI Showdown, Cursor Hackathon 등)를 분석하여 다음 공통점을 확인했다:

1. **기획에 전체 시간의 50~73% 투자** — 코딩은 AI가 처리
2. **하나의 Wow Feature에 올인** — 여러 기능의 미완성보다 하나의 완벽한 시연
3. **깊은 도메인 지식 + AI 코딩** — 기술력이 아닌 문제 정의 능력이 승패를 가름

### 2-3. 심사 기준 역설계

공식 심사 기준 4가지를 역으로 분석하여 각 항목에서 고득점을 받기 위한 구체적 전략을 수립했다:

| 심사 항목 | 사전 준비 대응 |
|-----------|---------------|
| **AI 활용 능력** | 5개 서브에이전트 역할 분리 + AI 활용 로그 템플릿으로 7일간 실시간 기록 체계 구축 |
| **기술적 완성도** | 에러 바운더리 + 스켈레톤 UI 필수 규칙을 CLAUDE.md에 사전 명시 |
| **실무 적합성** | PRD 템플릿에 사용자 페르소나 + 시나리오 섹션 사전 설계 |
| **창의성 및 확장성** | AI 에이전트 기능 구현을 기술 스택에 필수 포함 (Vercel AI SDK) |

---

## 3. 기술 스택 확정 — 검증된 우승 스택

우승 프로젝트들의 기술 스택을 분석한 결과, 다음 조합을 확정했다:

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

**선택 근거:** RiskWise($20K 우승), ChatEDU, PixelFlow 등 다수 우승작이 동일 조합을 사용. Supabase + Vercel 조합은 인프라 관리 시간을 0으로 만들어 7일이라는 제약 조건에 최적화됨.

---

## 4. AI 하네스 엔지니어링 — "코드 없는 전투 준비"

### 4-1. MCP 서버 6개 연동

Claude Code CLI에 6개의 Model Context Protocol 서버를 연동하여, AI가 외부 시스템을 직접 조작할 수 있는 환경을 구축했다.

| MCP 서버 | 프로토콜 | 활용 목적 |
|----------|---------|----------|
| **Supabase** | stdio | 자연어로 DB 스키마 생성, 마이그레이션, RLS 설정 |
| **Playwright** | stdio | 브라우저를 직접 띄워 UI 스크린샷 캡처 → AI가 시각적 피드백 |
| **Sequential Thinking** | stdio | 복잡한 비즈니스 로직 설계 시 단계적 사고 강제 |
| **Context7** | stdio | 라이브러리 최신 문서 실시간 조회 (훈련 데이터 지연 보완) |
| **Firebase** | stdio | 대안 백엔드 옵션 (필요 시 전환 가능) |
| **Vercel** | http (OAuth) | 배포 자동화, 로그 확인, 도메인 관리 |

### 4-2. 프로젝트 룰 시스템 (CLAUDE.md)

AI의 행동을 프로젝트에 최적화하는 룰을 사전 정의했다:

- **역할 부여:** "세계 최고의 Full-stack Senior Engineer이자 UX 디자이너"
- **Vibe 강제:** 모든 클릭 가능 요소에 Framer Motion/CSS Transition 적용 의무화
- **승인 프로세스:** 코드 작성 전 `implementation_plan.md` 작성 및 승인 필수
- **능동적 소통:** "어떻게 할까요?" 대신 "우승을 위해 A보다 B가 더 임팩트 있어 제안합니다" 스타일 강제
- **환경 안전:** 패키지 min-release-age 7일 정책으로 공급망 공격 방지

### 4-3. 커스텀 스킬 7개

반복적인 작업 패턴을 스킬로 사전 정의하여 개발 중 즉시 호출 가능하게 했다:

| 스킬 | 트리거 | 핵심 기능 |
|------|--------|----------|
| `code-review` | "리뷰해줘", "코드 봐줘" | 4단계 심각도 분류 (Critical/Warning/Suggestion/Nitpick) |
| `explain-code` | "이게 뭐야", "설명해줘" | 비유 → 다이어그램 → 워크스루 → Gotcha 4단계 설명 |
| `git-workflow` | "커밋해줘", "PR 작성" | Conventional Commits + GitHub Flow 자동화 |
| `modern-glass-bento` | "모던 디자인", "바이브코딩" | 벤토 그리드 + 글래스모피즘 6대 요소 체크리스트 기반 UI 생성 |
| `nextjs-dev` | Next.js 15 개발 | App Router, Server/Client Components, Shadcn/ui |
| `web-testing` | 웹 테스트 작업 | Vitest 단위 + Playwright E2E 테스트 가이드 |

### 4-4. 서브에이전트 5개 — 역할 분리 아키텍처

솔로 참가자의 한계를 극복하기 위해, **하나의 AI를 5개의 전문 에이전트로 분리**했다. 각 에이전트는 고유한 시스템 프롬프트와 도구 접근 권한을 가진다.

```
┌─────────────────────────────────────────────┐
│              사용자 (정성수)                   │
│         전략 결정 + 최종 판단                  │
└──────────────┬──────────────────────────────┘
               │
    ┌──────────┼──────────┐
    ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────────┐
│Research│ │Architect│ │Implementer │
│   er   │ │        │ │            │
│        │ │ PRD    │ │ 코드 구현   │
│ 웹검색  │ │ 스키마  │ │ Full Access│
│ Read   │ │ 설계   │ │            │
│ Only   │ │No Bash │ │            │
└────────┘ └────────┘ └────────────┘
                          │
               ┌──────────┼──────────┐
               ▼                     ▼
          ┌────────┐           ┌────────┐
          │Reviewer│           │Designer│
          │        │           │        │
          │코드 리뷰│           │UI/UX   │
          │보안 점검│           │Vibe    │
          │빌드 확인│           │Check   │
          │No Edit │           │Playwright│
          └────────┘           └────────┘
```

**핵심 설계 원칙:**

- **Researcher**는 코드를 작성하지 못한다 → 리서치 결과의 객관성 보장
- **Architect**는 bash를 실행하지 못한다 → 설계와 구현의 분리
- **Reviewer**는 코드를 수정하지 못한다 → 리뷰어가 직접 고치는 안티패턴 방지
- **Designer**는 Playwright로 실제 브라우저 스크린샷을 캡처하여 시각적으로 피드백

### 4-5. Claude Code Hooks — 3레이어 자동 안전망

에이전트의 실행 생명주기에 끼어들어 자동 검증과 안전 장치를 거는 셸 스크립트 4개를 구축했다.

| Hook | 시점 | 스크립트 | 역할 |
|------|------|---------|------|
| **PreToolUse** | Bash 실행 직전 | `security-guard.sh` | `rm -rf /`, `git push --force main`, `curl \| bash`, `.env` 출력 등 위험 명령 차단 (exit 2) |
| **PreToolUse** | Edit/Write 직전 | `env-guard.sh` | `.env`, `.key`, `.pem`, `serviceAccountKey.json` 등 시크릿 파일 수정 차단 |
| **PostToolUse** | Edit/Write 직후 | `post-edit-lint.sh` | `tsc --noEmit`으로 TypeScript 타입 에러를 Claude에 즉시 피드백 |
| **Stop** | 응답 완료 시 | `stop-build-check.sh` | `.ts/.tsx` 변경이 있으면 TypeScript 타입 체크 실행 |

**핵심 설계:** exit code 규칙을 활용한 결정론적 제어 — `exit 0`(통과), `exit 1`(경고, 실행 허용), `exit 2`(**차단, 실행 거부**). 보안 훅은 반드시 exit 2를 사용해야 실제 강제력이 생긴다. 모든 스크립트는 `package.json` 존재 여부를 체크하여 프로젝트 초기화 전에는 자동 스킵된다.

### 4-6. Git Hooks — Lefthook + Commitlint

커밋 품질을 자동으로 보장하는 Git hook 체계를 사전 구성했다. Husky 대신 **Lefthook**을 선택한 이유: Go 바이너리 기반 병렬 실행으로 커밋 속도가 빠르고, 단일 `lefthook.yml`로 모든 설정이 완결된다.

| Hook | 도구 | 역할 |
|------|------|------|
| `pre-commit` | Lefthook | ESLint `--fix` + Prettier `--write` + `tsc --noEmit` **병렬** 실행 |
| `commit-msg` | Commitlint | Conventional Commits (`feat:`, `fix:`, `refactor:` 등) prefix 강제 |

**대회 임팩트:** 커밋 히스토리가 자동 구조화되므로, Day 7에 AI 활용 리포트 작성 시 `git log`에서 "Day 3에 AI로 해결한 문제 5건"을 바로 추출할 수 있다.

---

## 5. 템플릿 시스템 — Day 1 즉시 가동

주제 공개 후 바로 채워 넣을 수 있는 4개의 구조화된 템플릿을 사전 제작했다:

| 템플릿 | 용도 | 활용 시점 |
|--------|------|----------|
| `prd_template.md` | 1페이지 기획서 (심사 기준 매핑 포함) | Day 1: 주제 공개 직후 |
| `implementation_plan_template.md` | DB 스키마, API, 폴더 구조, 스프린트 플랜 | Day 1: PRD 승인 후 |
| `ai_log.md` | 7일간 AI 활용 일지 (Day별 섹션 + 실패 사례 섹션) | Day 1~7: 매일 기록 |
| `ai_report_template.md` | 최종 제출용 AI 활용 리포트 | Day 7: ai_log → 구조화 |

**설계 포인트:** AI 활용 리포트 템플릿에는 **"AI 실패 사례 + 내 대처"** 섹션을 의도적으로 포함했다. 우승자 분석 결과, 심사위원은 AI가 다 해준 것보다 **비판적으로 수정한 사례**에 높은 점수를 부여한다.

---

## 6. 기술 레퍼런스 시트 — 개발 중 즉시 참조

Context7 MCP와 웹 검색을 통해 핵심 기술 3개의 최신 문서를 조회하고, 공모전에서 실제로 사용할 패턴만 추출한 실전 치트시트를 생성했다:

| 레퍼런스 | 분량 | 핵심 내용 |
|----------|------|----------|
| `vercel-ai-sdk-patterns.md` | — | `streamText`, `useChat`, 도구 호출, 멀티스텝 에이전트, SDK 4→5 마이그레이션 |
| `supabase-nextjs-patterns.md` | 590줄 | Auth, RLS 정책 레시피 7종, Realtime, Storage, Edge Functions, 타입 생성 |
| `framer-motion-patterns.md` | 662줄 | 8가지 복사-붙여넣기 레시피, Bento Grid 패턴, 성능 최적화 |
| `nextjs-middleware-patterns.md` | — | Supabase Auth 세션 갱신, 라우트 보호, Upstash Rate Limiting (용도별 3단계), 보안 헤더 |
| `custom-hooks-patterns.md` | — | useChat, useSupabaseAuth, useDebounce, useAnimationInView 등 8개 커스텀 훅 |

**목적:** 개발 중 공식 문서를 찾아보는 시간을 제거. 필요한 코드 패턴을 프로젝트 내에서 즉시 참조 가능.

---

## 7. 디자인 시스템 사전 정의

프론트엔드 트렌드 분석을 통해 "Vibe Factor"를 극대화할 디자인 시스템을 사전 확정했다:

### 6대 핵심 요소

1. **벤토 그리드** — CSS Grid 비대칭 레이아웃 (정보 위계 표현)
2. **글래스모피즘** — `backdrop-filter: blur(24px)` + 반투명 bg + 미묘한 border
3. **Mesh Gradient** — 3~5개 블러된 Orb로 유기적 배경
4. **Staggered 애니메이션** — 카드별 0.05s 간격 순차 등장
5. **마이크로 인터랙션** — hover lift, shine effect, bounce toggle
6. **Noise 텍스처** — SVG 기반 미세한 입자감 오버레이

### 컬러 토큰 확정

```
다크 배경: #0a0a0f
글래스 bg: rgba(255, 255, 255, 0.06)
액센트: Violet #8b5cf6 / Cyan #06b6d4 / Emerald #10b981
폰트: Outfit (Display) + Noto Sans KR (Body) + JetBrains Mono (Code)
```

---

## 8. 전체 산출물 요약

### 파일 구조

```
vibe-coding-contest/
├── CLAUDE.md                          # 프로젝트 룰 (AI 행동 규칙)
├── .mcp.json                          # MCP 서버 6개 설정
├── .env                               # Supabase + Firebase 토큰
├── lefthook.yml                       # Git pre-commit + commit-msg 설정
├── commitlint.config.js               # Conventional Commits 규칙
├── .claude/
│   ├── settings.local.json            # 권한 + Hook 설정
│   ├── hooks/                         # Claude Code Hook 스크립트 4개
│   │   ├── security-guard.sh          # PreToolUse: 위험 Bash 명령 차단
│   │   ├── env-guard.sh              # PreToolUse: .env 시크릿 파일 수정 차단
│   │   ├── post-edit-lint.sh          # PostToolUse: TypeScript 타입 체크
│   │   └── stop-build-check.sh        # Stop: TypeScript 타입 체크
│   ├── agents/                        # 서브에이전트 5개
│   │   ├── researcher.md
│   │   ├── architect.md
│   │   ├── implementer.md
│   │   ├── reviewer.md
│   │   └── designer.md
│   └── skills/                        # 커스텀 스킬 7개
│       ├── code-review/
│       ├── explain-code/
│       ├── nextjs-dev/
│       ├── web-testing/
│       ├── git-workflow/
│       └── modern-glass-bento/
├── templates/                         # 문서 템플릿 4개
│   ├── prd_template.md
│   ├── implementation_plan_template.md
│   ├── ai_log.md
│   └── ai_report_template.md
├── references/                        # 기술 레퍼런스 5개
│   ├── vercel-ai-sdk-patterns.md
│   ├── supabase-nextjs-patterns.md
│   ├── framer-motion-patterns.md
│   ├── nextjs-middleware-patterns.md
│   └── custom-hooks-patterns.md
├── winner_plan.md                     # 우승 전략 (Claude 분석)
├── gemini_winner_plan.md              # 우승 전략 (Gemini 분석)
├── rule_skill_workflow_setting.md     # 워크플로우 설정 가이드
├── preliminary_settings.md            # 체크리스트 준비 가이드
├── contest_preparation_checklist.html # 인터랙티브 체크리스트
├── frontend_design.md                 # 디자인 트렌드 분석
├── frontendstyle.md                   # 프론트엔드 스타일 가이드
└── my_process.md                      # 준비 과정 기록
```

### 수치 요약

| 항목 | 수량 |
|------|------|
| 총 파일 수 | 42개 |
| 서브에이전트 | 5개 |
| 커스텀 스킬 | 7개 (웹 전용: nextjs-dev, web-testing 등) |
| Claude Code Hooks | 4개 (security-guard, env-guard, post-edit-lint, stop-build-check) |
| Git Hooks | 2개 (Lefthook pre-commit + Commitlint commit-msg) |
| MCP 서버 | 6개 |
| 문서 템플릿 | 4개 |
| 기술 레퍼런스 | 5개 (Vercel AI SDK, Supabase, Framer Motion, Middleware, Custom Hooks) |
| 전략 문서 | 5개 |
| 분석한 우승 사례 | 8개 대회 |
| Git 커밋 | 7개 |
| 작성된 코드 | 0줄 |

---

## 9. 남은 작업 (주제 공개 당일)

주제 공개 후 즉시 실행할 작업 순서:

```
주제 공개 (04.06 월)
    │
    ▼
[1] Next.js 15 프로젝트 초기화 + Shadcn/ui + Lefthook install + Vercel 배포 (30분)
    │
    ▼
[2] 주제 분석 → Researcher 에이전트로 트렌드 조사 (1시간)
    │
    ▼
[3] 아이디어 3개 도출 → prd_template.md 작성 (2시간)
    │
    ▼
[4] Architect 에이전트로 implementation_plan.md 생성 (1시간)
    │
    ▼
[5] Supabase 테이블 생성 + RLS → Implementer 에이전트로 개발 시작
```

---

## 결론

> **"우승은 가장 코드를 많이 짠 사람이 아니라, 가장 가치 있는 문제를 가장 아름답게 해결한 사람에게 돌아간다."**

이 사전 준비의 본질은 **"주제 공개 후 7일을 온전히 문제 해결에 쓰기 위해, 도구와 프로세스를 미리 완성하는 것"**이다. 코드는 한 줄도 없지만, 어떤 주제가 나와도 Day 1에 기획을 마치고 Day 2부터 구현에 돌입할 수 있는 상태를 만들었다.

AI를 "코드를 대신 짜주는 도구"가 아닌, **"역할이 분리된 전문 팀"**으로 구성한 것이 이 준비의 핵심 차별점이다.
