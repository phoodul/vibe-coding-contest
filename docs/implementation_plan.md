# Implementation Plan

> 작성일: 2026-04-06 | 상태: **승인됨** (사용자 전권 위임)

---

## 1. 프로젝트 개요

### 프로젝트명
MindPalace (마인드팰리스) — AI 기억의 궁전 학습 + 교사 AI 어시스턴트

### 목표
교과서 단원 → AI 마인드맵 → 기억의 궁전 배치 → 복습의 학습 사이클과, 교사용 AI 피드백/생기부 도구를 7일 내 구현하여 배포

### 스코프 경계
- **포함:** 기억의 궁전 (마인드맵 + 장소 배치 + 복습), 교사 도구 (수행평가 피드백 + 생기부), Auth, 랜딩 페이지
- **제외:** 교권 침해 신고, 자동 해설서, 학부모 리포트, 모바일 앱

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
├── layout.tsx              # 루트 레이아웃 (폰트, 테마)
├── page.tsx                # 랜딩 페이지
├── globals.css             # Tailwind + 커스텀 CSS
├── (auth)/
│   ├── login/page.tsx
│   └── signup/page.tsx
├── dashboard/
│   ├── page.tsx            # 역할별 대시보드
│   ├── loading.tsx
│   └── error.tsx
├── palace/
│   ├── page.tsx            # 내 궁전 목록
│   ├── new/
│   │   └── page.tsx        # 단원 선택 → 마인드맵 생성
│   ├── [id]/
│   │   ├── page.tsx        # 궁전 상세 (장소 + 배치)
│   │   └── review/
│   │       └── page.tsx    # 복습 모드
│   └── _components/
│       ├── mind-map-view.tsx
│       ├── location-selector.tsx
│       ├── location-map.tsx
│       └── review-card.tsx
├── teacher/
│   ├── page.tsx            # 교사 대시보드
│   ├── feedback/
│   │   └── page.tsx        # 수행평가 피드백
│   ├── record/
│   │   └── page.tsx        # 생기부 초안
│   └── _components/
│       ├── feedback-form.tsx
│       ├── record-form.tsx
│       └── ai-output.tsx
├── api/
│   ├── mindmap/
│   │   └── generate/route.ts   # 마인드맵 생성 (streamObject)
│   ├── palace/
│   │   └── connect/route.ts    # 기억 연결 스토리 (streamText)
│   └── teacher/
│       ├── feedback/route.ts   # 수행평가 피드백 (streamText)
│       └── record/route.ts     # 생기부 초안 (streamText)
components/
├── ui/                 # Shadcn/ui
├── layout/
│   ├── header.tsx
│   ├── sidebar.tsx
│   └── footer.tsx
└── shared/
    ├── glass-card.tsx
    ├── mesh-gradient.tsx
    └── animated-container.tsx
lib/
├── supabase/
│   ├── client.ts
│   ├── server.ts
│   └── middleware.ts
├── ai/
│   ├── mindmap-prompt.ts
│   ├── palace-prompt.ts
│   ├── feedback-prompt.ts
│   └── record-prompt.ts
├── data/
│   ├── curriculum.ts       # 성취기준 데이터
│   └── locations.ts        # 장소 데이터 (이름, 구역, 이미지 경로)
└── utils.ts
types/
├── mindmap.ts
├── palace.ts
└── teacher.ts
public/
└── locations/              # 장소 이미지 (10개 × 5구역)
    ├── gyeongbokgung/
    ├── hanok/
    ├── museum/
    └── ...
middleware.ts               # Supabase Auth 세션 갱신
```

---

## 3. DB 스키마 (Supabase)

### 테이블 정의

```sql
-- 사용자 프로필
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher')) DEFAULT 'student',
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 마인드맵
CREATE TABLE public.mind_maps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  grade TEXT NOT NULL,
  subject TEXT NOT NULL,
  unit_title TEXT NOT NULL,
  nodes JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.mind_maps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own mind maps"
  ON public.mind_maps FOR ALL
  USING (auth.uid() = user_id);

