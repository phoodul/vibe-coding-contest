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

---

# Phase 2 — AI 영어 음성 회화 (Voice Conversation)

> 작성일: 2026-04-08 | 상태: **승인 대기**

## 1. 기능 개요

학생의 영어 단어 학습 수준에 맞춰 AI와 음성으로 영어 회화를 하는 시스템.
단어 시험 결과 기반으로 AI가 회화 수준을 추천하거나, 학생이 직접 레벨을 선택할 수 있다.

### 심사 기준 매핑
| 심사 항목 | 대응 |
|-----------|------|
| AI 활용 능력 | 학습 수준 맞춤 프롬프트 + 원어민 표현 제안 + 대화 후 AI 리포트 |
| 기술적 완성도 | Web Speech API(STT) + Claude(AI) + OpenAI TTS 3단 파이프라인 |
| 실무 적합성 | 영어 회화 연습 기회 부족 → AI로 무제한 1:1 회화 |
| 창의성 및 확장성 | 학습 데이터 연동 회화 + 음성 다양성 + 실시간 자막 토글 |

---

## 2. 아키텍처

```
[마이크] → Web Speech API (STT, 무료)
              ↓ 텍스트
          [Claude AI] → 수준 맞춤 응답 생성 (Vercel AI SDK streamText)
              ↓ 텍스트
          [OpenAI gpt-4o-mini-tts] → 음성 변환 (Vercel AI SDK generateSpeech)
              ↓ 오디오
          [<audio> 재생] + [AI Persona 애니메이션]
```

### 새로운 의존성
- `@ai-sdk/openai` — TTS용 (gpt-4o-mini-tts)

### 비용 예측
- STT: $0 (Web Speech API)
- Claude 응답: ~$0.01/대화
- TTS: ~$0.015/분
- **10분 회화 약 $0.16 → $200 예산으로 1,250회 가능**

---

## 3. 새로운 라우트

```
app/
├── conversation/
│   └── page.tsx              # 영어 음성 회화 메인
├── api/
│   ├── conversation/
│   │   └── route.ts          # Claude 회화 응답 (streamText)
│   └── tts/
│       └── route.ts          # OpenAI TTS 음성 생성
lib/
├── ai/
│   └── conversation-prompt.ts # 회화 시스템 프롬프트
```

---

## 4. 핵심 기능 상세

### 4-1. 회화 수준 설정

**두 가지 진입 경로:**
- **직접 선택**: US Grade 1~12 + College 중 선택하는 슬라이더/셀렉트
- **AI 추천**: 간단한 단어 퀴즈(10문항) → 결과 기반으로 AI가 적정 레벨 추천

레벨별 어휘 가이드라인을 시스템 프롬프트에 주입:
```
Grade 3-4: ~3,000 word families, simple sentences
Grade 5-6: ~6,000 word families, compound sentences
Grade 7-8: ~10,000 word families, complex topics
Grade 9-12: ~15,000+ word families, academic discussion
```

### 4-2. 대화 주제 선택 + 선공 선택

**주제 카테고리** (각 3~5개 세부 시나리오):
- 일상 (카페 주문, 길 묻기, 쇼핑)
- 학교 (수업 토론, 동아리, 시험 준비)
- 여행 (공항, 호텔, 관광지)
- 자유 대화 (주제 없이 프리토킹)

**선공 선택:**
- "내가 먼저" → 빈 상태에서 사용자가 말하기 시작
- "AI가 먼저" → AI가 상황 설정 + 첫 마디를 던짐 (예: "Welcome to the café! What can I get for you today?")

### 4-3. 음성 선택

OpenAI gpt-4o-mini-tts 기본 음성 + voice instructions 조합:

