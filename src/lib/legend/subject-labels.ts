/**
 * subject_hint (BetaChat / TrialChat 의 학년/과목 chip) → 학생 친화 라벨.
 *
 * 'free' 또는 null 이면 system prompt 에 학년 안내를 추가하지 않음 (Manager 자동분류).
 *
 * id 는 src/lib/ai/euler-prompt.ts MATH_AREAS 와 1:1 매칭.
 */

const SUBJECT_LABEL: Record<string, string> = {
  middle1: '중학교 1학년 수학',
  middle2: '중학교 2학년 수학',
  middle3: '중학교 3학년 수학',
  common: '고등학교 공통수학 (고1)',
  math1: '수학Ⅰ (지수·로그·삼각함수·수열)',
  math2: '수학Ⅱ (극한·연속·다항함수 미적분)',
  calculus: '미적분 (선택과목)',
  probability: '확률과 통계 (선택과목)',
  geometry: '기하 (선택과목 — 이차곡선·벡터·공간도형)',
};

/**
 * subject_hint 를 system prompt 에 추가할 안내 문장으로 변환.
 * hint 가 없거나 'free' 면 빈 문자열 반환 (Manager 자동분류 보존).
 */
export function buildSubjectHintNote(hint: string | null | undefined): string {
  if (!hint || hint === 'free') return '';
  const label = SUBJECT_LABEL[hint];
  if (!label) return '';
  return `

[학생이 명시적으로 선택한 학년/과목] ${label}
이 학년 수준의 어휘·개념·표기를 우선 사용하세요. 더 상위/하위 단원 도구가 필요하면 짧게 언급하되, 풀이의 중심은 학생이 선택한 학년에 둡니다.`;
}
