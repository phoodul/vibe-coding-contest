---
name: modern-glass-bento
description: 벤토(Bento) 그리드 + 글래스모피즘 기반의 최신 프론트엔드 디자인 스킬. 다크 테마 위에 Mesh Gradient 배경, 반투명 글래스 카드, 비대칭 그리드 레이아웃, Staggered 애니메이션, 마이크로 인터랙션, Noise 텍스처를 조합하여 프로덕션급 UI를 생성한다. 랜딩 페이지, 대시보드, 포트폴리오, 쇼케이스 페이지, SaaS UI, 바이브코딩 프로젝트 등 시각적 임팩트가 중요한 모든 프론트엔드 작업에서 반드시 이 스킬을 사용한다. 사용자가 "모던 디자인", "글래스", "벤토", "트렌디한 UI", "임팩트 있는 프론트엔드", "다크 테마", "바이브코딩" 등을 언급하면 이 스킬을 트리거한다.
---

# Modern Glass Bento — Frontend Design System

2024-2025 프론트엔드 트렌드의 핵심인 벤토 그리드 × 글래스모피즘을 중심으로, 시각적 임팩트가 극대화된 프로덕션급 UI를 생성한다.

## 디자인 철학

**"Layer, Depth, Rhythm"** — 3가지 원칙이 모든 의사결정을 지배한다.

1. **Layer (레이어)**: Mesh 배경 → Noise 텍스처 → 글래스 카드 → 콘텐츠 순서로 시각적 깊이를 쌓는다
2. **Depth (깊이감)**: `backdrop-filter: blur()` + 반투명 배경 + 미묘한 보더로 카드가 공간 위에 떠 있는 느낌을 연출한다
3. **Rhythm (리듬)**: 벤토 그리드의 비대칭 span으로 시각적 무게 중심을 만들고, staggered 애니메이션으로 시간적 리듬을 더한다

## 핵심 6대 요소

| 요소 | 역할 | 필수 여부 |
|------|------|-----------|
| Bento Grid | 비대칭 레이아웃으로 정보 위계 표현 | 필수 |
| Glassmorphism | 반투명 카드로 깊이감 연출 | 필수 |
| Mesh Gradient BG | 글래스 효과를 살리는 유기적 배경 | 필수 |
| Staggered Animation | 순차적 등장으로 첫인상 극대화 | 필수 |
| Micro Interaction | hover/click 피드백으로 세련미 추가 | 권장 |
| Noise Texture | 미세한 입자감으로 고급스러움 | 권장 |

## 작업 워크플로우

### Step 1: 컨텍스트 파악
사용자의 요청에서 다음을 파악한다:
- **용도**: 랜딩 페이지 / 대시보드 / 포트폴리오 / SaaS UI / 쇼케이스
- **콘텐츠 유형**: 통계 카드, 차트, 기능 소개, 프로필 등
- **출력 형식**: 순수 HTML / React(.jsx) / 기타

### Step 2: 레퍼런스 로드
반드시 `references/css-recipes.md`를 읽고 코드 패턴을 확인한다:
```
view /mnt/skills/user/modern-glass-bento/references/css-recipes.md
```

### Step 3: 구조 설계 → 코드 작성 → 출력

## 벤토 그리드 레이아웃 규칙

### 기본 그리드 구조
```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
```

### span 배치 전략 — "대비의 법칙"
- **히어로 카드 1개**: `span-2 + row-2` (큰 카드가 시선의 닻 역할)
- **중형 카드 2~3개**: `span-2` (보조 정보, 코드 블록, 체크리스트 등)
- **소형 카드 3~5개**: `span-1` (통계, 토글, 컬러 스와치 등)
- 절대 모든 카드를 같은 크기로 만들지 않는다. 크기 대비가 벤토의 핵심이다.

### 반응형 브레이크포인트
```css
@media (max-width: 900px) {
  .bento-grid { grid-template-columns: repeat(2, 1fr); }
  .span-2, .span-3 { grid-column: span 2; }
}
@media (max-width: 540px) {
  .bento-grid { grid-template-columns: 1fr; }
  .span-2, .span-3 { grid-column: span 1; }
}
```

## 글래스모피즘 카드 레시피

### 필수 3요소 (하나라도 빠지면 글래스가 아니다)
1. **반투명 배경**: `background: rgba(255, 255, 255, 0.04~0.08)`
2. **블러 필터**: `backdrop-filter: blur(20~30px) saturate(1.3~1.8)`
3. **미묘한 보더**: `border: 1px solid rgba(255, 255, 255, 0.06~0.12)`

### 카드 CSS
```css
.glass-card {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(24px) saturate(1.5);
  -webkit-backdrop-filter: blur(24px) saturate(1.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 28px;
  overflow: hidden;
  position: relative;
}
```

### CRITICAL: 글래스는 배경이 없으면 죽는다
글래스모피즘은 뒤에 blur할 대상이 있어야 효과가 보인다. 반드시 Mesh Gradient 배경을 깔아야 한다. 단색 배경 위의 글래스는 그냥 반투명 카드일 뿐이다.

