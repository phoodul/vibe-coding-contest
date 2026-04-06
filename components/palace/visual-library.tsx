"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";

export type VisualType =
  | "throne"
  | "table"
  | "chest"
  | "book"
  | "incense"
  | "candle"
  | "vase"
  | "drum"
  | "bonsai"
  | "gong"
  | "scroll"
  | "screen"
  | "fan"
  | "mirror"
  | "tapestry"
  | "stone-tablet"
  | "mask"
  | "wall-lantern"
  | "pillar-plate"
  | "beam-tag";

/* ─── Helpers ─── */

function FloorShadow() {
  return (
    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[80%] h-[6px] rounded-full bg-black/30 blur-sm" />
  );
}

function WallBracket() {
  return (
    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-[4px] h-[8px] bg-amber-700 rounded-b-sm" />
  );
}

/* ═══════════════════════════════════════════════════════════════
   Floor Objects (1-10)
   ═══════════════════════════════════════════════════════════════ */

/* 1. Throne (어좌) */
function ThroneVisual() {
  return (
    <div className="relative w-[140px] h-[160px]">
      {/* Back panel - dome */}
      <div
        className="absolute top-0 left-[15px] right-[15px] h-[70px] rounded-t-[50%]"
        style={{
          background: "linear-gradient(180deg, #f1c40f 0%, #d4ac0d 60%, #b8960b 100%)",
          border: "2px solid rgba(241,196,15,0.5)",
          boxShadow: "0 0 20px rgba(241,196,15,0.25)",
        }}
      >
        {/* Inner ornate border */}
        <div className="absolute inset-[6px] rounded-t-[50%] border border-amber-300/30" />
      </div>
      {/* Back panel straight section */}
      <div
        className="absolute top-[55px] left-[15px] right-[15px] h-[30px]"
        style={{ background: "linear-gradient(180deg, #b8960b 0%, #9a7d0a 100%)" }}
      />
      {/* Armrests */}
      <div className="absolute top-[70px] left-[2px] w-[20px] h-[12px] rounded-[3px]"
        style={{ background: "linear-gradient(90deg, #d4ac0d, #b8960b)" }} />
      <div className="absolute top-[70px] right-[2px] w-[20px] h-[12px] rounded-[3px]"
        style={{ background: "linear-gradient(270deg, #d4ac0d, #b8960b)" }} />
      {/* Seat cushion */}
      <div
        className="absolute top-[82px] left-[10px] right-[10px] h-[22px] rounded-[4px]"
        style={{
          background: "linear-gradient(180deg, #C0392B 0%, #8B0000 100%)",
          boxShadow: "inset 0 2px 4px rgba(255,255,255,0.15)",
        }}
      />
      {/* Legs */}
      <div className="absolute top-[104px] left-[18px] w-[8px] h-[40px] rounded-b-[2px]"
        style={{ background: "linear-gradient(180deg, #b8960b, #8B6914)" }} />
      <div className="absolute top-[104px] right-[18px] w-[8px] h-[40px] rounded-b-[2px]"
        style={{ background: "linear-gradient(180deg, #b8960b, #8B6914)" }} />
      {/* Cross bar */}
      <div className="absolute top-[124px] left-[22px] right-[22px] h-[4px]"
        style={{ background: "#9a7d0a" }} />
      <FloorShadow />
    </div>
  );
}

/* 2. Table (탁자) */
function TableVisual() {
  return (
    <div className="relative w-[120px] h-[80px]">
      {/* Table top */}
      <div
        className="absolute top-[20px] left-0 right-0 h-[14px] rounded-[3px]"
        style={{
          background: "linear-gradient(180deg, #5D4037 0%, #3E2723 100%)",
          boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
        }}
      />
      {/* Scroll on table */}
      <div className="absolute top-[12px] left-[35px] w-[50px] h-[10px] rounded-full"
        style={{ background: "linear-gradient(90deg, #D2B48C, #F5DEB3, #D2B48C)" }} />
      {/* Legs - curved */}
      <div className="absolute top-[34px] left-[12px] w-[10px] h-[34px] rounded-b-[6px]"
        style={{ background: "linear-gradient(180deg, #3E2723, #2a1a12)" }} />
      <div className="absolute top-[34px] right-[12px] w-[10px] h-[34px] rounded-b-[6px]"
        style={{ background: "linear-gradient(180deg, #3E2723, #2a1a12)" }} />
      {/* Stretcher */}
      <div className="absolute top-[50px] left-[18px] right-[18px] h-[3px] rounded-full"
        style={{ background: "#4a3228" }} />
      <FloorShadow />
    </div>
  );
}

