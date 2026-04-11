import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "내 길 내비 | EasyEdu AI",
  description: "AI가 안내하는 꿈을 향한 진로 로드맵",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
