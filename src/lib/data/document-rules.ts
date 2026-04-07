/**
 * K-에듀파인 공문서 양식 규칙
 * 참고: hook_and_middleware.md, teacherGemini.md
 */

export interface FormatIssue {
  line: number;
  original: string;
  corrected: string;
  rule: string;
}

/** 항목 기호 순서: 1. → 가. → 1) → 가) → (1) → (가) → ① → ㉮ */
const ITEM_PATTERNS = [
  { regex: /^(\d+)\.\s/, level: 1, name: "첫째 항목 (1. 2. 3.)" },
  { regex: /^([가-힣])\.\s/, level: 2, name: "둘째 항목 (가. 나. 다.)" },
  { regex: /^(\d+)\)\s/, level: 3, name: "셋째 항목 (1) 2) 3))" },
  { regex: /^([가-힣])\)\s/, level: 4, name: "넷째 항목 (가) 나) 다))" },
];

/** 날짜 표기 교정: 2026.4.8 → 2026. 4. 8. */
function fixDateFormat(text: string): string {
  return text.replace(
    /(\d{4})\.(\d{1,2})\.(\d{1,2})\.?/g,
    (_, y, m, d) => `${y}. ${m}. ${d}.`
  );
}

/** 시간 표기 교정: 15:30 → 15 : 30 */
function fixTimeFormat(text: string): string {
  return text.replace(
    /(\d{1,2}):(\d{2})/g,
    "$1 : $2"
  );
}

/** 금액 표기 교정 */
function fixAmountFormat(text: string): string {
  return text.replace(
    /(\d{1,3}(,\d{3})*)원/g,
    (match) => {
      const num = match.replace(/[^0-9]/g, "");
      const formatted = Number(num).toLocaleString("ko-KR");
      const korean = numberToKorean(Number(num));
      return `금${formatted}원(${korean})`;
    }
  );
}

function numberToKorean(n: number): string {
  if (n === 0) return "금영원";
  const units = ["", "만", "억", "조"];
  const digits = ["", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"];
  const subUnits = ["", "십", "백", "천"];

  let result = "금";
  const str = String(n);
  const groups: number[] = [];

  for (let i = str.length; i > 0; i -= 4) {
    groups.unshift(Number(str.slice(Math.max(0, i - 4), i)));
  }

  groups.forEach((group, gi) => {
    if (group === 0) return;
    const unitIdx = groups.length - 1 - gi;
    const gStr = String(group);
    for (let di = 0; di < gStr.length; di++) {
      const d = Number(gStr[di]);
      if (d === 0) continue;
      const subIdx = gStr.length - 1 - di;
      if (d === 1 && subIdx > 0) {
        result += subUnits[subIdx];
      } else {
        result += digits[d] + subUnits[subIdx];
      }
    }
    result += units[unitIdx];
  });

  return result + "원";
}

/** 붙임/끝 표시 교정 */
function fixEndMarker(text: string): string {
  // "끝" 이 없으면 추가하지는 않음 (생성기에서 처리)
  // "끝." → "끝." 유지, "끝" → "끝." 으로 교정
  return text.replace(/끝\s*$/gm, "끝.");
}

/** 항목 기호 뒤 간격 교정 (2타 띄우기) */
function fixItemSpacing(text: string): string {
  // "1.항목" → "1. 항목" (마침표 뒤 공백)
  return text.replace(/^(\d+)\.([^\s])/gm, "$1. $2")
    .replace(/^([가-힣])\.([^\s])/gm, "$1. $2")
    .replace(/^(\d+)\)([^\s])/gm, "$1) $2")
    .replace(/^([가-힣])\)([^\s])/gm, "$1) $2");
}

export function analyzeDocument(text: string): FormatIssue[] {
  const issues: FormatIssue[] = [];
  const lines = text.split("\n");

  lines.forEach((line, i) => {
    const lineNum = i + 1;
    let corrected = line;

    // 날짜 표기
    const dateFix = fixDateFormat(corrected);
    if (dateFix !== corrected) {
      issues.push({ line: lineNum, original: corrected, corrected: dateFix, rule: "날짜 표기 (연. 월. 일.)" });
      corrected = dateFix;
    }

    // 시간 표기
    const timeFix = fixTimeFormat(corrected);
    if (timeFix !== corrected) {
      issues.push({ line: lineNum, original: corrected, corrected: timeFix, rule: "시간 표기 (24시각제, 쌍점 앞뒤 공백)" });
      corrected = timeFix;
    }

    // 항목 기호 간격
    const spacingFix = fixItemSpacing(corrected);
    if (spacingFix !== corrected) {
      issues.push({ line: lineNum, original: corrected, corrected: spacingFix, rule: "항목 기호 뒤 공백" });
      corrected = spacingFix;
    }

    // 끝 표시
    const endFix = fixEndMarker(corrected);
    if (endFix !== corrected) {
      issues.push({ line: lineNum, original: corrected, corrected: endFix, rule: "끝 표시 (끝.)" });
      corrected = endFix;
    }
  });

  return issues;
}

export function applyAllFixes(text: string): string {
  let result = text;
  result = fixDateFormat(result);
  result = fixTimeFormat(result);
  result = fixItemSpacing(result);
  result = fixEndMarker(result);
  return result;
}
