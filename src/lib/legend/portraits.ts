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
  BiologyTutorName,
  PhysicsTutorName,
  ChemistryTutorName,
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
 * 19차 Phase B — Earth Science Maestro 4 인물 portrait.
 *
 * 사용자 결정 (2026-05-06):
 *  - 인물 = 영역 잘 하는 사람이 아니라 모델의 차이. 단순 대표 인물.
 *  - 학생에게 모델은 공개 X — 호기심 자극.
 *  - 모델 매핑 (위치 왼→오른쪽): Sonnet 4.6 (기본) / Gemini 3.1 Pro / Opus 4.7 / GPT-5.5
 *
 * Portrait 라이선스 (모두 PD ✅):
 *  - wegener: Wikimedia Commons "Alfred_Wegener_ca.1924-30.jpg" — pre-1931 익명
 *  - galilei: Sustermans 1636 초상 — 작가 사망 1681
 *  - hubble: Hagemeyer 1931 사진 — pre-1977 미국 출판 + no notice
 *  - sagan: NASA/JPL 1980 (Planetary Society 창립) — 미국 연방정부 PD
 */
export const EARTH_SCIENCE_PORTRAITS: Record<EarthScienceTutorName, TutorPortrait> = {
  wegener: {
    src: '/wegener-portrait.jpg',
    alt: '알프레드 베게너',
    label_ko: '베게너',
    model_short: 'Sonnet 4.6',
    persona_desc: '대륙을 움직인 사색가',
    tier_label: '기본',
  },
  galilei: {
    src: '/galilei-portrait.jpg',
    alt: '갈릴레오 갈릴레이',
    label_ko: '갈릴레이',
    model_short: 'Gemini 3.1 Pro',
    persona_desc: '하늘을 처음 들여다본 거장',
    tier_label: '거장',
  },
  hubble: {
    src: '/hubble-portrait.jpg',
    alt: '에드윈 허블',
    label_ko: '허블',
    model_short: 'Opus 4.7',
    persona_desc: '우주가 팽창함을 본 사람',
    tier_label: '거장',
  },
  sagan: {
    src: '/sagan-portrait.jpg',
    alt: '칼 세이건',
    label_ko: '칼 세이건',
    model_short: 'GPT-5.5',
    persona_desc: '코스모스의 이야기꾼',
    tier_label: '거장',
  },
};

/** Phase C-Biology — 파스퇴르(기본)·멘델·왓슨·다윈 (4 인물). 사용자 결정 2026-05-07 */
export const BIOLOGY_PORTRAITS: Record<BiologyTutorName, TutorPortrait> = {
  pasteur: {
    src: '/pasteur-portrait.jpg',
    alt: '루이 파스퇴르',
    label_ko: '파스퇴르',
    model_short: 'Sonnet 4.6',
    persona_desc: '미생물의 비밀을 푼 화학자',
    tier_label: '기본',
  },
  mendel: {
    src: '/mendel-portrait.jpg',
    alt: '그레고어 멘델',
    label_ko: '멘델',
    model_short: 'Gemini 3.1 Pro',
    persona_desc: '유전을 셈한 수도사',
    tier_label: '거장',
  },
  watson: {
    src: '/watson-portrait.jpg',
    alt: '제임스 왓슨',
    label_ko: '왓슨',
    model_short: 'Opus 4.7',
    persona_desc: 'DNA 이중나선의 발견자',
    tier_label: '거장',
  },
  darwin: {
    src: '/darwin-portrait.jpg',
    alt: '찰스 다윈',
    label_ko: '다윈',
    model_short: 'GPT-5.5',
    persona_desc: '진화를 발견한 박물학자',
    tier_label: '거장',
  },
};

/** Phase C-Physics — 페르미(기본)·아인슈타인·파인만·뉴턴 (4 인물). 사용자 결정 2026-05-07 */
export const PHYSICS_PORTRAITS: Record<PhysicsTutorName, TutorPortrait> = {
  fermi: {
    src: '/fermi-portrait.jpg',
    alt: '엔리코 페르미',
    label_ko: '페르미',
    model_short: 'Sonnet 4.6',
    persona_desc: '핵과 추정의 거장',
    tier_label: '기본',
  },
  einstein: {
    src: '/einstein-portrait.jpg',
    alt: '알버트 아인슈타인',
    label_ko: '아인슈타인',
    model_short: 'Gemini 3.1 Pro',
    persona_desc: '시공간을 새로 본 거인',
    tier_label: '거장',
  },
  feynman: {
    src: '/feynman-portrait.jpg',
    alt: '리처드 파인만',
    label_ko: '파인만',
    model_short: 'Opus 4.7',
    persona_desc: '직관과 다이어그램의 천재',
    tier_label: '거장',
  },
  newton: {
    src: '/newton-portrait.jpg',
    alt: '아이작 뉴턴',
    label_ko: '뉴턴',
    model_short: 'GPT-5.5',
    persona_desc: '운동의 법칙을 세운 사람',
    tier_label: '거장',
  },
};

/** Phase C-Chemistry — 마리 퀴리(기본)·라부아지에·폴링·멘델레예프 (4 인물). 사용자 결정 2026-05-07 */
export const CHEMISTRY_PORTRAITS: Record<ChemistryTutorName, TutorPortrait> = {
  curie: {
    src: '/curie-portrait.jpg',
    alt: '마리 퀴리',
    label_ko: '마리 퀴리',
    model_short: 'Sonnet 4.6',
    persona_desc: '라듐과 방사성의 개척자',
    tier_label: '기본',
  },
  lavoisier: {
    src: '/lavoisier-portrait.jpg',
    alt: '앙투안 라부아지에',
    label_ko: '라부아지에',
    model_short: 'Gemini 3.1 Pro',
    persona_desc: '근대 화학의 아버지',
    tier_label: '거장',
  },
  pauling: {
    src: '/pauling-portrait.jpg',
    alt: '라이너스 폴링',
    label_ko: '폴링',
    model_short: 'Opus 4.7',
    persona_desc: '결합과 구조의 통찰가',
    tier_label: '거장',
  },
  mendeleev: {
    src: '/mendeleev-portrait.jpg',
    alt: '드미트리 멘델레예프',
    label_ko: '멘델레예프',
    model_short: 'GPT-5.5',
    persona_desc: '주기율표의 설계자',
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
  'earth-science': ['wegener', 'galilei', 'hubble', 'sagan'],
  biology: ['pasteur', 'mendel', 'watson', 'darwin'],
  physics: ['fermi', 'einstein', 'feynman', 'newton'],
  chemistry: ['curie', 'lavoisier', 'pauling', 'mendeleev'],
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
  if (subject === 'math') return PORTRAITS[tutor as TutorName];
  if (subject === 'earth-science') return EARTH_SCIENCE_PORTRAITS[tutor as EarthScienceTutorName];
  if (subject === 'biology') return BIOLOGY_PORTRAITS[tutor as BiologyTutorName];
  if (subject === 'physics') return PHYSICS_PORTRAITS[tutor as PhysicsTutorName];
  if (subject === 'chemistry') return CHEMISTRY_PORTRAITS[tutor as ChemistryTutorName];
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
