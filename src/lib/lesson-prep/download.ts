import { marked } from "marked";

/** 파일명용 문자열 정리 */
function sanitizeFilename(s: string): string {
  return s.replace(/[<>:"/\\|?*\n\r\t]/g, "").trim().slice(0, 80) || "document";
}

/** Word에서 잘 열리도록 HTML 문서 래핑 */
function wrapHtmlDoc(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
  body { font-family: "맑은 고딕", "Malgun Gothic", Pretendard, sans-serif; line-height: 1.7; color: #222; max-width: 800px; margin: 40px auto; padding: 0 40px; }
  h1 { font-size: 22px; border-bottom: 2px solid #333; padding-bottom: 8px; margin-top: 1.5em; }
  h2 { font-size: 18px; margin-top: 1.8em; color: #111; }
  h3 { font-size: 15px; margin-top: 1.5em; color: #333; }
  img { max-width: 100%; height: auto; border-radius: 6px; margin: 12px 0; }
  ul, ol { padding-left: 22px; }
  li { margin: 4px 0; }
  table { border-collapse: collapse; width: 100%; margin: 12px 0; }
  th, td { border: 1px solid #aaa; padding: 6px 10px; text-align: left; }
  th { background: #f3f3f3; }
  blockquote { border-left: 4px solid #6366f1; padding: 6px 14px; color: #444; background: #f6f7ff; margin: 12px 0; }
  hr { margin: 24px 0; border: none; border-top: 2px dashed #ccc; page-break-after: always; }
  strong { color: #111; }
  em { color: #555; }
  a { color: #4f46e5; text-decoration: underline; }
  code { background: #f0f0f0; padding: 2px 6px; border-radius: 4px; font-family: Consolas, monospace; }
</style>
</head>
<body>
<h1>${title}</h1>
${bodyHtml}
</body>
</html>`;
}

/** 마크다운 → Word(.doc) 다운로드 */
export function downloadMarkdownAsDoc(filename: string, title: string, markdown: string) {
  const bodyHtml = marked.parse(markdown, { async: false }) as string;
  const fullHtml = wrapHtmlDoc(title, bodyHtml);
  const blob = new Blob(["\ufeff", fullHtml], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${sanitizeFilename(filename)}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * 모의 테스트 마크다운을 문제지 / 정답지로 분리
 * - 문제지: `**정답:**`, `**해설:**`, `**모범답안:**`, `**채점 포인트:**` 섹션 제거
 * - 정답지: 각 문항 번호 + 정답/해설/모범답안/채점 포인트만 유지
 */
export function splitTestMarkdown(markdown: string): { problems: string; answers: string } {
  // 정답/해설 관련 마커 (Bold 강조 포함/미포함 모두 커버)
  const answerMarkers = [
    "정답:",
    "해설:",
    "모범답안:",
    "채점 포인트:",
  ];

  // 1) 문제지: 각 줄 단위로 돌며 정답 관련 줄과 그 이후 연속된 리스트/내용 제거
  const lines = markdown.split("\n");
  const problemsLines: string[] = [];
  const answersLines: string[] = [];

  // 문항별 버퍼로 처리
  type Block = { header: string; problem: string[]; answer: string[] };
  const blocks: Block[] = [];
  let currentBlock: Block | null = null;
  let mode: "problem" | "answer" = "problem";

  // 문항 헤더 정규식: "### 문항 N" 또는 "### N." 등
  const isQuestionHeader = (line: string) =>
    /^#{1,6}\s*(문항|문제|Q|Question)\s*\d+/i.test(line.trim()) ||
    /^#{1,6}\s*\d+[\.\)]/.test(line.trim());

  const isAnswerLine = (line: string) =>
    answerMarkers.some((m) => {
      const bold = new RegExp(`^\\s*\\**\\s*${m}`);
      return bold.test(line);
    });

  // 제목 섹션 (첫 번째 # 헤딩 — 테스트 제목)
  const preamble: string[] = [];
  let foundFirstQuestion = false;

  for (const line of lines) {
    if (!foundFirstQuestion && !isQuestionHeader(line)) {
      preamble.push(line);
      continue;
    }
    if (isQuestionHeader(line)) {
      foundFirstQuestion = true;
      if (currentBlock) blocks.push(currentBlock);
      currentBlock = { header: line, problem: [], answer: [] };
      mode = "problem";
      continue;
    }
    if (!currentBlock) continue;

    if (isAnswerLine(line)) {
      mode = "answer";
      currentBlock.answer.push(line);
    } else if (mode === "answer") {
      // 정답 블록 내부: 빈 줄이나 다른 내용은 계속 답지로
      currentBlock.answer.push(line);
    } else {
      currentBlock.problem.push(line);
    }
  }
  if (currentBlock) blocks.push(currentBlock);

  // 조립
  const preambleText = preamble.join("\n").trim();
  const problemBody = blocks
    .map((b) => [b.header, ...b.problem].join("\n").trim())
    .join("\n\n");
  const answerBody = blocks
    .map((b) => [b.header, ...b.answer].join("\n").trim())
    .join("\n\n");

  return {
    problems: [preambleText, problemBody].filter(Boolean).join("\n\n"),
    answers: [preambleText.replace(/모의 테스트/g, "모의 테스트 — 정답지"), answerBody]
      .filter(Boolean)
      .join("\n\n"),
  };
}