-- 기억의 궁전
CREATE TABLE public.palaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  mind_map_id UUID REFERENCES public.mind_maps(id) NOT NULL,
  location_key TEXT NOT NULL,
  placements JSONB NOT NULL,
  memory_stories JSONB,
  review_count INTEGER DEFAULT 0,
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.palaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own palaces"
  ON public.palaces FOR ALL
  USING (auth.uid() = user_id);

-- 수행평가 피드백
CREATE TABLE public.feedback_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  rubric TEXT NOT NULL,
  student_answer TEXT NOT NULL,
  ai_feedback TEXT,
  edited_feedback TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.feedback_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers manage own feedback"
  ON public.feedback_drafts FOR ALL
  USING (auth.uid() = teacher_id);

-- 생활기록부 초안
CREATE TABLE public.student_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES auth.users(id) NOT NULL,
  student_name TEXT NOT NULL,
  record_data JSONB NOT NULL,
  ai_draft TEXT,
  edited_draft TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.student_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers manage own records"
  ON public.student_records FOR ALL
  USING (auth.uid() = teacher_id);
```

---

## 4. API 엔드포인트

| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| POST | /api/mindmap/generate | Required | 단원 → 마인드맵 JSON (streamObject) |
| POST | /api/palace/connect | Required | 노드+장소 → 기억 연결 스토리 (streamText) |
| POST | /api/teacher/feedback | Required (teacher) | 루브릭+답안 → 피드백 (streamText) |
| POST | /api/teacher/record | Required (teacher) | 학생 데이터 → 생기부 (streamText) |

---

## 5. 페이지별 구현 상세

### 5-1. 랜딩 페이지 (`/`)
- **레이아웃:** 벤토 그리드 + 글래스모피즘 다크 테마
- **섹션:** Hero (타이틀 + CTA) → 기억의 궁전 소개 → 교사 도구 소개 → 사용 방법 3스텝
- **애니메이션:** Staggered fadeUp, Mesh Gradient 배경, hover lift

### 5-2. 기억의 궁전 — 새 학습 (`/palace/new`)
- **단원 선택:** 과목 → 단원 (2단계 셀렉트, 고등학교 선택과목 3개)
- **마인드맵 생성:** "마인드맵 생성" 버튼 → AI 스트리밍으로 노드가 하나씩 나타남
- **마인드맵 시각화:** 중앙 노드 + 방사형 하위 노드 (SVG 또는 Canvas)
- **데이터 흐름:** 선택 → POST /api/mindmap/generate → streamObject → 클라이언트 렌더

### 5-3. 기억의 궁전 — 상세 (`/palace/[id]`)
- **장소 선택:** 글래스 카드 그리드로 10개 장소 표시 (이미지 + 이름)
- **배치 UI:** 선택한 장소의 구역 맵 + 드래그 가능한 마인드맵 노드
- **기억 연결:** 배치 완료 → AI가 각 노드-장소 연결 스토리 생성
- **데이터 흐름:** 배치 → POST /api/palace/connect → streamText → 스토리 표시

### 5-4. 복습 모드 (`/palace/[id]/review`)
- **카드 방식:** 장소 구역 이미지 + "이 장소에 무엇이 있었나요?" → 사용자 답변 → 정답 공개
- **진행 바:** 전체 노드 중 몇 개를 기억했는지 시각화

### 5-5. 교사 — 수행평가 피드백 (`/teacher/feedback`)
- **입력:** 평가 제목, 루브릭(텍스트 에리어), 학생 답안(텍스트 에리어)
- **생성:** 버튼 → AI 스트리밍 피드백
- **편집:** 생성된 피드백을 직접 수정 → 승인/저장
- **히스토리:** 이전 생성 기록 목록

### 5-6. 교사 — 생기부 초안 (`/teacher/record`)
- **입력 폼:** 학생 이름, 출결(일수), 수행평가(점수/내용), 동아리, 봉사활동, 특기사항
- **생성:** 버튼 → AI 스트리밍 생기부 문장
- **편집:** 수정 → 복사/저장

---

## 6. AI 프롬프트 설계

### 마인드맵 생성 (mindmap-prompt.ts)
```
역할: 한국 교육과정 전문가. 2022 개정 교육과정의 성취기준을 바탕으로 학습 마인드맵을 생성한다.
입력: 학년, 과목, 단원명, 성취기준
출력: JSON — { centerNode, childNodes: [{ id, label, description, children }] }
규칙:
- 핵심 개념 5-7개
- 각 개념에 1-2줄 설명
- 개념 간 관계(선수 지식, 확장)를 명시
- 학생 수준에 맞는 쉬운 언어 사용
```

### 기억 연결 (palace-prompt.ts)
```
역할: 기억법 전문가. 기억의 궁전(Method of Loci) 기법으로 학습 내용을 장소와 연결한다.
입력: 마인드맵 노드, 장소명, 구역명
출력: 각 노드-구역 연결에 대한 생생한 기억 스토리 (감각적 묘사 포함)
규칙:
- 시각, 청각, 촉각 등 다감각 묘사
- 장소의 실제 특징과 학습 개념의 연결 고리 제시
- 과장되고 기억에 남는 이미지 사용 (기억법의 핵심)
- 각 스토리 3-4문장
```

### 수행평가 피드백 (feedback-prompt.ts)
```
역할: 교육 평가 전문가. 루브릭 기반으로 학생에게 건설적 피드백을 제공한다.
입력: 평가 루브릭, 학생 답안
출력: 구조화된 피드백 (잘한 점 → 개선점 → 구체적 제안)
규칙:
- 소크라틱 방식: 답을 직접 주지 않고 "~에 대해 다시 생각해보세요" 스타일
- 루브릭의 각 기준에 대해 구체적으로 평가
- 격려와 개선 방향을 균형 있게 제시
- 존댓말 사용
```

### 생기부 초안 (record-prompt.ts)
```
역할: 학교생활기록부 작성 전문가. 학생의 활동 데이터를 생기부 양식에 맞는 문장으로 변환한다.
입력: 학생 이름, 출결, 수행평가, 동아리, 봉사활동, 특기사항
출력: 생활기록부 스타일의 서술형 문장 (3-5문장)
규칙:
- 객관적 사실 기반 서술
- 학생의 성장과 노력을 부각
- 생기부 공식 양식(3인칭 서술, ~함, ~을 보임 등)을 따름
- 구체적인 활동 내용과 결과를 포함
```

---

## 7. 교육과정 데이터 구조

```typescript
// lib/data/curriculum.ts
interface CurriculumUnit {
  subject: string;      // "생명과학Ⅰ"
  unitTitle: string;    // "세포와 세포분열"
  standards: string[];  // 성취기준 목록
}

