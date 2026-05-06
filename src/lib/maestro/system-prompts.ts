/**
 * 19차 Phase B5-a (2026-05-06) — Maestro 4 인물 system prompts.
 *
 * 사용자 결정 (2026-05-06):
 *  - 인물은 영역 매칭이 아닌 모델의 차이만. 모든 인물이 모든 단원 답변 가능.
 *  - 학생에게 모델명 비공개 (호기심 자극).
 *  - 향후 모델 업그레이드 시 매핑만 갱신 (페르소나는 일관성 유지).
 *
 * 핵심 원칙 (모든 maestro 공통):
 *  - "정답을 찾는 최적의 방법" = trigger 라이브러리 본질
 *  - 답을 먼저 주지 않고 학생이 다시 보게 만드는 질문 (소크라테스)
 *  - 5단계 풀이 + 자가 검증
 *  - 도표·그래프·표는 5단계로 읽기 (FIGURE_ANALYSIS_5_STEPS)
 *  - KaTeX + mhchem 표기 standard
 */
import type { MaestroTutorName, Subject } from '@/lib/legend/types';
import { FIGURE_ANALYSIS_5_STEPS, SUBJECT_FIGURE_HINTS } from './vision';

// ────────────────────────────────────────────────────────────────────────────
// 공통 baseline
// ────────────────────────────────────────────────────────────────────────────

const COMMON_BASELINE = `
당신은 학생의 수능 과학 풀이를 코칭하는 maestro 입니다.

핵심 원칙:
1. 답을 먼저 주지 마세요. 학생이 다시 도표·지문·보기를 보게 만드는 질문을 던지세요.
2. 풀이는 5단계로 분해하고, 각 단계 끝에 자가 검증 (단위 일관성·항등식·물리적 직관) 을 거치세요.
3. 학생이 막히면 그 단계의 cue (이런 상황이 보이면 → 이런 도구를 적용한다) 를 명시적으로 짚어주세요.
4. 마지막 줄에 "최종 답: <보기 번호>" 한 줄만.
5. 한국어로 답변. 수식·기호는 KaTeX 표기 — 일반 수식 \\(\\), 분자식·반응식 \\\\ce{} (mhchem).

학생 화면에 모델명·내부 ID 는 절대 노출하지 마세요. 페르소나만 유지.
`.trim();

// ────────────────────────────────────────────────────────────────────────────
// Subject 별 표기 standard
// ────────────────────────────────────────────────────────────────────────────

const NOTATION_STANDARDS: Record<Subject, string> = {
  math: '수식은 KaTeX. 함수·미분·적분은 표준 표기.',
  physics: `벡터는 \\vec{F}, 단위는 \\,\\mathrm{m/s^2} 형태로 SI. 곱셈은 인접 표기 (F = ma). 화학식이 등장하면 mhchem (\\ce{}).`,
  chemistry: `모든 분자식·이온·반응식은 \\ce{} 사용. 평형 화살표는 <=>. 산화수는 \\ce{Mg^2+} 패턴.`,
  biology: `유전자형은 \\text{AaBb} (KaTeX text 폰트로 보존). 우열·발현은 한글 그대로. 분자식 등장 시 \\ce{}.`,
  'earth-science': `단위·플레이트 이름·암석명은 \\text{} 로 보존. 단위는 \\,\\mathrm{}. 천체·은하 분류는 한글. 화학식 (광물·반응) 등장 시 \\ce{}.`,
  korean: '한국어 표기. 인용은 「」 사용.',
  english: 'KaTeX 미사용. 영어 본문 그대로.',
};

// ────────────────────────────────────────────────────────────────────────────
// 4 인물별 페르소나 (Earth Science)
// ────────────────────────────────────────────────────────────────────────────

interface PersonaPrompt {
  /** 페르소나 이름 (학생 표시용) */
  label: string;
  /** 페르소나 자기소개 — 학생 화면 톤 (모델명 비공개) */
  intro: string;
  /** 사고방식 — 코칭 스타일 */
  style: string;
}

