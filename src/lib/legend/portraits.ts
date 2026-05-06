/**
 * Phase G-06 — 5 튜터 흉상 이미지 매핑.
 *
 * 베이스 문서: docs/architecture-g06-legend.md §6 (TutorBadge / TutorPickerModal / EscalationPrompt).
 *
 * 모든 portrait 는 public/ 하위 PD 자료. 라이선스는 public/LICENSES.md 참조.
 * label_ko + model_short 는 UI 표기용 (Δ1 QuotaIndicator·TutorBadge 일관성).
 */
import type {
  Subject,
  TutorName,
  MaestroTutorName,
  EarthScienceTutorName,
} from './types';

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
 * 19차 Phase B — Earth Science Maestro 3 거장.
 *
 * Legend (수학) 의 PORTRAITS Record 와 분리. tutor-orchestrator·fallback·report
 * 는 수학 전용이므로 본 Record 는 영향 없음. UI (TutorBadge·TutorPickerModal)
 * 는 BetaChat subject prop 통합 시 (Phase B5) 본 Record 도 lookup 하도록 확장.
 *
 * Portrait 은 placeholder SVG. 진짜 이미지는 사용자 업로드 후 src 교체.
 */
export const EARTH_SCIENCE_PORTRAITS: Record<EarthScienceTutorName, TutorPortrait> = {
  wegener: {
    src: '/earth-science-portrait-placeholder.svg',
    alt: '베게너 (대륙이동)',
    label_ko: '베게너',
    model_short: 'Sonnet 4.6',
    persona_desc: '대륙이동의 발견자',
    tier_label: '기본',
  },
  galilei: {
    src: '/earth-science-portrait-placeholder.svg',
    alt: '갈릴레이 (천체 관측)',
    label_ko: '갈릴레이',
    model_short: 'Opus 4.7',
    persona_desc: '근대 천문학의 시조',
    tier_label: '거장',
  },
  hubble: {
    src: '/earth-science-portrait-placeholder.svg',
    alt: '허블 (우주 팽창)',
    label_ko: '허블',
    model_short: 'Gemini 3.1 Pro',
    persona_desc: '우주 팽창의 발견자',
    tier_label: '거장',
  },
};

/**
 * 19차 (2026-05-06) — Maestro 4 과목 페르소나 매핑.
 *
 * math = 5거장 (Legend, 기존 보존)
 * earth-science / biology / physics / chemistry = Phase B/C 에서 페르소나·portrait 채움.
 *
 * 페르소나 추가 절차:
 *   1. types.ts: TutorName union 확장
 *   2. portraits.ts: PORTRAITS entry 추가 (src·alt·label_ko·persona_desc·tier_label)
 *   3. PERSONAS_BY_SUBJECT 매핑 갱신
 */
export const PERSONAS_BY_SUBJECT: Record<Subject, readonly MaestroTutorName[]> = {
  math: ['ramanujan_calc', 'ramanujan_intuit', 'gauss', 'von_neumann', 'euler', 'leibniz'],
  'earth-science': ['wegener', 'galilei', 'hubble'], // Phase B 활성화
  biology: [],         // Phase C-Biology: 다윈·멘델·왓슨
  physics: [],         // Phase C-Physics: 파인만·뉴턴·아인슈타인
  chemistry: [],       // Phase C-Chemistry: 멘델레예프·라부아지에·폴링
  korean: [],          // Phase 5+: 세종·정약용·이이
  english: [],         // Phase 5+: 셰익스피어·처칠·촘스키
};

/**
 * 한 subject 의 모든 페르소나 목록 (UI · TutorPickerModal 용).
 */
export function getPersonasForSubject(subject: Subject): readonly MaestroTutorName[] {
  return PERSONAS_BY_SUBJECT[subject];
}

/**
 * subject + tutor → portrait lookup (UI 용).
 * Legend (math) 는 PORTRAITS, Earth Science 는 EARTH_SCIENCE_PORTRAITS 에서 조회.
 * 향후 Biology/Physics/Chemistry 도 동일 패턴으로 분기 추가.
 */
export function getMaestroPortrait(
  subject: Subject,
  tutor: MaestroTutorName,
): TutorPortrait | undefined {
  if (subject === 'math') {
    return PORTRAITS[tutor as TutorName];
  }
  if (subject === 'earth-science') {
    return EARTH_SCIENCE_PORTRAITS[tutor as EarthScienceTutorName];
  }
  return undefined;
}

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
