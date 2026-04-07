# Implementation Plan — EduFlow AI

> 작성일: 2026-04-08 | 상태: **승인됨** (사용자 전권 위임 + 자율주행)

---

## 1. 프로젝트 개요

### 프로젝트명
EduFlow AI — AI 기반 차세대 교육 솔루션

### 핵심 컨셉
- **학생**: 소크라테스식 AI 튜터링 + AI 진로 시뮬레이터 + 맞춤 도서 추천
- **교사**: 공문서 양식 자동 포맷터 + AI 공문서 생성기

### 심사 기준 매핑
| 심사 항목 | 대응 기능 |
|-----------|----------|
| AI 활용 능력 | 소크라테스 튜터(프롬프트 전략), 진로 매칭(LLM 추론), 공문서 생성(구조화 output) |
| 기술적 완성도 | Next.js 15 App Router + Supabase Auth + Vercel AI SDK 스트리밍 |
| 실무 적합성 | 학생 pain point(학습+진로) + 교사 pain point(행정 업무) 동시 해결 |
| 창의성 및 확장성 | 소크라테스 학습법(Khanmigo 검증) + 5000+ 직업 DB + 코드 포맷터식 공문서 교정 |

---

## 2. 기술 아키텍처

### 시스템 구조
```
[Browser] → [Next.js 15 App Router] → [Vercel Edge/Serverless]
                                              ↓
                                    [Supabase (PostgreSQL + Auth)]
                                              ↓
                                    [Claude API via Vercel AI SDK]
```

### 폴더 구조
```
app/
├── layout.tsx              # 루트 레이아웃 (폰트, 다크 테마)
├── page.tsx                # 랜딩 페이지
├── globals.css
├── (auth)/
│   ├── login/page.tsx
│   └── signup/page.tsx
├── dashboard/
│   └── page.tsx            # 역할별 대시보드 (학생/교사)
├── tutor/
│   └── page.tsx            # 소크라테스 AI 튜터
├── career/
│   └── page.tsx            # 진로 시뮬레이터
├── books/
│   └── page.tsx            # 도서 추천
├── teacher/
│   ├── formatter/
│   │   └── page.tsx        # 공문서 포맷터
│   └── generator/
│       └── page.tsx        # 공문서 생성기
├── api/
│   ├── tutor/route.ts      # 소크라테스 튜터 (streamText)
│   ├── career/route.ts     # 진로 추천 (streamObject/streamText)
│   ├── books/route.ts      # 도서 추천 (streamText)
│   └── teacher/
│       ├── format/route.ts # 공문서 포맷 교정 (streamText)
│       └── generate/route.ts # 공문서 생성 (streamText)
components/
├── ui/                     # Shadcn/ui
├── layout/
│   ├── header.tsx
│   └── sidebar.tsx
└── shared/
    ├── glass-card.tsx
    ├── mesh-gradient.tsx
    └── chat-interface.tsx
lib/
├── supabase/
│   ├── client.ts
│   ├── server.ts
│   └── middleware.ts
├── ai/
│   ├── tutor-prompt.ts     # 소크라테스 튜터 system prompt
│   ├── career-prompt.ts    # 진로 매칭 prompt
│   ├── books-prompt.ts     # 도서 추천 prompt
│   ├── formatter-prompt.ts # 공문서 교정 prompt
│   └── generator-prompt.ts # 공문서 생성 prompt
├── data/
│   ├── careers.ts          # 5000+ 직업 데이터
│   ├── subjects.ts         # 교과목 데이터
│   └── document-rules.ts   # K-에듀파인 공문서 규칙
└── utils.ts
types/
├── career.ts
├── tutor.ts
└── document.ts
middleware.ts               # Supabase Auth 세션 갱신
```

---

## 3. DB 스키마 (Supabase)

```sql
-- 사용자 프로필
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher')) DEFAULT 'student',
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own profile" ON public.profiles FOR ALL USING (auth.uid() = id);

-- 튜터 대화 기록
CREATE TABLE public.tutor_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.tutor_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sessions" ON public.tutor_sessions FOR ALL USING (auth.uid() = user_id);

-- 진로 평가 결과
CREATE TABLE public.career_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  assessment_data JSONB NOT NULL,
  recommendations JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.career_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own assessments" ON public.career_assessments FOR ALL USING (auth.uid() = user_id);

-- 공문서 작업 기록 (교사용)
CREATE TABLE public.document_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES auth.users(id) NOT NULL,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('format', 'generate')),
  original_text TEXT,
  result_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.document_drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teachers manage own drafts" ON public.document_drafts FOR ALL USING (auth.uid() = teacher_id);
```