## Mesh Gradient 배경

### 구현 방식: 블러된 Orb 애니메이션
```html
<div class="mesh-bg">
  <div class="orb"></div>
  <div class="orb"></div>
  <div class="orb"></div>
  <div class="orb"></div>
</div>
```

### Orb 배치 규칙
- **3~5개의 orb**을 사용한다 (2개 이하면 밋밋, 6개 이상이면 혼란)
- 각 orb: `width/height: 350~600px`, `border-radius: 50%`, `filter: blur(100~140px)`
- **색상**: 메인 팔레트에서 3~4색을 선택. 보라-시안-로즈-에메랄드 조합이 가장 범용적
- **opacity**: 0.25~0.40 (너무 강하면 카드 가독성 저하)
- **animation**: `float` 20~30초 주기, ease-in-out, 각 orb에 다른 delay
- **position**: 화면 모서리와 중앙에 분산 배치. 겹침 영역에서 색 혼합 효과 발생

### Orb CSS 패턴
```css
.mesh-bg { position: fixed; inset: 0; z-index: 0; overflow: hidden; }
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.35;
  animation: float 20s ease-in-out infinite;
}
@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25%  { transform: translate(60px, -40px) scale(1.1); }
  50%  { transform: translate(-30px, 60px) scale(0.95); }
  75%  { transform: translate(-60px, -20px) scale(1.05); }
}
```

## 애니메이션 시스템

### Staggered Entrance (페이지 로드 시)
```css
.glass-card {
  opacity: 0;
  animation: fadeUp 0.6s ease-out forwards;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}
/* 카드마다 0.05s 간격 */
.glass-card:nth-child(1) { animation-delay: 0.1s; }
.glass-card:nth-child(2) { animation-delay: 0.15s; }
/* ... 최대 0.6s까지 */
```

### Hover 효과 레시피
```css
.glass-card {
  transition:
    transform 0.4s cubic-bezier(0.23, 1, 0.32, 1),
    border-color 0.3s ease,
    box-shadow 0.4s ease;
}
.glass-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset;
}
```

### Shine 슬라이드 효과 (hover 시 빛 줄기)
```css
.glass-card .shine {
  position: absolute; top: 0; left: -100%;
  width: 60%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent);
  transition: left 0.6s ease;
  pointer-events: none;
}
.glass-card:hover .shine { left: 120%; }
```

## 컬러 시스템

### 다크 테마 기본 토큰
```css
:root {
  --bg-dark:        #0a0a0f;
  --glass-bg:       rgba(255, 255, 255, 0.06);
  --glass-border:   rgba(255, 255, 255, 0.08);
  --glass-highlight:rgba(255, 255, 255, 0.12);
  --text-primary:   #f0f0f5;
  --text-secondary: rgba(240, 240, 245, 0.55);
  --text-tertiary:  rgba(240, 240, 245, 0.35);
}
```

### 액센트 컬러 팔레트
| 이름 | HEX | 용도 |
|------|-----|------|
| Violet | `#8b5cf6` | 메인 액센트, CTA, 활성 상태 |
| Cyan | `#06b6d4` | 보조 액센트, 링크, 코드 하이라이트 |
| Emerald | `#10b981` | 성공, 상승, 완료 |
| Amber | `#f59e0b` | 경고, 숫자, 하이라이트 |
| Rose | `#f43f5e` | 강조, 트렌드, 감소 |

### 라이트 테마 변형
라이트 테마 요청 시 다음을 조정:
- `--bg-dark` → `#f8f9fc`
- `--glass-bg` → `rgba(255, 255, 255, 0.7)`
- `--glass-border` → `rgba(0, 0, 0, 0.06)`
- `--text-primary` → `#1a1a2e`
- orb opacity를 0.15~0.25로 낮춤
- orb 색상을 파스텔 톤으로 변경

## 타이포그래피

### 폰트 스택 규칙
- **Display/Heading**: 영문 `Outfit` 800/700 — 큰 제목에 임팩트
- **Body (한국어 포함)**: `Noto Sans KR` + `Outfit` 400/500
- **Mono/Code**: `JetBrains Mono` 400

