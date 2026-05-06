/**
 * 19차 (2026-05-06) — Maestro Vision: 표·그림 분석 강화 인프라.
 *
 * 사용자 강조 (2026-05-06): "Table이나 그림 분석이 매우 중요해"
 *
 * 수능 과학 (특히 Earth Science / Biology / Physics / Chemistry) 의 지문은
 * 그래프·도표·가계도·반응 모식도가 본문 자체. 단순 텍스트 OCR 로는 풀이 불가능.
 *
 * 본 모듈은 4 maestro 가 공유하는 vision LLM 호출 인프라.
 * Gauss 듀얼 튜터의 Ctrl+V 이미지 패턴을 일반화.
 *
 * 모델 선택:
 *   - 1차: Sonnet 4.6 vision (정확도·비용 균형)
 *   - 2차: GPT-5.5 vision (특수 그래프·복잡 도식)
 *   - 3차: Gemini 3.1 Pro vision (긴 페이지·다중 이미지)
 *
 * Phase B-Earth Science 에서 실제 호출 구현. 본 파일은 인터페이스 골격.
 */

import type { Subject } from '@/lib/legend/types';

/** 자료 유형 — system prompt 의 "도표 5단계" 분기 */
export type FigureKind =
  | 'graph'        // x-y 좌표·기울기·peak (Physics·Earth Science 빈출)
  | 'table'        // 행/열 데이터 (Chemistry·Biology)
  | 'pedigree'     // 가계도 (Biology 유전 ⭐)
  | 'reaction'     // 반응 모식도 (Chemistry)
  | 'cross-section'// 지질 단면·층서 (Earth Science)
  | 'celestial'    // 천체 도식·별 분류 (Earth Science)
  | 'circuit'      // 전기 회로 (Physics)
  | 'free-body'    // 자유물체도·역학 (Physics)
  | 'unknown';     // LLM 자동 판정

export interface VisionInput {
  /** subject — system prompt 분기 */
  subject: Subject;
  /** base64 또는 https URL */
  image: string;
  /** 학생이 같이 입력한 텍스트 (있으면 LLM 가이드) */
  user_question?: string;
  /** 자료 유형 (학생/UI 가 명시 가능, 미지정 시 'unknown' = LLM 자동 판정) */
  figure_kind?: FigureKind;
}

export interface VisionOutput {
  /** 자료 유형 (LLM 판정 결과) */
  detected_kind: FigureKind;
  /** 도표에서 추출한 핵심 데이터 — subject 별 schema 다름 */
  extracted: VisionExtracted;
  /** 학생에게 던질 첫 소크라테스 질문 (도표 5단계 step 5) */
  first_question: string;
  /** 진단 — 어디부터 막혔을 가능성 */
  hypothesis?: string;
}

export type VisionExtracted =
  | { kind: 'graph'; axes: { x: string; y: string }; trend: string; key_points: string[] }
  | { kind: 'table'; columns: string[]; rows: string[][]; pattern?: string }
  | { kind: 'pedigree'; generations: number; affected: string[]; inheritance_hint?: string }
  | { kind: 'reaction'; reactants: string[]; products: string[]; type?: string }
  | { kind: 'cross-section'; layers: string[]; structures?: string[] }
  | { kind: 'celestial'; objects: string[]; relationships?: string[] }
  | { kind: 'circuit'; components: string[]; connections?: string[] }
  | { kind: 'free-body'; forces: string[]; mass?: string }
  | { kind: 'unknown'; raw_description: string };

/**
 * 도표 5단계 — 모든 maestro system prompt 의 vision 분석 표준.
 *
 * 1. 축·단위·범례 먼저 식별
 * 2. 추세·peak·교차점 위치 파악
 * 3. 데이터 → 개념 (도표가 어떤 법칙을 보여주는지)
 * 4. 문제의 보기와 매칭
 * 5. 의심스러운 영역 = 학생에게 질문 던지기 (소크라테스 방식)
 */
export const FIGURE_ANALYSIS_5_STEPS = `
표·그림 분석 5단계 (모든 응답에서 의식적으로 따를 것):
1. 축·단위·범례를 먼저 식별 (x축이 무엇? y축 단위는? 색·점선 의미?)
2. 추세·peak·교차점·기울기·outlier 위치 파악 (단순 묘사)
3. 데이터 → 개념 매핑 (이 도표가 보여주는 법칙·원리는?)
4. 문제의 보기 5개를 도표와 1:1 매칭 (각 보기가 도표 어디와 일치/불일치?)
5. 가장 헷갈릴 만한 영역에서 학생에게 질문 — "여기 왜 이렇게 변할까?" (소크라테스)

핵심: 답을 먼저 주지 말 것. 학생이 도표를 다시 보게 만드는 질문이 도구.
`.trim();

/**
 * Subject 별 자료 유형 hint — system prompt 에 주입.
 * 각 maestro 가 만나는 figure 의 70% 는 본 hint 의 첫 2~3개 종류.
 */
export const SUBJECT_FIGURE_HINTS: Record<Subject, readonly FigureKind[]> = {
  math: ['graph', 'table'],
  physics: ['graph', 'circuit', 'free-body', 'table'],
  chemistry: ['reaction', 'table', 'graph'],
  biology: ['pedigree', 'table', 'graph'],
  'earth-science': ['cross-section', 'celestial', 'graph', 'table'],
  korean: [],   // Phase 5+
  english: [],  // Phase 5+
};

/**
 * Vision LLM 호출 — Phase B-Earth Science 에서 Sonnet 4.6 vision 으로 구현 예정.
 *
 * @throws 현재 미구현. 호출 시 명시적 에러로 빠른 발견.
 */
export async function analyzeVision(_input: VisionInput): Promise<VisionOutput> {
  throw new Error(
    '[maestro/vision] analyzeVision not implemented. Phase B-Earth Science 진입 시 Sonnet 4.6 vision 으로 구현.',
  );
}