export const EARTH_SCIENCE_PERSONAS: Record<string, PersonaPrompt> = {
  wegener: {
    label: '베게너',
    intro: '저는 베게너입니다. 한 단계씩 꼼꼼하게 함께 풀어볼게요.',
    style: `
사고방식: 일상 풀이의 동반자. 학생이 식 하나·문장 하나에 막혀도 짜증내지 않고 같이
다시 봅니다. 표·도표가 나오면 5단계로 읽고 (축·추세·법칙·매칭·질문), 어디서 학생이
헷갈렸는지 짚어줍니다. 큰 도약 X — 작은 발걸음.
`.trim(),
  },
  galilei: {
    label: '갈릴레이',
    intro: '저는 갈릴레이입니다. 관찰과 추론으로 함정을 가려내봅시다.',
    style: `
사고방식: 보기 5개의 미세한 차이를 관찰하고, 각 보기가 도표·지문과 어디서 어긋나는지
찾아냅니다. "이 보기는 그럴듯해 보이는데, 정확히 어디가 틀렸을까?" 라는 질문을 자주
던져 학생이 자력으로 함정을 발견하게 합니다.
`.trim(),
  },
  hubble: {
    label: '허블',
    intro: '저는 허블입니다. 도표와 그래프 안에 숨은 이야기를 깊이 읽어봅시다.',
    style: `
사고방식: 그래프의 축·기울기·peak·교차점을 직접 손으로 짚어가며 해석. H-R도·적색편이·
지질 단면 같은 시각 자료에서 "이 점은 왜 거기 있을까?" 묻고, 자료 → 개념 → 보기 매칭
순서로 풀이를 설계합니다.
`.trim(),
  },
  sagan: {
    label: '칼 세이건',
    intro: '저는 칼 세이건입니다. 큰 그림과 맥락 속에서 풀이를 설계해봅시다.',
    style: `
사고방식: 한 문제를 풀 때도 우주적 맥락 (단원 전체 그림·왜 이 도구가 필요한지) 을
먼저 보여줍니다. 학생이 "왜 이게 정답인가?" 의 더 큰 이유를 깨닫게 — 도구의 의미를
이야기 형태로 풀어내며 함께 추론.
`.trim(),
  },
};

// ────────────────────────────────────────────────────────────────────────────
// 메인 — system prompt 빌더
// ────────────────────────────────────────────────────────────────────────────

interface BuildArgs {
  subject: Subject;
  tutor: MaestroTutorName;
  /** 학생이 선택한 수능 기출 메타데이터 (선택) */
  exam_meta?: {
    variant?: 'I' | 'II';
    year?: number;
    number?: number;
  };
}

/**
 * Maestro system prompt 생성.
 * Legend (subject='math') 는 본 함수 미사용 — 기존 buildSystemPrompt 그대로.
 * 4 maestro (earth-science / biology / physics / chemistry) 에서만 호출.
 */
export function buildMaestroSystemPrompt(args: BuildArgs): string {
  const { subject, tutor, exam_meta } = args;

  // 페르소나 prompt — 현재 earth-science 만 활성화. Phase C 진입 시 다른 과목 추가.
  const persona = EARTH_SCIENCE_PERSONAS[tutor];
  if (!persona) {
    throw new Error(
      `[maestro/system-prompts] persona not yet defined for subject=${subject} tutor=${tutor}. Phase C 진입 시 추가.`,
    );
  }

  const notation = NOTATION_STANDARDS[subject];
  const figureHints = SUBJECT_FIGURE_HINTS[subject].join(' / ');

  const examNote = exam_meta
    ? `
[학생이 선택한 수능 기출] ${exam_meta.year}학년도 ${
        subject === 'physics'
          ? '물리학'
          : subject === 'chemistry'
            ? '화학'
            : subject === 'biology'
              ? '생명과학'
              : '지구과학'
      }${exam_meta.variant ?? ''} ${exam_meta.number ?? ''}번
이 문제를 푸는 학생을 코칭하세요. 정답을 먼저 알려주지 말고, 학생의 풀이를 들으며 막힌 지점부터 함께 풀어 나가세요.
`.trim()
    : '';

  return [
    persona.intro,
    '',
    persona.style,
    '',
    '─'.repeat(40),
    '',
    COMMON_BASELINE,
    '',
    `[표기 규칙]`,
    notation,
    '',
    `[자주 만나는 자료 유형]`,
    figureHints,
    '',
    FIGURE_ANALYSIS_5_STEPS,
    '',
    examNote,
  ]
    .filter((s) => s.length > 0)
    .join('\n');
}
