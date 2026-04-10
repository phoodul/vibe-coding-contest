# EduFlow AI

**AI 기반 차세대 교육 솔루션** — 학생 맞춤 학습 + 교사 행정 자동화

> 바이브코딩 2026 공모전 출품작 | [Live Demo](https://vibe-coding-contest-git-version2-phoodul-6034s-projects.vercel.app)

---

## 해결하는 문제

| 대상 | Pain Point | EduFlow AI 솔루션 |
|------|-----------|-------------------|
| **학생** | 수동적 암기 학습, 진로 불안 | 소크라테스 AI 튜터, 진로 시뮬레이터, 맞춤 도서 추천 |
| **교사** | 반복적 공문서 행정 업무 | 공문서 포맷터/생성기, 문서 발급 워크플로우 |

---

## 주요 기능

### 학생용
- **소크라테스 AI 튜터** — 답을 주지 않고 질문으로 이끄는 대화형 학습 (국어/사회/과학)
- **진로 시뮬레이터** — MBTI/적성/흥미 분석 -> 5,000+ 직업 매칭
- **맞춤 도서 추천** — 학년/희망학과/진로 기반 AI 큐레이션

### 교사용
- **공문서 포맷터** — K-에듀파인 양식 자동 교정 (날짜/시간/금액/항목기호)
- **공문서 생성기** — 자유 텍스트 -> AI가 두문-본문-결문 구조로 자동 작성
- **문서 발급 워크플로우** — 업로드 -> 양식 검토 -> 승인 -> 번호 발급
- **위변조 검증** — SHA-256 해시 기반 원본 확인 + 변경 이력 추적

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS v4, Framer Motion |
| Backend | Next.js API Routes, Vercel AI SDK (`streamText`) |
| AI | Claude API (Sonnet) |
| DB/Auth | Supabase (PostgreSQL + Auth + Storage + RLS) |
| 배포 | Vercel |
| UI 패턴 | 글래스모피즘 + 벤토 그리드 + Mesh Gradient |

---

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx                    # 랜딩 페이지
│   ├── (auth)/login, signup/       # 인증
│   ├── dashboard/                  # 역할별 대시보드
│   ├── tutor/                      # 소크라테스 AI 튜터
│   ├── career/                     # 진로 시뮬레이터
│   ├── books/                      # 도서 추천
│   ├── teacher/
│   │   ├── formatter/              # 공문서 포맷터
│   │   ├── generator/              # 공문서 생성기
│   │   └── documents/              # 문서 발급 워크플로우
│   │       ├── upload/             #   업로드 + 양식 검토
│   │       ├── [id]/               #   상세 (승인/수정/발급)
│   │       └── verify/             #   위변조 검증
│   └── api/                        # API Routes (6개)
├── components/
│   ├── layout/header.tsx
│   └── shared/glass-card.tsx
└── lib/
    ├── ai/                         # 프롬프트 (tutor, career)
    ├── data/                       # 규칙 엔진, 해시 유틸
    └── supabase/                   # 클라이언트/서버/미들웨어
```

---

## 로컬 실행

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정
cp .env.example .env
# NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, ANTHROPIC_API_KEY 입력

# 3. 개발 서버 실행
npm run dev
```

---

## 환경변수

| 변수 | 설명 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 공개 키 |
| `ANTHROPIC_API_KEY` | Claude API 키 |

---

## AI 활용

이 프로젝트는 **Claude Code (Opus 4.6)**를 활용하여 설계부터 배포까지 전 과정을 AI와 협업하여 개발했습니다.

- **Supabase MCP**: 자연어로 DB 마이그레이션 실행
- **Vercel MCP**: 배포 상태 모니터링 및 빌드 에러 진단
- **Context7 MCP**: 최신 라이브러리 문서 실시간 조회

자세한 내용은 [AI 활용 리포트](docs/ai_report.md)를 참고하세요.

---

## 라이선스

MIT