/* 3. Chest (궤) */
function ChestVisual() {
  return (
    <div className="relative w-[130px] h-[95px]">
      {/* Lid */}
      <div
        className="absolute top-[10px] left-[5px] right-[5px] h-[24px] rounded-t-[4px]"
        style={{
          background: "linear-gradient(180deg, #6D4C41 0%, #5D4037 100%)",
          borderTop: "2px solid #8D6E63",
        }}
      />
      {/* Body */}
      <div
        className="absolute top-[34px] left-[5px] right-[5px] h-[42px] rounded-b-[3px]"
        style={{
          background: "linear-gradient(180deg, #4E342E 0%, #3E2723 100%)",
          boxShadow: "0 3px 8px rgba(0,0,0,0.5)",
        }}
      />
      {/* Brass lock plate */}
      <div className="absolute top-[38px] left-1/2 -translate-x-1/2 w-[18px] h-[14px] rounded-[2px]"
        style={{ background: "linear-gradient(180deg, #d4ac0d, #b8960b)", boxShadow: "0 0 4px rgba(212,172,13,0.4)" }} />
      {/* Keyhole */}
      <div className="absolute top-[42px] left-1/2 -translate-x-1/2 w-[4px] h-[6px] rounded-full bg-black/60" />
      {/* Corner brackets */}
      <div className="absolute top-[10px] left-[5px] w-[10px] h-[10px] border-t-2 border-l-2 border-amber-600/60 rounded-tl-[3px]" />
      <div className="absolute top-[10px] right-[5px] w-[10px] h-[10px] border-t-2 border-r-2 border-amber-600/60 rounded-tr-[3px]" />
      <div className="absolute bottom-[19px] left-[5px] w-[10px] h-[10px] border-b-2 border-l-2 border-amber-600/60 rounded-bl-[3px]" />
      <div className="absolute bottom-[19px] right-[5px] w-[10px] h-[10px] border-b-2 border-r-2 border-amber-600/60 rounded-br-[3px]" />
      {/* Feet */}
      <div className="absolute bottom-[10px] left-[12px] w-[14px] h-[8px] rounded-b-[3px]"
        style={{ background: "#3E2723" }} />
      <div className="absolute bottom-[10px] right-[12px] w-[14px] h-[8px] rounded-b-[3px]"
        style={{ background: "#3E2723" }} />
      <FloorShadow />
    </div>
  );
}

/* 4. Book (책) */
function BookVisual() {
  return (
    <div className="relative w-[110px] h-[130px]">
      {/* Pages (visible from side) */}
      <div
        className="absolute top-[15px] left-[28px] w-[68px] h-[100px] rounded-r-[3px]"
        style={{ background: "linear-gradient(90deg, #F5F0E0, #FFF8E7)" }}
      />
      {/* Cover - front */}
      <div
        className="absolute top-[12px] left-[22px] w-[72px] h-[106px] rounded-[3px]"
        style={{
          background: "linear-gradient(135deg, #8B0000 0%, #6B0000 100%)",
          boxShadow: "3px 3px 8px rgba(0,0,0,0.4)",
        }}
      />
      {/* Spine */}
      <div
        className="absolute top-[12px] left-[18px] w-[10px] h-[106px] rounded-l-[2px]"
        style={{ background: "linear-gradient(90deg, #5a0000, #7a0000)" }}
      />
      {/* Gold spine lines */}
      <div className="absolute top-[25px] left-[19px] w-[8px] h-[1px] bg-amber-400/60" />
      <div className="absolute top-[30px] left-[19px] w-[8px] h-[1px] bg-amber-400/60" />
      <div className="absolute top-[100px] left-[19px] w-[8px] h-[1px] bg-amber-400/60" />
      <div className="absolute top-[105px] left-[19px] w-[8px] h-[1px] bg-amber-400/60" />
      {/* Cover decoration - center diamond */}
      <div className="absolute top-[50px] left-[46px] w-[16px] h-[16px] rotate-45 border border-amber-400/50" />
      <div className="absolute top-[53px] left-[49px] w-[10px] h-[10px] rotate-45 border border-amber-400/30" />
      {/* Title area */}
      <div className="absolute top-[35px] left-[38px] w-[40px] h-[2px] bg-amber-400/40 rounded-full" />
      <div className="absolute top-[40px] left-[42px] w-[32px] h-[2px] bg-amber-400/30 rounded-full" />
      <FloorShadow />
    </div>
  );
}

