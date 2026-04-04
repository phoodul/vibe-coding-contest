# Framer Motion — Quick Reference
> Context7 기반 최신 문서 조회 결과. 공모전 개발 시 빠른 참조용.

> **Note:** `framer-motion`은 v11+ 부터 `motion`으로 패키지명이 변경됨. 둘 다 동일 API.
> ```bash
> npm install motion
> # 또는 레거시:
> npm install framer-motion
> ```

---

## Table of Contents

1. [Next.js 15 App Router 설정](#1-nextjs-15-app-router-설정)
2. [Core Animation Patterns](#2-core-animation-patterns)
3. [Variants & Orchestration](#3-variants--orchestration)
4. [AnimatePresence — 등장/퇴장 애니메이션](#4-animatepresence--등장퇴장-애니메이션)
5. [Scroll-Triggered Animations](#5-scroll-triggered-animations)
6. [Hover / Tap Micro-interactions](#6-hover--tap-micro-interactions)
7. [Layout Animations](#7-layout-animations)
8. [Common Recipes](#8-common-recipes)
9. [Performance Tips](#9-performance-tips)
10. [Transition Cheat Table](#10-transition-cheat-table)

---

## 1. Next.js 15 App Router 설정

Framer Motion은 React state와 DOM refs를 사용하므로 **반드시 Client Component**에서만 사용 가능.

### 기본 규칙

```tsx
// components/animated-card.tsx
"use client"; // <-- 필수! 없으면 Server Component로 취급되어 에러 발생

import { motion } from "motion/react";
// 또는: import { motion } from "framer-motion";

export function AnimatedCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}
```

### Import 경로 (motion v12+)

```tsx
// 권장 (motion 패키지)
import { motion, AnimatePresence } from "motion/react";

// 레거시 (framer-motion 패키지)
import { motion, AnimatePresence } from "framer-motion";
```

### Server Component에서 감싸기 패턴

```tsx
// app/page.tsx (Server Component — 데이터 fetching 가능)
import { AnimatedCard } from "@/components/animated-card";

export default async function Page() {
  const data = await fetchData();
  return (
    <AnimatedCard>
      <h1>{data.title}</h1>
    </AnimatedCard>
  );
}
```

---

## 2. Core Animation Patterns

### motion.div 기본

```tsx
"use client";
import { motion } from "motion/react";

// 가장 기본적인 형태
<motion.div
  initial={{ opacity: 0 }}       // 마운트 시 초기 상태
  animate={{ opacity: 1 }}       // 목표 상태
  exit={{ opacity: 0 }}          // 언마운트 시 (AnimatePresence 필요)
  transition={{ duration: 0.3 }} // 전환 설정
/>
```

### 지원되는 motion 요소

```tsx
<motion.div />
<motion.span />
<motion.button />
<motion.ul />
<motion.li />
<motion.svg />
<motion.path />
<motion.img />
<motion.section />
<motion.article />
<motion.header />
<motion.nav />
// ... 모든 HTML/SVG 요소 지원
```

### 여러 속성 동시 애니메이션

```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.8, y: 50 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  transition={{
    duration: 0.6,
    ease: "easeOut",
  }}
/>
```

### Keyframes (배열로 중간값 지정)

```tsx
<motion.div
  animate={{
    x: [0, 100, 50, 100, 0],     // 순서대로 이동
    rotate: [0, 90, 180, 270, 360],
  }}
  transition={{
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut",
  }}
/>
```

---

## 3. Variants & Orchestration

### Variants 기본

부모-자식 간 애니메이션을 선언적으로 조율.

```tsx
"use client";
import { motion } from "motion/react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,    // 자식 간 딜레이
      delayChildren: 0.2,      // 첫 자식 시작 전 딜레이
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export function StaggeredList({ items }: { items: string[] }) {
  return (
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {items.map((item) => (
        <motion.li key={item} variants={itemVariants}>
          {item}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

### Orchestration 속성

| 속성 | 설명 | 예시 값 |
|------|------|---------|
| `staggerChildren` | 자식 간 애니메이션 시작 간격 (초) | `0.08` |
| `delayChildren` | 첫 자식 시작 전 대기 시간 | `0.3` |
| `staggerDirection` | 순서 방향 (`1` = 정순, `-1` = 역순) | `1` |
| `when` | 부모 먼저 or 자식 먼저 | `"beforeChildren"`, `"afterChildren"` |

### when 사용 예시

```tsx
const parentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren", // 부모가 먼저 나타난 후 자식 애니메이션
      staggerChildren: 0.1,
    },
  },
};
```

---

## 4. AnimatePresence — 등장/퇴장 애니메이션

### 기본 사용법

```tsx
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export function ToggleBox() {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <>
      <button onClick={() => setIsVisible(!isVisible)}>Toggle</button>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            key="box"                         // key 필수!
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}  // 퇴장 애니메이션
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
```

### mode 속성

```tsx
// "sync" (기본값): 퇴장/등장 동시 실행
<AnimatePresence mode="sync">

// "wait": 퇴장 완료 후 등장 (페이지 전환에 적합)
<AnimatePresence mode="wait">

// "popLayout": 퇴장 요소를 즉시 레이아웃에서 제거
<AnimatePresence mode="popLayout">
```

### Next.js App Router 페이지 전환

```tsx
// components/page-transition.tsx
"use client";
import { motion, AnimatePresence } from "motion/react";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

```tsx
// app/layout.tsx
import { PageTransition } from "@/components/page-transition";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
```

---

## 5. Scroll-Triggered Animations

### whileInView — 뷰포트 진입 시 애니메이션

```tsx
<motion.div
  initial={{ opacity: 0, y: 60 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.3 }}
  transition={{ duration: 0.6, ease: "easeOut" }}
>
  스크롤하면 나타남
</motion.div>
```

| viewport 옵션 | 설명 |
|---------------|------|
| `once: true` | 한 번만 트리거 (성능 우수, 일반적으로 권장) |
| `once: false` | 뷰포트 진입할 때마다 반복 |
| `amount: 0.3` | 요소의 30%가 보이면 트리거 (0~1) |
| `margin` | 뷰포트 감지 영역 확장 (`"-100px"`) |

### useScroll — 스크롤 진행도 추적

```tsx
"use client";
import { motion, useScroll, useTransform } from "motion/react";

export function ParallaxHero() {
  const { scrollYProgress } = useScroll();

  // scrollYProgress (0→1)을 다른 값으로 매핑
  const y = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <motion.div style={{ y, opacity }}>
      <h1>Parallax Hero</h1>
    </motion.div>
  );
}
```

### 특정 요소 기준 스크롤

```tsx
"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
    // "start end" = 요소 시작점이 뷰포트 끝에 닿을 때 (0)
    // "end start" = 요소 끝점이 뷰포트 시작에 닿을 때 (1)
  });

  const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);

  return (
    <motion.div ref={ref} style={{ scale }}>
      Content
    </motion.div>
  );
}
```

### useScroll offset 참조

```
["start start"]   // 요소 상단 = 뷰포트 상단
["start end"]     // 요소 상단 = 뷰포트 하단
["end start"]     // 요소 하단 = 뷰포트 상단
["end end"]       // 요소 하단 = 뷰포트 하단
["start 0.5"]     // 요소 상단 = 뷰포트 50% 지점
```

---

## 6. Hover / Tap Micro-interactions

### whileHover & whileTap

```tsx
<motion.button
  whileHover={{ scale: 1.05, backgroundColor: "#4f46e5" }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
  className="px-6 py-3 rounded-lg bg-indigo-600 text-white"
>
  Click me
</motion.button>
```

### whileFocus & whileDrag

```tsx
// 포커스 시 애니메이션
<motion.input
  whileFocus={{ scale: 1.02, borderColor: "#6366f1" }}
  className="border rounded-lg px-4 py-2"
/>

// 드래그 가능 요소
<motion.div
  drag                          // 자유 드래그
  dragConstraints={{ left: -100, right: 100, top: -50, bottom: 50 }}
  whileDrag={{ scale: 1.1, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}
/>
```

### 복합 인터랙션 카드

```tsx
<motion.div
  className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20"
  whileHover={{
    scale: 1.02,
    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
    borderColor: "rgba(255,255,255,0.4)",
  }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: "spring", stiffness: 300, damping: 20 }}
>
  <h3>Glass Card</h3>
  <p>Hover and tap me</p>
</motion.div>
```

---

## 7. Layout Animations

### layout prop — 레이아웃 변경 자동 애니메이션

```tsx
// layout={true} → 위치/크기 변경 시 자동으로 부드럽게 전환
<motion.div layout className={isExpanded ? "w-full" : "w-1/2"}>
  Content
</motion.div>
```

### layoutId — 서로 다른 컴포넌트 간 공유 애니메이션

```tsx
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export function SharedLayoutDemo() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <>
      {/* 카드 리스트 */}
      <div className="grid grid-cols-3 gap-4">
        {items.map((item) => (
          <motion.div
            key={item.id}
            layoutId={`card-${item.id}`}    // 같은 layoutId끼리 연결
            onClick={() => setSelectedId(item.id)}
            className="p-4 bg-white rounded-xl cursor-pointer"
          >
            <motion.h3 layoutId={`title-${item.id}`}>
              {item.title}
            </motion.h3>
          </motion.div>
        ))}
      </div>

      {/* 확장된 카드 (오버레이) */}
      <AnimatePresence>
        {selectedId && (
          <motion.div
            layoutId={`card-${selectedId}`}
            className="fixed inset-0 m-auto w-[500px] h-[400px] bg-white rounded-2xl p-8 z-50"
            onClick={() => setSelectedId(null)}
          >
            <motion.h3 layoutId={`title-${selectedId}`}>
              {items.find((i) => i.id === selectedId)?.title}
            </motion.h3>
            <p>Expanded content here...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

### layout 타입 옵션

```tsx
<motion.div layout />               // 위치 + 크기 모두 애니메이션
<motion.div layout="position" />     // 위치만 애니메이션
<motion.div layout="size" />         // 크기만 애니메이션
<motion.div layout="preserve-aspect" /> // 종횡비 유지하며 애니메이션
```

---

## 8. Common Recipes

### Recipe 1: FadeUp 등장 애니메이션

```tsx
"use client";
import { motion } from "motion/react";

interface FadeUpProps {
  children: React.ReactNode;
  delay?: number;
}

export function FadeUp({ children, delay = 0 }: FadeUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.1, 0.25, 1], // cubic-bezier
      }}
    >
      {children}
    </motion.div>
  );
}

// 사용
<FadeUp>
  <h1>Hello World</h1>
</FadeUp>
<FadeUp delay={0.1}>
  <p>Subtitle</p>
</FadeUp>
```

### Recipe 2: Slide-in 사이드바

```tsx
"use client";
import { motion, AnimatePresence } from "motion/react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Sidebar({ isOpen, onClose, children }: SidebarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          {/* Sidebar */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-900 z-50 shadow-2xl"
          >
            {children}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
```

### Recipe 3: Card Hover Lift 효과

```tsx
"use client";
import { motion } from "motion/react";

export function LiftCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20"
      whileHover={{
        y: -8,
        scale: 1.02,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
    >
      {children}
    </motion.div>
  );
}
```

### Recipe 4: Staggered List 애니메이션

```tsx
"use client";
import { motion } from "motion/react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, x: -20 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export function StaggeredList({ items }: { items: { id: string; label: string }[] }) {
  return (
    <motion.ul
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-2"
    >
      {items.map((i) => (
        <motion.li
          key={i.id}
          variants={item}
          className="p-4 rounded-lg bg-white/5 border border-white/10"
        >
          {i.label}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

### Recipe 5: Page Route Transitions (App Router)

```tsx
// components/template-transition.tsx
"use client";
import { motion } from "motion/react";

export function TemplateTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
```

```tsx
// app/template.tsx  <-- template.tsx는 매 네비게이션마다 리마운트됨 (layout.tsx와 다름)
import { TemplateTransition } from "@/components/template-transition";

export default function Template({ children }: { children: React.ReactNode }) {
  return <TemplateTransition>{children}</TemplateTransition>;
}
```

> **중요:** `layout.tsx`는 네비게이션 간 유지되므로 `exit` 애니메이션이 동작하지 않음.
> `template.tsx`를 사용하면 매번 리마운트되어 `initial` 애니메이션은 동작하지만 `exit`은 여전히 불가.
> 완전한 exit 애니메이션이 필요하면 `AnimatePresence` + `usePathname` 조합 사용 (섹션 4 참조).

### Recipe 6: Number Counter 애니메이션

```tsx
"use client";
import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";

interface CounterProps {
  from?: number;
  to: number;
  duration?: number;
}

export function Counter({ from = 0, to, duration = 2 }: CounterProps) {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(count, to, {
      duration,
      ease: "easeOut",
    });
    return controls.stop;
  }, [count, to, duration]);

  // useTransform의 결과를 DOM에 반영
  useEffect(() => {
    const unsubscribe = rounded.on("change", (v) => {
      if (nodeRef.current) {
        nodeRef.current.textContent = v.toLocaleString();
      }
    });
    return unsubscribe;
  }, [rounded]);

  return (
    <motion.span
      ref={nodeRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    />
  );
}

// 사용
<Counter to={1234} duration={2} />
```

### Recipe 7: Reveal Text (글자 하나씩)

```tsx
"use client";
import { motion } from "motion/react";

const sentenceVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.03 },
  },
};

const letterVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

export function RevealText({ text }: { text: string }) {
  return (
    <motion.p
      variants={sentenceVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      aria-label={text}
    >
      {text.split("").map((char, i) => (
        <motion.span key={`${char}-${i}`} variants={letterVariants}>
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.p>
  );
}
```

### Recipe 8: Glassmorphism Modal with Backdrop

```tsx
"use client";
import { motion, AnimatePresence } from "motion/react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function GlassModal({ isOpen, onClose, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          {/* Modal Content */}
          <motion.div
            className="relative z-10 w-full max-w-lg mx-4 p-8 rounded-3xl
                       bg-white/10 backdrop-blur-xl border border-white/20
                       shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

## 9. Performance Tips

### willChange 힌트

```tsx
// GPU 가속 대상 속성을 브라우저에 미리 알림
<motion.div
  style={{ willChange: "transform, opacity" }}
  animate={{ x: 100 }}
/>
```

> **주의:** `willChange`를 모든 요소에 남용하면 오히려 메모리 낭비. 실제 애니메이션 대상에만 적용.

### transform 기반 속성 우선 사용

```tsx
// GOOD - GPU 가속 (transform + opacity)
<motion.div animate={{ x: 100, opacity: 0.5, scale: 1.1, rotate: 45 }} />

// BAD - CPU 레이아웃 재계산 유발 (가급적 피할 것)
<motion.div animate={{ width: "200px", height: "300px", left: 100 }} />
```

### Lazy Mount (조건부 마운트)

```tsx
// AnimatePresence 내에서 조건부 렌더링 → 비활성 시 DOM에서 제거됨
<AnimatePresence>
  {isVisible && (
    <motion.div
      key="heavy-component"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <HeavyComponent />
    </motion.div>
  )}
</AnimatePresence>
```

### layout 애니메이션 최적화

```tsx
// layoutScroll: 스크롤 컨테이너 내부의 layout 애니메이션 보정
<motion.div layoutScroll className="overflow-y-auto h-96">
  <motion.div layout>Item</motion.div>
</motion.div>

// layoutDependency: 불필요한 재측정 방지
<motion.div layout layoutDependency={items.length}>
  {items.map(/* ... */)}
</motion.div>
```

### useReducedMotion — 접근성

```tsx
"use client";
import { useReducedMotion } from "motion/react";

export function AccessibleAnimation({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.5,
      }}
    >
      {children}
    </motion.div>
  );
}
```

### Dynamic Import로 번들 최적화

```tsx
// 모달처럼 항상 필요하지 않은 애니메이션 컴포넌트
import dynamic from "next/dynamic";

const AnimatedModal = dynamic(() => import("@/components/glass-modal"), {
  ssr: false, // 클라이언트에서만 로드
});
```

---

## 10. Transition Cheat Table

### Transition Types

| type | 용도 | 추천 상황 |
|------|------|-----------|
| `"spring"` | 물리 기반 스프링 | 대부분의 UI 인터랙션 (기본값) |
| `"tween"` | 시간 기반 (duration) | 페이드, 정밀 제어 필요 시 |
| `"inertia"` | 관성 기반 | 드래그 후 감속 |

### Spring 파라미터

```tsx
transition={{
  type: "spring",
  stiffness: 300,  // 강성 (높을수록 빠르고 팽팽)
  damping: 20,     // 감쇠 (높을수록 빨리 안정)
  mass: 1,         // 질량 (높을수록 느리고 무거운 느낌)
  bounce: 0.25,    // 바운스 (0~1, stiffness/damping 대안)
}}
```

### 자주 쓰는 Spring 프리셋

```tsx
// 빠르고 스냅감 있는 (버튼, 토글)
{ type: "spring", stiffness: 400, damping: 17 }

// 부드럽고 자연스러운 (카드, 패널)
{ type: "spring", stiffness: 300, damping: 20 }

// 느리고 우아한 (모달, 페이지)
{ type: "spring", stiffness: 200, damping: 25 }

// 바운시한 (아이콘, 알림)
{ type: "spring", stiffness: 500, damping: 15, mass: 0.8 }
```

### Ease 커브 (tween용)

```tsx
// 내장 easing
"linear" | "easeIn" | "easeOut" | "easeInOut" | "circIn" | "circOut" | "circInOut"
| "backIn" | "backOut" | "backInOut" | "anticipate"

// Custom cubic-bezier
ease: [0.25, 0.1, 0.25, 1.0]

// 추천 ease
ease: [0.16, 1, 0.3, 1]    // Apple 스타일 (빠른 시작, 부드러운 끝)
ease: [0.33, 1, 0.68, 1]   // 자연스러운 감속
```

### 속성별 개별 Transition

```tsx
<motion.div
  animate={{ opacity: 1, y: 0, scale: 1 }}
  transition={{
    opacity: { duration: 0.3 },
    y: { type: "spring", stiffness: 300, damping: 20 },
    scale: { type: "spring", stiffness: 400, damping: 17 },
  }}
/>
```

### 반복 (Repeat)

```tsx
transition={{
  repeat: Infinity,        // 무한 반복
  repeat: 3,               // 3회 반복
  repeatType: "loop",      // "loop" | "reverse" | "mirror"
  repeatDelay: 0.5,        // 반복 간 딜레이
}}
```

---

## Appendix: 공모전 필승 조합

### 인트로 히어로 섹션 풀 패턴

```tsx
"use client";
import { motion } from "motion/react";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

export function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center">
      <motion.span
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="text-sm uppercase tracking-widest text-indigo-400"
      >
        Welcome to the Future
      </motion.span>

      <motion.h1
        custom={1}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="text-6xl font-bold mt-4 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent"
      >
        Build Something Amazing
      </motion.h1>

      <motion.p
        custom={2}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="text-lg text-gray-400 mt-6 max-w-xl text-center"
      >
        The next generation platform for creators and developers.
      </motion.p>

      <motion.div
        custom={3}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mt-10 flex gap-4"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-3 bg-indigo-600 text-white rounded-full font-medium"
        >
          Get Started
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-3 border border-white/20 text-white rounded-full font-medium"
        >
          Learn More
        </motion.button>
      </motion.div>
    </section>
  );
}
```

### Bento Grid with Staggered Reveal

```tsx
"use client";
import { motion } from "motion/react";

const gridContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.2,
    },
  },
};

const gridItem = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
    },
  },
};

export function BentoGrid({ items }: { items: React.ReactNode[] }) {
  return (
    <motion.div
      variants={gridContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className="grid grid-cols-4 gap-4 auto-rows-[200px]"
    >
      {items.map((item, i) => (
        <motion.div
          key={i}
          variants={gridItem}
          whileHover={{
            scale: 1.02,
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          }}
          className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6
                     overflow-hidden relative group"
        >
          {item}
        </motion.div>
      ))}
    </motion.div>
  );
}
```

---

> **마지막 팁:** 공모전 심사에서 "Vibe Factor"를 극대화하려면:
> 1. **일관된 timing** — 모든 애니메이션에 동일한 ease 커브 사용 (예: `[0.16, 1, 0.3, 1]`)
> 2. **Spring 우선** — 인터랙션(hover, tap)에는 spring, 등장 애니메이션에는 tween
> 3. **Stagger는 짧게** — `0.05~0.1s`가 적당. 길면 답답해 보임
> 4. **exit도 챙기기** — `AnimatePresence` + `exit`으로 퇴장도 우아하게
> 5. **접근성** — `useReducedMotion` 처리로 가산점
