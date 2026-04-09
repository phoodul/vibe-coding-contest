# Mind Palace Implementation Plan v2

## 핵심 원칙 (이전 구현의 문제점 & 교정)

**이전 문제**: 텍스트 중심 구현. SVG는 획일적 사각형 + 이모지. Scene이 부속품 취급됨.  
**교정**: **Scene(시각적 장면)이 전부**. 텍스트는 장면 속 오브젝트에 정신적으로 할당되는 것.

### Method of Loci 핵심 메커니즘
1. **1 오브젝트 = 1 학습 항목** (leaf NoteNode)
2. 오브젝트는 **자연스러운 사물** (액자, 책장, 시계, 지구본, 화분 등)
3. 복합 정보는 **오브젝트의 파트**로 분리 (액자 좌측=사실A, 우측=사실B)
4. **고정 탐색 경로** (시계 방향, 위→아래)로 순서 보장
5. **기이하고 생생한 이미지**가 기억에 남음

### 매핑 구조
```
Room (StructuredSection) = 강의실
  └── Zone (Note) = 방 안의 구역 (북쪽 벽, 서쪽 책장 등)
        └── Object (depth-0 NoteNode) = 구역 안의 사물 (액자, 시계, 책...)
              └── Part (depth-1+ NoteNode) = 사물의 부분 (액자 좌측, 우측...)
```

예시 — "직업의 의미와 직업 윤리" (Note):
```
📌 Zone: 서쪽 벽 책장 영역
  ├── 🖼️ 맹자 액자 (Object)
  │     ├── 좌측 그림: "사회적 분업 필요성 강조"  (Part)
  │     └── 우측 그림: "노심자와 노력자 구분"     (Part)
  ├── 📜 순자 두루마리 (Object)
  │     ├── 상단: "예에 기반한 직분 의식 강조"     (Part)
  │     └── 하단: "사회 질서 유지 목적"           (Part)
  ├── ⛪ 칼뱅 성경 (Object)
  │     ├── 표지: "소명설: 직업 = 신이 부여한 소명" (Part)
  │     ├── 펼쳐진 페이지: "직업적 성공 = 구원의 증거" (Part)
  │     └── 책갈피: "베버 프로테스탄티즘 분석"      (Part)
  └── 📕 마르크스 빨간 책 (Object)
        ├── 전면: "자본주의적 노동 → 인간 소외"    (Part)
        └── 후면: "노동은 자아실현의 수단"          (Part)
```

---

## Step 1: 오브젝트 라이브러리 (SVG 사물 일러스트)

**새 파일**: `src/components/mind-palace/objects/`

15~20가지 재사용 가능한 SVG 오브젝트 컴포넌트 제작:

| 카테고리 | 오브젝트 | 용도 예시 |
|---------|---------|---------|
| 벽 장식 | 액자(Painting), 칠판(Blackboard), 시계(Clock) | 사상가, 이론 |
| 가구 | 책장(Bookshelf), 책상(Desk), 의자(Chair) | 분류 체계, 비교표 |
| 소품 | 지구본(Globe), 화분(Plant), 램프(Lamp) | 국제, 자연, 통찰 |
| 문서 | 두루마리(Scroll), 책(Book), 노트(Notebook) | 학자, 저작 |
| 기타 | 트로피(Trophy), 저울(Scale), 문(Door) | 업적, 정의, 전환 |

각 오브젝트 SVG:
- **사실적이지만 간결한** 일러스트 스타일 (outlined + flat color)
- **클릭 가능 파트**가 정의됨 (hitArea 영역)
- **하이라이트 상태**: 글로우 + 확대 애니메이션
- **라벨 슬롯**: 오브젝트 위/아래에 keyword 표시 가능
- Props: `active`, `highlighted`, `showLabel`, `label`, `onClick`

```typescript
interface PalaceObjectProps {
  x: number;
  y: number;
  scale?: number;
  active?: boolean;        // 현재 나레이터가 읽고 있는 오브젝트
  showKeyword?: boolean;   // keyword 표시 여부
  keyword?: string;
  parts?: ObjectPart[];    // 클릭 가능한 파트들
  onPartClick?: (partIndex: number) => void;
  onObjectClick?: () => void;
}

interface ObjectPart {
  label: string;           // 파트 이름 ("좌측", "우측")
  hitArea: { x: number; y: number; w: number; h: number };
}
```

