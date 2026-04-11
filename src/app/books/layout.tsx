import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "맞춤 도서 추천 | EasyEdu AI",
  description: "학년·진로 맞춤 도서 큐레이션 + 독서 기록",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
