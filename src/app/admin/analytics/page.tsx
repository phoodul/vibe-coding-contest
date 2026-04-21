import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Analytics | Admin" };
export const dynamic = "force-dynamic";

const ADMIN_EMAILS = ["phoodul@gmail.com"];

type SignupRow = {
  email: string | null;
  display_name: string | null;
  role: string | null;
  provider: string | null;
  signup: string;
  last_signin: string | null;
};

type FeatureRow = { feature: string; users: number; events: number };
type DailyRow = { day: string; users: number; events: number };
type EventRow = {
  feature: string;
  event: string;
  path: string | null;
  created_at: string;
  email: string | null;
};

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (!ADMIN_EMAILS.includes(user.email ?? "")) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-white">접근 권한 없음</h1>
        <p className="mt-4 text-white/60">관리자만 볼 수 있는 페이지입니다.</p>
        <Link href="/dashboard" className="mt-6 inline-block text-indigo-400 hover:underline">
          대시보드로 돌아가기
        </Link>
      </main>
    );
  }

  const [summary, signups, byFeature, byDay, recentEvents] = await Promise.all([
    supabase.rpc("admin_usage_summary").then((r) => r.data as SummaryRow | null),
    supabase.rpc("admin_signup_list").then((r) => (r.data as SignupRow[] | null) ?? []),
    supabase.rpc("admin_usage_by_feature").then((r) => (r.data as FeatureRow[] | null) ?? []),
    supabase.rpc("admin_usage_by_day").then((r) => (r.data as DailyRow[] | null) ?? []),
    supabase.rpc("admin_recent_events").then((r) => (r.data as EventRow[] | null) ?? []),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 text-white">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">사용자 분석</h1>
          <p className="text-white/60 mt-1 text-sm">최근 7일 기준</p>
        </div>
        <Link href="/dashboard" className="text-sm text-white/60 hover:text-white">
          ← 대시보드
        </Link>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="총 가입자" value={summary?.total_users ?? 0} />
        <StatCard label="7일 활성 사용자 (DAU 합)" value={summary?.active_users_7d ?? 0} />
        <StatCard label="7일 이벤트" value={summary?.events_7d ?? 0} />
        <StatCard label="튜터 세션 (전체)" value={summary?.tutor_sessions_total ?? 0} />
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold">가입자 명단</h2>
        <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-white/60">
              <tr>
                <Th>이메일</Th>
                <Th>이름</Th>
                <Th>역할</Th>
                <Th>provider</Th>
                <Th>가입</Th>
                <Th>최근 로그인</Th>
              </tr>
            </thead>
            <tbody>
              {signups.map((s, i) => (
                <tr key={i} className="border-t border-white/5">
                  <Td>{s.email ?? "—"}</Td>
                  <Td>{s.display_name ?? "—"}</Td>
                  <Td>{s.role ?? "—"}</Td>
                  <Td>{s.provider ?? "—"}</Td>
                  <Td>{fmtDate(s.signup)}</Td>
                  <Td>{s.last_signin ? fmtDate(s.last_signin) : "미로그인"}</Td>
                </tr>
              ))}
              {signups.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-white/40">
                    데이터 없음
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-xl font-semibold">기능별 사용량 (7일)</h2>
          <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-white/60">
                <tr>
                  <Th>기능</Th>
                  <Th>고유 사용자</Th>
                  <Th>이벤트 수</Th>
                </tr>
              </thead>
              <tbody>
                {byFeature.map((r, i) => (
                  <tr key={i} className="border-t border-white/5">
                    <Td>{r.feature}</Td>
                    <Td>{r.users}</Td>
                    <Td>{r.events}</Td>
                  </tr>
                ))}
                {byFeature.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-white/40">
                      아직 이벤트 없음 — 계측 배포 후 수집됩니다
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold">일자별 추이 (7일)</h2>
          <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-white/60">
                <tr>
                  <Th>날짜</Th>
                  <Th>DAU</Th>
                  <Th>이벤트</Th>
                </tr>
              </thead>
              <tbody>
                {byDay.map((r, i) => (
                  <tr key={i} className="border-t border-white/5">
                    <Td>{r.day}</Td>
                    <Td>{r.users}</Td>
                    <Td>{r.events}</Td>
                  </tr>
                ))}
                {byDay.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-white/40">
                      아직 데이터 없음
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold">최근 이벤트 20건</h2>
        <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-white/60">
              <tr>
                <Th>시각</Th>
                <Th>사용자</Th>
                <Th>기능</Th>
                <Th>이벤트</Th>
                <Th>경로</Th>
              </tr>
            </thead>
            <tbody>
              {recentEvents.map((r, i) => (
                <tr key={i} className="border-t border-white/5">
                  <Td>{fmtDate(r.created_at)}</Td>
                  <Td>{r.email ?? "익명"}</Td>
                  <Td>{r.feature}</Td>
                  <Td>{r.event}</Td>
                  <Td className="max-w-[240px] truncate">{r.path ?? "—"}</Td>
                </tr>
              ))}
              {recentEvents.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-white/40">
                    아직 이벤트 없음
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="mt-12 text-xs text-white/40">
        Vercel Analytics(방문자·Page Views)는{" "}
        <a
          href="https://vercel.com/dashboard"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-white"
        >
          Vercel Dashboard → Analytics 탭
        </a>
        에서 확인하세요.
      </footer>
    </main>
  );
}

type SummaryRow = {
  total_users: number;
  active_users_7d: number;
  events_7d: number;
  tutor_sessions_total: number;
};

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs text-white/50">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-white">
        {value.toLocaleString("ko-KR")}
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-2 text-left font-medium">{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-2 text-white/80 ${className}`}>{children}</td>;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("ko-KR", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