**verify**: 각 오브젝트가 독립적으로 렌더되고 클릭 가능

---

## Step 2: Scene Config (방 × 오브젝트 배치도)

**새 파일**: `src/lib/mind-palace/scene-config.ts`

각 Room(Section)에 어떤 오브젝트가 어디에 배치되는지 정의:

```typescript
interface SceneObjectConfig {
  id: string;              // "obj_mengzi_painting"
  type: ObjectType;        // "painting" | "scroll" | "book" | ...
  noteNodePath: number[];  // 매핑될 NoteNode 경로 [noteIdx, nodeIdx, ...]
  x: number;               // Scene 내 좌표
  y: number;
  scale?: number;
  label: string;           // "맹자 액자"
  keyword: string;         // "맹자"
  parts: {
    label: string;         // "좌측 그림"
    nodeIndex: number;     // 매핑될 leaf NoteNode의 flatIndex
    text: string;          // 해당 structured_text
  }[];
}

interface RoomSceneConfig {
  roomId: string;          // "301"
  sectionId: string;       // "ch3_s1"
  background: string;      // 배경 타입 ("classroom", "library", ...)
  objects: SceneObjectConfig[];
  walkPath: string[];      // 탐색 순서 (오브젝트 ID 배열)
}
```

**ch3 Scene 배치 계획:**

### Room 301: 직업과 청렴의 윤리 (5개 note → ~30개 오브젝트)
- **북쪽 벽 (칠판 영역)**: "직업의 의미" → 칠판에 개념도, 동양/서양 구분 화살표
- **서쪽 책장**: "전문직 윤리와 기업 윤리" → 책장 선반에 각 전문직 상징물
- **책상 위**: "노동의 의미" → 노트북, 필기구, 법전
- **동쪽 창문**: "시장경제 윤리" → 창 밖 풍경(시장), 창턱 소품
- **출입문 옆**: "청렴과 부패 방지" → 목민심서 액자, 저울

### Room 302: 사회 정의와 윤리 (7개 note → ~40개 오브젝트)
- **칠판**: 정의 개념 분류도
- **좌측 벽**: 롤스 초상+무지의 베일 상징
- **우측 벽**: 노직 초상+최소국가 상징
- **책상**: 왈처 비교표, 사형제 찬반 저울
- **뒤쪽**: 우대정책 포스터

### Room 303: 국가와 시민의 윤리 (3개 note → ~20개 오브젝트)
### Room 304: 정의론 종합 비교 (3개 note → ~25개 오브젝트)

**verify**: 모든 leaf NoteNode가 정확히 1개의 오브젝트 파트에 매핑됨

---

## Step 3: Scene Renderer (방 배경 + 오브젝트 렌더링)

**파일**: `src/components/mind-palace/palace-scene.tsx` (재작성)

### 렌더링 구조
```
<svg viewBox="0 0 1200 700">
  <!-- 방 배경 (벽, 바닥, 천장, 문, 창문) -->
  <RoomBackground type="classroom" />
  
  <!-- 오브젝트들 (scene config 기반) -->
  {config.objects.map(obj => (
    <PalaceObject 
      key={obj.id}
      type={obj.type}
      x={obj.x} y={obj.y}
      active={activeObjId === obj.id}
      showKeyword={mode === "learn"}
      keyword={obj.keyword}
      parts={obj.parts}
      onPartClick={handlePartClick}
    />
  ))}
  
  <!-- 현재 활성 오브젝트의 speech bubble (SVG foreignObject) -->
  {activePart && <SpeechBubble ... />}
</svg>
```

### 핵심 변경
- Scene이 **전체 화면**을 차지 (Sidebar 제외)
- 오브젝트는 **자연스러운 위치**에 배치 (config 기반)
- 배경은 실제 강의실처럼 보이는 일러스트
- 오브젝트 hover → 살짝 확대 + 글로우
- 오브젝트 클릭 → keyword 사라지고 speech bubble 표시
- speech bubble은 **오브젝트를 가리지 않음** (반대편에 배치)

---

## Step 4: 학습 모드 인터랙션

### 기본 상태 (Scene 전체 보기 = 학습 지도)
- 모든 오브젝트가 자연스럽게 배치된 Scene
- 각 오브젝트/파트에 **keyword가 아주 작은 글씨(~9px)로** 항상 표시됨
- Scene 전체가 학습 내용의 "지도" 역할 — 한눈에 모든 keyword 확인 가능
- Sidebar에 목록 Tree (접기/펴기 가능)
- "전체보기" 버튼으로 Sidebar 접기 가능

