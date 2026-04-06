"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Maximize2, Play, Square } from "lucide-react";
import type {
  PalaceRoomData,
  RoomStructure,
  VisualType,
} from "@/lib/data/palace-rooms/geunjeongjeon";

/* ══════════════════════════════════════════════════════════════
   Visual Objects — CSS art for each structure type
   ══════════════════════════════════════════════════════════════ */

function ThroneVisual() {
  return (
    <div className="relative w-[140px] h-[150px]">
      <div
        className="absolute -top-12 left-[10px] right-[10px] h-[60px] rounded-t-[50%]"
        style={{
          background:
            "linear-gradient(180deg, #f1c40f 0%, #d4ac0d 60%, #b8960b 100%)",
          border: "2px solid rgba(241,196,15,0.5)",
          boxShadow: "0 0 20px rgba(241,196,15,0.25)",
        }}
      >
        <div className="absolute inset-[6px] rounded-t-[50%] border border-amber-300/30" />
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 h-[95px] rounded-[4px]"
        style={{
          background:
            "linear-gradient(180deg, #b8960b 0%, #8a7008 100%)",
          border: "2px solid rgba(241,196,15,0.3)",
        }}
      >
        <div className="absolute top-[5px] left-[5px] right-[5px] h-[22px] rounded-sm bg-[#8B0000]/70" />
        <div className="absolute bottom-[12px] left-[12px] right-[12px] h-px bg-amber-400/20" />
        <div className="absolute bottom-[24px] left-[12px] right-[12px] h-px bg-amber-400/20" />
      </div>
      <div
        className="absolute bottom-[16px] -left-[10px] w-[14px] h-[55px] rounded-l-sm"
        style={{ background: "linear-gradient(90deg, #8a7008, #b8960b)" }}
      />
      <div
        className="absolute bottom-[16px] -right-[10px] w-[14px] h-[55px] rounded-r-sm"
        style={{ background: "linear-gradient(90deg, #b8960b, #8a7008)" }}
      />
    </div>
  );
}

function ScrollVisual() {
  return (
    <div className="relative w-[100px] h-[170px]">
      <div
        className="absolute top-0 left-[-6px] right-[-6px] h-[10px] rounded-full"
        style={{
          background:
            "linear-gradient(180deg, #8B4513 0%, #5D4037 100%)",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        }}
      />
      <div className="absolute top-[-2px] left-[-12px] w-[8px] h-[14px] rounded-full bg-amber-800" />
      <div className="absolute top-[-2px] right-[-12px] w-[8px] h-[14px] rounded-full bg-amber-800" />
      <div
        className="absolute top-[10px] left-[6px] right-[6px] bottom-[10px]"
        style={{
          background:
            "linear-gradient(180deg, #f5e6c8 0%, #eedcb0 30%, #e8d5a8 60%, #dbc89a 100%)",
          boxShadow:
            "inset 0 0 12px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.2)",
        }}
      >
        {[12, 22, 32, 42, 52, 62, 72, 82].map((y) => (
          <div
            key={y}
            className="absolute left-[8px] right-[8px] h-px bg-black/8"
            style={{ top: `${y}%` }}
          />
        ))}
        <div className="absolute bottom-[10%] right-[12%] w-[16px] h-[16px] rounded-sm bg-red-700/30" />
      </div>
      <div
        className="absolute bottom-0 left-[-4px] right-[-4px] h-[10px] rounded-full"
        style={{
          background:
            "linear-gradient(180deg, #5D4037 0%, #8B4513 100%)",
          boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
        }}
      />
    </div>
  );
}

function IncenseVisual() {
  return (
    <div className="relative w-[90px] h-[100px]">
      <motion.div
        className="absolute -top-8 left-1/2 -translate-x-1/2 w-[3px] h-[20px] rounded-full"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(200,200,200,0.3) 100%)",
        }}
        animate={{
          y: [-2, -10, -2],
          opacity: [0.15, 0.3, 0.15],
          scaleX: [1, 1.5, 1],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -top-12 left-[48%] w-[2px] h-[16px] rounded-full"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(200,200,200,0.2) 100%)",
        }}
        animate={{
          y: [-4, -12, -4],
          x: [-2, 3, -2],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />
      <div
        className="absolute bottom-[10px] left-[8px] right-[8px] h-[52px] rounded-b-[50%]"
        style={{
          background:
            "linear-gradient(180deg, #5D4037 0%, #3E2723 100%)",
          border: "2px solid rgba(180,140,50,0.3)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        }}
      >
        <div className="absolute top-[30%] left-[6px] right-[6px] h-[3px] rounded-full bg-amber-600/30" />
      </div>
      <div
        className="absolute bottom-[58px] left-0 right-0 h-[10px] rounded-full"
        style={{
          background:
            "linear-gradient(180deg, #d4ac0d 0%, #8a7008 100%)",
          boxShadow: "0 0 8px rgba(212,172,13,0.2)",
        }}
      />
      <div
        className="absolute bottom-0 left-[16px] right-[16px] h-[14px] rounded-b-sm"
        style={{
          background:
            "linear-gradient(180deg, #3E2723 0%, #1a0f0a 100%)",
        }}
      />
    </div>
  );
}

function ScreenVisual() {
  return (
    <div
      className="relative flex w-[160px] h-[150px]"
      style={{ perspective: "400px" }}
    >
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex-1 mx-[1px] rounded-sm overflow-hidden"
          style={{
            background:
              "linear-gradient(180deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #1a2744 100%)",
            border: "1.5px solid rgba(180,140,50,0.25)",
            transform: `rotateY(${(i - 1.5) * 6}deg)`,
            boxShadow: "inset 0 0 10px rgba(0,0,0,0.3)",
          }}
        >
          <svg
            viewBox="0 0 40 120"
            className="w-full h-full opacity-40"
          >
            <path
              d={`M0 120 L20 ${40 + i * 15} L40 120`}
              fill="rgba(39,174,96,0.4)"
            />
            <path
              d={`M5 120 L20 ${60 + i * 10} L35 120`}
              fill="rgba(26,82,118,0.3)"
            />
            <line
              x1="0"
              y1="115"
              x2="40"
              y2="115"
              stroke="rgba(100,180,255,0.2)"
              strokeWidth="1"
            />
          </svg>
        </div>
      ))}
      <div
        className="absolute -top-[3px] left-0 right-0 h-[5px] rounded-t-sm"
        style={{
          background:
            "linear-gradient(90deg, #8a7008, #d4ac0d, #f1c40f, #d4ac0d, #8a7008)",
        }}
      />
      <div
        className="absolute -bottom-[3px] left-0 right-0 h-[4px] rounded-b-sm"
        style={{
          background:
            "linear-gradient(90deg, #8a7008, #d4ac0d, #8a7008)",
        }}
      />
    </div>
  );
}

