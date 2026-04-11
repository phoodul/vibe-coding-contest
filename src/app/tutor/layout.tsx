import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "소크라테스 AI 튜터 | EasyEdu AI",
  description: "AI가 질문으로 이끄는 소크라테스식 Guided Learning",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
