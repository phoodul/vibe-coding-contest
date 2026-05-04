> 작성일 2026-05-05 / 17차 세션 D4 비전 정정 후속 / 베이스: 헤밍웨이 v2 + 기존 3 과목 패턴
> 관련: `docs/curriculum-matrix.md` · `docs/architecture-platform.md` · `docs/grammar-curriculum.md`

# Curriculum Content Spec — 자체 제작 교과서 표준

## 0. 목적

Phase 1 의 **Claude 자체 제작 교과서**를 한 과목씩 점진 추가할 때 따라야 할 표준.
헤밍웨이 영문법 v2 (14단원 75 레슨 MDX) 의 컨텐츠 모델을 일반화하되, 기존 3 과목
(생활과 윤리·언어와 매체·생명과학Ⅰ) 의 TS 데이터 패턴과 호환을 유지한다.

목표는 단일 과목 spec 한 번만 보면 누구든 새 과목을 같은 품질로 추가할 수 있게 하는 것.

## 1. 콘텐츠 트리 — 4 계층 모델

```
Subject (SubjectKey)
  └─ Chapter (대단원, 5~14개)
      └─ Section (중단원, 3~6개)
          └─ Content (소단원, 시험 대비 상세)
```

### 1-1. 타입 정의 (현재 코드, src/lib/data/textbooks/ethics-index.ts)

```ts
export interface TextbookContent {
  id: string;          // 'ch1_s1_c1' — chapter_section_content
  label: string;       // 짧은 제목
  detail: string;      // 교과서 수준 상세 설명 (시험 대비, 시험 출제 가능 모든 내용)
}

export interface TextbookSection {
  id: string;
  title: string;
  summary: string;
  contents: TextbookContent[];
}

export interface TextbookChapter {
  id: string;
  number: number;       // 1, 2, 3, ...
  title: string;
  overview: string;     // 단원 도입부 — 학생이 무엇을 배울지 한 문단
  sections: TextbookSection[];
}

export interface Textbook {
  subject: string;      // '생활과 윤리'
  subjectKey: string;   // 'ethics'
  title: string;
  chapters: TextbookChapter[];
}
```

### 1-2. 마인드맵용 구조화 트리 (별도)

`structured/` 폴더 — 같은 chapter 데이터를 **암기 친화** 명사형으로 재구성.

```ts
export interface NoteNode {
  text: string;          // 원본 명사형 ("의무론 = 행위의 동기·규칙 강조")
  keyword?: string;       // Scene object 위 짧은 키워드 (2~4자)
  originalText?: string;  // 나레이터가 읽을 원본 교과서 문장 (음성 코칭용)
  children?: NoteNode[];
}

export interface StructuredNote {
  id: string;             // TextbookContent.id 와 동일 (ch1_s1_c1)
  label: string;          // 원본 label 그대로
  keyword?: string;
  nodes: NoteNode[];      // depth 1~4 트리
}

export interface StructuredSection {
  id: string;
  title: string;
  summary: string;
  notes: StructuredNote[];
}
```

**왜 두 트리인가**:
- `Textbook*` = 소크라테스 튜터의 강의·코칭 system prompt 소스 (서술형 원문).
- `Structured*` = 마인드맵 시각화 + 나레이터 (암기형 명사 트리).
- 동일 chapter 가 두 도구를 동시 구동.

## 2. 디렉터리 표준

```
src/lib/data/textbooks/
├─ <subject>-index.ts         # Textbook 메타 + chapters 배열 (sections=[])
├─ <subject>.ts               # 모든 chapter 의 sections 합본 export
├─ <subject>-ch1.ts           # 단원 1 — TextbookSection[]
├─ <subject>-ch2.ts
├─ ...
└─ structured/
   ├─ <subject>-structured-index.ts  # type re-export (또는 단일 정의)
   ├─ <subject>-structured-ch1.ts    # StructuredSection[]
   ├─ <subject>-structured-ch2.ts
   └─ ...
```

**파일 명명 규칙**:
- subject prefix = SubjectKey (`ethics`, `biology`, `korean`, ...)
- chapter 파일은 `-ch{N}.ts` (1-indexed)
- structured 파일은 `-structured-ch{N}.ts`

