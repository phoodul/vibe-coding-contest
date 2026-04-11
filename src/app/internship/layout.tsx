import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "현장실습 일지 | EasyEdu AI",
  description: "메모를 제출용 실습 일지로 자동 정리",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
