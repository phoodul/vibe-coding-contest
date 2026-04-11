import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "위기 상담 안내 | EasyEdu AI",
  description: "청소년·학생 위기 지원 종합 안내",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