## 3. 헤밍웨이 v2 패턴 (MDX) — 일반화

헤밍웨이 영문법은 chapter 단위가 아닌 **레슨 단위 MDX 파일** (75 lessons).

```
content/<subject>/
├─ <unit-N>-<lesson-N>-<slug>.md   # 예: 03-04-tense-perfect-vs-past.md
└─ ...
```

각 MDX 파일 = 800~1500자 한국어 설명 + 영어 대표 문장 1개 + 객관식·빈칸 5문제 + 해설.

**언제 MDX vs TS** 를 쓸 것인가:
| 조건 | 권장 |
|---|---|
| 텍스트가 자연어 위주 (영문법·국어·역사) | MDX |
| 트리 구조가 핵심 (생명과학·윤리 — 마인드맵 직결) | TS (현재 패턴) |
| 시각화가 정적 (수식·그래프 적음) | MDX 가능 |
| 단원 → 중단원 → 소단원 깊이가 4 이상 | TS 권장 |

**과도기적 결정** (사용자 입력 대기, 17차 첫 결정 항목):
- 신규 과목은 모두 MDX (헤밍웨이 패턴) 통일?
- 또는 트리 깊이가 깊으면 TS, 얕으면 MDX 자유 선택?

## 4. SubjectKey 확장 절차

`src/lib/mind-map/build-tree.ts:47`:
```ts
export type SubjectKey = "ethics" | "biology" | "korean";
//                                                      ↑ 새 키 추가
```

확장 시 함께 갱신:

| 파일 | 추가 |
|---|---|
| `src/lib/mind-map/build-tree.ts` | `SubjectKey` 타입 + `SUBJECT_DATA` Record |
| `src/app/mind-map/page.tsx` | `SUBJECTS` 배열 entry (key, label, icon) |
| `src/lib/ai/tutor-prompt.ts` | `SUBJECTS` (소크라테스 튜터 진입 UI) |
| `src/lib/data/textbooks/<subject>-index.ts` | 신규 파일 |
| `src/lib/data/textbooks/<subject>.ts` | 신규 파일 |
| `src/lib/data/textbooks/<subject>-ch{N}.ts` | chapter 수만큼 |
| `src/lib/data/textbooks/structured/<subject>-structured-ch{N}.ts` | 동일 |

## 5. 콘텐츠 분량 표준

| 단위 | 분량 (한국어 기준) |
|---|---|
| Chapter overview | 1 문단 (50~150자) |
| Section summary | 1~2 문단 (100~250자) |
| Content detail | **시험 대비 모든 내용** (200~800자, 하한선 = 시험 출제 가능 모든 키 개념) |
| MDX lesson | 800~1500자 + 대표 문장 + 5문제 (헤밍웨이 v2) |
| Structured node text | 명사형 1줄 (~50자), keyword 2~4자 |

**원칙**: 시험 대비를 우선시하라. 학생이 "교과서를 안 보고도 시험을 칠 수 있게" 콘텐츠를
짠다. 이는 헤밍웨이 v2 의 "텍스트북 학습 모델 = 영어 단어 18,000 에베레스트" 와 동일.

## 6. 진도 추적 DB schema (신설, 17차 결정 대기)

### 6-1. 헤밍웨이 v2 패턴 (`grammar_progress`, 미신설)

```sql
CREATE TABLE grammar_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_slug     TEXT NOT NULL,                    -- '03-04-tense-perfect-vs-past'
  status          TEXT NOT NULL DEFAULT 'in_progress',  -- in_progress / completed
  test_score      INT,                              -- 5문제 중 정답 수
  representative_sentence_memorized BOOLEAN DEFAULT FALSE,
  started_at      TIMESTAMPTZ DEFAULT now(),
  completed_at    TIMESTAMPTZ,
  UNIQUE(user_id, lesson_slug)
);
```

### 6-2. 일반 textbook_progress (자체 제작 chapter 단위)

