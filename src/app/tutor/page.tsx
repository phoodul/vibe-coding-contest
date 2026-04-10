"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useChat } from "ai/react";
import { motion, AnimatePresence } from "framer-motion";
import { SUBJECTS } from "@/lib/ai/tutor-prompt";
import type { Subject, Topic } from "@/lib/ai/tutor-prompt";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { GlassCard } from "@/components/shared/glass-card";
import Link from "next/link";

export default function TutorPage() {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null); // null = 전체 학습
  const [freeQuestion, setFreeQuestion] = useState("");
  const [started, setStarted] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, append } =
    useChat({
      api: "/api/tutor",
      body: {
        subject: selectedSubject?.name || "",
        topic: selectedTopic?.name || "",
        concept: selectedConcept || "",
      },
    });

  // 자동 스크롤 — 새 메시지 시 하단으로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // 요약 정리 — 화면에 표시
  const generateSummary = useCallback(async () => {
    if (messages.length < 3) return;
    setSummaryLoading(true);
    setSummaryText("");
    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.filter((m) => !m.content.startsWith("[SYSTEM:")),
            {
              role: "user",
              content: `[SYSTEM: 지금까지 대화에서 학생이 배운 핵심 개념을 요약 정리해주세요.
형식:
📚 오늘 배운 핵심 개념
1. **개념명**: 설명 (2-3문장)
2. **개념명**: 설명
...

💡 아직 더 알아볼 내용
- 내용1
- 내용2

한국어로 작성하되 간결하고 명확하게 정리해주세요.]`,
            },
          ],
          subject: selectedSubject?.name || "",
          topic: selectedTopic?.name || "",
        }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value, { stream: true });
        }
      }

      const parsed = fullText
        .split("\n")
        .filter((line) => line.startsWith("0:"))
        .map((line) => {
          try { return JSON.parse(line.slice(2)); }
          catch { return ""; }
        })
        .join("");

      setSummaryText(parsed);
    } catch {
      setSummaryText("요약 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSummaryLoading(false);
    }
  }, [messages, selectedSubject, selectedTopic]);

  // 학습 노트 생성 + 다운로드
  const generateStudyNote = useCallback(async () => {
    if (messages.length < 3) return;
    setSummaryLoading(true);
    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.filter((m) => !m.content.startsWith("[SYSTEM:")),
            {
              role: "user",
              content: `[SYSTEM: 지금까지의 대화를 바탕으로 학습 노트를 Markdown 형식으로 작성해주세요.

## 작성 규칙:
1. 제목은 "# {교과} — {단원} 학습 노트"
2. "## 핵심 개념 요약" 섹션에서 학습한 주요 개념을 hierarchy(###, ####)로 정리
3. 각 개념에 대해 충분한 설명과 맥락(context)을 포함 (1-2문단)
4. "## 주요 Q&A" 섹션에서 대화 중 나온 핵심 질의응답을 정리
5. "## 핵심 용어 정리" 섹션에서 중요한 용어를 표로 정리 (| 용어 | 뜻 | 예시 |)
6. "## 더 알아볼 내용" 섹션에서 심화 학습 방향 제안
7. 단순 압축이 아니라 교과서 수준의 충분한 context와 설명을 포함
8. 한국어로 작성
9. Markdown 코드펜스 없이 순수 Markdown 텍스트만 출력]`,
            },
          ],
          subject: selectedSubject?.name || "",
          topic: selectedTopic?.name || "",
        }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value, { stream: true });
        }
      }

      // Vercel AI SDK data stream에서 텍스트 추출
      const md = fullText
        .split("\n")
        .filter((line) => line.startsWith("0:"))
        .map((line) => {
          try { return JSON.parse(line.slice(2)); }
          catch { return ""; }
        })
        .join("");

      // 다운로드
      const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedTopic?.name || "학습노트"}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("학습 노트 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSummaryLoading(false);
    }
  }, [messages, selectedSubject, selectedTopic]);

  // 학습 시작 — AI가 먼저 opener 질문을 던짐
  function startLesson() {
    if (!selectedSubject || !selectedTopic) return;
    setStarted(true);
    if (selectedConcept) {
      append({
        role: "user",
        content: `[SYSTEM: 학생이 "${selectedSubject.name}" 과목의 "${selectedTopic.name}" 단원에서 "${selectedConcept}" 개념을 집중 학습하려 합니다. 이 개념에 맞는 도입 질문으로 수업을 시작하세요.]`,
      });
    } else {
      append({
        role: "user",
        content: `[SYSTEM: 학생이 "${selectedSubject.name}" 과목의 "${selectedTopic.name}" 단원을 선택했습니다. 다음 질문으로 수업을 시작하세요: "${selectedTopic.opener}"]`,
      });
    }
  }

  // 자유 질문으로 시작
  function startFreeQuestion() {
    if (!selectedSubject || !freeQuestion.trim()) return;
    setStarted(true);
    append({
      role: "user",
      content: `[SYSTEM: 학생이 "${selectedSubject.name}" 과목에서 자유 질문을 했습니다. 이 질문을 출발점으로 소크라테스식 Guided Learning을 시작하세요. 관련 단원의 핵심 개념과 연결지어 대화를 이끌어주세요.]\n\n학생의 질문: ${freeQuestion.trim()}`,
    });
  }

  if (!started) {
    return (
      <div className="min-h-screen px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/dashboard"
            className="text-sm text-muted hover:text-foreground transition-colors mb-8 block"
          >
            &larr; 대시보드
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold mb-2">
              &#127891; 소크라테스 AI 튜터
            </h1>
            <p className="text-muted mb-8">
              AI가 질문으로 이끕니다. 단원을 선택하면 맞춤 수업이 시작됩니다.
            </p>
          </motion.div>

          <div className="space-y-6">
            {/* 교과 선택 */}
            <div>
              <h2 className="text-lg font-semibold mb-3">교과를 선택하세요</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {SUBJECTS.map((s, i) => (
                  <GlassCard
                    key={s.id}
                    delay={i * 0.05}
                    className={`cursor-pointer ${
                      selectedSubject?.id === s.id
                        ? "!border-primary !bg-primary/10"
                        : ""
                    }`}
                  >
                    <button
                      onClick={() => {
                        setSelectedSubject(s);
                        setSelectedTopic(null);
                      }}
                      className="w-full text-left"
                    >
                      <span className="text-2xl mb-2 block">{s.icon}</span>
                      <span className="font-medium text-sm">{s.name}</span>
                    </button>
                  </GlassCard>
                ))}
              </div>
            </div>

            {/* 단원 선택 */}
            <AnimatePresence>
              {selectedSubject && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <h2 className="text-lg font-semibold mb-3">
                    단원을 선택하세요
                  </h2>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedSubject.topics.map((t, i) => (
                      <GlassCard
                        key={t.name}
                        delay={i * 0.03}
                        className={`cursor-pointer py-4 ${
                          selectedTopic?.name === t.name
                            ? "!border-primary !bg-primary/10"
                            : ""
                        }`}
                      >
                        <button
                          onClick={() => setSelectedTopic(t)}
                          className="w-full text-left"
                        >
                          <p className="font-medium text-sm mb-1">{t.name}</p>
                          <p className="text-xs text-muted">
                            {t.concepts.join(" · ")}
                          </p>
                        </button>
                      </GlassCard>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 개념 선택 + 시작 */}
            <AnimatePresence>
              {selectedTopic && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <h2 className="text-lg font-semibold">집중할 개념을 선택하세요</h2>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedConcept(null)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        selectedConcept === null
                          ? "bg-primary/80 text-white"
                          : "bg-white/5 text-muted hover:bg-white/10"
                      }`}
                    >
                      전체 학습
                    </button>
                    {selectedTopic.concepts.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedConcept(c)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          selectedConcept === c
                            ? "bg-primary/80 text-white"
                            : "bg-white/5 text-muted hover:bg-white/10"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-center">
                    <button
                      onClick={startLesson}
                      className="btn-glow px-8 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all hover:scale-105 active:scale-[0.97]"
                    >
                      학습 시작하기
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 자유 질문 진입 */}
            <AnimatePresence>
              {selectedSubject && !selectedTopic && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <GlassCard hover={false} className="border-primary/20">
                    <h3 className="text-sm font-semibold mb-2">
                      또는 궁금한 점을 직접 질문하세요
                    </h3>
                    <p className="text-xs text-muted mb-3">
                      단원을 고르지 않아도 질문에서 출발하여 AI가 관련 개념을 안내합니다.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={freeQuestion}
                        onChange={(e) => setFreeQuestion(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && freeQuestion.trim() && startFreeQuestion()}
                        placeholder="예: 미토콘드리아가 왜 이중막 구조인가요?"
                        className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                      />
                      <button
                        onClick={startFreeQuestion}
                        disabled={!freeQuestion.trim()}
                        className="px-5 py-2 rounded-lg bg-primary/20 text-primary font-medium text-sm hover:bg-primary/30 transition-colors disabled:opacity-40"
                      >
                        질문하기
                      </button>
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  // 채팅 인터페이스
  return (
    <div className="min-h-screen flex flex-col">
      {/* 헤더 */}
      <div className="glass border-b border-white/5 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">
              {selectedSubject?.icon} 소크라테스 AI 튜터
            </h1>
            <p className="text-xs text-muted">
              {selectedSubject?.name} &gt; {selectedTopic?.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {messages.filter((m) => !m.content.startsWith("[SYSTEM:")).length >= 3 && (
              <>
                <button
                  onClick={generateSummary}
                  disabled={summaryLoading}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                >
                  {summaryLoading ? "..." : "&#128218; 요약 정리"}
                </button>
                <button
                  onClick={generateStudyNote}
                  disabled={summaryLoading}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors disabled:opacity-50"
                >
                  {summaryLoading ? "..." : "&#128190; 노트 저장"}
                </button>
              </>
            )}
            <button
              onClick={() => setStarted(false)}
              className="text-xs text-muted hover:text-foreground transition-colors"
            >
              교과 변경
            </button>
          </div>
        </div>
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <GlassCard hover={false}>
              <p className="text-muted text-sm">
                &#128161; AI 튜터가 질문을 준비하고 있습니다...
              </p>
            </GlassCard>
          )}

          {messages
            .filter((m) => !m.content.startsWith("[SYSTEM:"))
            .map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "glass rounded-bl-md"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <div className="prose prose-invert prose-sm max-w-none [&_table]:text-xs [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1 [&_th]:bg-white/5 [&_table]:border-collapse [&_th]:border [&_th]:border-white/10 [&_td]:border [&_td]:border-white/10">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}
                </div>
              </motion.div>
            ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="glass rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-muted animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-muted animate-bounce [animation-delay:0.1s]" />
                  <span className="w-2 h-2 rounded-full bg-muted animate-bounce [animation-delay:0.2s]" />
                </div>
              </div>
            </motion.div>
          )}

          {/* 요약 정리 패널 */}
          <AnimatePresence>
            {summaryText && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <div className="glass-gradient p-5 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-primary">
                      &#128218; 학습 요약 정리
                    </span>
                    <button
                      onClick={() => setSummaryText("")}
                      className="text-xs text-muted hover:text-foreground transition-colors"
                    >
                      닫기
                    </button>
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none [&_table]:text-xs [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1 [&_th]:bg-white/5 [&_table]:border-collapse [&_th]:border [&_th]:border-white/10 [&_td]:border [&_td]:border-white/10">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{summaryText}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 자동 스크롤 앵커 */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 입력 */}
      <div className="glass border-t border-white/5 px-6 py-4">
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto flex gap-3"
        >
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="답변을 입력하세요..."
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            전송
          </button>
        </form>
      </div>
    </div>
  );
}
