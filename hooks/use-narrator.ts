"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export type NarratorVoiceType = "calm-male" | "calm-female" | "fun";

interface NarratorState {
  isPlaying: boolean;
  isPaused: boolean;
  currentIndex: number;
  voiceType: NarratorVoiceType;
}

interface NarratorItem {
  id: string;
  label: string;
  text: string;
}

const VOICE_LABELS: Record<NarratorVoiceType, string> = {
  "calm-male": "차분한 남성",
  "calm-female": "차분한 여성",
  "fun": "재미있는 설명",
};

function getVoice(type: NarratorVoiceType): SpeechSynthesisVoice | null {
  const voices = speechSynthesis.getVoices();
  const koreanVoices = voices.filter((v) => v.lang.startsWith("ko"));

  if (koreanVoices.length === 0) return null;

  // Try to match voice type preferences
  if (type === "calm-female") {
    const female = koreanVoices.find(
      (v) => v.name.includes("여") || v.name.includes("Female") || v.name.includes("Yuna") || v.name.includes("Sunhi")
    );
    return female || koreanVoices[0];
  }

  if (type === "calm-male") {
    const male = koreanVoices.find(
      (v) => v.name.includes("남") || v.name.includes("Male") || v.name.includes("Heami")
    );
    return male || koreanVoices[koreanVoices.length > 1 ? 1 : 0];
  }

  // Fun voice - use any Korean voice with faster rate
  return koreanVoices[0];
}

export function useNarrator(items: NarratorItem[]) {
  const [state, setState] = useState<NarratorState>({
    isPlaying: false,
    isPaused: false,
    currentIndex: 0,
    voiceType: "calm-female",
  });

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // Load voices
  useEffect(() => {
    speechSynthesis.getVoices();
    const handleVoicesChanged = () => speechSynthesis.getVoices();
    speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);
    return () => {
      speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
      speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback(
    (index: number) => {
      if (index >= itemsRef.current.length) {
        setState((s) => ({ ...s, isPlaying: false, isPaused: false }));
        return;
      }

      speechSynthesis.cancel();

      const item = itemsRef.current[index];
      const utterance = new SpeechSynthesisUtterance(item.text);
      utterance.lang = "ko-KR";

      const voice = getVoice(state.voiceType);
      if (voice) utterance.voice = voice;

      // Adjust rate based on voice type
      utterance.rate = state.voiceType === "fun" ? 1.1 : 0.9;
      utterance.pitch = state.voiceType === "fun" ? 1.15 : 1.0;

      utterance.onend = () => {
        // Auto-advance to next item
        const nextIndex = index + 1;
        setState((s) => ({ ...s, currentIndex: nextIndex }));
        if (nextIndex < itemsRef.current.length) {
          // Small pause between items
          setTimeout(() => speak(nextIndex), 800);
        } else {
          setState((s) => ({ ...s, isPlaying: false, isPaused: false }));
        }
      };

      utteranceRef.current = utterance;
      setState((s) => ({ ...s, currentIndex: index, isPlaying: true, isPaused: false }));
      speechSynthesis.speak(utterance);
    },
    [state.voiceType]
  );

  const play = useCallback(
    (fromIndex?: number) => {
      const idx = fromIndex ?? state.currentIndex;
      speak(idx);
    },
    [speak, state.currentIndex]
  );

  const pause = useCallback(() => {
    speechSynthesis.pause();
    setState((s) => ({ ...s, isPaused: true }));
  }, []);

  const resume = useCallback(() => {
    speechSynthesis.resume();
    setState((s) => ({ ...s, isPaused: false }));
  }, []);

  const stop = useCallback(() => {
    speechSynthesis.cancel();
    setState((s) => ({ ...s, isPlaying: false, isPaused: false, currentIndex: 0 }));
  }, []);

  const next = useCallback(() => {
    const nextIndex = state.currentIndex + 1;
    if (nextIndex < items.length) {
      speak(nextIndex);
    }
  }, [state.currentIndex, items.length, speak]);

  const prev = useCallback(() => {
    const prevIndex = Math.max(0, state.currentIndex - 1);
    speak(prevIndex);
  }, [state.currentIndex, speak]);

  const goTo = useCallback(
    (index: number) => {
      speak(index);
    },
    [speak]
  );

  const setVoiceType = useCallback((type: NarratorVoiceType) => {
    speechSynthesis.cancel();
    setState((s) => ({ ...s, voiceType: type, isPlaying: false, isPaused: false }));
  }, []);

  return {
    ...state,
    play,
    pause,
    resume,
    stop,
    next,
    prev,
    goTo,
    setVoiceType,
    voiceLabels: VOICE_LABELS,
    totalItems: items.length,
  };
}
