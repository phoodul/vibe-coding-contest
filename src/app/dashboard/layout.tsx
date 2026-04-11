import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "대시보드 | EasyEdu AI",
  description: "EasyEdu AI 학습 도구 모음",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