/* 5. Incense (향로) — animated smoke */
function IncenseVisual() {
  return (
    <div className="relative w-[90px] h-[110px]">
      {/* Smoke wisps */}
      <motion.div
        className="absolute top-[2px] left-1/2 -translate-x-1/2 w-[3px] h-[20px] rounded-full"
        style={{ background: "linear-gradient(0deg, rgba(180,180,180,0.5), transparent)" }}
        animate={{ y: [-2, -10], opacity: [0.6, 0], x: [0, 4] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
      />
      <motion.div
        className="absolute top-[5px] left-[38px] w-[2px] h-[16px] rounded-full"
        style={{ background: "linear-gradient(0deg, rgba(180,180,180,0.4), transparent)" }}
        animate={{ y: [-1, -12], opacity: [0.5, 0], x: [0, -3] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
      />
      <motion.div
        className="absolute top-[3px] left-[52px] w-[2px] h-[14px] rounded-full"
        style={{ background: "linear-gradient(0deg, rgba(180,180,180,0.35), transparent)" }}
        animate={{ y: [0, -8], opacity: [0.4, 0], x: [0, 2] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 1 }}
      />
      {/* Gold rim */}
      <div
        className="absolute top-[24px] left-[12px] right-[12px] h-[6px] rounded-[2px]"
        style={{ background: "linear-gradient(180deg, #f1c40f, #d4ac0d)" }}
      />
      {/* Bowl */}
      <div
        className="absolute top-[28px] left-[14px] right-[14px] h-[32px] rounded-b-[50%]"
        style={{
          background: "linear-gradient(180deg, #5D4037 0%, #3E2723 80%)",
          boxShadow: "0 4px 8px rgba(0,0,0,0.4)",
        }}
      />
      {/* Bowl pattern */}
      <div className="absolute top-[38px] left-[20px] right-[20px] h-[1px] bg-amber-600/40" />
      <div className="absolute top-[44px] left-[22px] right-[22px] h-[1px] bg-amber-600/30" />
      {/* Stem */}
      <div
        className="absolute top-[58px] left-1/2 -translate-x-1/2 w-[10px] h-[16px]"
        style={{ background: "linear-gradient(180deg, #3E2723, #5D4037)" }}
      />
      {/* Base */}
      <div
        className="absolute top-[72px] left-[22px] right-[22px] h-[10px] rounded-b-[4px]"
        style={{ background: "linear-gradient(180deg, #5D4037, #4E342E)" }}
      />
      <FloorShadow />
    </div>
  );
}

/* 6. Candle (촛대) — animated flame */
function CandleVisual() {
  return (
    <div className="relative w-[65px] h-[145px]">
      {/* Flame outer glow */}
      <motion.div
        className="absolute top-[4px] left-1/2 -translate-x-1/2 w-[16px] h-[24px] rounded-full"
        style={{ background: "radial-gradient(ellipse, rgba(255,200,50,0.3), transparent 70%)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      />
      {/* Flame */}
      <motion.div
        className="absolute top-[8px] left-1/2 -translate-x-1/2 w-[8px] h-[18px]"
        style={{
          background: "linear-gradient(0deg, #ff6600 0%, #ffcc00 50%, #fff8dc 90%)",
          borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
          filter: "blur(0.5px)",
        }}
        animate={{ scaleX: [1, 0.85, 1.1, 0.9, 1], scaleY: [1, 1.08, 0.95, 1.05, 1] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      />
      {/* Wick */}
      <div className="absolute top-[24px] left-1/2 -translate-x-1/2 w-[2px] h-[6px] bg-gray-800 rounded-full" />
      {/* Wax body */}
      <div
        className="absolute top-[28px] left-1/2 -translate-x-1/2 w-[16px] h-[50px] rounded-[2px]"
        style={{
          background: "linear-gradient(180deg, #FFF8DC 0%, #F5E6C8 100%)",
          boxShadow: "1px 1px 4px rgba(0,0,0,0.2)",
        }}
      />
      {/* Drip */}
      <div className="absolute top-[28px] left-[30px] w-[4px] h-[8px] rounded-b-full bg-[#F5E6C8]" />
      {/* Candle holder plate */}
      <div
        className="absolute top-[76px] left-1/2 -translate-x-1/2 w-[28px] h-[6px] rounded-[2px]"
        style={{ background: "linear-gradient(180deg, #f1c40f, #d4ac0d)" }}
      />
      {/* Stand stem */}
      <div
        className="absolute top-[82px] left-1/2 -translate-x-1/2 w-[8px] h-[34px]"
        style={{ background: "linear-gradient(180deg, #d4ac0d, #b8960b)" }}
      />
      {/* Base - trapezoid */}
      <div
        className="absolute top-[114px] left-1/2 -translate-x-1/2 w-[36px] h-[10px] rounded-[2px]"
        style={{
          background: "linear-gradient(180deg, #d4ac0d, #9a7d0a)",
          clipPath: "polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)",
        }}
      />
      <FloorShadow />
    </div>
  );
}

/* 7. Vase (항아리) */
function VaseVisual() {
  return (
    <div className="relative w-[90px] h-[130px]">
      {/* Neck */}
      <div
        className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[22px] h-[18px] rounded-t-[4px]"
        style={{ background: "linear-gradient(180deg, #E8F0F8, #B0C4D8)" }}
      />
      {/* Lip */}
      <div
        className="absolute top-[8px] left-1/2 -translate-x-1/2 w-[28px] h-[6px] rounded-[3px]"
        style={{ background: "linear-gradient(180deg, #D0D8E0, #B0C4D8)" }}
      />
      {/* Body */}
      <div
        className="absolute top-[26px] left-[10px] right-[10px] h-[72px] rounded-[50%]"
        style={{
          background: "linear-gradient(135deg, #E8F0F8 0%, #C8D8E8 40%, #A0B8C8 100%)",
          boxShadow: "3px 4px 10px rgba(0,0,0,0.3)",
        }}
      />
      {/* Blue pattern - curved stroke */}
      <div
        className="absolute top-[42px] left-[18px] right-[18px] h-[28px] rounded-[50%] border-2 border-transparent"
        style={{ borderColor: "rgba(30, 80, 140, 0.35)" }}
      />
      {/* Blue swirl detail */}
      <div className="absolute top-[50px] left-[28px] w-[14px] h-[14px] rounded-full border border-[rgba(30,80,140,0.3)]" />
      <div className="absolute top-[48px] left-[48px] w-[10px] h-[10px] rounded-full border border-[rgba(30,80,140,0.25)]" />
      {/* Foot */}
      <div
        className="absolute top-[92px] left-1/2 -translate-x-1/2 w-[30px] h-[10px] rounded-b-[4px]"
        style={{ background: "linear-gradient(180deg, #B0C4D8, #90A4B8)" }}
      />
      <FloorShadow />
    </div>
  );
}

/* 8. Drum (북) */
function DrumVisual() {
  return (
    <div className="relative w-[110px] h-[100px]">
      {/* Drum body */}
      <div
        className="absolute top-[12px] left-[12px] right-[12px] h-[56px] rounded-[6px]"
        style={{
          background: "linear-gradient(180deg, #C0392B 0%, #8B0000 100%)",
          boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
        }}
      />
      {/* Top leather */}
      <div
        className="absolute top-[8px] left-[8px] right-[8px] h-[10px] rounded-t-[6px]"
        style={{ background: "linear-gradient(180deg, #D2B48C, #C8A882)" }}
      />
      {/* Bottom rim */}
      <div
        className="absolute top-[62px] left-[8px] right-[8px] h-[8px] rounded-b-[6px]"
        style={{ background: "linear-gradient(180deg, #C8A882, #B8986E)" }}
      />
      {/* Gold studs top */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div
          key={`st-${i}`}
          className="absolute w-[4px] h-[4px] rounded-full"
          style={{
            background: "radial-gradient(#f1c40f, #b8960b)",
            top: "12px",
            left: `${16 + i * 10}px`,
          }}
        />
      ))}
      {/* Gold studs bottom */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div
          key={`sb-${i}`}
          className="absolute w-[4px] h-[4px] rounded-full"
          style={{
            background: "radial-gradient(#f1c40f, #b8960b)",
            top: "62px",
            left: `${16 + i * 10}px`,
          }}
        />
      ))}
      {/* Band detail */}
      <div className="absolute top-[35px] left-[14px] right-[14px] h-[2px] bg-amber-600/40" />
      {/* Stand legs */}
      <div className="absolute top-[70px] left-[20px] w-[8px] h-[16px] rounded-b-[3px]"
        style={{ background: "linear-gradient(180deg, #5D4037, #3E2723)" }} />
      <div className="absolute top-[70px] right-[20px] w-[8px] h-[16px] rounded-b-[3px]"
        style={{ background: "linear-gradient(180deg, #5D4037, #3E2723)" }} />
      <FloorShadow />
    </div>
  );
}

/* 9. Bonsai (분재) */
function BonsaiVisual() {
  return (
    <div className="relative w-[100px] h-[120px]">
      {/* Foliage clusters */}
      <div
        className="absolute top-[6px] left-[28px] w-[32px] h-[24px] rounded-full"
        style={{ background: "radial-gradient(ellipse, #2E7D32, #1B5E20)", boxShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
      />
      <div
        className="absolute top-[14px] left-[12px] w-[26px] h-[20px] rounded-full"
        style={{ background: "radial-gradient(ellipse, #388E3C, #2E7D32)" }}
      />
      <div
        className="absolute top-[16px] left-[54px] w-[24px] h-[18px] rounded-full"
        style={{ background: "radial-gradient(ellipse, #388E3C, #1B5E20)" }}
      />
      <div
        className="absolute top-[28px] left-[36px] w-[28px] h-[18px] rounded-full"
        style={{ background: "radial-gradient(ellipse, #2E7D32, #1B5E20)" }}
      />
      {/* Trunk */}
      <div
        className="absolute top-[32px] left-[42px] w-[8px] h-[36px]"
        style={{
          background: "linear-gradient(90deg, #5D4037, #8D6E63, #5D4037)",
          borderRadius: "2px",
          transform: "rotate(-3deg)",
        }}
      />
      {/* Branch left */}
      <div
        className="absolute top-[36px] left-[26px] w-[20px] h-[4px]"
        style={{
          background: "#6D4C41",
          transform: "rotate(-25deg)",
          borderRadius: "2px",
        }}
      />
      {/* Branch right */}
      <div
        className="absolute top-[38px] left-[48px] w-[18px] h-[4px]"
        style={{
          background: "#6D4C41",
          transform: "rotate(20deg)",
          borderRadius: "2px",
        }}
      />
      {/* Pot */}
      <div
        className="absolute top-[68px] left-[22px] right-[22px] h-[24px] rounded-b-[4px]"
        style={{
          background: "linear-gradient(180deg, #6D4C41 0%, #4E342E 100%)",
          boxShadow: "0 3px 6px rgba(0,0,0,0.3)",
        }}
      />
      {/* Pot rim */}
      <div
        className="absolute top-[66px] left-[18px] right-[18px] h-[6px] rounded-[2px]"
        style={{ background: "linear-gradient(180deg, #8D6E63, #6D4C41)" }}
      />
      <FloorShadow />
    </div>
  );
}

/* 10. Gong (징) */
function GongVisual() {
  return (
    <div className="relative w-[110px] h-[120px]">
      {/* Frame - left leg */}
      <div
        className="absolute top-[8px] left-[10px] w-[8px] h-[90px]"
        style={{
          background: "linear-gradient(90deg, #5D4037, #8D6E63, #5D4037)",
          transform: "rotate(8deg)",
          transformOrigin: "top center",
          borderRadius: "2px",
        }}
      />
      {/* Frame - right leg */}
      <div
        className="absolute top-[8px] right-[10px] w-[8px] h-[90px]"
        style={{
          background: "linear-gradient(90deg, #5D4037, #8D6E63, #5D4037)",
          transform: "rotate(-8deg)",
          transformOrigin: "top center",
          borderRadius: "2px",
        }}
      />
      {/* Top beam */}
      <div
        className="absolute top-[4px] left-[12px] right-[12px] h-[8px] rounded-[3px]"
        style={{ background: "linear-gradient(180deg, #8D6E63, #5D4037)" }}
      />
      {/* Rope/chain */}
      <div className="absolute top-[12px] left-[36px] w-[2px] h-[14px] bg-amber-800/60" />
      <div className="absolute top-[12px] right-[36px] w-[2px] h-[14px] bg-amber-800/60" />
      {/* Gong disc */}
      <div
        className="absolute top-[24px] left-[18px] right-[18px] h-[64px] rounded-full"
        style={{
          background: "radial-gradient(circle, #8D6E63 0%, #5D4037 40%, #3E2723 70%, #5D4037 90%)",
          boxShadow: "0 0 10px rgba(0,0,0,0.3), inset 0 0 15px rgba(0,0,0,0.2)",
        }}
      />
      {/* Concentric rings */}
      <div className="absolute top-[36px] left-[30px] right-[30px] h-[40px] rounded-full border border-amber-700/25" />
      <div className="absolute top-[42px] left-[38px] right-[38px] h-[28px] rounded-full border border-amber-700/20" />
      {/* Center boss */}
      <div
        className="absolute top-[48px] left-1/2 -translate-x-1/2 w-[14px] h-[14px] rounded-full"
        style={{ background: "radial-gradient(circle, #b8960b, #8D6E63)" }}
      />
      <FloorShadow />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Wall-mounted Objects (11-18)
   ═══════════════════════════════════════════════════════════════ */

/* 11. Scroll (족자) */
function ScrollVisual() {
  return (
    <div className="relative w-[100px] h-[170px]">
      <WallBracket />
      {/* Top rod */}
      <div
        className="absolute top-[6px] left-[4px] right-[4px] h-[8px] rounded-[3px]"
        style={{ background: "linear-gradient(180deg, #6D4C41, #5D4037)" }}
      />
      {/* Paper body */}
      <div
        className="absolute top-[14px] left-[12px] right-[12px] h-[130px]"
        style={{
          background: "linear-gradient(180deg, #FFF8E7 0%, #F5E6C8 100%)",
          boxShadow: "2px 2px 6px rgba(0,0,0,0.2)",
        }}
      />
      {/* Faint text lines */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={`tl-${i}`}
          className="absolute h-[1px] bg-gray-400/30"
          style={{ top: `${30 + i * 14}px`, left: "20px", right: "20px" }}
        />
      ))}
      {/* Red seal stamp */}
      <div className="absolute bottom-[30px] right-[20px] w-[12px] h-[12px] rounded-[2px]"
        style={{ background: "rgba(192, 57, 43, 0.7)" }} />
      {/* Bottom rod */}
      <div
        className="absolute bottom-[8px] left-[4px] right-[4px] h-[8px] rounded-[3px]"
        style={{ background: "linear-gradient(180deg, #5D4037, #6D4C41)" }}
      />
      {/* Rod knobs */}
      <div className="absolute bottom-[6px] left-[0px] w-[8px] h-[12px] rounded-full"
        style={{ background: "#4E342E" }} />
      <div className="absolute bottom-[6px] right-[0px] w-[8px] h-[12px] rounded-full"
        style={{ background: "#4E342E" }} />
    </div>
  );
}

/* 12. Screen (병풍) */
function ScreenVisual() {
  return (
    <div className="relative w-[160px] h-[150px]">
      <WallBracket />
      {/* 4 panels */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={`p-${i}`}
          className="absolute rounded-[1px]"
          style={{
            top: "8px",
            left: `${6 + i * 38}px`,
            width: "34px",
            height: "120px",
            background: "linear-gradient(180deg, #1a3a4a 0%, #0d2d3a 60%, #1a3a4a 100%)",
            boxShadow: i < 3 ? "2px 0 4px rgba(0,0,0,0.3)" : "none",
            transform: i % 2 === 0 ? "perspective(200px) rotateY(3deg)" : "perspective(200px) rotateY(-3deg)",
          }}
        >
          {/* Mountain silhouette */}
          <div
            className="absolute bottom-[15px] left-0 right-0 h-[30px]"
            style={{
              clipPath: `polygon(0% 100%, ${10 + i * 5}% ${30 + i * 10}%, ${40 - i * 3}% ${50 + i * 5}%, ${60 + i * 4}% ${20 + i * 8}%, 100% 100%)`,
              background: "rgba(100,140,160,0.3)",
            }}
          />
          {/* Gold border top/bottom */}
          <div className="absolute top-0 left-0 right-0 h-[3px]"
            style={{ background: "linear-gradient(90deg, #b8960b, #d4ac0d, #b8960b)" }} />
          <div className="absolute bottom-0 left-0 right-0 h-[3px]"
            style={{ background: "linear-gradient(90deg, #b8960b, #d4ac0d, #b8960b)" }} />
        </div>
      ))}
    </div>
  );
}

/* 13. Fan (부채) */
function FanVisual() {
  return (
    <div className="relative w-[100px] h-[75px]">
      <WallBracket />
      {/* Fan ribs (radiating) */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div
          key={`rib-${i}`}
          className="absolute"
          style={{
            bottom: "14px",
            left: "12px",
            width: "2px",
            height: "48px",
            background: "#D2B48C",
            transformOrigin: "bottom center",
            transform: `rotate(${-70 + i * 17.5}deg)`,
            borderRadius: "1px",
          }}
        />
      ))}
      {/* Paper fill - semicircle */}
      <div
        className="absolute bottom-[10px] left-[6px] w-[88px] h-[50px]"
        style={{
          background: "linear-gradient(180deg, #FFF8E7 0%, #F5E6C8 100%)",
          borderRadius: "50px 50px 0 0",
          clipPath: "polygon(5% 100%, 0% 30%, 15% 5%, 50% 0%, 85% 5%, 100% 30%, 95% 100%)",
          opacity: 0.85,
        }}
      />
      {/* Pivot point */}
      <div
        className="absolute bottom-[10px] left-[10px] w-[6px] h-[6px] rounded-full"
        style={{ background: "radial-gradient(#d4ac0d, #8B6914)" }}
      />
      {/* Tassel */}
      <div className="absolute bottom-[2px] left-[10px] w-[2px] h-[10px] bg-red-700/70 rounded-full" />
      <div className="absolute bottom-[0px] left-[8px] w-[6px] h-[4px] rounded-full bg-red-800/50" />
    </div>
  );
}

/* 14. Mirror (거울/동경) */
function MirrorVisual() {
  return (
    <div className="relative w-[85px] h-[90px]">
      <WallBracket />
      {/* Hanging loop */}
      <div className="absolute top-[4px] left-1/2 -translate-x-1/2 w-[10px] h-[8px] rounded-t-full border-2 border-amber-700 border-b-0" />
      {/* Ornate border */}
      <div
        className="absolute top-[12px] left-1/2 -translate-x-1/2 w-[68px] h-[68px] rounded-full"
        style={{
          background: "linear-gradient(135deg, #b8960b, #d4ac0d, #b8960b)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        }}
      />
      {/* Bumpy border pattern (simulated) */}
      <div
        className="absolute top-[14px] left-1/2 -translate-x-1/2 w-[64px] h-[64px] rounded-full"
        style={{
          background: "transparent",
          border: "3px dotted rgba(184,150,11,0.6)",
        }}
      />
      {/* Reflective center */}
      <div
        className="absolute top-[20px] left-1/2 -translate-x-1/2 w-[50px] h-[50px] rounded-full"
        style={{
          background: "radial-gradient(circle at 35% 35%, #6a6a6a, #3a3a3a 50%, #2a2a2a 100%)",
          boxShadow: "inset 0 0 10px rgba(255,255,255,0.1)",
        }}
      />
      {/* Highlight glare */}
      <div className="absolute top-[26px] left-[30px] w-[8px] h-[8px] rounded-full bg-white/10" />
    </div>
  );
}

/* 15. Tapestry (자수) */
function TapestryVisual() {
  return (
    <div className="relative w-[90px] h-[110px]">
      <WallBracket />
      {/* Gold rod top */}
      <div
        className="absolute top-[4px] left-[4px] right-[4px] h-[6px] rounded-[2px]"
        style={{ background: "linear-gradient(90deg, #b8960b, #d4ac0d, #b8960b)" }}
      />
      {/* Silk body */}
      <div
        className="absolute top-[10px] left-[8px] right-[8px] h-[78px] rounded-b-[2px]"
        style={{
          background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)",
          boxShadow: "1px 2px 6px rgba(0,0,0,0.3)",
        }}
      />
      {/* Flower motif - simple petals */}
      <div className="absolute top-[30px] left-1/2 -translate-x-1/2 w-[6px] h-[6px] rounded-full bg-rose-400/60" />
      <div className="absolute top-[24px] left-1/2 -translate-x-1/2 w-[4px] h-[6px] rounded-full bg-rose-300/40" />
      <div className="absolute top-[36px] left-1/2 -translate-x-1/2 w-[4px] h-[6px] rounded-full bg-rose-300/40" />
      <div className="absolute top-[30px] left-[34px] w-[6px] h-[4px] rounded-full bg-rose-300/40" />
      <div className="absolute top-[30px] right-[34px] w-[6px] h-[4px] rounded-full bg-rose-300/40" />
      {/* Stem */}
      <div className="absolute top-[36px] left-1/2 -translate-x-1/2 w-[1px] h-[20px] bg-green-600/40" />
      {/* Leaves */}
      <div className="absolute top-[44px] left-[38px] w-[8px] h-[4px] rounded-full bg-green-700/30 -rotate-30" />
      <div className="absolute top-[48px] right-[38px] w-[8px] h-[4px] rounded-full bg-green-700/30 rotate-30" />
      {/* Bird silhouette (simple) */}
      <div className="absolute top-[22px] right-[16px] w-[10px] h-[2px] bg-amber-400/30"
        style={{ clipPath: "polygon(50% 0%, 0% 100%, 50% 70%, 100% 100%)" }} />
      {/* Tassels */}
      <div className="absolute bottom-[14px] left-[10px] w-[2px] h-[10px] bg-amber-500/50 rounded-b-full" />
      <div className="absolute bottom-[12px] left-[12px] w-[3px] h-[4px] rounded-full bg-amber-600/40" />
      <div className="absolute bottom-[14px] right-[10px] w-[2px] h-[10px] bg-amber-500/50 rounded-b-full" />
      <div className="absolute bottom-[12px] right-[10px] w-[3px] h-[4px] rounded-full bg-amber-600/40" />
    </div>
  );
}

/* 16. Stone Tablet (석판) */
function StoneTabletVisual() {
  return (
    <div className="relative w-[80px] h-[100px]">
      <WallBracket />
      {/* Stone body */}
      <div
        className="absolute top-[8px] left-[6px] right-[6px] h-[82px] rounded-t-[40%]"
        style={{
          background: "linear-gradient(180deg, #a09888 0%, #8a8070 40%, #9a9080 100%)",
          boxShadow: "2px 3px 8px rgba(0,0,0,0.3)",
        }}
      />
      {/* Rough texture overlay */}
      <div
        className="absolute top-[8px] left-[6px] right-[6px] h-[82px] rounded-t-[40%] opacity-20"
        style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 4px)",
        }}
      />
      {/* Engraved text lines */}
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={`el-${i}`}
          className="absolute h-[2px] rounded-full"
          style={{
            top: `${30 + i * 12}px`,
            left: `${16 + (i % 2) * 4}px`,
            right: `${16 + ((i + 1) % 2) * 4}px`,
            background: "rgba(60,50,40,0.3)",
          }}
        />
      ))}
    </div>
  );
}

