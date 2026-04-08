# Implementation Plan: 최신 UI/UX 디자인 업그레이드

## 조사 기반
- Awwwards SOTY 2025 (Lando Norris) — 시네마틱 스크롤, 키네틱 타이포
- CSSDA WOTY 2025 (Dropbox Brand) — 감정적 모션, 발견 기반 UX
- Charles Leclerc — 스크롤 스토리텔링, 마이크로인터랙션

## 현재 스택으로 구현 가능 여부: ✅ 전부 가능
- Next.js 15 + Framer Motion 12 + Tailwind CSS 4
- WebGL 불필요 — CSS + Framer Motion만으로 충분

---

## 업그레이드 계획

### 1. 랜딩 페이지 (src/app/page.tsx) — 가장 큰 임팩트

#### 1-1. 키네틱 타이포그래피 히어로
- 스크롤에 연동된 텍스트 스케일링/페이드
- Framer Motion `useScroll()` + `useTransform()` 활용
- 제목이 뷰포트에 맞춰 확대/축소되는 효과

#### 1-2. 스크롤 기반 콘텐츠 리빌
- 각 섹션이 스크롤에 따라 시네마틱하게 등장
- `whileInView` + opacity/y 트랜지션
- 이전 정적 나열 → 순차적 스토리텔링

#### 1-3. 히어로 CTA 강화
- Glow 효과 + 펄스 애니메이션 버튼
- Hover 시 그라디언트 보더 애니메이션

### 2. 글로벌 디자인 시스템 진화

#### 2-1. 그라디언트 보더 글래스 카드
- 기존 `border: rgba(255,255,255,0.08)` → 그라디언트 보더
- CSS `conic-gradient` + `border-image` 조합
- Hover 시 보더 회전 애니메이션

#### 2-2. Mesh Gradient 풍부화
- 2개 블롭 → 3개 블롭 (cyan 추가)
- 스크롤에 따라 블롭 위치/크기 미세 변화

#### 2-3. 글로벌 CSS 효과 추가
- 버튼 hover glow 효과
- 텍스트 그라디언트 shimmer 애니메이션
- 카드 hover 시 글래스 광택(sheen) 효과

### 3. 대시보드 (src/app/dashboard/page.tsx) 강화

#### 3-1. 비대칭 Bento Grid
- 주요 기능 카드 크기 차별화 (AI 튜터 = 2x, 나머지 = 1x)
- `col-span-2`, `row-span-2` 활용

#### 3-2. 카드 호버 인터랙션 강화
- Hover 시 내부 아이콘 부유 애니메이션
- 카드 배경 그라디언트 시프트
- 미묘한 3D 틸트 효과 (CSS perspective + Framer Motion)

### 4. 마이크로인터랙션 전면 강화

#### 4-1. 버튼 컴포넌트
- Press 시 scale-down (0.97) + release bounce
- Hover 시 glow shadow 확산
- 로딩 상태 스피너 → shimmer 프로그레스

#### 4-2. 카드 컴포넌트
- Hover 시 subtle magnetic tilt (마우스 위치 기반)
- 카드 진입 시 stagger 더 정교화 (spring physics)

---

## 검증 기준
1. 랜딩 페이지: 스크롤 시 키네틱 타이포 + 콘텐츠 리빌 동작
2. 대시보드: 비대칭 벤토 그리드 + 카드 호버 효과
3. 글로벌: 그라디언트 보더 + glow 버튼 + mesh gradient 3블롭
4. `npm run build` 성공
5. 모바일 반응형 유지
