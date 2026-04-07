"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Maximize2, Play, Square } from "lucide-react";
import type { PalaceRoomData, Hotspot, OutlineItem } from "@/lib/data/palace-rooms/types";

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
  const { region } = hotspot;
  return (
    <motion.button
      className="absolute cursor-pointer group"
      style={{
        left: `${region.x}%`, top: `${region.y}%`,
        width: `${region.w}%`, height: `${region.h}%`,
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
   말풍선 텍스트 ↔ 사진 속 오브젝트 연결선
   말풍선 DOM 내 각 항목의 실제 위치를 측정하여 SVG 선 그림
   ══════════════════════════════════════════════════════════════ */

function flattenAll(items: OutlineItem[]): OutlineItem[] {
  const result: OutlineItem[] = [];
  for (const item of items) {
    result.push(item);
    if (item.children) result.push(...flattenAll(item.children));
  }
  return result;
}

/**
 * 연결선: 말풍선 가장자리 → 사진 속 pointer
 * DOM 측정 대신 말풍선 위치를 CSS %로 계산하여 안정적으로 그림
 */
/**
 * 연결선: 말풍선 텍스트 항목(DOM 측정) → 사진 속 pointer
 * itemCoords: 각 항목의 실제 화면 좌표 (% 단위)
 */
function ConnectionLines({
  hotspot,
  isNarrating,
  itemCoords,
}: {
  hotspot: Hotspot;
  isNarrating: boolean;
  itemCoords: { x: number; y: number }[];
  // unused but kept for interface compat
  bubbleEdgeXPct?: number;
  bubbleTopPct?: number;
  itemCount?: number;
}) {
  const allItems = flattenAll(hotspot.outline);

  return (
    <svg className="absolute inset-0 w-full h-full z-[55] pointer-events-none">
      <defs>
        <filter id="line-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {allItems.map((item, i) => {
        const from = itemCoords[i];
        if (!from) return null;
        const toX = item.pointer.x;
        const toY = item.pointer.y;
        return (
          <g key={i}>
            {/* 글로우 */}
            <motion.line
              x1={`${from.x}%`} y1={`${from.y}%`} x2={`${toX}%`} y2={`${toY}%`}
              stroke="rgba(241,196,15,0.12)" strokeWidth="6" filter="url(#line-glow)"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, delay: 0.35 + i * 0.06 }}
            />
            {/* 메인 선 */}
            <motion.line
              x1={`${from.x}%`} y1={`${from.y}%`} x2={`${toX}%`} y2={`${toY}%`}
              stroke={isNarrating ? "rgba(241,196,15,0.9)" : "rgba(241,196,15,0.55)"}
              strokeWidth={isNarrating ? "2.5" : "1.5"}
              strokeDasharray={isNarrating ? "none" : "6 4"}
              initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.35 + i * 0.06 }}
            />
            {/* 사진 쪽 끝점 */}
            <motion.circle
              cx={`${toX}%`} cy={`${toY}%`} r={isNarrating ? 6 : 5}
              fill="rgba(241,196,15,0.8)" stroke="rgba(241,196,15,1)" strokeWidth="2"
              filter="url(#line-glow)"
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: 0.5 + i * 0.06 }}
            />
            {/* 말풍선 쪽 시작점 */}
            <motion.circle
              cx={`${from.x}%`} cy={`${from.y}%`} r="3"
              fill="rgba(241,196,15,0.6)"
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: 0.4 + i * 0.06 }}
            />
            {isNarrating && (
              <motion.circle
                cx={`${toX}%`} cy={`${toY}%`} r="10" fill="none"
                stroke="rgba(241,196,15,0.4)" strokeWidth="2"
                animate={{ r: [7, 14, 7], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
   Speech Bubble + Outline + 연결선 통합
   말풍선 내 각 텍스트 항목에 ref를 걸어 위치 측정
   ══════════════════════════════════════════════════════════════ */

function OutlineItemRow({
  item,
  depth,
  onMount,
}: {
  item: OutlineItem;
  depth: number;
  onMount: (el: HTMLElement | null) => void;
}) {
  const markers = ["", "•", "‣"];
  const marker = markers[Math.min(depth, markers.length - 1)];

  return (
    <>
      <li ref={(el) => onMount(el)} className="flex items-start gap-1">
        {marker && <span className="text-amber-400/60 shrink-0">{marker}</span>}
        <span className={depth === 0 ? "text-amber-300 font-semibold text-[13px]" : "text-white/80 text-[12px]"}>
          {item.text}
        </span>
      </li>
      {item.children?.map((child, ci) => (
        <OutlineItemRow key={ci} item={child} depth={depth + 1} onMount={onMount} />
      ))}
    </>
  );
}

function SpeechBubbleWithLines({
  hotspot,
  isNarrating,
}: {
  hotspot: Hotspot;
  isNarrating: boolean;
}) {
  const isLeftHalf = hotspot.region.x + hotspot.region.w / 2 < 50;
  const centerY = Math.max(12, Math.min(78, hotspot.region.y + hotspot.region.h / 2));
  const allItems = flattenAll(hotspot.outline);

  // DOM 측정으로 각 텍스트 항목의 실제 화면 위치를 가져옴
  const itemElsRef = useRef<Map<number, HTMLElement>>(new Map());
  const [lineCoords, setLineCoords] = useState<{ x: number; y: number }[]>([]);
  const mountIdx = useRef(0);

  // 렌더 시작 시 카운터만 리셋 (ref Map은 유지)
  mountIdx.current = 0;

  const handleItemRef = useCallback((el: HTMLElement | null) => {
    if (el) {
      itemElsRef.current.set(mountIdx.current, el);
    }
    mountIdx.current++;
  }, []);

  // 애니메이션 완료 후(400ms) DOM 위치 측정
  useEffect(() => {
    const timer = setTimeout(() => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const coords: { x: number; y: number }[] = [];
      for (let i = 0; i < allItems.length; i++) {
        const el = itemElsRef.current.get(i);
        if (!el) { coords.push({ x: 50, y: 50 }); continue; }
        const r = el.getBoundingClientRect();
        // 말풍선이 왼쪽(isLeftHalf=false) → 선이 텍스트 오른쪽 끝에서 이미지로
        // 말풍선이 오른쪽(isLeftHalf=true) → 선이 텍스트 왼쪽 끝에서 이미지로
        const textEnd = isLeftHalf
          ? r.left
          : r.right;
        coords.push({
          x: (textEnd / vw) * 100,
          y: ((r.top + r.height / 2) / vh) * 100,
        });
      }
      setLineCoords(coords);
    }, 400);
    return () => clearTimeout(timer);
  }, [hotspot.id, isLeftHalf, allItems.length]);

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
      {/* 연결선: 말풍선 텍스트 항목 → 사진 속 pointer */}
      {lineCoords.length > 0 && (
        <ConnectionLines
          hotspot={hotspot}
          isNarrating={isNarrating}
          bubbleEdgeXPct={0}
          bubbleTopPct={0}
          itemCount={allItems.length}
          itemCoords={lineCoords}
        />
      )}

      {/* 말풍선 */}
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
          <div className="flex items-center gap-2 px-4 py-2 border-b border-white/8">
            <span className="text-sm font-bold text-amber-300">{hotspot.keyword}</span>
            <span className="text-[10px] text-white/20 ml-auto">{hotspot.section}</span>
          </div>
          <ul className="px-4 py-3 space-y-1.5 overflow-y-auto" style={{ maxHeight: "55vh" }}>
            {hotspot.outline.map((item, i) => (
              <OutlineItemRow key={i} item={item} depth={0} onMount={handleItemRef} />
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

  const handleClick = useCallback((id: string) => {
    if (isNarrating) return;
    setActiveId((prev) => (prev === id ? null : id));
  }, [isNarrating]);

  /* ── 나레이터: narratorText (교과서 본문) 읽기 ── */
  const startNarration = useCallback(() => {
    if (isNarrating) {
      narrationRef.current.cancel = true;
      window.speechSynthesis.cancel();
      setIsNarrating(false);
      setActiveId(null);
      return;
    }
    setIsNarrating(true);
    narrationRef.current = { cancel: false };

    function narrateNext(idx: number) {
      if (narrationRef.current.cancel) { setIsNarrating(false); setActiveId(null); return; }
      const h = room.hotspots[idx];
      if (!h) { setIsNarrating(false); setActiveId(null); return; }
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
      {/* 배경 사진 */}
      <img
        src={room.backgroundImage}
        alt={room.subtitle}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />
      <div className="absolute inset-0 bg-black/15" />

      {/* Hotspot 영역 */}
      {room.hotspots.map((h) => (
        <HotspotOverlay key={h.id} hotspot={h} isActive={activeId === h.id} onClick={() => handleClick(h.id)} />
      ))}

      {/* 말풍선 + 연결선 (텍스트 항목 → 사진 속 오브젝트) */}
      <AnimatePresence>
        {activeHotspot && (
          <SpeechBubbleWithLines key={activeHotspot.id} hotspot={activeHotspot} isNarrating={isNarrating} />
        )}
      </AnimatePresence>

      {/* UI */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-50 pointer-events-none">
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

      <motion.div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }}>
        <p className="text-[11px] text-white/30 px-5 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
          {isNarrating ? "나레이터가 교과서 내용을 읽고 있습니다..." : "키워드를 클릭하거나 ▶ 학습하기를 눌러보세요"}
        </p>
      </motion.div>

      {room.attribution && (
        <div className="absolute bottom-2 right-3 z-50 pointer-events-none">
          <span className="text-[8px] text-white/15">{room.attribution}</span>
        </div>
      )}
    </div>
  );
}
