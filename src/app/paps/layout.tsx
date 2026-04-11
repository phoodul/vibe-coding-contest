import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PAPS AI 코치 | EasyEdu AI",
  description: "체력평가 분석 + 맞춤 운동 프로그램",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