---

## 4. 기능별 구현 상세

### 4-1. 소크라테스 AI 튜터 (메인 기능)

**핵심 원리**: 답을 주지 않고 질문으로 이끄는 대화형 학습 (Khanmigo 검증, 수학 성적 14% 향상)

**교과 선택**: 국어(언어와 매체), 사회(생활과 윤리), 과학(생명과학I) — 3과목

**대화 흐름**:
1. 학생이 교과/단원 선택 후 질문 입력
2. AI가 소크라테스식으로 역질문 (절대 답을 직접 주지 않음)
3. 힌트 3단계: Lv1(방향 제시) → Lv2(구체적 힌트) → Lv3(거의 답에 가까운 설명)
4. 학생이 5회 이상 막히면 자동 힌트 레벨 상승
5. 정답 도달 시 개념 정리 + 관련 심화 질문 제안

**기술 구현**: Vercel AI SDK `useChat` + `streamText`, system prompt에 교과별 지식 + 행동 규칙 주입

### 4-2. 진로 시뮬레이터 (5,000+ 직업)

**평가 항목**: MBTI, 취미, 적성, 독서 성향, 성적 분포, 운동능력, 관심분야

**매칭 로직**:
1. 학생이 7개 항목 입력 (UI 폼)
2. 1차 필터: 규칙 기반으로 카테고리 매칭 → 상위 100개 직업 후보
3. 2차 LLM 분석: 학생 프로필 vs 100개 직업 비교 → 상위 15~20개 추천 + 추천 이유
4. 진로 경로 시각화: 현재 학년 → 추천 대학/전공 → 직업 (플로우차트)

**직업 데이터**: 한국직업사전(800) + KSCO(1,206) + O*NET(1,016) + LLM 생성(2,000+)
- 핵심: 학생이 잘 모르는 직업까지 포함 (수중음향분석관, 식품향료개발자 등)

### 4-3. 도서 추천 (별도 섹션)

**입력**: 학년, 희망 학과/대학, 희망 진로
**출력**: LLM이 맞춤 도서 10~15권 추천 + 추천 이유 + 읽는 순서 제안
**기술**: streamText로 스트리밍 응답

### 4-4. 공문서 포맷터 (Mode 1 — 코드 포맷터 방식)

**핵심 컨셉**: "코드에서 단축키 한번으로 포맷팅하듯" 공문서 양식 자동 교정

**K-에듀파인 규칙 엔진**:
- 항목 기호 순서: 1. → 가. → 1) → 가) → (1) → (가) → ① → ㉮
- 날짜: 2026. 4. 8. (연월일 뒤 점)
- 시간: 15 : 30 (24시각제, 쌍점 앞뒤 1타)
- 금액: 금10,000원(금일만원)
- 붙임/끝 표시
- 2타 띄우기 규칙

**UI**: 
- 텍스트 에디터에 공문서 내용 입력/붙여넣기
- "검사" 버튼 → diff 뷰로 차이점 하이라이트
- "다음 차이점" 버튼으로 순차 검토
- "모두 적용" 단축키로 원클릭 수정

### 4-5. 공문서 생성기

**입력**: 자유 텍스트 (교사가 전달할 내용을 자유롭게 작성)
**출력**: AI가 두문-본문-결문 공문서 구조로 자동 생성
- 수신자, 제목, 본문(항목 기호 적용), 붙임, 끝 표시 자동 배치
- 생성 후 포맷터와 연동하여 최종 교정

---

## 5. AI 프롬프트 설계

### 소크라테스 튜터 (tutor-prompt.ts)
```
역할: 소크라테스식 AI 튜터. 절대 답을 직접 주지 않는다.
원칙:
1. 학생의 질문에 역질문으로 답한다
2. 힌트 레벨 3단계: 방향 제시 → 구체적 힌트 → 거의 답
3. 학생이 정답에 도달하면 칭찬 + 개념 정리 + 심화 질문
4. 학생이 5회 이상 틀리면 힌트 레벨 자동 상승
5. 항상 한국어 존댓말
6. 교과 범위를 벗어나는 질문은 부드럽게 거절
```

