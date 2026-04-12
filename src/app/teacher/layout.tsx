import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "교사 도구 | EasyEdu AI",
  description: "공문서 포맷터, 초안 작성기, 학생부 기재 도우미",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
