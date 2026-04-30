/**
 * Phase G-06 — 5 튜터 흉상 이미지 매핑.
 *
 * 베이스 문서: docs/architecture-g06-legend.md §6 (TutorBadge / TutorPickerModal / EscalationPrompt).
 *
 * 모든 portrait 는 public/ 하위 PD 자료. 라이선스는 public/LICENSES.md 참조.
 * label_ko + model_short 는 UI 표기용 (Δ1 QuotaIndicator·TutorBadge 일관성).
 */
import type { TutorName } from './types';

export interface TutorPortrait {
  /** /public 경로 (Next/Image src 로 그대로 사용) */
  src: string;
  alt: string;
  /** 한글 라벨 — TutorBadge / EscalationPrompt 표시 */
  label_ko: string;
  /**
   * 모델 한 줄 설명 — admin / dev / billing 페이지 한정 (raw 모델명 노출).
   * 학생 화면 (TutorBadge / PerProblemReportCard / BetaChat) 에는 절대 노출 X
   * — G06-35c (Δ12) 베타 결함 3 fix. persona_desc 로 대체.
   */
  model_short: string;
  /**
   * G06-35c (Δ12) — 학생 화면용 페르소나 설명 (모델명 X).
   * "Gemini 3.1 Pro" 같은 raw 모델명 대신 "수학의 왕자" 등 인물 캐릭터 묘사.
   */
  persona_desc: string;
  /**
   * G06-26 (Δ5) — 격 차별화 메타.
   * '기본' = 라마누잔 (단순·중등 / 일 5문제 한도)
   * '거장' = 4 레전드 (고난도 전문 / 일 3회 한도)
   */
  tier_label: '기본' | '거장';
}

export const PORTRAITS: Record<TutorName, TutorPortrait> = {
  ramanujan_calc: {
    src: '/ramanujan-portrait.jpg',
    alt: '라마누잔 (계산 모드)',
    label_ko: '라마누잔',
    model_short: 'Haiku 4.5 + SymPy',
    persona_desc: '계산의 달인',
    tier_label: '기본',
  },
  ramanujan_intuit: {
    src: '/ramanujan-portrait.jpg',
    alt: '라마누잔 (직관 모드)',
    label_ko: '라마누잔',
    model_short: 'Opus 4.7',
    persona_desc: '직관과 통찰의 천재',
    tier_label: '기본',
  },
  gauss: {
    src: '/gauss-portrait.jpg',
    alt: '가우스',
    label_ko: '가우스',
    model_short: 'Gemini 3.1 Pro',
    persona_desc: '수학의 왕자',
    tier_label: '거장',
  },
  von_neumann: {
    src: '/von-neumann-portrait.jpg',
    alt: '폰 노이만',
    label_ko: '폰 노이만',
    model_short: 'GPT-5.5',
    persona_desc: '기하·해석의 거장',
    tier_label: '거장',
  },
  euler: {
    src: '/euler-portrait.jpg',
    alt: '오일러',
    label_ko: '오일러',
    model_short: 'Opus 4.7 agentic',
    persona_desc: '모든 수학을 잇는 다리',
    tier_label: '거장',
  },
  leibniz: {
    src: '/leibniz-portrait.jpg',
    alt: '라이프니츠',
    label_ko: '라이프니츠',
    model_short: 'Sonnet 4.6 agentic',
    persona_desc: '미적분의 창시자',
    tier_label: '거장',
  },
};

/**
 * label_ko 만 빠르게 조회 (TutorBadge import 비용 최소화 시).
 */
export function getTutorLabelKo(tutor: TutorName): string {
  return PORTRAITS[tutor].label_ko;
}

/**
 * model_short 만 빠르게 조회 — admin/dev 전용. 학생 화면에는 절대 사용 X.
 */
export function getTutorModelShort(tutor: TutorName): string {
  return PORTRAITS[tutor].model_short;
}

/**
 * G06-35c — 학생 화면 페르소나 설명. raw 모델명 대신 인물 캐릭터 묘사.
 */
export function getTutorPersonaDesc(tutor: TutorName): string {
  return PORTRAITS[tutor].persona_desc;
}