/* 17. Mask (하회탈) */
function MaskVisual() {
  return (
    <div className="relative w-[80px] h-[90px]">
      <WallBracket />
      {/* Face shape */}
      <div
        className="absolute top-[8px] left-[6px] right-[6px] h-[72px] rounded-[50%_50%_45%_45%]"
        style={{
          background: "linear-gradient(180deg, #F5DEB3 0%, #DEB887 60%, #D2B48C 100%)",
          boxShadow: "2px 3px 8px rgba(0,0,0,0.3)",
        }}
      />
      {/* Left eye - curved slit */}
      <div
        className="absolute top-[30px] left-[16px] w-[16px] h-[8px] rounded-[50%] bg-black/80"
        style={{ transform: "rotate(-5deg)" }}
      />
      {/* Right eye - curved slit */}
      <div
        className="absolute top-[30px] right-[16px] w-[16px] h-[8px] rounded-[50%] bg-black/80"
        style={{ transform: "rotate(5deg)" }}
      />
      {/* Rosy cheeks */}
      <div className="absolute top-[38px] left-[12px] w-[12px] h-[8px] rounded-full bg-pink-300/30" />
      <div className="absolute top-[38px] right-[12px] w-[12px] h-[8px] rounded-full bg-pink-300/30" />
      {/* Nose */}
      <div className="absolute top-[36px] left-1/2 -translate-x-1/2 w-[8px] h-[10px] rounded-b-full bg-[#C8A878]" />
      {/* Wide grin mouth */}
      <div
        className="absolute top-[52px] left-[18px] right-[18px] h-[14px] rounded-b-[60%]"
        style={{ background: "#2a1a0a" }}
      />
      {/* Teeth */}
      <div className="absolute top-[52px] left-[22px] right-[22px] h-[4px] bg-[#F5F0E0] rounded-b-[2px]" />
      {/* Forehead crease */}
      <div className="absolute top-[20px] left-[22px] right-[22px] h-[1px] bg-[#B8986E]/40 rounded-full" />
    </div>
  );
}

