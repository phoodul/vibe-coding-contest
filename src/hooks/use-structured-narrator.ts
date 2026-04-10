"use client";

import { useState, useRef, useCallback } from "react";
import type { FlatNarratorItem } from "@/lib/mind-palace/flatten-nodes";
import { getOriginalText } from "@/lib/mind-palace/get-original-text";

const TEACHER_INSTRUCTION =
  "당신은 친절한 고등학교 윤리 선생님입니다. 학생들에게 교과서 내용을 또박또박 읽어주듯 설명하세요. 중요한 개념은 강조하며, 사상가 이름은 천천히 발음하세요. 따뜻하고 격려하는 어조를 유지하세요.";

interface NarratorState {
  isPlaying: boolean;
  currentIndex: number;
  isLoading: boolean;
}

/**
 * 구조화 텍스트 나레이터 훅
 *
 * - note 단위로 originalText(교과서 원문)를 TTS로 읽음
 * - 같은 note 내의 이후 노드는 TTS 없이 하이라이트만 진행
 * - progressive reveal: revealedUpTo까지 텍스트 표시
 */
export function useStructuredNarrator(items: FlatNarratorItem[]) {
  const [state, setState] = useState<NarratorState>({
    isPlaying: false,
    currentIndex: -1,
    isLoading: false,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const voiceRef = useRef("nova");
  const [revealedUpTo, setRevealedUpTo] = useState(-1);
  /** 세대 카운터 — stop/pause 시 증가하여 이전 콜백 무효화 */
  const genRef = useRef(0);
  const revealIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopAudio = useCallback(() => {
    genRef.current++;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    if (revealIntervalRef.current) {
      clearInterval(revealIntervalRef.current);
      revealIntervalRef.current = null;
    }
  }, []);

  /**
   * TTS 텍스트 결정:
   * - note의 첫 번째 아이템이면 → originalText(교과서 원문) 읽기
   * - 같은 note의 후속 아이템이면 → TTS 스킵, 짧은 딜레이 후 다음으로
   */
  const getTtsText = useCallback(
    (index: number): string | null => {
      const item = items[index];
      if (!item) return null;

      // 이 아이템이 note의 첫 번째인지 확인
      const isFirstInNote =
        index === 0 || items[index - 1]?.noteId !== item.noteId;

      if (isFirstInNote) {
        // 무조건 교과서 원문 읽기 — 구조화 텍스트 fallback 금지
        return getOriginalText(item.noteId) ?? null;
      }

      // 같은 note의 후속 아이템 → TTS 없이 진행
      return null;
    },
    [items]
  );

  const playItem = useCallback(
    async (index: number) => {
      if (index < 0 || index >= items.length) {
        setState((s) => ({
          ...s,
          isPlaying: false,
          currentIndex: -1,
          isLoading: false,
        }));
        return;
      }

      stopAudio();
      const gen = genRef.current;

      setState({ isPlaying: true, currentIndex: index, isLoading: true });
      setRevealedUpTo((prev) => Math.max(prev, index));

      const ttsText = getTtsText(index);

      if (!ttsText) {
        // TTS 스킵: 짧은 딜레이 후 다음 아이템 (세대 체크)
        setState((s) => ({ ...s, isLoading: false }));
        setTimeout(() => {
          if (genRef.current !== gen) return;
          playItem(index + 1);
        }, 600);
        return;
      }

      try {
        const controller = new AbortController();
        abortRef.current = controller;

        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: ttsText,
            voice: voiceRef.current,
            instructions: TEACHER_INSTRUCTION,
          }),
          signal: controller.signal,
        });

        if (genRef.current !== gen) return;

        if (!res.ok) {
          fallbackSpeak(ttsText, () => {
            if (genRef.current === gen) playItem(index + 1);
          });
          setState((s) => ({ ...s, isLoading: false }));
          return;
        }

        const blob = await res.blob();
        if (genRef.current !== gen) return;
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;

        setState((s) => ({ ...s, isLoading: false }));

        // note 내의 모든 아이템을 점진적으로 reveal
        const noteId = items[index].noteId;
        // 같은 note에 속하는 아이템 인덱스 범위 계산
        const noteItems: number[] = [];
        for (let i = index; i < items.length && items[i].noteId === noteId; i++) {
          noteItems.push(i);
        }
        let revealStep = 0;

        // TTS 시작 후 오디오 duration 기반으로 reveal 간격 결정
        const startReveal = (duration: number) => {
          if (noteItems.length <= 1) return null;
          const interval = Math.max(1000, Math.min(3000,
            (duration * 1000) / noteItems.length
          ));
          const id = setInterval(() => {
            if (genRef.current !== gen) { clearInterval(id); revealIntervalRef.current = null; return; }
            revealStep++;
            if (revealStep >= noteItems.length) return;
            const nextIdx = noteItems[revealStep];
            setState((s) => ({ ...s, currentIndex: nextIdx }));
            setRevealedUpTo((prev) => Math.max(prev, nextIdx));
          }, interval);
          revealIntervalRef.current = id;
          return id;
        };

        let revealInterval: ReturnType<typeof setInterval> | null = null;

        audio.onloadedmetadata = () => {
          if (genRef.current !== gen) return;
          const dur = audio.duration;
          if (dur && isFinite(dur)) {
            revealInterval = startReveal(dur);
          }
        };
        setTimeout(() => {
          if (genRef.current !== gen) return;
          if (!revealInterval && noteItems.length > 1) {
            revealInterval = startReveal(noteItems.length * 2);
          }
        }, 500);

        audio.onended = () => {
          if (revealInterval) clearInterval(revealInterval);
          revealIntervalRef.current = null;
          URL.revokeObjectURL(url);
          if (genRef.current !== gen) return;
          const lastInNote = noteItems[noteItems.length - 1];
          setState((s) => ({ ...s, currentIndex: lastInNote }));
          setRevealedUpTo((prev) => Math.max(prev, lastInNote));
          setTimeout(() => {
            if (genRef.current !== gen) return;
            const nextNoteIdx = items.findIndex(
              (item, i) => i > index && item.noteId !== noteId
            );
            if (nextNoteIdx >= 0) {
              playItem(nextNoteIdx);
            } else {
              setRevealedUpTo(items.length - 1);
              setState({ isPlaying: false, currentIndex: -1, isLoading: false });
            }
          }, 800);
        };

        audio.onerror = () => {
          if (revealInterval) clearInterval(revealInterval);
          revealIntervalRef.current = null;
          URL.revokeObjectURL(url);
          setState((s) => ({ ...s, isPlaying: false, isLoading: false }));
        };

        await audio.play();
      } catch {
        setState((s) => ({ ...s, isPlaying: false, isLoading: false }));
      }
    },
    [items, stopAudio, getTtsText]
  );

  const play = useCallback(
    (startIndex = 0) => {
      playItem(startIndex);
    },
    [playItem]
  );

  const pause = useCallback(() => {
    genRef.current++;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (revealIntervalRef.current) {
      clearInterval(revealIntervalRef.current);
      revealIntervalRef.current = null;
    }
    setState((s) => ({ ...s, isPlaying: false }));
  }, []);

  const resume = useCallback(() => {
    // pause가 오디오를 완전 중단하므로, 현재 인덱스부터 다시 재생
    if (state.currentIndex >= 0) {
      playItem(state.currentIndex);
    }
  }, [state.currentIndex, playItem]);

  const next = useCallback(() => {
    // 다음 note의 첫 아이템으로
    const currentItem = items[state.currentIndex];
    if (!currentItem) return;
    const nextNoteIdx = items.findIndex(
      (item, i) => i > state.currentIndex && item.noteId !== currentItem.noteId
    );
    if (nextNoteIdx >= 0) {
      playItem(nextNoteIdx);
    }
  }, [state.currentIndex, items, playItem]);

  const prev = useCallback(() => {
    // 이전 note의 첫 아이템으로
    const currentItem = items[state.currentIndex];
    if (!currentItem) return;
    // 현재 note의 첫 아이템 찾기
    const currentNoteStart = items.findIndex(
      (item) => item.noteId === currentItem.noteId
    );
    if (currentNoteStart > 0) {
      // 이전 note의 noteId
      const prevNoteId = items[currentNoteStart - 1].noteId;
      const prevNoteStart = items.findIndex(
        (item) => item.noteId === prevNoteId
      );
      playItem(prevNoteStart);
    }
  }, [state.currentIndex, items, playItem]);

  const stop = useCallback(() => {
    stopAudio();
    setState({ isPlaying: false, currentIndex: -1, isLoading: false });
  }, [stopAudio]);

  const reset = useCallback(() => {
    stopAudio();
    setState({ isPlaying: false, currentIndex: -1, isLoading: false });
    setRevealedUpTo(-1);
  }, [stopAudio]);

  const setVoice = useCallback((v: string) => {
    voiceRef.current = v;
  }, []);

  const revealUpTo = useCallback((index: number) => {
    setRevealedUpTo(index);
  }, []);

  return {
    ...state,
    revealedUpTo,
    play,
    pause,
    resume,
    next,
    prev,
    stop,
    reset,
    setVoice,
    revealUpTo,
    currentItem: state.currentIndex >= 0 ? items[state.currentIndex] : null,
  };
}

function fallbackSpeak(text: string, onEnd: () => void) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    onEnd();
    return;
  }
  // 원본 텍스트가 길 수 있으므로 앞 200자만
  const shortened = text.length > 200 ? text.slice(0, 200) + "..." : text;
  const utterance = new SpeechSynthesisUtterance(shortened);
  utterance.lang = "ko-KR";
  utterance.rate = 0.9;
  utterance.onend = onEnd;
  utterance.onerror = () => onEnd();
  speechSynthesis.speak(utterance);
}
