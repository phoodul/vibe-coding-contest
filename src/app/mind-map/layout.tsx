import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "마인드 맵 | EasyEdu AI",
  description: "교과서 전체 구조를 인터랙티브 마인드 맵으로 탐색",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