### 오브젝트/keyword 클릭
1. 오브젝트 또는 keyword 클릭
2. 작은 keyword 사라짐
3. 해당 node의 structured_text가 **폰트 16px speech bubble**로 오브젝트 옆에 표시
4. 하위 항목(children)이 있으면 전체 하위 트리도 표시
5. speech bubble은 오브젝트를 **가리지 않음** (옆에 배치)
6. 다른 곳 클릭 시 bubble 닫히고 keyword 다시 작은 글씨로 복귀

### 나레이터 연동 (Scene 내 직접 표시 — 하단 패널 없음)
1. 나레이터 ON → **originalText**(교과서 원문) TTS 읽기
2. 읽는 동안 **node 단위**로 순차 진행:
   - 해당 node의 **작은 keyword가 사라짐**
   - 오브젝트/파트가 **Scene 위에서 직접 글로우 하이라이트**
   - 해당 node의 structured_text가 **오브젝트 바로 옆에 폰트 16px로 강조 표시**
   - **오브젝트↔텍스트 연결선** 애니메이션
3. 다음 node → 이전 텍스트 페이드(keyword 작은 글씨로 복귀) → 새 node 강조
4. 일시정지 → **현재 node의 강조 상태 그대로 유지** (keyword 사라진 채, 텍스트 16px 표시)
5. **별도 하단 패널 없음** — 모든 텍스트 표시는 Scene 위에서만

### 음성 설정 (우측 상단)
- ON/OFF 버튼, 멈춤 버튼
- 남성 3개 (onyx, echo, alloy), 여성 3개 (nova, shimmer, fable)

---

## Step 5: 복습 모드 인터랙션

### 기본 상태
- **keyword 없음**, 오브젝트만 표시된 Scene
- 사용자가 이미지 보고 할당된 텍스트를 스스로 recall

### 3-click cycle (좌클릭)
1. **1번째 클릭**: keyword 표시
2. **2번째 클릭**: keyword 사라짐 → structured_text 폰트 16px 표시
3. **3번째 클릭**: structured_text 사라짐 → Scene만 표시

### 키보드 방향키
- structured_text tree 순서(depth-first)에 따라 내부 순번 할당
- **← 좌측 화살표**: 이전 오브젝트 (= 클릭 1회와 동일)
- **→ 우측 화살표**: 다음 오브젝트 (= 클릭 1회와 동일)
- 탐색 순서 = walkPath (시계 방향)

---

## Step 6: 나레이터 업그레이드

**파일**: `src/hooks/use-structured-narrator.ts`

### 변경점
1. TTS 단위: **Note 단위** (원본 교과서 detail 읽기)
2. 읽을 텍스트: `getOriginalText(noteId)` — 기호 제외한 원본
3. **화면 하이라이트 단위: Node 단위** (개별 NoteNode)
   - TTS가 note 원문을 읽는 동안, **node 단위로 순차적** 하이라이트 진행
   - 각 node의 structured_text가 폰트 16px로 **개별 강조**
   - 해당 node에 매핑된 **오브젝트/파트가 개별 하이라이트**
   - note 전체가 한번에 보이는 것이 아니라, node가 하나씩 드러남
4. 음성 선택: 6개 (현재 구현 유지)
5. 일시정지: **현재 node 하이라이트 상태 그대로 유지**

---

## Step 7: Room 301 완전 구현 (데모)

ch3_s1 "직업과 청렴의 윤리"를 완전한 장면으로 구현:

1. **Scene Config 작성**: 30개+ 오브젝트 배치
2. **SVG 오브젝트 제작**: 필요한 오브젝트 타입 구현
3. **데이터 매핑**: 모든 leaf NoteNode ↔ 오브젝트 파트 1:1 매핑
4. **인터랙션 테스트**: 클릭, 나레이터, 복습 모드 전체 동작

이 한 Room이 완벽하게 동작하면 나머지 Room도 같은 패턴으로 확장.

---

## 구현 우선순위

