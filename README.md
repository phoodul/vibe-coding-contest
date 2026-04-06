# MindPalace - AI 기억의 궁전

> 교과서를 마인드맵으로 펼치고, 기억의 궁전에 저장하라

**바이브코딩 2026 공모전** 출품작 | AI활용 차세대 교육 솔루션

## 프로젝트 소개

MindPalace는 2,500년 역사의 가장 강력한 기억법인 **기억의 궁전(Method of Loci)**을 AI로 디지털 구현한 학습 플랫폼입니다.

학생은 교과서 단원을 선택하면 AI가 마인드맵을 생성하고, 경복궁/한옥마을 등 실제 한국 명소에 개념을 배치하여 장기 기억을 형성합니다. 교사는 AI가 생성한 수행평가 피드백과 생활기록부 초안으로 업무 부담을 줄입니다.

### 해결하는 문제

| 대상 | 문제 | 해결 |
|------|------|------|
| 학생 | 개인화 학습 부재, 단순 반복 암기 | AI 마인드맵 + 기억의 궁전으로 과학적 장기 기억 형성 |
| 교사 | 200-400명 수행평가 개별 피드백 불가 | AI가 루브릭 기반 소크라틱 피드백 초안 생성 |
| 교사 | 생활기록부 작성 시간 과부하 | AI가 학생 활동 데이터를 생기부 문장으로 변환 |

## 핵심 기능

### 1. AI 기억의 궁전 (학생용)
- **과목/단원 선택**: 언어와 매체, 생활과 윤리, 생명과학I (각 3단원)
- **AI 마인드맵 생성**: 교과서 목차 구조(단원 -> 소단원 -> 세부주제) 반영, 구체적 정의/과정/예시 포함
- **장소 선택**: 한국 명소 10곳 (경복궁, 한옥마을, 국립중앙박물관 등)
- **기억 연결 스토리**: VAKOG 다감각 인코딩 + 6대 강화 기법 (과장, 움직임, 감정, 이상함, 상호작용, 서사)
- **소품 레이어링**: 정보가 많을 때 AI가 장소 내 소품/세부위치를 동적으로 확장
- **인터랙티브 복습**: 장소를 순서대로 방문하며 배치된 개념을 회상
- **간격 반복**: 에빙하우스 망각곡선 기반 최적 복습 스케줄 (1시간 -> 당일 -> 다음날 -> 3일 -> 1주 -> 2주 -> 1개월)

### 2. AI 교사 도구
- **수행평가 피드백**: 루브릭 + 학생 답안 입력 -> AI가 소크라틱 방식 피드백 실시간 스트리밍
- **생활기록부 초안**: 출결/수행평가/동아리/봉사활동/특기사항 입력 -> 생기부 스타일 문장 생성

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 15 (App Router, Turbopack) |
| UI | Shadcn/ui + Tailwind CSS v4 |
| Animation | Framer Motion |
| Design | 글래스모피즘 + 메시 그라디언트 + 다크 테마 |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| AI | Claude Sonnet 4.5 via Vercel AI SDK v6 |
| Deploy | Vercel (Git 연동 자동 배포) |

## AI 활용

| AI 기능 | 설명 | API |
|---------|------|-----|
| 마인드맵 생성 | 성취기준 -> 교과서 구조 마인드맵 (JSON) | `generateObject` |
| 기억 연결 스토리 | 개념+장소 -> 다감각 기억 스토리 | `generateObject` |
| 구역 확장 | 노드 > 구역일 때 소품/세부위치 동적 생성 | `generateObject` |
| 수행평가 피드백 | 루브릭+답안 -> 소크라틱 피드백 | `streamText` |
| 생기부 초안 | 학생 데이터 -> 생기부 문장 | `streamText` |

## 로컬 실행

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
cp .env.example .env
# .env 파일에 API 키 입력

# 3. 개발 서버 실행
npm run dev
```

### 필요한 환경 변수

```
ANTHROPIC_API_KEY=your_anthropic_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 프로젝트 구조

```
app/
  page.tsx              # 랜딩 페이지
  dashboard/            # 대시보드
  palace/               # 기억의 궁전
    new/                # 단원 선택 + 마인드맵 생성
    create/             # 장소 선택 + 기억 스토리 생성
    [id]/               # 궁전 상세 + 복습 모드
  teacher/              # 교사 도구
    feedback/           # 수행평가 피드백
    record/             # 생기부 초안
  login/ signup/        # 인증
  api/                  # AI API 엔드포인트
lib/
  ai/                   # AI 프롬프트
  data/                 # 교육과정 데이터, 장소 데이터, 간격 반복
  supabase/             # Supabase 클라이언트
components/
  ui/                   # Shadcn/ui
  shared/               # 글래스 카드, 애니메이션, 마크다운
  layout/               # 헤더
```

## 리서치 기반 설계

- **기억의 궁전 방법론**: Dresler et al. (2017) Neuron 논문, 4회 미국 기억력 챔피언 Nelson Dellis의 기법
- **한국 교육 현장**: OECD TALIS 2024, 교육부 2022 개정 교육과정, 사교육비 통계
- **글로벌 AI 교육**: Khanmigo, Squirrel AI, MagicSchool, Third Space Learning 사례 분석

## 팀

- **정성수** — 기획, 개발, 디자인
- **Claude Opus 4.6** — AI 페어 프로그래밍 파트너

---

바이브코딩 2026 | AI활용 차세대 교육 솔루션