### 진로 매칭 (career-prompt.ts)
```
역할: 진로 상담 전문가. 학생의 프로필을 분석하여 최적 직업을 추천한다.
입력: 학생 프로필 (MBTI, 흥미, 적성 등) + 직업 후보 리스트
출력: 상위 15~20개 직업 + 각각의 추천 이유 + 필요 역량 + 진로 경로
규칙: 잘 알려지지 않은 직업도 적극 추천. 현실적 연봉/전망 정보 포함.
```

### 공문서 교정 (formatter-prompt.ts)
```
역할: K-에듀파인 공문서 양식 전문가.
입력: 교사가 작성한 텍스트
출력: 규칙 위반 목록 + 수정 제안
규칙: 항목기호, 날짜/시간/금액 표기, 붙임/끝, 2타 띄우기 등
```

---

## 6. 구현 순서 (5일 스프린트)

### D1 (04.08, 오늘): 인프라 + 소크라테스 튜터
- [x] implementation_plan.md 작성
- [ ] Next.js 15 프로젝트 초기화 (Shadcn/ui, Tailwind, Framer Motion)
- [ ] Supabase Auth 연동 + middleware
- [ ] 기본 레이아웃 (Header, 다크 테마, Mesh Gradient)
- [ ] 랜딩 페이지 (글래스모피즘 + 벤토 그리드)
- [ ] 소크라테스 AI 튜터 (useChat + streamText + 교과 선택)
- [ ] Vercel 첫 배포
- **체크포인트:** 로그인 → 교과 선택 → AI 대화가 동작하는 상태

### D2 (04.09): 진로 시뮬레이터 + 도서 추천
- [ ] 5,000+ 직업 데이터 생성 (LLM 활용)
- [ ] 진로 평가 UI (7개 항목 입력 폼)
- [ ] /api/career 구현 (필터링 + LLM 매칭)
- [ ] 진로 경로 시각화
- [ ] 도서 추천 페이지 (/books)
- **체크포인트:** 평가 입력 → 직업 추천 + 경로 표시, 도서 추천 동작

### D3 (04.10): 교사 도구 (공문서 포맷터 + 생성기)
- [ ] K-에듀파인 규칙 엔진 구현
- [ ] 공문서 포맷터 UI (diff 뷰 + 순차 검토 + 원클릭)
- [ ] 공문서 생성기 (텍스트 → 공문서 구조)
- [ ] 교사 대시보드
- **체크포인트:** 텍스트 입력 → 포맷 교정 diff 표시, 공문서 자동 생성

### D4 (04.11): 통합 + UI 광택
- [ ] Framer Motion 애니메이션 (staggered, fadeUp, hover lift)
- [ ] 에러 바운더리 + 스켈레톤 UI
- [ ] 반응형 (모바일/태블릿)
- [ ] 전체 빌드 에러 0 확인
- [ ] Debugger agent 실행
- **체크포인트:** npm run build 성공, 콘솔 에러 0

### D5 (04.12~13): 제출
- [ ] AI 활용 리포트 작성
- [ ] README.md 작성
- [ ] 최종 버그 수정
- [ ] Vercel 프로덕션 최종 배포
- [ ] GitHub public 설정
- **체크포인트:** 모든 제출물 완료

---

## 7. 리스크 & 대안

| 리스크 | 확률 | 대안 |
|--------|------|------|
| 5000 직업 데이터 품질 | 중 | LLM 생성 + 수동 검증 상위 500개 |
| 공문서 규칙 엔진 복잡도 | 중 | 핵심 규칙 5개만 우선 구현, LLM 보조 |
| AI API 속도 | 낮 | 스트리밍 UI로 체감 속도 개선 |
| 스코프 초과 | 중 | 소크라테스 튜터 > 진로 > 공문서 순으로 우선순위 |

---

## 승인

- [x] 스코프가 5일 내 완성 가능한가? → Yes
- [x] 핵심 기능이 심사 기준 4가지를 커버하는가? → Yes
- [x] Wow Feature가 정의되어 있는가? → Yes (소크라테스 튜터 + 공문서 포맷터)

> **승인:** 사용자 전권 위임 + 자율주행 (2026-04-08)
