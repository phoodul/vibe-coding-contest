# 마인드 맵 3과목 확장 — 생물1 + 언어와 매체

## 현황
- 생활과 윤리: 6챕터, structured 완료 (100개 content)
- 생물1: 5챕터, raw 데이터 있음 (210개 content), structured 없음
- 언어와 매체: 5챕터, raw 데이터 있음 (121개 content), structured 없음

## 변경 사항

### 1. Structured 데이터 생성 (10 파일)

`src/lib/data/textbooks/structured/` 에 생성:
- `biology-structured-ch1~ch5.ts` — 210개 content의 NoteNode 트리
- `korean-structured-ch1~ch5.ts` — 121개 content의 NoteNode 트리

기존 ethics 패턴 동일: `StructuredSection[]` export, 명사형 종결, 계층 트리

### 2. build-tree.ts — 교과목 파라미터 지원

- `buildMindMapTree(subject: "ethics" | "biology" | "korean")` 형태
- 각 교과목별 textbook + structured 데이터 로드
- biology, korean 용 import 추가

### 3. mind-map 페이지 — 교과목 전환 UI

- 헤더에 탭 3개: 생활과 윤리 / 생물1 / 언어와 매체
- 탭 클릭 시 tree 재빌드, focusedId 리셋

## 수정 파일

1. `src/lib/data/textbooks/structured/biology-structured-ch1~5.ts` (신규 5개)
2. `src/lib/data/textbooks/structured/korean-structured-ch1~5.ts` (신규 5개)
3. `src/lib/mind-map/build-tree.ts` — 3과목 지원
4. `src/app/mind-map/page.tsx` — 교과목 전환 탭

## 검증
1. 빌드 통과
2. 3과목 탭 전환 작동
3. 각 과목 마지막 노드까지 드릴다운 가능