// 데모 데이터: 고등학교 3과목 × 3단원 = 9단원
// - 국어 언어와 매체: 음운 체계, 단어의 형성, 매체 언어의 특성
// - 사회 생활과 윤리: 생명윤리, 사회윤리, 과학기술 윤리
// - 과학 생명과학Ⅰ: 세포와 세포분열, 유전, 생태계와 상호작용
```

### 장소 데이터 구조
```typescript
// lib/data/locations.ts
interface PalaceLocation {
  key: string;              // "gyeongbokgung"
  name: string;             // "경복궁"
  description: string;      // 간단한 설명
  imageUrl: string;         // 대표 이미지
  zones: {
    id: string;             // "geunjeongjeon"
    name: string;           // "근정전"
    description: string;    // 구역 설명
    imageUrl: string;       // 구역 이미지
    position: { x: number; y: number }; // 맵 위 위치
  }[];
}
```

---

## 8. 구현 순서 (스프린트 플랜)

### Day 1 (04.06, 오늘): 기획 + 인프라
- [x] PRD 작성
- [x] Implementation Plan 작성
- [ ] Next.js 15 프로젝트 초기화
- [ ] Shadcn/ui + Tailwind 설정
- [ ] 기본 레이아웃 (Header, 다크 테마, Mesh Gradient)
- [ ] Supabase 프로젝트 + 테이블 생성
- [ ] Auth 기본 연동 (로그인/회원가입 UI)
- [ ] Vercel 첫 배포
- **체크포인트:** 빈 셸 + Auth가 작동하는 상태로 배포

### Day 2 (04.07): 마인드맵 코어
- [ ] 교육과정 데이터(curriculum.ts) 입력
- [ ] 단원 선택 UI (학년→과목→단원)
- [ ] /api/mindmap/generate 구현 (streamObject)
- [ ] 마인드맵 시각화 컴포넌트 (SVG 기반)
- [ ] 마인드맵 → DB 저장
- **체크포인트:** 단원 선택 → 마인드맵 생성 → 시각화 데모

### Day 3 (04.08): 기억의 궁전
- [ ] 장소 데이터(locations.ts) + 이미지 준비
- [ ] 장소 선택 UI (글래스 카드 그리드)
- [ ] 장소 구역 맵 UI
- [ ] 노드-구역 배치 인터랙션
- [ ] /api/palace/connect 구현 (기억 연결 스토리)
- **체크포인트:** 마인드맵 → 장소 선택 → 배치 → 스토리 생성

### Day 4 (04.09): 복습 + 교사 도구
- [ ] 복습 모드 UI (카드 플립 + 진행 바)
- [ ] 교사 대시보드
- [ ] 수행평가 피드백 (/teacher/feedback) — 폼 + AI 생성 + 편집
- [ ] 생기부 초안 (/teacher/record) — 폼 + AI 생성 + 편집
- **체크포인트:** 전체 기능 E2E 동작

### Day 5 (04.10): 통합 & 안정화
- [ ] Auth 플로우 완성 (역할 분기, 보호 라우트)
- [ ] 에러 바운더리 (모든 라우트에 error.tsx)
- [ ] 로딩 상태 (스켈레톤 UI)
- [ ] 전체 빌드 에러 0 확인
- [ ] 엣지 케이스 처리
- **체크포인트:** npm run build 성공, 콘솔 에러 0

### Day 6 (04.11): UI 광택
- [ ] Framer Motion 애니메이션 (staggered, fadeUp, hover lift)
- [ ] 글래스모피즘 + 벤토 그리드 적용
- [ ] 반응형 (모바일/태블릿)
- [ ] 랜딩 페이지 완성
- [ ] 마이크로 인터랙션 (모든 클릭 가능 요소)
- **체크포인트:** Vibe Score 8+/10

### Day 7 (04.12~13): 제출
- [ ] AI 리포트 작성 (ai_report_template.md 기반)
- [ ] README.md 작성
- [ ] 최종 버그 수정
- [ ] Vercel 프로덕션 최종 배포
- [ ] GitHub public 설정 + API Key 노출 확인
- **체크포인트:** 모든 제출물 완료

---

## 9. 리스크 & 대안

| 리스크 | 확률 | 대안 |
|--------|------|------|
| 장소 이미지 확보 어려움 | 중 | Unsplash/Pexels 무료 이미지 + AI 설명 텍스트로 보완 |
| 마인드맵 시각화 복잡도 | 중 | 단순 트리 구조로 시작, 시간 남으면 라디얼 레이아웃 |
| AI API 속도 | 낮 | 스트리밍 UI로 체감 속도 개선 |
| 스코프 초과 | 높 | 복습 모드를 최소한으로 구현, 교사 도구는 깔끔한 폼+생성으로 한정 |
| Auth 복잡도 | 낮 | Supabase Auth는 검증된 패턴, references에 레시피 있음 |

---

## 승인

- [x] 스코프가 7일 내 완성 가능한가? → Yes (핵심 기능 집중)
- [x] 핵심 기능이 심사 기준 4가지를 커버하는가? → Yes (위 매핑 참조)
- [x] Wow Feature가 정의되어 있는가? → Yes (기억의 궁전)

> **승인:** 사용자 전권 위임 (2026-04-06)