/* 18. Wall Lantern (등롱) */
function WallLanternVisual() {
  return (
    <div className="relative w-[70px] h-[100px]">
      <WallBracket />
      {/* Hook arm */}
      <div className="absolute top-[4px] left-1/2 -translate-x-1/2 w-[2px] h-[10px] bg-amber-800" />
      {/* Top cap */}
      <div
        className="absolute top-[12px] left-1/2 -translate-x-1/2 w-[40px] h-[8px]"
        style={{
          background: "linear-gradient(180deg, #3E2723, #5D4037)",
          clipPath: "polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)",
        }}
      />
      {/* Lantern body */}
      <div
        className="absolute top-[18px] left-1/2 -translate-x-1/2 w-[42px] h-[52px] rounded-[4px]"
        style={{
          background: "linear-gradient(180deg, #e85d3a 0%, #c0392b 50%, #a0301f 100%)",
          boxShadow: "0 0 20px rgba(232,93,58,0.3), 0 0 40px rgba(232,93,58,0.15)",
        }}
      />
      {/* Frame ribs vertical */}
      <div className="absolute top-[18px] left-1/2 -translate-x-1/2 w-[1px] h-[52px] bg-black/30" />
      <div className="absolute top-[18px] left-[22px] w-[1px] h-[52px] bg-black/20" />
      <div className="absolute top-[18px] right-[22px] w-[1px] h-[52px] bg-black/20" />
      {/* Frame ribs horizontal */}
      <div className="absolute top-[36px] left-[14px] right-[14px] h-[1px] bg-black/25" />
      <div className="absolute top-[52px] left-[14px] right-[14px] h-[1px] bg-black/25" />
      {/* Warm glow center */}
      <div
        className="absolute top-[26px] left-1/2 -translate-x-1/2 w-[20px] h-[30px] rounded-full"
        style={{ background: "radial-gradient(ellipse, rgba(255,220,150,0.4), transparent)" }}
      />
      {/* Bottom cap */}
      <div
        className="absolute top-[68px] left-1/2 -translate-x-1/2 w-[38px] h-[6px]"
        style={{
          background: "linear-gradient(180deg, #5D4037, #3E2723)",
          clipPath: "polygon(0% 0%, 100% 0%, 85% 100%, 15% 100%)",
        }}
      />
      {/* Bottom tassel */}
      <div className="absolute top-[74px] left-1/2 -translate-x-1/2 w-[2px] h-[10px] bg-red-700/60 rounded-b-full" />
      <div className="absolute top-[82px] left-1/2 -translate-x-1/2 w-[6px] h-[4px] rounded-full bg-red-800/40" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Pillar / Ceiling (19-20)
   ═══════════════════════════════════════════════════════════════ */

/* 19. Pillar Plate (명판) */
function PillarPlateVisual() {
  return (
    <div className="relative w-[100px] h-[130px]">
      {/* Red pillar background */}
      <div
        className="absolute top-0 left-[20px] right-[20px] h-full rounded-[3px]"
        style={{
          background: "linear-gradient(90deg, #6a1010 0%, #8B0000 30%, #a01515 50%, #8B0000 70%, #6a1010 100%)",
          boxShadow: "2px 0 6px rgba(0,0,0,0.3)",
        }}
      />
      {/* Gold plaque outer border */}
      <div
        className="absolute top-[22px] left-[26px] right-[26px] h-[86px] rounded-[3px]"
        style={{
          background: "linear-gradient(135deg, #d4ac0d, #f1c40f, #d4ac0d)",
          boxShadow: "0 0 8px rgba(212,172,13,0.3)",
        }}
      />
      {/* Plaque inner dark */}
      <div
        className="absolute top-[26px] left-[30px] right-[30px] h-[78px] rounded-[2px]"
        style={{ background: "linear-gradient(180deg, #1a1a2e, #0a0a1a)" }}
      />
      {/* Plaque text lines */}
      {[0, 1, 2].map((i) => (
        <div
          key={`pt-${i}`}
          className="absolute h-[2px] bg-amber-400/30 rounded-full"
          style={{ top: `${44 + i * 18}px`, left: "38px", right: "38px" }}
        />
      ))}
    </div>
  );
}

/* 20. Beam Tag (대들보 명패) */
function BeamTagVisual() {
  return (
    <div className="relative w-[100px] h-[60px]">
      {/* Beam element */}
      <div
        className="absolute top-0 left-[10px] right-[10px] h-[12px] rounded-[2px]"
        style={{ background: "linear-gradient(180deg, #5D4037 0%, #4E342E 100%)" }}
      />
      {/* Rope/chain */}
      <div className="absolute top-[12px] left-[30px] w-[2px] h-[10px] bg-amber-800/70" />
      <div className="absolute top-[12px] right-[30px] w-[2px] h-[10px] bg-amber-800/70" />
      {/* Tag body */}
      <div
        className="absolute top-[20px] left-[16px] right-[16px] h-[30px] rounded-[3px]"
        style={{
          background: "linear-gradient(180deg, #5D4037 0%, #3E2723 100%)",
          boxShadow: "0 3px 8px rgba(0,0,0,0.4)",
        }}
      />
      {/* Gold border on tag */}
      <div
        className="absolute top-[22px] left-[18px] right-[18px] h-[26px] rounded-[2px] border border-amber-500/40"
      />
      {/* Text line */}
      <div className="absolute top-[32px] left-[26px] right-[26px] h-[2px] bg-amber-400/30 rounded-full" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Exports
   ═══════════════════════════════════════════════════════════════ */

export const VISUAL_MAP: Record<VisualType, () => ReactNode> = {
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

export const VISUAL_SIZE: Record<VisualType, { w: number; h: number }> = {
  throne: { w: 140, h: 160 },
  table: { w: 120, h: 80 },
  chest: { w: 130, h: 95 },
  book: { w: 110, h: 130 },
  incense: { w: 90, h: 110 },
  candle: { w: 65, h: 145 },
  vase: { w: 90, h: 130 },
  drum: { w: 110, h: 100 },
  bonsai: { w: 100, h: 120 },
  gong: { w: 110, h: 120 },
  scroll: { w: 100, h: 170 },
  screen: { w: 160, h: 150 },
  fan: { w: 100, h: 75 },
  mirror: { w: 85, h: 90 },
  tapestry: { w: 90, h: 110 },
  "stone-tablet": { w: 80, h: 100 },
  mask: { w: 80, h: 90 },
  "wall-lantern": { w: 70, h: 100 },
  "pillar-plate": { w: 100, h: 130 },
  "beam-tag": { w: 100, h: 60 },
};
