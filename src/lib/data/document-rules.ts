/**
 * K-에듀파인 공문서 양식 규칙
 * 행정업무의 운영에 관한 규정 시행규칙 기반
 */

export interface FormatIssue {
  line: number;
  original: string;
  corrected: string;
  rule: string;
  category: "spacing" | "date" | "time" | "amount" | "marker" | "reference" | "structure" | "table";
}

/** 항목 기호 순서: 1. → 가. → 1) → 가) → (1) → (가) → ① → ㉮ */

// ── 날짜 표기 교정: 2026.4.8 → 2026. 4. 8. ──
function fixDateFormat(text: string): string {
  return text.replace(
    /(\d{4})\.(\d{1,2})\.(\d{1,2})\.?/g,
    (_, y, m, d) => `${y}. ${m}. ${d}.`
  );
}

// ── 시간 표기 교정: 15:30 → 15 : 30 ──
// 유효 시간만 매칭 (0:00~23:59), 참조번호·URL 포트 등은 제외
function fixTimeFormat(text: string): string {
  return text.replace(
    /\b([01]?\d|2[0-3]):([0-5]\d)\b/g,
    "$1 : $2"
  );
}

// ── 시간 범위 물결표 공백: 09 : 00~15 : 30 → 09 : 00 ~ 15 : 30 ──
function fixTimeRangeTilde(text: string): string {
  return text.replace(
    /(\d{1,2}\s*:\s*\d{2})~(\d{1,2}\s*:\s*\d{2})/g,
    "$1 ~ $2"
  );
}

// ── 금액 괄호 앞 공백 제거: 금500,000원 (금오십만원) → 금500,000원(금오십만원) ──
function fixAmountParenSpace(text: string): string {
  return text.replace(
    /(금[\d,]+원)\s+(\(금[^)]+\))/g,
    "$1$2"
  );
}

