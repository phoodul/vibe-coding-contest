"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useChat } from "ai/react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/shared/glass-card";
import Link from "next/link";
import {
  getReadingLogs,
  addReadingLog,
  deleteReadingLog,
  logsToText,
  type ReadingLogEntry,
} from "@/lib/reading-log";

const GRADES = [
  "중학교 1학년",
  "중학교 2학년",
  "중학교 3학년",
  "고등학교 1학년",
  "고등학교 2학년",
  "고등학교 3학년",
  "대학생/재수생",
];

type Tab = "recommend" | "log";

interface NLBook {
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  year: string;
  classNo: string;
  className: string;
  detailLink: string;
  imageUrl: string;
  type: string;
}

export default function BooksPage() {
  const [tab, setTab] = useState<Tab>("recommend");

  return (
    <div className="min-h-screen px-4 sm:px-6 py-12 sm:py-20">
      <div className="max-w-4xl mx-auto">
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
          <h1 className="text-3xl font-bold mb-2">📚 도서 추천 & 독서 기록</h1>
          <p className="text-muted mb-6">
            AI 맞춤 추천을 받고, 읽은 책을 검색하여 독서 기록을 관리하세요.
          </p>
        </motion.div>

        {/* 탭 */}
        <div className="flex gap-2 mb-8">
          {(
            [
              { key: "recommend", label: "🤖 AI 맞춤 추천" },
              { key: "log", label: "📖 독서 기록" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === t.key
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "glass hover:bg-card-hover"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === "recommend" && (
            <motion.div
              key="recommend"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <RecommendTab />
            </motion.div>
          )}
          {tab === "log" && (
            <motion.div
              key="log"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <ReadingLogTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════ */
/*  AI 맞춤 추천 탭                        */
/* ═══════════════════════════════════════ */
function RecommendTab() {
  const [grade, setGrade] = useState("");
  const [desiredMajor, setDesiredMajor] = useState("");
  const [careerGoal, setCareerGoal] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { messages, isLoading, append } = useChat({ api: "/api/books" });
  const lastAssistant = messages.filter((m) => m.role === "assistant").pop();

  async function handleSubmit() {
    setSubmitted(true);
    await append({
      role: "user",
      content: `학년: ${grade}\n희망 학과: ${desiredMajor || "미정"}\n희망 진로: ${careerGoal || "미정"}`,
    });
  }

  return (
    <AnimatePresence mode="wait">
      {!submitted ? (
        <motion.div
          key="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-4"
        >
          <GlassCard hover={false}>
            <label className="text-sm font-medium mb-2 block">학년</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-foreground focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">학년을 선택하세요</option>
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </GlassCard>
          <GlassCard hover={false}>
            <label className="text-sm font-medium mb-2 block">
              희망 학과 / 대학 (선택)
            </label>
            <input
              type="text"
              value={desiredMajor}
              onChange={(e) => setDesiredMajor(e.target.value)}
              placeholder="예: 컴퓨터공학, 의학, 경영학..."
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary transition-colors"
            />
          </GlassCard>
          <GlassCard hover={false}>
            <label className="text-sm font-medium mb-2 block">
              희망 진로 / 직업 (선택)
            </label>
            <input
              type="text"
              value={careerGoal}
              onChange={(e) => setCareerGoal(e.target.value)}
              placeholder="예: 소프트웨어 엔지니어, 의사, 교사..."
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary transition-colors"
            />
          </GlassCard>
          <div className="flex justify-center pt-4">
            <button
              onClick={handleSubmit}
              disabled={!grade}
              className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all hover:scale-105 disabled:opacity-50"
            >
              도서 추천 받기
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="result"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {isLoading && !lastAssistant && (
            <GlassCard hover={false}>
              <div className="flex items-center gap-3">
                <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
                <span className="text-muted">맞춤 도서를 선별하고 있습니다...</span>
              </div>
            </GlassCard>
          )}
          {lastAssistant && (
            <GlassCard hover={false}>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {lastAssistant.content}
              </div>
            </GlassCard>
          )}
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setSubmitted(false)}
              className="px-6 py-2 rounded-lg glass text-sm hover:bg-card-hover transition-colors"
            >
              다시 추천 받기
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════ */
/*  독서 기록 탭                            */
/* ═══════════════════════════════════════ */
function ReadingLogTab() {
  const [logs, setLogs] = useState<ReadingLogEntry[]>([]);
  const [showForm, setShowForm] = useState(false);

  // AI 요약
  const {
    messages: summaryMessages,
    isLoading: summaryLoading,
    append: appendSummary,
  } = useChat({ api: "/api/books/summary" });
  const summaryResult = summaryMessages
    .filter((m) => m.role === "assistant")
    .pop();

  useEffect(() => {
    setLogs(getReadingLogs());
  }, []);

  const handleSave = (entry: Omit<ReadingLogEntry, "id" | "createdAt">) => {
    addReadingLog(entry);
    setLogs(getReadingLogs());
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    deleteReadingLog(id);
    setLogs(getReadingLogs());
  };

  const handleSummary = () => {
    if (logs.length === 0) return;
    appendSummary({
      role: "user",
      content: logsToText(logs),
    });
  };

  return (
    <div className="space-y-6">
      {/* 상단 액션 */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowForm(true)}
          className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all text-sm"
        >
          + 독서 기록 추가
        </button>
        {logs.length >= 2 && (
          <button
            onClick={handleSummary}
            disabled={summaryLoading}
            className="px-5 py-2.5 rounded-xl glass hover:bg-card-hover font-medium transition-all text-sm"
          >
            {summaryLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                분석 중...
              </span>
            ) : (
              "🤖 AI 독서 기록 요약"
            )}
          </button>
        )}
        <span className="ml-auto text-sm text-muted self-center">
          총 {logs.length}권 기록
        </span>
      </div>

      {/* 기록 작성 폼 */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <ReadingLogForm
              onSave={handleSave}
              onCancel={() => setShowForm(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI 요약 결과 */}
      {summaryResult && (
        <GlassCard hover={false} className="border-primary/20">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <span>🤖</span> AI 독서 기록 분석
          </h3>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted">
            {summaryResult.content}
          </div>
        </GlassCard>
      )}

      {/* 기록 목록 */}
      {logs.length === 0 ? (
        <GlassCard hover={false}>
          <div className="text-center py-8">
            <p className="text-3xl mb-3">📖</p>
            <p className="text-muted text-sm">아직 독서 기록이 없습니다.</p>
            <p className="text-muted/50 text-xs mt-1">
              위 버튼을 눌러 읽은 책을 검색하고 기록하세요.
            </p>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {logs.map((log, i) => (
            <LogEntryCard
              key={log.id}
              log={log}
              index={i}
              onDelete={() => handleDelete(log.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** 독서 기록 작성 폼 — 인라인 도서 검색 포함 */
function ReadingLogForm({
  onSave,
  onCancel,
}: {
  onSave: (entry: Omit<ReadingLogEntry, "id" | "createdAt">) => void;
  onCancel: () => void;
}) {
  const today = new Date().toISOString().split("T")[0];
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [publisher, setPublisher] = useState("");
  const [year, setYear] = useState("");
  const [isbn, setIsbn] = useState("");
  const [reflection, setReflection] = useState("");
  const [rating, setRating] = useState(4);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  // 인라인 도서 검색
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NLBook[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // 검색 입력 시 debounce 자동 검색
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (value.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    searchTimerRef.current = setTimeout(() => doSearch(value.trim()), 500);
  };

  const doSearch = async (kwd: string) => {
    setSearching(true);
    try {
      const params = new URLSearchParams({ kwd, pageNum: "1", pageSize: "8" });
      const res = await fetch(`/api/books/search?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSearchResults(data.books || []);
      setShowResults(true);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const selectBook = (book: NLBook) => {
    setTitle(book.title);
    setAuthor(book.author);
    setPublisher(book.publisher);
    setYear(book.year);
    setIsbn(book.isbn);
    setSearchQuery("");
    setShowResults(false);
    setSearchResults([]);
  };

  // 바깥 클릭 시 검색 결과 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !reflection.trim()) return;
    onSave({
      bookTitle: title.trim(),
      bookAuthor: author.trim(),
      bookPublisher: publisher.trim(),
      bookYear: year.trim(),
      bookIsbn: isbn.trim(),
      reflection: reflection.trim(),
      rating,
      startDate,
      endDate,
    });
  };

  return (
    <GlassCard hover={false} className="border-emerald-500/20">
      <h3 className="font-semibold mb-4">독서 기록 작성</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 도서 검색 */}
        <div className="relative" ref={resultsRef}>
          <label className="text-xs text-muted mb-1 block">
            도서 검색 (제목 또는 저자)
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
              placeholder="읽은 책의 제목이나 저자를 입력하세요..."
              className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors pr-10"
            />
            {searching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full" />
              </div>
            )}
          </div>

          {/* 검색 결과 드롭다운 */}
          <AnimatePresence>
            {showResults && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute z-20 left-0 right-0 mt-1 rounded-xl border border-white/10 bg-[#1a1a2e] shadow-2xl max-h-72 overflow-y-auto"
              >
                {searchResults.map((book, i) => (
                  <button
                    key={`${book.isbn || i}-${i}`}
                    type="button"
                    onClick={() => selectBook(book)}
                    className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0 flex gap-3"
                  >
                    <div className="w-8 h-10 rounded bg-white/5 flex items-center justify-center shrink-0 text-sm">
                      {book.imageUrl ? (
                        <img src={book.imageUrl} alt="" className="w-full h-full object-cover rounded" />
                      ) : (
                        "📕"
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{book.title}</p>
                      <p className="text-xs text-muted truncate">
                        {book.author}{book.publisher && ` · ${book.publisher}`}{book.year && ` · ${book.year}`}
                      </p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {showResults && searchResults.length === 0 && searchQuery.trim().length >= 2 && !searching && (
            <div className="absolute z-20 left-0 right-0 mt-1 rounded-xl border border-white/10 bg-[#1a1a2e] px-4 py-3 text-sm text-muted">
              검색 결과가 없습니다. 아래에 직접 입력하세요.
            </div>
          )}
        </div>

        {/* 도서 정보 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted mb-1 block">
              도서명 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">저자</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">출판사</label>
            <input
              type="text"
              value={publisher}
              onChange={(e) => setPublisher(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">
              출판년도 / ISBN
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="년도"
                className="w-20 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary transition-colors"
              />
              <input
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="ISBN"
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary transition-colors font-mono"
              />
            </div>
          </div>
        </div>

        {/* 독서 기간 + 평점 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-muted mb-1 block">읽기 시작</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">읽기 완료</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">평점</label>
            <div className="flex gap-1 py-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className={`text-xl transition-transform hover:scale-125 ${
                    n <= rating ? "text-amber-400" : "text-white/20"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 감상문 */}
        <div>
          <label className="text-xs text-muted mb-1 block">
            독서 감상문 <span className="text-red-400">*</span>
          </label>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            required
            rows={6}
            placeholder="이 책에서 인상 깊었던 부분, 배운 점, 느낀 점을 자유롭게 작성하세요..."
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary transition-colors resize-none leading-relaxed"
          />
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg glass text-sm hover:bg-card-hover transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={!title.trim() || !reflection.trim()}
            className="px-6 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-medium text-sm transition-colors disabled:opacity-50"
          >
            저장
          </button>
        </div>
      </form>
    </GlassCard>
  );
}

/** 독서 기록 카드 */
function LogEntryCard({
  log,
  index,
  onDelete,
}: {
  log: ReadingLogEntry;
  index: number;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-gradient p-4"
    >
      <div
        className="flex items-start gap-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="text-2xl shrink-0">📕</div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm">{log.bookTitle}</h4>
          <div className="flex flex-wrap gap-x-3 text-xs text-muted mt-0.5">
            {log.bookAuthor && <span>{log.bookAuthor}</span>}
            <span>
              {log.startDate} ~ {log.endDate}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-amber-400">
              {"★".repeat(log.rating)}
              {"☆".repeat(5 - log.rating)}
            </span>
            <span className="text-[10px] text-muted/50">
              {expanded ? "접기 ▲" : "펼치기 ▼"}
            </span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm("이 기록을 삭제하시겠습니까?")) onDelete();
          }}
          className="text-xs text-red-400/50 hover:text-red-400 transition-colors px-2 py-1"
        >
          삭제
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-white/5 text-sm text-muted leading-relaxed whitespace-pre-wrap">
              {log.reflection}
            </div>
            {log.bookIsbn && (
              <p className="text-[10px] text-muted/30 mt-2 font-mono">
                ISBN {log.bookIsbn}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