function CandleVisual() {
  return (
    <div className="relative w-[60px] h-[140px]">
      <motion.div
        className="absolute -top-5 left-1/2 -translate-x-1/2 w-[18px] h-[28px] rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 60%, #fff8dc 0%, #f1c40f 35%, #e67e22 65%, transparent 100%)",
          boxShadow:
            "0 0 20px 6px rgba(241,196,15,0.35), 0 0 40px 10px rgba(241,196,15,0.1)",
        }}
        animate={{
          scaleX: [1, 1.15, 0.9, 1],
          scaleY: [1, 1.08, 0.92, 1],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute top-[4px] left-1/2 -translate-x-1/2 w-[2px] h-[8px] bg-gray-600 rounded-full" />
      <div
        className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[16px] h-[55px] rounded-t-sm"
        style={{
          background:
            "linear-gradient(90deg, #e8d5a8 0%, #f5e6c8 40%, #eedcb0 100%)",
          boxShadow: "0 0 6px rgba(245,230,200,0.15)",
        }}
      >
        <div className="absolute top-[20px] -left-[2px] w-[4px] h-[10px] rounded-b-full bg-[#f0dbb8]" />
      </div>
      <div
        className="absolute bottom-[42px] left-[6px] right-[6px] h-[8px] rounded-full"
        style={{
          background: "linear-gradient(180deg, #d4ac0d, #8a7008)",
        }}
      />
      <div
        className="absolute bottom-[20px] left-1/2 -translate-x-1/2 w-[8px] h-[24px]"
        style={{
          background:
            "linear-gradient(90deg, #8a7008, #b8960b, #8a7008)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-[22px]"
        style={{
          background:
            "linear-gradient(180deg, #b8960b 0%, #8a7008 100%)",
          clipPath: "polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)",
        }}
      />
    </div>
  );
}

function BookVisual() {
  return (
    <div className="relative w-[110px] h-[130px]">
      <div
        className="absolute top-[4px] left-[4px] right-0 bottom-0 rounded-r-sm"
        style={{
          background:
            "linear-gradient(90deg, #e8d5a8 0%, #f5e6c8 20%, #eedcb0 100%)",
          border: "1px solid rgba(0,0,0,0.1)",
        }}
      />
      <div
        className="absolute top-[2px] left-[2px] right-[2px] bottom-[2px] rounded-r-sm"
        style={{
          background:
            "linear-gradient(90deg, #eedcb0 0%, #f5e6c8 30%, #f0dbb8 100%)",
          border: "1px solid rgba(0,0,0,0.08)",
        }}
      />
      <div
        className="absolute inset-0 rounded-r-sm overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #8B0000 0%, #6B0000 50%, #4a0000 100%)",
          border: "2px solid rgba(180,140,50,0.4)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
        }}
      >
        <div
          className="absolute top-0 bottom-0 left-0 w-[14px]"
          style={{
            background:
              "linear-gradient(90deg, #4a0000 0%, #6B0000 50%, #8B0000 100%)",
          }}
        />
        <div
          className="absolute top-[15%] left-[22px] right-[10px] h-[40%] rounded-sm border border-amber-500/30"
          style={{ background: "rgba(212,172,13,0.08)" }}
        >
          {[25, 45, 65].map((y) => (
            <div
              key={y}
              className="absolute left-[8px] right-[8px] h-px bg-amber-400/20"
              style={{ top: `${y}%` }}
            />
          ))}
        </div>
        <div className="absolute bottom-[10%] left-[22px] right-[10px] h-[2px] bg-amber-500/20" />
      </div>
    </div>
  );
}

function ChestVisual() {
  return (
    <div className="relative w-[120px] h-[90px]">
      <div
        className="absolute top-0 left-[-4px] right-[-4px] h-[20px] rounded-t-[4px]"
        style={{
          background:
            "linear-gradient(180deg, #5D4037 0%, #4E342E 50%, #3E2723 100%)",
          border: "2px solid rgba(180,140,50,0.3)",
          boxShadow: "0 -2px 8px rgba(0,0,0,0.2)",
        }}
      >
        <div className="absolute bottom-0 left-[8px] right-[8px] h-[2px] bg-amber-600/30" />
      </div>
      <div
        className="absolute top-[18px] left-0 right-0 bottom-0 rounded-b-[3px]"
        style={{
          background:
            "linear-gradient(180deg, #4E342E 0%, #3E2723 60%, #2C1A12 100%)",
          border: "2px solid rgba(180,140,50,0.25)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
        }}
      >
        <div
          className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[20px] h-[24px] rounded-sm"
          style={{
            background:
              "linear-gradient(180deg, #d4ac0d 0%, #8a7008 100%)",
            border: "1px solid rgba(241,196,15,0.4)",
          }}
        >
          <div className="absolute bottom-[4px] left-1/2 -translate-x-1/2 w-[6px] h-[6px] rounded-full bg-black/40" />
        </div>
        <div className="absolute top-0 bottom-0 left-[15%] w-[3px] bg-amber-700/20" />
        <div className="absolute top-0 bottom-0 right-[15%] w-[3px] bg-amber-700/20" />
        <div className="absolute top-0 left-0 w-[12px] h-[12px] border-t-2 border-l-2 border-amber-600/30" />
        <div className="absolute top-0 right-0 w-[12px] h-[12px] border-t-2 border-r-2 border-amber-600/30" />
      </div>
    </div>
  );
}