```sql
CREATE TABLE textbook_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_key     TEXT NOT NULL,                    -- 'ethics', 'biology', ...
  chapter_id      TEXT NOT NULL,                    -- 'ch1', 'ch2', ... (또는 lesson slug)
  status          TEXT NOT NULL DEFAULT 'in_progress',
  mastery_score   FLOAT,                            -- 0.0 ~ 1.0 (튜터 평가 또는 자가 평가)
  attempts        INT DEFAULT 0,
  last_accessed   TIMESTAMPTZ DEFAULT now(),
  metadata        JSONB,                            -- {sections_completed: [...], notes: [...]}
  UNIQUE(user_id, subject_key, chapter_id)
);

-- RLS
ALTER TABLE textbook_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_own_progress_select" ON textbook_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_own_progress_upsert" ON textbook_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_own_progress_update" ON textbook_progress
  FOR UPDATE USING (auth.uid() = user_id);
```

### 6-3. 출판사 비전과의 관계

`architecture-platform.md` §2 의 `student_textbook_progress` 는 출판사 콘텐츠 (textbook
table FK) 용. 자체 제작은 FK 없이 `subject_key + chapter_id` 의 텍스트 식별자 사용 →
나중에 출판사 콘텐츠를 도입해도 자체 제작 진도가 호환됨.

## 7. 마인드맵 트리 빌드

`src/lib/mind-map/build-tree.ts` 의 `buildMindMapTree(subject)` 가 자동:

1. `SUBJECT_DATA[subject]` 의 `textbook` 과 `structured` 를 가져옴.
2. 루트 = subject (책 제목)
3. depth 1 = chapter
4. depth 2 = section (textbook) 또는 structured note (마인드맵)
5. depth 3+ = NoteNode children 트리

**색상 시스템**: 10색 팔레트 회전, 부모 색 제외 후 순환 (`getChildColor`).

신규 과목 추가 시 자동 작동 — `SUBJECT_DATA` Record 에 entry 만 추가하면 마인드맵 + 색상
+ depth 자동.

## 8. 자체 제작 워크플로우 (sequence)

각 과목 신설 = 다음 순서:

1. **목차 결정** — `docs/curriculum-<subject>.md` 작성 (헤밍웨이 패턴)
   - 대단원 5~14개 + 단원당 중단원 3~6개 + 학년 매핑.
2. **<subject>-index.ts** — `Textbook` 메타 + chapter 배열 (`sections: []`).
3. **<subject>-ch1.ts ... ch{N}.ts** — TextbookSection[] (시험 대비 detail).
4. **<subject>.ts** — 합본 export.
5. **structured/<subject>-structured-ch{N}.ts** — StructuredSection[] (암기 노트).
6. **build-tree.ts + mind-map/page.tsx + tutor-prompt.ts** — 3 파일 SubjectKey 등록.
7. **검증** — 마인드맵 페이지에서 새 과목 칩 클릭 → 트리 정상 렌더 확인.
8. **소크라테스 튜터** — `/tutor` 에서 새 SubjectKey 선택 → chapter 강의 정상 출력 확인.
9. **진도 DB** — `textbook_progress` 마이그레이션 (모든 과목 공통, 1회만).

## 9. Quality 검증 체크리스트 (1 chapter 분량)

작성 후 사용자 검토용:
- [ ] Chapter overview 가 "왜 이 단원을 배우는가" 명확
- [ ] Section summary 가 학습 목표를 한 문장으로 표현
- [ ] Content detail 이 시험 출제 가능 모든 키 개념을 빠짐없이 다룸
- [ ] 헷갈리는 개념 비교 (예: 의무론 vs 공리주의) 가 명시
- [ ] Structured 노드의 keyword 가 2~4자로 일관 (마인드맵 가독성)
- [ ] originalText 가 나레이터 음성에 적합한 자연 문장
- [ ] 마인드맵 트리 깊이 4 이내 (시각화 한계)

## 10. 결정 대기 (사용자 액션, 17차)

1. **MDX vs TS** — 신규 과목 통일 정책
2. **첫 자체 제작 과목** (`docs/curriculum-matrix.md` §"Phase 1 우선순위" 3 후보 중)
3. **chapter 분량 표준** — 800~1500자 (헤밍웨이) vs 시험 대비 1500~3000자 보강
4. **`textbook_progress` 마이그레이션 시점** — 첫 과목 작성과 동시 vs 별도 단계
