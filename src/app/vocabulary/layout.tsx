import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "영어 단어 학습 | EasyEdu AI",
  description: "18,000 단어 에베레스트 등반 학습",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