| 순서 | 작업 | 비고 |
|------|------|------|
| 1 | Step 1: 오브젝트 라이브러리 (10개 타입) | SVG 제작 |
| 2 | Step 2: Scene Config (Room 301) | 데이터 매핑 |
| 3 | Step 3: Scene Renderer 재작성 | 핵심 변경 |
| 4 | Step 4: 학습 모드 인터랙션 | 클릭 + 나레이터 |
| 5 | Step 5: 복습 모드 | 3-click + 방향키 |
| 6 | Step 7: Room 301 완전 구현 | 데모 완성 |
| 7 | 나머지 Room (302~304) | 확장 |

## Step 8: AI 자동 생성 파이프라인 (핵심 차별화)

**참고 사례**:
- **Mind Architect** (Gemini 해커톤): PDF → AI가 JSON scene config 생성 → 인터랙티브 궁전
- **SofiaBargues/memory-palace** (GitHub): Next.js + GPT-4o + DALL-E 3
- 우리는 DALL-E 대신 **SVG + LLM config 생성** 방식 채택 (비용 0, 인터랙티브)

### 파이프라인

```
교과서 원문 (StructuredSection)
    ↓ Claude API
Scene Config JSON 자동 생성
    ↓
{
  objects: [
    { type: "painting", keyword: "맹자", label: "맹자 초상 액자",
      x: 120, y: 80, parts: [
        { label: "좌측", text: "사회적 분업 필요성 강조" },
        { label: "우측", text: "노심자와 노력자 구분" }
      ]
    },
    ...
  ],
  walkPath: ["obj_mengzi", "obj_xunzi", ...]
}
    ↓
SVG Scene Renderer
```

**새 API**: `/api/mind-palace/generate-scene`
- Input: `StructuredSection` (structured text 트리)
- Output: `RoomSceneConfig` (오브젝트 배치 + 매핑)
- Claude가 내용에 맞는 오브젝트 타입과 연상 관계를 자동 생성
- 방당 1회 생성 → localStorage 캐시

### 프롬프트 설계
```
당신은 Method of Loci(기억의 궁전) 전문가입니다.
주어진 structured text를 강의실 장면의 오브젝트에 매핑하세요.

규칙:
1. 각 leaf NoteNode = 1개 오브젝트 파트
2. 관련 내용은 하나의 오브젝트에 그룹화 (예: 맹자의 두 주장 = 맹자 액자의 좌/우)
3. 오브젝트는 자연스러운 사물 (액자, 책, 지구본, 시계 등)
4. 배치는 시계 방향 탐색 경로를 따름
5. 오브젝트 타입은 내용과 연상되게 선택 (정의 → 저울, 국제 → 지구본)
6. 좌표는 viewBox 0~1200(x), 0~700(y) 범위

JSON 형식으로 출력하세요.
```

### 이점
- **새 챕터 확장 시 수작업 제로**: structured text만 있으면 AI가 scene 자동 생성
- **콘텐츠-오브젝트 연상 관계** 자동 최적화
- **심사위원 임팩트**: AI가 교과서 내용을 시각적 기억 궁전으로 자동 변환

---

## 기술 결정

- **오브젝트 SVG**: React 컴포넌트 (인라인 SVG) — 상태 기반 렌더링 가능
- **Speech Bubble**: SVG `<foreignObject>` 내 HTML — CSS 자유도 높음
- **연결선**: SVG `<path>` + Framer Motion strokeDasharray 애니메이션
- **배경**: 단일 SVG 레이어 (벽+바닥+가구 기본형)
- **오브젝트 배치**: 절대 좌표 (scene config에 정의, AI 자동 생성)
- **탐색 순서**: config의 walkPath 배열 (시계 방향)
- **AI 파이프라인**: Claude API → Scene Config JSON (1회 생성, 캐시)
- **이미지 생성 불필요**: SVG 일러스트 + AI config > DALL-E (비용, 인터랙티브, 일관성)

## 구현 우선순위 (수정)

| 순서 | 작업 | 비고 |
|------|------|------|
| **1** | Step 1: 오브젝트 라이브러리 (10개 타입) | SVG 제작 |
| **2** | Step 8: AI Scene Config 생성 API | 핵심 차별화 |
| **3** | Step 2+3: Scene Config + Renderer | AI 결과 렌더링 |
| **4** | Step 4: 학습 모드 인터랙션 | 클릭 + 나레이터 |
| **5** | Step 5: 복습 모드 | 3-click + 방향키 |
| **6** | Step 7: Room 301 완전 구현 | 데모 완성 |
| **7** | 나머지 Room (302~304) | AI로 자동 확장 |
