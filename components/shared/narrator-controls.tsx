"use client";

import { Play, Pause, SkipBack, SkipForward, Square, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/shared/glass-card";
import type { NarratorVoiceType } from "@/hooks/use-narrator";

interface NarratorControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  currentIndex: number;
  totalItems: number;
  voiceType: NarratorVoiceType;
  voiceLabels: Record<NarratorVoiceType, string>;
  currentLabel?: string;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onNext: () => void;
  onPrev: () => void;
  onVoiceChange: (type: NarratorVoiceType) => void;
}

const voiceTypes: NarratorVoiceType[] = ["calm-female", "calm-male", "fun"];

export function NarratorControls({
  isPlaying,
  isPaused,
  currentIndex,
  totalItems,
  voiceType,
  voiceLabels,
  currentLabel,
  onPlay,
  onPause,
  onResume,
  onStop,
  onNext,
  onPrev,
  onVoiceChange,
}: NarratorControlsProps) {
  const progress = totalItems > 0 ? ((currentIndex + 1) / totalItems) * 100 : 0;

  return (
    <GlassCard className="p-4" hover={false}>
      {/* Progress */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-[var(--muted-foreground)] mb-1">
          <span className="flex items-center gap-1">
            <Volume2 className="w-3 h-3" />
            나레이터
          </span>
          <span>
            {currentIndex + 1} / {totalItems}
          </span>
        </div>
        <div className="h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--accent-violet)] to-[var(--accent-cyan)] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current item label */}
      {currentLabel && (
        <p className="text-sm font-medium text-center mb-3 truncate text-[var(--accent-cyan)]">
          {currentLabel}
        </p>
      )}

      {/* Playback controls */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrev}
          disabled={!isPlaying || currentIndex === 0}
          className="text-[var(--muted-foreground)] hover:text-white"
        >
          <SkipBack className="w-4 h-4" />
        </Button>

        {!isPlaying ? (
          <Button
            size="sm"
            onClick={onPlay}
            className="bg-gradient-to-r from-[var(--accent-violet)] to-[var(--accent-cyan)] text-white px-6"
          >
            <Play className="w-4 h-4 mr-1" />
            재생
          </Button>
        ) : isPaused ? (
          <Button
            size="sm"
            onClick={onResume}
            className="bg-gradient-to-r from-[var(--accent-violet)] to-[var(--accent-cyan)] text-white px-6"
          >
            <Play className="w-4 h-4 mr-1" />
            계속
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={onPause}
            className="bg-[var(--accent-violet)] text-white px-6"
          >
            <Pause className="w-4 h-4 mr-1" />
            일시정지
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={onNext}
          disabled={!isPlaying || currentIndex >= totalItems - 1}
          className="text-[var(--muted-foreground)] hover:text-white"
        >
          <SkipForward className="w-4 h-4" />
        </Button>

        {isPlaying && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onStop}
            className="text-[var(--muted-foreground)] hover:text-white"
          >
            <Square className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      {/* Voice selection */}
      <div className="flex justify-center gap-1.5">
        {voiceTypes.map((type) => (
          <button
            key={type}
            onClick={() => onVoiceChange(type)}
            className={`text-xs px-2.5 py-1 rounded-full transition-all ${
              voiceType === type
                ? "bg-[var(--accent-violet)]/20 text-[var(--accent-violet)] ring-1 ring-[var(--accent-violet)]"
                : "bg-white/5 text-[var(--muted-foreground)] hover:bg-white/10"
            }`}
          >
            {voiceLabels[type]}
          </button>
        ))}
      </div>
    </GlassCard>
  );
}
