"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useChat } from "ai/react";
import { motion, AnimatePresence } from "framer-motion";

import { SUBJECTS } from "@/lib/ai/tutor-prompt";
import type { Subject, Topic } from "@/lib/ai/tutor-prompt";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { GlassCard } from "@/components/shared/glass-card";
import { fireMiniConfetti } from "@/lib/confetti";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function TutorPage() {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null); // null = 전체 학습
  const [freeQuestion, setFreeQuestion] = useState("");
  const [completedConcepts, setCompletedConcepts] = useState<Set<string>>(new Set());
  const [started, setStarted] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [materialText, setMaterialText] = useState("");
  const [materialSource, setMaterialSource] = useState("");
  const [materialUrl, setMaterialUrl] = useState("");
  const [materialLoading, setMaterialLoading] = useState(false);
  const [learningDepth, setLearningDepth] = useState<"overview" | "practical">("practical");
  const [materialSections, setMaterialSections] = useState<{ title: string; content: string }[]>([]);
  const [selectedSections, setSelectedSections] = useState<Set<number>>(new Set());
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [previousSessions, setPreviousSessions] = useState<{ id: string; subject: string; topic: string; updated_at: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, append, status, setMessages } =
    useChat({
      api: "/api/tutor",
      body: {
        subject: selectedSubject?.name || "",
        topic: selectedTopic?.name || "",
        concept: selectedConcept || "",
      },
      maxSteps: 5,
    });

  // 로그인 사용자 확인 + 이전 세션 불러오기
  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data } = await supabase
        .from("tutor_sessions")
        .select("id, subject, topic, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(5);
      if (data) setPreviousSessions(data);
    })();
  }, []);

  // 메시지 변경 시 세션 자동 저장 (디바운스 3초)
  useEffect(() => {
    if (!userId || !selectedSubject || messages.length === 0) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      const supabase = createClient();
      const sessionData = {
        user_id: userId,
        subject: selectedSubject.name,
        topic: selectedTopic?.name || "자유 질문",
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      };
      if (sessionId) {
        await supabase.from("tutor_sessions").update(sessionData).eq("id", sessionId);
      } else {
        const { data } = await supabase.from("tutor_sessions").insert(sessionData).select("id").single();
        if (data) setSessionId(data.id);
      }
    }, 3000);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [messages, userId, selectedSubject, selectedTopic, sessionId]);

  // 이전 세션 이어하기
  const resumeSession = useCallback(async (id: string) => {
    const supabase = createClient();
    const { data } = await supabase.from("tutor_sessions").select("*").eq("id", id).single();
    if (!data) return;
    const subject = SUBJECTS.find((s) => s.name === data.subject);
    if (subject) {
      setSelectedSubject(subject);
      const topic = subject.topics.find((t) => t.name === data.topic);
      if (topic) setSelectedTopic(topic);
    }
    setSessionId(id);
    setMessages(data.messages || []);
    setStarted(true);
  }, [setMessages]);

  // 자동 스크롤 — 새 메시지 시 하단으로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const PROGRESS_KEY = "easyedu-tutor-progress";

  // localStorage에서 진행도 로드
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PROGRESS_KEY);
      if (saved) setCompletedConcepts(new Set(JSON.parse(saved)));
    } catch { /* ignore */ }
  }, []);

  // AI 응답에서 [CONCEPT_DONE: ...] 마커 감지 + localStorage 저장
  useEffect(() => {
    const assistantMsgs = messages.filter((m) => m.role === "assistant");
    const newCompleted = new Set(completedConcepts);
    for (const m of assistantMsgs) {
      const matches = m.content.matchAll(/\[CONCEPT_DONE:\s*(.+?)\]/g);
      for (const match of matches) {
        newCompleted.add(match[1].trim());
      }
    }
    if (newCompleted.size !== completedConcepts.size) {
      if (newCompleted.size > completedConcepts.size) fireMiniConfetti();
      setCompletedConcepts(newCompleted);
      try { localStorage.setItem(PROGRESS_KEY, JSON.stringify([...newCompleted])); } catch { /* ignore */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

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
              content: `[SYSTEM: 지금까지 대화에서 다룬 내용을 학습 진행 체크리스트 + 핵심 정리로 요약해주세요.

형식:

## ✅ 학습 진행 체크리스트
- [x] 개념A — 한 줄 핵심 (학습 완료)
- [x] 개념B — 한 줄 핵심 (학습 완료)
- [ ] 개념C — 아직 다루지 않음
- [ ] 개념D — 아직 다루지 않음

## 📝 배운 핵심 정리

### 개념A
- **무엇인가**: 한 줄 정의
- **어떻게 쓰는가**: 실전 사용법/명령어/설정 방법
- **왜 중요한가**: 실무적 의미

### 개념B
(동일 형태)

## 🛠️ 실전 명령어·코드 모음
(대화에서 나온 명령어, 코드, 설정 파일을 코드 블록으로 정리)

## 🔜 다음 시간에 이어서 배울 내용
- 아직 다루지 않은 개념 목록과 간단한 예고

한국어로 작성. 대화에서 실제로 다룬 내용만 포함. 학습 완료된 것과 아직 안 한 것을 명확히 구분하세요.]`,
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

  // 자료 업로드 (PDF/MD/TXT)
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMaterialLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/tutor/extract", { method: "POST", body: formData });
      const data = await res.json();
      if (data.error) { alert(data.error); return; }
      setMaterialText(data.text);
      setMaterialSource(data.source);
    } catch { alert("파일 처리에 실패했습니다."); }
    finally { setMaterialLoading(false); e.target.value = ""; }
  }

  // URL에서 내용 추출
  async function handleUrlExtract() {
    if (!materialUrl.trim()) return;
    setMaterialLoading(true);
    try {
      const res = await fetch("/api/tutor/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: materialUrl.trim() }),
      });
      const data = await res.json();
      if (data.error) { alert(data.error); return; }
      setMaterialText(data.text);
      setMaterialSource(data.source);
      if (data.sections?.length > 0) {
        setMaterialSections(data.sections);
        setSelectedSections(new Set());
      } else {
        setMaterialSections([]);
      }
    } catch { alert("URL 내용을 가져올 수 없습니다."); }
    finally { setMaterialLoading(false); }
  }

  // 자료 기반 학습 시작
  function startMaterialLesson() {
    if (!materialText) return;

    // 모드에 따라 전달 분량 조절: 개요=넓게(30K), 실무=좁게(5K) 깊게
    const maxChars = learningDepth === "overview" ? 30000 : 5000;

    let contentToSend: string;
    let sectionNames: string;
    if (materialSections.length > 0 && selectedSections.size > 0) {
      const picked = materialSections.filter((_, i) => selectedSections.has(i));
      const joined = picked.map((s) => `## ${s.title}\n${s.content}`).join("\n\n");
      contentToSend = joined.slice(0, maxChars);
      sectionNames = picked.map((s) => s.title).join(", ");
    } else {
      contentToSend = materialText.slice(0, maxChars);
      sectionNames = "전체";
    }

    const depthGuide = learningDepth === "overview"
      ? `## 학습 모드: 개요 (넓게, 약 25~30분)
- 주어진 자료에서 알아야 할 내용 5~10가지를 도출합니다.
- "이게 뭔지, 왜 중요한지, 언제 쓰는지"에 집중합니다.
- 코드나 설정 세부사항은 생략하고 큰 그림을 그려줍니다.
- 학생이 이미 알면 1턴에 확인 후 바로 넘어가고, 모르면 이해할 때까지 가이드합니다.`
      : `## 학습 모드: 실무 (깊게, 약 25~30분)
- 주어진 자료에서 실전에서 활용해야 할 과제 5~10가지를 도출합니다.
- 실제 코드를 직접 보여주고, 명령어, 설정 방법, 주의사항, 흔한 실수를 반드시 포함합니다.
- 단순히 "이런 게 있다"가 아니라 "이렇게 쓴다, 이걸 조심해라"까지 가르칩니다.
- 학생이 이미 할 수 있으면 1턴에 확인 후 바로 넘어가고, 모르면 실제로 할 수 있을 때까지 가이드합니다.
- 학생이 세션 후 바로 실무에 적용할 수 있는 수준이 목표입니다.`;

    setStarted(true);
    append({
      role: "user",
      content: `[SYSTEM: 학생이 자료 기반 학습을 선택했습니다. 아래 자료의 내용을 바탕으로 소크라테스 Guided Learning을 진행하세요.

자료 출처: ${materialSource}
선택 섹션: ${sectionNames}

${depthGuide}

## 수업 계획 수립 (필수 — 첫 응답 전에 반드시 수행)
자료를 분석하여 다음을 내부적으로 결정하세요 (학생에게 보여주지 않음):
1. 이 자료에서 가르쳐야 할 **핵심 내용 목록**을 도출하세요 (실무 모드: 10개 이상, 개요 모드: 핵심만).
2. 각 내용의 **학습 순서**를 정하세요 (기초 → 심화, 의존 관계 고려).
3. 각 내용마다 **반드시 다뤄야 할 실전 포인트**를 메모하세요.

이 계획을 따라 첫 번째 개념부터 가이드 질문으로 자연스럽게 수업을 시작하세요.
각 개념을 가르칠 때 반드시 자료의 원문 내용을 근거로 설명하세요. 자료에 없는 내용을 지어내지 마세요.
하나의 개념이 끝나면 [CONCEPT_DONE: 개념명] 마커를 찍고 다음으로 넘어가세요.

--- 자료 내용 ---
${contentToSend}
--- 자료 끝 ---]`,
    });
  }

  // 사이드바에서 단원 변경
  function switchTopic(topic: Topic) {
    setSelectedTopic(topic);
    setSelectedConcept(null);
    setCompletedConcepts(new Set());
    setSidebarOpen(false);
    setMessages([]);
    setSummaryText("");
    setStarted(true);
    append({
      role: "user",
      content: `[SYSTEM: 학생이 "${selectedSubject?.name}" 과목의 "${topic.name}" 단원을 선택했습니다. 다음 질문으로 수업을 시작하세요: "${topic.opener}"]`,
    });
  }

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
            {/* 이전 세션 이어하기 */}
            {previousSessions.length > 0 && !selectedSubject && (
              <div>
                <h2 className="text-lg font-semibold mb-3">이전 학습 이어하기</h2>
                <div className="space-y-2">
                  {previousSessions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => resumeSession(s.id)}
                      className="w-full text-left glass p-3 rounded-xl border border-white/5 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium">{s.subject}</span>
                          <span className="text-xs text-muted ml-2">{s.topic}</span>
                        </div>
                        <span className="text-xs text-muted/50">
                          {new Date(s.updated_at).toLocaleDateString("ko-KR")}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

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
              {selectedSubject && selectedSubject.topics.length > 0 && (
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

            {/* 자료 기반 학습 */}
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
            >
              <GlassCard hover={false} className="border-cyan-500/20">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <span className="text-cyan-400">📎</span> 자료 기반 학습
                </h3>
                <p className="text-xs text-muted mb-4">
                  PDF, MD 파일을 업로드하거나 웹 주소를 입력하면 해당 내용을 바탕으로 소크라테스 학습을 진행합니다.
                </p>

                {/* 파일 업로드 */}
                <div className="flex flex-col sm:flex-row gap-2 mb-3">
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/15 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all cursor-pointer text-sm text-muted">
                    <span>📄 PDF / MD / TXT 업로드</span>
                    <input
                      type="file"
                      accept=".pdf,.md,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* URL 입력 */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="url"
                    value={materialUrl}
                    onChange={(e) => setMaterialUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleUrlExtract()}
                    placeholder="https://docs.anthropic.com/en/docs/..."
                    className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                  />
                  <button
                    onClick={handleUrlExtract}
                    disabled={materialLoading || !materialUrl.trim()}
                    className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 text-sm font-medium hover:bg-cyan-500/30 transition-colors disabled:opacity-40"
                  >
                    {materialLoading ? "..." : "추출"}
                  </button>
                </div>

                {/* 추출 결과 */}
                {materialText && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-emerald-400">
                        ✓ {materialSource} — {Math.round(materialText.length / 100) * 100}자 추출됨
                        {materialSections.length > 0 && ` · ${materialSections.length}개 섹션`}
                      </p>
                      <button onClick={() => { setMaterialText(""); setMaterialSource(""); setMaterialSections([]); setSelectedSections(new Set()); }} className="text-xs text-muted hover:text-foreground">초기화</button>
                    </div>

                    {/* 학습 깊이 선택 */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setLearningDepth("overview")}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          learningDepth === "overview"
                            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                            : "bg-white/5 text-muted border border-white/10 hover:text-foreground"
                        }`}
                      >
                        📖 개요 모드<br /><span className="text-[10px] opacity-70">넓고 빠르게 훑기</span>
                      </button>
                      <button
                        onClick={() => setLearningDepth("practical")}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          learningDepth === "practical"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/50"
                            : "bg-white/5 text-muted border border-white/10 hover:text-foreground"
                        }`}
                      >
                        🔧 실무 모드<br /><span className="text-[10px] opacity-70">실전 활용 수준까지</span>
                      </button>
                    </div>

                    {/* 섹션 선택 (섹션이 있을 때만) */}
                    {materialSections.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted mb-1">배우고 싶은 섹션을 선택하세요:</p>
                        <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                          {materialSections.map((sec, i) => {
                            const checked = selectedSections.has(i);
                            return (
                              <label
                                key={i}
                                className={`flex items-start gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors text-xs ${
                                  checked ? "bg-cyan-500/10 border border-cyan-500/30" : "bg-white/5 border border-white/5 hover:border-white/20"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => {
                                    const next = new Set(selectedSections);
                                    checked ? next.delete(i) : next.add(i);
                                    setSelectedSections(next);
                                  }}
                                  className="mt-0.5 accent-cyan-500"
                                />
                                <span className={checked ? "text-foreground" : "text-muted"}>{sec.title}</span>
                              </label>
                            );
                          })}
                        </div>
                        {selectedSections.size > 0 && (
                          <p className="text-[10px] text-cyan-400">
                            {selectedSections.size}개 섹션 선택 · 약 {selectedSections.size * 25}분 예상
                          </p>
                        )}
                      </div>
                    )}

                    <button
                      onClick={startMaterialLesson}
                      disabled={materialSections.length > 0 && selectedSections.size === 0}
                      className="w-full btn-glow px-6 py-3 rounded-xl bg-cyan-600 text-white font-medium hover:bg-cyan-500 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
                    >
                      {materialSections.length > 0 && selectedSections.size === 0
                        ? "섹션을 선택해주세요"
                        : materialSections.length > 0
                          ? `선택한 ${selectedSections.size}개 섹션으로 학습 시작`
                          : "이 자료로 학습 시작하기"}
                    </button>
                  </div>
                )}
              </GlassCard>
            </motion.div>

            {/* 자유 질문 진입 */}
            <AnimatePresence>
              {selectedSubject && (selectedSubject.topics.length === 0 || !selectedTopic) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <GlassCard hover={false} className="border-primary/20">
                    <h3 className="text-sm font-semibold mb-2">
                      {selectedSubject.topics.length === 0
                        ? "학습하고 싶은 주제를 입력하세요"
                        : "또는 궁금한 점을 직접 질문하세요"}
                    </h3>
                    <p className="text-xs text-muted mb-3">
                      {selectedSubject.topics.length === 0
                        ? "AI가 최신 정보를 검색하여 소크라테스식으로 안내합니다."
                        : "단원을 고르지 않아도 질문에서 출발하여 AI가 관련 개념을 안내합니다."}
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
      <div className="glass border-b border-white/5 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            {/* 사이드바 토글 */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-muted hover:text-foreground transition-colors shrink-0"
              title="단원 목록"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-semibold">
                {selectedSubject?.icon} 소크라테스
              </h1>
              <p className="text-xs text-muted truncate">
                {selectedSubject?.name} &gt; {selectedTopic?.name || "자유 질문"}
              </p>
            </div>
          </div>
          {/* 개념 진행 칩 */}
          {selectedTopic && selectedTopic.concepts.length > 0 && (
            <div className="flex flex-wrap gap-1.5 order-last w-full sm:order-none sm:w-auto sm:flex-1 sm:justify-center">
              {selectedTopic.concepts.map((c) => {
                const done = completedConcepts.has(c);
                return (
                  <span
                    key={c}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-all ${
                      done
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-white/5 text-muted/60"
                    }`}
                  >
                    {done ? "✓ " : ""}{c}
                  </span>
                );
              })}
            </div>
          )}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setStarted(false)}
              className="text-xs text-muted hover:text-foreground transition-colors"
            >
              변경
            </button>
          </div>
        </div>
      </div>

      {/* 사이드바 + 채팅 영역 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 사이드바 — 단원 목록 */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              {/* 모바일 오버레이 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="fixed lg:relative left-0 top-0 lg:top-auto h-full w-[280px] z-40 lg:z-auto glass border-r border-white/5 overflow-y-auto shrink-0"
              >
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-muted">단원 목록</h2>
                    <button onClick={() => setSidebarOpen(false)} className="text-muted hover:text-foreground lg:hidden">✕</button>
                  </div>

                  {/* 네비게이션 링크 */}
                  <div className="flex gap-2">
                    <Link href="/dashboard" className="flex-1 text-center text-xs py-2 rounded-lg glass border border-white/5 hover:border-primary/30 text-muted hover:text-foreground transition-colors">
                      🏠 대시보드
                    </Link>
                    <Link href="/" className="flex-1 text-center text-xs py-2 rounded-lg glass border border-white/5 hover:border-primary/30 text-muted hover:text-foreground transition-colors">
                      🌐 홈
                    </Link>
                  </div>

                  {/* 다른 교과 전환 */}
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted/40 mb-2">교과 전환</p>
                    <div className="flex flex-wrap gap-1.5">
                      {SUBJECTS.filter((s) => s.id !== selectedSubject?.id).map((s) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            setSelectedSubject(s);
                            setSelectedTopic(null);
                            setSelectedConcept(null);
                            setStarted(false);
                            setMessages([]);
                            setSessionId(null);
                            setSidebarOpen(false);
                          }}
                          className="text-xs px-2 py-1 rounded-lg glass hover:bg-white/5 text-muted hover:text-foreground transition-colors"
                          title={s.name}
                        >
                          {s.icon} {s.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-white/5" />

                  {/* 현재 교과 단원 목록 */}
                  <p className="text-[10px] uppercase tracking-wider text-muted/40">{selectedSubject?.name} 단원</p>
                  {selectedSubject?.topics.map((topic, i) => {
                    const isCurrent = selectedTopic?.name === topic.name;
                    return (
                      <button
                        key={topic.name}
                        onClick={() => switchTopic(topic)}
                        className={`w-full text-left p-3 rounded-xl text-sm transition-all ${
                          isCurrent
                            ? "bg-primary/15 border border-primary/30 text-foreground"
                            : "hover:bg-white/5 text-muted hover:text-foreground"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-xs text-muted/50 shrink-0 mt-0.5">{i + 1}</span>
                          <div className="min-w-0">
                            <p className={`font-medium leading-snug ${isCurrent ? "text-primary" : ""}`}>
                              {topic.name}
                            </p>
                            <p className="text-[10px] text-muted/50 mt-1 line-clamp-2">
                              {topic.concepts.join(" · ")}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* 메인 채팅 영역 */}
        <div className="flex-1 flex flex-col overflow-hidden">
      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
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
                  className={`max-w-[90%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "glass rounded-bl-md"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <>
                      {/* 검색 tool invocation 표시 */}
                      {m.parts?.map((p, i) => {
                        if (p.type !== "tool-invocation") return null;
                        const ti = p.toolInvocation;
                        if (ti.state === "call" || ti.state === "partial-call") {
                          return (
                            <div key={`tool-${i}`} className="flex items-center gap-2 text-xs text-cyan-400 mb-2">
                              <span className="animate-spin w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full" />
                              검색 중: {(ti.args as Record<string, string>)?.query || "..."}
                            </div>
                          );
                        }
                        if (ti.state === "result") {
                          return (
                            <div key={`tool-${i}`} className="text-[10px] text-muted/40 mb-2">
                              검색 완료: {(ti.args as Record<string, string>)?.query}
                            </div>
                          );
                        }
                        return null;
                      })}
                      <div className="prose prose-invert prose-sm max-w-none [&_table]:text-xs [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1 [&_th]:bg-white/5 [&_table]:border-collapse [&_th]:border [&_th]:border-white/10 [&_td]:border [&_td]:border-white/10">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {m.content.replace(/\[CONCEPT_DONE:\s*.+?\]\n?/g, "")}
                        </ReactMarkdown>
                      </div>
                    </>
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}
                </div>
              </motion.div>
            ))}

          {(status === "submitted" || status === "streaming") && !messages.some(m => m.role === "assistant" && m.content && !m.content.startsWith("[SYSTEM:")) && (
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

          {/* 자동 스크롤 앵커 */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 요약 결과 (하단 고정 위) */}
      <AnimatePresence>
        {summaryText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="glass border-t border-white/5 px-4 sm:px-6 py-3 max-h-[50vh] overflow-y-auto"
          >
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-primary">학습 요약 정리</span>
                <button onClick={() => setSummaryText("")} className="text-xs text-muted hover:text-foreground">닫기</button>
              </div>
              <div className="prose prose-invert prose-sm max-w-none [&_table]:text-xs [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1 [&_th]:bg-white/5 [&_table]:border-collapse [&_th]:border [&_th]:border-white/10 [&_td]:border [&_td]:border-white/10">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{summaryText}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 요약/노트 버튼 + 가이드 칩 + 입력 */}
      <div className="glass border-t border-white/5 px-4 sm:px-6 py-3">
        <div className="max-w-3xl mx-auto">
          {/* 요약/노트 버튼 */}
          {messages.filter((m) => !m.content.startsWith("[SYSTEM:")).length >= 3 && (
            <div className="flex gap-2 mb-2">
              <button
                onClick={generateSummary}
                disabled={summaryLoading}
                className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
              >
                {summaryLoading ? "생성 중..." : "요약 정리"}
              </button>
              <button
                onClick={generateStudyNote}
                disabled={summaryLoading}
                className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors disabled:opacity-50"
              >
                {summaryLoading ? "생성 중..." : "노트 다운로드"}
              </button>
            </div>
          )}
          {/* Think-Articulate 가이드 칩 */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {[
              { label: "내 생각은...", prefix: "제 생각에는 " },
              { label: "이유는...", prefix: "그 이유는 " },
              { label: "예를 들면...", prefix: "예를 들어 " },
              { label: "잘 모르겠어요", prefix: "잘 모르겠는데, " },
              { label: "다시 설명해주세요", prefix: "조금 더 쉽게 설명해주실 수 있나요? " },
            ].map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => {
                  const e = { target: { value: input ? input + chip.prefix : chip.prefix } } as React.ChangeEvent<HTMLInputElement>;
                  handleInputChange(e);
                }}
                className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 text-muted hover:bg-primary/10 hover:text-primary transition-all"
              >
                {chip.label}
              </button>
            ))}
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex gap-2 sm:gap-3"
          >
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="생각을 정리해서 답변해보세요..."
              className="flex-1 min-w-0 px-3 sm:px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="shrink-0 px-4 sm:px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              전송
            </button>
          </form>
        </div>
      </div>
        </div>{/* /메인 채팅 영역 */}
      </div>{/* /사이드바 + 채팅 */}
    </div>
  );
}
