# CSS Recipes — Card Content Patterns

각 카드 유형별 전체 코드 패턴. SKILL.md의 설계 원칙에 따라 작성한다.

## 목차
1. [Hero Card](#1-hero-card)
2. [Stats Card](#2-stats-card)
3. [Code Block Card](#3-code-block-card)
4. [Color Palette Card](#4-color-palette-card)
5. [Toggle/Settings Card](#5-togglesettings-card)
6. [Ring Progress Card](#6-ring-progress-card)
7. [Checklist Card](#7-checklist-card)
8. [Typography Card](#8-typography-card)
9. [Mini Chart Card](#9-mini-chart-card)
10. [Tag/Pill Card](#10-tagpill-card)
11. [Trend Tag Badge](#11-trend-tag-badge)
12. [전체 페이지 뼈대 (HTML Template)](#12-전체-페이지-뼈대)

---

## 1. Hero Card

큰 카드 (span-2 row-2). 그리드 라인 배경 + 그래디언트 패턴.

```html
<div class="glass-card span-2 row-2 hero-card">
  <div class="shine"></div>
  <div class="bg-pattern"></div>
  <div class="grid-lines"></div>
  <span class="trend-tag hot">Hot</span>
  <div style="position:relative;z-index:1">
    <div class="card-label">CATEGORY LABEL</div>
    <div class="card-title">메인 타이틀을<br>여기에 배치</div>
    <p class="card-desc">설명 텍스트. 2~3줄 이내로 작성한다.</p>
  </div>
</div>
```

```css
.hero-card {
  min-height: 320px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.hero-card .bg-pattern {
  position: absolute; inset: 0; opacity: 0.08;
  background:
    radial-gradient(circle at 20% 30%, var(--accent-violet) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, var(--accent-cyan) 0%, transparent 50%);
}
.hero-card .grid-lines {
  position: absolute; inset: 0; opacity: 0.06;
  background-image:
    linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px);
  background-size: 60px 60px;
}
```

---

## 2. Stats Card

큰 숫자 + 변화율 뱃지 + 미니 바 차트.

```html
<div class="glass-card">
  <div class="shine"></div>
  <div class="card-label">Metric Name</div>
  <div class="stat-value">94<span class="unit">%</span></div>
  <div class="stat-change up">
    <svg width="12" height="12" viewBox="0 0 12 12">
      <path d="M6 2L10 7H2Z" fill="currentColor"/>
    </svg>
    +12.4%
  </div>
  <div class="mini-chart" id="chart1"></div>
</div>
```

```css
.stat-value {
  font-family: var(--font-display);
  font-size: 2.8rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1;
}
.stat-value .unit {
  font-size: 1.2rem;
  font-weight: 500;
  opacity: 0.5;
  margin-left: 2px;
}
.stat-change {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 100px;
  font-size: 0.72rem;
  font-weight: 600;
  margin-top: 10px;
}
.stat-change.up {
  background: rgba(16, 185, 129, 0.15);
  color: var(--accent-emerald);
}
.stat-change.down {
  background: rgba(244, 63, 94, 0.15);
  color: var(--accent-rose);
}
```

### 미니 바 차트 (JS)
```javascript
const chart = document.getElementById('chart1');
const heights = [35, 55, 40, 70, 50, 85, 60, 90, 75, 95, 65, 80];
heights.forEach((h, i) => {
  const bar = document.createElement('div');
  bar.className = 'bar';
  bar.style.height = '0%';
  chart.appendChild(bar);
  setTimeout(() => { bar.style.height = h + '%'; }, 300 + i * 60);
});
```

```css
.mini-chart {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 64px;
  margin-top: 16px;
}
.mini-chart .bar {
  flex: 1;
  border-radius: 4px 4px 0 0;
  background: linear-gradient(to top, var(--accent-violet), var(--accent-cyan));
  opacity: 0.6;
  transition: opacity 0.3s, height 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.glass-card:hover .mini-chart .bar { opacity: 1; }
```

---

## 3. Code Block Card

구문 강조된 코드 프리뷰. span-2 권장.

```html
<div class="glass-card span-2">
  <div class="shine"></div>
  <div class="card-label">Code</div>
  <div class="card-title" style="font-size:1.15rem">제목</div>
  <div class="code-block">
    <span class="comment">/* 주석 */</span>
    .<span class="func">className</span> {
      <span class="keyword">property</span>: <span class="func">func</span>(<span class="number">value</span>);
    }
  </div>
</div>
```

```css
.code-block {
  background: rgba(0, 0, 0, 0.3);
  border-radius: var(--radius-sm);
  padding: 20px;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  line-height: 1.7;
  overflow-x: auto;
  margin-top: 16px;
  border: 1px solid rgba(255, 255, 255, 0.04);
}
.code-block .keyword { color: var(--accent-violet); }
.code-block .string  { color: var(--accent-emerald); }
.code-block .comment { color: var(--text-tertiary); font-style: italic; }
.code-block .func    { color: var(--accent-cyan); }
.code-block .number  { color: var(--accent-amber); }
```

---

## 4. Color Palette Card

인터랙티브 컬러 스와치. hover 시 이름 표시.

```html
<div class="glass-card">
  <div class="shine"></div>
  <div class="card-label">Colors</div>
  <div class="swatches">
    <div class="swatch" style="background:linear-gradient(135deg,#8b5cf6,#6d28d9)" data-name="Violet"></div>
    <div class="swatch" style="background:linear-gradient(135deg,#06b6d4,#0891b2)" data-name="Cyan"></div>
    <!-- 추가 색상 -->
  </div>
</div>
```

```css
.swatches { display: flex; gap: 8px; margin-top: 16px; flex-wrap: wrap; }
.swatch {
  width: 44px; height: 44px; border-radius: 12px;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s;
  cursor: pointer; position: relative;
}
.swatch:hover {
  transform: scale(1.15) translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}
.swatch::after {
  content: attr(data-name);
  position: absolute; bottom: -18px; left: 50%; transform: translateX(-50%);
  font-size: 0.6rem; color: var(--text-tertiary); white-space: nowrap;
  opacity: 0; transition: opacity 0.2s;
}
.swatch:hover::after { opacity: 1; }
```

---

## 5. Toggle/Settings Card

바운스 있는 토글 스위치.

```html
<div class="glass-card">
  <div class="shine"></div>
  <div class="card-label">Settings</div>
  <div class="toggle-row">
    <span class="toggle-label">옵션 이름</span>
    <div class="toggle active" onclick="this.classList.toggle('active')">
      <div class="knob"></div>
    </div>
  </div>
</div>
```

```css
.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
}
.toggle-row + .toggle-row {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--glass-border);
}
.toggle-label { font-size: 0.85rem; color: var(--text-secondary); }
.toggle {
  width: 48px; height: 26px; border-radius: 13px;
  background: rgba(255, 255, 255, 0.1);
  cursor: pointer; position: relative;
  transition: background 0.3s;
}
.toggle.active { background: var(--accent-violet); }
.toggle .knob {
  position: absolute; top: 3px; left: 3px;
  width: 20px; height: 20px; border-radius: 50%;
  background: #fff;
  transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
.toggle.active .knob { transform: translateX(22px); }
```

---

## 6. Ring Progress Card

SVG 기반 원형 프로그레스. 로드 시 애니메이션.

```html
<div class="glass-card">
  <div class="shine"></div>
  <div class="card-label">Score</div>
  <div class="ring-container">
    <div class="ring-wrap">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle class="ring-bg" cx="40" cy="40" r="34"/>
        <circle class="ring-fill" cx="40" cy="40" r="34"
          stroke="url(#ringGrad)"
          stroke-dasharray="213.6"
          stroke-dashoffset="213.6"
          style="animation:ringAnim 1.5s ease-out 0.6s forwards"/>
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="var(--accent-violet)"/>
            <stop offset="100%" stop-color="var(--accent-cyan)"/>
          </linearGradient>
        </defs>
      </svg>
      <div class="ring-label">90</div>
    </div>
    <div>
      <div style="font-size:0.85rem;font-weight:600">Label</div>
      <div style="font-size:0.75rem;color:var(--text-secondary)">Description</div>
    </div>
  </div>
</div>
```

### 퍼센트 → stroke-dashoffset 계산
```
circumference = 2 × π × r = 2 × 3.14159 × 34 ≈ 213.6
dashoffset = circumference × (1 - percent / 100)
예: 90% → 213.6 × 0.1 = 21.36
```

```css
.ring-container { display: flex; align-items: center; gap: 24px; margin-top: 20px; }
.ring-wrap { position: relative; width: 80px; height: 80px; }
.ring-wrap svg { transform: rotate(-90deg); }
.ring-wrap .ring-bg { fill: none; stroke: rgba(255,255,255,0.06); stroke-width: 6; }
.ring-wrap .ring-fill {
  fill: none; stroke-width: 6; stroke-linecap: round;
}
.ring-label {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display); font-size: 1.1rem; font-weight: 700;
}
@keyframes ringAnim { to { stroke-dashoffset: 21.36; } }
```

---

## 7. Checklist Card

완료 아이콘 + 2열 그리드. span-2 권장.

```html
<div class="glass-card span-2">
  <div class="shine"></div>
  <div class="card-label">Checklist</div>
  <div class="card-title" style="font-size:1.15rem">체크리스트 제목</div>
  <div style="margin-top:16px;display:grid;grid-template-columns:1fr 1fr;gap:10px">
    <div style="display:flex;align-items:center;gap:10px">
      <div style="width:22px;height:22px;border-radius:6px;background:rgba(16,185,129,0.2);
        display:flex;align-items:center;justify-content:center">
        <svg width="12" height="12" viewBox="0 0 12 12">
          <path d="M2.5 6L5 8.5L9.5 3.5" stroke="var(--accent-emerald)"
            stroke-width="1.5" fill="none" stroke-linecap="round"/>
        </svg>
      </div>
      <span style="font-size:0.82rem;color:var(--text-secondary)">항목 이름</span>
    </div>
    <!-- 항목 반복 -->
  </div>
</div>
```

---

## 8. Typography Card

폰트 스택 시각화. span-2 권장.

```html
<div class="glass-card span-2">
  <div class="shine"></div>
  <div class="card-label">Typography</div>
  <div style="margin-top:16px;display:flex;flex-direction:column;gap:14px">
    <div style="display:flex;align-items:baseline;justify-content:space-between;
      padding-bottom:14px;border-bottom:1px solid var(--glass-border)">
      <span style="font-family:var(--font-display);font-size:1.8rem;font-weight:800;
        letter-spacing:-0.03em">Display</span>
      <span style="font-size:0.72rem;color:var(--text-tertiary);
        font-family:var(--font-mono)">Outfit 800</span>
    </div>
    <!-- 추가 폰트 행 반복 -->
  </div>
</div>
```

---

## 9. Mini Chart Card

라인 차트 또는 에어리어 차트. Canvas 또는 SVG 사용.

### SVG 라인 차트
```html
<div class="glass-card">
  <div class="shine"></div>
  <div class="card-label">Trend</div>
  <svg viewBox="0 0 200 60" style="margin-top:16px;width:100%">
    <defs>
      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--accent-cyan)" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="var(--accent-cyan)" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <path d="M0,50 L20,42 L40,45 L60,30 L80,35 L100,20 L120,25 L140,15 L160,18 L180,8 L200,10 L200,60 L0,60Z"
      fill="url(#areaGrad)"/>
    <polyline points="0,50 20,42 40,45 60,30 80,35 100,20 120,25 140,15 160,18 180,8 200,10"
      fill="none" stroke="var(--accent-cyan)" stroke-width="2" stroke-linecap="round"/>
  </svg>
</div>
```

---

## 10. Tag/Pill Card

기술 스택이나 카테고리를 표시하는 인터랙티브 필.

```html
<div class="tech-pills">
  <span class="pill">Flutter</span>
  <span class="pill">React</span>
  <span class="pill">TypeScript</span>
</div>
```

```css
.tech-pills { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
.pill {
  padding: 6px 14px;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  color: var(--text-secondary);
  transition: all 0.3s ease;
  cursor: default;
}
.pill:hover {
  background: rgba(139, 92, 246, 0.15);
  border-color: rgba(139, 92, 246, 0.3);
  color: var(--accent-violet);
  transform: translateY(-2px);
}
```

---

## 11. Trend Tag Badge

카드 우상단에 붙는 상태 뱃지.

```html
<span class="trend-tag hot">Hot</span>
<span class="trend-tag new">New</span>
<span class="trend-tag trending">Trending</span>
```

```css
.trend-tag {
  position: absolute; top: 16px; right: 16px;
  padding: 4px 10px; border-radius: 100px;
  font-size: 0.65rem; font-weight: 600;
  letter-spacing: 0.06em; text-transform: uppercase;
}
.trend-tag.hot      { background: rgba(244,63,94,0.15);  color: var(--accent-rose); }
.trend-tag.new      { background: rgba(6,182,212,0.15);  color: var(--accent-cyan); }
.trend-tag.trending { background: rgba(245,158,11,0.15); color: var(--accent-amber); }
```

---

## 12. 전체 페이지 뼈대

새 프로젝트 시작 시 이 템플릿으로 시작한다.

```html
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>제목</title>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Noto+Sans+KR:wght@300;400;500;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  /* === Reset === */
  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

  /* === Design Tokens === */
  :root {
    --bg-dark: #0a0a0f;
    --glass-bg: rgba(255,255,255,0.06);
    --glass-border: rgba(255,255,255,0.08);
    --glass-highlight: rgba(255,255,255,0.12);
    --text-primary: #f0f0f5;
    --text-secondary: rgba(240,240,245,0.55);
    --text-tertiary: rgba(240,240,245,0.35);
    --accent-violet: #8b5cf6;
    --accent-cyan: #06b6d4;
    --accent-emerald: #10b981;
    --accent-amber: #f59e0b;
    --accent-rose: #f43f5e;
    --radius-sm: 12px;
    --radius-md: 20px;
    --radius-lg: 28px;
    --font-display: 'Outfit', sans-serif;
    --font-body: 'Noto Sans KR', 'Outfit', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
  }

  /* === Base === */
  body {
    background: var(--bg-dark);
    color: var(--text-primary);
    font-family: var(--font-body);
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* === Mesh Background === */
  .mesh-bg { position:fixed; inset:0; z-index:0; overflow:hidden; }
  .orb { position:absolute; border-radius:50%; filter:blur(120px); opacity:0.35;
    animation:float 20s ease-in-out infinite; }
  @keyframes float {
    0%,100% { transform:translate(0,0) scale(1); }
    25% { transform:translate(60px,-40px) scale(1.1); }
    50% { transform:translate(-30px,60px) scale(0.95); }
    75% { transform:translate(-60px,-20px) scale(1.05); }
  }

  /* === Noise === */
  .noise-overlay { position:fixed; inset:0; z-index:1;
    background-image:url("data:image/svg+xml,..."); /* inline SVG noise */
    pointer-events:none; }

  /* === Layout === */
  .container { position:relative; z-index:2; max-width:1200px; margin:0 auto; padding:48px 24px 80px; }

  /* === Bento Grid === */
  .bento-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
  .span-2 { grid-column:span 2; }
  .span-3 { grid-column:span 3; }
  .row-2  { grid-row:span 2; }

  /* === Glass Card === */
  .glass-card {
    position:relative; overflow:hidden;
    background:var(--glass-bg);
    border:1px solid var(--glass-border);
    border-radius:var(--radius-md);
    backdrop-filter:blur(24px) saturate(1.5);
    -webkit-backdrop-filter:blur(24px) saturate(1.5);
    padding:28px;
    opacity:0;
    animation:fadeUp 0.6s ease-out forwards;
    transition:transform 0.4s cubic-bezier(0.23,1,0.32,1),
               border-color 0.3s ease,
               box-shadow 0.4s ease;
  }
  .glass-card:hover {
    transform:translateY(-4px);
    border-color:var(--glass-highlight);
    box-shadow:0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05) inset;
  }
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(30px); }
    to   { opacity:1; transform:translateY(0); }
  }

  /* === Card Content === */
  .card-label { font-size:0.7rem; font-weight:600; letter-spacing:0.08em;
    text-transform:uppercase; color:var(--text-tertiary); margin-bottom:12px; }
  .card-title { font-family:var(--font-display); font-size:1.5rem; font-weight:700;
    letter-spacing:-0.02em; line-height:1.2; margin-bottom:8px; }
  .card-desc { color:var(--text-secondary); font-size:0.88rem; line-height:1.6; }

  /* === Shine Effect === */
  .shine { position:absolute; top:0; left:-100%; width:60%; height:100%;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent);
    transition:left 0.6s ease; pointer-events:none; }
  .glass-card:hover .shine { left:120%; }

  /* === Responsive === */
  @media(max-width:900px) {
    .bento-grid { grid-template-columns:repeat(2,1fr); }
    .span-2,.span-3 { grid-column:span 2; }
  }
  @media(max-width:540px) {
    .bento-grid { grid-template-columns:1fr; }
    .span-2,.span-3 { grid-column:span 1; }
  }
</style>
</head>
<body>

  <div class="mesh-bg">
    <div class="orb" style="width:600px;height:600px;background:#8b5cf6;top:-10%;left:-5%"></div>
    <div class="orb" style="width:500px;height:500px;background:#06b6d4;top:40%;right:-10%;animation-delay:-5s"></div>
    <div class="orb" style="width:450px;height:450px;background:#f43f5e;bottom:-5%;left:30%;animation-delay:-10s"></div>
  </div>
  <div class="noise-overlay"></div>

  <div class="container">
    <!-- header -->
    <div class="bento-grid">
      <!-- 카드를 여기에 배치 -->
    </div>
  </div>

<script>
  // Staggered delay 자동 적용
  document.querySelectorAll('.glass-card').forEach((card, i) => {
    card.style.animationDelay = (0.1 + i * 0.05) + 's';
  });
</script>
</body>
</html>
```