### Google Fonts 로드
```html
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Noto+Sans+KR:wght@300;400;500;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### 폰트 크기 체계
| 용도 | 크기 | Weight | Letter-spacing |
|------|------|--------|----------------|
| Hero Title | `clamp(2.2rem, 5vw, 3.8rem)` | 800 | -0.03em |
| Card Title (large) | 1.5rem | 700 | -0.02em |
| Card Title (small) | 1.15rem | 700 | -0.02em |
| Body | 0.88rem | 400 | normal |
| Label | 0.7rem | 600 | 0.08em, uppercase |
| Code | 0.78rem | 400 | normal |

## Noise 텍스처 오버레이

```html
<div class="noise-overlay"></div>
```
```css
.noise-overlay {
  position: fixed; inset: 0; z-index: 1;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
  pointer-events: none;
}
```
- opacity는 0.02~0.05 범위. 너무 강하면 지저분해 보인다.

## 커서 Glow 효과 (선택적)

데스크톱에서 마우스를 따라다니는 은은한 빛. 터치 기기에서는 자동 비활성화.
```js
const glow = document.getElementById('glow');
let mx=0, my=0, gx=0, gy=0;
document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; });
(function animate() {
  gx += (mx - gx) * 0.08;
  gy += (my - gy) * 0.08;
  glow.style.left = gx + 'px';
  glow.style.top = gy + 'px';
  requestAnimationFrame(animate);
})();
```
```css
.cursor-glow {
  position: fixed; width: 300px; height: 300px; border-radius: 50%;
  background: radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%);
  pointer-events: none; z-index: 1;
  transform: translate(-50%, -50%);
}
```

## 카드 콘텐츠 패턴

상세 코드는 `references/css-recipes.md`를 참조한다.

### 사용 가능한 카드 유형
1. **Hero Card**: span-2 row-2, 배경 패턴 + 그리드 라인, 핵심 메시지
2. **Stats Card**: 큰 숫자 + 변화율 뱃지 + 미니 바 차트
3. **Code Block Card**: 구문 강조된 코드 프리뷰
4. **Color Palette Card**: 인터랙티브 스와치
5. **Toggle/Settings Card**: 마이크로 인터랙션 시연
6. **Ring Progress Card**: SVG 원형 프로그레스
7. **Checklist Card**: 체크 아이콘 + 항목 그리드
8. **Typography Card**: 폰트 스택 시각화
9. **Chart Card**: 미니 바/라인 차트
10. **Tag/Pill Card**: 기술 스택 또는 카테고리 태그

## Z-Index 레이어 순서

| Layer | z-index | 역할 |
|-------|---------|------|
| Mesh BG | 0 | 배경 Orb들 |
| Noise Overlay | 1 | 텍스처 |
| Cursor Glow | 1 | 마우스 따라다니는 빛 |
| Container | 2 | 메인 콘텐츠 |
| Card Trend Tag | auto (within card) | 뱃지 |
| Modal/Overlay | 100 | 팝업 (필요 시) |

## 안티 패턴 (절대 하지 않는 것)

- 모든 카드를 같은 크기(1×1)로 만들지 않는다 — 벤토가 아니라 그냥 그리드
- 단색 배경 위에 글래스 카드를 올리지 않는다 — blur할 대상이 없으면 효과 없음
- orb에 opacity 0.5 이상을 주지 않는다 — 카드 위 텍스트 가독성 저하
- 모든 카드에 동일한 animation-delay를 주지 않는다 — 동시 등장은 stagger가 아님
- Inter, Roboto, Arial 등 범용 폰트를 쓰지 않는다 — 트렌디함과 거리가 멀다
- 보라색 그래디언트만으로 "모던"을 표현하지 않는다 — 가장 흔한 AI 슬롭 미학
- `box-shadow`만으로 글래스를 흉내내지 않는다 — `backdrop-filter`가 진짜 글래스

## 출력 형식별 가이드

### 순수 HTML (기본)
- 단일 `.html` 파일에 style + script 인라인
- 외부 의존성: Google Fonts CDN만 사용
- `/mnt/user-data/outputs/`에 저장

### React (.jsx) Artifact
- Tailwind 유틸리티 클래스 사용 가능 (단, blur/backdrop은 인라인 style)
- `useState`로 토글 등 인터랙션 관리
- 외부 라이브러리: lucide-react 아이콘 사용 가능
- CDN 폰트는 `<style>` 블록 내 `@import`로 로드

### 성능 참고
- `backdrop-filter`는 GPU 가속 프로퍼티 — 대부분의 모던 브라우저에서 부드럽게 동작
- 카드가 15개 이상이면 IntersectionObserver로 뷰포트 내 카드만 애니메이션
- orb animation은 `will-change: transform`으로 레이어 분리 고려

## 체크리스트 (출력 전 확인)

- [ ] Mesh Gradient 배경이 있는가? (글래스 효과의 전제조건)
- [ ] 글래스 카드에 `backdrop-filter` + 반투명 bg + border 3요소가 있는가?
- [ ] 벤토 그리드에 최소 2가지 이상 다른 크기의 카드가 있는가?
- [ ] Staggered animation-delay가 카드마다 다른가?
- [ ] `-webkit-backdrop-filter`가 포함되었는가? (Safari 호환)
- [ ] 반응형 브레이크포인트가 있는가? (900px, 540px)
- [ ] 폰트가 Outfit / Noto Sans KR / JetBrains Mono인가?
- [ ] 모든 텍스트가 배경 위에서 읽히는가? (가독성 확인)
- [ ] hover 시 transform + border-color + box-shadow 변화가 있는가?
