/**
 * parseLessonMdx 회귀 테스트.
 * 현재 1 레슨 (03-04-tense-perfect-vs-past) + 향후 74 레슨 양산 시 동일 형식 보장.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { parseLessonMdx } from '../parse-lesson';

function loadLesson(slug: string): string {
  const p = path.join(process.cwd(), 'content', 'grammar', `${slug}.md`);
  return readFileSync(p, 'utf-8');
}

describe('parseLessonMdx', () => {
  it('현재완료 vs 단순과거 — body / quiz 5 / nextNote 분리', () => {
    const raw = loadLesson('03-04-tense-perfect-vs-past');
    // frontmatter 제거
    const body = raw.replace(/^---\n[\s\S]*?\n---\n/, '');
    const parsed = parseLessonMdx(body);

    // body 에 핵심 명제·설명·대표 문장 포함, '## 실전 문제' 등장 안 함
    expect(parsed.body).toContain('## 핵심 명제');
    expect(parsed.body).toContain('## 대표 문장');
    expect(parsed.body).not.toContain('## 실전 문제');

    // quiz 정확히 5문제
    expect(parsed.quiz).toHaveLength(5);

    // 다음 레슨 안내 분리
    expect(parsed.nextNote).toBeDefined();
    expect(parsed.nextNote).toContain('다음 레슨');
  });

  it('문제 1 — 선택지 4개 + 정답 ②', () => {
    const raw = loadLesson('03-04-tense-perfect-vs-past');
    const body = raw.replace(/^---\n[\s\S]*?\n---\n/, '');
    const parsed = parseLessonMdx(body);

    const q1 = parsed.quiz.find((q) => q.id === 1);
    expect(q1).toBeDefined();
    expect(q1?.choices).toHaveLength(4);
    expect(q1?.choices.map((c) => c.text)).toEqual([
      'meet',
      'met',
      'have met',
      'have been meeting',
    ]);
    expect(q1?.answerLabel).toBe('②');
    expect(q1?.answerText).toBe('met');
    expect(q1?.answerIndex).toBe(1);
    expect(q1?.explanation).toContain('단순과거');
  });

  it('문제 2 — 줄바꿈된 선택지 4개', () => {
    const raw = loadLesson('03-04-tense-perfect-vs-past');
    const body = raw.replace(/^---\n[\s\S]*?\n---\n/, '');
    const parsed = parseLessonMdx(body);

    const q2 = parsed.quiz.find((q) => q.id === 2);
    expect(q2?.choices).toHaveLength(4);
    expect(q2?.choices[0].text).toContain('since five years');
    expect(q2?.answerIndex).toBe(2); // ③
  });

  it('문제 5 — blockquote 가 question 에 포함', () => {
    const raw = loadLesson('03-04-tense-perfect-vs-past');
    const body = raw.replace(/^---\n[\s\S]*?\n---\n/, '');
    const parsed = parseLessonMdx(body);

    const q5 = parsed.quiz.find((q) => q.id === 5);
    expect(q5?.question).toContain('>'); // blockquote 그대로 보존
    expect(q5?.choices).toHaveLength(4);
    expect(q5?.answerIndex).toBe(1); // ②
  });

  it('정답 5개 모두 explanation 비어있지 않음', () => {
    const raw = loadLesson('03-04-tense-perfect-vs-past');
    const body = raw.replace(/^---\n[\s\S]*?\n---\n/, '');
    const parsed = parseLessonMdx(body);

    for (const q of parsed.quiz) {
      expect(q.explanation.length).toBeGreaterThan(10);
    }
  });

  it('quiz / answer 섹션 없으면 body 만 반환 + quiz 비움', () => {
    const raw = '## 핵심 명제\n\n어쩌고 저쩌고.\n\n## 설명\n\n블라블라.';
    const parsed = parseLessonMdx(raw);
    expect(parsed.quiz).toHaveLength(0);
    expect(parsed.body).toContain('## 핵심 명제');
  });
});
