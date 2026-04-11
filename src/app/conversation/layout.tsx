import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI 영어 회화 | EasyEdu AI",
  description: "수준별 AI와 음성 영어 대화 연습",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
