# Mind Map 구현 계획

기억의 궁전(Mind Palace)을 완전히 폐기하고, 교과서 전체를 탐색할 수 있는 **인터랙티브 마인드 맵**으로 교체한다.

## 핵심 컨셉

- 교과서 1권의 모든 내용이 루트 → 챕터 → 섹션 → 콘텐츠 → (구조화 노드) 로 이어지는 거대한 트리
- 클릭으로 점진적 확장 (Progressive Disclosure)
- 깊이 0~1: 시작 시 바로 보임 (루트 + 챕터), 센터링 없음
- 깊이 2+: 클릭하면 해당 노드가 화면 중앙으로 이동 + 자식 노드 표시 + 부모와의 연결선 유지
- 형제 노드 11색 순환: 빨, 노, 초, 주, 파, 보, 갈, 남, 금, 은, 동
- 노드 스타일: 랜딩페이지 글래스카드 + 색상 입힘 + 가독성 좋은 글씨

## 데이터 소스

| 소스 | 범위 | 깊이 |
|------|------|------|
| `ETHICS_TEXTBOOK` (lib/data/textbooks/ethics.ts) | 전체 6챕터 | Chapter → Section → Content (3단계) |
| `ETHICS_STRUCTURED_CH3` (src/lib/data/textbooks/structured/) | ch3만 | + NoteNode 재귀 트리 (5~6단계) |

**전략**: 전체 교과서는 flat 데이터로 3단계 트리 구성. ch3는 structured 데이터를 병합하여 깊은 트리 제공.

## 트리 구조 (MindMapNode)

```
Root ("생활과 윤리")
├── Ch1 "현대 생활과 실천 윤리"
│   ├── S1 "윤리학의 의미와 분류"
│   │   ├── C1 "윤리학의 정의" (leaf — detail은 tooltip/패널)
│   │   ├── C2 "이론 윤리학"
│   │   └── ...
│   └── S2 "의무론적 윤리학"
│       └── ...
├── Ch3 "사회와 윤리"       ← structured 데이터 병합
│   ├── S1 "직업과 청렴의 윤리"
│   │   ├── C1 "직업의 의미와 직업 윤리"
│   │   │   ├── "직업: 생계 수단 + 사회적 역할..."
│   │   │   ├── "동양적 관점"
│   │   │   │   ├── "맹자(孟子)"
│   │   │   │   │   ├── "사회적 분업 필요성 강조"
│   │   │   │   │   └── ...
│   │   │   │   └── ...
│   │   │   └── ...
│   │   └── ...
│   └── ...
└── ...
```

## 파일 구조

### 삭제 (Mind Palace 전체)
- `src/components/mind-palace/` (전체 디렉토리)
- `src/lib/mind-palace/` (전체 디렉토리)
- `src/hooks/use-structured-narrator.ts`
- `src/app/mind-palace/` (전체 디렉토리)

### 생성
1. **`src/lib/mind-map/build-tree.ts`**
   - `MindMapNode` 타입 정의 (id, label, detail?, color, children, depth)
   - `buildMindMapTree(textbook)` — Textbook → MindMapNode 트리 변환
   - ch3 structured 데이터 자동 병합
   - `SIBLING_COLORS` — 11색 배열 + hex 값

2. **`src/lib/mind-map/layout.ts`**
   - `computeLayout(root, expandedIds)` — 확장된 노드 기준 방사형 좌표 계산
   - 각 노드에 (x, y) 좌표 부여
   - 부모-자식 간 연결선 좌표

3. **`src/components/mind-map/mind-map-canvas.tsx`**
   - Pan/Zoom 캔버스 (CSS transform: translate + scale)
   - 마우스 드래그 팬, 휠 줌
   - 노드 렌더링: 글래스카드 스타일 + 색상
   - SVG 연결선 (부모↔자식)
   - 클릭 시 expand/collapse + 깊이 2+ 센터링 애니메이션
   - leaf 노드 클릭 시 detail 텍스트 표시

4. **`src/app/mind-map/page.tsx`**
   - 전체 화면 마인드 맵 페이지
   - 헤더: 제목 + 현재 경로 breadcrumb + 홈으로 리셋 버튼

### 수정
- `src/app/dashboard/page.tsx` — href "/mind-palace" → "/mind-map"
- `src/app/page.tsx` — 랜딩페이지 mind-palace 참조 → mind-map

## 레이아웃 알고리즘

방사형 트리 레이아웃:
1. 루트 노드: (0, 0) — 화면 중앙
2. 자식 노드: 부모로부터 반지름 R 떨어진 호 위에 균등 배치
3. R은 깊이에 따라 조정 (깊이 0→1: 300px, 1→2: 250px, 2→3: 200px, ...)
4. 형제가 많으면 호 각도 확장, 겹침 방지
5. 확장된 노드만 자식 좌표 계산 (비확장 = 자식 숨김)

## 색상 시스템

```ts
const SIBLING_COLORS = [
  { name: "빨", bg: "#ef4444", text: "#fff" },
  { name: "노", bg: "#eab308", text: "#000" },
  { name: "초", bg: "#22c55e", text: "#fff" },
  { name: "주", bg: "#f97316", text: "#fff" },
  { name: "파", bg: "#3b82f6", text: "#fff" },
  { name: "보", bg: "#a855f7", text: "#fff" },
  { name: "갈", bg: "#92400e", text: "#fff" },
  { name: "남", bg: "#1e3a5f", text: "#fff" },
  { name: "금", bg: "#d4a017", text: "#000" },
  { name: "은", bg: "#9ca3af", text: "#000" },
  { name: "동", bg: "#b87333", text: "#fff" },
];
```

형제 노드의 인덱스 % 11로 색상 결정. 글래스카드: `bg-{color}/20 backdrop-blur border-{color}/30`.

## 인터랙션 상세

1. **초기 상태**: 루트("생활과 윤리") 중앙 + 6개 챕터 노드가 방사형 배치
2. **챕터 클릭** (깊이 1): 해당 챕터의 섹션들이 펼쳐짐. 센터링 없음.
3. **섹션 클릭** (깊이 2): 클릭한 섹션이 화면 중앙으로 smooth 이동 + 콘텐츠 자식 노드 표시
4. **더 깊은 노드 클릭** (깊이 3+): 동일하게 센터링 + 자식 표시
5. **이미 확장된 노드 클릭**: collapse (자식 숨김)
6. **leaf 노드 클릭**: detail 텍스트가 있으면 팝오버로 표시

## 구현 순서

1. Mind Palace 파일 전부 삭제
2. `build-tree.ts` — 트리 빌더 + 색상
3. `layout.ts` — 방사형 좌표 계산
4. `mind-map-canvas.tsx` — 캔버스 + 노드 + 연결선 + 인터랙션
5. `page.tsx` — 페이지 + 헤더
6. dashboard/landing 링크 업데이트
7. 빌드 검증
