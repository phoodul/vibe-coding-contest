"use client";

import { useState, useRef, useCallback } from "react";
import type { PalaceItem } from "@/lib/data/mind-palace/ethics-ch3-palace";

/**
 * 기억의 궁전 나레이터 훅
 *
 * 학교 선생님 스타일로 교과서 원문을 TTS로 읽어줌
 * OpenAI gpt-4o-mini-tts via /api/tts
 */

const TEACHER_INSTRUCTION =
  "당신은 친절한 고등학교 윤리 선생님입니다. 학생들에게 교과서 내용을 또박또박 읽어주듯 설명하세요. 중요한 개념은 강조하며, 사상가 이름은 천천히 발음하세요. 따뜻하고 격려하는 어조를 유지하세요.";

interface NarratorState {
  isPlaying: boolean;
  currentIndex: number;
  isLoading: boolean;
}

export function usePalaceNarrator(items: PalaceItem[]) {
  const [state, setState] = useState<NarratorState>({
    isPlaying: false,
    currentIndex: -1,
    isLoading: false,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  const playItem = useCallback(
    async (index: number) => {
      if (index < 0 || index >= items.length) {
        setState((s) => ({ ...s, isPlaying: false, currentIndex: -1, isLoading: false }));
        return;
      }

      stopAudio();

      const item = items[index];
      setState({ isPlaying: true, currentIndex: index, isLoading: true });

      try {
        const controller = new AbortController();
        abortRef.current = controller;

        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: item.detail,
            voice: "nova",
            instructions: TEACHER_INSTRUCTION,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          // TTS 실패 시 브라우저 SpeechSynthesis fallback
          fallbackSpeak(item.detail, () => {
            // 다음 항목으로 자동 이동
            playItem(index + 1);
          });
          setState((s) => ({ ...s, isLoading: false }));
          return;
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;

        setState((s) => ({ ...s, isLoading: false }));

        audio.onended = () => {
          URL.revokeObjectURL(url);
          // 자동으로 다음 항목 재생
          playItem(index + 1);
        };

        audio.onerror = () => {
          URL.revokeObjectURL(url);
          setState((s) => ({ ...s, isPlaying: false, isLoading: false }));
        };

        await audio.play();
      } catch {
        setState((s) => ({ ...s, isPlaying: false, isLoading: false }));
      }
    },
    [items, stopAudio]
  );

  const play = useCallback(
    (startIndex = 0) => {
      playItem(startIndex);
    },
    [playItem]
  );

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setState((s) => ({ ...s, isPlaying: false }));
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play();
      setState((s) => ({ ...s, isPlaying: true }));
    }
  }, []);

  const next = useCallback(() => {
    const nextIdx = state.currentIndex + 1;
    if (nextIdx < items.length) {
      playItem(nextIdx);
    }
  }, [state.currentIndex, items.length, playItem]);

  const prev = useCallback(() => {
    const prevIdx = state.currentIndex - 1;
    if (prevIdx >= 0) {
      playItem(prevIdx);
    }
  }, [state.currentIndex, playItem]);

  const stop = useCallback(() => {
    stopAudio();
    setState({ isPlaying: false, currentIndex: -1, isLoading: false });
  }, [stopAudio]);

  return {
    ...state,
    play,
    pause,
    resume,
    next,
    prev,
    stop,
    currentItem: state.currentIndex >= 0 ? items[state.currentIndex] : null,
  };
}

/** 브라우저 SpeechSynthesis fallback (TTS API 실패 시) */
function fallbackSpeak(text: string, onEnd: () => void) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    onEnd();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ko-KR";
  utterance.rate = 0.9;
  utterance.onend = onEnd;
  utterance.onerror = () => onEnd();
  speechSynthesis.speak(utterance);
}