| UI 표시 | 음성 ID | voice instructions |
|---------|---------|-------------------|
| 여성 (밝은) | nova | "Speak in a bright, friendly tone" |
| 여성 (차분한) | shimmer | "Speak in a calm, gentle tone" |
| 남성 (깊은) | onyx | "Speak in a deep, warm tone" |
| 남성 (중성적) | echo | "Speak in a neutral, clear tone" |
| 청소년 톤 | coral | "Speak like an enthusiastic young student" |
| 선생님 톤 | sage | "Speak like a patient, encouraging teacher" |

### 4-4. 실시간 자막 (토글 on/off)

- AI 응답 텍스트를 화면에 표시 (기본: ON)
- 토글 버튼으로 켜기/끄기
- 켜면: 읽기+듣기 병행 학습
- 끄면: 순수 리스닝 훈련

### 4-5. 원어민 표현 제안 (Better Expression)

대화 중 사용자가 문법적으로 맞지만 어색한 표현을 사용하면, AI가 응답 후에 자연스러운 대안을 제안:

```
You said: "I want to go to the store for buying milk"
💡 More natural: "I want to go to the store to buy milk"
   (Use "to + verb" for purpose, not "for + verb-ing")
```

Claude 시스템 프롬프트에 규칙 추가:
- 대화 흐름을 끊지 않도록 응답 마지막에 별도 블록으로 제안
- 매 턴마다 하지 않고, 교정할 가치가 있을 때만 제안
- JSON 구조로 분리해서 UI에서 별도 카드로 표시

### 4-6. AI Persona 애니메이션

대화 상태에 따른 시각적 피드백:
- **idle**: 잔잔한 파동 (대기 중)
- **listening**: 음파 반응 애니메이션 (사용자 말하는 중)
- **thinking**: 펄스 애니메이션 (AI 응답 생성 중)
- **speaking**: 리듬 있는 파동 (AI 말하는 중)

Framer Motion으로 구현. 원형 아바타 + 주변 파동 이펙트.

### 4-7. 대화 후 리포트

회화 종료 시 Claude가 대화 전체를 분석해서 리포트 생성:
- **잘한 점**: 자연스러웠던 표현 하이라이트
- **개선할 점**: 틀린 문법/어색한 표현 정리
- **새로운 표현**: AI가 사용한 표현 중 학습 가치 있는 것 추출
- **학습 방향 추천**: "접속사 활용 연습 필요", "과거 시제 표현 강화" 등 구체적 제안
- **추천 레벨 조정**: 현재 레벨이 너무 쉬웠는지/어려웠는지 판단

---

## 5. DB 스키마 추가

```sql
-- 영어 회화 세션
CREATE TABLE public.conversation_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  level TEXT NOT NULL,              -- 'grade-3', 'grade-6', 'grade-9' 등
  topic TEXT NOT NULL,              -- 'cafe', 'airport', 'free-talk' 등
  voice TEXT NOT NULL,              -- 'nova', 'onyx' 등
  messages JSONB NOT NULL DEFAULT '[]',
  report JSONB,                     -- 대화 후 리포트
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.conversation_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own conversations"
  ON public.conversation_sessions FOR ALL USING (auth.uid() = user_id);
```

---

## 6. 시스템 프롬프트 설계

### 회화 프롬프트 (conversation-prompt.ts)
```
역할: 영어 회화 파트너. 학생의 어휘 수준에 맞춰 대화한다.

규칙:
1. {level}에 해당하는 어휘와 문장 구조만 사용한다.
2. 학생이 수준 이상의 단어를 사용하면 자연스럽게 칭찬한다.
3. 학생이 문법 오류를 범하면 대화 흐름을 유지하면서 올바른 표현을 자연스럽게 반복한다.
4. 응답은 2-3문장으로 간결하게 한다 (회화는 짧은 턴이 핵심).
5. 주제: {topic}에 맞는 상황극을 진행한다.
6. 모든 응답은 영어로만 한다.
7. 학생의 표현이 문법적으로 맞지만 어색하면, 응답 후 [BETTER] 블록에 자연스러운 대안을 제안한다.

응답 형식:
{
  "reply": "AI의 영어 응답",
  "better": {                      // 없으면 null
    "original": "학생이 말한 표현",
    "suggestion": "더 자연스러운 표현",
    "explanation": "간단한 설명 (한국어)"
  }
}
```

