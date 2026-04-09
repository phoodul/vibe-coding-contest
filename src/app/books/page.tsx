"use client";

import { useState, useCallback } from "react";
import { useChat } from "ai/react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/shared/glass-card";
import Link from "next/link";

const GRADES = [
  "중학교 1학년",
  "중학교 2학년",
  "중학교 3학년",
  "고등학교 1학년",
  "고등학교 2학년",
  "고등학교 3학년",
  "대학생/재수생",
];

type Tab = "recommend" | "search";

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

  return (
    <div className="min-h-screen px-4 sm:px-6 py-12 sm:py-20">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/dashboard"
          className="text-sm text-muted hover:text-foreground transition-colors mb-8 block"
        >
          ← 대시보드
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">📚 도서 추천 & 검색</h1>
          <p className="text-muted mb-6">
            AI 맞춤 추천 또는 국립중앙도서관 검색으로 도서를 찾아보세요.
          </p>
        </motion.div>

        {/* 탭 */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setTab("recommend")}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === "recommend"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "glass hover:bg-card-hover"
            }`}
          >
            🤖 AI 맞춤 추천
          </button>
          <button
            onClick={() => setTab("search")}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === "search"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "glass hover:bg-card-hover"
            }`}
          >
            🔍 국립중앙도서관 검색
          </button>
        </div>

        <AnimatePresence mode="wait">
          {tab === "recommend" ? (
            <motion.div
              key="recommend"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <RecommendTab />
            </motion.div>
          ) : (
            <motion.div
              key="search"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <SearchTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** AI 맞춤 추천 탭 (기존 기능) */
function RecommendTab() {
  const [grade, setGrade] = useState("");
  const [desiredMajor, setDesiredMajor] = useState("");
  const [careerGoal, setCareerGoal] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { messages, isLoading, append } = useChat({
    api: "/api/books",
  });

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
                <span className="text-muted">
                  맞춤 도서를 선별하고 있습니다...
                </span>
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

/** 국립중앙도서관 검색 탭 */
function SearchTab() {
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
      {/* 검색 폼 */}
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

      {/* 에러 */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* 검색 결과 */}
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

          {/* 도서 카드 */}
          <div className="space-y-3">
            {result.books.map((book, i) => (
              <BookCard key={`${book.isbn || i}-${i}`} book={book} index={i} />
            ))}
          </div>

          {/* 페이지네이션 */}
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

/** 도서 카드 컴포넌트 */
function BookCard({ book, index }: { book: NLBook; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="glass-gradient p-4 flex gap-4 group"
    >
      {/* 책 아이콘 */}
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

      {/* 도서 정보 */}
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

        <div className="flex flex-wrap gap-1.5 mt-2">
          {book.className && (
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
              {book.className}
            </span>
          )}
          {book.type && (
            <span className="px-2 py-0.5 rounded-full bg-white/5 text-muted text-[10px]">
              {book.type}
            </span>
          )}
          {book.isbn && (
            <span className="px-2 py-0.5 rounded-full bg-white/5 text-muted/50 text-[10px] font-mono">
              ISBN {book.isbn}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
