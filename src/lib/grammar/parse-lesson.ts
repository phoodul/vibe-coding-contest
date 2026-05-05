/**
 * 헤밍웨이 영문법 레슨 MDX parser.
 *
 * MDX 본문을 다음 3 부분으로 split:
 *   1. body          — '## 실전 문제' 이전 (핵심 명제·설명·대표 문장)
 *   2. quiz          — '## 실전 문제' ~ '## 정답' 사이의 문제 5개
 *                      각 문제는 '## 정답' 이후의 해당 번호와 결합되어 정답·해설 포함
 *   3. nextNote      — '## 다음 레슨' 이후 (있을 때만)
 *
 * 문제 형식:
 *   ### 문제 N.
 *   <문제 본문 — 한 단락 + (옵션) blockquote + (옵션) `code` 블록>
 *
 *   ① choice1  ② choice2  ③ choice3  ④ choice4
 *
 * 정답 형식:
 *   ### N. ② <answerText>
 *
 *   <해설 markdown>
 *
 * 선택지 라벨은 ① ② ③ ④ ⑤ 만 인식.
 */

const CHOICE_LABELS = ['①', '②', '③', '④', '⑤'];

export interface QuizChoice {
  label: string; // ①, ②, ③, ④, ⑤
  text: string;
}

export interface QuizQuestion {
  id: number;
  question: string;        // markdown (본문 부분만, 선택지 제외)
  choices: QuizChoice[];
  answerIndex: number;     // 0-based (CHOICE_LABELS 기준)
  answerLabel: string;     // 그대로 ②
  answerText: string;      // '② met' 의 'met'
  explanation: string;     // markdown
}

export interface ParsedLesson {
  body: string;
  quiz: QuizQuestion[];
  nextNote?: string;
}

/** "## 실전 문제 ..." 또는 "## 정답 ..." 같은 h2 첫 등장 위치. 없으면 -1. */
function findHeadingStart(text: string, regex: RegExp): number {
  const m = regex.exec(text);
  return m ? m.index : -1;
}

function parseChoices(rawText: string): QuizChoice[] {
  const result: QuizChoice[] = [];
  for (let i = 0; i < CHOICE_LABELS.length; i++) {
    const cur = CHOICE_LABELS[i];
    const next = CHOICE_LABELS[i + 1];
    const startIdx = rawText.indexOf(cur);
    if (startIdx === -1) continue;
    const endIdx = next ? rawText.indexOf(next, startIdx + 1) : -1;
    let chunk = rawText.slice(startIdx + cur.length, endIdx >= 0 ? endIdx : rawText.length);
    // 양쪽 공백 + 줄바꿈을 단일 공백으로 정리
    chunk = chunk.replace(/\s+/g, ' ').trim();
    if (chunk) result.push({ label: cur, text: chunk });
  }
  return result;
}

function parseQuestions(text: string): Array<Pick<QuizQuestion, 'id' | 'question' | 'choices'>> {
  const out: Array<Pick<QuizQuestion, 'id' | 'question' | 'choices'>> = [];
  const re = /### 문제 (\d+)\.?\s*\n([\s\S]*?)(?=\n### 문제 \d+\.?|\n## |$)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const id = parseInt(m[1], 10);
    const body = m[2].trim();
    // 선택지 시작 위치 = 첫 ① 위치
    const choiceStart = body.indexOf('①');
    const question = (choiceStart >= 0 ? body.slice(0, choiceStart) : body).trim();
    const choicesText = choiceStart >= 0 ? body.slice(choiceStart) : '';
    const choices = parseChoices(choicesText);
    out.push({ id, question, choices });
  }
  return out;
}

function parseAnswers(text: string): Array<Pick<QuizQuestion, 'id' | 'answerLabel' | 'answerText' | 'answerIndex' | 'explanation'>> {
  const out: Array<Pick<QuizQuestion, 'id' | 'answerLabel' | 'answerText' | 'answerIndex' | 'explanation'>> = [];
  // ### 1. ② met
  // <해설>
  // ...
  // ### 2. ...
  const re = /### (\d+)\.\s*([①②③④⑤])\s*([^\n]*)\n+([\s\S]*?)(?=\n### \d+\.\s*[①②③④⑤]|\n## |$)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const id = parseInt(m[1], 10);
    const answerLabel = m[2];
    const answerText = m[3].trim();
    const explanation = m[4].trim();
    out.push({
      id,
      answerLabel,
      answerText,
      answerIndex: CHOICE_LABELS.indexOf(answerLabel),
      explanation,
    });
  }
  return out;
}

export function parseLessonMdx(raw: string): ParsedLesson {
  const quizStart = findHeadingStart(raw, /^## 실전 문제/m);
  const answerStart = findHeadingStart(raw, /^## 정답/m);
  const nextStart = findHeadingStart(raw, /^## 다음 레슨/m);

  // 문제 섹션 / 정답 섹션 한 쪽이라도 없으면 quiz 가 비어 있고 본문만 보여줌
  if (quizStart === -1 || answerStart === -1) {
    return { body: raw.trim(), quiz: [] };
  }

  const body = raw.slice(0, quizStart).trim();
  const quizSection = raw.slice(quizStart, answerStart);
  const answerSection = raw.slice(answerStart, nextStart >= 0 ? nextStart : raw.length);
  const nextNote = nextStart >= 0 ? raw.slice(nextStart).trim() : undefined;

  const questions = parseQuestions(quizSection);
  const answers = parseAnswers(answerSection);

  const quiz: QuizQuestion[] = [];
  for (const q of questions) {
    const a = answers.find((x) => x.id === q.id);
    if (!a) continue; // 정답 누락 시 스킵 (parser 가 학생에게 정답 노출 방지)
    if (q.choices.length === 0) continue; // 선택지 파싱 실패 시 스킵
    quiz.push({ ...q, ...a });
  }

  return { body, quiz, nextNote };
}