### 리포트 프롬프트
```
아래 영어 회화 대화 기록을 분석하여 학습 리포트를 생성하라.

출력 형식:
{
  "strengths": ["잘한 점 1", "잘한 점 2"],
  "improvements": [
    {"expression": "틀린 표현", "correction": "올바른 표현", "rule": "문법 규칙"}
  ],
  "new_vocabulary": [
    {"word": "단어", "meaning": "뜻", "example": "예문"}
  ],
  "study_direction": "구체적 학습 방향 추천",
  "level_feedback": "현재 레벨 적합도 + 추천 조정"
}
```

---

## 7. 구현 순서

### Step 1: 인프라 셋업
- [ ] `@ai-sdk/openai` 설치
- [ ] `/api/conversation/route.ts` — Claude 회화 API (streamText, JSON mode)
- [ ] `/api/tts/route.ts` — OpenAI TTS API (generateSpeech)
- **검증:** API 호출 → 텍스트 응답 + 오디오 바이너리 반환 확인

### Step 2: 회화 페이지 기본 UI
- [ ] `/conversation/page.tsx` — 레벨 선택 + 주제 선택 + 음성 선택 + 선공 선택
- [ ] 대화 시작 → AI Persona 화면 전환
- [ ] GlassCard 기반 설정 UI (기존 디자인 패턴 활용)
- **검증:** 설정 완료 → 회화 화면 진입

### Step 3: 음성 파이프라인 연결
- [ ] Web Speech API로 마이크 입력 → 텍스트 변환
- [ ] 텍스트 → `/api/conversation` → Claude 응답
- [ ] 응답 텍스트 → `/api/tts` → 오디오 재생
- [ ] 브라우저 미지원 시 안내 메시지
- **검증:** 말하기 → AI 음성 응답 전체 루프 동작

### Step 4: 부가 기능
- [ ] 실시간 자막 토글 (on/off)
- [ ] 원어민 표현 제안 카드 UI ([BETTER] 블록 파싱)
- [ ] AI Persona 애니메이션 (idle/listening/thinking/speaking)
- **검증:** 자막 토글 동작, 표현 제안 표시, 상태별 애니메이션 전환

### Step 5: 대화 후 리포트
- [ ] 대화 종료 버튼 → 리포트 생성 API 호출
- [ ] 리포트 UI (잘한 점 / 개선점 / 새 어휘 / 학습 방향)
- [ ] Supabase에 세션 + 리포트 저장
- **검증:** 회화 종료 → 리포트 표시 + DB 저장 확인

### Step 6: 대시보드 연동
- [ ] 대시보드에 "AI 영어 회화" 카드 추가
- [ ] 빌드 확인 (`npm run build` 에러 0)
- **검증:** 대시보드 → 회화 → 대화 → 리포트 전체 플로우

---

## 8. 리스크 & 대안

| 리스크 | 확률 | 대안 |
|--------|------|------|
| Web Speech API 브라우저 미지원 | 중 | Chrome 권장 안내 + Whisper API 폴백 |
| TTS 지연 (1초+) | 중 | 로딩 애니메이션으로 체감 속도 개선 |
| gpt-4o-mini-tts voice instructions 버그 | 낮 | 기본 음성만으로도 남녀 구분 가능 |
| 회화 JSON 파싱 실패 | 중 | 텍스트 폴백 (JSON 실패 시 plain text로 처리) |

---

## 승인 대기

- [x] 기존 기능에 영향 없이 추가 가능한가? → Yes (새 라우트만 추가)
- [x] 예산 내 구현 가능한가? → Yes ($10 이내 예상)
- [x] 심사 기준 4가지를 강화하는가? → Yes (AI 활용 + 기술 완성도 + 실무 적합성 + 창의성)

> **승인:** 대기 중
