/**
 * 독서 기록 로그 — Supabase 기반 CRUD (비로그인 시 localStorage fallback)
 */

import { createClient } from "@/lib/supabase/client";

export interface ReadingLogEntry {
  id: string;
  bookTitle: string;
  bookAuthor: string;
  bookPublisher: string;
  bookYear: string;
  bookIsbn: string;
  reflection: string;
  rating: number;
  readDate?: string;      // YYYY-MM-DD
  startDate?: string;     // 레거시 호환
  endDate?: string;       // 레거시 호환
  createdAt: string;
}

// ── Supabase helpers ──

function supabase() {
  return createClient();
}

async function getUser() {
  const { data } = await supabase().auth.getUser();
  return data.user;
}

// DB row → app shape
function rowToEntry(r: Record<string, unknown>): ReadingLogEntry {
  return {
    id: r.id as string,
    bookTitle: r.book_title as string,
    bookAuthor: r.book_author as string,
    bookPublisher: r.book_publisher as string,
    bookYear: r.book_year as string,
    bookIsbn: r.book_isbn as string,
    reflection: r.reflection as string,
    rating: r.rating as number,
    readDate: (r.read_date as string) ?? undefined,
    startDate: (r.read_date as string) ?? undefined,
    createdAt: r.created_at as string,
  };
}

// ── Public API ──

export async function getReadingLogs(): Promise<ReadingLogEntry[]> {
  const user = await getUser();
  if (!user) return getLocalLogs();

  const { data, error } = await supabase()
    .from("reading_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data) return getLocalLogs();
  return data.map(rowToEntry);
}

export async function addReadingLog(
  entry: Omit<ReadingLogEntry, "id" | "createdAt">
): Promise<ReadingLogEntry> {
  const user = await getUser();
  if (!user) return addLocalLog(entry);

  const { data, error } = await supabase()
    .from("reading_logs")
    .insert({
      user_id: user.id,
      book_title: entry.bookTitle,
      book_author: entry.bookAuthor,
      book_publisher: entry.bookPublisher,
      book_year: entry.bookYear,
      book_isbn: entry.bookIsbn,
      reflection: entry.reflection,
      rating: entry.rating,
      read_date: entry.readDate || entry.startDate || null,
    })
    .select()
    .single();

  if (error || !data) return addLocalLog(entry);
  return rowToEntry(data);
}

export async function updateReadingLog(
  id: string,
  updates: Partial<Omit<ReadingLogEntry, "id" | "createdAt">>
): Promise<ReadingLogEntry | null> {
  const user = await getUser();
  if (!user) return updateLocalLog(id, updates);

  const patch: Record<string, unknown> = {};
  if (updates.bookTitle !== undefined) patch.book_title = updates.bookTitle;
  if (updates.bookAuthor !== undefined) patch.book_author = updates.bookAuthor;
  if (updates.bookPublisher !== undefined) patch.book_publisher = updates.bookPublisher;
  if (updates.bookYear !== undefined) patch.book_year = updates.bookYear;
  if (updates.bookIsbn !== undefined) patch.book_isbn = updates.bookIsbn;
  if (updates.reflection !== undefined) patch.reflection = updates.reflection;
  if (updates.rating !== undefined) patch.rating = updates.rating;
  if (updates.readDate !== undefined) patch.read_date = updates.readDate;

  const { data, error } = await supabase()
    .from("reading_logs")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) return null;
  return rowToEntry(data);
}

export async function deleteReadingLog(id: string): Promise<boolean> {
  const user = await getUser();
  if (!user) return deleteLocalLog(id);

  const { error } = await supabase()
    .from("reading_logs")
    .delete()
    .eq("id", id);

  return !error;
}

/** AI 요약용: 전체 독서 기록을 텍스트로 변환 */
export function logsToText(logs: ReadingLogEntry[]): string {
  return logs
    .map(
      (log, i) =>
        `[${i + 1}] 「${log.bookTitle}」 (${log.bookAuthor}, ${log.bookYear})\n` +
        `   평점: ${"★".repeat(log.rating)}${"☆".repeat(5 - log.rating)}\n` +
        `   감상: ${log.reflection}`
    )
    .join("\n\n");
}

// ── localStorage fallback (비로그인) ──

const STORAGE_KEY = "eduflow_reading_log";

function getLocalAll(): ReadingLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalAll(entries: ReadingLogEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function getLocalLogs(): ReadingLogEntry[] {
  return getLocalAll().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function addLocalLog(
  entry: Omit<ReadingLogEntry, "id" | "createdAt">
): ReadingLogEntry {
  const newEntry: ReadingLogEntry = {
    ...entry,
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  const all = getLocalAll();
  all.push(newEntry);
  saveLocalAll(all);
  return newEntry;
}

function updateLocalLog(
  id: string,
  updates: Partial<Omit<ReadingLogEntry, "id" | "createdAt">>
): ReadingLogEntry | null {
  const all = getLocalAll();
  const idx = all.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...updates };
  saveLocalAll(all);
  return all[idx];
}

function deleteLocalLog(id: string): boolean {
  const all = getLocalAll();
  const filtered = all.filter((e) => e.id !== id);
  if (filtered.length === all.length) return false;
  saveLocalAll(filtered);
  return true;
}