function PillarPlateVisual() {
  return (
    <div className="relative w-[100px] h-[120px]">
      {/* Red pillar section background */}
      <div
        className="absolute inset-0 rounded-[3px]"
        style={{
          background:
            "linear-gradient(90deg, #5a1515 0%, #b93030 35%, #c94040 50%, #b93030 65%, #5a1515 100%)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        }}
      />
      {/* Golden plaque */}
      <div
        className="absolute top-[18%] left-[14%] right-[14%] bottom-[18%] rounded-[2px]"
        style={{
          border: "2.5px solid #d4ac0d",
          background: "linear-gradient(180deg, #1a1320 0%, #0f0a12 100%)",
          boxShadow:
            "inset 0 0 8px rgba(0,0,0,0.5), 0 0 6px rgba(212,172,13,0.2)",
        }}
      >
        {/* Text impression lines */}
        {[25, 40, 55, 70].map((y) => (
          <div
            key={y}
            className="absolute left-[12%] right-[12%] h-px bg-amber-400/15"
            style={{ top: `${y}%` }}
          />
        ))}
        {/* Corner decorations */}
        <div className="absolute top-[4px] left-[4px] w-[6px] h-[6px] border-t border-l border-amber-500/30" />
        <div className="absolute top-[4px] right-[4px] w-[6px] h-[6px] border-t border-r border-amber-500/30" />
        <div className="absolute bottom-[4px] left-[4px] w-[6px] h-[6px] border-b border-l border-amber-500/30" />
        <div className="absolute bottom-[4px] right-[4px] w-[6px] h-[6px] border-b border-r border-amber-500/30" />
      </div>
      {/* Gold cap top */}
      <div
        className="absolute top-0 left-[-3px] right-[-3px] h-[6px] rounded-t-sm"
        style={{
          background:
            "linear-gradient(180deg, #d4ac0d 0%, #8a7008 100%)",
        }}
      />
      {/* Gold cap bottom */}
      <div
        className="absolute bottom-0 left-[-3px] right-[-3px] h-[5px]"
        style={{
          background:
            "linear-gradient(180deg, #8a7008 0%, #d4ac0d 100%)",
        }}
      />
    </div>
  );
}

function TableVisual() {
  return (
    <div className="relative w-[110px] h-[70px]">
      <div
        className="absolute top-0 left-0 right-0 h-[30px] rounded-[2px]"
        style={{
          background:
            "linear-gradient(180deg, #5D4037 0%, #4E342E 50%, #3E2723 100%)",
          border: "1.5px solid rgba(180,140,50,0.2)",
          boxShadow: "0 3px 10px rgba(0,0,0,0.3)",
        }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(255,255,255,0.03) 4px, rgba(255,255,255,0.03) 5px)",
          }}
        />
        <div
          className="absolute top-[4px] left-1/2 -translate-x-1/2 w-[28px] h-[18px] rounded-sm"
          style={{
            background:
              "linear-gradient(180deg, #f5e6c8 0%, #dbc89a 100%)",
            border: "1px solid rgba(0,0,0,0.1)",
          }}
        />
      </div>
      <div
        className="absolute bottom-0 left-[10px] w-[8px] h-[38px]"
        style={{
          background:
            "linear-gradient(90deg, #3E2723 0%, #5D4037 50%, #3E2723 100%)",
        }}
      />
      <div
        className="absolute bottom-0 right-[10px] w-[8px] h-[38px]"
        style={{
          background:
            "linear-gradient(90deg, #3E2723 0%, #5D4037 50%, #3E2723 100%)",
        }}
      />
      <div
        className="absolute bottom-[12px] left-[14px] right-[14px] h-[3px]"
        style={{ background: "linear-gradient(90deg, #3E2723, #5D4037, #3E2723)" }}
      />
    </div>
  );
}

/* ── New visual types ── */

