# 기억의 궁전 시각적 재설계

## 핵심 문제
현재 구현은 기억의 궁전의 핵심인 "시각적 공간 배치"가 없음.
텍스트 설명만으로는 기억의 궁전이 아님.

## 기억의 궁전의 5가지 핵심 원리
1. **익숙한 공간의 시각적 이미지** — 실제로 "보이는" 장소
2. **공간의 특정 위치에 개념 배치** — 기둥, 문, 창문, 책상 등에 시각적 마커
3. **동선을 따라 걷기** — 구역→구역으로 순서대로 이동하는 경험
4. **기이하고 생생한 연상** — 평범하지 않은 이미지로 기억 고정
5. **회상 = 궁전을 걸으며 떠올리기** — 장소를 보고 배치된 개념을 회상

## 재설계 컴포넌트

### 1. PalaceScene — 구역 시각화 컴포넌트
- 각 구역(zone)을 SVG 일러스트/그라디언트 씬으로 시각화
- 구역 내 "핫스팟" (position x,y)에 개념 마커(📍)를 배치
- 마커 클릭 → 해당 개념의 상세 내용 + 기억 스토리 표시
- 마커에 개념 아이콘/이모지 표시

구현 방식: CSS 그라디언트 배경 + 절대 위치 마커
```
<div className="relative w-full h-80 rounded-xl" style={{ background: zone.gradient }}>
  <span className="text-6xl absolute top-4 right-4">{zone.emoji}</span>
  <h3>{zone.name}</h3>
  {placements.map(p => (
    <button 
      className="absolute" 
      style={{ left: `${p.position.x}%`, top: `${p.position.y}%` }}
    >
      📍 {p.conceptLabel}
    </button>
  ))}
</div>
```

### 2. PalaceWalkthrough — 동선 체험 컴포넌트
- 구역을 하나씩 순서대로 보여주는 스텝 네비게이션
- 각 스텝: 구역 씬 이미지 + 배치된 개념 마커들
- "이전 구역 ← / → 다음 구역" 네비게이션
- 진행률 표시 바
- 구역 전환 시 페이드 애니메이션

### 3. PalaceReview — 공간 기반 복습
- 구역 씬 이미지를 보여주고 마커 위치만 표시 (라벨 숨김)
- "이 위치에 무엇이 있었나요?" → 마커 클릭하면 정답 확인
- 전체 구역을 순회하며 복습

### 4. PalaceNarrator — 가이드 투어
- 구역 씬 이미지 + 현재 설명 중인 마커 하이라이트
- TTS 음성과 동기화
- 마커가 차례로 빛나면서 개념을 설명

## 수정해야 할 페이지
- palace/[id]/page.tsx — 기존 텍스트 카드 뷰 → PalaceScene + PalaceWalkthrough
- palace/[id] 복습 모드 → PalaceReview
- palace/[id] 나레이터 모드 → PalaceNarrator

## 구역 위치 데이터 활용
locations.ts의 각 zone에 이미 position {x, y}가 있음.
AI가 생성하는 subPlacement에도 position 필드 추가 필요.
→ 각 개념이 구역 내 어느 좌표에 배치되는지 지정