// ── 금액 표기 교정: 50000원 → 금50,000원(금오만원) ──
function fixAmountFormat(text: string): string {
  return text.replace(
    /(?<!금)(?<!\d[,.])(\d{1,3}(,?\d{3})*)원(?!\s*\(금)/g,
    (match) => {
      const num = match.replace(/[^0-9]/g, "");
      const n = Number(num);
      if (n === 0 || isNaN(n)) return match;
      const formatted = n.toLocaleString("ko-KR");
      const korean = numberToKorean(n);
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

// ── 끝 표시 교정 ──
function fixEndMarker(text: string): string {
  return text.replace(/끝\s*$/gm, "끝.");
}

// ── 항목 기호 뒤 간격 교정 ──
function fixItemSpacing(text: string): string {
  return text
    .replace(/^(\s*)(\d+)\.([^\s.\d])/gm, "$1$2. $3")
    .replace(/^(\s*)([가-힣])\.([^\s.])/gm, "$1$2. $3")
    .replace(/^(\s*)(\d+)\)([^\s])/gm, "$1$2) $3")
    .replace(/^(\s*)([가-힣])\)([^\s])/gm, "$1$2) $3")
    .replace(/^(\s*)\((\d+)\)([^\s])/gm, "$1($2) $3")
    .replace(/^(\s*)\(([가-힣])\)([^\s])/gm, "$1($2) $3");
}

// ── 관련 번호 표기 교정: 교육지원과-1234 → 교육지원과-1234 (변경 없으면 skip) ──
function fixReferenceNumber(text: string): string {
  // 관련: 다음에 오는 참조번호 형식 검증
  return text.replace(
    /관련\s*:\s*/g,
    "관련: "
  );
}

// ── 붙임 표기 교정 ──
function fixAttachment(text: string): string {
  // "붙임1." → "붙임 1."
  return text.replace(/붙임(\d)/g, "붙임 $1");
}

// ── 수신자 표기 교정 ──
function fixRecipientFormat(text: string): string {
  // "수신:" → "수신: " (콜론 뒤 공백)
  return text
    .replace(/수신:([^\s])/g, "수신: $1")
    .replace(/참조:([^\s])/g, "참조: $1")
    .replace(/제목:([^\s])/g, "제목: $1");
}

// ── 쌍반점(;) → 쉼표(,) 교정 ──
function fixSemicolon(text: string): string {
  // 공문서에서는 세미콜론 대신 쉼표 사용
  return text.replace(/;/g, ",");
}

// ── 전각 문자 → 반각 교정 ──
function fixFullWidth(text: string): string {
  return text
    .replace(/（/g, "(")
    .replace(/）/g, ")")
    .replace(/，/g, ",")
    .replace(/．/g, ".")
    .replace(/：/g, ":")
    .replace(/；/g, ",");
}

// ── 표 제목 형식: 표1. 제목 → < 표 1 > 제목 ──
function fixTableTitle(text: string): string {
  return text.replace(
    /(?:^|\s)표\s*(\d+)[.\s:]\s*(.+)/g,
    " < 표 $1 > $2"
  );
}

// ── 표 단위 표기: (단위:원) → (단위: 원) ──
function fixTableUnit(text: string): string {
  return text.replace(
    /\(단위\s*:\s*([^)]+)\)/g,
    (_, unit) => `(단위: ${unit.trim()})`
  );
}

export function analyzeDocument(text: string): FormatIssue[] {
  const issues: FormatIssue[] = [];
  const lines = text.split("\n");

  lines.forEach((line, i) => {
    const lineNum = i + 1;
    let current = line;

    // 전각 문자
    const fullWidthFix = fixFullWidth(current);
    if (fullWidthFix !== current) {
      issues.push({ line: lineNum, original: current, corrected: fullWidthFix, rule: "전각 문자 → 반각 변환", category: "structure" });
      current = fullWidthFix;
    }

    // 날짜 표기
    const dateFix = fixDateFormat(current);
    if (dateFix !== current) {
      issues.push({ line: lineNum, original: current, corrected: dateFix, rule: "날짜 표기 (연. 월. 일.)", category: "date" });
      current = dateFix;
    }

    // 시간 표기
    const timeFix = fixTimeFormat(current);
    if (timeFix !== current) {
      issues.push({ line: lineNum, original: current, corrected: timeFix, rule: "시간 표기 (24시각제, 쌍점 앞뒤 공백)", category: "time" });
      current = timeFix;
    }

    // 시간 범위 물결표 공백
    const tildeFix = fixTimeRangeTilde(current);
    if (tildeFix !== current) {
      issues.push({ line: lineNum, original: current, corrected: tildeFix, rule: "시간 범위 물결표 앞뒤 공백", category: "time" });
      current = tildeFix;
    }

    // 금액 괄호 앞 공백
    const amountParenFix = fixAmountParenSpace(current);
    if (amountParenFix !== current) {
      issues.push({ line: lineNum, original: current, corrected: amountParenFix, rule: "금액 괄호 앞 공백 제거", category: "amount" });
      current = amountParenFix;
    }

    // 금액 표기
    const amountFix = fixAmountFormat(current);
    if (amountFix !== current) {
      issues.push({ line: lineNum, original: current, corrected: amountFix, rule: "금액 표기 (금00,000원(금OO원))", category: "amount" });
      current = amountFix;
    }

    // 항목 기호 간격
    const spacingFix = fixItemSpacing(current);
    if (spacingFix !== current) {
      issues.push({ line: lineNum, original: current, corrected: spacingFix, rule: "항목 기호 뒤 공백", category: "spacing" });
      current = spacingFix;
    }

    // 관련 번호
    const refFix = fixReferenceNumber(current);
    if (refFix !== current) {
      issues.push({ line: lineNum, original: current, corrected: refFix, rule: "관련 표기 (관련: )", category: "reference" });
      current = refFix;
    }

    // 붙임 표기
    const attachFix = fixAttachment(current);
    if (attachFix !== current) {
      issues.push({ line: lineNum, original: current, corrected: attachFix, rule: "붙임 표기 (붙임 1.)", category: "marker" });
      current = attachFix;
    }

    // 수신자/참조/제목 콜론
    const recipientFix = fixRecipientFormat(current);
    if (recipientFix !== current) {
      issues.push({ line: lineNum, original: current, corrected: recipientFix, rule: "수신/참조/제목 콜론 뒤 공백", category: "structure" });
      current = recipientFix;
    }

    // 쌍반점
    const semiFix = fixSemicolon(current);
    if (semiFix !== current) {
      issues.push({ line: lineNum, original: current, corrected: semiFix, rule: "쌍반점(;) → 쉼표(,)", category: "structure" });
      current = semiFix;
    }

    // 표 제목
    const tableTitleFix = fixTableTitle(current);
    if (tableTitleFix !== current) {
      issues.push({ line: lineNum, original: current, corrected: tableTitleFix, rule: "표 제목 형식 (< 표 N > 제목)", category: "table" });
      current = tableTitleFix;
    }

    // 표 단위 표기
    const tableUnitFix = fixTableUnit(current);
    if (tableUnitFix !== current) {
      issues.push({ line: lineNum, original: current, corrected: tableUnitFix, rule: "표 단위 표기 (단위: OO)", category: "table" });
      current = tableUnitFix;
    }

    // 끝 표시
    const endFix = fixEndMarker(current);
    if (endFix !== current) {
      issues.push({ line: lineNum, original: current, corrected: endFix, rule: "끝 표시 (끝.)", category: "marker" });
      current = endFix;
    }
  });

  return issues;
}

export function applyAllFixes(text: string): string {
  let r = text;
  r = fixFullWidth(r);
  r = fixDateFormat(r);
  r = fixTimeFormat(r);
  r = fixTimeRangeTilde(r);
  r = fixAmountParenSpace(r);
  r = fixAmountFormat(r);
  r = fixItemSpacing(r);
  r = fixReferenceNumber(r);
  r = fixAttachment(r);
  r = fixRecipientFormat(r);
  r = fixSemicolon(r);
  r = fixTableTitle(r);
  r = fixTableUnit(r);
  r = fixEndMarker(r);
  return r;
}

/** 카테고리별 이슈 수 집계 */
export function countByCategory(issues: FormatIssue[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const issue of issues) {
    counts[issue.category] = (counts[issue.category] || 0) + 1;
  }
  return counts;
}

export const CATEGORY_LABELS: Record<string, string> = {
  spacing: "항목 기호/간격",
  date: "날짜 표기",
  time: "시간 표기",
  amount: "금액 표기",
  marker: "끝/붙임 표시",
  reference: "참조 번호",
  structure: "문서 구조",
  table: "표 양식",
};
