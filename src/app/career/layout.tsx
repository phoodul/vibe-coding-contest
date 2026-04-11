import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "진로 시뮬레이터 | EasyEdu AI",
  description: "MBTI·적성·관심사 기반 5,000+ 직업 맞춤 추천",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
