"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, Maximize2, Play, Square } from "lucide-react";
import type { PalaceRoomData, Hotspot, BulletItem } from "@/lib/data/palace-rooms/types";

/* ══════════════════════════════════════════════════════════════
   Hotspot Overlay — 사진 위 투명 클릭 영역
   ══════════════════════════════════════════════════════════════ */

function HotspotOverlay({
  hotspot,
  isActive,
  onClick,
}: {
  hotspot: Hotspot;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      className="absolute cursor-pointer group"
      style={{
        left: `${hotspot.region.x}%`, top: `${hotspot.region.y}%`,
        width: `${hotspot.region.w}%`, height: `${hotspot.region.h}%`,
      }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      whileHover={{ scale: 1.01 }}
    >
      <div className={`absolute inset-0 rounded border-2 transition-all duration-300 ${
        isActive
          ? "border-amber-400/60 bg-amber-400/8 shadow-[0_0_20px_rgba(241,196,15,0.25)]"
          : "border-transparent group-hover:border-amber-400/25 group-hover:bg-amber-400/5"
      }`} />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded whitespace-nowrap transition-all ${
          isActive
            ? "text-amber-200 bg-black/70 border border-amber-400/50"
            : "text-white/60 bg-black/40 border border-white/10 group-hover:text-amber-200"
        }`}>
          {hotspot.keyword}
        </span>
      </div>
    </motion.button>
  );
}

/* ══════════════════════════════════════════════════════════════
   연결선: 말풍선 bullet → 사진 속 pointer
   bullets를 pointer.y 순서로 정렬하여 교차 방지
   ══════════════════════════════════════════════════════════════ */

function ConnectionLines({
  bullets,
  itemCoords,
}: {
  bullets: BulletItem[];
  itemCoords: { x: number; y: number }[];
}) {
  return (
    <svg className="absolute inset-0 w-full h-full z-[55] pointer-events-none">
      <defs>
        <filter id="line-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {bullets.map((item, i) => {
        const from = itemCoords[i];
        if (!from) return null;
        return (
          <g key={i}>
            <motion.line
              x1={`${from.x}%`} y1={`${from.y}%`} x2={`${item.pointer.x}%`} y2={`${item.pointer.y}%`}
              stroke="rgba(241,196,15,0.1)" strokeWidth="5" filter="url(#line-glow)"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 0.35, delay: 0.3 + i * 0.06 }}
            />
            <motion.line
              x1={`${from.x}%`} y1={`${from.y}%`} x2={`${item.pointer.x}%`} y2={`${item.pointer.y}%`}
              stroke="rgba(241,196,15,0.55)" strokeWidth="1.5" strokeDasharray="6 4"
              initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.35, delay: 0.3 + i * 0.06 }}
            />
            <motion.circle
              cx={`${item.pointer.x}%`} cy={`${item.pointer.y}%`} r={4}
              fill="rgba(241,196,15,0.8)" stroke="rgba(241,196,15,1)" strokeWidth="1.5"
              filter="url(#line-glow)"
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: 0.45 + i * 0.06 }}
            />
            <motion.circle
              cx={`${from.x}%`} cy={`${from.y}%`} r="2.5"
              fill="rgba(241,196,15,0.5)"
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: 0.35 + i * 0.06 }}
            />
          </g>
        );
      })}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
   말풍선: keyword 하나 + flat bullet list
   ══════════════════════════════════════════════════════════════ */

function SpeechBubble({
  hotspot,
  isNarrating,
}: {
  hotspot: Hotspot;
  isNarrating: boolean;
}) {
  // 교차 방지: pointer.y 순서로 정렬
  const sortedBullets = useMemo(
    () => [...hotspot.bullets].sort((a, b) => a.pointer.y - b.pointer.y),
    [hotspot.bullets]
  );

  const isLeftHalf = hotspot.region.x + hotspot.region.w / 2 < 50;
  const rawCenterY = hotspot.region.y + hotspot.region.h / 2;
  const centerY = rawCenterY > 55 ? Math.min(40, rawCenterY - 15) : Math.max(8, Math.min(70, rawCenterY));

  const itemElsRef = useRef<Map<number, HTMLElement>>(new Map());
  const [lineCoords, setLineCoords] = useState<{ x: number; y: number }[]>([]);
  const mountIdx = useRef(0);
  mountIdx.current = 0;

  const handleRef = useCallback((el: HTMLElement | null) => {
    if (el) itemElsRef.current.set(mountIdx.current, el);
    mountIdx.current++;
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const coords: { x: number; y: number }[] = [];
      for (let i = 0; i < sortedBullets.length; i++) {
        const el = itemElsRef.current.get(i);
        if (!el) { coords.push({ x: 50, y: 50 }); continue; }
        const r = el.getBoundingClientRect();
        const edge = isLeftHalf ? r.left : r.right;
        coords.push({
          x: (edge / vw) * 100,
          y: ((r.top + r.height / 2) / vh) * 100,
        });
      }
      setLineCoords(coords);
    }, 350);
    return () => clearTimeout(timer);
  }, [hotspot.id, isLeftHalf, sortedBullets.length]);

  let bubblePosStyle: React.CSSProperties;
  if (isLeftHalf) {
    const leftPct = Math.min(62, hotspot.region.x + hotspot.region.w + 2);
    bubblePosStyle = { left: `${leftPct}%` };
  } else {
    const rightPct = Math.min(62, 100 - hotspot.region.x + 2);
    bubblePosStyle = { right: `${rightPct}%` };
  }

  return (
    <>
      {lineCoords.length > 0 && (
        <ConnectionLines bullets={sortedBullets} itemCoords={lineCoords} />
      )}

      <motion.div
        className="absolute z-[60] pointer-events-auto"
        style={{
          top: `${centerY}%`, ...bubblePosStyle,
          transform: "translateY(-50%)",
          width: "min(380px, 34vw)",
          maxHeight: "75vh",
        }}
        initial={{ opacity: 0, scale: 0.92, x: isLeftHalf ? -10 : 10 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rounded-xl border border-amber-400/25 overflow-hidden"
          style={{ background: "rgba(10,8,15,0.93)", backdropFilter: "blur(16px)" }}>
          <div className="px-4 py-2 border-b border-white/8">
            <span className="text-sm font-bold text-amber-300">{hotspot.keyword}</span>
          </div>
          <ul className="px-4 py-3 space-y-1.5 overflow-y-auto" style={{ maxHeight: "55vh" }}>
            {sortedBullets.map((item, i) => (
              <li key={i} ref={handleRef} className="flex items-start gap-1.5">
                <span className="text-amber-400/60 shrink-0">•</span>
                <span className="text-[12px] text-white/80 leading-relaxed">{item.text}</span>
              </li>
            ))}
          </ul>
          {isNarrating && (
            <div className="px-4 py-2 border-t border-amber-400/10 bg-amber-500/5">
              <span className="text-[10px] text-amber-400/60">읽는 중...</span>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   Main Component
   ══════════════════════════════════════════════════════════════ */

export function PalaceRoom({
  room,
  onBack,
}: {
  room: PalaceRoomData;
  onBack?: () => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isNarrating, setIsNarrating] = useState(false);
  const narrationRef = useRef<{ cancel: boolean }>({ cancel: false });

  const activeHotspot = room.hotspots.find((h) => h.id === activeId);
  const activeIndex = activeId ? room.hotspots.findIndex((h) => h.id === activeId) : -1;

  const handleClick = useCallback((id: string) => {
    if (isNarrating) return;
    setActiveId((prev) => (prev === id ? null : id));
  }, [isNarrating]);

  /* ── 좌/우 네비게이션 ── */
  const goTo = useCallback((direction: "prev" | "next") => {
    if (room.hotspots.length === 0) return;
    setActiveId((prev) => {
      const curIdx = prev ? room.hotspots.findIndex((h) => h.id === prev) : -1;
      let nextIdx: number;
      if (direction === "next") {
        nextIdx = curIdx < 0 ? 0 : Math.min(curIdx + 1, room.hotspots.length - 1);
      } else {
        nextIdx = curIdx <= 0 ? 0 : curIdx - 1;
      }
      return room.hotspots[nextIdx].id;
    });
  }, [room.hotspots]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") { e.preventDefault(); goTo("next"); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goTo("prev"); }
      if (e.key === "Escape") { setActiveId(null); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goTo]);

  /* ── 나레이터 ── */
  const startNarration = useCallback(() => {
    if (isNarrating) {
      narrationRef.current.cancel = true;
      window.speechSynthesis.cancel();
      setIsNarrating(false);
      return;
    }
    setIsNarrating(true);
    narrationRef.current = { cancel: false };

    function narrateNext(idx: number) {
      if (narrationRef.current.cancel) { setIsNarrating(false); return; }
      const h = room.hotspots[idx];
      if (!h) { setIsNarrating(false); return; }
      setActiveId(h.id);

      const utterance = new SpeechSynthesisUtterance(h.narratorText);
      utterance.lang = "ko-KR";
      utterance.rate = 0.92;
      utterance.onend = () => {
        if (!narrationRef.current.cancel) setTimeout(() => narrateNext(idx + 1), 500);
      };
      utterance.onerror = () => {
        if (!narrationRef.current.cancel) setTimeout(() => narrateNext(idx + 1), 300);
      };
      window.speechSynthesis.speak(utterance);
    }
    narrateNext(0);
  }, [isNarrating, room.hotspots]);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
  }, []);

  return (
    <div
      className="fixed inset-0 w-screen h-screen overflow-hidden select-none bg-black"
      onClick={() => { if (!isNarrating) setActiveId(null); }}
    >
      <img
        src={room.backgroundImage}
        alt={room.subtitle}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />
      <div className="absolute inset-0 bg-black/10" />

      {room.hotspots.map((h) => (
        <HotspotOverlay key={h.id} hotspot={h} isActive={activeId === h.id} onClick={() => handleClick(h.id)} />
      ))}

      <AnimatePresence>
        {activeHotspot && (
          <SpeechBubble key={activeHotspot.id} hotspot={activeHotspot} isNarrating={isNarrating} />
        )}
      </AnimatePresence>

      {/* 상단 UI */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-[70] pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-3">
          {onBack && (
            <motion.button onClick={(e) => { e.stopPropagation(); onBack(); }}
              className="p-2.5 rounded-full bg-black/50 backdrop-blur-md border border-white/15 hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <ArrowLeft className="w-5 h-5 text-white/80" />
            </motion.button>
          )}
          <div className="px-4 py-2 rounded-xl bg-black/50 backdrop-blur-md border border-white/15">
            <p className="text-[10px] text-amber-400/70 font-medium tracking-wider uppercase">{room.subtitle}</p>
            <h1 className="text-base font-bold text-white/95">{room.title}</h1>
          </div>
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          <motion.button onClick={(e) => { e.stopPropagation(); startNarration(); }}
            className={`px-4 py-2 rounded-xl backdrop-blur-md border transition-colors flex items-center gap-2 ${
              isNarrating ? "bg-amber-500/30 border-amber-400/40 text-amber-300" : "bg-black/50 border-white/15 text-white/80 hover:bg-white/10"
            }`} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            {isNarrating ? (<><Square className="w-4 h-4" /><span className="text-sm font-medium">중지</span></>)
              : (<><Play className="w-4 h-4" /><span className="text-sm font-medium">학습하기</span></>)}
          </motion.button>
          <motion.button onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
            className="p-2.5 rounded-full bg-black/50 backdrop-blur-md border border-white/15 hover:bg-white/10 transition-colors"
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Maximize2 className="w-5 h-5 text-white/80" />
          </motion.button>
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <motion.div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[70]"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        {activeId ? (
          <div className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15">
            <motion.button
              onClick={(e) => { e.stopPropagation(); goTo("prev"); }}
              disabled={activeIndex <= 0}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors disabled:opacity-25"
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft className="w-5 h-5 text-white/80" />
            </motion.button>
            <span className="text-[12px] text-white/50 font-medium px-2 min-w-[48px] text-center tabular-nums">
              {activeIndex + 1} / {room.hotspots.length}
            </span>
            <motion.button
              onClick={(e) => { e.stopPropagation(); goTo("next"); }}
              disabled={activeIndex >= room.hotspots.length - 1}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors disabled:opacity-25"
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            >
              <ChevronRight className="w-5 h-5 text-white/80" />
            </motion.button>
          </div>
        ) : (
          <p className="text-[11px] text-white/30 px-5 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 pointer-events-none">
            키워드를 클릭하거나 ◀ ▶ 화살표로 탐색하세요
          </p>
        )}
      </motion.div>

      {room.attribution && (
        <div className="absolute bottom-2 right-3 z-[70] pointer-events-none">
          <span className="text-[8px] text-white/15">{room.attribution}</span>
        </div>
      )}
    </div>
  );
}
