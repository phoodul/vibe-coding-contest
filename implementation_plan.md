# MindMapTree SVG 시각화 통합

## 목표
palace/new 페이지의 텍스트 카드 기반 마인드맵 → SVG 방사형 시각화로 교체

## 변경사항

### 1. palace/new/page.tsx
- MindMapTree 컴포넌트 import
- `selectedNodeIndex` 상태 추가
- Step 4(마인드맵 표시) 영역을 SVG + 노드 상세 패널로 교체
  - 상단: MindMapTree SVG (시각적 임팩트)
  - 하단: 클릭한 노드의 상세 정보 (description, subNodes)
  - 하단: 궁전 배치 버튼

### 2. MindMapTree 개선 (필요시)
- 한국어 텍스트 잘림 개선
- 반응형 개선

## 검증
- 마인드맵 생성 후 SVG 시각화 확인
- 노드 클릭 시 상세 패널 표시 확인
- 궁전 배치하기 버튼 동작 확인
