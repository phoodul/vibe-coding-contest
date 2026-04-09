"use client";

import { useState, useCallback, useEffect } from "react";
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

type Tab = "recommend" | "search" | "log";

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

interface SearchResult {
  total: number;
  pageNum: number;
  pageSize: number;
  books: NLBook[];
}

export default function BooksPage() {
  const [tab, setTab] = useState<Tab>("recommend");
  // 검색에서 "읽었어요" 클릭 시 기록 탭으로 전환하며 도서 정보 전달
  const [bookToLog, setBookToLog] = useState<NLBook | null>(null);

  const handleReadBook = (book: NLBook) => {
    setBookToLog(book);
    setTab("log");
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 py-12 sm:py-20">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/dashboard"
          className="text-sm text-muted hover:text-foreground transition-colors mb-8 block"
        >
          ← 대시보드
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-2">📚 도서 추천 & 독서 기록</h1>
          <p className="text-muted mb-6">
            AI 맞춤 추천, 국립중앙도서관 검색, 독서 기록을 관리하세요.
          </p>
        </motion.div>

        {/* 탭 */}
        <div className="flex gap-2 mb-8">
          {(
            [
              { key: "recommend", label: "🤖 AI 맞춤 추천" },
              { key: "search", label: "🔍 도서관 검색" },
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
          {tab === "search" && (
            <motion.div
              key="search"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <SearchTab onReadBook={handleReadBook} />
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
              <ReadingLogTab
                initialBook={bookToLog}
                onBookConsumed={() => setBookToLog(null)}
              />
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
/*  국립중앙도서관 검색 탭                   */
/* ═══════════════════════════════════════ */
function SearchTab({ onReadBook }: { onReadBook: (book: NLBook) => void }) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const doSearch = useCallback(
    async (pageNum: number) => {
      if (!query.trim()) return;
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({
          kwd: query.trim(),
          pageNum: String(pageNum),
          pageSize: String(pageSize),
        });
        const res = await fetch(`/api/books/search?${params}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "검색 실패");
        }
        const data: SearchResult = await res.json();
        setResult(data);
        setPage(pageNum);
      } catch (err) {
        setError(err instanceof Error ? err.message : "검색 중 오류 발생");
      } finally {
        setLoading(false);
      }
    },
    [query]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(1);
  };

  const totalPages = result ? Math.ceil(result.total / pageSize) : 0;

  return (
    <div className="space-y-6">
      <GlassCard hover={false}>
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="도서명, 저자, 키워드로 검색..."
            className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary transition-colors"
          />
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all disabled:opacity-50 shrink-0"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                검색 중
              </span>
            ) : (
              "검색"
            )}
          </button>
        </form>
        <p className="text-xs text-muted/50 mt-2">
          국립중앙도서관 소장 자료를 검색합니다
        </p>
      </GlassCard>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">
              총{" "}
              <span className="text-foreground font-semibold">
                {result.total.toLocaleString()}
              </span>
              건
            </p>
            {totalPages > 1 && (
              <p className="text-xs text-muted">
                {page} / {Math.min(totalPages, 100)} 페이지
              </p>
            )}
          </div>

          <div className="space-y-3">
            {result.books.map((book, i) => (
              <BookCard
                key={`${book.isbn || i}-${i}`}
                book={book}
                index={i}
                onRead={() => onReadBook(book)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <button
                onClick={() => doSearch(page - 1)}
                disabled={page <= 1 || loading}
                className="px-4 py-2 rounded-lg glass text-sm hover:bg-card-hover transition-colors disabled:opacity-30"
              >
                ← 이전
              </button>
              <span className="px-4 py-2 text-sm text-muted">
                {page} / {Math.min(totalPages, 100)}
              </span>
              <button
                onClick={() => doSearch(page + 1)}
                disabled={page >= Math.min(totalPages, 100) || loading}
                className="px-4 py-2 rounded-lg glass text-sm hover:bg-card-hover transition-colors disabled:opacity-30"
              >
                다음 →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** 도서 카드 */
function BookCard({
  book,
  index,
  onRead,
}: {
  book: NLBook;
  index: number;
  onRead?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="glass-gradient p-4 flex gap-4 group"
    >
      <div className="w-12 h-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-2xl">
        {book.imageUrl ? (
          <img
            src={book.imageUrl}
            alt={book.title}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          "📕"
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm leading-snug mb-1 group-hover:text-primary transition-colors">
          {book.detailLink ? (
            <a
              href={book.detailLink}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {book.title}
            </a>
          ) : (
            book.title
          )}
        </h3>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted">
          {book.author && <span>{book.author}</span>}
          {book.publisher && (
            <span className="text-muted/60">{book.publisher}</span>
          )}
          {book.year && <span className="text-muted/60">{book.year}</span>}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {book.className && (
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
              {book.className}
            </span>
          )}
          {book.isbn && (
            <span className="px-2 py-0.5 rounded-full bg-white/5 text-muted/50 text-[10px] font-mono">
              ISBN {book.isbn}
            </span>
          )}
          {onRead && (
            <button
              onClick={onRead}
              className="ml-auto px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-medium transition-colors"
            >
              읽었어요 →
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════ */
/*  독서 기록 탭                            */
/* ═══════════════════════════════════════ */
function ReadingLogTab({
  initialBook,
  onBookConsumed,
}: {
  initialBook: NLBook | null;
  onBookConsumed: () => void;
}) {
  const [logs, setLogs] = useState<ReadingLogEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formBook, setFormBook] = useState<NLBook | null>(null);

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

  // 검색에서 "읽었어요"로 넘어온 경우
  useEffect(() => {
    if (initialBook) {
      setFormBook(initialBook);
      setShowForm(true);
      onBookConsumed();
    }
  }, [initialBook, onBookConsumed]);

  const handleSave = (entry: Omit<ReadingLogEntry, "id" | "createdAt">) => {
    addReadingLog(entry);
    setLogs(getReadingLogs());
    setShowForm(false);
    setFormBook(null);
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
          onClick={() => {
            setFormBook(null);
            setShowForm(true);
          }}
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
              book={formBook}
              onSave={handleSave}
              onCancel={() => {
                setShowForm(false);
                setFormBook(null);
              }}
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
              도서관 검색에서 &quot;읽었어요&quot;를 누르거나 직접 추가하세요.
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

/** 독서 기록 작성 폼 */
function ReadingLogForm({
  book,
  onSave,
  onCancel,
}: {
  book: NLBook | null;
  onSave: (entry: Omit<ReadingLogEntry, "id" | "createdAt">) => void;
  onCancel: () => void;
}) {
  const today = new Date().toISOString().split("T")[0];
  const [title, setTitle] = useState(book?.title || "");
  const [author, setAuthor] = useState(book?.author || "");
  const [publisher, setPublisher] = useState(book?.publisher || "");
  const [year, setYear] = useState(book?.year || "");
  const [isbn, setIsbn] = useState(book?.isbn || "");
  const [reflection, setReflection] = useState("");
  const [rating, setRating] = useState(4);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

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
