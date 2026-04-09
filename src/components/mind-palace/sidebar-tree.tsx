"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  BuildingConfig,
  FloorConfig,
  RoomConfig,
} from "@/lib/mind-palace/building-config";
import type { StructuredSection } from "@/lib/data/textbooks/structured/ethics-structured-index";

interface SidebarTreeProps {
  building: BuildingConfig;
  sections: StructuredSection[];
  activeRoomId: string | null;
  activeNoteId: string | null;
  onRoomSelect: (roomId: string, sectionId: string) => void;
  onNoteSelect: (noteId: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}

export function SidebarTree({
  building,
  sections,
  activeRoomId,
  activeNoteId,
  onRoomSelect,
  onNoteSelect,
  collapsed,
  onToggle,
}: SidebarTreeProps) {
  // Track which rooms are expanded to show notes
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(() => {
    return activeRoomId ? new Set([activeRoomId]) : new Set();
  });

  const toggleRoom = (roomId: string) => {
    setExpandedRooms((prev) => {
      const next = new Set(prev);
      if (next.has(roomId)) next.delete(roomId);
      else next.add(roomId);
      return next;
    });
  };

  // Find active floor
  const activeFloor = building.floors.find((f) =>
    f.rooms.some((r) => r.id === activeRoomId)
  );

  // Build a map: roomId -> StructuredSection for note lookup
  const sectionByRoomId = new Map<string, StructuredSection>();
  if (activeFloor) {
    for (const room of activeFloor.rooms) {
      const sec = sections.find((s) => s.id === room.sectionId);
      if (sec) sectionByRoomId.set(room.id, sec);
    }
  }

  return (
    <div
      className="relative h-full flex flex-col"
      style={{
        width: collapsed ? 40 : 280,
        minWidth: collapsed ? 40 : 280,
        transition: "width 0.3s cubic-bezier(0.4,0,0.2,1), min-width 0.3s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-4 z-10 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors duration-200"
        aria-label={collapsed ? "사이드바 열기" : "사이드바 닫기"}
      >
        <span className="text-xs leading-none select-none">
          {collapsed ? "\u203A" : "\u2039"}
        </span>
      </button>

      {/* Collapsed strip */}
      {collapsed && (
        <div className="flex flex-col items-center pt-14 gap-2">
          <span
            className="text-white/40 text-xs"
            style={{ writingMode: "vertical-rl" }}
          >
            {building.subject}
          </span>
        </div>
      )}

      {/* Expanded sidebar content */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="flex flex-col h-full overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b border-white/5">
              <h2 className="text-sm font-bold text-white/90 flex items-center gap-2">
                <span className="text-base">{"📖"}</span>
                {building.subject}
              </h2>
              <p className="text-[10px] text-white/30 mt-1">{building.name}</p>
            </div>

            {/* Tree */}
            <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
              {building.floors.map((floor) => (
                <FloorNode
                  key={floor.floor}
                  floor={floor}
                  isActiveFloor={activeFloor?.floor === floor.floor}
                  activeRoomId={activeRoomId}
                  activeNoteId={activeNoteId}
                  expandedRooms={expandedRooms}
                  sectionByRoomId={sectionByRoomId}
                  onRoomSelect={onRoomSelect}
                  onToggleRoom={toggleRoom}
                  onNoteSelect={onNoteSelect}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Floor node ── */

interface FloorNodeProps {
  floor: FloorConfig;
  isActiveFloor: boolean;
  activeRoomId: string | null;
  activeNoteId: string | null;
  expandedRooms: Set<string>;
  sectionByRoomId: Map<string, StructuredSection>;
  onRoomSelect: (roomId: string, sectionId: string) => void;
  onToggleRoom: (roomId: string) => void;
  onNoteSelect: (noteId: string) => void;
}

function FloorNode({
  floor,
  isActiveFloor,
  activeRoomId,
  activeNoteId,
  expandedRooms,
  sectionByRoomId,
  onRoomSelect,
  onToggleRoom,
  onNoteSelect,
}: FloorNodeProps) {
  const disabled = !floor.enabled;

  return (
    <div className="mb-0.5">
      {/* Floor row */}
      <div
        className={`
          flex items-center gap-2 px-4 py-1.5 text-xs select-none
          ${
            disabled
              ? "text-white/25 cursor-default"
              : isActiveFloor
              ? "text-amber-400 font-semibold"
              : "text-white/50 hover:text-white/70 cursor-default"
          }
        `}
      >
        {/* Tree connector */}
        <span className="text-white/15 shrink-0">
          {floor.floor === 1 ? "\u251C" : floor.floor === 6 ? "\u2514" : "\u251C"}
        </span>

        <span className="truncate">
          {floor.floor}층: {floor.chapterTitle}
        </span>

        {disabled && (
          <span className="ml-auto shrink-0 text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/20">
            준비 중
          </span>
        )}

        {isActiveFloor && (
          <span className="ml-auto shrink-0 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        )}
      </div>

      {/* Rooms (only for enabled floor) */}
      <AnimatePresence initial={false}>
        {floor.enabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            {floor.rooms.map((room) => (
              <RoomNode
                key={room.id}
                room={room}
                isActive={activeRoomId === room.id}
                isExpanded={expandedRooms.has(room.id)}
                activeNoteId={activeNoteId}
                section={sectionByRoomId.get(room.id) ?? null}
                onRoomSelect={onRoomSelect}
                onToggleRoom={onToggleRoom}
                onNoteSelect={onNoteSelect}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Room node ── */

interface RoomNodeProps {
  room: RoomConfig;
  isActive: boolean;
  isExpanded: boolean;
  activeNoteId: string | null;
  section: StructuredSection | null;
  onRoomSelect: (roomId: string, sectionId: string) => void;
  onToggleRoom: (roomId: string) => void;
  onNoteSelect: (noteId: string) => void;
}

function RoomNode({
  room,
  isActive,
  isExpanded,
  activeNoteId,
  section,
  onRoomSelect,
  onToggleRoom,
  onNoteSelect,
}: RoomNodeProps) {
  const hasNotes = section && section.notes.length > 0;

  const handleClick = () => {
    onRoomSelect(room.id, room.sectionId);
    if (hasNotes) onToggleRoom(room.id);
  };

  return (
    <div>
      {/* Room row */}
      <button
        onClick={handleClick}
        className={`
          w-full flex items-center gap-2 pl-8 pr-4 py-1.5 text-xs text-left
          transition-colors duration-150 group
          ${
            isActive
              ? "bg-amber-500/10 text-amber-300"
              : "text-white/45 hover:bg-white/[0.04] hover:text-white/65"
          }
        `}
      >
        {/* Expand indicator */}
        <span
          className={`
            text-[10px] shrink-0 transition-transform duration-200
            ${isExpanded ? "rotate-90" : "rotate-0"}
            ${hasNotes ? "text-white/30" : "text-transparent"}
          `}
        >
          {"\u25B6"}
        </span>

        <span className="truncate">
          {room.id}호: {section?.title ?? room.label}
        </span>

        {isActive && (
          <span className="ml-auto shrink-0 w-1 h-1 rounded-full bg-amber-400" />
        )}
      </button>

      {/* Notes (expandable) */}
      <AnimatePresence initial={false}>
        {isExpanded && hasNotes && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {section.notes.map((note) => {
              const isNoteActive = activeNoteId === note.id;
              return (
                <button
                  key={note.id}
                  onClick={() => onNoteSelect(note.id)}
                  className={`
                    w-full flex items-center gap-2 pl-14 pr-4 py-1 text-[11px] text-left
                    transition-colors duration-150
                    ${
                      isNoteActive
                        ? "text-amber-200 bg-amber-500/[0.07]"
                        : "text-white/35 hover:text-white/55 hover:bg-white/[0.03]"
                    }
                  `}
                >
                  <span
                    className={`
                      w-1 h-1 rounded-full shrink-0
                      ${isNoteActive ? "bg-amber-400" : "bg-white/15"}
                    `}
                  />
                  <span className="truncate">
                    {note.keyword ?? note.label}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
