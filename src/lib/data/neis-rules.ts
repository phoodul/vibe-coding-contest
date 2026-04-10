/**
 * NEIS 생활기록부 세부능력 및 특기사항(세특) 작성 규칙
 * - EUC-KR 바이트 계산
 * - 금지어 감지
 * - 유사도 분석
 */

// ── EUC-KR 바이트 계산 ──
// NEIS는 EUC-KR 인코딩 기준: 한글 2바이트, 영문/숫자/공백 1바이트
// 정확한 EUC-KR 인코딩 없이도 한글/비한글 판별로 근사 계산 가능
export function calcNeisBytes(text: string): number {
  let bytes = 0;
  for (const char of text) {
    const code = char.charCodeAt(0);
    // 한글 완성형 (가-힣): 2바이트
    if (code >= 0xac00 && code <= 0xd7a3) {
      bytes += 2;
    }
    // 한글 자모 (ㄱ-ㅎ, ㅏ-ㅣ): 2바이트
    else if (code >= 0x3131 && code <= 0x318e) {
      bytes += 2;
    }
    // 줄바꿈: CR+LF = 2바이트
    else if (char === "\n") {
      bytes += 2;
    }
    // 나머지 (영문, 숫자, 공백, ASCII 특수문자): 1바이트
    else if (code <= 0x7e) {
      bytes += 1;
    }
    // 전각 특수문자, CJK 기호 등: 2바이트
    else {
      bytes += 2;
    }
  }
  return bytes;
}

// ── 과목별 바이트 제한 ──
export const BYTE_LIMITS: Record<string, number> = {
  "세부능력 및 특기사항": 500,
  "행동특성 및 종합의견": 500,
  자율활동: 500,
  동아리활동: 500,
  진로활동: 500,
  봉사활동: 500,
};

export const SUBJECTS = [
  "국어", "수학", "영어", "사회", "과학", "역사",
  "도덕", "음악", "미술", "체육", "기술·가정",
  "정보", "제2외국어", "한문", "교양",
] as const;

// ── 금지어 데이터베이스 ──
export interface ForbiddenMatch {
  word: string;
  category: string;
  reason: string;
  startIdx: number;
  endIdx: number;
}

const FORBIDDEN_PATTERNS: {
  pattern: RegExp;
  category: string;
  reason: string;
}[] = [
  // 교외 수상
  { pattern: /교외\s*(수상|대회|공모전|올림피아드)/g, category: "교외수상", reason: "교외 수상 실적 기재 금지" },
  { pattern: /(전국|시도|도|시|구|군)\s*(대회|경시|올림피아드|공모전)/g, category: "교외수상", reason: "교외 대회 참가 기재 금지" },
  { pattern: /대상|금상|은상|동상|장려상|최우수상|우수상/g, category: "교외수상", reason: "수상 명칭 기재 금지 (교내 제외)" },

  // 부모/보호자 정보
  { pattern: /(아버지|어머니|부모|보호자)\s*(직업|직장|회사|근무)/g, category: "보호자정보", reason: "보호자의 사회·경제적 지위 암시 금지" },
  { pattern: /(의사|변호사|교수|사장|대표|CEO|임원)\s*(자녀|아들|딸|집안)/g, category: "보호자정보", reason: "보호자 직업 암시 금지" },

  // 사교육
  { pattern: /(학원|과외|인강|인터넷\s*강의|사설\s*교육|사교육)/g, category: "사교육", reason: "사교육 관련 내용 기재 금지" },
  { pattern: /메가스터디|대성마이맥|이투스|스카이에듀|에듀윌/g, category: "사교육", reason: "사교육 업체명 기재 금지" },

  // 공인시험
  { pattern: /TOEIC|TOEFL|IELTS|TEPS|HSK|JLPT|JPT|DELF|토익|토플|텝스/gi, category: "공인시험", reason: "공인어학시험 성적·응시 기재 금지" },
  { pattern: /한국사\s*능력\s*검정|한국어\s*능력\s*시험|KBS\s*한국어/g, category: "공인시험", reason: "공인시험 기재 금지" },

  // 등수/석차
  { pattern: /(\d+)\s*(등|위|석차|등수)/g, category: "등수", reason: "구체적 등수·석차 기재 금지" },
  { pattern: /(수석|차석|꼴찌|1등|일등|전교\s*\d+)/g, category: "등수", reason: "등수 표현 기재 금지" },
  { pattern: /(상위|하위)\s*\d+\s*%/g, category: "등수", reason: "석차 백분율 기재 금지" },

  // 선행학습 유발
  { pattern: /(대학교|대학원)\s*(수준|교재|과정)/g, category: "선행학습", reason: "선행학습 유발 표현 금지" },
  { pattern: /AP\s*(과목|수업|시험)|IB\s*(과정|디플로마)/gi, category: "선행학습", reason: "선행학습 유발 표현 금지" },

  // 자격증 (제한적)
  { pattern: /(운전\s*면허|자격증\s*취득|자격\s*시험\s*합격)/g, category: "자격증", reason: "자격증 취득 사실 기재 제한" },
];

export function detectForbidden(text: string): ForbiddenMatch[] {
  const matches: ForbiddenMatch[] = [];
  for (const { pattern, category, reason } of FORBIDDEN_PATTERNS) {
    // Reset regex state
    const re = new RegExp(pattern.source, pattern.flags);
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      matches.push({
        word: m[0],
        category,
        reason,
        startIdx: m.index,
        endIdx: m.index + m[0].length,
      });
    }
  }
  // 중복 제거 (같은 위치)
  return matches.filter(
    (m, i, arr) =>
      arr.findIndex((x) => x.startIdx === m.startIdx && x.endIdx === m.endIdx) === i
  );
}

// ── 유사도 분석 (n-gram 기반) ──
function getNGrams(text: string, n: number): Set<string> {
  const grams = new Set<string>();
  const cleaned = text.replace(/\s+/g, "");
  for (let i = 0; i <= cleaned.length - n; i++) {
    grams.add(cleaned.slice(i, i + n));
  }
  return grams;
}

export function calcSimilarity(a: string, b: string): number {
  const gramsA = getNGrams(a, 3);
  const gramsB = getNGrams(b, 3);
  if (gramsA.size === 0 || gramsB.size === 0) return 0;
  let intersection = 0;
  for (const g of gramsA) {
    if (gramsB.has(g)) intersection++;
  }
  return intersection / Math.max(gramsA.size, gramsB.size);
}
