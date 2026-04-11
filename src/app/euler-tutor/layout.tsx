import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "오일러 튜터 | EasyEdu AI",
  description: "계산은 AI가, 사고는 학생이. 수학 문제 풀이의 논리적 사고과정을 코칭하는 AI 멘토.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
