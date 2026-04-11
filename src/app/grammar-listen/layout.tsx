import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "영문법 핵심 300문장 | EasyEdu AI",
  description: "3레벨 반복 청취로 영문법 체득",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
