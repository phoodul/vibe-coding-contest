/**
 * 수능 기출문제 풀이 검색 + Supabase 캐싱
 * 1. DB에서 캐시 조회
 * 2. 없으면 Tavily로 웹 검색
 * 3. 결과를 DB에 저장
 */
import { searchWeb } from "@/lib/search";

interface Solution {
  solution_text: string;
  source_url: string | null;
}

/** Supabase에서 캐시된 풀이 조회 */
async function getCached(problemKey: string): Promise<Solution | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const res = await fetch(
    `${url}/rest/v1/problem_solutions?problem_key=eq.${encodeURIComponent(problemKey)}&select=solution_text,source_url`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" }
  );
  if (!res.ok) return null;
  const rows = await res.json();
  return rows.length > 0 ? rows[0] : null;
}

/** Supabase에 풀이 저장 */
async function saveSolution(
  problemKey: string,
  year: number,
  examType: string,
  number: number,
  correctAnswer: string,
  solutionText: string,
  sourceUrl: string | null
): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  await fetch(`${url}/rest/v1/problem_solutions`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      problem_key: problemKey,
      year,
      exam_type: examType,
      number,
      correct_answer: correctAnswer,
      solution_text: solutionText,
      source_url: sourceUrl,
    }),
  });
}

/** Tavily로 풀이 검색 */
async function searchSolution(
  year: number,
  examType: string,
  number: number
): Promise<{ text: string; url: string | null } | null> {
  // 다양한 검색 쿼리로 시도
  const queries = [
    `${year}학년도 수능 수학 ${examType} ${number}번 풀이 해설`,
    `${year}학년도 대학수학능력시험 수학 ${number}번 풀이`,
  ];

  for (const query of queries) {
    const result = await searchWeb(query);
    if (result.results.length > 0) {
      // 가장 관련성 높은 결과의 content를 풀이로 사용
      const best = result.results[0];
      const combined = result.results
        .slice(0, 3)
        .map((r) => r.content)
        .join("\n\n");

      if (combined.length > 100) {
        return { text: combined.slice(0, 10000), url: best.url };
      }
    }
  }
  return null;
}

/**
 * 문제 풀이를 가져옴 (캐시 우선 → 웹 검색 → 저장)
 */
export async function getSolution(
  year: number,
  examType: string,
  number: number,
  correctAnswer: string
): Promise<string | null> {
  const problemKey = `${year}_${examType}_${number}`;

  // 1. 캐시 조회
  const cached = await getCached(problemKey);
  if (cached) return cached.solution_text;

  // 2. 웹 검색
  const searched = await searchSolution(year, examType, number);
  if (!searched) return null;

  // 3. 캐시 저장
  await saveSolution(
    problemKey,
    year,
    examType,
    number,
    correctAnswer,
    searched.text,
    searched.url
  );

  return searched.text;
}
