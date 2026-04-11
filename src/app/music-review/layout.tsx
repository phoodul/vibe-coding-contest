import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "음악 감상문 코치 | EasyEdu AI",
  description: "음악 용어 활용 감상문 작성 도우미",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
