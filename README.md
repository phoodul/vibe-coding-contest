# EasyEdu AI

**AI 활용 차세대 교육 솔루션** — 학생 맞춤 학습 16개 도구 + 교사 업무 자동화

> 바이브코딩 2026 공모전 출품작 | [프로덕션 URL](https://vibe-coding-contest.vercel.app)

---

## 해결하는 문제

| 대상 | Pain Point | EasyEdu AI 솔루션 |
|------|-----------|-------------------|
| **학생** | 사교육 의존, 개인화 학습 부재, 영어 회화 기회 부족, 수학 사고과정 훈련 부재 | 소크라테스 AI 튜터(실시간 웹 검색), 오일러 수학 튜터, 진로 시뮬레이터, AI 영어 회화 |
| **학부모** | 연간 수백만 원 사교육비 부담 | 무료 AI 1:1 튜터링으로 월 최대 40만원 절감 |
| **교사** | 학생부 10개 영역 작성 부담, 개인정보 노출 우려, 수업 준비 과부하 | 학생부 기재 도우미(가명처리), 원클릭 수업준비, 공문서 도구 |

---

## 주요 기능 (학생 12개 + 교사 4개 = 16개)

### 학생용 (12개)

| # | 기능 | 경로 | 설명 |
|---|------|------|------|
| 1 | **소크라테스 AI 튜터** | `/tutor` | 질문으로 이끄는 Guided Learning, 세션 이어하기, 단원 퀴즈, 자료 업로드(PDF/MD/URL) |
| 2 | **오일러 수학 튜터** | `/euler-tutor` | 수학 사고과정 코칭 (Sonnet 4.5), 이미지 입력, 수능 기출문제 연습 (2015~2024, 4영역 50문제) |
| 3 | **AI 영어 회화** | `/conversation` | PTT(스페이스바) 음성 대화, 레벨 테스트, AI 리포트(강점/교정/어휘) |
| 4 | **진로 시뮬레이터** | `/career` | MBTI/적성/흥미 → 5,000+ 직업 매칭 + 대학·학과 추천 |
| 5 | **AI 도서 추천** | `/books` | 학년·진로 기반 AI 큐레이션 + 국립중앙도서관 API 연동 + 독서 기록 |
| 6 | **인터랙티브 마인드맵** | `/mind-map` | 3과목 교과서 PDF 원문 기반 방사형 트리 시각화 |
| 7 | **에베레스트 단어 학습** | `/vocabulary` | 18,000개 영어 단어, 10단계 레벨, 에베레스트 등반 시각화 |
| 8 | **영문법 핵심 문장 듣기** | `/grammar-listen` | 3레벨(A1~C2) × 100문장 = 300문장 반복 청취 |
| 9 | **진로 탐색기** | `/pathfinder` | AI 기반 진로 경로 탐색 |
| 10 | **PAPS 체력 분석** | `/paps` | 체력 등급 분석 + AI 맞춤 운동 프로그램 |
| 11 | **음악 감상 도우미** | `/music-review` | AI 기반 음악 감상문 작성 지원 |
| 12 | **위기 개입 자원** | `/crisis` | 상담 전화·기관·행동 가이드 종합 자원 페이지 |

### 교사용 (4개)

| # | 기능 | 경로 | 설명 |
|---|------|------|------|
| 1 | **원클릭 수업준비** | `/teacher/lesson-prep` | 주제/파일 입력 → 슬라이드·워크시트·테스트·영상 4개 산출물 동시 생성 |
| 2 | **공문서 포맷터** | `/teacher/formatter` | K-에듀파인 양식 규칙 자동 교정 (HWP/DOCX/PDF/PPTX 파싱) |
| 3 | **공문서 초안 작성기** | `/teacher/generator` | K-에듀파인 양식에 맞는 공문서 초안 AI 생성 |
| 4 | **학생부 기재 도우미** | `/teacher/record` | 2026 기재요령 기반 10개 영역 관리 + 금지어 감지 + **가명처리(개인정보 보호)** + AI 맞춤법 검사 + 스크린샷 첨부 |

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS, Shadcn UI, Framer Motion |
| Backend | Next.js API Routes, Vercel AI SDK (`streamText`) |
| AI 모델 | Claude Sonnet 4.5 (오일러 튜터), Claude Sonnet 4 (15개 API), Claude Haiku 4.5 (영어 회화 + 맞춤법 검사), OpenAI gpt-4o-mini-tts |
| 웹 검색 | Tavily (웹 검색 + 영상 검색) |
| DB/Auth | Supabase (PostgreSQL + Auth + Storage + RLS) |
| 배포 | Vercel |
| UI 패턴 | 글래스모피즘 + 메시 그라디언트 + 다크모드 |
| 개발 도구 | Claude Code CLI (Opus 4.6, 1M context) |

---

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx                    # 랜딩 페이지
│   ├── (auth)/login, signup/       # 인증 (Google/GitHub/Kakao OAuth)
│   ├── dashboard/                  # 역할별 대시보드
│   ├── tutor/                      # 소크라테스 AI 튜터
│   ├── euler-tutor/                # 오일러 수학 튜터
│   ├── conversation/               # AI 영어 회화
│   ├── career/                     # 진로 시뮬레이터
│   ├── books/                      # AI 도서 추천 + 독서 기록
│   ├── mind-map/                   # 인터랙티브 마인드맵
│   ├── vocabulary/                 # 에베레스트 단어 학습
│   ├── grammar-listen/             # 영문법 핵심 문장 듣기
│   ├── pathfinder/                 # 진로 탐색기
│   ├── paps/                       # PAPS 체력 분석
│   ├── music-review/               # 음악 감상 도우미
│   ├── internship/                 # 직업 체험 시뮬레이터
│   ├── crisis/                     # 위기 개입 자원
│   ├── teacher/                    # 교사용 도구 4종
│   └── api/                        # API Routes (20개 엔드포인트)
├── components/                     # 공통 UI 컴포넌트
└── lib/
    ├── ai/                         # 시스템 프롬프트
    ├── data/                       # 교과서 데이터, 규칙 엔진
    └── supabase/                   # 클라이언트/서버/미들웨어
```

---

## 로컬 실행

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정
cp .env.example .env
# 아래 변수를 입력:
# NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
# ANTHROPIC_API_KEY
# OPENAI_API_KEY (TTS용)
# TAVILY_API_KEY (웹 검색용)

# 3. 개발 서버 실행
npm run dev
```

---

## AI 활용

이 프로젝트는 **Claude Code CLI (Opus 4.6, 1M context)**를 활용하여 설계부터 배포까지 전 과정을 AI와 협업하여 개발했습니다.

- 7개 서브 에이전트 + 6개 스킬 + 4개 Hooks로 AI 개발 워크플로우 체계화
- 6개 MCP 서버 연동 (Supabase, Playwright, Context7, Vercel, Sequential Thinking, Firebase)
- 182개+ 커밋, 25개 페이지, 20개 API 엔드포인트
- "아이디어는 사람, 구현은 AI, 검증은 함께" — 사람이 교육 현장의 문제를 정의하고 AI가 구현, Playwright로 함께 검증

자세한 내용은 [AI 활용 리포트](docs/ai_report.md)를 참고하세요.

---

## 라이선스

MIT
