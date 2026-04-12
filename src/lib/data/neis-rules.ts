/**
 * NEIS 학교생활기록부 작성 규칙 (2026학년도 기재요령 기준)
 * - UTF-8 바이트 계산 (한글 3바이트, 영문/숫자 1바이트, 엔터 1바이트)
 * - 영역별 글자수 제한
 * - 금지어 감지
 * - 유사도 분석
 * - 가명처리 (개인정보 보호)
 */

// ── NEIS 바이트 계산 (2026 기재요령 p.208) ──
// "교육정보시스템에서 입력 글자의 단위는 Byte이며,
//  한글 1자는 3Byte, 영문·숫자 1자는 1Byte, 엔터(Enter)는 1Byte임."
export function calcNeisBytes(text: string): number {
  let bytes = 0;
  for (const char of text) {
    const code = char.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) bytes += 3;      // 한글 완성형
    else if (code >= 0x3131 && code <= 0x318e) bytes += 3;  // 한글 자모
    else if (char === "\n") bytes += 1;                      // 엔터
    else if (code <= 0x7e) bytes += 1;                       // ASCII
    else bytes += 3;                                          // 기타 유니코드
  }
  return bytes;
}

// ── 학생부 영역별 글자수 제한 (2026 기재요령 p.208) ──
// "최대 글자수 (한글 기준)" → 바이트 한도 = charLimit × 3
export interface RecordArea {
  id: string;
  label: string;
  charLimit: number;   // 한글 기준 최대 글자수
  byteLimit: number;   // charLimit × 3
  hasSubject?: boolean; // 과목 선택 필요 여부
  description: string;  // 작성 안내
}

export const RECORD_AREAS: RecordArea[] = [
  { id: "subject_specific", label: "과목별 세부능력 및 특기사항", charLimit: 500, byteLimit: 1500, hasSubject: true, description: "교과 수업에서 관찰한 학생의 구체적 활동·태도·성장을 서술" },
  { id: "individual_specific", label: "개인별 세부능력 및 특기사항", charLimit: 500, byteLimit: 1500, description: "교과 전반에 걸친 학생의 개별 특성과 성장을 종합 서술" },
  { id: "behavior", label: "행동특성 및 종합의견", charLimit: 300, byteLimit: 900, description: "학생의 인성, 사회성, 자기관리 등 행동 특성을 종합적으로 서술" },
  { id: "autonomous", label: "자율·자치활동", charLimit: 500, byteLimit: 1500, description: "학생회, 자치법정, 학급활동 등 자율·자치 참여 내용 서술" },
  { id: "club", label: "동아리활동", charLimit: 500, byteLimit: 1500, description: "정규/자율 동아리에서의 활동 내용과 역할 서술" },
  { id: "career", label: "진로활동", charLimit: 500, byteLimit: 1500, description: "진로 탐색, 직업 체험, 상담 등 진로 관련 활동 서술" },
  { id: "reading_common", label: "독서활동상황(공통)", charLimit: 500, byteLimit: 1500, description: "특정 교과 구분 없이 읽은 도서와 독서 활동 서술" },
  { id: "reading_subject", label: "독서활동상황(과목별)", charLimit: 250, byteLimit: 750, hasSubject: true, description: "해당 교과 관련 도서의 독서 활동 서술" },
  { id: "attendance", label: "출결상황", charLimit: 500, byteLimit: 1500, description: "출결 관련 특기사항 서술" },
  { id: "daily_life", label: "일상생활 활동상황", charLimit: 1000, byteLimit: 3000, description: "일상생활에서 관찰되는 학생의 특성 서술 (초등)" },
];

// 레거시 호환
export const BYTE_LIMITS: Record<string, number> = Object.fromEntries(
  RECORD_AREAS.map((a) => [a.label, a.byteLimit])
);

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

// ── 가명처리 (개인정보 보호) ──
const PSEUDO_LABELS = ["학생A","학생B","학생C","학생D","학생E","학생F","학생G","학생H","학생I","학생J","학생K","학생L","학생M","학생N","학생O","학생P","학생Q","학생R","학생S","학생T"];

export interface NameMapping { real: string; pseudo: string; }

export function buildNameMap(names: string[]): NameMapping[] {
  return names.filter(Boolean).map((name, i) => ({
    real: name.trim(),
    pseudo: PSEUDO_LABELS[i] || `학생${i + 1}`,
  }));
}

export function pseudonymize(text: string, map: NameMapping[]): string {
  let result = text;
  for (const { real, pseudo } of map) {
    if (real) result = result.replaceAll(real, pseudo);
  }
  return result;
}

export function depseudonymize(text: string, map: NameMapping[]): string {
  let result = text;
  for (const { real, pseudo } of map) {
    result = result.replaceAll(pseudo, real);
  }
  return result;
}