function VaseVisual() {
  return (
    <div className="relative w-[70px] h-[120px]">
      {/* Rim */}
      <div
        className="absolute top-0 left-[10px] right-[10px] h-[10px] rounded-t-full"
        style={{ background: "linear-gradient(180deg, #2e7d32 0%, #1b5e20 100%)", border: "1px solid rgba(180,140,50,0.3)" }}
      />
      {/* Neck */}
      <div className="absolute top-[10px] left-[18px] right-[18px] h-[20px]"
        style={{ background: "linear-gradient(90deg, #1b5e20, #2e7d32, #1b5e20)" }}
      />
      {/* Body */}
      <div
        className="absolute top-[28px] left-[4px] right-[4px] bottom-[10px] rounded-[40%]"
        style={{
          background: "linear-gradient(135deg, #2e7d32 0%, #1b5e20 50%, #0d3310 100%)",
          border: "1.5px solid rgba(180,140,50,0.25)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        }}
      >
        <div className="absolute top-[20%] left-[10%] right-[10%] h-px bg-amber-400/20" />
        <div className="absolute top-[50%] left-[8%] right-[8%] h-px bg-amber-400/15" />
      </div>
      {/* Base */}
      <div className="absolute bottom-0 left-[12px] right-[12px] h-[12px] rounded-b-sm"
        style={{ background: "linear-gradient(180deg, #1b5e20, #0d3310)" }}
      />
    </div>
  );
}

function DrumVisual() {
  return (
    <div className="relative w-[100px] h-[80px]">
      {/* Top ellipse */}
      <div className="absolute top-0 left-0 right-0 h-[20px] rounded-[50%]"
        style={{
          background: "radial-gradient(ellipse at 50% 60%, #f5e6c8 0%, #dbc89a 70%)",
          border: "2px solid rgba(180,140,50,0.4)",
          boxShadow: "inset 0 -3px 6px rgba(0,0,0,0.1)",
        }}
      />
      {/* Body */}
      <div className="absolute top-[10px] left-[2px] right-[2px] bottom-[2px] rounded-b-[4px]"
        style={{
          background: "linear-gradient(90deg, #8B0000 0%, #b93030 35%, #c94040 50%, #b93030 65%, #8B0000 100%)",
          border: "1.5px solid rgba(180,140,50,0.25)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        }}
      >
        {/* Studs */}
        {[20, 50, 80].map((x) => (
          <div key={x} className="absolute top-[4px] w-[4px] h-[4px] rounded-full bg-amber-500/50"
            style={{ left: `${x}%`, transform: "translateX(-50%)" }}
          />
        ))}
        <div className="absolute bottom-[8px] left-[10%] right-[10%] h-[2px] bg-amber-600/25 rounded-full" />
      </div>
    </div>
  );
}

function BonsaiVisual() {
  return (
    <div className="relative w-[90px] h-[110px]">
      {/* Foliage */}
      <div className="absolute top-0 left-[8px] right-[8px] h-[50px]"
        style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}
      >
        <div className="absolute top-[5px] left-1/2 -translate-x-1/2 w-[55px] h-[30px] rounded-[50%]"
          style={{ background: "radial-gradient(ellipse, #2e7d32 0%, #1b5e20 70%)" }}
        />
        <div className="absolute top-0 left-[5px] w-[35px] h-[24px] rounded-[50%]"
          style={{ background: "radial-gradient(ellipse, #388e3c 0%, #2e7d32 70%)" }}
        />
        <div className="absolute top-[2px] right-[5px] w-[30px] h-[22px] rounded-[50%]"
          style={{ background: "radial-gradient(ellipse, #1b5e20 0%, #0d3310 70%)" }}
        />
      </div>
      {/* Trunk */}
      <div className="absolute top-[42px] left-1/2 -translate-x-1/2 w-[8px] h-[30px]"
        style={{ background: "linear-gradient(90deg, #3E2723 0%, #5D4037 50%, #3E2723 100%)" }}
      />
      {/* Pot */}
      <div className="absolute bottom-0 left-[10px] right-[10px] h-[30px] rounded-b-sm"
        style={{
          background: "linear-gradient(180deg, #4E342E 0%, #3E2723 100%)",
          border: "1.5px solid rgba(180,140,50,0.3)",
          clipPath: "polygon(5% 0%, 95% 0%, 100% 100%, 0% 100%)",
        }}
      />
      {/* Pot rim */}
      <div className="absolute bottom-[26px] left-[6px] right-[6px] h-[5px] rounded-sm"
        style={{ background: "linear-gradient(180deg, #5D4037, #4E342E)", border: "1px solid rgba(180,140,50,0.2)" }}
      />
    </div>
  );
}

function GongVisual() {
  return (
    <div className="relative w-[100px] h-[100px]">
      {/* Frame top bar */}
      <div className="absolute top-0 left-[5px] right-[5px] h-[6px] rounded-sm"
        style={{ background: "linear-gradient(90deg, #5D4037, #8B4513, #5D4037)" }}
      />
      {/* Left rope */}
      <div className="absolute top-[6px] left-[15px] w-[2px] h-[18px]"
        style={{ background: "#8B4513" }}
      />
      {/* Right rope */}
      <div className="absolute top-[6px] right-[15px] w-[2px] h-[18px]"
        style={{ background: "#8B4513" }}
      />
      {/* Gong disc */}
      <div className="absolute top-[22px] left-1/2 -translate-x-1/2 w-[70px] h-[70px] rounded-full"
        style={{
          background: "radial-gradient(circle at 40% 35%, #d4ac0d 0%, #b8960b 40%, #8a7008 80%, #6a5506 100%)",
          border: "2px solid rgba(241,196,15,0.4)",
          boxShadow: "0 0 15px rgba(212,172,13,0.15), inset 0 0 20px rgba(0,0,0,0.2)",
        }}
      >
        <div className="absolute inset-[15px] rounded-full border border-amber-300/20" />
        <div className="absolute inset-[25px] rounded-full bg-amber-800/30" />
      </div>
    </div>
  );
}

function FanVisual() {
  return (
    <div className="relative w-[120px] h-[110px]">
      {/* Fan body */}
      <div className="absolute top-0 left-[5px] right-[5px] h-[80px] overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #f5e6c8 0%, #eedcb0 60%, #dbc89a 100%)",
          clipPath: "polygon(50% 100%, 0% 0%, 100% 0%)",
          border: "1px solid rgba(180,140,50,0.3)",
        }}
      >
        {/* Ribs */}
        {[20, 35, 50, 65, 80].map((x) => (
          <div key={x} className="absolute bottom-0 h-full w-px bg-amber-700/20"
            style={{ left: `${x}%` }}
          />
        ))}
        {/* Painting hint */}
        <div className="absolute top-[15%] left-[30%] w-[40%] h-[35%] rounded-full opacity-30"
          style={{ background: "radial-gradient(ellipse, #2e7d32, transparent)" }}
        />
      </div>
      {/* Handle */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[6px] h-[35px] rounded-b-full"
        style={{ background: "linear-gradient(90deg, #5D4037, #8B4513, #5D4037)" }}
      />
    </div>
  );
}

function MirrorVisual() {
  return (
    <div className="relative w-[80px] h-[100px]">
      {/* Frame */}
      <div className="absolute top-[5px] left-[5px] right-[5px] h-[70px] rounded-full"
        style={{
          border: "3px solid #b8960b",
          boxShadow: "0 0 8px rgba(212,172,13,0.15)",
        }}
      >
        {/* Mirror surface */}
        <div className="absolute inset-[3px] rounded-full"
          style={{
            background: "radial-gradient(circle at 35% 35%, rgba(200,220,240,0.4) 0%, rgba(120,140,160,0.2) 50%, rgba(60,70,80,0.3) 100%)",
            boxShadow: "inset 0 0 10px rgba(255,255,255,0.05)",
          }}
        />
        {/* Gleam */}
        <div className="absolute top-[15%] left-[20%] w-[15px] h-[8px] rounded-full bg-white/10 rotate-[-30deg]" />
      </div>
      {/* Stand */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[6px] h-[28px]"
        style={{ background: "linear-gradient(90deg, #8a7008, #b8960b, #8a7008)" }}
      />
      {/* Base */}
      <div className="absolute bottom-0 left-[15px] right-[15px] h-[6px] rounded-sm"
        style={{ background: "linear-gradient(180deg, #b8960b, #8a7008)" }}
      />
    </div>
  );
}

function TapestryVisual() {
  return (
    <div className="relative w-[90px] h-[120px]">
      {/* Rod */}
      <div className="absolute top-0 left-[-4px] right-[-4px] h-[8px] rounded-full"
        style={{ background: "linear-gradient(180deg, #8B4513, #5D4037)", boxShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
      />
      {/* Fabric */}
      <div className="absolute top-[8px] left-[2px] right-[2px] bottom-[4px]"
        style={{
          background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #1a1a2e 100%)",
          border: "1px solid rgba(180,140,50,0.2)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        }}
      >
        {/* Pattern */}
        <div className="absolute top-[10%] left-[10%] right-[10%] h-[3px] bg-amber-500/15" />
        <div className="absolute top-[25%] left-[15%] right-[15%] h-[2px] bg-red-500/10" />
        <div className="absolute top-[50%] left-1/2 -translate-x-1/2 w-[20px] h-[20px] rounded-full border border-amber-400/15" />
        <div className="absolute bottom-[15%] left-[10%] right-[10%] h-[3px] bg-amber-500/15" />
      </div>
      {/* Bottom weight */}
      <div className="absolute bottom-0 left-[4px] right-[4px] h-[5px] rounded-b-sm"
        style={{ background: "linear-gradient(180deg, #5D4037, #8B4513)" }}
      />
    </div>
  );
}

function StoneTabletVisual() {
  return (
    <div className="relative w-[80px] h-[110px]">
      {/* Tablet */}
      <div className="absolute top-0 left-[4px] right-[4px] bottom-[15px] rounded-t-[4px]"
        style={{
          background: "linear-gradient(180deg, #616161 0%, #424242 40%, #303030 100%)",
          border: "1.5px solid rgba(255,255,255,0.08)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* Engraved lines */}
        {[20, 32, 44, 56, 68, 80].map((y) => (
          <div key={y} className="absolute left-[12%] right-[12%] h-px bg-white/6"
            style={{ top: `${y}%` }}
          />
        ))}
      </div>
      {/* Base */}
      <div className="absolute bottom-0 left-0 right-0 h-[18px] rounded-[2px]"
        style={{ background: "linear-gradient(180deg, #424242, #303030)", border: "1px solid rgba(255,255,255,0.05)" }}
      />
    </div>
  );
}

function MaskVisual() {
  return (
    <div className="relative w-[70px] h-[90px]">
      {/* Face */}
      <div className="absolute top-[5px] left-[5px] right-[5px] bottom-[5px] rounded-[50%_50%_45%_45%]"
        style={{
          background: "linear-gradient(180deg, #f5e6c8 0%, #dbc89a 50%, #c9a86c 100%)",
          border: "2px solid rgba(180,140,50,0.3)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        }}
      >
        {/* Eyes */}
        <div className="absolute top-[30%] left-[18%] w-[14px] h-[8px] rounded-[50%] bg-black/70"
          style={{ transform: "rotate(-5deg)" }}
        />
        <div className="absolute top-[30%] right-[18%] w-[14px] h-[8px] rounded-[50%] bg-black/70"
          style={{ transform: "rotate(5deg)" }}
        />
        {/* Nose */}
        <div className="absolute top-[48%] left-1/2 -translate-x-1/2 w-[8px] h-[10px] rounded-b-full bg-[#c9a86c]"
          style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.15)" }}
        />
        {/* Mouth */}
        <div className="absolute top-[68%] left-[25%] right-[25%] h-[6px] rounded-b-full bg-[#8B0000]/60" />
      </div>
      {/* Hanging hook */}
      <div className="absolute -top-[3px] left-1/2 -translate-x-1/2 w-[8px] h-[6px] rounded-t-full bg-amber-700/50" />
    </div>
  );
}

function WallLanternVisual() {
  return (
    <div className="relative w-[60px] h-[90px]">
      {/* Bracket */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[3px] h-[15px]"
        style={{ background: "linear-gradient(180deg, #5D4037, #3E2723)" }}
      />
      {/* Top cap */}
      <div className="absolute top-[14px] left-[8px] right-[8px] h-[8px] rounded-t-sm"
        style={{ background: "linear-gradient(180deg, #d4ac0d, #8a7008)" }}
      />
      {/* Lantern body */}
      <div className="absolute top-[22px] left-[4px] right-[4px] bottom-[10px] rounded-[2px]"
        style={{
          background: "linear-gradient(180deg, rgba(241,196,15,0.15) 0%, rgba(241,196,15,0.05) 100%)",
          border: "1.5px solid rgba(180,140,50,0.3)",
          boxShadow: "0 0 12px rgba(241,196,15,0.1), inset 0 0 8px rgba(241,196,15,0.05)",
        }}
      >
        {/* Inner glow */}
        <motion.div className="absolute inset-[4px] rounded-sm"
          style={{ background: "radial-gradient(circle, rgba(241,196,15,0.2) 0%, transparent 70%)" }}
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Lattice */}
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-amber-700/20" />
        <div className="absolute left-0 right-0 top-1/2 h-px bg-amber-700/20" />
      </div>
      {/* Bottom cap */}
      <div className="absolute bottom-[4px] left-[10px] right-[10px] h-[6px] rounded-b-sm"
        style={{ background: "linear-gradient(180deg, #8a7008, #d4ac0d)" }}
      />
      {/* Tassel */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[3px] h-[6px] rounded-b-full"
        style={{ background: "#8B0000" }}
      />
    </div>
  );
}

function BeamTagVisual() {
  return (
    <div className="relative w-[90px] h-[50px]">
      {/* Beam section */}
      <div className="absolute top-0 left-0 right-0 h-[14px] rounded-[2px]"
        style={{
          background: "linear-gradient(90deg, #5D4037 0%, #8B4513 30%, #A0522D 50%, #8B4513 70%, #5D4037 100%)",
          boxShadow: "0 3px 8px rgba(0,0,0,0.3)",
        }}
      />
      {/* Tag hanging */}
      <div className="absolute top-[12px] left-1/2 -translate-x-1/2 w-[3px] h-[8px] bg-[#8B0000]/60" />
      {/* Tag */}
      <div className="absolute bottom-0 left-[12px] right-[12px] h-[28px] rounded-b-[2px]"
        style={{
          background: "linear-gradient(180deg, #1a1320 0%, #0f0a12 100%)",
          border: "1.5px solid rgba(180,140,50,0.3)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        {[30, 50, 70].map((y) => (
          <div key={y} className="absolute left-[15%] right-[15%] h-px bg-amber-400/15"
            style={{ top: `${y}%` }}
          />
        ))}
      </div>
    </div>
  );
}

const VISUAL_MAP: Record<VisualType, () => React.ReactNode> = {
  throne: ThroneVisual,
  table: TableVisual,
  chest: ChestVisual,
  book: BookVisual,
  incense: IncenseVisual,
  candle: CandleVisual,
  vase: VaseVisual,
  drum: DrumVisual,
  bonsai: BonsaiVisual,
  gong: GongVisual,
  scroll: ScrollVisual,
  screen: ScreenVisual,
  fan: FanVisual,
  mirror: MirrorVisual,
  tapestry: TapestryVisual,
  "stone-tablet": StoneTabletVisual,
  mask: MaskVisual,
  "wall-lantern": WallLanternVisual,
  "pillar-plate": PillarPlateVisual,
  "beam-tag": BeamTagVisual,
};

/* Size in viewport-% for each visual type (for connection line math) */
const VISUAL_SIZE: Record<VisualType, { w: number; h: number }> = {
  throne: { w: 7, h: 8 },
  table: { w: 5.5, h: 3.5 },
  chest: { w: 6, h: 4.5 },
  book: { w: 5.5, h: 6.5 },
  incense: { w: 4.5, h: 5 },
  candle: { w: 3, h: 7 },
  vase: { w: 3.5, h: 6 },
  drum: { w: 5, h: 4 },
  bonsai: { w: 4.5, h: 5.5 },
  gong: { w: 5, h: 5 },
  scroll: { w: 5, h: 9 },
  screen: { w: 8, h: 8 },
  fan: { w: 6, h: 5.5 },
  mirror: { w: 4, h: 5 },
  tapestry: { w: 4.5, h: 6 },
  "stone-tablet": { w: 4, h: 5.5 },
  mask: { w: 3.5, h: 4.5 },
  "wall-lantern": { w: 3, h: 4.5 },
  "pillar-plate": { w: 5, h: 6 },
  "beam-tag": { w: 4.5, h: 2.5 },
};

/* ══════════════════════════════════════════════════════════════
   Structure = Visual object + keyword + depth scaling
   ══════════════════════════════════════════════════════════════ */

function StructureNode({
  item,
  isActive,
  onClick,
}: {
  item: RoomStructure;
  isActive: boolean;
  onClick: (e: React.MouseEvent) => void;
}) {
  const Visual = VISUAL_MAP[item.visualType];
  const depthScale = Math.min(
    1.15,
    Math.max(0.55, 0.5 + (item.position.y / 100) * 0.7)
  );

  return (
    <motion.button
      className="absolute z-20 flex flex-col items-center gap-1 cursor-pointer group"
      style={{
        left: `${item.position.x}%`,
        top: `${item.position.y}%`,
        transform: `translate(-50%, -50%) scale(${depthScale})`,
      }}
      onClick={onClick}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 + Math.random() * 0.5, duration: 0.6 }}
      whileHover={{ scale: depthScale * 1.08, y: -3 }}
      whileTap={{ scale: depthScale * 0.96 }}
    >
      {/* Active glow */}
      {isActive && (
        <motion.div
          className="absolute -inset-4 rounded-2xl pointer-events-none"
          style={{ boxShadow: "0 0 24px 8px rgba(241,196,15,0.25)" }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Visual object */}
      <div
        className={`transition-all duration-300 ${
          isActive ? "brightness-125" : "group-hover:brightness-110"
        }`}
      >
        <Visual />
      </div>

      {/* Keyword label */}
      <span
        className={`text-[11px] font-bold px-2 py-0.5 rounded whitespace-nowrap transition-colors ${
          isActive
            ? "text-amber-200 bg-amber-500/25 border border-amber-400/40"
            : "text-white/70 bg-black/40 border border-white/10 group-hover:text-amber-200"
        }`}
      >
        {item.keyword}
      </span>
    </motion.button>
  );
}

/* ══════════════════════════════════════════════════════════════
   Speech Bubble — attached to structure, with bullet highlight
   ══════════════════════════════════════════════════════════════ */

function SpeechBubble({
  item,
  activeBulletIdx,
}: {
  item: RoomStructure;
  activeBulletIdx: number | null;
}) {
  const isLeftHalf = item.position.x < 50;

  return (
    <motion.div
      className="absolute z-40 pointer-events-auto"
      style={{
        top: `${item.position.y}%`,
        ...(isLeftHalf
          ? { left: `${item.position.x + 7}%` }
          : { right: `${100 - item.position.x + 7}%` }),
        transform: "translateY(-50%)",
        width: "min(340px, 32vw)",
      }}
      initial={{ opacity: 0, scale: 0.92, x: isLeftHalf ? -10 : 10 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.92, x: isLeftHalf ? -10 : 10 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Arrow */}
      <div
        className="absolute top-1/2 -translate-y-1/2"
        style={{
          [isLeftHalf ? "left" : "right"]: "-7px",
          width: 0,
          height: 0,
          borderTop: "8px solid transparent",
          borderBottom: "8px solid transparent",
          [isLeftHalf ? "borderRight" : "borderLeft"]:
            "8px solid rgba(180,140,50,0.3)",
        }}
      />

      <div
        className="rounded-xl border border-amber-400/25 overflow-hidden"
        style={{
          background: "rgba(10,8,15,0.9)",
          backdropFilter: "blur(16px)",
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-white/8">
          <span className="text-sm font-bold text-amber-300">
            {item.keyword}
          </span>
          {item.group && (
            <span className="text-[10px] text-white/30">
              ({item.group})
            </span>
          )}
        </div>

        {/* Bullets */}
        <div className="px-4 py-3 space-y-2 max-h-[35vh] overflow-y-auto">
          {item.bullets.map((b, idx) => {
            const isHighlighted = activeBulletIdx === idx;
            return (
              <div
                key={b.keyword}
                className={`transition-all duration-300 rounded-md px-2 py-1 -mx-2 ${
                  isHighlighted
                    ? "bg-amber-500/10 border-l-2 border-amber-400"
                    : "border-l-2 border-transparent"
                }`}
                data-bullet-idx={idx}
              >
                <span
                  className={`text-xs font-semibold ${
                    isHighlighted ? "text-amber-300" : "text-amber-200/90"
                  }`}
                >
                  {b.keyword}
                </span>
                <p
                  className={`mt-0.5 leading-relaxed ${
                    isHighlighted ? "text-white/90" : "text-white/75"
                  }`}
                  style={{ fontSize: "13px" }}
                >
                  {b.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Connection Lines — SVG overlay linking bullets to anchors
   ══════════════════════════════════════════════════════════════ */

function ConnectionLines({
  item,
  activeBulletIdx,
}: {
  item: RoomStructure;
  activeBulletIdx: number | null;
}) {
  if (activeBulletIdx === null) return null;

  const isLeftHalf = item.position.x < 50;
  const size = VISUAL_SIZE[item.visualType];
  const b = item.bullets[activeBulletIdx];
  if (!b) return null;

  // Bubble position (7% offset from structure)
  const bubbleX = isLeftHalf
    ? item.position.x + 7
    : item.position.x - 7;

  // Estimate bullet Y in the bubble
  const bulletCount = item.bullets.length;
  const bulletHeightPct = 3;
  const headerHeightPct = 2.5;
  const totalBubbleHeight = headerHeightPct + bulletCount * bulletHeightPct;
  const bubbleTopY = item.position.y - totalBubbleHeight / 2;
  const bulletY =
    bubbleTopY +
    headerHeightPct +
    activeBulletIdx * bulletHeightPct +
    bulletHeightPct / 2;

  // Anchor point on structure
  const anchorX =
    item.position.x + ((b.anchor.x - 50) / 100) * size.w;
  const anchorY =
    item.position.y + ((b.anchor.y - 50) / 100) * size.h;

  return (
    <svg
      className="absolute inset-0 w-full h-full z-30 pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <motion.line
        x1={bubbleX}
        y1={bulletY}
        x2={anchorX}
        y2={anchorY}
        stroke="rgba(212,172,13,0.4)"
        strokeWidth="0.15"
        strokeDasharray="0.5 0.3"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
   Group Labels — subtle, blending with wall texture
   ══════════════════════════════════════════════════════════════ */

function GroupLabels({ structures }: { structures: RoomStructure[] }) {
  const groups = useMemo(() => {
    const map = new Map<
      string,
      { minX: number; maxX: number; minY: number }
    >();
    structures.forEach((s) => {
      if (!s.group) return;
      const g = map.get(s.group) || { minX: 100, maxX: 0, minY: 100 };
      g.minX = Math.min(g.minX, s.position.x);
      g.maxX = Math.max(g.maxX, s.position.x);
      g.minY = Math.min(g.minY, s.position.y);
      map.set(s.group, g);
    });
    return map;
  }, [structures]);

  return (
    <>
      {Array.from(groups.entries()).map(([label, g]) => (
        <div
          key={label}
          className="absolute z-10 pointer-events-none"
          style={{
            left: `${(g.minX + g.maxX) / 2}%`,
            top: `${g.minY - 7}%`,
            transform: "translateX(-50%)",
          }}
        >
          <span className="text-[10px] text-white/20 font-medium tracking-wider uppercase px-2 py-0.5 rounded bg-white/[0.02] border border-white/[0.03]">
            {label}
          </span>
        </div>
      ))}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   Scene Background — 3D perspective room (CSS 2.5D)
   ══════════════════════════════════════════════════════════════ */

function SceneBackground() {
  return (
    <>
      {/* Base gradient fill */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #080610 0%, #0f0a12 20%, #1a1320 50%, #281915 80%, #12100e 100%)",
        }}
      />

      {/* Back wall */}
      <div
        className="absolute z-[5]"
        style={{
          top: "20%",
          left: "18%",
          right: "18%",
          bottom: "45%",
          background:
            "linear-gradient(180deg, #1a1320 0%, #150e18 60%, #100a10 100%)",
        }}
      >
        {[20, 40, 60, 80].map((x) => (
          <div
            key={x}
            className="absolute top-0 bottom-0 w-px"
            style={{
              left: `${x}%`,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
            }}
          />
        ))}
      </div>

      {/* Left wall — trapezoid */}
      <div
        className="absolute inset-0 z-[4]"
        style={{
          clipPath: "polygon(0% 8%, 18% 20%, 18% 55%, 0% 80%)",
          background: "linear-gradient(135deg, #1e1520 0%, #15101a 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "repeating-linear-gradient(95deg, transparent, transparent 18px, rgba(255,255,255,0.015) 18px, rgba(255,255,255,0.015) 19px)",
          }}
        />
      </div>

      {/* Right wall — trapezoid mirror */}
      <div
        className="absolute inset-0 z-[4]"
        style={{
          clipPath: "polygon(100% 8%, 82% 20%, 82% 55%, 100% 80%)",
          background: "linear-gradient(225deg, #1e1520 0%, #15101a 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "repeating-linear-gradient(85deg, transparent, transparent 18px, rgba(255,255,255,0.015) 18px, rgba(255,255,255,0.015) 19px)",
          }}
        />
      </div>

      {/* Ceiling — trapezoid */}
      <div
        className="absolute inset-0 z-[4]"
        style={{
          clipPath: "polygon(0% 8%, 100% 8%, 82% 20%, 18% 20%)",
          background: "#0f0a12",
        }}
      >
        {/* Rafter pattern */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(180,140,50,0.15) 30px, rgba(180,140,50,0.15) 31px)",
          }}
        />
      </div>

      {/* Floor — trapezoid */}
      <div
        className="absolute inset-0 z-[3]"
        style={{
          clipPath: "polygon(0% 80%, 100% 80%, 82% 55%, 18% 55%)",
          background: "linear-gradient(180deg, #281915 0%, #3c2820 100%)",
        }}
      >
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.08]"
          viewBox="0 0 1000 500"
          preserveAspectRatio="none"
        >
          {[-200, 0, 150, 300, 420, 500, 580, 700, 850, 1000, 1200].map(
            (x) => (
              <line
                key={x}
                x1={x}
                y1="500"
                x2="500"
                y2="0"
                stroke="white"
                strokeWidth="1"
              />
            )
          )}
          {[100, 200, 300, 400].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="1000"
              y2={y}
              stroke="white"
              strokeWidth="0.5"
              opacity={0.3 + (y / 500) * 0.5}
            />
          ))}
        </svg>
      </div>

      {/* Dancheong border at ceiling-backwall junction */}
      <div
        className="absolute z-[6]"
        style={{
          top: "19.7%",
          left: "18%",
          right: "18%",
          height: "3px",
          background:
            "repeating-linear-gradient(90deg, #C0392B 0 16px, #1A5276 16px 32px, #27AE60 32px 48px, #F1C40F 48px 64px, #FFFFFF 64px 68px)",
          opacity: 0.6,
        }}
      />

      {/* Traditional roof silhouette at very top */}
      <svg
        className="absolute top-0 left-0 w-full h-[10%] z-10"
        viewBox="0 0 1200 100"
        preserveAspectRatio="none"
      >
        <path
          d="M-20 100 L80 55 L200 30 L400 12 L600 5 L800 12 L1000 30 L1120 55 L1220 100"
          fill="#0f0a12"
          stroke="rgba(180,140,50,0.35)"
          strokeWidth="2"
        />
        <path
          d="M60 100 L140 60 L280 35 L500 18 L600 14 L700 18 L920 35 L1060 60 L1140 100"
          fill="none"
          stroke="rgba(180,140,50,0.15)"
          strokeWidth="1.5"
        />
      </svg>

      {/* Ilwolobongdo painting on back wall center */}
      <div
        className="absolute z-[6] overflow-hidden rounded-sm"
        style={{
          top: "22%",
          left: "38%",
          right: "38%",
          height: "14%",
          border: "2px solid rgba(180,140,50,0.35)",
          background:
            "linear-gradient(180deg, #0e1a30 0%, #0a1525 40%, #1a4030 70%, #0e2818 100%)",
        }}
      >
        <div
          className="absolute top-[18%] left-[22%] w-5 h-5 rounded-full"
          style={{
            background: "radial-gradient(circle, #F39C12, #E74C3C)",
            boxShadow: "0 0 12px rgba(243,156,18,0.4)",
          }}
        />
        <div
          className="absolute top-[18%] right-[22%] w-4 h-4 rounded-full"
          style={{
            background: "radial-gradient(circle, #ECF0F1, #95A5A6)",
            boxShadow: "0 0 10px rgba(236,240,241,0.2)",
          }}
        />
        <svg
          viewBox="0 0 300 80"
          className="absolute bottom-0 left-0 right-0 h-[55%]"
          preserveAspectRatio="none"
        >
          <path
            d="M0 80 L50 25 L100 55 L150 10 L200 55 L250 25 L300 80 Z"
            fill="rgba(20,60,40,0.7)"
          />
        </svg>
      </div>

      {/* Red pillars at wall-backwall edges */}
      <Pillar side="left" />
      <Pillar side="right" />

      {/* Warm ambient glow */}
      <div
        className="absolute inset-0 z-[8] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 45% at 50% 42%, rgba(200,150,50,0.07) 0%, transparent 70%)",
        }}
      />

      {/* Noise texture */}
      <div
        className="absolute inset-0 z-[9] pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        }}
      />
    </>
  );
}

function Pillar({ side }: { side: "left" | "right" }) {
  const isLeft = side === "left";
  return (
    <div
      className="absolute z-[7]"
      style={{
        top: "18%",
        bottom: "43%",
        [isLeft ? "left" : "right"]: "16%",
        width: "3%",
        background:
          "linear-gradient(90deg, #5a1515 0%, #b93030 35%, #c94040 50%, #b93030 65%, #5a1515 100%)",
        boxShadow: `${isLeft ? "4" : "-4"}px 0 25px rgba(0,0,0,0.6)`,
        borderRadius: "3px",
      }}
    >
      <div
        className="absolute top-0 left-[-4px] right-[-4px] h-[10px] rounded-t-sm"
        style={{
          background: "linear-gradient(180deg, #d4ac0d 0%, #8a7008 100%)",
        }}
      />
      <div
        className="absolute bottom-0 left-[-4px] right-[-4px] h-[8px]"
        style={{
          background: "linear-gradient(180deg, #8a7008 0%, #d4ac0d 100%)",
        }}
      />
    </div>
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
  const [activeBulletIdx, setActiveBulletIdx] = useState<number | null>(
    null
  );
  const [isNarrating, setIsNarrating] = useState(false);
  const narrationRef = useRef<{ cancel: boolean }>({ cancel: false });

  const activeItem = room.structures.find((s) => s.id === activeId);

  /* ── Narrator: walks through structures AND bullets ──────── */

  const startNarration = useCallback(() => {
    if (isNarrating) {
      narrationRef.current.cancel = true;
      window.speechSynthesis.cancel();
      setIsNarrating(false);
      setActiveId(null);
      setActiveBulletIdx(null);
      return;
    }

    setIsNarrating(true);
    narrationRef.current = { cancel: false };

    function narrateBullet(structIdx: number, bulletIdx: number) {
      if (narrationRef.current.cancel) {
        setIsNarrating(false);
        setActiveId(null);
        setActiveBulletIdx(null);
        return;
      }

      const s = room.structures[structIdx];
      if (!s) {
        setIsNarrating(false);
        setActiveId(null);
        setActiveBulletIdx(null);
        return;
      }

      const b = s.bullets[bulletIdx];
      if (!b) {
        // Done with this structure, move to next after pause
        setTimeout(() => narrateBullet(structIdx + 1, 0), 400);
        return;
      }

      setActiveId(s.id);
      setActiveBulletIdx(bulletIdx);

      const text = `${b.keyword}. ${b.text}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ko-KR";
      utterance.rate = 0.9;
      utterance.onend = () => {
        if (!narrationRef.current.cancel) {
          narrateBullet(structIdx, bulletIdx + 1);
        }
      };
      utterance.onerror = () => {
        if (!narrationRef.current.cancel) {
          setTimeout(() => narrateBullet(structIdx, bulletIdx + 1), 300);
        }
      };
      window.speechSynthesis.speak(utterance);
    }

    narrateBullet(0, 0);
  }, [isNarrating, room.structures]);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }, []);

  return (
    <div
      className="fixed inset-0 w-screen h-screen overflow-hidden select-none"
      onClick={() => {
        if (!isNarrating) {
          setActiveId(null);
          setActiveBulletIdx(null);
        }
      }}
    >
      <SceneBackground />
      <GroupLabels structures={room.structures} />

      {/* Structures */}
      {room.structures.map((s) => (
        <StructureNode
          key={s.id}
          item={s}
          isActive={activeId === s.id}
          onClick={(e) => {
            e.stopPropagation();
            if (!isNarrating) {
              if (activeId === s.id) {
                setActiveId(null);
                setActiveBulletIdx(null);
              } else {
                setActiveId(s.id);
                setActiveBulletIdx(null);
              }
            }
          }}
        />
      ))}

      {/* Connection lines SVG overlay */}
      <AnimatePresence>
        {activeItem && activeBulletIdx !== null && (
          <ConnectionLines
            key={`lines-${activeItem.id}-${activeBulletIdx}`}
            item={activeItem}
            activeBulletIdx={activeBulletIdx}
          />
        )}
      </AnimatePresence>

      {/* Speech bubble */}
      <AnimatePresence>
        {activeItem && (
          <SpeechBubble
            key={activeItem.id}
            item={activeItem}
            activeBulletIdx={activeBulletIdx}
          />
        )}
      </AnimatePresence>

      {/* UI — header */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-50 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-3">
          {onBack && (
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onBack();
              }}
              className="p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5 text-white/70" />
            </motion.button>
          )}
          <div className="px-4 py-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/10">
            <p className="text-[10px] text-amber-400/60 font-medium tracking-wider uppercase">
              {room.subtitle}
            </p>
            <h1 className="text-base font-bold text-white/90">
              {room.title}
            </h1>
          </div>
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              startNarration();
            }}
            className={`p-2.5 rounded-full backdrop-blur-md border transition-colors ${
              isNarrating
                ? "bg-amber-500/30 border-amber-400/40 text-amber-300"
                : "bg-black/40 border-white/10 text-white/70 hover:bg-white/10"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={isNarrating ? "중지" : "학습 시작"}
          >
            {isNarrating ? (
              <Square className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </motion.button>
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            className="p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Maximize2 className="w-5 h-5 text-white/70" />
          </motion.button>
        </div>
      </div>

      {/* Bottom hint */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <p className="text-[11px] text-white/25 px-5 py-2 rounded-full bg-black/30 backdrop-blur-md border border-white/5">
          {isNarrating
            ? "나레이터가 교과서 순서대로 읽고 있습니다..."
            : "구조물을 클릭하거나 ▶ 학습 시작을 눌러보세요"}
        </p>
      </motion.div>
    </div>
  );
}
