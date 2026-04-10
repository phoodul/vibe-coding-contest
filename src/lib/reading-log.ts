/**
 * 독서 기록 로그 — localStorage 기반 CRUD
 */

export interface ReadingLogEntry {
  id: string;
  // 도서 정보
  bookTitle: string;
  bookAuthor: string;
  bookPublisher: string;
  bookYear: string;
  bookIsbn: string;
  // 독서 기록
  reflection: string; // 독서감상문
  rating: number; // 1~5
  startDate?: string; // YYYY-MM-DD (레거시 호환)
  endDate?: string; // YYYY-MM-DD (레거시 호환)
  createdAt: string; // ISO string
}

const STORAGE_KEY = "eduflow_reading_log";

function getAll(): ReadingLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAll(entries: ReadingLogEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getReadingLogs(): ReadingLogEntry[] {
  return getAll().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function addReadingLog(
  entry: Omit<ReadingLogEntry, "id" | "createdAt">
): ReadingLogEntry {
  const newEntry: ReadingLogEntry = {
    ...entry,
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  const all = getAll();
  all.push(newEntry);
  saveAll(all);
  return newEntry;
}

export function updateReadingLog(
  id: string,
  updates: Partial<Omit<ReadingLogEntry, "id" | "createdAt">>
): ReadingLogEntry | null {
  const all = getAll();
  const idx = all.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...updates };
  saveAll(all);
  return all[idx];
}

export function deleteReadingLog(id: string): boolean {
  const all = getAll();
  const filtered = all.filter((e) => e.id !== id);
  if (filtered.length === all.length) return false;
  saveAll(filtered);
  return true;
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
